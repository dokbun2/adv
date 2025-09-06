import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Storyboard } from '../../types';
import * as geminiService from '../../services/geminiService';
import { Palette, Aperture, Film, Sparkles, BookOpen, Lightbulb, Zap, Eye, Music2 } from 'lucide-react';

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
    <Modal isOpen={isOpen} onClose={onClose} title="크리에이티브 디렉션" className="max-w-3xl">
      <div className="space-y-8">
        {/* 스타일 가이드 섹션 */}
        <div>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-blue-400"/>
                </div>
                <h3 className="text-lg font-semibold text-white">스타일 가이드</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {/* 아트 디렉션 */}
                <div className="group bg-gradient-to-r from-blue-500/5 to-purple-500/5 hover:from-blue-500/10 hover:to-purple-500/10 border border-white/[0.08] rounded-xl p-4 transition-all">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Eye className="w-4 h-4 text-blue-400"/>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">아트 디렉션</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">{styleGuide.artDirection}</p>
                        </div>
                    </div>
                </div>
                
                {/* 색상 팔레트 */}
                <div className="group bg-gradient-to-r from-purple-500/5 to-pink-500/5 hover:from-purple-500/10 hover:to-pink-500/10 border border-white/[0.08] rounded-xl p-4 transition-all">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Palette className="w-4 h-4 text-purple-400"/>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">색상 팔레트</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">{styleGuide.colorPalette}</p>
                        </div>
                    </div>
                </div>
                
                {/* 조명 스타일 */}
                <div className="group bg-gradient-to-r from-orange-500/5 to-yellow-500/5 hover:from-orange-500/10 hover:to-yellow-500/10 border border-white/[0.08] rounded-xl p-4 transition-all">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Lightbulb className="w-4 h-4 text-orange-400"/>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">조명 스타일</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">{styleGuide.lightingStyle}</p>
                        </div>
                    </div>
                </div>
                
                {/* 편집 스타일 */}
                <div className="group bg-gradient-to-r from-green-500/5 to-teal-500/5 hover:from-green-500/10 hover:to-teal-500/10 border border-white/[0.08] rounded-xl p-4 transition-all">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Film className="w-4 h-4 text-green-400"/>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">편집 스타일</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">{styleGuide.editingStyle}</p>
                        </div>
                    </div>
                </div>
                
                {/* 전체 톤앤무드 */}
                <div className="group bg-gradient-to-r from-indigo-500/5 to-blue-500/5 hover:from-indigo-500/10 hover:to-blue-500/10 border border-white/[0.08] rounded-xl p-4 transition-all">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Music2 className="w-4 h-4 text-indigo-400"/>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">전체 톤앤무드</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">{styleGuide.overallToneAndMood}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* 시나리오 요약 섹션 */}
        <div>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg">
                    <BookOpen className="w-5 h-5 text-green-400"/>
                </div>
                <h3 className="text-lg font-semibold text-white">전체 시나리오</h3>
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-medium">AI 요약</span>
            </div>
            <div className="bg-gradient-to-br from-green-500/5 to-teal-500/5 border border-white/[0.08] rounded-xl p-6 min-h-[120px] backdrop-blur-xl">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-4">
                        <div className="relative">
                            <div className="w-10 h-10 border-3 border-green-500/20 border-t-green-400 rounded-full animate-spin"></div>
                            <Zap className="w-4 h-4 text-green-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-sm text-gray-400">시나리오 분석 중...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
                        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.05]">
                            <div className="flex -space-x-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            </div>
                            <span className="text-xs text-gray-500">AI로 분석된 핵심 스토리라인</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </Modal>
  );
};