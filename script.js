const summarizeBtn = document.getElementById('summarizeBtn');
const notesInput = document.getElementById('notesInput');
const apiKeyInput = document.getElementById('apiKey');
const loading = document.getElementById('loading');
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
    loading.textContent = 'Thinking...';
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
        summaryOutput.textContent = summaryPart.replace('SUMMARY:', '').trim();
        quizOutput.textContent = quizPart ? quizPart.trim() : 'No quiz generated.';

        results.classList.remove('hidden');
    } catch (err) {
        alert(err.message);
    } finally {
        loading.classList.add('hidden');
        summarizeBtn.disabled = false;
    }
});