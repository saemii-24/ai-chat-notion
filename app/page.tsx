"use client";

import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatSession, ChatMessage, Role, NotionConfig } from "@/types";
import { GeminiService } from "@/services/geminiService";
import { CloudDBService, User } from "@/services/dbService";
import { isFirebaseConfigured } from "@/services/firebaseConfig";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessageItem from "@/components/ChatMessageItem";
import ChatInput from "@/components/ChatInput";
import AuthModal from "@/components/AuthModal";
import {
  Menu,
  Check,
  Cloud,
  Loader2,
  Share2,
  Shield,
  Sun,
  Moon,
} from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [notionConfig, setNotionConfig] = useState<NotionConfig>(() => {
    if (typeof window === "undefined")
      return { apiKey: "", wordDbId: "", sentenceDbId: "", enabled: false };
    const saved = localStorage.getItem("niko-notion-config-v1");
    return saved
      ? JSON.parse(saved)
      : { apiKey: "", wordDbId: "", sentenceDbId: "", enabled: false };
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("niko-theme");
    if (saved) return saved as "light" | "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<{ text: string }>({
    text: "",
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info";
  } | null>(null);

  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSidebarOpen(window.innerWidth >= 768);
  }, []);

  useEffect(() => {
    // Add a short-lived helper class so the CSS transition rules can animate
    // common visual properties (background, color, borders, shadows, svg fills)
    const el = document.documentElement;
    el.classList.add("theme-transition");

    if (theme === "dark") {
      el.classList.add("dark");
    } else {
      el.classList.remove("dark");
    }

    localStorage.setItem("niko-theme", theme);

    const t = window.setTimeout(() => {
      el.classList.remove("theme-transition");
    }, 300);

    return () => window.clearTimeout(t);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsAuthLoading(false);
      return;
    }
    const unsubscribe = CloudDBService.onAuthChange((currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (user && isFirebaseConfigured) {
        setIsSyncing(true);
        try {
          const cloudSessions = await CloudDBService.getAllSessions(user.id);
          setSessions(cloudSessions);
          if (cloudSessions.length > 0) {
            setActiveSessionId(cloudSessions[0].id);
          } else {
            handleNewChat();
          }
        } catch (err) {
          console.error("Firestore Load Error:", err);
          showToast("클라우드 데이터를 불러오지 못했습니다.");
        } finally {
          setIsSyncing(false);
        }
      }
    };
    loadData();
  }, [user]);

  useEffect(() => {
    localStorage.setItem("niko-notion-config-v1", JSON.stringify(notionConfig));
  }, [notionConfig]);

  const handleLogin = (email: string, provider?: "google" | "email") => {
    showToast(
      `${provider === "google" ? "구글" : "이메일"} 계정으로 로그인되었습니다.`,
      "success",
    );
  };

  const handleLogout = async () => {
    await CloudDBService.logout();
    setSessions([]);
    setActiveSessionId("");
    showToast("로그아웃 되었습니다.");
  };

  const showToast = (message: string, type: "success" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveToCloud = async (session: ChatSession) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await CloudDBService.saveSession(user.id, session);
    } finally {
      setIsSyncing(false);
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    setTimeout(
      () => scrollAnchorRef.current?.scrollIntoView({ behavior }),
      100,
    );
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: "새로운 대화",
      messages: [],
      lastUpdated: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const onSendMessage = async (
    text: string,
    imageData?: { mimeType: string; data: string },
  ) => {
    if (!text && !imageData) return;
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    if (!currentSession) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: Role.USER,
      parts: [{ text }, ...(imageData ? [{ inlineData: imageData }] : [])],
      timestamp: Date.now(),
    };

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      lastUpdated: Date.now(),
      title:
        currentSession.messages.length === 0
          ? text.slice(0, 30) || "이미지 분석"
          : currentSession.title,
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? updatedSession : s)),
    );
    await saveToCloud(updatedSession);

    setIsLoading(true);
    setCurrentResponse({ text: "" });
    scrollToBottom();

    try {
      const stream = GeminiService.sendMessageStream(
        text,
        updatedSession.messages,
        imageData,
      );

      console.log(stream);

      let fullResponseText = "";

      for await (const chunk of stream) {
        if (chunk.text) {
          fullResponseText += chunk.text;
          setCurrentResponse({ text: fullResponseText });
          scrollToBottom("auto");
        }
      }

      const modelMessage: ChatMessage = {
        id: uuidv4(),
        role: Role.MODEL,
        parts: [{ text: fullResponseText }],
        timestamp: Date.now(),
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, modelMessage],
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? finalSession : s)),
      );
      await saveToCloud(finalSession);
      setCurrentResponse({ text: "" });
    } catch (error) {
      console.error("Gemini Error:", error);
      showToast("메시지 전송에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          로그인을 확인하고 있습니다...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthModal onLogin={handleLogin} />;
  }

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {toast && (
        <div
          className={`fixed top-8 left-1/2 -translate-x-1/2 z-300 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-slate-900 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <Check size={16} />
          ) : (
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          )}
          <span className="text-sm font-bold tracking-tight">
            {toast.message}
          </span>
        </div>
      )}

      {isSidebarOpen && (
        <ChatSidebar
          user={user}
          sessions={sessions}
          activeSessionId={activeSessionId}
          notionConfig={notionConfig}
          onNewChat={handleNewChat}
          onSelectSession={setActiveSessionId}
          onDeleteSession={async (id) => {
            await CloudDBService.deleteSession(user.id, id);
            const newSessions = sessions.filter((s) => s.id !== id);
            setSessions(newSessions);
            if (activeSessionId === id && newSessions.length > 0)
              setActiveSessionId(newSessions[0].id);
            else if (newSessions.length === 0) handleNewChat();
          }}
          onUpdateNotion={setNotionConfig}
          onLogout={handleLogout}
          onClose={() => setIsSidebarOpen(false)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      <main className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
        <header className="h-16 border-b border-slate-100 dark:border-slate-900/50 flex items-center justify-between px-6 glass sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-500 md:hidden transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-37.5 md:max-w-md">
                {activeSession?.messages.length === 0
                  ? "새로운 대화"
                  : activeSession?.title}
              </h2>
              <div className="flex items-center gap-1.5">
                <Cloud
                  size={10}
                  className={
                    isSyncing
                      ? "text-indigo-500 animate-pulse"
                      : "text-emerald-500"
                  }
                />
                <span
                  className={`text-[9px] font-bold uppercase tracking-tighter ${isSyncing ? "text-indigo-500" : "text-emerald-500"}`}
                >
                  {isSyncing ? "Syncing..." : "Live"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95 border border-slate-200 dark:border-slate-800"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <Shield size={12} className="text-indigo-500" />
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                Next-Gen AI
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {activeSession?.messages.length === 0 && (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 bg-indigo-600/10 rounded-4xl flex items-center justify-center mb-8 border border-indigo-500/20 shadow-2xl">
                  <Share2 className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
                  어떤 도움을 드릴까요?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed">
                  니코(Niko)는 여러분의 영어 학습을 돕기 위해 설계된 AI 입니다.
                  사진 문제 풀이 부터 노션 필기까지 모든 것이 가능합니다.
                </p>
              </div>
            )}

            {activeSession?.messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}

            {currentResponse.text && (
              <ChatMessageItem
                message={{
                  id: "streaming",
                  role: Role.MODEL,
                  parts: [{ text: currentResponse.text }],
                  timestamp: Date.now(),
                }}
              />
            )}
            <div ref={scrollAnchorRef} className="h-10" />
          </div>
        </div>

        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
}
