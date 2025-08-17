// src/App.jsx
import { useState } from 'react';
import axios from 'axios'; 
import './App.css';


const API_URL = 'http://localhost:5001/api'; 

function App() {
  // State to hold the values from the input fields
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState('Summarize in bullet points for executives');
  const [summary, setSummary] = useState('');
  const [recipients, setRecipients] = useState('');

  // State to manage loading and status messages
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Placeholder functions that we will implement in the next step
 // Inside the App component in src/App.jsx

const handleGenerateSummary = async () => {
  // Basic validation
  if (!transcript.trim() || !prompt.trim()) {
    setStatusMessage('Please provide both a transcript and a prompt.');
    return;
  }

  setIsLoading(true); // Start loading
  setStatusMessage('');
  setSummary(''); // Clear previous summary

  try {
    const response = await axios.post(`${API_URL}/summarize`, {
      transcript: transcript,
      prompt: prompt,
    });
    setSummary(response.data.summary); // Set the summary from the response
  } catch (error) {
    console.error('Error generating summary:', error);
    setStatusMessage('Failed to generate summary. Please check the console.');
  } finally {
    setIsLoading(false); // Stop loading
  }
};

// Inside the App component in src/App.jsx

const handleShareSummary = async () => {
  // Basic validation
  const recipientList = recipients.split(',').map(email => email.trim()).filter(email => email);
  if (!summary.trim() || recipientList.length === 0) {
    setStatusMessage('Please generate a summary and provide at least one recipient email.');
    return;
  }

  setStatusMessage('Sending...');

  try {
    await axios.post(`${API_URL}/share`, {
      summary: summary,
      recipients: recipientList,
    });
    setStatusMessage('Summary sent successfully!');
  } catch (error) {
    console.error('Error sharing summary:', error);
    setStatusMessage('Failed to send email. Please check the console.');
  }
};

  return (
    <div className="app-container">
      <h1>AI Meeting Notes Summarizer</h1>

      <div className="form-section">
        <h2>1. Upload Transcript</h2>
        <textarea
          rows="15"
          placeholder="Paste your meeting transcript here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />

        <h2>2. Enter Custom Prompt</h2>
        <input
          type="text"
          placeholder="e.g., 'Summarize in bullet points...'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button onClick={handleGenerateSummary} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Summary'}
        </button>
      </div>

      <div className="summary-section">
        <h2>3. Review & Edit Summary</h2>
        <textarea
          rows="15"
          placeholder="The AI-generated summary will appear here. You can edit it before sharing."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      <div className="share-section">
        <h2>4. Share Summary</h2>
        <input
          type="email"
          placeholder="Enter recipient emails, separated by commas"
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
        />
        <button onClick={handleShareSummary}>
          Share via Email
        </button>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>
    </div>
  );
}

export default App;