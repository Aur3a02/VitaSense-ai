import OpenAI from "openai";

const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

if (!apiKey) {
  throw new Error("Missing OpenAI API key");
}

if (!baseURL) {
  throw new Error("Missing OpenAI base URL");
}

const openai = new (OpenAI as any)({
  apiKey,
  baseURL,
});

export default openai;
