import express from "express";
import "dotenv/config";
import OpenAI from "openai";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const openAi = new OpenAI();

app.post("/api/chat", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const stream = await openAi.chat.completions.create({
    model: "gpt-5",
    messages: [{ role: "user", content: req.body.message }],
    stream: true,
  });

  for await (const chunk of stream) {
    console.log(chunk);
    const content = chunk.choices[0]?.delta?.content || "";
    res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
  }

  res.end();
});

app.get("/health", (_req, res) => {
  // res.status(200).json("Hello World");
  res.status(200).json({ status: "ok" });
});

app.listen(3001, () => console.log("Server running on port 3001"));
