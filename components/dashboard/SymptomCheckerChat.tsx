"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaterialIcon } from "@/components/ui/material-icon";

const SUGGESTIONS = ["Coughing", "Stomach Pain", "Skin Rash", "Vomiting"];

const INITIAL_MESSAGES = [
  {
    type: "ai" as const,
    content:
      "Hello. Please describe how you are feeling in simple words. I am here to help guide you to the right care.",
  },
  {
    type: "user" as const,
    content:
      "I have a very hot body, a bad headache, and I am feeling very tired for two days now.",
  },
  {
    type: "ai" as const,
    content:
      'Thank you for sharing. A "hot body" often means a fever. Given your headache and tiredness, this could be a common infection like malaria or a severe cold.',
    recommendation: {
      title: "General Outpatient Clinic",
      description:
        "Visit a clinic that can perform a rapid malaria test and check your temperature.",
    },
  },
];

export function SymptomCheckerChat() {
  const [messages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  function handleSend() {
    if (!input.trim() || sending) return;
    // MVP: just add to local state or show placeholder
    setInput("");
  }

  function handleSuggestion(s: string) {
    setInput((prev) => (prev ? `${prev}, ${s}` : s));
  }

  return (
    <div className="flex flex-col gap-6 max-w-[960px] w-full mx-auto">
      <div className="flex flex-wrap gap-2 items-center">
        <Link
          href="/dashboard/client"
          className="text-[#4c9a93] text-sm font-medium hover:underline"
        >
          Health Assistant
        </Link>
        <span className="text-[#4c9a93] text-sm">/</span>
        <span className="text-[#0d1b1a] dark:text-white/70 text-sm font-medium">
          Symptom Checker
        </span>
      </div>

      <div className="flex items-center justify-between px-4">
        <h2 className="text-[#0d1b1a] dark:text-white text-2xl font-bold">
          Symptom Analysis
        </h2>
        <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-[#4c9a93]">
          Logic v2.4 (Cached)
        </span>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-red-500 p-3 rounded-full text-white shrink-0">
            <MaterialIcon icon="warning" size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-red-700 dark:text-red-400 text-xl md:text-2xl font-black mb-1">
              EMERGENCY RED FLAGS
            </h1>
            <p className="text-red-600 dark:text-red-300 text-sm md:text-base">
              If you have chest pain, severe bleeding, or difficulty breathing, go
              to the nearest hospital immediately.
            </p>
          </div>
          <Link href="/dashboard/client">
            <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2">
              Nearby Emergency Units
              <MaterialIcon icon="arrow_forward_ios" size={16} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-6 bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-[#e7f3f2] dark:border-white/5">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.type === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {msg.type === "ai" ? (
              <div className="bg-primary/20 p-2 rounded-full shrink-0 flex items-center justify-center border border-primary/30">
                <MaterialIcon icon="smart_toy" size={24} className="text-primary" />
              </div>
            ) : (
              <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full shrink-0 flex items-center justify-center">
                <MaterialIcon icon="person" size={24} className="text-slate-600 dark:text-slate-300" />
              </div>
            )}
            <div
              className={`flex flex-1 flex-col gap-1 items-start ${
                msg.type === "user" ? "items-end" : ""
              }`}
            >
              <p className="text-[#4c9a93] text-xs font-semibold ml-1 mr-1">
                {msg.type === "ai" ? "AI Assistant" : "You"}
              </p>
              <div
                className={`text-base font-normal leading-relaxed max-w-[85%] rounded-xl px-4 py-3 ${
                  msg.type === "user"
                    ? "rounded-tr-none bg-primary text-[#0d1b1a] font-medium"
                    : "rounded-tl-none bg-[#e7f3f2] dark:bg-slate-800 text-[#0d1b1a] dark:text-white"
                }`}
              >
                {msg.content}
              </div>
              {"recommendation" in msg && msg.recommendation && (
                <div className="w-full md:w-[85%] bg-white dark:bg-slate-800 border-2 border-primary rounded-xl p-5 shadow-lg mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary text-[#0d1b1a] p-2 rounded-lg">
                      <MaterialIcon icon="local_hospital" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#0d1b1a] dark:text-white">
                        Recommended Clinic Type
                      </h3>
                      <p className="text-sm text-[#4c9a93]">Based on your symptoms</p>
                    </div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 mb-4">
                    <p className="text-[#0d1b1a] dark:text-white font-bold text-xl">
                      {msg.recommendation.title}
                    </p>
                    <p className="text-sm dark:text-white/70 mt-1">
                      {msg.recommendation.description}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/dashboard/client" className="flex-1">
                      <Button className="w-full bg-primary text-[#0d1b1a] font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                        <MaterialIcon icon="map" size={18} />
                        Find Nearest Clinic
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="px-4 border border-primary/30 rounded-lg text-primary hover:bg-primary/5"
                    >
                      <MaterialIcon icon="share" size={20} />
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

      <div className="px-4 pb-12">
        <Link href="/dashboard/client">
          <div className="max-w-[960px] mx-auto bg-slate-200 dark:bg-slate-800 rounded-2xl h-48 relative overflow-hidden group cursor-pointer border border-[#e7f3f2] dark:border-white/10 hover:opacity-90 transition-opacity">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-black/40 to-transparent">
              <MaterialIcon icon="location_on" size={48} className="mb-2 text-white" />
              <h3 className="text-white font-bold text-lg">Open Offline Clinic Map</h3>
              <p className="text-white/80 text-sm">3 clinics found near your current location</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
