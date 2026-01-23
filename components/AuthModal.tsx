
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck, MessageCircle } from 'lucide-react';

interface AuthModalProps {
  onLogin: (email: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggingIn(true);
      // Simulate network delay for that "Next.js Server Action" feel
      setTimeout(() => {
        onLogin(email);
        setIsLoggingIn(false);
      }, 800);
    }
  };

  const handleKakaoLogin = () => {
    setIsLoggingIn(true);
    // 실제 NextAuth에서는 signIn('kakao')를 호출하게 됩니다.
    console.log("NextAuth: Redirecting to Kakao OAuth...");
    setTimeout(() => {
      onLogin("kakao-user@kakao.com");
      setIsLoggingIn(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] dark:shadow-indigo-500/10 animate-in zoom-in-95 duration-500">
        <div className="p-8 md:p-12">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 rotate-3">
              <Sparkles className="text-white w-7 h-7" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">니코 AI 어시스턴트</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Next.js & Firebase 기반의 스마트 학습 환경</p>
          </div>

          <div className="space-y-3 mb-8">
            {/* Kakao Login Button - Kakao Brand Colors */}
            <button 
              onClick={handleKakaoLogin}
              disabled={isLoggingIn}
              className="w-full bg-[#FEE500] hover:bg-[#FADA0A] text-[#000000] text-opacity-85 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle size={20} fill="currentColor" />
              카카오톡으로 시작하기
            </button>
            
            <button className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 active:scale-[0.98]">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Google로 계속하기
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-4 text-slate-500 font-bold tracking-widest">OR</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-400"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-400"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 mt-6 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  처리 중...
                </div>
              ) : (
                <>
                  {isLogin ? '로그인' : '회원가입'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
            >
              {isLogin ? '처음이신가요? 계정 만들기' : '이미 계정이 있으신가요? 로그인'}
            </button>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <ShieldCheck size={12} />
              Enterprise-grade security
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
