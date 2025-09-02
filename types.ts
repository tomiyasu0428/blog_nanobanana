export interface Prompt {
  english: string;
  japanese: string;
}

export interface PromptData {
  mainPrompt: Prompt;
  headingPrompts: Prompt[];
  styleGuide: string;
}

export interface GeneratedImage {
  prompt: Prompt;
  imageUrl: string;
  textOverlay?: string;
}