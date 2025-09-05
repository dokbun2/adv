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
    <Modal isOpen={isOpen} onClose={onClose} title="Google Gemini API 키 설정" icon={Key}>
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">API 키를 얻는 방법:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>
                  <a 
                    href="https://aistudio.google.com/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-900"
                  >
                    Google AI Studio
                  </a>
                  에 접속합니다.
                </li>
                <li>Google 계정으로 로그인합니다.</li>
                <li>"Get API key" 버튼을 클릭합니다.</li>
                <li>생성된 API 키를 복사합니다.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            API 키
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {error && (
            <div className="text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              API 키가 성공적으로 설정되었습니다!
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <span className="font-semibold">보안 안내:</span> API 키는 브라우저의 로컬 스토리지에 저장되며, 
            서버로 전송되지 않습니다. 공용 컴퓨터에서는 사용 후 키를 삭제해주세요.
          </p>
        </div>

        <div className="flex justify-between">
          <Button
            onClick={handleClear}
            variant="ghost"
            disabled={!apiKey || isValidating}
          >
            키 삭제
          </Button>
          <div className="flex gap-2">
            <Button onClick={onClose} variant="ghost">
              취소
            </Button>
            <Button 
              onClick={handleSave} 
              variant="primary"
              isLoading={isValidating}
              disabled={!apiKey.trim()}
            >
              {isValidating ? '확인 중...' : '저장'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};