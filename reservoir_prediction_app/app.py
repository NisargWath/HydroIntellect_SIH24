from flask import Flask, request, jsonify, render_template
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.multioutput import MultiOutputRegressor

# Initialize the Flask app
app = Flask(__name__)

# Function to train the model directly within the Flask app
def train_model():
    # Load data
    reservoir_data = pd.read_csv('Daily Reservoir Level & Storage.csv')

    # Convert 'Date' column to datetime format
    reservoir_data['Date'] = pd.to_datetime(reservoir_data['Date'], errors='coerce')

    # Drop rows with missing or invalid dates
    reservoir_data = reservoir_data.dropna(subset=['Date'])

    # Add 'Year' and 'DayOfYear' as features
    reservoir_data['Year'] = reservoir_data['Date'].dt.year
    reservoir_data['DayOfYear'] = reservoir_data['Date'].dt.dayofyear

    # Drop rows with missing target values ('Level' and 'Current Live Storage')
    reservoir_data = reservoir_data.dropna(subset=['Level', 'Current Live Storage'])

    # Select features for the model
    categorical_features = ['State', 'District', 'Reservoir Name']
    numeric_features = ['Year', 'DayOfYear']

    # Preprocessing pipeline
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])

    numeric_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ]
    )

    # Combine preprocessor and model into a pipeline
    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', MultiOutputRegressor(RandomForestRegressor(n_estimators=100, random_state=42)))
    ])

    # Prepare training and testing datasets
    train_data_reservoir = reservoir_data[reservoir_data['Year'] < 2023]
    test_data_reservoir = reservoir_data[reservoir_data['Year'] == 2023]

    X_train_reservoir = train_data_reservoir[['State', 'District', 'Reservoir Name', 'Year', 'DayOfYear']]
    y_train_reservoir = train_data_reservoir[['Level', 'Current Live Storage']]

    # Train the model
    model_pipeline.fit(X_train_reservoir, y_train_reservoir)

    return model_pipeline

# Train the model when the app starts
model_pipeline = train_model()

# Function to predict water level and capacity
def predict_water(date, state, district, reservoir_name):
    date = pd.to_datetime(date, errors='coerce')
    if date is None:
        raise ValueError("Invalid date format.")
    
    year = date.year
    day_of_year = date.timetuple().tm_yday
    prediction_data = pd.DataFrame({
        'State': [state],
        'District': [district],
        'Reservoir Name': [reservoir_name],
        'Year': [year],
        'DayOfYear': [day_of_year]
    })
    
    # Predict the values
    prediction = model_pipeline.predict(prediction_data)
    return {
        'Predicted Level': prediction[0, 0],  # First value is the predicted level
        'Predicted Capacity': prediction[0, 1]  # Second value is the predicted capacity
    }

# Home route to render the input form
@app.route('/')
def home():
    return render_template('index.html')

# API endpoint for prediction
@app.route('/predict', methods=['POST'])
def predict():
    try:
        date = request.form['date']
        state = request.form['state']
        district = request.form['district']
        reservoir_name = request.form['reservoir_name']
        
        # Get the prediction
        result = predict_water(date, state, district, reservoir_name)
        
        return render_template('index.html', result=result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=8000)
