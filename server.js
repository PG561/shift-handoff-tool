require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const app = express();
app.use(express.json());
app.use(express.static('public'));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'summaries.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

function loadSummaries() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveSummary(entry) {
  const summaries = loadSummaries();
  summaries.unshift(entry);
  const trimmed = summaries.slice(0, 20);
  fs.writeFileSync(DATA_FILE, JSON.stringify(trimmed, null, 2));
}

app.post('/generate', async (req, res) => {
  try {
    const { name, shiftDate, shiftTime, promises, notes } = req.body;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: `You are helping a fast-food shift lead write a clear handoff note for the next shift lead. Create a summary with this exact structure:

1. A "CUSTOMER PROMISES" section FIRST, at the top, in a way that stands out — these are specific commitments made to customers (remakes, refunds, callbacks, etc) that the NEXT shift lead absolutely must honor or follow up on. If none were given, write "No outstanding customer promises."
2. Then other relevant sections only if needed (Inventory, Staffing, Prep Needed, Other).

Keep it concise and practical. Use the actual name, date, and shift given below — never use placeholder text.

Left by: ${name}
Date: ${shiftDate}
Shift: ${shiftTime}

Customer promises made this shift:
${promises || 'None'}

General shift notes:
${notes || 'None'}`
        }
      ],
    });

    const summary = response.content[0].text;

    const entry = {
      id: Date.now().toString(),
      name,
      shiftDate,
      shiftTime,
      summary,
      createdAt: new Date().toISOString(),
    };
    saveSummary(entry);

    res.json({ summary, id: entry.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong generating the summary.' });
  }
});

app.get('/summaries', (req, res) => {
  const summaries = loadSummaries();
  res.json(summaries);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Shift Handoff Tool running on port ${PORT}`);
});