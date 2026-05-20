import * as OpenAI from "openai";

export const openai = new OpenAI.default({
  apiKey: process.env.OPENAI_API_KEY,
});
