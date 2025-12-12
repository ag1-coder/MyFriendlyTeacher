# MyFriendlyTeacher

A friendly learning companion web application that generates educational content for different age groups using Claude AI.

## Getting Started

### Option 1: Use GitHub Pages (Recommended - Easiest!)
Visit the live app at: **https://ag1-coder.github.io/MyFriendlyTeacher/**

No installation required! Just visit the link and start generating educational content.

### Option 2: Run Locally with Simple HTTP Server (Quick & Easy)
```bash
# Navigate to the project directory
cd MyFriendlyTeacher

# Start a simple HTTP server
python3 -m http.server 8000

# Visit http://localhost:8000 in your browser
```

The app will:
- Call Claude API directly from your browser
- Store your API key securely in browser localStorage
- No backend setup required

### Option 3: Run with Python Flask Backend (Full Server)
If you prefer using the Flask backend server:

```bash
# Navigate to the project directory
cd MyFriendlyTeacher

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask server
python3 server.py

# Visit http://localhost:8080 in your browser
```

**Note:** Opening `index.html` directly (file://) won't work due to CORS restrictions. Use one of the options above.

## How to Use

1. Get your Claude API key from https://console.anthropic.com/
2. Enter the API key in the app (it's stored only in your browser)
3. Choose a topic, age group, and number of pages
4. Click "Generate Learning Material"
5. Print or save the generated educational content

## Features

### Content Generation
- **Age-appropriate content** for 5 different age groups (5-7, 8-10, 11-13, 14-16, 17+ years)
- **Science-focused** with verified facts and data
- **Data tables** included when they aid explanation
- **2-3 real-world examples** in every article for better understanding
- **Customizable length** (1-10 pages)

### User Experience
- **Immediate visual feedback** - Button changes to "Processing..." when clicked with pulsing animation
- **Loading indicator** - Clear progress message with spinner while generating
- **Cost tracking** - See exactly how much each article costs (tokens + USD)
- **Print-optimized** - Only the article prints, no UI elements

### Technical
- **No backend required** - Works as a static site (GitHub Pages compatible)
- **Secure API key storage** - Keys stored only in browser localStorage
- **Direct API calls** - Uses Claude 3 Haiku for fast, affordable generation
- **Responsive design** - Works on desktop and mobile

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
