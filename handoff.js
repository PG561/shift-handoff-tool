require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const readline = require('readline');
const fs = require('fs');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log("=== Wingstop Shift Handoff Tool ===\n");

  const name = await ask("Your name: ");
  const shiftDate = await ask("Date (e.g. June 21, 2026): ");
  const shiftTime = await ask("Shift (e.g. Morning / Evening): ");

  console.log("\nFirst: any specific promises made to customers this shift?");
  console.log("(e.g. 'told customer her remake will be ready tomorrow, no charge')");
  console.log("Type each one, then type DONE when finished. If none, just type DONE.\n");

  let promises = [];
  let collectingPromises = true;

  rl.on('line', (line) => {
    if (line.trim().toUpperCase() === 'DONE') {
      if (collectingPromises) {
        collectingPromises = false;
        console.log("\nNow type your general shift notes (inventory, staffing, prep, etc).");
        console.log("Type DONE when finished.\n");
      } else {
        rl.close();
      }
    } else if (collectingPromises) {
      promises.push(line);
    } else {
      generalNotes.push(line);
    }
  });

  let generalNotes = [];

  rl.on('close', async () => {
    const promisesText = promises.join('\n') || 'None';
    const notesText = generalNotes.join('\n') || 'None';

    console.log("\nGenerating handoff summary...\n");

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: `You are helping a fast-food shift lead write a clear handoff note for the next shift lead. Create a summary with this exact structure:

1. A "CUSTOMER PROMISES" section FIRST, at the top, in a way that stands out — these are specific commitments made to customers (remakes, refunds, callbacks, etc) that the NEXT shift lead absolutely must honor or follow up on. If none were given, write "No outstanding customer promises."
2. Then other relevant sections only if needed (Inventory, Staffing, Prep Needed, Other).

Keep it concise and practical. Use the actual name, date, and shift given below — never use placeholder text like [Your Name].

Left by: ${name}
Date: ${shiftDate}
Shift: ${shiftTime}

Customer promises made this shift:
${promisesText}

General shift notes:
${notesText}`
        }
      ],
    });

    const summary = response.content[0].text;

    console.log("=== HANDOFF SUMMARY ===\n");
    console.log(summary);

    const filename = `handoff_${shiftDate.replace(/[^a-zA-Z0-9]/g, '_')}_${shiftTime.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    fs.writeFileSync(filename, summary);
    console.log(`\n(Saved to ${filename})`);
  });
}

main();