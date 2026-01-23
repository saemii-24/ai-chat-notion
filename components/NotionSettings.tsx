
import React, { useState } from 'react';
import { NotionConfig } from '../types';
import { Settings, Save, CheckCircle2, Book, Type as TextIcon, Key } from 'lucide-react';

interface NotionSettingsProps {
  config: NotionConfig;
  onSave: (config: NotionConfig) => void;
}

const NotionSettings: React.FC<NotionSettingsProps> = ({ config, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    onSave(localConfig);
    setIsOpen(false);
  };

  return (
    <div className="p-4 border-t border-slate-900">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
          config.enabled ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' : 'text-slate-500 hover:bg-slate-900 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
          <Settings size={14} />
          노션 이중 동기화 설정
        </div>
        {config.enabled ? <CheckCircle2 size={14} className="animate-pulse" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1.5 block flex items-center gap-1">
              <Key size={10} /> 노션 통합 토큰 (Integration Token)
            </label>
            <input 
              type="password" 
              value={localConfig.apiKey}
              onChange={(e) => setLocalConfig({...localConfig, apiKey: e.target.value})}
              placeholder="secret_..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
            <p className="text-[9px] text-slate-600 mt-1">developers.notion.com에서 발급받으세요.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-[10px] text-indigo-400 uppercase font-bold mb-1.5 block flex items-center gap-1">
                <TextIcon size={10} /> 단어장 DB ID
              </label>
              <input 
                type="text" 
                value={localConfig.wordDbId}
                onChange={(e) => setLocalConfig({...localConfig, wordDbId: e.target.value})}
                placeholder="단어 저장용 데이터베이스 ID"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-emerald-400 uppercase font-bold mb-1.5 block flex items-center gap-1">
                <Book size={10} /> 문장/문법 DB ID
              </label>
              <input 
                type="text" 
                value={localConfig.sentenceDbId}
                onChange={(e) => setLocalConfig({...localConfig, sentenceDbId: e.target.value})}
                placeholder="문장 분석용 데이터베이스 ID"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button 
              onClick={() => setLocalConfig({...localConfig, enabled: !localConfig.enabled})}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all shadow-lg ${
                localConfig.enabled ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {localConfig.enabled ? '동기화 활성화됨' : '동기화 비활성화됨'}
            </button>
            <button 
              onClick={handleSave}
              className="p-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-white transition-all active:scale-95"
              title="설정 저장"
            >
              <Save size={16} />
            </button>
          </div>
          
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
             <p className="text-[9px] text-slate-500 leading-relaxed">
              <strong>필수 속성 구성:</strong><br/>
              - <strong>단어 DB:</strong> Word(제목), Meaning(텍스트), Example(텍스트)<br/>
              - <strong>문장 DB:</strong> Sentence(제목), Meaning(텍스트), Key Phrases(텍스트)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotionSettings;
