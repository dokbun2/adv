import React, { useState, useCallback, useEffect } from 'react';
import { Scene, Model, Product, Storyboard, StyleGuide, OtherAIModel, AdaptedPrompts, EditingImageInfo } from './types';
import * as geminiService from './services/geminiService';
import apiKeyManager from './services/apiKeyManager';
import { ModelModal } from './components/modals/ModelModal';
import { ProductModal } from './components/modals/ProductModal';
import { CreativeDirectionModal } from './components/modals/CreativeDirectionModal';
import { ImageEditorModal } from './components/modals/ImageEditorModal';
import { PromptGuideModal } from './components/modals/PromptGuideModal';
import { ApiKeyModal } from './components/modals/ApiKeyModal';
import { Button } from './components/ui/Button';
import { Film, Users, Package, Link, ArrowRight, Info, Clipboard, Check, Sparkles, BookOpen, Wand2, Languages, Bot, Download, Music, Key, Settings } from 'lucide-react';


const Header = ({ onGenerate, isLoading, isApiKeySet, onOpenApiKey }: { 
    onGenerate: () => void, 
    isLoading: boolean,
    isApiKeySet: boolean,
    onOpenApiKey: () => void
}) => (
    <header className="flex-shrink-0 bg-white shadow-sm p-3 border-b border-slate-200 z-10">
        <div className="flex justify-between items-center max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="bg-slate-800 p-2 rounded-lg">
                    <Film className="text-white h-6 w-6" />
                </div>
                <h1 className="text-xl font-bold text-slate-800">AI 광고 영상 제작</h1>
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    onClick={onOpenApiKey} 
                    variant={isApiKeySet ? "ghost" : "primary"}
                    size="sm"
                    className="min-w-[100px]"
                >
                    <Key className="w-4 h-4 mr-1" />
                    {isApiKeySet ? 'API 설정' : 'API 키 설정'}
                </Button>
                <Button 
                    onClick={onGenerate} 
                    isLoading={isLoading} 
                    className="min-w-[120px]"
                    disabled={!isApiKeySet}
                >
                    {isLoading ? '생성 중...' : '생성'}
                </Button>
            </div>
        </div>
    </header>
);

const InputPanel = ({ topic, setTopic, duration, setDuration, refUrl, setRefUrl, onOpenGuide }: {
    topic: string, setTopic: (s: string) => void,
    duration: number, setDuration: (n: number) => void,
    refUrl: string, setRefUrl: (s: string) => void,
    onOpenGuide: () => void,
}) => (
    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <div className="md:col-span-2 relative">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="광고 컨셉 입력 (예: 20대 여성을 위한 비건 수분 크림)"
                    className="w-full bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                />
                 <button onClick={onOpenGuide} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors" title="프롬프트 작성 가이드">
                    <Info className="w-5 h-5" />
                </button>
            </div>
            <div className="md:col-span-2 relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="url"
                    value={refUrl}
                    onChange={(e) => setRefUrl(e.target.value)}
                    placeholder="참고할 YouTube 영상 URL 입력 (선택 사항)"
                    className="w-full bg-slate-100 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div className="relative">
                <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">총 영상 길이(초)</span>
            </div>
        </div>
    </div>
);

const LeftPanel = ({ model, product, onAddModel, onAddProduct }: { model: Model | null, product: Product | null, onAddModel: () => void, onAddProduct: () => void }) => (
    <div className="w-1/4 bg-white p-4 rounded-xl shadow-md border border-slate-200 flex flex-col gap-6">
        <div className="flex-1 flex flex-col">
            <h3 className="font-bold mb-2 flex items-center gap-2"><Users className="w-5 h-5" />모델</h3>
            <div className="bg-slate-100 border border-slate-200 rounded-md flex-grow flex items-center justify-center p-2 min-h-[150px]">
                {model ? (
                    <img src={model.sheetImage} alt={model.name} className="w-full h-full object-contain rounded-md" />
                ) : <p className="text-slate-400 text-sm">모델을 추가하세요</p>}
            </div>
            <Button onClick={onAddModel} variant="primary" className="mt-3 w-full">+ 모델 추가</Button>
        </div>
        <div className="flex-1 flex flex-col">
            <h3 className="font-bold mb-2 flex items-center gap-2"><Package className="w-5 h-5" />제품</h3>
            <div className="bg-slate-100 border border-slate-200 rounded-md flex-grow flex items-center justify-center p-2 min-h-[150px]">
                {product ? (
                     <img src={product.image} alt={product.name} className="w-full h-full object-contain rounded-md" />
                ) : <p className="text-slate-400 text-sm">제품을 추가하세요</p>}
            </div>
            <Button onClick={onAddProduct} variant="green" className="mt-3 w-full">+ 제품 추가</Button>
        </div>
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
    <div className="w-2/5 bg-white p-4 rounded-xl shadow-md border border-slate-200 flex flex-col gap-3">
        <div className="flex justify-between items-center flex-shrink-0">
            <h3 className="font-bold text-lg">스토리보드</h3>
             {storyboard?.scenes?.some(s => s.sceneDetails) && (
                <Button variant="ghost" size="sm" onClick={onDownloadAllImages}>
                    <Download className="w-4 h-4 mr-2" />
                    전체 이미지 다운로드
                </Button>
            )}
        </div>
        {generatingSceneId && (
            <div className="bg-blue-50 text-blue-700 text-sm p-2 rounded-md flex items-center gap-2 flex-shrink-0">
                <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                장면 {generatingSceneId}/{storyboard?.scenes?.length} 프레임 생성 중...
            </div>
        )}
        {storyboard?.styleGuide && (
            <Button onClick={onOpenCreativeDirection} variant="ghost" className="w-full flex-shrink-0">
                <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                크리에이티브 디렉션 보기
            </Button>
        )}
        <div className="flex-grow overflow-y-auto space-y-2 pr-2">
            {isLoading && <div className="flex items-center justify-center h-full text-slate-500">스토리보드 생성 중...</div>}
            {!isLoading && !storyboard && <div className="flex items-center justify-center h-full text-center text-slate-500"><p>상단에서 광고 정보를 입력하고<br/>생성 버튼을 눌러주세요.</p></div>}
            {storyboard?.scenes?.map(scene => (
                <div key={scene.id} onClick={() => onSelectScene(scene)} className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${selectedSceneId === scene.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400'}`}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 bg-slate-200 text-slate-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mt-0.5">{scene.id}</span>
                            <div>
                                <p className="font-semibold text-sm truncate max-w-[200px]">{scene.title}</p>
                                <p className="text-xs text-slate-500">{scene.duration} seconds</p>
                            </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                            {scene.previewImages.map((img, idx) => <img key={idx} src={img} alt={`Preview ${idx + 1}`} className="w-16 h-10 object-cover rounded-md bg-slate-200" />)}
                        </div>
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
    const details = scene?.sceneDetails;

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedPrompt(id);
        setTimeout(() => setCopiedPrompt(''), 2000);
    };

    if (!scene) {
        return <div className="w-[35%] bg-white p-4 rounded-xl shadow-md border border-slate-200 flex items-center justify-center"><p className="text-slate-500">스토리보드에서 장면을 선택하세요.</p></div>;
    }

    return (
        <div className="w-[35%] bg-white p-4 rounded-xl shadow-md border border-slate-200 flex flex-col gap-4 overflow-y-auto">
            <h3 className="font-bold text-lg flex items-center gap-2"><BookOpen className="w-5 h-5" />시나리오</h3>
            
            <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-sm text-slate-800">{scene.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{scene.description}</p>
            </div>
            
            {!details && (
                 <div className="flex-grow flex items-center justify-center">
                    {isGeneratingFrames ? (
                        <div className="text-center text-slate-500">
                             <svg className="animate-spin mx-auto h-8 w-8 mb-2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            프레임 생성 중...
                        </div>
                    ) : (
                        <div className="text-center text-slate-500">
                            <p>장면 프레임이 생성되지 않았습니다.</p>
                            <p className="text-xs">상단의 '생성' 버튼을 눌러주세요.</p>
                        </div>
                    )}
                </div>
            )}
            
            {details && (
                <>
                    <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-2"><Languages className="w-4 h-4" />영문 프롬프트 (Frame Generation)</h4>
                        <pre className="text-xs text-slate-700 mt-2 font-mono bg-slate-200 p-2 rounded whitespace-pre-wrap overflow-x-auto">{details.prompt}</pre>
                    </div>

                    <div>
                        <div className="relative group cursor-pointer" onClick={() => onEditImage(scene.id, 'start', details.startFrame)}>
                            <img src={details.startFrame} alt="Start Frame" className="rounded-lg w-full aspect-video object-cover bg-slate-200" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                <Wand2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded">시작 프레임</span>
                        </div>
                        <div className="bg-slate-100 p-3 mt-3 rounded-lg border border-slate-200">
                            <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-2"><Bot className="w-4 h-4" />Midjourney 최적화 프롬프트 (시작 프레임)</h4>
                            {!midjourneyPrompts.start && (
                                <Button onClick={() => onGenerateMidjourneyPrompt('start')} isLoading={isGeneratingMidjourneyPrompt === 'start'} size="sm" className="mt-2">
                                    {isGeneratingMidjourneyPrompt === 'start' ? '생성 중...' : '생성'}
                                </Button>
                            )}
                            {midjourneyPrompts.start && (
                                 <div className="relative mt-2">
                                    <textarea readOnly value={midjourneyPrompts.start} rows={4} className="w-full bg-slate-200 text-slate-700 text-xs p-2 rounded-md resize-none border border-slate-300 focus:outline-none pr-10 font-mono"></textarea>
                                     <Button variant="ghost" size="sm" className="absolute top-2 right-2 !p-1.5 h-auto" onClick={() => handleCopy(midjourneyPrompts.start!, 'midjourney-start')}>
                                        {copiedPrompt === 'midjourney-start' ? <Check className="w-4 h-4 text-green-600" /> : <Clipboard className="w-4 h-4 text-slate-500" />}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="relative group cursor-pointer" onClick={() => onEditImage(scene.id, 'end', details.endFrame)}>
                            <img src={details.endFrame} alt="End Frame" className="rounded-lg w-full aspect-video object-cover bg-slate-200" />
                             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                <Wand2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded">종료 프레임</span>
                        </div>
                        <div className="bg-slate-100 p-3 mt-3 rounded-lg border border-slate-200">
                            <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-2"><Bot className="w-4 h-4" />Midjourney 최적화 프롬프트 (종료 프레임)</h4>
                            {!midjourneyPrompts.end && (
                                <Button onClick={() => onGenerateMidjourneyPrompt('end')} isLoading={isGeneratingMidjourneyPrompt === 'end'} size="sm" className="mt-2">
                                    {isGeneratingMidjourneyPrompt === 'end' ? '생성 중...' : '생성'}
                                </Button>
                            )}
                            {midjourneyPrompts.end && (
                                 <div className="relative mt-2">
                                    <textarea readOnly value={midjourneyPrompts.end} rows={4} className="w-full bg-slate-200 text-slate-700 text-xs p-2 rounded-md resize-none border border-slate-300 focus:outline-none pr-10 font-mono"></textarea>
                                     <Button variant="ghost" size="sm" className="absolute top-2 right-2 !p-1.5 h-auto" onClick={() => handleCopy(midjourneyPrompts.end!, 'midjourney-end')}>
                                        {copiedPrompt === 'midjourney-end' ? <Check className="w-4 h-4 text-green-600" /> : <Clipboard className="w-4 h-4 text-slate-500" />}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                     <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="font-semibold text-sm text-blue-800 flex items-center gap-2"><ArrowRight className="w-4 h-4"/>다음 장면으로 전환</p>
                        <p className="text-xs text-blue-700 mt-1">A quick, elegant cut revealing a hero shot of the '앰플' bottle.</p>
                    </div>
                    
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                        <p className="text-sm font-medium">다른 AI용 영상 프롬프트</p>
                        <div className="flex flex-wrap gap-2">
                            {aiModels.map(ai => (
                                <Button key={ai} variant="ghost" size="sm" onClick={() => onAdaptPrompt(ai)} isLoading={isAdaptingPrompt === ai}>{ai}</Button>
                            ))}
                        </div>
                        {Object.entries(adaptedPrompts).map(([ai, prompt]) => (
                            prompt && <div key={ai}>
                                <h5 className="font-semibold text-xs text-blue-600 mt-2">{ai} 최적화 프롬프트</h5>
                                <div className="relative">
                                     {prompt.trim().startsWith('{') ? (
                                        <pre className="w-full bg-slate-100 text-slate-600 text-xs p-2 mt-1 rounded-md border border-slate-200 whitespace-pre-wrap break-words">{prompt}</pre>
                                    ) : (
                                        <textarea readOnly value={prompt} rows={3} className="w-full bg-slate-100 text-slate-600 text-xs p-2 mt-1 rounded-md resize-none border border-slate-200 focus:outline-none pr-10"></textarea>
                                    )}
                                     <Button variant="ghost" size="sm" className="absolute top-2 right-2 !p-1.5 h-auto" onClick={() => handleCopy(prompt, ai)}>
                                        {copiedPrompt === ai ? <Check className="w-4 h-4 text-green-600" /> : <Clipboard className="w-4 h-4 text-slate-500" />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="space-y-2 pt-2 border-t border-slate-200">
                        <p className="text-sm font-medium flex items-center gap-2"><Music className="w-4 h-4" />배경음악 생성 프롬프트 (Suno)</p>
                        {!sunoPrompt && (
                            <Button onClick={onGenerateSunoPrompt} isLoading={isGeneratingSunoPrompt} size="sm">
                                {isGeneratingSunoPrompt ? '생성 중...' : '프롬프트 생성'}
                            </Button>
                        )}
                        {sunoPrompt && (
                            <>
                                <div>
                                    <h5 className="font-semibold text-xs text-green-600 mt-2">Style Prompt</h5>
                                    <div className="relative mt-1">
                                        <textarea readOnly value={sunoPrompt.stylePrompt} rows={3} className="w-full bg-slate-100 text-slate-700 text-xs p-2 rounded-md resize-none border border-slate-200 focus:outline-none pr-10 font-mono"></textarea>
                                        <Button variant="ghost" size="sm" className="absolute top-2 right-2 !p-1.5 h-auto" onClick={() => handleCopy(sunoPrompt.stylePrompt, 'suno-style')}>
                                            {copiedPrompt === 'suno-style' ? <Check className="w-4 h-4 text-green-600" /> : <Clipboard className="w-4 h-4 text-slate-500" />}
                                        </Button>
                                    </div>
                                </div>
                                {sunoPrompt.lyrics && (
                                    <div>
                                        <h5 className="font-semibold text-xs text-green-600 mt-2">Lyrics (가사)</h5>
                                        <div className="relative mt-1">
                                            <textarea readOnly value={sunoPrompt.lyrics} rows={5} className="w-full bg-slate-100 text-slate-700 text-xs p-2 rounded-md resize-none border border-slate-200 focus:outline-none pr-10 font-mono"></textarea>
                                            <Button variant="ghost" size="sm" className="absolute top-2 right-2 !p-1.5 h-auto" onClick={() => handleCopy(sunoPrompt.lyrics, 'suno-lyrics')}>
                                                {copiedPrompt === 'suno-lyrics' ? <Check className="w-4 h-4 text-green-600" /> : <Clipboard className="w-4 h-4 text-slate-500" />}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default function App() {
    const [topic, setTopic] = useState('화장품 광고');
    const [duration, setDuration] = useState(40);
    const [refUrl, setRefUrl] = useState('');

    const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
    const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null);
    const [model, setModel] = useState<Model | null>(null);
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
    const [editingImageInfo, setEditingImageInfo] = useState<EditingImageInfo | null>(null);
    
    const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
    const [isGeneratingFrames, setIsGeneratingFrames] = useState<number | null>(null);
    const [isAdaptingPrompt, setIsAdaptingPrompt] = useState<OtherAIModel | null>(null);
    const [isGeneratingMidjourneyPrompt, setIsGeneratingMidjourneyPrompt] = useState<'start' | 'end' | null>(null);
    const [isGeneratingSunoPrompt, setIsGeneratingSunoPrompt] = useState(false);
    const [isApiKeySet, setIsApiKeySet] = useState(apiKeyManager.isApiKeySet());

    useEffect(() => {
        // Subscribe to API key changes
        const unsubscribe = apiKeyManager.subscribe(() => {
            setIsApiKeySet(apiKeyManager.isApiKeySet());
        });
        
        // Check if API key is not set and show modal
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
        if (!model || !product) {
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
            storyboardData = await geminiService.generateStoryboard(topic, '', duration, refUrl);
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
                    const details = await geminiService.generateSceneFrames(scene, model, product, storyboardData.styleGuide);

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
    }, [topic, duration, refUrl, model, product]);

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
        <div className="h-screen w-screen bg-slate-50 flex flex-col">
            <Header 
                onGenerate={handleFullGeneration} 
                isLoading={isGenerating}
                isApiKeySet={isApiKeySet}
                onOpenApiKey={() => setApiKeyModalOpen(true)}
            />
            <div className="flex-grow flex flex-col p-4 gap-4 overflow-y-auto">
                <InputPanel 
                    topic={topic} setTopic={setTopic} 
                    duration={duration} setDuration={setDuration}
                    refUrl={refUrl} setRefUrl={setRefUrl}
                    onOpenGuide={() => setPromptGuideModalOpen(true)}
                />
                <main className="flex-grow flex gap-4 min-h-0">
                    <LeftPanel model={model} product={product} onAddModel={() => setModelModalOpen(true)} onAddProduct={() => setProductModalOpen(true)} />
                    <MiddlePanel 
                        storyboard={storyboard} 
                        onSelectScene={handleSelectScene} 
                        selectedSceneId={selectedSceneId} 
                        isLoading={isGeneratingStoryboard}
                        generatingSceneId={isGeneratingFrames}
                        onOpenCreativeDirection={() => setCreativeDirectionModalOpen(true)}
                        onDownloadAllImages={handleDownloadAllImages}
                    />
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
                </main>
            </div>

            <ModelModal isOpen={isModelModalOpen} onClose={() => setModelModalOpen(false)} onSave={setModel} />
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