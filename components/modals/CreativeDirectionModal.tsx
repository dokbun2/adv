import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Storyboard } from '../../types';
import * as geminiService from '../../services/geminiService';
import { Palette, Aperture, Film, Sparkles, BookOpen } from 'lucide-react';

interface CreativeDirectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyboard: Storyboard;
}

export const CreativeDirectionModal: React.FC<CreativeDirectionModalProps> = ({ isOpen, onClose, storyboard }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
        if (isOpen && storyboard && !summary) {
            setIsLoading(true);
            try {
                const result = await geminiService.generateStoryboardSummary(storyboard);
                setSummary(result);
            } catch (error) {
                console.error("Failed to generate summary:", error);
                setSummary("시나리오 요약 생성에 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        }
    };
    fetchSummary();
  }, [isOpen, storyboard, summary]);

  const { styleGuide } = storyboard;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="크리에이티브 디렉션" className="max-w-2xl">
      <div className="space-y-6 text-gray-300">
        <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-400"/>스타일 가이드</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg">
                <p className="flex items-start gap-2"><Aperture className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400"/><div><strong className="font-semibold text-white">아트 디렉션:</strong><br/>{styleGuide.artDirection}</div></p>
                <p className="flex items-start gap-2"><Palette className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400"/><div><strong className="font-semibold text-white">색상 팔레트:</strong><br/>{styleGuide.colorPalette}</div></p>
                <p className="flex items-start gap-2"><Film className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400"/><div><strong className="font-semibold text-white">편집 스타일:</strong><br/>{styleGuide.editingStyle}</div></p>
                <p className="flex items-start gap-2 sm:col-span-2"><strong className="font-semibold text-white">전체 톤앤무드:</strong> {styleGuide.overallToneAndMood}</p>
            </div>
        </div>
         <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-green-400"/>전체 시나리오 (AI 요약)</h3>
            <div className="bg-gray-900/50 p-4 rounded-lg min-h-[100px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </div>
                ) : (
                    <p className="text-sm leading-relaxed">{summary}</p>
                )}
            </div>
        </div>
      </div>
    </Modal>
  );
};