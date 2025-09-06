import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Scene, Storyboard } from '../../types';
import * as geminiService from '../../services/geminiService';
import { Wand2, Save, X, RotateCcw, Sparkles } from 'lucide-react';

interface SceneEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: Scene | null;
  storyboard: Storyboard | null;
  onSave: (scene: Scene) => void;
}

export const SceneEditorModal: React.FC<SceneEditorModalProps> = ({ isOpen, onClose, scene, storyboard, onSave }) => {
  const [editRequest, setEditRequest] = useState('');
  const [newDescription, setNewDescription] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setEditRequest('');
        setNewDescription(null);
        setNewTitle(null);
        setIsGenerating(false);
        setIsSuggesting(false);
    }
  }, [isOpen]);

  if (!scene) return null;

  const handleGenerate = async () => {
    if (!editRequest) {
      alert("수정 내용을 입력해주세요.");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await geminiService.rewriteScene(scene, editRequest);
      setNewTitle(result.title);
      setNewDescription(result.description);
    } catch (error) {
      console.error("Failed to rewrite scene:", error);
      alert("씬 재구성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggest = async () => {
      if (!scene || !storyboard) return;
      setIsSuggesting(true);
      try {
          const currentIndex = storyboard.scenes.findIndex(s => s.id === scene.id);
          const previousScene = currentIndex > 0 ? storyboard.scenes[currentIndex - 1] : null;
          const nextScene = currentIndex < storyboard.scenes.length - 1 ? storyboard.scenes[currentIndex + 1] : null;
          
          const suggestion = await geminiService.generateSceneRewriteSuggestion(previousScene, scene, nextScene);
          setEditRequest(suggestion);
      } catch (error) {
          console.error("Failed to get scene rewrite suggestion:", error);
          alert("AI 제안 생성에 실패했습니다.");
      } finally {
          setIsSuggesting(false);
      }
  };
  
  const handleSave = () => {
    if (newTitle && newDescription) {
        onSave({ ...scene, title: newTitle, description: newDescription });
        handleClose();
    }
  };

  const handleClose = () => {
    setEditRequest('');
    setNewDescription(null);
    setNewTitle(null);
    setIsGenerating(false);
    setIsSuggesting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`장면 ${scene.id} 수정`} className="max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Original and Edit Request */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-white mb-2">기존 시나리오</h3>
            <div className="bg-gray-700 p-3 rounded-md text-gray-300 max-h-48 overflow-y-auto">
                <p className="font-bold">{scene.title}</p>
                <p className="text-sm mt-1">{scene.description}</p>
            </div>
          </div>
          <div>
            <label htmlFor="editRequest" className="font-semibold text-white mb-2 block">수정 내용</label>
            <textarea
              id="editRequest"
              value={editRequest}
              onChange={(e) => setEditRequest(e.target.value)}
              placeholder="예: 더 밝고 경쾌한 분위기로 변경, 시각적 효과 강화"
              rows={8}
              className="w-full bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
            <div className="flex gap-2 mt-2">
              <Button onClick={handleSuggest} disabled={isSuggesting} variant="secondary" className="flex-1">
                {isSuggesting ? (
                  <>
                    <div className="inline-block w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    제안 생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI 제안
                  </>
                )}
              </Button>
              <Button onClick={handleGenerate} disabled={!editRequest || isGenerating} className="flex-1">
                {isGenerating ? (
                  <>
                    <div className="inline-block w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    생성 중...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    씬 재구성
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-white mb-2">수정된 시나리오</h3>
            {newTitle && newDescription ? (
              <div className="bg-green-900/30 p-3 rounded-md text-green-300 border border-green-600/30 max-h-80 overflow-y-auto">
                <p className="font-bold">{newTitle}</p>
                <p className="text-sm mt-1">{newDescription}</p>
              </div>
            ) : (
              <div className="bg-gray-700 p-3 rounded-md text-gray-500 h-80 flex items-center justify-center">
                <p className="text-center">수정 내용을 입력하고 '씬 재구성' 버튼을 눌러주세요.</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleClose} variant="secondary" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
            <Button onClick={handleSave} disabled={!newTitle || !newDescription} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};