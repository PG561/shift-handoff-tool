require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const app = express();
app.use(express.json());
app.use(express.static('public'));

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

    res.json({ summary: response.content[0].text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong generating the summary.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Shift Handoff Tool running at http://localhost:${PORT}`);
});