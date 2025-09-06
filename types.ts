export interface Scene {
  id: number;
  title: string;
  description: string;
  duration: number;
  previewImages: string[]; // Base64 or URL
  toneAndMood: string;
  costume: string;
  background: string;
  complexity?: string; // 'Simple' or 'Complex'
  sceneDetails?: SceneDetails;
  videoUrl?: string;
}

export interface Model {
  name: string;
  description?: string;
  sheetImage: string; // Base64 or URL
}

export interface Product {
  name: string;
  images: string[]; // Base64 or URL array
}

export interface SceneDetails {
  startFrame: string; // Base64 or URL
  endFrame: string; // Base64 or URL
  prompt: string;
}

export enum OtherAIModel {
  VEO3 = 'VEO-3',
  KLING = 'Kling',
  HAILUO = 'HaiLuo',
  HICKSFIELD = 'Hicksfield',
}

export interface AdaptedPrompts {
  [OtherAIModel.VEO3]?: string;
  [OtherAIModel.KLING]?: string;
  [OtherAIModel.HAILUO]?: string;
  [OtherAIModel.HICKSFIELD]?: string;
}

export interface StyleGuide {
  artDirection: string;
  colorPalette: string;
  lightingStyle: string;
  editingStyle: string;
  overallToneAndMood: string;
}

export interface Storyboard {
  styleGuide: StyleGuide;
  scenes: Scene[];
}

export interface EditingImageInfo {
  sceneId: number;
  frameType: 'start' | 'end';
  imageUrl: string;
}