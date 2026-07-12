import { useState, useRef, useEffect } from "react";
import { Send, Mic, Sparkles, Globe } from "lucide-react";
import { askGenie } from "../gemini";

const QUICK_PROMPTS = [
  { emoji: "🚪", text: "Which gate is less crowded?" },
  { emoji: "🚻", text: "Nearest accessible restroom?" },
  { emoji: "🍔", text: "Best food court near me?" },
  { emoji: "🩺", text: "Where is first aid?" },
  { emoji: "♿", text: "Wheelchair route to seats?" },
  { emoji: "🚇", text: "Best metro to take?" },
];

const WELCOME_MSG = {
  id: "welcome",
  role: "ai",
  text: "👋 Namaste! Hola! Welcome to StadiumGenie!\n\nI'm your AI guide for FIFA World Cup 2026 at Estadio Azteca. Ask me anything — in **any language** — about gates, restrooms, food, accessibility, transport, or match info.\n\n¡Pregúntame en español! हिंदी में पूछें! 中文也可以！",
  timestamp: new Date(),
};

export default function ChatInterface({ gates, accessibilityMode }) {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    const userMsg = { id: Date.now(), role: "user", text: userText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await askGenie(userText, gates);
      const aiMsg = { id: Date.now() + 1, role: "ai", text: response, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);

      // Text-to-speech if accessibility mode
      if (accessibilityMode && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: "ai",
        text: "⚠️ Sorry, I had trouble connecting. Please try again in a moment.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      {/* Language badge */}
      <div style={{ padding: "8px 16px 0" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,215,0,0.08)",
            border: "1px solid rgba(255,215,0,0.2)",
            borderRadius: "20px",
            padding: "4px 12px",
          }}
        >
          <Globe size={12} color="#FFD700" />
          <span style={{ fontSize: "10px", color: "#FFD700", fontWeight: 500 }}>
            Auto-detect · 50+ languages supported
          </span>
        </div>
      </div>

      {/* Quick prompts */}
      <div
        style={{
          padding: "10px 16px",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {QUICK_PROMPTS.map((qp, i) => (
          <button
            key={i}
            id={`quick-prompt-${i}`}
            onClick={() => sendMessage(qp.text)}
            style={{
              flexShrink: 0,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px",
              padding: "6px 12px",
              color: "#8888aa",
              fontSize: "11px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "rgba(0,165,80,0.4)";
              e.target.style.color = "#00c962";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.1)";
              e.target.style.color = "#8888aa";
            }}
          >
            {qp.emoji} {qp.text}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className="animate-fade-in-up"
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              animationDelay: `${i * 0.05}s`,
            }}
          >
            {msg.role === "ai" && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #00A550, #FFD700)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "8px",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                <Sparkles size={14} color="#fff" />
              </div>
            )}
            <div
              className={msg.role === "user" ? "bubble-fan" : "bubble-ai"}
              style={{
                padding: "10px 14px",
                maxWidth: "80%",
                fontSize: accessibilityMode ? "15px" : "13px",
                lineHeight: 1.6,
                color: msg.isError ? "#fc8181" : "#f0f0f8",
              }}
              dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
            />
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #00A550, #FFD700)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={14} color="#fff" />
            </div>
            <div
              className="bubble-ai"
              style={{ padding: "12px 16px", display: "flex", gap: "5px", alignItems: "center" }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="typing-dot"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#00c962",
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          gap: "10px",
          alignItems: "flex-end",
        }}
      >
        <textarea
          ref={inputRef}
          id="chat-input"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask in any language… e.g. 'Mera gate kahan hai?'"
          rows={1}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "14px",
            padding: "10px 14px",
            color: "#f0f0f8",
            fontSize: accessibilityMode ? "15px" : "13px",
            resize: "none",
            outline: "none",
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.5,
            transition: "border-color 0.2s",
            maxHeight: "120px",
            overflowY: "auto",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(0,165,80,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        <button
          id="send-btn"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            width: 42,
            height: 42,
            borderRadius: "12px",
            background: loading || !input.trim()
              ? "rgba(255,255,255,0.05)"
              : "linear-gradient(135deg, #00A550, #00c962)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
        >
          <Send size={16} color={loading || !input.trim() ? "#55556a" : "#fff"} />
        </button>
      </div>
    </div>
  );
}
