import { useState, useRef, useEffect, useCallback } from "react";
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
  const [callMode, setCallMode] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  // Refs mirror latest state so the recognition/speech callbacks
  // (created once) never see stale closures.
  const callModeRef = useRef(false);
  const loadingRef = useRef(false);
  const speakingRef = useRef(false);
  const inputRef = useRef("");
  const sendMessageRef = useRef(() => {});

  const speechRecognitionSupported =
    typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const speechSynthesisSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    callModeRef.current = callMode;
  }, [callMode]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  // ── Voice input (speech-to-text) ────────────────────────────────
  const startListening = useCallback(() => {
    if (!recognitionRef.current || loadingRef.current || speakingRef.current) return;
    try {
      setInput("");
      recognitionRef.current.start();
      setListening(true);
    } catch {
      // start() throws if already running — safe to ignore
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setListening(false);
  }, []);

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

    recognition.onend = () => {
      setListening(false);

      if (!callModeRef.current) return;

      const text = inputRef.current.trim();

      if (text) {
        sendMessageRef.current(text);
      } else {
        // Silence — try listening again shortly, as long as we're
        // still in call mode and nothing else is happening.
        restartTimeoutRef.current = setTimeout(() => {
          if (callModeRef.current && !loadingRef.current && !speakingRef.current) {
            startListening();
          }
        }, 700);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      clearTimeout(restartTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startListening]);

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // ── Voice output (text-to-speech) ───────────────────────────────
  const speak = useCallback(
    (text, onDone) => {
      if (!speechSynthesisSupported) {
        onDone?.();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        onDone?.();
      };
      utterance.onerror = () => {
        setSpeaking(false);
        onDone?.();
      };
      window.speechSynthesis.speak(utterance);
    },
    [speechSynthesisSupported]
  );

  // ── Sending a message (typed or spoken) ─────────────────────────
  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || loadingRef.current) return;

      stopListening();
      clearTimeout(restartTimeoutRef.current);

      setMessages((prev) => {
        const next = [...prev, { role: "user", text: trimmed }];

        setInput("");
        setLoading(true);

        const history = next
          .filter((m) => m !== GREETING)
          .map((m) => ({ role: m.role, text: m.text }));

        sendChatMessage(trimmed, history)
          .then((data) => {
            const replyText = data.success
              ? data.reply
              : data.message || "Something went wrong. Please try again.";

            setMessages((p) => [...p, { role: "assistant", text: replyText }]);

            if (voiceOn || callModeRef.current) {
              speak(replyText, () => {
                if (callModeRef.current) startListening();
              });
            }
          })
          .catch(() => {
            const errText = "I couldn't reach the server. Please check your connection and try again.";
            setMessages((p) => [...p, { role: "assistant", text: errText }]);

            if (voiceOn || callModeRef.current) {
              speak(errText, () => {
                if (callModeRef.current) startListening();
              });
            }
          })
          .finally(() => setLoading(false));

        return next;
      });
    },
    [voiceOn, speak, startListening, stopListening]
  );

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // ── Call mode (hands-free) ──────────────────────────────────────
  const toggleCallMode = () => {
    if (callMode) {
      setCallMode(false);
      window.speechSynthesis?.cancel();
      stopListening();
      clearTimeout(restartTimeoutRef.current);
    } else {
      setCallMode(true);
      setOpen(true);
      startListening();
    }
  };

  useEffect(() => {
    // Stop everything if the panel is closed mid-call
    if (!open && callMode) {
      setCallMode(false);
      window.speechSynthesis?.cancel();
      stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  let callStatus = "";
  if (callMode) {
    if (speaking) callStatus = "🔊 Speaking...";
    else if (loading) callStatus = "💭 Thinking...";
    else if (listening) callStatus = "🎙️ Listening...";
    else callStatus = "Call active";
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[92vw] max-w-sm h-[28rem] bg-paper border border-border rounded-2xl shadow-dropdown flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-paper px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-display font-semibold text-sm">Selam — Marqato Assistant</p>
              <p className="text-xs text-primaryLight/90">
                {callMode ? callStatus : "AI-powered · usually replies instantly"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {speechRecognitionSupported && speechSynthesisSupported && (
                <button
                  onClick={toggleCallMode}
                  aria-label={callMode ? "End voice call" : "Start voice call"}
                  title={callMode ? "End voice call" : "Start hands-free voice call"}
                  className={`text-paper/80 hover:text-paper transition-colors ${
                    callMode ? "text-paper animate-pulse" : ""
                  }`}
                >
                  {callMode ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path
                        d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45c.85.3 1.75.49 2.68.57a2 2 0 011.85 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 011 4.18 2 2 0 013 2h3a2 2 0 012 1.72c.08.93.27 1.83.57 2.68a2 2 0 01-.45 2.11L6.85 9.78"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M23 1L1 23" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path
                        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.97.36 1.92.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.89.34 1.84.57 2.81.7A2 2 0 0122 16.92z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              )}
              {speechSynthesisSupported && !callMode && (
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

          {/* Call mode banner */}
          {callMode && (
            <div className="px-3 py-2 bg-primaryLight border-t border-border flex items-center justify-between">
              <span className="text-xs font-medium text-primaryDark">{callStatus}</span>
              <button
                onClick={toggleCallMode}
                className="text-xs font-semibold text-danger hover:underline"
              >
                End call
              </button>
            </div>
          )}

          {/* Input (hidden during hands-free call) */}
          {!callMode && (
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
          )}
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