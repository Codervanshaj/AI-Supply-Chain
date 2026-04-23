"use client";

import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { Badge, Button, Card, CardDescription, CardTitle } from "@supplychain/ui";
import { queryAssistant } from "@/lib/api";

const quickPrompts = [
  "What should I reorder this week?",
  "Why are my delays increasing in the west region?",
  "Which supplier risk deserves immediate action?",
];

export function AssistantPanel() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string; mode?: string }[]
  >([
    {
      role: "assistant",
      content:
        "I can explain predictions, surface risks, summarize KPI movement, and recommend next actions across demand, inventory, suppliers, logistics, and maintenance.",
      mode: "system",
    },
  ]);
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(value: string) {
    if (!value.trim()) return;
    setSubmitting(true);
    setError(null);
    setMessages((current) => [...current, { role: "user", content: value }]);
    setQuery("");
    try {
      const result = await queryAssistant(value);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.answer, mode: result.mode },
      ]);
    } catch {
      setError("The assistant could not reach the live API. Check NEXT_PUBLIC_API_BASE_URL, Railway API health, and OPENAI_API_KEY.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="flex h-full min-h-[540px] flex-col">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI operations copilot
          </CardTitle>
          <CardDescription>
            Grounded in your current forecasts, inventory positions, supplier metrics, and logistics signals.
          </CardDescription>
        </div>
        <Sparkles className="h-5 w-5 text-sky-500" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            className="rounded-full bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 ring-1 ring-white/8"
            onClick={() => submit(prompt)}
            type="button"
          >
            {prompt}
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl bg-[rgba(4,9,18,0.62)] p-4 ring-1 ring-white/8">
        {error ? (
          <div className="rounded-3xl border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "assistant"
                ? "mr-8 rounded-3xl border border-white/8 bg-white/5 p-4 text-sm text-slate-200 shadow-sm"
                : "ml-8 rounded-3xl bg-cyan-400 p-4 text-sm text-slate-950"
            }
          >
            {message.role === "assistant" && message.mode ? (
              <div className="mb-2">
                <Badge variant={message.mode === "openai" ? "success" : message.mode === "fallback" ? "warning" : "info"}>
                  {message.mode === "openai" ? "Live OpenAI" : message.mode === "fallback" ? "Fallback Mode" : "System"}
                </Badge>
              </div>
            ) : null}
            {message.content}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <textarea
          className="min-h-24 flex-1 rounded-3xl border border-white/8 bg-white/5 px-4 py-3 text-white outline-none ring-cyan-400/20 transition placeholder:text-slate-500 focus:ring"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ask for explanations, trends, or action recommendations..."
          value={query}
        />
        <Button className="self-end" disabled={submitting} onClick={() => submit(query)}>
          {submitting ? "Thinking..." : "Send"}
        </Button>
      </div>
    </Card>
  );
}
