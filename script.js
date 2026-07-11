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
    results.classList.add('hidden');
    summarizeBtn.disabled = true;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        const [summaryPart, quizPart] = text.split('QUIZ:');
        summaryOutput.textContent = summaryPart.replace('SUMMARY:', '').trim();
        quizOutput.textContent = quizPart ? quizPart.trim() : 'No quiz generated.';

        results.classList.remove('hidden');
    } catch (err) {
        alert('Something went wrong: ' + err.message);
    } finally {
        loading.classList.add('hidden');
        summarizeBtn.disabled = false;
    }
});