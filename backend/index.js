// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Groq = require('groq-sdk');
const nodemailer = require('nodemailer'); // Import nodemailer

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('AI Summarizer Backend is running!');
});

// Summarize API endpoint
app.post('/api/summarize', async (req, res) => {
    // ... (This code remains the same as in Step 2)
    try {
        const { transcript, prompt } = req.body;
        if (!transcript || !prompt) {
          return res.status(400).json({ error: 'Transcript and prompt are required.' });
        }
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: 'system', content: 'You are a helpful assistant...' }, { role: 'user', content: `Transcript:\n\n${transcript}\n\nInstruction:\n\n${prompt}` }],
          model: 'llama3-8b-8192',
        });
        const summary = chatCompletion.choices[0]?.message?.content || 'Sorry, could not generate a summary.';
        res.json({ summary });
    } catch (error) {
        console.error('Error calling Groq API:', error);
        res.status(500).json({ error: 'Failed to generate summary.' });
    }
});

// --- NEW: Share via Email API endpoint ---
app.post('/api/share', async (req, res) => {
    const { summary, recipients } = req.body;

    if (!summary || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: 'Summary and a list of recipients are required.' });
    }

    try {
        // Configure the email transporter using your SMTP credentials
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Send mail with defined transport object
        await transporter.sendMail({
            from: `"AI Summarizer" <${process.env.EMAIL_FROM}>`,
            to: recipients.join(', '), // Send to all recipients
            subject: 'Your Meeting Summary',
            html: `<p>Here is your requested meeting summary:</p><pre style="white-space: pre-wrap; font-family: monospace;">${summary}</pre>`,
        });

        res.status(200).json({ message: 'Summary sent successfully!' });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send summary.' });
    }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});