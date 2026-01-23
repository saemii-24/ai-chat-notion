
import { GoogleGenAI, GenerateContentResponse, Type, FunctionDeclaration } from "@google/genai";
import { Role, ChatMessage } from "../types";

const DEFAULT_MODEL = 'gemini-3-pro-preview';

const saveWordTool: FunctionDeclaration = {
  name: 'save_word_to_notion',
  parameters: {
    type: Type.OBJECT,
    description: '영단어 하나 또는 짧은 숙어의 뜻과 예문을 노션에 저장합니다.',
    properties: {
      word: { type: Type.STRING, description: '영어 단어나 숙어' },
      meaning: { type: Type.STRING, description: '한국어 뜻' },
      example: { type: Type.STRING, description: '영어 예문' },
    },
    required: ['word', 'meaning', 'example'],
  },
};

const saveSentenceTool: FunctionDeclaration = {
  name: 'save_sentence_to_notion',
  parameters: {
    type: Type.OBJECT,
    description: '완전한 영어 문장과 번역, 그리고 주요 문법 포인트를 노션에 저장합니다.',
    properties: {
      sentence: { type: Type.STRING, description: '영어 문장 전체' },
      meaning: { type: Type.STRING, description: '한국어 번역' },
      key_phrases: { type: Type.STRING, description: '문장에 사용된 주요 문법이나 관용구 설명' },
    },
    required: ['sentence', 'meaning', 'key_phrases'],
  },
};

export class GeminiService {
  static async *sendMessageStream(
    text: string, 
    history: ChatMessage[], 
    imageData?: { mimeType: string; data: string }
  ) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const formattedHistory = history.map(msg => ({
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: msg.parts.map(p => {
        if (p.inlineData) return { inlineData: p.inlineData };
        return { text: p.text };
      })
    }));

    const currentParts: any[] = [{ text }];
    if (imageData) currentParts.push({ inlineData: imageData });

    const config: any = {
      systemInstruction: `당신의 이름은 '니코(Niko)'입니다. 친절하고 똑똑한 언어 학습 비서입니다.
      사용자의 질문에 따라 다음 규칙을 따르세요:
      1. 단어나 짧은 숙어에 대해 물어보면 상세히 설명해주고 'save_word_to_notion' 도구를 호출하세요.
      2. 긴 문장이나 문법 구조에 대해 물어보면 구조를 분석해주고 'save_sentence_to_notion' 도구를 호출하세요.
      - 설명은 항상 한국어로 친절하게 진행하며, Markdown 형식을 사용하여 가독성 있게 작성하세요.
      - 학습에 도움이 되는 추가 팁이나 문화적 배경이 있다면 함께 알려주세요.`,
      tools: [{ functionDeclarations: [saveWordTool, saveSentenceTool] }]
    };

    const responseStream = await ai.models.generateContentStream({
      model: DEFAULT_MODEL,
      contents: [...formattedHistory, { role: 'user', parts: currentParts }],
      config
    });

    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      
      if (c.functionCalls && c.functionCalls.length > 0) {
        yield { functionCalls: c.functionCalls };
      }

      if (c.text) {
        yield {
          text: c.text
        };
      }
    }
  }
}
