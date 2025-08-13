# Meeting-Digest-Pro

**Meeting Digest Pro** is a Chrome extension that records meeting audio, transcribes it, and generates a concise summary of key discussion points, action items, and decisions — all powered by the Gemini API.

---

## 🚀 Features
- 🎙️ Record meetings directly from your browser
- 📝 Accurate transcription of spoken content
- 📌 Concise summary with action items & decisions
- 💾 Export summary as `.txt`
- ⚙️ Customizable API Key via Options page
- 🔒 API key stored locally for security

---

---

## 🛠️ Installation (Developer Mode)
1. **Download ZIP** or clone this repository.
2. Open **Google Chrome** → go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle at top right).
4. Click **Load unpacked** → select the `MeetingSummarizer-Final` folder.
5. The extension will now appear in your Chrome toolbar.

---

## 🔑 Setting Up API Key
1. Open the extension popup.
2. Go to **Options**.
3. Enter your **Google AI Studio (Gemini) API Key** (starts with `AIzaSy...`).
4. Save and verify the key.

---

## 📋 Permissions Used
- **storage** → Store API key securely
- **microphone** → Record meeting audio

---

## 📌 Requirements
- Google Chrome v110+
- Gemini API Key from [Google AI Studio](https://makersuite.google.com/)

---

## 📄 Output
- After recording, the extension sends the audio to the **Gemini API**.
- The API responds with a **formatted text** containing:
  - **## Transcription** → full meeting text
  - **## Summary** → concise points, action items, and decisions
- Both sections appear inside the popup:
  - **Transcript** in one box
  - **Summary** in another box
- You can click **Export Summary** to instantly download the summary as a `.txt` file.
- The downloaded file is automatically named like: meeting_summary_YYYY-MM-DD.txt

## 🛡️ License
MIT License — feel free to modify and use.


