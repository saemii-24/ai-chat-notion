
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChatMessage, Role } from '../types';
import { ExternalLink, Copy, Check } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[92%] md:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transition-colors ${
          isUser ? 'bg-indigo-600' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
        }`}>
          {isUser ? (
            <span className="text-xs font-bold text-white">나</span>
          ) : (
            <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
          )}
        </div>

        {/* Content */}
        <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3.5 rounded-2xl shadow-sm border transition-colors ${
            isUser 
              ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
          }`}>
            {message.parts.map((part, idx) => (
              <div key={idx} className="space-y-4">
                {part.inlineData && (
                  <div className="relative group">
                    <img 
                      src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} 
                      alt="첨부 이미지" 
                      className="max-w-sm rounded-xl mb-4 border border-slate-200 dark:border-white/10 shadow-lg transition-transform hover:scale-[1.02]"
                    />
                  </div>
                )}
                {part.text && (
                  <div className={`prose prose-slate max-w-none break-words text-sm md:text-base leading-relaxed ${isUser ? 'prose-invert' : 'dark:prose-invert'}`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <div className="relative group mt-4 mb-4">
                              <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                  onClick={() => copyToClipboard(String(children))}
                                  className="p-1.5 bg-slate-800/80 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                >
                                  {copied ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                              </div>
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                className="!bg-slate-950 !rounded-xl !border !border-slate-800 !p-4 !m-0"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className={`${isUser ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300'} px-1.5 py-0.5 rounded font-mono text-sm`} {...props}>
                              {children}
                            </code>
                          );
                        },
                        a: ({ children, href }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">
                            {children} <ExternalLink size={12} />
                          </a>
                        )
                      }}
                    >
                      {part.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-600 uppercase font-bold tracking-widest px-1">
            {new Date(message.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;
