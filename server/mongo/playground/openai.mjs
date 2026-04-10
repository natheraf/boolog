import OpenAI from "openai";

const client = new OpenAI({
  baseURL: process.env.LLAMA_HOST,
  apiKey: "dummy", // required by the SDK but not used
});

const response = await client.chat.completions.create({
  model: "gemma-4", // can be anything, llama-server ignores it
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(response, response.choices[0].message.content);
