

# **HydroIntellect: Smart Forecasting and Capacity Modelling for Future Water Resource Management**  
**SIH24 Project**

This project, developed as part of the **Smart India Hackathon 2024**, aims to forecast future water demand and assess reservoir storage capacities using machine learning. It leverages time-series data to make predictions for water resource management.

---

## **Project Overview**  
HydroIntellect uses machine learning models to predict future water demand and evaluate the capacity of reservoirs under different scenarios. The model is based on **LSTM (Long Short-Term Memory)** networks and applies advanced hydrological models for accurate water resource forecasting.

---

## **Technology Stack**  
- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: Flask (app.py)  
- **Machine Learning**: scikit-learn (Linear Regression), Pandas
- **Data Handling**: Pandas, NumPy  
- **Deployment:**:  Flask Development Server (Localhost)
- **Version Control**: GitHub

---

## **How to Download and Access the Dataset**  

The primary dataset for this project is stored on **HuggingFace**. You can access it by following these steps:

1. **Go to the Dataset**  
   Visit the dataset page on HuggingFace:  
   [Future Water Demand Dataset](https://huggingface.co/datasets/nisarg/Future_Water_Demand/tree/main)

2. **Download the Dataset**  
   You can either:
   - Manually download the dataset files from HuggingFace by clicking on the **Download** button.
   - Use the **HuggingFace `datasets` library** to download the dataset directly into your project using Python:
     ```python
     from datasets import load_dataset
     dataset = load_dataset("nisarg/Future_Water_Demand")
     ```

3. **Place the Dataset in Your Project**  
   After downloading, place the dataset files in the appropriate directory inside your project, typically in the `data/` or `datasets/` folder. Ensure the structure aligns with what is expected by the `app.py` script.

---

## **Setup and Installation**  

To set up and run the project locally, follow these steps:

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/NisargWath/HydroIntellect.git
   cd HydroIntellect
   ```

2. **Install Dependencies**  
   Ensure you have Python 3.8+ installed. Install the required Python packages:  
   ```bash
   pip install -r requirements.txt
   ```

3. **Download the Dataset**  
   Follow the steps above to download the dataset from HuggingFace.

4. **Run the Flask App**  
   To start the application, run:
   ```bash
   python app.py
   ```

   This will start the Flask server locally.

---

## **Repository Files Structure**

Here’s a quick overview of the files in the repository:

- **`app.py`**: The main entry point of the Flask application, which handles the backend logic and routing.
- **`model.py`**: Contains the machine learning models, including the LSTM model for forecasting water demand.
- **`static/`**: Stores static files like images, CSS, and JavaScript.
- **`templates/`**: Contains the HTML templates for rendering the frontend.
- **`History/`**: Stores historical data used for training the model.
- **`README.md`**: The file you are currently reading, explaining how to use and set up the project.

---

## **How the Dataset Works with `app.py`**

1. **Dataset Access**  
   The dataset is used in **`app.py`** for training and making predictions with the machine learning model. Once the dataset is downloaded, the script loads the data for preprocessing.

2. **Model Training**  
   The data is passed through **`model.py`** where an LSTM model is trained to forecast future water demand.

3. **User Interaction**  
   The Flask app in **`app.py`** provides an interface for users to interact with the model, enter data, and view predictions.

---

## **License**  
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

For more information, you can contact the project maintainer at:  
- **GitHub**: [https://github.com/NisargWath](https://github.com/NisargWath)

---
