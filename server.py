#!/usr/bin/env python3
"""
MyFriendlyTeacher Backend Server
Simple Flask server to proxy requests to Claude API
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import os

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes

CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
CLAUDE_MODEL = 'claude-3-haiku-20240307'  # Claude 3 Haiku - fastest, most affordable

@app.route('/api/generate', methods=['POST'])
def generate_content():
    """Proxy endpoint for Claude API"""
    try:
        data = request.get_json()

        # Get API key from request
        api_key = data.get('apiKey')
        if not api_key:
            return jsonify({'error': 'API key is required'}), 400

        # Get prompt from request
        prompt = data.get('prompt')
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400

        # Make request to Claude API
        headers = {
            'Content-Type': 'application/json',
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01'
        }

        payload = {
            'model': CLAUDE_MODEL,
            'max_tokens': 4096,
            'messages': [{
                'role': 'user',
                'content': prompt
            }]
        }

        response = requests.post(CLAUDE_API_URL, headers=headers, json=payload)

        if response.status_code != 200:
            error_data = response.json()
            error_message = error_data.get('error', {}).get('message', 'API request failed')
            error_type = error_data.get('error', {}).get('type', 'unknown')
            full_error = f"{error_type}: {error_message}"
            print(f"Claude API Error ({response.status_code}): {full_error}")
            print(f"Full error data: {error_data}")
            return jsonify({
                'error': full_error
            }), response.status_code

        return jsonify(response.json()), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

@app.route('/')
def index():
    """Serve the main HTML file"""
    file_path = os.path.join(BASE_DIR, 'index.html')
    return send_file(file_path)

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files (CSS, JS) - but not API routes"""
    # Don't serve API routes as static files
    if path.startswith('api/'):
        return "Not found", 404

    file_path = os.path.join(BASE_DIR, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_file(file_path)
    return "File not found", 404

if __name__ == '__main__':
    print("🚀 MyFriendlyTeacher server starting...")
    print("📚 Server running at http://localhost:8080")
    print("🌐 Open your browser and visit: http://localhost:8080")
    print("Press CTRL+C to stop the server")
    app.run(debug=True, port=8080)
