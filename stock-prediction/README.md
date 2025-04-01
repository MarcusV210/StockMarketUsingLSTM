# Stock Market Price Prediction using LSTMs
### This project is a stock prediction website built using ReactJS for the frontend and Flask for the backend. The website fetches real-time stock data, preprocesses it using machine learning models, and predicts the next day's stock prices for multiple companies.

### Features

- Stock Data Fetching: Retrieves stock data from the Polygon.io API.

- Data Preprocessing: Uses a single scaler for all models and applies transformations before feeding data into the models.

- Machine Learning Models: LSTM-based neural networks for predicting stock price trends.

- Automated Updates: Runs daily at 8 AM via Windows Task Scheduler to fetch new data, retrain models, and update predictions.

- Predictions API: Exposes an API endpoint for fetching predictions.

- ReactJS Frontend: Displays real-time stock prices and predictions.


### Automating Daily Predictions

#### To automate daily data fetching and model retraining at 8 AM, we use Windows Task Scheduler:

- Create a new task in Task Scheduler.

- Set the trigger to run every day at 8:00 AM.

- Set the action to run a Python script
