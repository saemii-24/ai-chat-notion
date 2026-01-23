
import React from 'react';
import { ChatSession, NotionConfig } from '../types';
import NotionSettings from './NotionSettings';
import { Plus, MessageSquare, Trash2, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';
import { User } from '../services/dbService';

interface ChatSidebarProps {
  user: User;
  sessions: ChatSession[];
  activeSessionId: string;
  notionConfig: NotionConfig;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onUpdateNotion: (config: NotionConfig) => void;
  onLogout: () => void;
  onClose?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  user,
  sessions,
  activeSessionId,
  notionConfig,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onUpdateNotion,
  onLogout,
  onClose,
  theme,
  onToggleTheme,
}) => {
  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] md:hidden"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 flex flex-col z-[50] md:relative md:z-0 animate-in slide-in-from-left duration-300 transition-colors duration-300">
        {/* User Profile */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <UserIcon size={20} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-500 truncate">{user.email}</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-slate-500 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/5 rounded-lg border border-slate-200 dark:border-slate-800 transition-all uppercase tracking-widest"
          >
            <LogOut size={12} />
            로그아웃
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose?.();
            }}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 transition-all font-semibold text-sm shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
          >
            <Plus size={18} />
            새 대화 시작하기
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <h3 className="px-3 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">
            나의 클라우드 대화록
          </h3>
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => {
                onSelectSession(session.id);
                if (window.innerWidth < 768) onClose?.();
              }}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                activeSessionId === session.id
                  ? 'bg-indigo-50 dark:bg-slate-900 text-indigo-700 dark:text-slate-100'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <MessageSquare size={16} className={activeSessionId === session.id ? 'text-indigo-600 dark:text-indigo-400' : ''} />
              <span className="truncate text-sm font-medium flex-1">{session.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-500 transition-all rounded-lg"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <NotionSettings config={notionConfig} onSave={onUpdateNotion} />

        <div className="p-6 border-t border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/50 flex flex-col items-center gap-4 transition-colors duration-300">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-700 uppercase tracking-widest">
            Niko Cloud Sync v1.1
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
