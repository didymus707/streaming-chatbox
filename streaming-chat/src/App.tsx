import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import "./App.css";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function App() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = "auto";
      textArea.style.height = `${textArea.scrollHeight}px`;
    }
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateMessage = (chunkText: string) => {
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];

      if (lastMessage && lastMessage.role === "assistant") {
        return [
          ...prev.slice(0, -1),
          { ...lastMessage, content: lastMessage.content + chunkText },
        ];
      }

      return [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: chunkText },
      ];
    });
  };

  const handleSend = async () => {
    if (!userPrompt.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userPrompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    setUserPrompt("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userPrompt }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let remainder = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        remainder += chunk;

        const parts = remainder.split("\n\n");
        remainder = parts.pop() || "";

        for (const part of parts) {
          const content = part.replace("data: ", "");
          try {
            const data = JSON.parse(content);
            updateMessage(data.text);
          } catch (e) {
            console.error("Error parsing chunk", e);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.role}`}>
            <Markdown>{m.content}</Markdown>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="input-container">
        <button className="icon-btn">+</button>

        <textarea
          ref={textAreaRef}
          rows={1}
          placeholder="Type a message..."
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          // onKeyDown={handleKeyDown}
        />

        <div className="input-actions">
          <span className="model-tag">Fast v</span>
          <button className="send-btn" onClick={handleSend}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
