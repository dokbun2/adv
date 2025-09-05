import React from 'react';
import { Modal } from '../ui/Modal';
import { Lightbulb, Users, Palmtree, CheckCircle, XCircle } from 'lucide-react';

export const PromptGuideModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="효과적인 프롬프트 작성 가이드" className="max-w-3xl">
      <div className="space-y-6 text-gray-300">
        <p className="text-gray-400">
          AI가 여러분의 비전을 정확히 이해하고 최상의 결과물을 만들 수 있도록, 광고 컨셉을 구체적이고 명확하게 전달하는 것이 중요합니다. 아래 가이드를 참고하여 프롬프트를 작성해보세요.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-gray-700 p-2 rounded-full mt-1">
              <Lightbulb className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h4 className="font-semibold text-white">1. 핵심 컨셉을 명확히 하세요</h4>
              <p className="text-gray-400 text-sm">어떤 제품을, 누구에게, 무엇을 강조하여 광고하고 싶나요? 광고의 목표를 한 문장으로 정의해보세요.</p>
              <p className="mt-2 text-sm bg-gray-700/50 p-2 rounded-md border border-gray-600">
                <strong>예시:</strong> "20대 여성을 위한 비건 수분 크림의 피부 진정 효과를 강조하는 광고"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-gray-700 p-2 rounded-full mt-1">
              <Users className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h4 className="font-semibold text-white">2. 원하는 분위기와 톤을 지정하세요</h4>
              <p className="text-gray-400 text-sm">광고의 전체적인 느낌을 설명해주세요. 형용사를 사용하면 좋습니다.</p>
              <p className="mt-2 text-sm bg-gray-700/50 p-2 rounded-md border border-gray-600">
                <strong>예시:</strong> "따뜻하고 감성적인", "세련되고 도시적인", "유쾌하고 활기찬"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-gray-700 p-2 rounded-full mt-1">
              <Palmtree className="w-5 h-5 text-green-300" />
            </div>
            <div>
              <h4 className="font-semibold text-white">3. 시각적 스타일을 구체화하세요</h4>
              <p className="text-gray-400 text-sm">특정 시대, 장소, 색감, 촬영 기법 등을 언급하면 AI가 더 구체적인 이미지를 그릴 수 있습니다.</p>
              <p className="mt-2 text-sm bg-gray-700/50 p-2 rounded-md border border-gray-600">
                <strong>예시:</strong> "1980년대 레트로 필름 감성", "미래적인 사이버펑크 스타일", "자연광을 활용한 부드러운 파스텔톤"
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-2">좋은 프롬프트 vs. 아쉬운 프롬프트</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-900/30 border border-green-500/50 p-4 rounded-lg">
              <h5 className="font-semibold text-green-300 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> 좋은 예시</h5>
              <p className="mt-2 text-sm text-gray-300">
                "바쁜 아침, 30대 직장인 여성이 새로 나온 에너지 드링크를 마시고 활력을 얻는 모습을 세련되고 빠른 템포의 영상으로 보여줘. 도시적인 배경에 경쾌한 음악을 사용하고, 제품의 상쾌함을 시각적으로 강조해줘."
              </p>
            </div>
            <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-lg">
              <h5 className="font-semibold text-red-300 flex items-center gap-2"><XCircle className="w-5 h-5"/> 아쉬운 예시</h5>
              <p className="mt-2 text-sm text-gray-300">
                "음료수 광고"
              </p>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};
