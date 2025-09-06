import { GoogleGenAI, Type, Modality } from "@google/genai";
// FIX: Import Model and Product to resolve type errors.
import { Scene, OtherAIModel, Model, Product, Storyboard, StyleGuide } from "../types";
import apiKeyManager from './apiKeyManager';

const getApiKey = () => {
    const apiKey = apiKeyManager.getApiKey();
    if (!apiKey) {
        throw new Error('API 키가 설정되지 않았습니다. 설정 버튼을 눌러 API 키를 입력해주세요.');
    }
    return apiKey;
};

const getAI = () => {
    const apiKey = getApiKey();
    return new GoogleGenAI({ apiKey });
};


// Utility to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string)); // Return full data URL
        reader.onerror = error => reject(error);
    });
};

const base64UrlToPart = (base64Url: string) => {
    const match = base64Url.match(/data:(.*);base64,(.*)/);
    if (!match) {
        console.warn("Could not parse base64 data URL. Ensure the string is a valid data URL. Using raw string.");
        return {
            inlineData: {
                mimeType: 'image/jpeg', // Assume jpeg if parsing fails
                data: base64Url,
            },
        };
    }
    const mimeType = match[1];
    const data = match[2];
    return {
        inlineData: {
            mimeType,
            data,
        },
    };
};


export const generateStoryboard = async (
    topic: string, 
    story: string, 
    duration: number, 
    model: Model | null = null,
    product: Product | null = null
): Promise<Storyboard> => {
    console.log("Generating storyboard with Gemini:", { topic, story, duration, model, product });

    const sceneCount = Math.max(4, Math.ceil(duration / 2.5));
    const prompt = `You are a world-class AI Creative Director, tasked with generating a professional advertising scenario based on the "AI Ad Framework - Stage 2" guidelines. Your output must be a single, valid JSON object.

**Framework Summary:**

1.  **Structure First:** Choose a primary narrative structure (e.g., Problem-Solution, Reverse, Comparison, Emotional Journey).
2.  **Rhythm is Key:** Design the timing for maximum impact.
    *   **First 3s:** Hook the viewer immediately.
    *   **Midpoint:** Create an emotional or visual peak.
    *   **Last 5s:** Focus on the brand message, product, and Call to Action (CTA).
3.  **Detail is Everything:** Each scene requires precise descriptions of visuals (camera work, lighting), audio (BGM, SFX, V.O.), and brand integration.
4.  **AI-Ready:** Create concepts that are feasible for generation by AI image and video tools.

**User Input:**
*   Ad Topic: "${topic}"
*   Story: "${story || '자동 스토리 생성'}"
*   Ad Duration: ${duration} seconds
*   Model: ${model ? `"${model.name}" - ${model.description || '모델 설명'}` : '사용하지 않음'}
*   Product: ${product ? `"${product.name}" - ${product.description || '제품 설명'}` : '사용하지 않음'}

**Your Task:**
Generate a complete storyboard. The final output must be a single, valid JSON object with two top-level keys: "styleGuide" and "scenes".

**Creative Process:**

**Step 1: Core Concept Definition**
Analyze the Ad Topic ("${topic}"), the provided Story ("${story || '자동 생성'}"), Model information, and Product details to define the product category, target audience, and a single, powerful core message.
${story ? `Incorporate the user's story narrative into the storyboard while maintaining professional advertising standards.` : ''}
${model ? `Ensure the model character "${model.name}" appears consistently throughout the scenes as the main character.` : ''}
${product ? `Feature the product "${product.name}" prominently in appropriate scenes, especially in product shots and demonstrations.` : ''}

**Step 2: Narrative Structure & Rhythm**
Select a suitable storytelling structure (e.g., Problem-Solution, Reverse, etc.) and map out the narrative rhythm according to the ${duration}-second ad length.

**Step 3: Creative Direction (Style Guide)**
Define a cohesive style guide for visual and tonal consistency.

**Step 4: Detailed Scene-by-Scene Scenario**
Create a sequence of exactly ${sceneCount} scenes. The total duration of all scenes must sum up to approximately ${duration} seconds.

For each scene, you must provide:
*   **id**: A unique number for the scene.
*   **title (in Korean)**: Must follow the format: "장소 - 시간대 (시작초-종료초)". Example: "실내. 거실 - 아침 (0-3초)".
*   **description (in Korean)**: This is the most critical part. It must be a detailed prompt for an image/video generation AI, including:
    *   **Visuals:** Camera angle (e.g., 클로즈업), camera movement (e.g., 천천히 줌인), composition, character's specific action and expression.
    *   **Audio:** Describe the Background Music (BGM), essential Sound Effects (SFX), and any character Dialogue or Voiceover (V.O.).
    *   **Brand Integration:** Clearly specify how the product is featured (e.g., 자연스럽게 사용하는 모습, 제품 단독 클로즈업 샷).
*   **duration**: Scene duration in seconds.
*   **toneAndMood**: The emotional tone of the scene.
*   **costume**: The character's attire.
*   **background**: The setting of the scene.

**Mandatory Requirements:**
*   The storyboard must adhere to the timing rhythm (Hook, Peak, Message).
*   Include at least one 'product hero shot' or 'packshot'.
*   Ensure descriptions promote visual consistency for characters and settings across scenes.

**JSON Output Structure:**

1.  **"styleGuide"**: An object with keys: "artDirection", "colorPalette", "lightingStyle", "editingStyle", "overallToneAndMood".
2.  **"scenes"**: An array of exactly ${sceneCount} scene objects, each with the structure described in Step 4.

Do not include any markdown formatting (like \`\`\`json) in your output. The output must be a single, valid JSON object.`;


    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    styleGuide: {
                        type: Type.OBJECT,
                        properties: {
                            artDirection: { type: Type.STRING },
                            colorPalette: { type: Type.STRING },
                            lightingStyle: { type: Type.STRING },
                            editingStyle: { type: Type.STRING },
                            overallToneAndMood: { type: Type.STRING },
                        },
                        required: ["artDirection", "colorPalette", "lightingStyle", "editingStyle", "overallToneAndMood"],
                    },
                    scenes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.NUMBER },
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                duration: { type: Type.NUMBER },
                                toneAndMood: { type: Type.STRING },
                                costume: { type: Type.STRING },
                                background: { type: Type.STRING },
                            },
                            required: ["id", "title", "description", "duration", "toneAndMood", "costume", "background"],
                        }
                    }
                },
                required: ["styleGuide", "scenes"],
            }
        }
    });

    const storyboardData = JSON.parse(response.text);

    // Add placeholder images to each scene
    const scenesWithPlaceholders = storyboardData.scenes.map((scene: any) => ({
        ...scene,
        previewImages: [`https://picsum.photos/seed/${scene.id}placeholder/100/60`],
    }));

    return {
        ...storyboardData,
        scenes: scenesWithPlaceholders,
    };
};

export const generateModelSheet = async (name: string, description: string, images: File[], styleMode: 'realistic' | 'editorial' | 'cinematic' | 'artistic' | 'bw'): Promise<string> => {
    const styleDescriptions = {
        realistic: 'photorealistic, natural lighting, true-to-life textures and details',
        editorial: 'high-fashion editorial style, dramatic poses, magazine-quality lighting',
        cinematic: 'cinematic lighting with dramatic shadows, film-like color grading, movie poster quality',
        artistic: 'artistic interpretation with creative lighting, stylized but professional',
        bw: 'black and white with high contrast, professional monochrome photography'
    };

    const prompt = `Generate a ${styleDescriptions[styleMode]} character sheet based on the reference images for a character named '${name}' and described as: '${description}'.

The output must be a single image containing exactly 5 views, arranged horizontally in a single row on a neutral gray background:

**Character Views (5 views in order from left to right):**
1. FRONT view (정면) - facing camera directly
2. BACK view (후면) - showing the back of the character
3. LEFT SIDE view (좌측) - showing the left profile
4. FRONT view (정면) - facing camera directly (same as view 1)
5. RIGHT SIDE view (우측) - showing the right profile

**CRITICAL INSTRUCTIONS:**
- All 5 views must be FULL BODY shots showing the complete character from head to toe.
- The style must be **${styleDescriptions[styleMode]}** and perfectly consistent across all views.
- The character must maintain exact same appearance, clothing, and proportions in all 5 views.
- Arrange all 5 views in a SINGLE HORIZONTAL ROW.
- Each view should be clearly separated but part of one cohesive character sheet.
- The final image must be a **pure image only**. It must NOT contain any text, letters, numbers, labels, names, annotations, or watermarks. The image should be completely clean.
- ${styleMode === 'bw' ? 'The output must be in BLACK AND WHITE.' : 'The output should be in FULL COLOR with the specified style.'}
- Think of this as a professional character turnaround sheet used in animation/game production.`;

    console.log("Generating model sheet with prompt:", prompt);
    console.log(`Using ${images.length} reference images.`);

    const imageParts = await Promise.all(images.map(async (file) => {
        const base64Data = (await fileToBase64(file)).split(',')[1];
        return {
            inlineData: {
                data: base64Data,
                mimeType: file.type,
            },
        };
    }));

    const textPart = { text: prompt };

    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts: [ ...imageParts, textPart ] },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
    if (imagePart && imagePart.inlineData) {
        const base64ImageBytes = imagePart.inlineData.data;
        return `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
    } else {
        throw new Error("API did not return an image.");
    }
};


export const generateSceneFrames = async (scene: Scene, model: Model, product: Product, styleGuide: StyleGuide): Promise<{ startFrame: string; endFrame: string; prompt: string; }> => {
    console.log("Generating frames for scene with Nanobanana:", scene.title);
    
    const modelImagePart = base64UrlToPart(model.sheetImage);
    const productImagePart = base64UrlToPart(product.image);

    const basePrompt = `Generate a photorealistic ad frame for '${product.name}' featuring model '${model.name}'.
This frame MUST strictly adhere to the following creative direction:
- Overall Art Direction: ${styleGuide.artDirection}
- Color Palette: ${styleGuide.colorPalette}
- Lighting Style: ${styleGuide.lightingStyle}

**Crucially, the output image MUST have a widescreen 16:9 aspect ratio.**
**Crucially, the model's appearance (face, body type, and hair) MUST be consistent with the provided character sheet image across ALL scenes.**
**Crucially, for any scenes that share the same background/setting, the visual details of that background must remain consistent.**
**Crucially, the output image must be a pure image with NO text, subtitles, watermarks, or logos.**
Use the provided product reference image for visual consistency.

Scene Details:
- Scene description: "${scene.description}"
- Scene Tone and Mood: "${scene.toneAndMood}"
- Model's Costume: "${scene.costume}"
- Background/Setting: "${scene.background}"`;
    
    const commonConfig = {
        model: 'gemini-2.5-flash-image-preview',
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    };

    const getImageUrl = (response: any, frameType: 'start' | 'end') => {
        // Check for explicit blocking first, this is the most common reason for no image.
        if (response?.promptFeedback?.blockReason) {
            const errorMessage = `Image generation for ${frameType} frame was blocked. Reason: ${response.promptFeedback.blockReason}. Details: ${JSON.stringify(response.promptFeedback.safetyRatings)}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        const candidate = response.candidates?.[0];

        if (!candidate) {
            throw new Error(`API returned no candidates for ${frameType} frame. Full response: ${JSON.stringify(response)}`);
        }
        
        const imagePart = candidate.content?.parts.find((part: any) => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
        
        // If we got here, there's a candidate but no image part.
        const textPart = candidate.content?.parts.find((part: any) => part.text);
        let errorMessage = `API did not return an image for the ${frameType} frame.`;
        if (textPart && textPart.text) {
            errorMessage += ` Response text: "${textPart.text}"`;
        } else {
             errorMessage += ` Full response: ${JSON.stringify(response)}`;
        }
        // Also log the finish reason if available
        if (candidate.finishReason) {
             errorMessage += ` Finish Reason: ${candidate.finishReason}.`;
        }
        console.error(errorMessage);
        throw new Error(errorMessage);
    };

    // 1. Generate Start Frame
    const startPrompt = `${basePrompt}\nThis is the STARTING frame of the scene. It should establish the initial action and pose.`;
    const startFrameResponse = await getAI().models.generateContent({
        ...commonConfig,
        contents: { parts: [modelImagePart, productImagePart, { text: startPrompt }] },
    });
    const startFrame = getImageUrl(startFrameResponse, 'start');
    const startFramePart = base64UrlToPart(startFrame); // Convert result for next API call

    // 2. Generate End Frame using Start Frame as reference
    const endPrompt = `${basePrompt}\nThis is the ENDING frame of the scene. It must show a logical progression from the provided STARTING frame image. Use the starting frame as a direct visual reference to ensure absolute consistency in character appearance, costume, lighting, background, and overall mood. However, the ENDING frame MUST feature a **different camera angle, shot, or character pose** than the STARTING frame, representing a natural continuation of the scene's action.`;
    const endFrameResponse = await getAI().models.generateContent({
        ...commonConfig,
        contents: { parts: [modelImagePart, productImagePart, startFramePart, { text: endPrompt }] },
    });
    const endFrame = getImageUrl(endFrameResponse, 'end');

    return {
        startFrame,
        endFrame,
        prompt: basePrompt,
    };
};

export const generateMidjourneyPrompt = async (originalPrompt: string, sceneDescription: string, frameType: 'start' | 'end'): Promise<string> => {
    console.log(`Generating Block-structured prompt for ${frameType} frame`);
    const frameSpecificContext = frameType === 'start' 
        ? 'establishing shot that introduces the scene' 
        : 'closing shot that concludes the scene action';

    const prompt = `You are a world-class prompt engineer specializing in block-structured prompts for image generation. Your task is to convert a scene description into a highly structured, block-based prompt format.

**Scene Description:** "${sceneDescription}"
**Original Prompt Context:** "${originalPrompt}"
**Frame Type:** ${frameType} frame - ${frameSpecificContext}

**CRITICAL INSTRUCTIONS:**
Generate a block-structured prompt using EXACTLY this format with semicolon separators. Each block must be labeled with its category in CAPS followed by a colon, then the value. Use the following structure:

STYLE: [artistic style, genre];
MEDIUM: [photorealistic/illustrated/3D rendered];
ERA/CULTURAL_REF: [time period or cultural reference if applicable];
CAMERA: [camera angle and shot type - ${frameType === 'start' ? 'wide angle establishing shot' : 'close-up or medium shot'}];
SCENE: [main action or subject description];
LOCATION: [primary location];
LOCATION_DETAIL: [specific details about the location];
TIME_LIGHTING: [time of day];
ARTIFICIAL_LIGHT: [artificial light sources if any];
LIGHTING_TECHNIQUE: [lighting style and technique];
ATMOSPHERE: [mood and emotional tone];
FOREGROUND: [foreground elements];
BACKGROUND: [background elements];
COLOR_TONE: [dominant colors and color grading];
CAMERA_TECH: [camera/lens specifications];
QUALITY: [quality descriptors];
PARAMETERS: --ar 16:9 --style raw --v 6.1 --quality 2

**Example format:**
STYLE: modern commercial photography; MEDIUM: photorealistic; CAMERA: wide angle establishing shot; SCENE: woman enjoying coffee in modern cafe; LOCATION: urban coffee shop; LOCATION_DETAIL: minimalist interior with large windows; TIME_LIGHTING: golden hour morning; ARTIFICIAL_LIGHT: warm pendant lights; LIGHTING_TECHNIQUE: soft natural lighting with warm tones; ATMOSPHERE: peaceful, sophisticated; FOREGROUND: coffee cup with steam; BACKGROUND: blurred cafe interior; COLOR_TONE: warm browns, cream highlights; CAMERA_TECH: shot on 35mm lens, shallow depth of field; QUALITY: highly detailed, professional photography; PARAMETERS: --ar 16:9 --style raw --v 6.1 --quality 2

Output ONLY the block-structured prompt as a single line with semicolon separators, without any additional explanation or formatting.`;

    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text.trim();
};

export const adaptPromptForOtherAI = async (originalPrompt: string, sceneDescription: string, startFrame: string, targetAI: OtherAIModel): Promise<string> => {
    console.log(`Adapting prompt for ${targetAI}`);

    if (targetAI === OtherAIModel.VEO3) {
        const prompt = `You are an expert prompt engineer for Google's VEO-3 video generation AI.
Based on the provided starting image and scene description, create an optimized JSON object for video generation.

**Scene Description:** "${sceneDescription}"
**Original Image Prompt Context:** "${originalPrompt}"

The JSON output should have the following structure:
{
  "prompt": "A detailed description of the main action and subject.",
  "motion": {
    "camera_movement": "Describe a specific, cinematic camera movement (e.g., 'slow dolly in', 'crane shot ascending').",
    "subject_movement": "Describe the subtle movements of the character or objects in the scene."
  },
  "style": {
    "aesthetic": "Keywords defining the visual style (e.g., 'cinematic, hyperrealistic, 8K, soft natural lighting').",
    "color_grade": "Describe the color grading (e.g., 'warm tones, high contrast, muted blues')."
  },
  "negative_prompt": "text, watermark, blurry, deformed hands"
}

Fill in the values based on the provided context to create a dynamic and visually stunning short video clip. The entire output must be a single, valid JSON object, without any surrounding text or markdown.`;

        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
             config: {
                responseMimeType: "application/json",
            }
        });
        
        try {
            const parsed = JSON.parse(response.text);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return response.text;
        }
    }


    const prompt = `You are an expert prompt engineer for video generation AIs.
Based on the provided starting image and the scene description, create a highly effective, dynamic video prompt optimized for '${targetAI}'.

**Scene Description:** "${sceneDescription}"
**Original Image Prompt Context:** "${originalPrompt}"

Your generated prompt should:
1. Start from the state of the provided image.
2. Incorporate dynamic camera movements (e.g., dolly in, crane up, slow pan left, tracking shot).
3. Use varied and evocative camera angles and compositions (e.g., low-angle shot, over-the-shoulder, wide shot).
4. Describe a smooth, logical transition that brings the scene to life over a few seconds.
5. Be concise and powerful. Output only the final prompt string, without any additional explanation or markdown.`;

    const startFramePart = base64UrlToPart(startFrame);
    
    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [startFramePart, { text: prompt }] },
    });
    
    return response.text.trim();
};

// FIX: Add generateVideo function to resolve error in VideoModal.tsx.
// This function generates a video using the VEO model.
export const generateVideo = async (
    prompt: string,
    startFrame: string,
    endFrame: string, // Note: Not used by the Veo API according to provided guidelines, but kept for signature consistency.
    sceneDuration: number // Note: Not used by the Veo API, but kept for signature consistency.
): Promise<string> => {
    console.log("Generating video with Gemini VEO:", { prompt, sceneDuration });

    const imagePart = base64UrlToPart(startFrame);

    let operation = await getAI().models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        image: {
            imageBytes: imagePart.inlineData.data,
            // FIX: Correctly access mimeType from imagePart.inlineData.
            mimeType: imagePart.inlineData.mimeType,
        },
        config: {
            numberOfVideos: 1
        }
    });

    // Poll for completion
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
        operation = await getAI().operations.getVideosOperation({ operation: operation });
        console.log('Checking video generation status...', operation.done);
    }

    if (operation.error) {
        // The error object type is not explicitly exported, so using 'any'
        const error = operation.error as any;
        throw new Error(`Video generation failed: ${error.message}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error("Video generation succeeded but no download link was returned.");
    }

    // The download link requires the API key. We fetch it and return a blob URL.
    const apiKey = getApiKey();
    if (apiKey === "MISSING_API_KEY") {
        console.error("API Key is missing. Video download will fail.");
        throw new Error("Cannot download video without API key.");
    }

    const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!videoResponse.ok) {
        const errorText = await videoResponse.text();
        throw new Error(`Failed to download video file: ${videoResponse.statusText}. Details: ${errorText}`);
    }
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};


export const generateStoryboardSummary = async (storyboard: Storyboard): Promise<string> => {
    const fullStory = storyboard.scenes.map(s => `장면 ${s.id}: ${s.title} - ${s.description}`).join('\n');
    const prompt = `다음의 광고 스토리보드를 바탕으로 전체 시나리오를 한 단락으로 요약해줘. 한국어로 작성해줘.\n\n${fullStory}`;
    
    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
};

export const editImage = async (
    originalImage: string,
    prompt: string,
    shotTypes: string[],
    maskImage?: string,
    referenceImages?: string[]
): Promise<string> => {
    console.log("Editing image with Nanobanana:", { prompt, shotTypes, hasMask: !!maskImage, refCount: referenceImages?.length });

    const parts = [];

    // 1. Original Image
    parts.push(base64UrlToPart(originalImage));

    // 2. Mask Image (if provided)
    if (maskImage) {
        parts.push(base64UrlToPart(maskImage));
    }

    // 3. Reference Images (if provided)
    if (referenceImages) {
        referenceImages.forEach(ref => parts.push(base64UrlToPart(ref)));
    }

    // 4. Text Prompt
    const fullPrompt = `Edit the provided image.
- **Shot Types to apply:** ${shotTypes.join(', ') || 'None'}
- **User's instructions:** ${prompt}
- **Crucially, the final edited image must maintain a widescreen 16:9 aspect ratio.**
${maskImage ? 'Apply the changes ONLY to the masked area.' : ''}`;
    parts.push({ text: fullPrompt });

    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
    if (imagePart && imagePart.inlineData) {
        const base64ImageBytes = imagePart.inlineData.data;
        return `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
    } else {
        // Fallback to a placeholder if API fails
        console.error("API did not return an image for editing.");
        return "https://placehold.co/600x400/ff0000/FFFFFF/png?text=Error";
    }
};


export const generateSunoPrompt = async (styleGuide: StyleGuide, storyboard: Storyboard): Promise<{ stylePrompt: string; lyrics: string; }> => {
    const storySummary = await generateStoryboardSummary(storyboard);
    const prompt = `You are a world-class AI Music Director for advertisements. Based on the provided creative direction and storyboard summary, generate an optimized prompt for the Suno AI music generator.
Your output must be a single, valid JSON object with two keys: "stylePrompt" and "lyrics".

**Creative Direction (Style Guide):**
- Art Direction: ${styleGuide.artDirection}
- Color Palette: ${styleGuide.colorPalette}
- Lighting Style: ${styleGuide.lightingStyle}
- Editing Style: ${styleGuide.editingStyle}
- Overall Tone & Mood: ${styleGuide.overallToneAndMood}

**Storyboard Summary:**
"${storySummary}"

**Your Task:**
1.  **Analyze:** Synthesize the style guide and summary to understand the ad's core emotion, pacing, and message.
2.  **Create Style Prompt:** Generate a \`stylePrompt\` for Suno. This should be a comma-separated list of keywords describing the genre, mood, instrumentation, tempo, and vocal style. Example: "Uplifting Corporate Pop, inspiring piano melody, gentle female vocals, modern drum beat, hopeful, cinematic".
3.  **Write Lyrics:** Write short, impactful \`lyrics\` that align with the storyboard. If the ad is instrumental, return an empty string for the "lyrics" value. The lyrics should be in Korean, matching the ad's context.

Output only the JSON object.`;
    
    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    stylePrompt: { type: Type.STRING, description: "A comma-separated list of keywords for Suno's style prompt." },
                    lyrics: { type: Type.STRING, description: "The lyrics for the song. Empty string if instrumental." },
                },
                required: ["stylePrompt", "lyrics"],
            }
        }
    });

    return JSON.parse(response.text);
};

export const rewriteScene = async (scene: Scene, editRequest: string): Promise<{ title: string; description: string; }> => {
    const prompt = `You are a world-class AI Script Writer. You need to rewrite a scene based on the user's edit request.

**Original Scene:**
- Title: ${scene.title}
- Description: ${scene.description}
- Duration: ${scene.duration} seconds

**User's Edit Request:**
"${editRequest}"

**Your Task:**
Rewrite the scene based on the edit request while maintaining the scene's duration and core purpose within the overall storyboard.
The output must be a single, valid JSON object with keys "title" and "description".`;

    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The new scene title" },
                    description: { type: Type.STRING, description: "The new scene description" },
                },
                required: ["title", "description"],
            }
        }
    });

    return JSON.parse(response.text);
};

export const generateSceneRewriteSuggestion = async (
    previousScene: Scene | null, 
    currentScene: Scene, 
    nextScene: Scene | null
): Promise<string> => {
    const context = [];
    if (previousScene) {
        context.push(`**Previous Scene (Scene ${previousScene.id}):**\n- Title: ${previousScene.title}\n- Description: ${previousScene.description}`);
    }
    context.push(`**Current Scene (Scene ${currentScene.id}):**\n- Title: ${currentScene.title}\n- Description: ${currentScene.description}`);
    if (nextScene) {
        context.push(`**Next Scene (Scene ${nextScene.id}):**\n- Title: ${nextScene.title}\n- Description: ${nextScene.description}`);
    }

    const prompt = `You are a world-class AI Creative Director. Analyze the current scene within its context and suggest an improvement.

${context.join('\n\n')}

**Your Task:**
Suggest ONE specific improvement for the current scene that would enhance its impact while maintaining narrative flow with adjacent scenes.
Focus on visual storytelling, emotional resonance, or pacing improvements.
Provide a concise suggestion in Korean (1-2 sentences).`;

    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text.trim();
};

export const generateMidjourneyPrompt = async (
    originalPrompt: string, 
    sceneDescription: string, 
    frameType: 'start' | 'end'
): Promise<string> => {
    const prompt = `You are an expert at creating Midjourney prompts for advertisement storyboards.

**Scene Description:**
${sceneDescription}

**Original Frame Generation Prompt:**
${originalPrompt}

**Frame Type:** ${frameType === 'start' ? 'Starting Frame' : 'Ending Frame'}

**Your Task:**
Create an optimized Midjourney prompt for the ${frameType} frame of this scene.
Include specific style parameters, camera angles, lighting, and Midjourney parameters.
The prompt should be concise but detailed, following Midjourney best practices.

Example format:
"[subject description], [environment], [lighting], [camera angle], [style], [mood], --ar 16:9 --v 6 --style raw"`;

    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text.trim();
};

export const generateVideo = async (
    prompt: string,
    startFrame: string,
    endFrame: string,
    duration: number
): Promise<string> => {
    // This is a placeholder for VEO video generation
    // In production, this would integrate with Google's VEO API
    console.log("Generating video with VEO:", { prompt, duration });
    
    // For now, return a placeholder video URL
    // You would replace this with actual VEO API integration
    return `https://storage.googleapis.com/veo-sample-videos/placeholder-${Date.now()}.mp4`;
};