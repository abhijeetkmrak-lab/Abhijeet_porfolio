"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

// ── Thinking Dots Animation ───────────────────────────────────────────────────
const ThinkingDots = () => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="block w-2 h-2 rounded-full bg-purple-400"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.15,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// ── Suggested Questions ───────────────────────────────────────────────────────
const SUGGESTIONS = [
  "What is Abhijeet's background?",
  "What tools does he use?",
  "Tell me about his AI projects",
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ── API call ──────────────────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text.trim() }),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const data = await res.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.answer || "I'm sorry, I couldn't process that request.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content:
          "Sorry, I couldn't connect to the server. Please make sure the backend is running.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* ── Floating Trigger Bubble ──────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            {/* Instagram-style Glowing Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-4px] rounded-full opacity-80"
              style={{
                background: "conic-gradient(from 0deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #f09433)",
                filter: "blur(2px)",
              }}
            />

            <motion.button
              id="chatbot-trigger"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer bg-[#0a0a0e] border-2 border-[#0a0a0e] overflow-visible"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #2dd4bf 100%)",
              }}
            >
              <MessageCircle className="w-6 h-6 text-white" />

              {/* Notification Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-[#0a0a0e]"
              >
                <span className="text-[10px] font-bold text-white">1</span>
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat Window ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-window"
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] flex flex-col rounded-2xl overflow-hidden border border-white/10"
            style={{
              background: "rgba(10, 10, 14, 0.85)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow:
                "0 0 60px rgba(124, 58, 237, 0.15), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* ── Header ───────────────────────────────────────────────── */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(45, 212, 191, 0.1))",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #7c3aed, #2dd4bf)",
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  {/* Online indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a0a0e]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white leading-tight">
                    Abhijeet&apos;s AI Assistant
                  </h3>
                  <p className="text-xs text-emerald-400/80">Online</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* ── Messages Area ────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
              {/* Welcome message when empty */}
              {messages.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center text-center py-6"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(45, 212, 191, 0.2))",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Sparkles className="w-7 h-7 text-purple-400" />
                  </div>
                  <h4 className="text-white font-medium text-sm mb-1">
                    Hi! I&apos;m Abhijeet&apos;s AI Assistant
                  </h4>
                  <p className="text-gray-500 text-xs leading-relaxed max-w-[250px]">
                    Ask me anything about his experience, skills, projects, or
                    professional background.
                  </p>

                  {/* Suggested questions */}
                  <div className="flex flex-col gap-2 mt-5 w-full">
                    {SUGGESTIONS.map((q) => (
                      <motion.button
                        key={q}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => sendMessage(q)}
                        className="text-left px-3.5 py-2.5 rounded-xl text-xs text-gray-300 border border-white/8 hover:border-purple-500/30 hover:bg-white/5 transition-all cursor-pointer"
                      >
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Message bubbles */}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-purple-600/80 to-teal-500/60 text-white rounded-br-md"
                        : "bg-white/[0.06] text-gray-200 border border-white/[0.06] rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/[0.06] border border-white/[0.06] rounded-2xl rounded-bl-md">
                    <ThinkingDots />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ───────────────────────────────────────────── */}
            <form
              onSubmit={handleSubmit}
              className="px-4 py-3 border-t border-white/10 shrink-0"
            >
              <div className="flex items-center gap-2 bg-white/[0.06] rounded-xl px-3 py-1.5 border border-white/[0.06] focus-within:border-purple-500/40 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Abhijeet..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none py-1.5 disabled:opacity-50"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-30 transition-all cursor-pointer"
                  style={{
                    background:
                      input.trim() && !isLoading
                        ? "linear-gradient(135deg, #7c3aed, #2dd4bf)"
                        : "transparent",
                  }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
