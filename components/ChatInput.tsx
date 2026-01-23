
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Paperclip, Loader2, Camera } from 'lucide-react';
import CameraModal from './CameraModal';

interface ChatInputProps {
  onSendMessage: (text: string, imageData?: { mimeType: string; data: string }) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ mimeType: string; data: string } | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if ((text.trim() || imageData) && !isLoading) {
      onSendMessage(text.trim(), imageData || undefined);
      setText('');
      setPreviewImage(null);
      setImageData(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        const base64Data = result.split(',')[1];
        setImageData({
          mimeType: file.type,
          data: base64Data
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (capturedImage: { mimeType: string; data: string }) => {
    setImageData(capturedImage);
    setPreviewImage(`data:${capturedImage.mimeType};base64,${capturedImage.data}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass border-t border-slate-200 dark:border-slate-900/50 p-4 sticky bottom-0 z-20 transition-colors duration-300">
      {isCameraOpen && (
        <CameraModal 
          onCapture={handleCameraCapture} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}

      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        {/* Attachment Previews */}
        {previewImage && (
          <div className="relative group inline-block w-20 h-20 animate-in zoom-in duration-200">
            <img 
              src={previewImage} 
              alt="미리보기" 
              className="w-full h-full object-cover rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-xl" 
            />
            <button
              onClick={() => { setPreviewImage(null); setImageData(null); }}
              className="absolute -top-2 -right-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-full p-1 border border-slate-200 dark:border-slate-700 hover:bg-red-500 hover:text-white transition-colors shadow-md"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="relative flex items-end gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-lg dark:shadow-2xl">
          <div className="flex items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              title="이미지 첨부"
            >
              <Paperclip size={20} />
            </button>
            <button
              onClick={() => setIsCameraOpen(true)}
              className="p-2.5 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              title="사진 촬영"
            >
              <Camera size={20} />
            </button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="니코에게 무엇이든 물어보세요..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 resize-none py-2.5 max-h-48 text-base transition-colors"
            rows={1}
            disabled={isLoading}
          />
          
          <button
            onClick={handleSend}
            disabled={(!text.trim() && !imageData) || isLoading}
            className={`p-3 rounded-xl transition-all shadow-lg ${
              (!text.trim() && !imageData) || isLoading
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-indigo-600/20'
            }`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
          AI-Powered Niko Assistant
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
