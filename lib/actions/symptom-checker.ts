"use server";

import { getSessionUser } from "@/lib/auth-session";
import { getHealthAssistantReply, type HealthAssistantMessage } from "@/lib/groq-health-assistant";

const RECOMMENDATION_REGEX = /RECOMMENDATION:\s*(.+?)\s*–\s*(.+)$/im;

export type SymptomMessage = { role: string; content: string };

export type SubmitSymptomResult = {
  content: string;
  error?: string;
  recommendation?: { title: string; description: string };
};

export async function submitSymptomMessage(
  messages: SymptomMessage[]
): Promise<SubmitSymptomResult> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return { content: "", error: "Please sign in to use the health assistant." };
  }

  if (!messages.length) {
    return { content: "", error: "No messages to send." };
  }
  const last = messages[messages.length - 1];
  if (last.role !== "user") {
    return { content: "", error: "Last message must be from the user." };
  }
  if (messages.length > 20) {
    return { content: "", error: "Too many messages. Start a new conversation." };
  }

  const groqMessages: HealthAssistantMessage[] = messages.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: String(m.content || "").trim(),
  }));

  try {
    let content = await getHealthAssistantReply(groqMessages);
    let recommendation: { title: string; description: string } | undefined;

    const match = content.match(RECOMMENDATION_REGEX);
    if (match) {
      recommendation = {
        title: match[1].trim(),
        description: match[2].trim(),
      };
      content = content.replace(RECOMMENDATION_REGEX, "").trim();
    }

    return { content, recommendation };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isConfig = /not configured|missing/i.test(message);
    return {
      content: "",
      error: isConfig
        ? "Assistant is not configured. Please add GROQ_API_KEY and AI_MODEL to your environment."
        : "The assistant is temporarily unavailable. Please try again.",
    };
  }
}
