import { NextResponse } from "next/server";

const NOTION_VERSION = "2022-06-28";

type NotionRequestBody = {
  token?: string;
  databaseId?: string;
  type?: "word" | "sentence";
  data?: Record<string, string>;
};

type NotionWordPayload = {
  word: string;
  meaning: string;
  example: string;
};

const buildProperties = (
  type: "word" | "sentence",
  data: Record<string, string>,
) => {
  if (type === "word") {
    return {
      Word: { title: [{ text: { content: data.word || "" } }] },
      Meaning: { rich_text: [{ text: { content: data.meaning || "" } }] },
      Example: { rich_text: [{ text: { content: data.example || "" } }] },
    };
  }

  return {
    Sentence: { title: [{ text: { content: data.sentence || "" } }] },
    Meaning: { rich_text: [{ text: { content: data.meaning || "" } }] },
    "Key Phrases": {
      rich_text: [{ text: { content: data.key_phrases || "" } }],
    },
  };
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as NotionRequestBody;
    const token = body.token?.trim();
    const databaseId = body.databaseId?.trim();
    const type = body.type;
    const data = body.data || {};

    if (!token || !databaseId || !type) {
      return NextResponse.json(
        { ok: false, error: "Missing token, databaseId, or type." },
        { status: 400 },
      );
    }

    const makeRequest = async (payload: Record<string, string>) => {
      const notionResponse = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties: buildProperties(type, payload),
        }),
      });

      if (!notionResponse.ok) {
        const errText = await notionResponse.text();
        throw new Error(errText || "Notion API error");
      }
    };

    if (type === "word" && Array.isArray((data as any).words)) {
      const words = (data as any).words as NotionWordPayload[];
      for (const word of words) {
        await makeRequest({
          word: word.word || "",
          meaning: word.meaning || "",
          example: word.example || "",
        });
      }
    } else {
      await makeRequest(data);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Unexpected error" },
      { status: 500 },
    );
  }
}

type WordItem = {
  word: string;
  meaning: string;
  example: string;
};

function getPlainText(arr?: { plain_text: string }[]) {
  if (!arr || arr.length === 0) return "";
  return arr.map((t) => t.plain_text).join("");
}

export function parseNotionWords(results: any[]): WordItem[] {
  return results
    .map((page) => {
      const props = page.properties;

      const word = getPlainText(props.word?.title);
      const meaning = getPlainText(props.meaning?.rich_text);
      const example = getPlainText(props.example?.rich_text);

      if (!word) return null;

      return { word, meaning, example };
    })
    .filter(Boolean) as WordItem[];
}

export async function GET() {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DB_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 100,
        filter: {
          property: "status",
          status: { equals: "학습 중" },
        },
      }),
    },
  );

  const data = await res.json();
  const words = parseNotionWords(data.results);

  return Response.json(words);
}
