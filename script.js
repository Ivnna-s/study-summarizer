const summarizeBtn = document.getElementById('summarizeBtn');
const notesInput = document.getElementById('notesInput');
const apiKeyInput = document.getElementById('apiKey');
const loading = document.getElementById('loading');
const loadingText = document.getElementById('loadingText');
const results = document.getElementById('results');
const summaryOutput = document.getElementById('summaryOutput');
const quizOutput = document.getElementById('quizOutput');

summarizeBtn.addEventListener('click', async () => {
    const notes = notesInput.value.trim();
    const apiKey = apiKeyInput.value.trim();

    if (!notes) {
        alert('Please paste some notes first.');
        return;
    }
    if (!apiKey) {
        alert('Please enter your API key.');
        return;
    }

    loading.classList.remove('hidden');
    loadingText.textContent = 'Thinking...';
    results.classList.add('hidden');
    summarizeBtn.disabled = true;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Summarize the following notes in 3-5 clear bullet points.
Then write 3 quiz questions (with answers) based on the content.
Format your response as:

SUMMARY:
- point 1
- point 2

QUIZ:
1. Question? Answer: ...
2. Question? Answer: ...

Notes:
${notes}`
                        }]
                    }]
                })
            }
        );

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('The AI service is temporarily busy. Please wait a moment and try again.');
            }
            if (response.status === 400) {
                throw new Error('There was a problem with the request. Double-check your API key is valid.');
            }
            if (response.status === 403) {
                throw new Error('That API key was rejected. Please check it or generate a new one at aistudio.google.com.');
            }
            throw new Error(`Something went wrong (error ${response.status}). Please try again.`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        const [summaryPart, quizPart] = text.split('QUIZ:');
        renderSummary(summaryPart ? summaryPart.replace('SUMMARY:', '').trim() : '');
        renderQuiz(quizPart ? quizPart.trim() : '');

        results.classList.remove('hidden');
    } catch (err) {
        alert(err.message);
    } finally {
        loading.classList.add('hidden');
        summarizeBtn.disabled = false;
    }
});

function renderSummary(summaryText) {
    summaryOutput.textContent = summaryText || 'No summary generated.';
}

function renderQuiz(quizText) {
    quizOutput.innerHTML = '';

    if (!quizText) {
        quizOutput.textContent = 'No quiz generated.';
        return;
    }

    // Split into numbered items like "1. Question? Answer: ..."
    const items = quizText
        .split(/\n(?=\d+\.\s)/)
        .map(s => s.trim())
        .filter(Boolean);

    if (items.length === 0) {
        quizOutput.textContent = quizText;
        return;
    }

    items.forEach((item, i) => {
        const match = item.match(/^\d+\.\s*(.*?)\s*Answer:\s*(.*)$/s);
        const card = document.createElement('div');
        card.className = 'quiz-card';

        const number = document.createElement('span');
        number.className = 'quiz-number';
        number.textContent = `Q${i + 1}`;
        card.appendChild(number);

        const question = document.createElement('div');
        question.className = 'quiz-question';

        const answer = document.createElement('div');
        answer.className = 'quiz-answer';

        if (match) {
            question.textContent = match[1].trim();
            answer.innerHTML = `<strong>Answer:</strong> ${escapeHtml(match[2].trim())}`;
        } else {
            question.textContent = item.replace(/^\d+\.\s*/, '');
            answer.textContent = '';
        }

        card.appendChild(question);
        if (answer.textContent || answer.innerHTML) card.appendChild(answer);
        quizOutput.appendChild(card);
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}