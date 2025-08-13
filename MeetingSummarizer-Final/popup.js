document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        startBtn: document.getElementById('startBtn'),
        stopBtn: document.getElementById('stopBtn'),
        status: document.getElementById('status'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        transcriptSection: document.getElementById('transcript-section'),
        transcript: document.getElementById('transcript'),
        summarySection: document.getElementById('summary-section'),
        summary: document.getElementById('summary'),
        downloadBtn: document.getElementById('downloadBtn'),
    };

    let mediaRecorder = null;
    let audioChunks = [];
    let apiKey = '';

    const showStatus = (message, type) => {
        elements.status.textContent = message;
        elements.status.className = `status-${type}`;
    };

    const updateUIForRecording = (isRecording) => {
        elements.startBtn.disabled = isRecording || !apiKey;
        elements.stopBtn.disabled = !isRecording;
        if (isRecording) {
            elements.transcriptSection.classList.add('hidden');
            elements.summarySection.classList.add('hidden');
            elements.downloadBtn.disabled = true;
        }
    };

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
    });

    const startRecording = async () => {
        if (!apiKey) return showStatus('API Key missing. Please set it in options.', 'error');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
            mediaRecorder.onstop = processAudio;
            mediaRecorder.start();
            showStatus('Recording... Click stop when finished.', 'success');
            updateUIForRecording(true);
        } catch (err) {
            showStatus('Mic permission denied? Error starting recording.', 'error');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            showStatus('Recording stopped. Processing audio...', 'info');
            updateUIForRecording(false);
            elements.loadingSpinner.classList.remove('hidden');
        }
    };

    const processAudio = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        if (audioBlob.size < 100) {
            showStatus('No audio recorded.', 'error');
            elements.loadingSpinner.classList.add('hidden');
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout

        try {
            const audioBase64 = await fileToBase64(audioBlob);
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            const PROMPT = `You are a meeting assistant. First, transcribe the attached audio accurately. Second, based on the transcription, provide a concise summary that includes key discussion points, action items, and any decisions made. Structure your response with "## Transcription" and "## Summary" headings.`;
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: PROMPT },
                            { inline_data: { mime_type: 'audio/webm', data: audioBase64 } }
                        ]
                    }]
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API request failed');
            }

            const data = await response.json();
            const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            const transcriptMatch = fullText.match(/## Transcription\s*([\s\S]*?)## Summary/);
            const summaryMatch = fullText.match(/## Summary\s*([\s\S]*)/);
            
            elements.transcript.innerText = transcriptMatch ? transcriptMatch[1].trim() : 'Could not extract transcript.';
            elements.summary.innerText = summaryMatch ? summaryMatch[1].trim() : 'Could not extract summary.';
            
            elements.transcriptSection.classList.remove('hidden');
            elements.summarySection.classList.remove('hidden');
            elements.downloadBtn.disabled = false;
            showStatus('Processing complete!', 'success');

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                showStatus('Error: API request timed out.', 'error');
            } else {
                showStatus(`Error: ${error.message}`, 'error');
            }
        } finally {
            elements.loadingSpinner.classList.add('hidden');
        }
    };

    const exportSummary = () => {
        const content = elements.summary.innerText;
        if (!content) return;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting_summary_${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const initialize = async () => {
        elements.startBtn.addEventListener('click', startRecording);
        elements.stopBtn.addEventListener('click', stopRecording);
        elements.downloadBtn.addEventListener('click', exportSummary);

        try {
            const result = await chrome.storage.local.get(['apiKey']);
            apiKey = result.apiKey || '';
            if (!apiKey) showStatus('API Key not set in Options.', 'error');
        } catch (error) {
            showStatus('Error loading API key.', 'error');
        }
        updateUIForRecording(false);
    };

    initialize();
});