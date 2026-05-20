import OpenAI from "openai";

const openai = new (OpenAI as any)({
  apiKey: process.env.OPENAI_API_KEY,
});

export { openai };
