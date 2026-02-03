/**
 * Groq-powered health assistant. Server-only; do not import from client.
 * Uses GROQ_API_KEY and AI_MODEL from env. Strict health-only system prompt.
 */

import Groq from "groq-sdk";

const HEALTH_ONLY_SYSTEM_PROMPT = `You are the ArifQueue health assistant. You help users with symptom guidance and care prioritization in low-resource settings.

STRICT RULES:
- Answer ONLY health- and symptom-related questions (symptoms, when to seek care, which clinic type might be appropriate).
- REFUSE non-health topics (general knowledge, coding, entertainment, etc.) with a short, polite message: "I can only help with health and symptom questions. Please describe how you're feeling or ask a health-related question."
- Do NOT give a definitive medical diagnosis. Give only general guidance and when to see a doctor or go to emergency.
- Encourage professional care when symptoms are serious or unclear.
- Keep responses concise (short paragraphs) for the app UI.
- If your reply suggests a clinic type, end with exactly one line: RECOMMENDATION: [Clinic type] – [one sentence description]. Example: RECOMMENDATION: General Outpatient Clinic – Visit a clinic that can perform a rapid malaria test and check your temperature.`;

const MAX_MESSAGES = 20;

export type HealthAssistantMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function getHealthAssistantReply(
  messages: HealthAssistantMessage[]
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.AI_MODEL;
  if (!apiKey || !model) {
    throw new Error("Assistant not configured: GROQ_API_KEY or AI_MODEL missing.");
  }

  const client = new Groq({ apiKey });
  const trimmed = messages.slice(-MAX_MESSAGES);
  const groqMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: HEALTH_ONLY_SYSTEM_PROMPT },
    ...trimmed.map((m) => ({ role: m.role, content: m.content })),
  ];

  const completion = await client.chat.completions.create({
    model,
    messages: groqMessages,
    max_tokens: 512,
    temperature: 0.4,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (content == null) {
    throw new Error("Assistant returned no reply.");
  }
  return content;
}
