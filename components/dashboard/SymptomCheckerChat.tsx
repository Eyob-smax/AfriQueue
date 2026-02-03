"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaterialIcon } from "@/components/ui/material-icon";
import { submitSymptomMessage } from "@/lib/actions/symptom-checker";

const SUGGESTIONS = ["Coughing", "Stomach Pain", "Skin Rash", "Vomiting"];

type ChatMessage = {
  type: "user" | "ai";
  content: string;
  recommendation?: { title: string; description: string };
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    type: "ai",
    content:
      "Hello. Please describe how you are feeling in simple words. I am here to help guide you to the right care.",
  },
];

export function SymptomCheckerChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const userMessage: ChatMessage = { type: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    const conversation = [...messages, userMessage].map((m) => ({
      role: m.type === "user" ? "user" : "assistant",
      content: m.content,
    }));

    const result = await submitSymptomMessage(conversation);

    if (result.error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: result.error || "Sorry, the assistant is temporarily unavailable. Please try again.",
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: result.content || "I'm not sure how to respond. Please describe your symptoms.",
          recommendation: result.recommendation,
        },
      ]);
    }
    setSending(false);
  }

  function handleSuggestion(s: string) {
    setInput((prev) => (prev ? `${prev}, ${s}` : s));
  }

  return (
    <div className="flex flex-col gap-2 max-w-[960px] w-full mx-auto">
      <div className="flex flex-wrap gap-1 items-center">
        <Link
          href="/dashboard/client"
          className="text-[#4c9a93] text-[10px] font-medium hover:underline"
        >
          Health Assistant
        </Link>
        <span className="text-[#4c9a93] text-[10px]">/</span>
        <span className="text-[#0d1b1a] dark:text-white/70 text-[10px] font-medium">
          Symptom Checker
        </span>
      </div>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-[#0d1b1a] dark:text-white text-sm font-bold">
          Symptom Analysis
        </h2>
        <span className="text-[9px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[#4c9a93]">
          AI Health Assistant
        </span>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-md overflow-hidden shadow-sm">
        <div className="p-2 flex flex-col md:flex-row items-center gap-2">
          <div className="bg-red-500 p-1.5 rounded-full text-white shrink-0">
            <MaterialIcon icon="warning" size={18} />
          </div>
          <div className="flex-1 text-center md:text-left min-w-0">
            <h1 className="text-red-700 dark:text-red-400 text-[11px] font-black leading-tight">
              EMERGENCY RED FLAGS
            </h1>
            <p className="text-red-600 dark:text-red-300 text-[10px] leading-tight">
              If you have chest pain, severe bleeding, or difficulty breathing, go
              to the nearest hospital immediately.
            </p>
          </div>
          <Link href="/dashboard/client">
            <Button className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-md font-semibold text-[10px] flex items-center gap-1 shrink-0">
              Nearby Emergency Units
              <MaterialIcon icon="arrow_forward_ios" size={12} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-[#e7f3f2] dark:border-white/5">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${
              msg.type === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {msg.type === "ai" ? (
              <div className="bg-primary/20 p-1.5 rounded-full shrink-0 flex items-center justify-center border border-primary/30">
                <MaterialIcon icon="smart_toy" size={20} className="text-primary" />
              </div>
            ) : (
              <div className="bg-slate-200 dark:bg-slate-700 p-1.5 rounded-full shrink-0 flex items-center justify-center">
                <MaterialIcon icon="person" size={20} className="text-slate-600 dark:text-slate-300" />
              </div>
            )}
            <div
              className={`flex flex-1 flex-col gap-0.5 items-start min-w-0 ${
                msg.type === "user" ? "items-end" : ""
              }`}
            >
              <p className="text-[#4c9a93] text-[10px] font-semibold ml-0.5 mr-0.5">
                {msg.type === "ai" ? "AI Assistant" : "You"}
              </p>
              <div
                className={`text-sm font-normal leading-snug max-w-[85%] rounded-lg px-3 py-2 ${
                  msg.type === "user"
                    ? "rounded-tr-none bg-primary text-[#0d1b1a] font-medium"
                    : "rounded-tl-none bg-[#e7f3f2] dark:bg-slate-800 text-[#0d1b1a] dark:text-white"
                }`}
              >
                {msg.content}
              </div>
              {"recommendation" in msg && msg.recommendation && (
                <div className="w-full md:w-[85%] bg-white dark:bg-slate-800 border border-primary rounded-lg p-3 shadow mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-primary text-[#0d1b1a] p-1.5 rounded">
                      <MaterialIcon icon="local_hospital" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#0d1b1a] dark:text-white">
                        Recommended Clinic Type
                      </h3>
                      <p className="text-xs text-[#4c9a93]">Based on your symptoms</p>
                    </div>
                  </div>
                  <div className="bg-primary/10 rounded p-2 mb-2">
                    <p className="text-[#0d1b1a] dark:text-white font-bold text-sm">
                      {msg.recommendation.title}
                    </p>
                    <p className="text-xs dark:text-white/70 mt-0.5">
                      {msg.recommendation.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/dashboard/client" className="flex-1">
                      <Button className="w-full bg-primary text-[#0d1b1a] font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5">
                        <MaterialIcon icon="map" size={14} />
                        Find Nearest Clinic
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="px-2 py-2 border border-primary/30 rounded text-primary hover:bg-primary/5"
                    >
                      <MaterialIcon icon="share" size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-[#e7f3f2] dark:border-white/10 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Input
            className="flex-1 bg-background-light dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm"
            placeholder="Type more symptoms here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="bg-primary text-[#0d1b1a] h-11 px-6 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
          >
            <span>Send</span>
            <MaterialIcon icon="send" size={18} />
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs text-[#4c9a93] font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
            Suggestions:
          </span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="text-xs px-3 py-1 bg-white dark:bg-slate-800 border border-[#e7f3f2] dark:border-white/10 rounded-full hover:border-primary transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 px-4 py-6 border-t border-[#e7f3f2] dark:border-white/10">
        <div className="flex gap-4 items-start opacity-70">
          <MaterialIcon icon="info" size={24} className="text-[#4c9a93] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs leading-relaxed text-[#4c9a93] dark:text-white/60">
              <span className="font-bold">Medical Disclaimer:</span> This AI tool
              provides general guidance based on simplified medical data and is not a
              professional medical diagnosis. It is intended for use in low-resource
              environments to help prioritize care. If you feel very sick, always
              seek professional medical help immediately. Your data is stored locally
              on this device.
            </p>
          </div>
        </div>
      </div>

      <div className="px-2 pb-6">
        <Link href="/dashboard/client">
          <div className="max-w-[960px] mx-auto bg-slate-200 dark:bg-slate-800 rounded-xl h-32 relative overflow-hidden group cursor-pointer border border-[#e7f3f2] dark:border-white/10 hover:opacity-90 transition-opacity">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-gradient-to-t from-black/40 to-transparent">
              <MaterialIcon icon="location_on" size={32} className="mb-1 text-white" />
              <h3 className="text-white font-bold text-sm">Open Offline Clinic Map</h3>
              <p className="text-white/80 text-xs">3 clinics found near your current location</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
