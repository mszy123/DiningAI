from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
@app.route('/chatgpt-proxy', methods=['POST'])
def chatgpt_proxy():
    # Extract the JSON data from the incoming request
    incoming_data = request.json

    # Define the headers for the OpenAI API request
    headers = {
        'Content-Type': 'application/json',
        # Replace 'YOUR_API_KEY_HERE' with your actual OpenAI API key
        'Authorization': 'Bearer MY APIKEY IS HERE ON SERVER'
    }

    # Make a POST request to the OpenAI API
    response = requests.post(
        'https://api.openai.com/v1/chat/completions',
        json=incoming_data,
        headers=headers
    )

    # Check if the request was successful
    if response.status_code == 200:
        # Forward the response from the OpenAI API back to the client
        return jsonify(response.json())
    else:
        # If the request was not successful, return an error message
        return jsonify({'error': 'Error proxying ChatGPT API'}), 500

if __name__ == '__main__':
    app.run(debug=True)
