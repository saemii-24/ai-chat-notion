export type NotionWordPayload = {
  word: string;
  meaning: string;
  example: string;
};

export type NotionWordBatchPayload = {
  words: NotionWordPayload[];
};

export type NotionSentencePayload = {
  sentence: string;
  meaning: string;
  key_phrases: string;
};

type NotionSaveResponse = {
  ok: boolean;
  error?: string;
};

const saveToNotion = async (
  token: string,
  databaseId: string,
  type: "word" | "sentence",
  data: NotionWordPayload | NotionWordBatchPayload | NotionSentencePayload,
): Promise<NotionSaveResponse> => {
  const response = await fetch("/api/notion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, databaseId, type, data }),
  });

  const payload = (await response.json()) as NotionSaveResponse;
  if (!response.ok || !payload.ok) {
    throw new Error(payload?.error || "Notion 저장 실패");
  }

  return payload;
};

export const NotionService = {
  saveWord: (token: string, databaseId: string, data: NotionWordPayload) =>
    saveToNotion(token, databaseId, "word", data),
  saveWords: (
    token: string,
    databaseId: string,
    data: NotionWordBatchPayload,
  ) => saveToNotion(token, databaseId, "word", data),
  saveSentence: (
    token: string,
    databaseId: string,
    data: NotionSentencePayload,
  ) => saveToNotion(token, databaseId, "sentence", data),
};
