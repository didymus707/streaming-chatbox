import { useEffect, useRef, useState } from "react";
import "./App.css";
import { OpenAI } from "openai/client.js";

const client = new OpenAI({
  apiKey: process.env.API_KEY,
});

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const run = async () => {
      const response = await client.responses.create({
        model: "gpt-4",
        input: [
          {
            role: "user",
            content: "Say 'double bubble bath' ten times fast.",
          },
        ],
        stream: true,
      });
      console.log(response)

    };
    run();
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.map((m) => (
          <div key={m.id} className={m.role}>
            {m.content}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
    </div>
  );
}

export default App;
