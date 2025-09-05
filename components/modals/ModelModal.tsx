import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Model } from '../../types';
import * as geminiService from '../../services/geminiService';

interface ModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (model: Model) => void;
}

export const ModelModal: React.FC<ModelModalProps> = ({ isOpen, onClose, onSave }) => {
  const [modelName, setModelName] = useState('');
  const [modelDesc, setModelDesc] = useState('');
  const [refImages, setRefImages] = useState<File[]>([]);
  const [refPreviews, setRefPreviews] = useState<string[]>([]);
  const [colorMode, setColorMode] = useState<'color' | 'bw'>('color');
  const [generatedSheet, setGeneratedSheet] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files).slice(0, 4 - refImages.length);
      const newImages = [...refImages, ...files];
      setRefImages(newImages);

      const newPreviews: string[] = [...refPreviews];
      // FIX: Explicitly type 'file' as 'File' to resolve a potential type inference issue
      // that causes the 'Argument of type 'unknown' is not assignable to parameter of type 'Blob'' error.
      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === newImages.length) {
            setRefPreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const handleGenerate = async () => {
      if (!modelName || refImages.length === 0) {
          alert("모델 이름과 최소 1개의 참고 이미지가 필요합니다.");
          return;
      }
      setIsGenerating(true);
      setGeneratedSheet(null);
      try {
          const sheetUrl = await geminiService.generateModelSheet(modelName, modelDesc, refImages, colorMode);
          setGeneratedSheet(sheetUrl);
      } catch (error) {
          console.error("Failed to generate model sheet:", error);
          alert("캐릭터 시트 생성에 실패했습니다.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleSave = () => {
    if (modelName && generatedSheet) {
      onSave({ name: modelName, description: modelDesc, sheetImage: generatedSheet });
      onClose();
      // Reset state
      setModelName('');
      setModelDesc('');
      setRefImages([]);
      setRefPreviews([]);
      setGeneratedSheet(null);
    }
  };
  
  const handleClose = () => {
    // Reset state on close
    setModelName('');
    setModelDesc('');
    setRefImages([]);
    setRefPreviews([]);
    setGeneratedSheet(null);
    setIsGenerating(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="캐릭터 시트 생성" className="max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Inputs */}
        <div className="space-y-6">
          <div>
            <label htmlFor="modelName" className="block text-sm font-medium text-white/70 mb-2">모델 이름</label>
            <input 
              type="text" 
              id="modelName" 
              value={modelName} 
              onChange={(e) => setModelName(e.target.value)} 
              className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all" 
              placeholder="모델 이름을 입력하세요"
            />
          </div>
          <div>
            <label htmlFor="modelDesc" className="block text-sm font-medium text-white/70 mb-2">모델 설명 (선택)</label>
            <textarea 
              id="modelDesc" 
              rows={3} 
              value={modelDesc} 
              onChange={(e) => setModelDesc(e.target.value)} 
              className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all resize-none"
              placeholder="모델에 대한 설명을 입력하세요"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">캐릭터 시트 생성을 위한 참고 이미지 (최대 4개)</label>
            <div className="grid grid-cols-2 gap-4">
              {refPreviews.map((src, index) => (
                <div key={index} className="relative group">
                  <img src={src} alt={`ref ${index}`} className="w-full h-32 object-cover rounded-lg border border-white/[0.05]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
              {refImages.length < 4 && (
                <label className="flex flex-col items-center justify-center w-full h-32 bg-white/[0.02] backdrop-blur-xl border-2 border-white/[0.05] border-dashed rounded-lg cursor-pointer hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-8 h-8 mb-2 text-white/30 group-hover:text-white/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <p className="text-sm text-white/30 group-hover:text-white/50 transition-colors">이미지 추가</p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">스타일</label>
            <div className="flex items-center gap-2">
                <button
                type="button"
                onClick={() => setColorMode('color')}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  colorMode === 'color' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'bg-white/[0.02] text-white/60 hover:bg-white/[0.04] hover:text-white/80 border border-white/[0.05]'
                }`}
                >
                컬러
                </button>
                <button
                type="button"
                onClick={() => setColorMode('bw')}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  colorMode === 'bw' 
                    ? 'bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-lg shadow-gray-600/25' 
                    : 'bg-white/[0.02] text-white/60 hover:bg-white/[0.04] hover:text-white/80 border border-white/[0.05]'
                }`}
                >
                흑백
                </button>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !modelName || refImages.length === 0}
            className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all ${
              isGenerating || !modelName || refImages.length === 0
                ? 'bg-white/[0.02] text-white/30 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                생성 중...
              </div>
            ) : (generatedSheet ? '다시 생성' : '생성')}
          </button>
        </div>

        {/* Right Side: Character Sheet Generation */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-3">생성된 캐릭터 시트</h3>
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-xl flex-grow flex items-center justify-center p-6 min-h-[400px]">
            {isGenerating && (
                <div className="text-center">
                    <svg className="animate-spin mx-auto h-10 w-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-3 text-white/60">캐릭터 시트를 생성 중입니다...</p>
                    <p className="mt-1 text-white/40 text-sm">잠시만 기다려주세요</p>
                </div>
            )}
            {generatedSheet && (
              <img src={generatedSheet} alt="Generated character sheet" className="max-w-full max-h-full object-contain rounded-lg" />
            )}
            {!isGenerating && !generatedSheet && (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-white/[0.03] flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white/60 font-medium">캐릭터 시트 생성 준비</p>
                  <p className="text-white/40 text-sm mt-2">
                    참고 이미지를 업로드한 후 '생성' 버튼을 클릭하세요
                  </p>
                  <p className="text-white/30 text-xs mt-1">
                    정면 • 후면 • 좌측 • 정면 • 우측 (5개 뷰)
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-lg font-medium bg-white/[0.02] text-white/60 hover:bg-white/[0.04] hover:text-white/80 border border-white/[0.05] transition-all"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!generatedSheet || isGenerating}
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition-all ${
                !generatedSheet || isGenerating
                  ? 'bg-white/[0.02] text-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25'
              }`}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};