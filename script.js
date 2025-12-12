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

    // Show loading state with immediate visual feedback
    const generateBtn = document.getElementById('generateBtn');
    const loadingMessage = document.getElementById('loadingMessage');

    // Immediate button feedback
    generateBtn.textContent = 'Processing...';
    generateBtn.disabled = true;
    generateBtn.classList.add('processing');

    // Show loading message
    loadingMessage.style.display = 'block';
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
        displayContent(generatedText, topic, costInfo, ageGroup);

    } catch (error) {
        console.error('Error:', error);
        alert('Error generating content: ' + error.message);
    } finally {
        // Reset button state
        generateBtn.textContent = 'Generate Learning Material';
        generateBtn.disabled = false;
        generateBtn.classList.remove('processing');
        loadingMessage.style.display = 'none';
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

1. ARTICLE FORMAT - FAQ/QUESTION-BASED STRUCTURE (REQUIRED):
   - Organize content using a FAQ (Frequently Asked Questions) format
   - Each major section should be a clear question that readers want answered
   - Use <h2> for main questions (e.g., "What is...", "Why does...", "How can you...")
   - Use <h3> for follow-up sub-questions within sections
   - Short, digestible paragraphs (3-5 sentences maximum per paragraph)
   - Break up long text with frequent headings and subheadings
   - NEVER write long walls of text - always break into smaller chunks

   NARRATIVE STYLE (CRITICAL):
   - Write answers in NARRATIVE, STORYTELLING format - NOT bullet points
   - Use flowing paragraphs that read like a story or conversation
   - For ages 5-7: Simple narrative sentences, can use occasional lists for steps
   - For ages 8+: PRIMARILY narrative prose, minimize bullet points
   - Weave data and facts INTO the narrative text naturally
   - Only use bullet/numbered lists for:
     * Step-by-step instructions
     * Quick reference summaries at the end of a section
     * NOT for explaining concepts or answering questions

2. READABILITY FOR AGE GROUP (REQUIRED):
   - For ages 5-10: Very short paragraphs (2-3 sentences), simple questions, lots of white space
   - For ages 11-13: Short paragraphs (3-4 sentences), clear section breaks
   - For ages 14+: Medium paragraphs (4-5 sentences), well-organized sections
   - Use bullet points and numbered lists frequently to break up text
   - Include section summaries after longer explanations

3. SCIENTIFIC ACCURACY & FACTS:
   - Base all content on verified scientific facts and principles
   - Include specific data, measurements, and numbers where relevant
   - Cite real scientific discoveries, studies, or historical events
   - Use precise scientific terminology appropriate for the age group

4. DATA TABLES AND INLINE DATA (REQUIRED - STRICT FORMATTING):
   - For ages 5-7: Optional - use simple data inline in narrative text
   - For ages 8+: REQUIRED - Include at least ONE clear HTML table when data aids explanation

   INLINE DATA (CRITICAL):
   - Weave numbers, measurements, and statistics INTO narrative paragraphs
   - Example: "Scientists discovered that wind speeds can reach up to 200 miles per hour in the strongest tornadoes."
   - Example: "The Atacama Desert receives less than 1 millimeter of rain per year, making it one of the driest places on Earth."
   - Make data part of the story, not just a list

   DATA TABLES (for ages 8+):
   - Use tables to SUMMARIZE data already mentioned in narrative
   - Tables are for quick reference, not primary explanation
   - Examples: comparisons, timelines, measurements, classifications, statistics
   - ALWAYS use this exact structure:
     * <table> wrapper
     * <thead> with <tr> containing <th> cells for headers
     * <tbody> with <tr> containing <td> cells for data
   - Table formatting rules:
     * Maximum 4 columns (for readability)
     * Keep cell content concise (10-15 words max per cell)
     * Use clear, descriptive header labels
     * Include units in headers, not in every cell
   - Add a descriptive <h3> heading before each table explaining what it shows
   - Place tables AFTER narrative explanation, not before
   - Never nest tables or use complex layouts

5. REAL-WORLD EXAMPLES (REQUIRED - 2-3 examples):
   - Include 2-3 concrete, relatable examples that connect to the reader's life
   - Use age-appropriate references (popular culture, everyday experiences, familiar objects)
   - Make examples engaging and memorable
   - Help readers visualize and understand abstract concepts through familiar analogies

6. STRUCTURE & FORMATTING (STRICTLY ENFORCED):
   - Start with an engaging <h1> title (make it catchy!)
   - Use <h2> for main section questions (5-8 sections total)
   - Use <h3> for sub-questions and table headings
   - Keep paragraphs SHORT (3-5 sentences max)
   - Use <p> tags for NARRATIVE paragraphs (primary content delivery method)
   - Use <ul> or <ol> lists SPARINGLY - only for:
     * Step-by-step instructions or procedures
     * Quick reference summaries
     * Safety tips or warnings
   - DO NOT use bullet points to explain concepts - use narrative paragraphs instead
   - Add visual breaks with headings, NOT excessive lists

7. TYPOGRAPHY & READABILITY (AGE-APPROPRIATE):
   - For ages 5-10:
     * Use very simple, short sentences
     * Add extra line spacing between paragraphs
     * Include emoji or visual cues where appropriate
   - For ages 11-13:
     * Use clear, concise sentences
     * Normal paragraph spacing
     * Balance text with visual elements
   - For ages 14+:
     * Use more sophisticated vocabulary
     * Denser content allowed but still scannable
     * Professional but engaging tone

8. ENGAGEMENT:
   - Write in a warm, conversational tone
   - Use storytelling where appropriate
   - Include practical tips and actionable advice
   - Create "aha!" moments that spark curiosity
   - Make learning feel like an exciting discovery

FORMATTING RULES:
- Use ONLY HTML tags (no markdown, no ** for bold)
- Do NOT include <html>, <body>, or <head> tags
- Content should go directly inside an article element
- Ensure all tables are properly formatted with <thead> and <tbody>
- ALWAYS use proper HTML tags: <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <table>
- NEVER use markdown syntax (**, ##, etc.)

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

function displayContent(content, topic, costInfo, ageGroup) {
    const outputSection = document.getElementById('outputSection');
    const generatedContent = document.getElementById('generatedContent');
    const inputForm = document.getElementById('inputForm');
    const costInfoDiv = document.getElementById('costInfo');

    // Hide the form and show the output
    inputForm.classList.add('hidden');
    outputSection.classList.remove('hidden');

    // Add age-appropriate class for typography
    generatedContent.className = 'printable-content';
    if (ageGroup === '5-7' || ageGroup === '8-10') {
        generatedContent.classList.add('age-young');
    } else if (ageGroup === '11-13') {
        generatedContent.classList.add('age-preteen');
    } else {
        generatedContent.classList.add('age-teen-adult');
    }

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

function printArticle() {
    // Get the article content and age class
    const generatedContent = document.getElementById('generatedContent');
    const articleContent = generatedContent.innerHTML;
    const ageClass = generatedContent.classList.contains('age-young') ? 'age-young' :
                     generatedContent.classList.contains('age-preteen') ? 'age-preteen' :
                     'age-teen-adult';

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Write clean HTML with only the article
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Article</title>
            <style>
                body {
                    font-family: Georgia, 'Times New Roman', Times, serif;
                    color: #333;
                    padding: 1in;
                    max-width: 8.5in;
                    margin: 0 auto;
                    font-size: 11pt;
                    line-height: 1.6;
                }
                body.age-young {
                    font-size: 12pt;
                    line-height: 1.8;
                }
                body.age-young h1 {
                    font-size: 20pt;
                }
                body.age-young h2 {
                    font-size: 15pt;
                }
                body.age-young h3 {
                    font-size: 13pt;
                }
                body.age-preteen {
                    font-size: 11pt;
                    line-height: 1.7;
                }
                body.age-preteen h1 {
                    font-size: 19pt;
                }
                body.age-preteen h2 {
                    font-size: 14pt;
                }
                body.age-preteen h3 {
                    font-size: 12pt;
                }
                body.age-teen-adult {
                    font-size: 11pt;
                    line-height: 1.6;
                }
                body.age-teen-adult h1 {
                    font-size: 18pt;
                }
                body.age-teen-adult h2 {
                    font-size: 14pt;
                }
                body.age-teen-adult h3 {
                    font-size: 12pt;
                }
                h1 {
                    color: #4a90e2;
                    margin-bottom: 1rem;
                    font-weight: bold;
                }
                h2 {
                    color: #357abd;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    font-weight: bold;
                }
                h3 {
                    color: #555;
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                    font-weight: bold;
                }
                p {
                    margin-bottom: 1rem;
                    text-align: justify;
                }
                ul, ol {
                    margin-left: 2rem;
                    margin-bottom: 1rem;
                }
                li {
                    margin-bottom: 0.5rem;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5rem 0;
                }
                th {
                    background-color: #333;
                    color: white;
                    padding: 0.75rem;
                    text-align: left;
                    font-weight: 600;
                }
                td {
                    padding: 0.75rem;
                    border: 1px solid #333;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body class="${ageClass}">
            ${articleContent}
        </body>
        </html>
    `);

    // Close the document and print
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load, then print
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
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
