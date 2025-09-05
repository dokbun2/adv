import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { EditingImageInfo } from '../../types';
import * as geminiService from '../../services/geminiService';
import { Wand2, Camera, Eraser, Trash2, UploadCloud, Brush, RotateCcw, Save, X } from 'lucide-react';

const SHOT_TYPES = [
    'aerial', 'worm eyes view', 'high angle', 'low angle', 
    'dutch angle', 'over the shoulder', 'side view', 'back view', 
    'close-up shot', 'medium shot', 'wide shot', 'profile shot'
];

// Utility to convert File to base64 data URL
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const ImageEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    imageInfo: EditingImageInfo;
    onSave: (sceneId: number, frameType: 'start' | 'end', newImageUrl: string) => void;
}> = ({ isOpen, onClose, imageInfo, onSave }) => {
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [selectedShots, setSelectedShots] = useState<string[]>([]);
    const [prompt, setPrompt] = useState('');
    const [refImages, setRefImages] = useState<File[]>([]);
    const [refPreviews, setRefPreviews] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(40);
    const [isErasing, setIsErasing] = useState(false);

    const resetState = useCallback(() => {
        setEditedImageUrl(null);
        setSelectedShots([]);
        setPrompt('');
        setRefImages([]);
        setRefPreviews([]);
        setIsLoading(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    const handleGenerate = async () => {
        setIsLoading(true);
        setEditedImageUrl(null);
        try {
            const canvas = canvasRef.current;
            let maskImage: string | undefined = undefined;
            if (canvas) {
                // Check if canvas is empty
                const context = canvas.getContext('2d');
                const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
                const isCanvasEmpty = !pixelBuffer.some(color => color !== 0);
                if (!isCanvasEmpty) {
                    maskImage = canvas.toDataURL('image/png');
                }
            }

            const refImageUrls = await Promise.all(refImages.map(fileToDataUrl));

            const newImage = await geminiService.editImage(imageInfo.imageUrl, prompt, selectedShots, maskImage, refImageUrls);
            setEditedImageUrl(newImage);
        } catch (error) {
            console.error("Failed to edit image:", error);
            alert("이미지 수정에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (editedImageUrl) {
            onSave(imageInfo.sceneId, imageInfo.frameType, editedImageUrl);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const newFiles = [...refImages, ...files].slice(0, 8);
            setRefImages(newFiles);

            const previews = await Promise.all(newFiles.map(fileToDataUrl));
            setRefPreviews(previews);
        }
    };

    // Canvas drawing logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const setCanvasSize = () => {
            if (imageRef.current) {
                canvas.width = imageRef.current.clientWidth;
                canvas.height = imageRef.current.clientHeight;
            }
        };

        const image = imageRef.current;
        image.onload = setCanvasSize;
        if (image.complete) setCanvasSize(); // if image is already loaded
        window.addEventListener('resize', setCanvasSize);
        return () => window.removeEventListener('resize', setCanvasSize);
    }, [isOpen]);

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext('2d');
        ctx?.beginPath();
    };
    
    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        const { x, y } = getMousePos(e);
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
        const drawColor = 'rgba(0, 255, 0, 1)'; // Opaque color for drawing
        ctx.fillStyle = drawColor;
        ctx.strokeStyle = drawColor;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="프레임 수정" className="max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[85vh] overflow-y-auto">
                {/* Left Side: Images */}
                <div className="flex flex-col gap-4">
                    <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">원본 이미지</h4>
                        <div className="relative">
                            <img ref={imageRef} src={imageInfo.imageUrl} alt="Original Frame" className="w-full h-auto rounded-lg" />
                            <canvas 
                                ref={canvasRef} 
                                onMouseDown={startDrawing} 
                                onMouseUp={stopDrawing} 
                                onMouseOut={stopDrawing} 
                                onMouseMove={draw} 
                                className="absolute top-0 left-0"
                                style={{ opacity: isDrawing ? 1 : 0.4 }}
                            />
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-900 rounded-lg p-2 flex items-center justify-center min-h-[300px]">
                        <h4 className="absolute top-4 left-4 font-semibold text-white mb-2">수정된 이미지</h4>
                        {isLoading && <div className="text-center text-white"><svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>수정 중...</div>}
                        {editedImageUrl && <img src={editedImageUrl} alt="Edited Frame" className="max-w-full max-h-full object-contain rounded-md" />}
                        {!isLoading && !editedImageUrl && <p className="text-gray-500">수정 결과가 여기에 표시됩니다.</p>}
                    </div>
                </div>

                {/* Right Side: Controls */}
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="font-semibold text-white mb-2 block flex items-center gap-2"><Camera className="w-5 h-5"/>원하는 구도 (샷) 선택</label>
                        <div className="grid grid-cols-4 gap-2">
                            {SHOT_TYPES.map(shot => (
                                <Button key={shot} variant={selectedShots.includes(shot) ? 'primary' : 'secondary'} size="sm" onClick={() => setSelectedShots(prev => prev.includes(shot) ? prev.filter(s => s !== shot) : [...prev, shot])} className="text-xs !px-1 !py-1.5 capitalize">
                                    {shot}
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="font-semibold text-white mb-2 block flex items-center gap-2"><Brush className="w-5 h-5"/>부분 수정 (마스킹)</label>
                        <div className="bg-gray-700 p-2 rounded-md flex items-center gap-4">
                            <Button size="sm" variant={!isErasing ? 'primary' : 'secondary'} onClick={() => setIsErasing(false)} className="flex items-center gap-1"><Wand2 className="w-4 h-4"/>지정</Button>
                            <Button size="sm" variant={isErasing ? 'primary' : 'secondary'} onClick={() => setIsErasing(true)} className="flex items-center gap-1"><Eraser className="w-4 h-4"/>복구</Button>
                            <input type="range" min="10" max="80" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="flex-grow" />
                            <span className="text-white text-xs w-8 text-center">{brushSize}</span>
                            <Button size="sm" variant="ghost" onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0,0,canvasRef.current.width, canvasRef.current.height)}><Trash2 className="w-4 h-4"/></Button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="prompt" className="font-semibold text-white mb-2 block">프롬프트</label>
                        <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} placeholder="예: 'add a llama next to the image'" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"></textarea>
                    </div>

                    <div>
                        <label className="font-semibold text-white mb-2 block flex items-center gap-2"><UploadCloud className="w-5 h-5"/>참조 이미지 (최대 8장)</label>
                        <div className="grid grid-cols-4 gap-2">
                            {refPreviews.map((src, i) => <img key={i} src={src} className="w-full h-16 object-cover rounded-md" />)}
                            {refImages.length < 8 && 
                                <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:bg-gray-700">
                                    <UploadCloud className="w-6 h-6 text-gray-400"/>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            }
                        </div>
                    </div>

                    <Button onClick={handleGenerate} isLoading={isLoading} className="w-full mt-4" size="md">
                        <Wand2 className="w-5 h-5 mr-2"/> 실행
                    </Button>

                    <div className="flex justify-end gap-2 mt-auto pt-4">
                        <Button variant="secondary" onClick={onClose}><X className="w-4 h-4 mr-1"/>취소</Button>
                        <Button variant="ghost" onClick={resetState}><RotateCcw className="w-4 h-4 mr-1"/>초기화</Button>
                        <Button onClick={handleSave} disabled={!editedImageUrl || isLoading}><Save className="w-4 h-4 mr-1"/>저장</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};