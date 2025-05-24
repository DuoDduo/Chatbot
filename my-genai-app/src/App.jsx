// App.js
import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import "./index.css";
import sendIcon from "./assets/send-white.png";
import sendSound from "./assets/send.mp3";
import receiveSound from "./assets/receive.mp3";
import chatIcon from "./assets/chat-icon.png";
import closeIcon from "./assets/cross.png";

const genAI = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
});

function App() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef(null);

  const sendAudio = useRef(new Audio(sendSound));
  const receiveAudio = useRef(new Audio(receiveSound));

  const handleSubmit = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", parts: [{ text: message }] };
    setHistory((prev) => [...prev, userMessage]);
    sendAudio.current.play();
    setMessage("");

    setIsTyping(true);

    try {
      const chat = await genAI.chats.create({
        model: "gemini-2.0-flash",
      });

      const result = await chat.sendMessage({
        message: userMessage,
      });

      const modelResponse = {
        role: "model",
        parts: [{ text: result.text }],
      };

      setTimeout(() => {
        receiveAudio.current.play();
        setHistory((prev) => [...prev, modelResponse]);
        setIsTyping(false);
      }, 1200);
    } catch (error) {
      console.error("Error:", error);
      const errorResponse = {
        role: "model",
        parts: [
          {
            text: "⚠️ Sorry, I'm currently having trouble responding. Please try again later.",
          },
        ],
      };
      setHistory((prev) => [...prev, errorResponse]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isTyping]);

  return (
    <div className="App">
      {/* Chat icon button - only visible when chat is closed */}
      {!isOpen && (
        <button
          className="chat-icon-button"
          aria-label="Open chat"
          onClick={() => setIsOpen(true)}
        >
          <img src={chatIcon} alt="Chat" />
        </button>
      )}

      {/* Chat window - only visible when chat is open */}
      {isOpen && (
        <section
          className="chat-window"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-title"
        >
          <div className="chat-header">
            <h2 id="chat-title">Nion AI</h2>
            <button
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
            >
              <img src={closeIcon} alt="Close" />
            </button>
          </div>

          <div
            className="chat"
            role="log"
            aria-live="polite"
          >
            <div className="model">
              <p>Hi there! I'm Nion.  How can I help you today ?</p>
            </div>

            {history.map((entry, index) => (
              <div
                key={index}
                className={entry.role}
              >
                <p>{entry.parts[0].text}</p>
              </div>
            ))}

            {isTyping && (
              <div
                className="model typing-indicator"
                aria-live="assertive"
              >
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          <div className="input-area">
            <input
              type="text"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              aria-label="Message input"
            />
            <button
              onClick={handleSubmit}
              aria-label="Send message"
            >
              <img src={sendIcon} alt="Send" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
