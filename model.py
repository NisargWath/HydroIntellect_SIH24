import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.impute import SimpleImputer
import os
import logging

class WaterUsagePredictor:
    def __init__(self, data_directory='future water demand'):
        """
        Initialize the Water Usage Predictor with dataset paths
        
        :param data_directory: Directory containing the CSV files
        """
        self.logger = logging.getLogger(__name__)
        logging.basicConfig(level=logging.INFO)
        
        self.data_directory = data_directory
        self.data_files = {
            'population': os.path.join(data_directory, 'Population_Trend_2018_2023.csv'),
            'climate': os.path.join(data_directory, 'climate_data_1.csv'),
            'water_usage': os.path.join(data_directory, 'Water_Usage_1_2018_2023.csv'),
            'hydrology': os.path.join(data_directory, 'hydological_data_1 (1).csv'),
            'disaster': os.path.join(data_directory, 'natural_disaster1.csv'),
            'demographic': os.path.join(data_directory, 'demographic_shifts.csv'),
            'land_use': os.path.join(data_directory, 'Land_Use_1.csv')
        }
        
        # Possible date column names
        self.date_column_names = [
            'Date', 'Date(DD/MM/YYYY)', 'date', 'datetime', 'Datetime'
        ]
        
        # Predefined features with fallback options
        self.feature_sets = [
            [
                'Total Population', 'Population Density (%)', 'Urban Population (%)', 
                'Average Temperature (°C)', 'Rainfall (mm)', 'Humidity (%)'
            ],
            [
                'Total Population', 'Urban Population (%)', 
                'Average Temperature (°C)', 'Rainfall (mm)'
            ],
            [
                'Total Population', 'Urban Population (%)'
            ]
        ]
        
        self.target = [
            'Agricultural usage (m³)', 'Industrial usage (m³)', 
            'Domestic usage (m³)', 'Ecological usage (m³)'
        ]
        
        # Models will be stored here
        self.models = {}
        
        # Preprocessed and merged dataframe
        self.merged_df = None
    
    def _find_date_column(self, df):
        """
        Find the correct date column in the dataframe
        
        :param df: Input dataframe
        :return: Name of the date column or None
        """
        for col_name in self.date_column_names:
            if col_name in df.columns:
                return col_name
        return None
    
    def _clean_and_validate_data(self, df):
        """
        Clean and validate dataframe
        
        :param df: Input dataframe
        :return: Cleaned dataframe
        """
        # Remove leading/trailing whitespaces from column names
        df.columns = df.columns.str.strip()
        
        # Normalize string columns
        for col in ['State', 'District']:
            if col in df.columns:
                df[col] = df[col].str.strip().str.lower()
        
        # Find and convert date column
        date_col = self._find_date_column(df)
        if date_col:
            try:
                df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
                df.dropna(subset=[date_col], inplace=True)
                
                # Rename to standard 'Date' column
                df.rename(columns={date_col: 'Date'}, inplace=True)
            except Exception as e:
                self.logger.error(f"Error converting date column: {e}")
                # Remove date column if conversion fails
                df.drop(columns=[date_col], inplace=True)
        
        return df
    
    def preprocess_data(self):
        """
        Load, clean, and merge all datasets
        """
        try:
            # Load and clean datasets
            datasets = {}
            for key, path in self.data_files.items():
                try:
                    datasets[key] = self._clean_and_validate_data(pd.read_csv(path))
                except Exception as e:
                    self.logger.error(f"Error loading {key} dataset: {e}")
                    continue
            
            # Print available columns for debugging
            for key, df in datasets.items():
                self.logger.info(f"Columns in {key} dataset: {list(df.columns)}")
            
            # Merge datasets with fallback mechanism
            merged_df = None
            merge_keys = ['State', 'District']
            
            # Add date to merge keys if available in all datasets
            if all('Date' in df.columns for df in datasets.values()):
                merge_keys.append('Date')
            
            for key in ['population', 'water_usage', 'hydrology']:
                if key in datasets:
                    if merged_df is None:
                        merged_df = datasets[key]
                    else:
                        # Use left merge to keep as much data as possible
                        merged_df = merged_df.merge(
                            datasets[key], 
                            on=merge_keys, 
                            how='left'
                        )
            
            if merged_df is None or merged_df.empty:
                raise ValueError("Unable to merge datasets")
            
            # Add additional datasets if available
            additional_datasets = ['climate', 'disaster', 'demographic', 'land_use']
            for key in additional_datasets:
                if key in datasets:
                    merged_df = merged_df.merge(
                        datasets[key], 
                        on=merge_keys, 
                        how='left'
                    )
            
            self.merged_df = merged_df
            
        except Exception as e:
            self.logger.error(f"Data preprocessing failed: {e}")
            raise
    
    def train_models(self):
        """
        Train linear regression models for each water usage sector
        """
        if self.merged_df is None:
            self.preprocess_data()
        
        # Prepare training data
        # If no Date column, skip date filtering
        if 'Date' in self.merged_df.columns:
            train_data = self.merged_df[
                (self.merged_df['Date'].dt.year >= 2018) & 
                (self.merged_df['Date'].dt.year <= 2022)
            ]
        else:
            train_data = self.merged_df
        
        # Try different feature sets
        for feature_set in self.feature_sets:
            try:
                # Find available features
                available_features = [
                    col for col in feature_set 
                    if col in train_data.columns
                ]
                
                if not available_features:
                    continue
                
                # Prepare features and target
                X = train_data[available_features].fillna(0)
                
                # Train models for each sector
                for sector in self.target:
                    if sector not in train_data.columns:
                        continue
                    
                    y = train_data[sector].fillna(0)
                    
                    model = LinearRegression()
                    model.fit(X, y)
                    self.models[sector] = {
                        'model': model,
                        'features': available_features
                    }
                
                # If successful, break the feature set loop
                break
            
            except Exception as e:
                self.logger.warning(f"Failed with feature set {feature_set}: {e}")
    
    def predict_water_usage(self, date, state, district):
        """
        Predict water usage for a specific date, state, and district
        
        :param date: Date for prediction
        :param state: State name
        :param district: District name
        :return: Tuple of sector predictions and overall demand
        """
        # Ensure models are trained
        if not self.models:
            self.train_models()
        
        # Normalize inputs
        state = state.strip().lower()
        district = district.strip().lower()
        
        # Filter input data
        if self.merged_df is None:
            self.preprocess_data()
        
        # Prepare filter conditions
        filter_conditions = [
            (self.merged_df['State'] == state) &
            (self.merged_df['District'] == district)
        ]
        
        # Add date filter if Date column exists
        if 'Date' in self.merged_df.columns:
            date = pd.to_datetime(date)
            filter_conditions.append(self.merged_df['Date'].dt.date == date.date())
        
        # Apply filter
        input_data = self.merged_df[np.logical_and.reduce(filter_conditions)]
        
        if input_data.empty:
            self.logger.warning(f"No data for {district}, {state} on {date}")
            return None, None
        
        # Predict sectoral water usage
        sector_predictions = {}
        overall_demand = 0
        
        for sector, model_info in self.models.items():
            try:
                # Prepare input features
                X_input = input_data[model_info['features']].fillna(0)
                
                # Predict
                prediction = model_info['model'].predict(X_input)
                sector_predictions[sector] = abs(prediction[0])  # Ensure non-negative
                overall_demand += abs(prediction[0])
            
            except Exception as e:
                self.logger.error(f"Prediction error for {sector}: {e}")
        
        return sector_predictions, overall_demand

# Example usage
if __name__ == "__main__":
    predictor = WaterUsagePredictor()
    predictor.train_models()
    
    try:
        predictions, demand = predictor.predict_water_usage('2023-12-31', 'Karnataka', 'Yadgir')
        if predictions:
            print(f"Predictions for Yadgir, Karnataka:")
            for sector, value in predictions.items():
                print(f"  {sector}: {value:.2f} m³")
            print(f"  Overall Water Demand: {demand:.2f} m³")
        else:
            print("No predictions available.")
    except Exception as e:
        print(f"Prediction error: {e}")