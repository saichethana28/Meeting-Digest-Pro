document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveBtn = document.getElementById('saveBtn');
    const statusEl = document.getElementById('status');

    const testApiKey = async (key) => {
        statusEl.textContent = 'Testing key...';
        statusEl.className = '';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20-second timeout

        try {
            // FINAL FIX: Using the correct 'v1beta' endpoint for this model.
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`;
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "test" }] }] }),
                signal: controller.signal // Link the timeout to the fetch request
            });

            clearTimeout(timeoutId); // Clear the timeout if fetch succeeds

            if (response.ok) return true;
            
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API test failed');

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                statusEl.textContent = 'Error: API test timed out. Check connection.';
            } else {
                statusEl.textContent = `Error: ${error.message}`;
            }
            statusEl.className = 'error';
            return false;
        }
    };

    const saveOptions = async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            statusEl.textContent = 'API key cannot be empty.';
            statusEl.className = 'error';
            return;
        }
        const isValid = await testApiKey(apiKey);
        if (isValid) {
            chrome.storage.local.set({ apiKey: apiKey }, () => {
                statusEl.textContent = 'API Key saved and verified successfully!';
                statusEl.className = 'success';
            });
        }
    };

    const restoreOptions = () => {
        chrome.storage.local.get(['apiKey'], (result) => {
            if (result.apiKey) apiKeyInput.value = result.apiKey;
        });
    };

    saveBtn.addEventListener('click', saveOptions);
    restoreOptions();
});