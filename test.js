require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 200,
    messages: [
      { role: "user", content: "Say hello and tell me you're ready to help with a shift handoff tool." }
    ],
  });

  console.log(response.content[0].text);
}

main();