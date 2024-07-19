import os
import msal
import requests
from flask import Flask, jsonify, request, session, redirect, url_for
from flask_session import Session
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configuring the app with environment variables
app.config['CLIENT_ID'] = os.getenv('CLIENT_ID')
app.config['AUTHORITY'] = os.getenv('AUTHORITY')
app.config['CLIENT_SECRET'] = os.getenv('CLIENT_SECRET')
app.config['SCOPE'] = os.getenv('SCOPE', 'https://graph.microsoft.com/.default').split(',')
app.config['ENDPOINT'] = os.getenv('ENDPOINT', 'https://graph.microsoft.com/v1.0/users')

# Additional configuration for Flask-Session
app.config['SESSION_TYPE'] = 'filesystem'

Session(app)

msal_client = msal.ConfidentialClientApplication(
    app.config['CLIENT_ID'],
    authority=app.config['AUTHORITY'],
    client_credential=app.config['CLIENT_SECRET']
)

logging.basicConfig(level=logging.INFO)

@app.route('/')
def index():
    token = get_access_token()
    if not token:
        return jsonify({"error": "Unable to get access token"}), 500

    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(app.config['ENDPOINT'], headers=headers)

    if response.status_code != 200:
        return jsonify({"error": response.json()}), response.status_code

    return jsonify(response.json())

def get_access_token():
    result = msal_client.acquire_token_for_client(scopes=app.config['SCOPE'])
    if "access_token" in result:
        return result['access_token']
    else:
        logging.error("Could not acquire token: %s", result.get("error"))
        return None

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)  # Or host='0.0.0.0' for external access
