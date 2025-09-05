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
    <Modal isOpen={isOpen} onClose={handleClose} title="캐릭터 시트 생성" className="max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Inputs */}
        <div className="space-y-6">
          <div>
            <label htmlFor="modelName" className="block text-sm font-medium text-gray-300 mb-1">모델 이름</label>
            <input type="text" id="modelName" value={modelName} onChange={(e) => setModelName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="modelDesc" className="block text-sm font-medium text-gray-300 mb-1">모델 설명 (선택)</label>
            <textarea id="modelDesc" rows={3} value={modelDesc} onChange={(e) => setModelDesc(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">캐릭터 시트 생성을 위한 참고 이미지 (최대 4개)</label>
            <div className="grid grid-cols-2 gap-4">
              {refPreviews.map((src, index) => (
                <img key={index} src={src} alt={`ref ${index}`} className="w-full h-32 object-cover rounded-md" />
              ))}
              {refImages.length < 4 && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:bg-gray-700">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <p className="text-sm text-gray-400">이미지 추가</p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">스타일</label>
            <div className="flex items-center gap-2">
                <button
                type="button"
                onClick={() => setColorMode('color')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-20 ${colorMode === 'color' ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                >
                컬러
                </button>
                <button
                type="button"
                onClick={() => setColorMode('bw')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-20 ${colorMode === 'bw' ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                >
                흑백
                </button>
            </div>
          </div>
          <Button onClick={handleGenerate} isLoading={isGenerating} disabled={isGenerating || !modelName || refImages.length === 0} className="w-full">
            {isGenerating ? '생성 중...' : (generatedSheet ? '다시 생성' : '생성')}
          </Button>
        </div>

        {/* Right Side: Character Sheet Generation */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-2">생성된 캐릭터 시트</h3>
          <div className="bg-gray-900 rounded-md flex-grow flex items-center justify-center p-4 min-h-[400px]">
            {isGenerating && (
                <div className="text-center">
                    <svg className="animate-spin mx-auto h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="mt-2 text-gray-300">캐릭터 시트를 생성 중입니다...</p>
                </div>
            )}
            {generatedSheet && <img src={generatedSheet} alt="Generated character sheet" className="max-w-full max-h-full object-contain rounded-md" />}
            {!isGenerating && !generatedSheet && <p className="text-gray-500 text-center">참고 이미지를 추가하고 '생성' 버튼을 누르면<br />여기에 캐릭터 시트(풀바디 2장, 바스트샷 3장)가 생성됩니다.</p>}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="secondary" onClick={handleClose}>취소</Button>
            <Button onClick={handleSave} disabled={!generatedSheet || isGenerating}>저장</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};