const OpenAI = require('openai');

// Groq exposes an OpenAI-compatible chat completions API, so the same SDK
// works for both providers — only the base URL, key, and model differ.
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

// Treats the .env.example placeholder values (which both contain "your-") as
// "not configured" rather than attempting a doomed real API call with them.
function isRealKey(key) {
  return Boolean(key) && !key.includes('your-');
}

let openaiClient;
let groqClient;

// Returns a configured OpenAI client, or null if no real key is set.
function getOpenAIClient() {
  if (openaiClient === undefined) {
    openaiClient = isRealKey(process.env.OPENAI_API_KEY)
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }
  return openaiClient;
}

// Returns a configured Groq client (via the OpenAI SDK), or null if no real key is set.
function getGroqClient() {
  if (groqClient === undefined) {
    groqClient = isRealKey(process.env.GROQ_API_KEY)
      ? new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: GROQ_BASE_URL })
      : null;
  }
  return groqClient;
}

module.exports = { getOpenAIClient, getGroqClient };
