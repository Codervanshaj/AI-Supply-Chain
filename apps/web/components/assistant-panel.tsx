"use client";

import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { Button, Card, CardDescription, CardTitle } from "@supplychain/ui";
import { queryAssistant } from "@/lib/api";

const quickPrompts = [
  "What should I reorder this week?",
  "Why are my delays increasing in the west region?",
  "Which supplier risk deserves immediate action?",
];

export function AssistantPanel() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "I can explain predictions, surface risks, summarize KPI movement, and recommend next actions across demand, inventory, suppliers, logistics, and maintenance.",
    },
  ]);
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(value: string) {
    if (!value.trim()) return;
    setSubmitting(true);
    setMessages((current) => [...current, { role: "user", content: value }]);
    setQuery("");
    try {
      const answer = await queryAssistant(value);
      setMessages((current) => [...current, { role: "assistant", content: answer }]);
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
            className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700"
            onClick={() => submit(prompt)}
            type="button"
          >
            {prompt}
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl bg-slate-50 p-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "assistant"
                ? "mr-8 rounded-3xl bg-white p-4 text-sm text-slate-700 shadow-sm"
                : "ml-8 rounded-3xl bg-slate-900 p-4 text-sm text-white"
            }
          >
            {message.content}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <textarea
          className="min-h-24 flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none ring-sky-200 transition focus:ring"
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

