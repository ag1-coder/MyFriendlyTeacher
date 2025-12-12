# MyFriendlyTeacher

A friendly learning companion web application that generates educational content for different age groups using Claude AI.

## Getting Started

### Option 1: Use GitHub Pages (Recommended)
Visit the live app at: **https://ag1-coder.github.io/MyFriendlyTeacher/**

### Option 2: Run Locally (No Server Required)
Simply open `index.html` in your web browser. The app will:
- Call Claude API directly from your browser
- Store your API key securely in browser localStorage
- Work completely offline (after the first load)

### Option 3: Run with Python Backend (Optional)
If you prefer to use a local backend server:

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python3 server.py

# Visit http://localhost:8080
```

## How to Use

1. Get your Claude API key from https://console.anthropic.com/
2. Enter the API key in the app (it's stored only in your browser)
3. Choose a topic, age group, and number of pages
4. Click "Generate Learning Material"
5. Print or save the generated educational content

## Features

- Generates age-appropriate educational content (5-7 to 17+ years)
- Customizable content length (1-10 pages)
- Print-friendly formatting
- Secure API key storage (localStorage only)
- No backend required (works as static site)

## Security

- Your API key is **never** committed to the repository
- API key is stored only in your browser's localStorage
- API key is sent only to Claude's API (https://api.anthropic.com)
- All sensitive patterns are blocked by .gitignore

## Technologies

- HTML5
- CSS3
- JavaScript (Vanilla)
- Claude API (Haiku model)
- Optional: Python Flask backend
