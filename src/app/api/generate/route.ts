import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { diff } = await req.json();

  if (!diff || typeof diff !== "string") {
    return NextResponse.json({ error: "diff is required" }, { status: 400 });
  }

  const truncated = diff.slice(0, 8000);

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY not configured" },
      { status: 500 }
    );
  }

  const systemPrompt = `You are a git commit message generator. Given a git diff, generate exactly 3 conventional commit message options. Each must follow the Conventional Commits spec.

Return ONLY valid JSON — no markdown, no code fences, no explanation. The format must be:
[
  {"type": "feat", "subject": "short description", "body": "optional longer description or empty string"},
  {"type": "fix", "subject": "short description", "body": ""},
  {"type": "refactor", "subject": "short description", "body": "optional body"}
]

Rules:
- type must be one of: feat, fix, refactor, docs, style, test, chore, perf, ci, build
- subject must be lowercase, imperative mood, max 72 chars, no period at end
- body is optional (use empty string if not needed), max 200 chars
- Each option should represent a different valid interpretation of the changes`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the git diff:\n\n${truncated}` },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `Groq API error: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "[]";

    // Parse JSON from response, handling potential markdown fences
    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const messages = JSON.parse(cleaned);
    return NextResponse.json({ messages });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
