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
                'anthropic-version': '2023-06-01'
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

        // Display the content
        displayContent(generatedText, topic);

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

    return `You are a friendly, knowledgeable teacher creating educational content about "${topic}" for ${ageDescriptions[ageGroup]}

Please write an informative, fact-based, knowledge-enhancing article that is approximately ${wordCount} words long.

Requirements:
1. Make it age-appropriate for the target audience
2. Use proper formatting with clear headings and sections
3. Include interesting facts and examples
4. Make it engaging and educational
5. Use HTML formatting (h1, h2, h3, p, ul, ol tags) to structure the content
6. Start with a main title using <h1>
7. Break content into logical sections with <h2> headings
8. Use <h3> for subsections if needed
9. Use paragraphs <p> for body text
10. Use lists <ul> or <ol> where appropriate

Do not include any markdown formatting. Only use HTML tags. Do not include <html>, <body>, or <head> tags - just the content that will go inside an article element.

Begin the article now:`;
}

function displayContent(content, topic) {
    const outputSection = document.getElementById('outputSection');
    const generatedContent = document.getElementById('generatedContent');
    const inputForm = document.getElementById('inputForm');

    // Hide the form and show the output
    inputForm.classList.add('hidden');
    outputSection.classList.remove('hidden');

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
