import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export type TaglineIssue = { original: string; problem: string; suggestion: string };
export type TaglineResult = { summary: string; issues: TaglineIssue[] };

export async function runTaglineCheck(canonical: string, copy: string): Promise<TaglineResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this app.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    messages: [
      {
        role: "system",
        content:
          "You are a brand copy editor. Compare the provided copy against the official tagline. Find every phrase that restates or paraphrases the tagline/positioning inconsistently (old taglines, different regions, different wording). Return ONLY json: {\"summary\": string, \"issues\": [{\"original\": exact phrase from the copy, \"problem\": short reason, \"suggestion\": aligned replacement}]}. Return an empty issues array if all is consistent. At most 20 issues.",
      },
      { role: "user", content: `Official tagline: ${canonical}\n\nCopy to review:\n${copy}` },
    ],
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  const text = await result.text;
  const match = text.match(/\{[\s\S]*\}/);
  try {
    const parsed = JSON.parse(match ? match[0] : text) as Partial<TaglineResult>;
    return {
      summary: String(parsed.summary ?? ""),
      issues: Array.isArray(parsed.issues) ? parsed.issues.slice(0, 20) : [],
    };
  } catch {
    return { summary: text.slice(0, 500), issues: [] };
  }
}
