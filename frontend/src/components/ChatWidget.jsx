import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../api";

const GREETING = {
  role: "assistant",
  text: "Selam! 👋 I'm Selam, Marqato's shopping assistant. Ask me about products, prices, stock, or how payment and delivery work.",
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  const speechRecognitionSupported =
    typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const speechSynthesisSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  // ── Voice input (speech-to-text) ────────────────────────────────
  useEffect(() => {
    if (!speechRecognitionSupported) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    return () => recognition.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setListening(true);
    }
  };

  // ── Voice output (text-to-speech) ───────────────────────────────
  const speak = (text) => {
    if (!speechSynthesisSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!voiceOn) return;
    const last = messages[messages.length - 1];
    if (last && last.role === "assistant" && last !== GREETING) {
      speak(last.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, voiceOn]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }

    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history = nextMessages
        .filter((m) => m !== GREETING)
        .map((m) => ({ role: m.role, text: m.text }));

      const data = await sendChatMessage(text, history);

      if (data.success) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.message || "Something went wrong. Please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "I couldn't reach the server. Please check your connection and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[92vw] max-w-sm h-[28rem] bg-paper border border-border rounded-2xl shadow-dropdown flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-paper px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-display font-semibold text-sm">Selam — Marqato Assistant</p>
              <p className="text-xs text-primaryLight/90">AI-powered · usually replies instantly</p>
            </div>
            <div className="flex items-center gap-2">
              {speechSynthesisSupported && (
                <button
                  onClick={() => {
                    setVoiceOn((v) => !v);
                    window.speechSynthesis.cancel();
                  }}
                  aria-label={voiceOn ? "Turn off voice replies" : "Turn on voice replies"}
                  title={voiceOn ? "Voice replies: on" : "Voice replies: off"}
                  className={`text-paper/80 hover:text-paper transition-colors ${voiceOn ? "text-paper" : ""}`}
                >
                  {voiceOn ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M15.5 8.5a5 5 0 010 7M19 5a9 9 0 010 14" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M23 9l-6 6M17 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="text-paper/80 hover:text-paper transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-paper2">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap flex items-end gap-1.5 ${
                    m.role === "user"
                      ? "bg-primary text-paper rounded-br-sm"
                      : "bg-surface text-ink border border-border rounded-bl-sm"
                  }`}
                >
                  <span>{m.text}</span>
                  {m.role === "assistant" && speechSynthesisSupported && (
                    <button
                      onClick={() => speak(m.text)}
                      aria-label="Read this reply aloud"
                      title="Read aloud"
                      className="shrink-0 text-stone hover:text-primary transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15.5 8.5a5 5 0 010 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface border border-border rounded-xl rounded-bl-sm px-3 py-2 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-stone animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-stone animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t border-border p-2 flex gap-2 bg-paper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening..." : "Ask about a product, price, or order..."}
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-border bg-paper2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              disabled={loading}
            />
            {speechRecognitionSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                aria-label={listening ? "Stop recording" : "Speak your question"}
                title={listening ? "Stop recording" : "Speak your question"}
                className={`px-3 rounded-xl border transition-colors disabled:opacity-40 ${
                  listening
                    ? "bg-danger text-paper border-danger animate-pulse"
                    : "bg-paper2 text-stone border-border hover:text-primary hover:border-primary"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="2" width="6" height="12" rx="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 10a7 7 0 0014 0M12 19v3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-primary text-paper px-3 rounded-xl disabled:opacity-40 hover:bg-primaryDark transition-colors"
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className="w-14 h-14 rounded-full bg-primary text-paper shadow-cardHover flex items-center justify-center hover:bg-primaryDark transition-colors"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;