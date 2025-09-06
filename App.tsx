import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Scene, Model, Product, Storyboard, StyleGuide, OtherAIModel, AdaptedPrompts, EditingImageInfo } from './types';
import * as geminiService from './services/geminiService';
import apiKeyManager from './services/apiKeyManager';
import { ModelModal } from './components/modals/ModelModal';
import { ProductModal } from './components/modals/ProductModal';
import { CreativeDirectionModal } from './components/modals/CreativeDirectionModal';
import { ImageEditorModal } from './components/modals/ImageEditorModal';
import { PromptGuideModal } from './components/modals/PromptGuideModal';
import { ApiKeyModal } from './components/modals/ApiKeyModal';
import { SceneEditorModal } from './components/modals/SceneEditorModal';
import { Button } from './components/ui/Button';
import { Accordion } from './components/ui/Accordion';
import { Film, Users, Package, Link, ArrowRight, Info, Clipboard, Check, Sparkles, BookOpen, Wand2, Languages, Bot, Download, Music, Key, Settings, PlayCircle, ChevronRight, Zap, Layers, Cpu, ChevronDown, RotateCcw, X, Video, FileText, UploadCloud, RectangleHorizontal, Square, Smartphone } from 'lucide-react';
import JSZip from 'jszip';

const Header = ({ onGenerate, isLoading, isApiKeySet, onOpenApiKey }: { 
    onGenerate: () => void, 
    isLoading: boolean,
    isApiKeySet: boolean,
    onOpenApiKey: () => void
}) => (
    <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/[0.08]">
        <div className="px-4 py-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50"></div>
                        <div className="relative bg-black p-2.5 rounded-xl border border-white/10">
                            <Film className="text-white h-6 w-6" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-white">AI Studio Pro</h1>
                        <p className="text-xs text-gray-400">영상 광고 제작 플랫폼</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onOpenApiKey}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            isApiKeySet 
                                ? 'bg-white/[0.05] text-gray-300 hover:bg-white/[0.08]' 
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                        } border border-white/[0.08]`}
                    >
                        <Key className="w-4 h-4 inline mr-2" />
                        {isApiKeySet ? 'API 설정' : 'API 키 설정'}
                    </button>
                    <button
                        onClick={onGenerate}
                        disabled={!isApiKeySet || isLoading}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                            isApiKeySet && !isLoading
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:scale-105'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <div className="inline-block w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                생성 중...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4 inline mr-2" />
                                생성하기
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    </header>
);

// 광고 입력 패널 (컨셉, 스토리, 영상 길이, 화면 비율)
const InputPanel = ({ 
    topic, setTopic, 
    story, setStory, 
    duration, setDuration, 
    onOpenGuide,
    aspectRatio, setAspectRatio
}: {
    topic: string, setTopic: (s: string) => void,
    story: string, setStory: (s: string) => void,
    duration: number, setDuration: (n: number) => void,
    onOpenGuide: () => void,
    aspectRatio: '16:9' | '1:1' | '9:16', setAspectRatio: (r: '16:9' | '1:1' | '9:16') => void
}) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    return (
    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] overflow-visible">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-blue-400" />
                광고 설정
            </h3>
        </div>
        <div className="space-y-4">
            <div className="relative">
                <label className="block text-xs font-medium text-gray-400 mb-2">광고 컨셉</label>
                <div className="relative">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="예: 비타 500 비타민 음료, 활력 에너지 드링크"
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-white/[0.05] transition-all outline-none"
                    />
                    <button 
                        onClick={onOpenGuide} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                        <Info className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="relative">
                <label className="block text-xs font-medium text-gray-400 mb-2">스토리</label>
                <textarea
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="예: 비타민 음료 비타 500을 먹고 활기를 찾는 여성"
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-white/[0.05] transition-all outline-none resize-none"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <label className="block text-xs font-medium text-gray-400 mb-2">영상 길이</label>
                    <div className="relative">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={duration}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d+$/.test(value)) {
                                    setDuration(value);
                                }
                            }}
                            placeholder="영상 길이 입력"
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:bg-white/[0.05] transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">초</span>
                    </div>
                </div>
                <div className="relative" ref={dropdownRef}>
                    <label className="block text-xs font-medium text-gray-400 mb-2">화면 비율</label>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!isDropdownOpen)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:bg-white/[0.05] transition-all outline-none flex justify-between items-center"
                    >
                        <span className="flex items-center gap-2">
                            <RectangleHorizontal className="w-4 h-4 text-gray-400" />
                            {aspectRatio}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 border border-white/[0.08] rounded-md shadow-lg z-50">
                            <button onClick={() => { setAspectRatio('16:9'); setDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/[0.05] flex items-center gap-2">
                                <RectangleHorizontal className="w-4 h-4" />
                                16:9 (가로형)
                            </button>
                            <button onClick={() => { setAspectRatio('1:1'); setDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/[0.05] flex items-center gap-2">
                                <Square className="w-4 h-4" />
                                1:1 (정사각형)
                            </button>
                            <button onClick={() => { setAspectRatio('9:16'); setDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/[0.05] flex items-center gap-2">
                                <Smartphone className="w-4 h-4" />
                                9:16 (세로형)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
};

// 모델 패널 (다중 모델 지원)
const ModelPanel = ({ models, onAddModel, onRemoveModel }: { 
    models: Model[], 
    onAddModel: () => void,
    onRemoveModel: (index: number) => void
}) => (
    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] h-full">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                모델
            </h3>
        </div>
        <div className="aspect-square bg-white/[0.03] border border-white/[0.08] rounded-lg overflow-y-auto p-2">
            {models.length > 0 ? (
                <div className="space-y-2">
                    {models.map((model, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-white/[0.02] rounded-lg border border-white/[0.05] relative group">
                            <img src={model.sheetImage} alt={model.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                            <div className="flex-grow min-w-0">
                                <p className="text-sm font-medium text-white truncate">{model.name}</p>
                                {model.description && (
                                    <p className="text-xs text-gray-400 truncate">{model.description}</p>
                                )}
                            </div>
                            <button 
                                onClick={() => onRemoveModel(index)} 
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">모델을 추가하세요</p>
                </div>
            )}
        </div>
        <button 
            onClick={onAddModel}
            disabled={models.length >= 4}
            className={`mt-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                models.length >= 4 
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:scale-[1.02]'
            }`}
        >
            <Users className="w-4 h-4 inline mr-1" />
            {models.length >= 4 ? '모델은 최대 4명' : '모델 추가'}
        </button>
    </div>
);

// 제품 패널 (다중 이미지 지원)
const ProductPanel = ({ product, onAddProduct, onRemoveProduct }: { 
    product: Product | null, 
    onAddProduct: () => void,
    onRemoveProduct: () => void
}) => (
    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] h-full">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                제품
            </h3>
        </div>
        <div className="aspect-square bg-white/[0.03] border border-white/[0.08] rounded-lg overflow-y-auto p-2 relative group">
            {product && product.images.length > 0 ? (
                <>
                    <button 
                        onClick={onRemoveProduct} 
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all z-10"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    <div className="space-y-2">
                        {product.images.map((imgSrc, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                                <img src={imgSrc} alt={`${product.name} ${index + 1}`} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{product.name}</p>
                                    <p className="text-xs text-gray-400">이미지 {index + 1}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">제품을 추가하세요</p>
                </div>
            )}
        </div>
        <button 
            onClick={onAddProduct}
            className="mt-3 w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all hover:scale-[1.02]"
        >
            <Package className="w-4 h-4 inline mr-1" />
            {product ? '제품 수정' : '제품 추가'}
        </button>
    </div>
);

const MiddlePanel = ({ storyboard, onSelectScene, selectedSceneId, isLoading, generatingSceneId, onOpenCreativeDirection, onDownloadAllImages }: {
    storyboard: Storyboard | null,
    onSelectScene: (scene: Scene) => void,
    selectedSceneId: number | null,
    isLoading: boolean,
    generatingSceneId: number | null,
    onOpenCreativeDirection: () => void,
    onDownloadAllImages: () => void,
}) => (
    <div className="glass rounded-2xl p-6 border border-white/[0.08] flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-green-400" />
                스토리보드
            </h3>
            {storyboard?.scenes?.some(s => s.sceneDetails) && (
                <button 
                    onClick={onDownloadAllImages}
                    className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] text-white text-sm rounded-lg transition-all border border-white/[0.08]"
                >
                    <Download className="w-4 h-4 mr-1.5 inline" />
                    전체 다운로드
                </button>
            )}
        </div>
        
        {generatingSceneId && (
            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm p-3 rounded-xl flex items-center gap-3 mb-4">
                <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                장면 {generatingSceneId}/{storyboard?.scenes?.length} 생성 중...
            </div>
        )}
        
        {storyboard?.styleGuide && (
            <button 
                onClick={onOpenCreativeDirection}
                className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-purple-600/10 to-pink-600/10 hover:from-purple-600/20 hover:to-pink-600/20 text-purple-400 rounded-xl transition-all border border-purple-500/20"
            >
                <Sparkles className="w-4 h-4 mr-2 inline" />
                크리에이티브 디렉션 보기
            </button>
        )}
        
        <div className="flex-grow overflow-y-auto space-y-3 pr-2" style={{ background: 'transparent' }}>
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Cpu className="w-12 h-12 mb-3 animate-pulse" />
                    <p>스토리보드 생성 중...</p>
                </div>
            )}
            {!isLoading && !storyboard && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                    <Film className="w-12 h-12 mb-3 opacity-50" />
                    <p>광고 정보를 입력하고</p>
                    <p className="text-sm">생성 버튼을 눌러주세요</p>
                </div>
            )}
            {storyboard?.scenes?.map(scene => (
                <div 
                    key={scene.id} 
                    onClick={() => onSelectScene(scene)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                        selectedSceneId === scene.id 
                            ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/30' 
                            : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.12]'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                selectedSceneId === scene.id
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                    : 'bg-white/[0.05] text-gray-400'
                            }`}>
                                {scene.id}
                            </div>
                        </div>
                        <div className="flex-grow">
                            <p className="font-medium text-white mb-1">{scene.title}</p>
                            <p className="text-sm text-gray-400 line-clamp-2">{scene.description}</p>
                            <p className="text-xs text-gray-500 mt-2">{scene.duration}초</p>
                        </div>
                        {scene.previewImages.length > 0 && (
                            <div className="flex-shrink-0">
                                <div className="grid grid-cols-2 gap-1">
                                    {scene.previewImages.slice(0, 2).map((img, idx) => (
                                        <div key={idx} className="relative">
                                            <img src={img} alt={`Preview ${idx + 1}`} className="w-20 h-14 object-cover rounded-lg" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const RightPanel = ({ scene, onAdaptPrompt, adaptedPrompts, isGeneratingFrames, isAdaptingPrompt, onEditImage, onGenerateMidjourneyPrompt, midjourneyPrompts, isGeneratingMidjourneyPrompt, onGenerateSunoPrompt, sunoPrompt, isGeneratingSunoPrompt }: {
    scene: Scene | null;
    onAdaptPrompt: (ai: OtherAIModel) => void;
    adaptedPrompts: AdaptedPrompts;
    isGeneratingFrames: boolean;
    isAdaptingPrompt: OtherAIModel | null;
    onEditImage: (sceneId: number, frameType: 'start' | 'end', imageUrl: string) => void;
    onGenerateMidjourneyPrompt: (frameType: 'start' | 'end') => void;
    midjourneyPrompts: { start: string | null, end: string | null };
    isGeneratingMidjourneyPrompt: 'start' | 'end' | null;
    onGenerateSunoPrompt: () => void;
    sunoPrompt: { stylePrompt: string; lyrics: string } | null;
    isGeneratingSunoPrompt: boolean;
}) => {
    const aiModels: OtherAIModel[] = [OtherAIModel.VEO3, OtherAIModel.KLING, OtherAIModel.HAILUO, OtherAIModel.HICKSFIELD];
    const [copiedPrompt, setCopiedPrompt] = useState('');
    const [activeTab, setActiveTab] = useState<'image' | 'video' | 'audio'>('image');
    const details = scene?.sceneDetails;

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedPrompt(id);
        setTimeout(() => setCopiedPrompt(''), 2000);
    };

    if (!scene) {
        return (
            <div className="glass rounded-2xl p-6 border border-white/[0.08] flex items-center justify-center h-full">
                <p className="text-gray-400">스토리보드에서 장면을 선택하세요</p>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl p-6 border border-white/[0.08] overflow-y-auto h-full">
            <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-400" />
                시나리오
            </h3>
            
            <div className="bg-white/[0.02] border border-white/[0.08] p-4 rounded-xl mb-4">
                <h4 className="font-semibold text-white mb-2">{scene.title}</h4>
                <p className="text-sm text-gray-300">{scene.description}</p>
            </div>
            
            {!details && (
                <div className="flex flex-col items-center justify-center py-12">
                    {isGeneratingFrames ? (
                        <div className="text-center text-gray-400">
                            <div className="w-8 h-8 border-3 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
                            프레임 생성 중...
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <p>프레임이 생성되지 않았습니다</p>
                            <p className="text-xs mt-1">상단의 '생성' 버튼을 눌러주세요</p>
                        </div>
                    )}
                </div>
            )}
            
            {details && (
                <>
                    <div className="bg-white/[0.02] border border-white/[0.08] p-4 rounded-xl mb-4">
                        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                            <Languages className="w-4 h-4" />
                            영문 프롬프트
                        </h4>
                        <pre className="text-xs text-gray-300 bg-black/30 p-3 rounded-lg whitespace-pre-wrap overflow-x-auto font-mono">
                            {details.prompt}
                        </pre>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 mb-4 bg-white/[0.02] p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('image')}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                                activeTab === 'image' 
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                            }`}
                        >
                            이미지
                        </button>
                        <button
                            onClick={() => setActiveTab('video')}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                                activeTab === 'video' 
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                            }`}
                        >
                            영상
                        </button>
                        <button
                            onClick={() => setActiveTab('audio')}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                                activeTab === 'audio' 
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                            }`}
                        >
                            오디오
                        </button>
                    </div>

                    {/* Image Tab */}
                    {activeTab === 'image' && (
                        <div className="space-y-4">
                        {/* Start Frame */}
                        <div>
                            <div className="relative group cursor-pointer rounded-xl overflow-hidden" onClick={() => onEditImage(scene.id, 'start', details.startFrame)}>
                                <img src={details.startFrame} alt="Start Frame" className="w-full aspect-video object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                    <Wand2 className="w-10 h-10 text-white drop-shadow-lg" />
                                </div>
                                <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">시작 프레임</span>
                            </div>
                            
                            <div className="mt-3 bg-white/[0.02] border border-white/[0.08] p-3 rounded-xl">
                                <h5 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                                    <Bot className="w-4 h-4" />
                                    블록화프롬프트 (START FRAME)
                                </h5>
                                {!midjourneyPrompts.start ? (
                                    <button 
                                        onClick={() => onGenerateMidjourneyPrompt('start')}
                                        disabled={isGeneratingMidjourneyPrompt === 'start'}
                                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:shadow-lg transition-all"
                                    >
                                        {isGeneratingMidjourneyPrompt === 'start' ? '생성 중...' : '생성'}
                                    </button>
                                ) : (
                                    <div className="relative">
                                        <textarea 
                                            readOnly 
                                            value={midjourneyPrompts.start} 
                                            rows={3} 
                                            className="w-full bg-black/30 text-gray-300 text-xs p-3 rounded-lg resize-none font-mono"
                                        />
                                        <button 
                                            onClick={() => handleCopy(midjourneyPrompts.start!, 'midjourney-start')}
                                            className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-lg transition-all"
                                        >
                                            {copiedPrompt === 'midjourney-start' ? 
                                                <Check className="w-4 h-4 text-green-400" /> : 
                                                <Clipboard className="w-4 h-4 text-gray-400" />
                                            }
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* End Frame */}
                        <div>
                            <div className="relative group cursor-pointer rounded-xl overflow-hidden" onClick={() => onEditImage(scene.id, 'end', details.endFrame)}>
                                <img src={details.endFrame} alt="End Frame" className="w-full aspect-video object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                    <Wand2 className="w-10 h-10 text-white drop-shadow-lg" />
                                </div>
                                <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">종료 프레임</span>
                            </div>
                            
                            <div className="mt-3 bg-white/[0.02] border border-white/[0.08] p-3 rounded-xl">
                                <h5 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                                    <Bot className="w-4 h-4" />
                                    블록화프롬프트 (END FRAME)
                                </h5>
                                {!midjourneyPrompts.end ? (
                                    <button 
                                        onClick={() => onGenerateMidjourneyPrompt('end')}
                                        disabled={isGeneratingMidjourneyPrompt === 'end'}
                                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:shadow-lg transition-all"
                                    >
                                        {isGeneratingMidjourneyPrompt === 'end' ? '생성 중...' : '생성'}
                                    </button>
                                ) : (
                                    <div className="relative">
                                        <textarea 
                                            readOnly 
                                            value={midjourneyPrompts.end} 
                                            rows={3} 
                                            className="w-full bg-black/30 text-gray-300 text-xs p-3 rounded-lg resize-none font-mono"
                                        />
                                        <button 
                                            onClick={() => handleCopy(midjourneyPrompts.end!, 'midjourney-end')}
                                            className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-lg transition-all"
                                        >
                                            {copiedPrompt === 'midjourney-end' ? 
                                                <Check className="w-4 h-4 text-green-400" /> : 
                                                <Clipboard className="w-4 h-4 text-gray-400" />
                                            }
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        </div>
                    )}

                    {/* Video Tab */}
                    {activeTab === 'video' && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-500/20 p-4 rounded-xl">
                                <p className="font-medium text-blue-400 flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4"/>
                                    다음 장면 전환
                                </p>
                                <p className="text-xs text-blue-300 mt-1">A quick, elegant cut revealing a hero shot</p>
                            </div>
                            
                            <div>
                                <p className="text-sm font-medium text-white mb-3">다른 AI 플랫폼용 프롬프트</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {aiModels.map(ai => (
                                <button 
                                    key={ai} 
                                    onClick={() => onAdaptPrompt(ai)}
                                    disabled={isAdaptingPrompt === ai}
                                    className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] text-white text-xs rounded-lg transition-all border border-white/[0.08]"
                                >
                                    {isAdaptingPrompt === ai ? '생성 중...' : ai}
                                </button>
                            ))}
                        </div>
                        {Object.entries(adaptedPrompts).map(([ai, prompt]) => (
                            prompt && <div key={ai} className="mb-3">
                                <h5 className="text-xs font-medium text-blue-400 mb-2">{ai} 최적화</h5>
                                <div className="relative">
                                    <textarea 
                                        readOnly 
                                        value={prompt} 
                                        rows={3} 
                                        className="w-full bg-black/30 text-gray-300 text-xs p-3 rounded-lg resize-none font-mono"
                                    />
                                    <button 
                                        onClick={() => handleCopy(prompt, ai)}
                                        className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-lg transition-all"
                                    >
                                        {copiedPrompt === ai ? 
                                            <Check className="w-4 h-4 text-green-400" /> : 
                                            <Clipboard className="w-4 h-4 text-gray-400" />
                                        }
                                    </button>
                                </div>
                            </div>
                        ))}
                            </div>
                        </div>
                    )}

                    {/* Audio Tab */}
                    {activeTab === 'audio' && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                                    <Music className="w-4 h-4" />
                                    배경음악 생성 (Suno)
                                </p>
                        {!sunoPrompt ? (
                            <button 
                                onClick={onGenerateSunoPrompt}
                                disabled={isGeneratingSunoPrompt}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg hover:shadow-lg transition-all"
                            >
                                {isGeneratingSunoPrompt ? '생성 중...' : '프롬프트 생성'}
                            </button>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <h5 className="text-xs font-medium text-green-400 mb-2">Style Prompt</h5>
                                    <div className="relative">
                                        <textarea 
                                            readOnly 
                                            value={sunoPrompt.stylePrompt} 
                                            rows={3} 
                                            className="w-full bg-black/30 text-gray-300 text-xs p-3 rounded-lg resize-none font-mono"
                                        />
                                        <button 
                                            onClick={() => handleCopy(sunoPrompt.stylePrompt, 'suno-style')}
                                            className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-lg transition-all"
                                        >
                                            {copiedPrompt === 'suno-style' ? 
                                                <Check className="w-4 h-4 text-green-400" /> : 
                                                <Clipboard className="w-4 h-4 text-gray-400" />
                                            }
                                        </button>
                                    </div>
                                </div>
                                {sunoPrompt.lyrics && (
                                    <div>
                                        <h5 className="text-xs font-medium text-green-400 mb-2">Lyrics</h5>
                                        <div className="relative">
                                            <textarea 
                                                readOnly 
                                                value={sunoPrompt.lyrics} 
                                                rows={5} 
                                                className="w-full bg-black/30 text-gray-300 text-xs p-3 rounded-lg resize-none font-mono"
                                            />
                                            <button 
                                                onClick={() => handleCopy(sunoPrompt.lyrics, 'suno-lyrics')}
                                                className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-lg transition-all"
                                            >
                                                {copiedPrompt === 'suno-lyrics' ? 
                                                    <Check className="w-4 h-4 text-green-400" /> : 
                                                    <Clipboard className="w-4 h-4 text-gray-400" />
                                                }
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default function App() {
    const [topic, setTopic] = useState('');
    const [story, setStory] = useState('');
    const [duration, setDuration] = useState<number | string>('');
    const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(true);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | '9:16'>('16:9');

    const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
    const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null);
    const [models, setModels] = useState<Model[]>([]);
    const [product, setProduct] = useState<Product | null>(null);
    const [adaptedPrompts, setAdaptedPrompts] = useState<AdaptedPrompts>({});
    const [midjourneyPrompts, setMidjourneyPrompts] = useState<{ start: string | null; end: string | null; }>({ start: null, end: null });
    const [sunoPrompt, setSunoPrompt] = useState<{ stylePrompt: string; lyrics: string; } | null>(null);

    const [isModelModalOpen, setModelModalOpen] = useState(false);
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [isCreativeDirectionModalOpen, setCreativeDirectionModalOpen] = useState(false);
    const [isImageEditorModalOpen, setImageEditorModalOpen] = useState(false);
    const [isPromptGuideModalOpen, setPromptGuideModalOpen] = useState(false);
    const [isApiKeyModalOpen, setApiKeyModalOpen] = useState(false);
    const [isSceneEditorModalOpen, setSceneEditorModalOpen] = useState(false);
    const [editingImageInfo, setEditingImageInfo] = useState<EditingImageInfo | null>(null);
    const [editingScene, setEditingScene] = useState<Scene | null>(null);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState<number | null>(null);
    const [draggedSceneId, setDraggedSceneId] = useState<number | null>(null);
    const [dragOverSceneId, setDragOverSceneId] = useState<number | null>(null);
    
    const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
    const [isGeneratingFrames, setIsGeneratingFrames] = useState<number | null>(null);
    const [isAdaptingPrompt, setIsAdaptingPrompt] = useState<OtherAIModel | null>(null);
    const [isGeneratingMidjourneyPrompt, setIsGeneratingMidjourneyPrompt] = useState<'start' | 'end' | null>(null);
    const [isGeneratingSunoPrompt, setIsGeneratingSunoPrompt] = useState(false);
    const [isApiKeySet, setIsApiKeySet] = useState(apiKeyManager.isApiKeySet());

    useEffect(() => {
        const unsubscribe = apiKeyManager.subscribe(() => {
            setIsApiKeySet(apiKeyManager.isApiKeySet());
        });
        
        if (!apiKeyManager.isApiKeySet()) {
            setTimeout(() => {
                setApiKeyModalOpen(true);
            }, 500);
        }
        
        return unsubscribe;
    }, []);

    const isGenerating = isGeneratingStoryboard || isGeneratingFrames !== null;
    const selectedScene = storyboard?.scenes.find(s => s.id === selectedSceneId) || null;

    const handleFullGeneration = useCallback(async () => {
        if (!apiKeyManager.isApiKeySet()) {
            alert("API 키를 먼저 설정해주세요.");
            setApiKeyModalOpen(true);
            return;
        }
        if (!topic) {
            alert("광고 주제를 입력해주세요.");
            return;
        }
        if (models.length === 0 || !product) {
            alert("모델과 제품을 먼저 추가해야 합니다.");
            return;
        }
        setIsGeneratingStoryboard(true);
        setStoryboard(null);
        setSelectedSceneId(null);
        setAdaptedPrompts({});
        setMidjourneyPrompts({ start: null, end: null });
        setSunoPrompt(null);
        
        let storyboardData;
        try {
            const numericDuration = typeof duration === 'string' ? parseInt(duration) : duration;
            if (!numericDuration || numericDuration <= 0) {
                alert("영상 길이를 올바르게 입력해주세요.");
                setIsGeneratingStoryboard(false);
                return;
            }
            storyboardData = await geminiService.generateStoryboard(topic, story, numericDuration, models[0], product, aspectRatio);
            setStoryboard(storyboardData);
        } catch (error) {
            console.error("Failed to generate storyboard:", error);
            alert("스토리보드 생성에 실패했습니다.");
            setIsGeneratingStoryboard(false);
            return;
        } finally {
            setIsGeneratingStoryboard(false);
        }

        if (storyboardData && storyboardData.scenes.length > 0) {
            setSelectedSceneId(storyboardData.scenes[0].id);
            for (const scene of storyboardData.scenes) {
                try {
                    setIsGeneratingFrames(scene.id);
                    const details = await geminiService.generateSceneFrames(scene, models[0], product, storyboardData.styleGuide);

                    setStoryboard(currentStoryboard => {
                        if (!currentStoryboard) return null;
                        const updatedScenes = currentStoryboard.scenes.map(s => 
                            s.id === scene.id 
                            ? { ...s, sceneDetails: details, previewImages: [details.startFrame] } 
                            : s
                        );
                        return { ...currentStoryboard, scenes: updatedScenes };
                    });

                } catch (error) {
                    console.error(`Failed to generate content for scene ${scene.id}:`, error);
                    alert(`장면 ${scene.id}의 프레임 생성에 실패했습니다.`);
                    break;
                } finally {
                    setIsGeneratingFrames(null);
                }
            }
        }
    }, [topic, story, duration, models, product, aspectRatio]);

    const handleSelectScene = useCallback((scene: Scene) => {
        setSelectedSceneId(scene.id);
        setAdaptedPrompts({});
        setMidjourneyPrompts({ start: null, end: null });
        setSunoPrompt(null);
    }, []);
    
    const handleAdaptPrompt = useCallback(async (aiModel: OtherAIModel) => {
        if (!selectedScene?.sceneDetails?.prompt) return;
        setIsAdaptingPrompt(aiModel);
        try {
            const newPrompt = await geminiService.adaptPromptForOtherAI(selectedScene.sceneDetails.prompt, selectedScene.description, selectedScene.sceneDetails.startFrame, aiModel);
            setAdaptedPrompts(prev => ({ ...prev, [aiModel]: newPrompt }));
        } catch (error) {
            console.error(`Failed to adapt prompt for ${aiModel}:`, error);
        } finally {
            setIsAdaptingPrompt(null);
        }
    }, [selectedScene]);

    const handleGenerateMidjourneyPrompt = useCallback(async (frameType: 'start' | 'end') => {
        if (!selectedScene?.sceneDetails?.prompt) return;
        setIsGeneratingMidjourneyPrompt(frameType);
        try {
            const newPrompt = await geminiService.generateMidjourneyPrompt(selectedScene.sceneDetails.prompt, selectedScene.description, frameType);
            setMidjourneyPrompts(prev => ({ ...prev, [frameType]: newPrompt }));
        } catch (error) {
            console.error(`Failed to generate Midjourney prompt for ${frameType}:`, error);
            alert(`Midjourney ${frameType === 'start' ? '시작' : '종료'} 프롬프트 생성에 실패했습니다.`);
        } finally {
            setIsGeneratingMidjourneyPrompt(null);
        }
    }, [selectedScene]);
    
    const handleGenerateSunoPrompt = useCallback(async () => {
        if (!storyboard || !selectedScene) return;
        setIsGeneratingSunoPrompt(true);
        setSunoPrompt(null);
        try {
            const promptData = await geminiService.generateSunoPrompt(storyboard.styleGuide, storyboard);
            setSunoPrompt(promptData);
        } catch (error) {
            console.error('Failed to generate Suno prompt:', error);
            alert('Suno 프롬프트 생성에 실패했습니다.');
        } finally {
            setIsGeneratingSunoPrompt(false);
        }
    }, [storyboard, selectedScene]);

    const handleDownloadAllImages = () => {
        if (!storyboard) return;

        const downloadImage = (dataUrl: string, filename: string) => {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        storyboard.scenes.forEach(scene => {
            if (scene.sceneDetails) {
                downloadImage(scene.sceneDetails.startFrame, `scene_${scene.id}_start.png`);
                downloadImage(scene.sceneDetails.endFrame, `scene_${scene.id}_end.png`);
            }
        });
    };

    const handleOpenImageEditor = (sceneId: number, frameType: 'start' | 'end', imageUrl: string) => {
        setEditingImageInfo({ sceneId, frameType, imageUrl });
        setImageEditorModalOpen(true);
    };

    const handleSaveEditedImage = (sceneId: number, frameType: 'start' | 'end', newImageUrl: string) => {
        setStoryboard(currentStoryboard => {
            if (!currentStoryboard) return null;
            const updatedScenes = currentStoryboard.scenes.map(s => {
                if (s.id === sceneId && s.sceneDetails) {
                    const newDetails = { ...s.sceneDetails, [frameType === 'start' ? 'startFrame' : 'endFrame']: newImageUrl };
                    const newPreview = frameType === 'start' ? [newImageUrl] : s.previewImages;
                    return { ...s, sceneDetails: newDetails, previewImages: newPreview };
                }
                return s;
            });
            return { ...currentStoryboard, scenes: updatedScenes };
        });
        setImageEditorModalOpen(false);
        setEditingImageInfo(null);
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Background gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-black to-purple-900/10"></div>
            
            {/* Main content */}
            <div className="relative z-10">
                <Header 
                    onGenerate={handleFullGeneration} 
                    isLoading={isGenerating}
                    isApiKeySet={isApiKeySet}
                    onOpenApiKey={() => setApiKeyModalOpen(true)}
                />
                
                <div className="pt-24 px-4 pb-6 max-w-full">
                    {/* 상단: 접을 수 있는 광고 설정 섹션 */}
                    <div className={`glass rounded-2xl border border-white/[0.08] mb-4 ${
                        isSettingsCollapsed ? 'overflow-hidden' : 'overflow-visible'
                    }`}>
                        <button
                            onClick={() => setIsSettingsCollapsed(!isSettingsCollapsed)}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-all rounded-t-2xl"
                        >
                            <h2 className="font-semibold text-lg text-white flex items-center gap-2">
                                <Settings className="w-5 h-5 text-blue-400" />
                                광고 설정
                            </h2>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                isSettingsCollapsed ? '-rotate-90' : ''
                            }`} />
                        </button>
                        
                        <div className={`transition-all duration-300 ${
                            isSettingsCollapsed ? 'max-h-0 overflow-hidden' : 'max-h-[800px] overflow-visible'
                        }`}>
                            <div className={`p-6 pt-2 ${isSettingsCollapsed ? 'invisible' : 'visible'}`}>
                                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 ${
                                    isSettingsCollapsed ? '' : 'overflow-visible'
                                }`}>
                                    <InputPanel 
                                        topic={topic} 
                                        setTopic={setTopic}
                                        story={story}
                                        setStory={setStory}
                                        duration={duration} 
                                        setDuration={setDuration}
                                        onOpenGuide={() => setPromptGuideModalOpen(true)}
                                        aspectRatio={aspectRatio}
                                        setAspectRatio={setAspectRatio}
                                    />
                                    
                                    <ModelPanel 
                                        models={models} 
                                        onAddModel={() => setModelModalOpen(true)}
                                        onRemoveModel={(index) => {
                                            const newModels = models.filter((_, i) => i !== index);
                                            setModels(newModels);
                                        }}
                                    />
                                    
                                    <ProductPanel 
                                        product={product} 
                                        onAddProduct={() => setProductModalOpen(true)}
                                        onRemoveProduct={() => setProduct(null)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* 하단: 스토리보드와 프레임 생성 - 2:3 비율로 조정 */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        
                        <div className="lg:col-span-2 min-h-[600px]">
                            <MiddlePanel 
                                storyboard={storyboard} 
                                onSelectScene={handleSelectScene} 
                                selectedSceneId={selectedSceneId} 
                                isLoading={isGeneratingStoryboard}
                                generatingSceneId={isGeneratingFrames}
                                onOpenCreativeDirection={() => setCreativeDirectionModalOpen(true)}
                                onDownloadAllImages={handleDownloadAllImages}
                            />
                        </div>
                        
                        <div className="lg:col-span-3 min-h-[600px]">
                            <RightPanel 
                                scene={selectedScene}
                                onAdaptPrompt={handleAdaptPrompt}
                                adaptedPrompts={adaptedPrompts}
                                isGeneratingFrames={isGeneratingFrames === selectedScene?.id}
                                isAdaptingPrompt={isAdaptingPrompt}
                                onEditImage={handleOpenImageEditor}
                                onGenerateMidjourneyPrompt={handleGenerateMidjourneyPrompt}
                                midjourneyPrompts={midjourneyPrompts}
                                isGeneratingMidjourneyPrompt={isGeneratingMidjourneyPrompt}
                                onGenerateSunoPrompt={handleGenerateSunoPrompt}
                                sunoPrompt={sunoPrompt}
                                isGeneratingSunoPrompt={isGeneratingSunoPrompt}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ModelModal isOpen={isModelModalOpen} onClose={() => setModelModalOpen(false)} onSave={(newModel) => {
                if (models.length >= 4) {
                    alert("모델은 최대 4명까지 추가할 수 있습니다.");
                    return;
                }
                const newModels = [...models, newModel];
                setModels(newModels);
            }} />
            <SceneEditorModal
                isOpen={isSceneEditorModalOpen}
                onClose={() => setSceneEditorModalOpen(false)}
                scene={editingScene}
                storyboard={storyboard}
                onSave={(updatedScene) => {
                    if (storyboard) {
                        const updatedScenes = storyboard.scenes.map(s =>
                            s.id === updatedScene.id ? updatedScene : s
                        );
                        setStoryboard({ ...storyboard, scenes: updatedScenes });
                    }
                    setSceneEditorModalOpen(false);
                }}
            />
            <ProductModal isOpen={isProductModalOpen} onClose={() => setProductModalOpen(false)} onSave={setProduct} />
            <PromptGuideModal isOpen={isPromptGuideModalOpen} onClose={() => setPromptGuideModalOpen(false)} />
            <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)} />
            {storyboard && (
                <CreativeDirectionModal 
                    isOpen={isCreativeDirectionModalOpen} 
                    onClose={() => setCreativeDirectionModalOpen(false)} 
                    storyboard={storyboard}
                />
            )}
            {editingImageInfo && (
                <ImageEditorModal 
                    isOpen={isImageEditorModalOpen}
                    onClose={() => setImageEditorModalOpen(false)}
                    imageInfo={editingImageInfo}
                    onSave={handleSaveEditedImage}
                />
            )}
        </div>
    );
}