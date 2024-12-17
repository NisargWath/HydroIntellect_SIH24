from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
from langchain.prompts import PromptTemplate
from langchain.chains.question_answering import load_qa_chain
from langchain_community.document_loaders import PyPDFLoader
from langchain_google_genai import ChatGoogleGenerativeAI
import os
import warnings
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import markdown
import logging


# Import your WaterUsagePredictor class
from model import WaterUsagePredictor


predictor = WaterUsagePredictor()

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

app = Flask(__name__)
GOOGLE_API_KEY = "AIzaSyC9yvPJyNdoZhfQZaaChiY7iX7BJ9UEB8w"
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel(model_name="gemini-pro")
def to_markdown(text):
    # Convert plain text to Markdown format
    md = markdown.markdown(text)
    return md
# Suppress warnings
warnings.filterwarnings("ignore")

# Initialize Flask application
app = Flask(__name__)

# Hardcoded PDF file path
# PDF_FILE_PATH = "10 Ways To Prevent Water Scarcity-combined.pdf"  # Replace with the path to your PDF file

# Utility function to process the PDF and retrieve an answer
def get_pdf_answer(pdf_file, question, num_pages=30):
    """
    Process the PDF file, extract context, and get the answer to the question.

    Args:
        pdf_file (str): Path to the PDF file.
        question (str): Question to ask about the PDF content.
        num_pages (int): Number of pages to consider for context (default is 30).

    Returns:
        str: Answer to the question based on the PDF context.
    """
    try:
        pdf_loader = PyPDFLoader(pdf_file)
        pages = pdf_loader.load_and_split()
        context = "\n".join(str(p.page_content) for p in pages[:num_pages])

        # Debugging: Print extracted context
        print("Extracted Context:")
        print(context[:800])  # Print first 500 characters of context

        prompt_template = """Answer the question as precisely as possible using the provided context. If the answer is
                            not contained in the context, say try to answer for making a descion related water storage risk and how we can mitigate the risk and tell short term and long term plans "\n\n
                            Context: \n {context}\n
                            Question: \n {question}\
                            
                            Answer:
                          """

        prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
        stuff_chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
        stuff_answer = stuff_chain({"input_documents": pages[:num_pages], "question": question}, return_only_outputs=True)

        return stuff_answer["output_text"]
    except Exception as e:
        print(f"Error in get_pdf_answer: {str(e)}")
        raise e

@app.route('/')
def index():
    return render_template('index.html')
@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')
@app.route('/forecast')
def forecast():
    return render_template('forecast.html')
@app.route('/waterQ')
def waterQ():
    return render_template('waterQ.html')
@app.route('/waterD')
def waterD():
    return render_template('waterD.html')
@app.route('/accessing')
def accessing():
    return render_template('accessing.html')






@app.route('/send_message', methods=['POST'])
def send_message():
    msg = request.form['message'] + " in 100-400 give me answer in such way that it is giving plan and how we can mitigating the risk related to water resevre , dam , ground water "
    print(msg)
    response = model.generate_content(msg)
    print(response);
    return jsonify({"message": to_markdown(response.text)})


# simple 




def predict_water_usage(date, state, district):
    # Load the datasets

    population_df = pd.read_csv('future water demand/Population_Trend_2018_2023.csv')
    climate_df = pd.read_csv('future water demand/climate_data_1.csv')
    water_usage_df = pd.read_csv('future water demand/Water_Usage_1_2018_2023.csv')
    hydrology_df = pd.read_csv('future water demand/hydological_data_1 (1).csv')
    disaster_df = pd.read_csv('future water demand/natural_disaster1.csv')
    demographic_df = pd.read_csv('future water demand/demographic_shifts.csv')
    land_use_df = pd.read_csv('future water demand/Land_Use_1.csv')

    # Helper function to clean date columns
    def clean_date_column(df, column_name):
        df[column_name] = pd.to_datetime(df[column_name], format='%d-%m-%Y', errors='coerce')
        df.dropna(subset=[column_name], inplace=True)
        return df

    # Clean and standardize datasets
    population_df.rename(columns={'Date(DD/MM/YYYY)': 'Date'}, inplace=True)
    population_df = clean_date_column(population_df, 'Date')
    climate_df = clean_date_column(climate_df, 'Date')
    water_usage_df = clean_date_column(water_usage_df, 'Date')
    hydrology_df = clean_date_column(hydrology_df, 'Date')
    disaster_df = clean_date_column(disaster_df, 'Date')
    demographic_df = clean_date_column(demographic_df, 'Date')
    land_use_df = clean_date_column(land_use_df, 'Date')

    hydrology_rows = hydrology_df[['State', 'District', 'Date']]

    # Filter rows to match hydrology dataset
    population_df = population_df[population_df[['State', 'District', 'Date']].isin(hydrology_rows).all(axis=1)]
    climate_df = climate_df[climate_df[['State', 'District', 'Date']].isin(hydrology_rows).all(axis=1)]
    water_usage_df = water_usage_df[water_usage_df[['State', 'District', 'Date']].isin(hydrology_rows).all(axis=1)]
    disaster_df = disaster_df[disaster_df[['State', 'District', 'Date']].isin(hydrology_rows).all(axis=1)]
    demographic_df = demographic_df[demographic_df[['State', 'District', 'Date']].isin(hydrology_rows).all(axis=1)]
    land_use_df = land_use_df[land_use_df[['State', 'District', 'Date']].isin(hydrology_rows).all(axis=1)]

    # Merge datasets
    merged_df = population_df.merge(climate_df, on=['State', 'District', 'Date'], how='left')
    merged_df = merged_df.merge(water_usage_df, on=['State', 'District', 'Date'], how='left')
    merged_df = merged_df.merge(hydrology_df, on=['State', 'District', 'Date'], how='left')
    merged_df = merged_df.merge(disaster_df, on=['State', 'District', 'Date'], how='left')
    merged_df = merged_df.merge(demographic_df, on=['State', 'District', 'Date'], how='left')
    merged_df = merged_df.merge(land_use_df, on=['State', 'District', 'Date'], how='left')

    # Train-test split
    train_data = merged_df[(merged_df['Date'] >= '2018-01-01') & (merged_df['Date'] <= '2022-12-31')]
    test_data = merged_df[merged_df['Date'].dt.year == 2023]

    # Define features and target variables
    features = [
        'Total Population', 'Population Density (%)', 'Urban Population (%)', 'Rural Population (%)',
        'Average Temperature (°C)', 'Max Temperature (°C)', 'Min Temperature (°C)', 'Rainfall (mm)', 'Humidity (%)',
        'Surface Water (m³)', 'Groundwater Level (m)', 'River Flow (m³/s)', 'Reservoir Storage (m³)',
        'Flood Occurrence (1/0)', 'Drought Occurrence (1/0)', 'Impact on Water Supply (m³)', 'Migration Rate (%)',
        'Birth Rate (%)', 'Death Rate (%)', 'Land Use Change (%)', 'Urban Area (%)', 'Agricultural Land (%)'
    ]
    target = ['Agricultural usage (m³)', 'Industrial usage (m³)', 'Domestic usage (m³)', 'Ecological usage (m³)']

    # Handle missing features
    missing_features = [col for col in features if col not in merged_df.columns]
    if missing_features:
        print(f"Missing features: {missing_features}")
        features = [col for col in features if col in merged_df.columns]

    X_train = train_data[features].fillna(0)
    y_train = train_data[target].fillna(0)
    X_test = test_data[features].fillna(0)
    y_test = test_data[target].fillna(0)

    # Train the models
    models = {}
    for sector in target:
        model = LinearRegression()
        model.fit(X_train, y_train[sector])
        models[sector] = model

    # Prediction and evaluation
    merged_df['State'] = merged_df['State'].str.strip().str.lower()
    merged_df['District'] = merged_df['District'].str.strip().str.lower()
    merged_df['Date'] = pd.to_datetime(merged_df['Date'], errors='coerce')

    # Filter input data for prediction
    input_data = merged_df[
        (merged_df['Date'].dt.date == pd.to_datetime(date).date()) &
        (merged_df['State'] == state.strip().lower()) &
        (merged_df['District'] == district.strip().lower())
    ]

    if input_data.empty:
        print("No data available for the specified date, state, and district.")
        return None

    input_data = input_data[features].fillna(0)

    # Predict sectoral water usage
    sector_predictions = {}
    overall_demand = 0

    for sector in target:
        prediction = models[sector].predict(input_data)
        sector_predictions[sector] = prediction[0]
        overall_demand += prediction[0]

    print(f"Predictions for {district.title()}, {state.title()} on {date}:")
    for sector, value in sector_predictions.items():
        print(f"  {sector}: {value:.2f} m³")
    print(f"  Overall Water Demand: {overall_demand:.2f} m³")

    return sector_predictions, overall_demand
@app.route('/predict_water_usage', methods=['POST'])
def predict_water_usage_route():
    data = request.get_json()
    date = data['date']
    state = data['state']
    district = data['district']
    
    # Call your function with the passed parameters
    predictions, overall_demand = predict_water_usage(date, state, district)
    print(predictions)
    return jsonify({
        'predictions': predictions,
        'overall_demand': overall_demand
    })





if __name__ == '__main__':
    app.run(debug=True, port=5000)