

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import * as geminiService from '../../services/geminiService';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  startFrame?: string;
  endFrame?: string;
  sceneDuration?: number;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, prompt, startFrame, endFrame, sceneDuration }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    try {
      // FIX: Add missing arguments `endFrame` and `sceneDuration` to the `generateVideo` call.
      // Also, check if all required arguments are provided before calling the service.
      if (!startFrame || !endFrame || sceneDuration === undefined) {
        setError("비디오 생성에 필요한 정보가 부족합니다.");
        setIsLoading(false);
        return;
      }
      const url = await geminiService.generateVideo(prompt, startFrame, endFrame, sceneDuration);
      setVideoUrl(url);
    } catch (err) {
      setError("비디오 생성에 실패했습니다. 다시 시도해주세요.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSave = async () => {
    if (!videoUrl) return;
    try {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'ai-ad-video.mp4';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (e) {
        console.error("Failed to download video:", e);
        alert("비디오 다운로드에 실패했습니다.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="영상 생성" className="max-w-4xl">
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        {isLoading && (
            <div className="text-center">
                <svg className="animate-spin mx-auto h-12 w-12 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="mt-4 text-gray-300">VEO-2로 영상을 생성 중입니다... (몇 분 정도 소요될 수 있습니다)</p>
            </div>
        )}
        {error && <p className="text-red-400">{error}</p>}
        {videoUrl && (
          <video src={videoUrl} controls autoPlay className="w-full h-full rounded-lg" />
        )}
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <Button variant="secondary" onClick={onClose}>닫기</Button>
        <Button onClick={generate} isLoading={isLoading} disabled={isLoading}>재생성</Button>
        <Button onClick={handleSave} disabled={!videoUrl || isLoading}>저장하기</Button>
      </div>
    </Modal>
  );
};
