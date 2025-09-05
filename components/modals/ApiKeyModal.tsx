import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Key, AlertCircle, Check } from 'lucide-react';
import apiKeyManager from '../../services/apiKeyManager';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentKey = apiKeyManager.getApiKey();
      if (currentKey) {
        setApiKey(currentKey);
      }
    }
  }, [isOpen]);

  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      // Basic validation - Gemini API keys typically start with 'AIza'
      if (!key || key.length < 30) {
        throw new Error('API 키가 너무 짧습니다.');
      }
      
      // Test the API key with a simple request
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
      );
      
      if (!response.ok) {
        if (response.status === 400 || response.status === 403) {
          throw new Error('유효하지 않은 API 키입니다.');
        }
        throw new Error('API 키 확인 중 오류가 발생했습니다.');
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    
    if (!apiKey.trim()) {
      setError('API 키를 입력해주세요.');
      return;
    }

    setIsValidating(true);
    
    try {
      await validateApiKey(apiKey);
      apiKeyManager.setApiKey(apiKey);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'API 키 설정 중 오류가 발생했습니다.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    apiKeyManager.clearApiKey();
    setApiKey('');
    setError(null);
    setSuccess(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Google Gemini API 키 설정" icon={Key} className="max-w-lg">
      <div className="space-y-5">
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-sm text-white/80">
              <p className="font-semibold mb-2 text-white">API 키를 얻는 방법:</p>
              <ol className="space-y-1.5 ml-2">
                <li className="flex items-start">
                  <span className="text-white/40 mr-2">1.</span>
                  <span>
                    <a 
                      href="https://aistudio.google.com/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline transition-colors"
                    >
                      Google AI Studio
                    </a>
                    <span className="text-white/60">에 접속합니다.</span>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-white/40 mr-2">2.</span>
                  <span className="text-white/60">Google 계정으로 로그인합니다.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white/40 mr-2">3.</span>
                  <span className="text-white/60">"Get API key" 버튼을 클릭합니다.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white/40 mr-2">4.</span>
                  <span className="text-white/60">생성된 API 키를 복사합니다.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/70">
            API 키
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="••••••••••••••••••••••••••••••••••••••••••••••"
            className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
          />
          {error && (
            <div className="text-red-400 text-sm flex items-center gap-2 mt-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-400 text-sm flex items-center gap-2 mt-2">
              <Check className="w-4 h-4" />
              API 키가 성공적으로 설정되었습니다!
            </div>
          )}
        </div>

        <div className="bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-lg p-4">
          <p className="text-xs text-yellow-200/80">
            <span className="font-semibold">보안 안내:</span> API 키는 브라우저의 로컬 스토리지에 저장되며, 서버로 전송되지 않습니다. 공용 컴퓨터에서는 사용 후 키를 삭제해주세요.
          </p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleClear}
            disabled={!apiKey || isValidating}
            className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
              !apiKey || isValidating
                ? 'bg-white/[0.02] text-white/30 cursor-not-allowed'
                : 'bg-white/[0.02] text-white/60 hover:bg-white/[0.04] hover:text-white/80 border border-white/[0.05]'
            }`}
          >
            키 삭제
          </button>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-medium bg-white/[0.02] text-white/60 hover:bg-white/[0.04] hover:text-white/80 border border-white/[0.05] transition-all"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim() || isValidating}
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition-all ${
                !apiKey.trim() || isValidating
                  ? 'bg-white/[0.02] text-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
              }`}
            >
              {isValidating ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  확인 중...
                </div>
              ) : '저장'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};