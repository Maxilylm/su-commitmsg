"use client";

import { useState } from "react";

interface CommitMessage {
  type: string;
  subject: string;
  body: string;
}

const TYPE_COLORS: Record<string, string> = {
  feat: "bg-emerald-600",
  fix: "bg-red-500",
  refactor: "bg-blue-500",
  docs: "bg-yellow-500",
  style: "bg-purple-500",
  test: "bg-cyan-500",
  chore: "bg-zinc-500",
  perf: "bg-orange-500",
  ci: "bg-pink-500",
  build: "bg-amber-600",
};

export default function Home() {
  const [diff, setDiff] = useState("");
  const [messages, setMessages] = useState<CommitMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  async function generate() {
    if (!diff.trim()) return;
    setLoading(true);
    setError("");
    setMessages([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diff: diff.slice(0, 8000) }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setMessages(data.messages ?? []);
    } catch {
      setError("Failed to connect to the API");
    } finally {
      setLoading(false);
    }
  }

  function copyMessage(msg: CommitMessage, index: number) {
    const text = msg.body
      ? `${msg.type}: ${msg.subject}\n\n${msg.body}`
      : `${msg.type}: ${msg.subject}`;
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-1">CommitMsg</h1>
        <p className="text-zinc-400 mb-6">
          Paste a git diff, get conventional commit messages.
        </p>

        <textarea
          value={diff}
          onChange={(e) => setDiff(e.target.value)}
          placeholder="Paste your git diff here..."
          rows={12}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-4 font-mono text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 resize-y"
        />

        <div className="flex items-center justify-between mt-3 mb-6">
          <span className="text-xs text-zinc-500">
            {diff.length > 8000
              ? `Truncated to 8,000 / ${diff.length.toLocaleString()} chars`
              : `${diff.length.toLocaleString()} chars`}
          </span>
          <button
            onClick={generate}
            disabled={loading || !diff.trim()}
            className="px-5 py-2.5 rounded-lg bg-zinc-100 text-zinc-900 font-medium text-sm hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold text-white mr-2 ${TYPE_COLORS[msg.type] ?? "bg-zinc-600"}`}
                    >
                      {msg.type}
                    </span>
                    <span className="font-mono text-sm">
                      {msg.subject}
                    </span>
                    {msg.body && (
                      <p className="mt-2 text-sm text-zinc-400 font-mono whitespace-pre-wrap">
                        {msg.body}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => copyMessage(msg, i)}
                    className="shrink-0 px-3 py-1.5 rounded border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    {copied === i ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h2 className="text-sm font-semibold text-zinc-300 mb-2">
            How to use
          </h2>
          <p className="text-sm text-zinc-500 font-mono">
            git diff --staged | pbcopy
          </p>
          <p className="text-xs text-zinc-600 mt-2">
            Stage your changes, copy the diff, and paste it above. Pick the
            commit message that best describes your changes.
          </p>
        </div>
      </div>
    </div>
  );
}
