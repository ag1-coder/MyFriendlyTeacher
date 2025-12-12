// MyFriendlyTeacher JavaScript

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-haiku-20240307';

document.addEventListener('DOMContentLoaded', () => {
    console.log('MyFriendlyTeacher is ready!');

    // Load saved API key
    const savedApiKey = localStorage.getItem('claudeApiKey');
    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
    }

    // Save API key when it changes
    document.getElementById('apiKey').addEventListener('change', (e) => {
        localStorage.setItem('claudeApiKey', e.target.value);
    });

    // Handle form submission
    document.getElementById('teacherForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await generateContent();
    });
});

async function generateContent() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const topic = document.getElementById('topic').value.trim();
    const ageGroup = document.getElementById('ageGroup').value;
    const pages = parseInt(document.getElementById('pages').value);

    // Validation
    if (!apiKey) {
        alert('Please enter your Claude API key');
        return;
    }

    if (!topic || !ageGroup) {
        alert('Please fill in all fields');
        return;
    }

    // Show loading state
    const generateBtn = document.getElementById('generateBtn');
    const loadingMessage = document.getElementById('loadingMessage');
    generateBtn.disabled = true;
    loadingMessage.classList.remove('hidden');

    try {
        // Calculate approximate word count based on pages
        // Roughly 500 words per page
        const wordCount = pages * 500;

        // Build the prompt based on age group
        const prompt = buildPrompt(topic, ageGroup, wordCount);

        // Call Claude API directly
        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: 4096,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            const errorMessage = error.error?.message || 'API request failed';
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const generatedText = data.content[0].text;

        // Calculate cost
        const usage = data.usage;
        const costInfo = calculateCost(usage);

        // Display the content with cost info
        displayContent(generatedText, topic, costInfo);

    } catch (error) {
        console.error('Error:', error);
        alert('Error generating content: ' + error.message);
    } finally {
        generateBtn.disabled = false;
        loadingMessage.classList.add('hidden');
    }
}

function buildPrompt(topic, ageGroup, wordCount) {
    const ageDescriptions = {
        '5-7': 'very young children (5-7 years old). Use simple words, short sentences, and include fun facts. Make it engaging and easy to understand.',
        '8-10': 'children (8-10 years old). Use clear language, interesting examples, and include some fun interactive elements.',
        '11-13': 'pre-teens (11-13 years old). Use age-appropriate vocabulary, detailed explanations, and include thought-provoking questions.',
        '14-16': 'teenagers (14-16 years old). Use sophisticated language, in-depth analysis, and connect to real-world applications.',
        '17+': 'young adults and adults. Use advanced vocabulary, comprehensive coverage, and include critical thinking elements.'
    };

    return `You are a friendly, knowledgeable science teacher creating educational content about "${topic}" for ${ageDescriptions[ageGroup]}

Please write a scientifically accurate, fact-based, knowledge-enhancing article that is approximately ${wordCount} words long.

CRITICAL REQUIREMENTS:

1. SCIENTIFIC ACCURACY & FACTS:
   - Base all content on verified scientific facts and principles
   - Include specific data, measurements, and numbers where relevant
   - Cite real scientific discoveries, studies, or historical events
   - Use precise scientific terminology appropriate for the age group

2. DATA TABLES (REQUIRED):
   - Include at least ONE clear HTML table when data aids explanation
   - Examples: comparisons, timelines, measurements, classifications, statistics
   - Use proper <table>, <thead>, <tbody>, <tr>, <th>, <td> tags
   - Make tables clear, well-organized, and visually scannable
   - Add a caption or context before each table

3. REAL-WORLD EXAMPLES (REQUIRED - 2-3 examples):
   - Include 2-3 concrete, relatable examples that connect to the reader's life
   - Use age-appropriate references (popular culture, everyday experiences, familiar objects)
   - Make examples engaging and memorable
   - Help readers visualize and understand abstract concepts through familiar analogies

4. STRUCTURE & FORMATTING:
   - Start with a captivating <h1> title
   - Break content into logical sections with <h2> headings
   - Use <h3> for subsections as needed
   - Use paragraphs <p> for body text
   - Use lists <ul> or <ol> for steps, features, or key points
   - Make it visually organized and easy to scan

5. ENGAGEMENT:
   - Write in a warm, encouraging tone
   - Use storytelling where appropriate
   - Ask thought-provoking questions (rhetorical)
   - Create "aha!" moments that spark curiosity
   - Make learning feel like an exciting discovery

6. AGE-APPROPRIATE LANGUAGE:
   - Match vocabulary and complexity to the target age group
   - Explain technical terms when first introduced
   - Use sentence length appropriate for reading level
   - Balance simplicity with intellectual respect

FORMATTING RULES:
- Use ONLY HTML tags (no markdown)
- Do NOT include <html>, <body>, or <head> tags
- Content should go directly inside an article element
- Ensure all tables are properly formatted with headers

Begin the article now:`;
}

function calculateCost(usage) {
    // Claude 3 Haiku pricing (as of 2025)
    // Input: $0.25 per million tokens
    // Output: $1.25 per million tokens
    const INPUT_PRICE_PER_MILLION = 0.25;
    const OUTPUT_PRICE_PER_MILLION = 1.25;

    const inputTokens = usage.input_tokens;
    const outputTokens = usage.output_tokens;
    const totalTokens = inputTokens + outputTokens;

    const inputCost = (inputTokens / 1000000) * INPUT_PRICE_PER_MILLION;
    const outputCost = (outputTokens / 1000000) * OUTPUT_PRICE_PER_MILLION;
    const totalCost = inputCost + outputCost;

    return {
        inputTokens,
        outputTokens,
        totalTokens,
        totalCost: totalCost.toFixed(4)
    };
}

function displayContent(content, topic, costInfo) {
    const outputSection = document.getElementById('outputSection');
    const generatedContent = document.getElementById('generatedContent');
    const inputForm = document.getElementById('inputForm');
    const costInfoDiv = document.getElementById('costInfo');

    // Hide the form and show the output
    inputForm.classList.add('hidden');
    outputSection.classList.remove('hidden');

    // Display cost information
    if (costInfo) {
        costInfoDiv.innerHTML = `
            <h3>📊 Generation Stats</h3>
            <div class="cost-details">
                <div class="cost-detail">
                    <span class="label">Input Tokens</span>
                    <span class="value">${costInfo.inputTokens.toLocaleString()}</span>
                </div>
                <div class="cost-detail">
                    <span class="label">Output Tokens</span>
                    <span class="value">${costInfo.outputTokens.toLocaleString()}</span>
                </div>
                <div class="cost-detail">
                    <span class="label">Total Tokens</span>
                    <span class="value">${costInfo.totalTokens.toLocaleString()}</span>
                </div>
                <div class="cost-detail">
                    <span class="label">Cost</span>
                    <span class="value">$${costInfo.totalCost}</span>
                </div>
            </div>
        `;
    }

    // Set the generated content
    generatedContent.innerHTML = content;

    // Scroll to the top of the generated content
    outputSection.scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
    const outputSection = document.getElementById('outputSection');
    const inputForm = document.getElementById('inputForm');
    const form = document.getElementById('teacherForm');

    // Hide output and show form
    outputSection.classList.add('hidden');
    inputForm.classList.remove('hidden');

    // Clear the topic field but keep age group and pages
    document.getElementById('topic').value = '';

    // Scroll back to the form
    inputForm.scrollIntoView({ behavior: 'smooth' });
}
