import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import "../src/index.css";
import sendIcon from "./assets/send-white.png";
import info from "./info.js"; // Import the structured data

// Initialize GoogleGenAI with API key
const genAI = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
});

function App() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", parts: [{ text: message }] };

    setHistory((prev) => [...prev, userMessage]);
    setMessage("");

    // Try responding from local info.js
    const localResponse = handleInformationRequest(message);

    if (localResponse) {
      const modelResponse = {
        role: "model",
        parts: [{ text: localResponse }],
      };
      setHistory((prev) => [...prev, modelResponse]);
      return;
    }

    // If no local answer, pass info.js as context to Gemini
    try {
      const chat = await genAI.chats.create({
        model: "gemini-2.0-flash",
        history: [
          {
            role: "user",
            parts: [
              {
                text: `You are a helpful assistant that answers questions based on this data about the School of Purpose:\n\n${JSON.stringify(
                  info,
                  null,
                  2
                )}\n\nUser's question: ${message}`,
              },
            ],
          },
        ],
      });

      const result = await chat.sendMessage({ message });

      const modelResponse = {
        role: "model",
        parts: [{ text: result.text }],
      };

      setHistory((prev) => [...prev, modelResponse]);
    } catch (error) {
      console.error("Error:", error);

      const errorResponse = {
        role: "model",
        parts: [
          {
            text:
              "⚠️ Sorry, I'm currently having trouble responding. Please try again later.",
          },
        ],
      };

      setHistory((prev) => [...prev, errorResponse]);
    }
  };

  // Check for structured data response in info.js
  const handleInformationRequest = (msg) => {
    const lowerMsg = msg.toLowerCase();

    for (const item of info.faq) {
      if (lowerMsg.includes(item.question.toLowerCase())) {
        return item.answer;
      }
    }

    if (lowerMsg.includes("purpose academy")) {
      return info.programs?.purposeAcademy?.description;
    }

    if (lowerMsg.includes("creative academy")) {
      return info.creativeAcademy?.description;
    }

    if (
      lowerMsg.includes("enroll") ||
      lowerMsg.includes("register") ||
      lowerMsg.includes("cohort")
    ) {
      return `${info.enrollmentInfo?.announcement} ${info.enrollmentInfo?.deadline} Register here: ${info.enrollmentInfo?.registrationLink}`;
    }

    if (lowerMsg.includes("contact")) {
      return `You can reach us at ${info.contact?.email} or call us at ${info.contact?.phone}`;
    }

    if (lowerMsg.includes("founder") || lowerMsg.includes("who started")) {
      return `The School of Purpose was founded by ${info.founder?.name}, also known as ${info.founder?.alias}. She is a ${info.founder?.role}.`;
    }

    if (lowerMsg.includes("values")) {
      return `Our core values are: ${info.values?.join(", ")}`;
    }

    return null;
  };

  return (
    <div className="App">
      <section className="chat-window">
        <button className="close">Close</button>
        <div className="chat">
          <div className="model">
            <p>Hi there! I'm Gemini. What would you like to know about the School of Purpose?</p>
          </div>

          {history.map((entry, index) => (
            <div key={index} className={entry.role}>
              <p>{entry.parts[0].text}</p>
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={handleSubmit}>
            <img src={sendIcon} alt="Send" />
          </button>
        </div>
      </section>
    </div>
  );
}

export default App;
