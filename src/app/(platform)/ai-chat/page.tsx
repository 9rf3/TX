"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { chatSessions, suggestedPrompts } from "@/lib/mock-data";
import type { ChatMessage } from "@/lib/types";
import { Sparkles, Send, Plus, MessageSquare, Bot, User, Clock } from "lucide-react";
import { getTimeAgo } from "@/lib/utils";

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(chatSessions[0].messages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeSession, setActiveSession] = useState(chatSessions[0].id);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), content: input, role: "user", timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), role: "assistant", timestamp: new Date().toISOString(),
        content: "That's a great question! Let me explain...\n\nThis is a concept that many developers find tricky at first. The key thing to understand is that it works by creating a reference that persists across renders.\n\nHere's a simple example:\n\n```javascript\nconst result = processData(input);\nconsole.log(result);\n```\n\nWould you like me to elaborate further?",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-[280px] border-r border-border bg-surface/50 shrink-0">
        <div className="p-4 border-b border-border">
          <Button className="w-full" variant="ghost" size="sm">
            <Plus className="w-4 h-4" /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chatSessions.map((session) => (
            <button key={session.id}
              onClick={() => setActiveSession(session.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${activeSession === session.id ? "bg-primary/10 text-primary-light border border-primary/20" : "text-muted-light hover:bg-white/5 border border-transparent"}`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">{session.title}</span>
              </div>
              <div className="text-xs text-muted mt-0.5 ml-6 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {getTimeAgo(session.createdAt)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow">
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold">TWOKAX AI Assistant</h2>
                <p className="text-muted-light mt-1">I can help you learn anything. Ask me a question!</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {suggestedPrompts.map((prompt) => (
                  <button key={prompt} onClick={() => setInput(prompt)}
                    className="px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-muted-light hover:bg-primary/10 hover:border-primary/20 hover:text-primary-light transition-all cursor-pointer">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-gradient-to-br from-primary to-secondary" : "bg-white/10"}`}>
                {msg.role === "assistant" ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-muted-light" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-primary/20 border border-primary/30" : "glass"}`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className="text-[10px] text-muted mt-2">{getTimeAgo(msg.timestamp)}</div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="glass rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all"
            />
            <Button type="submit" disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
