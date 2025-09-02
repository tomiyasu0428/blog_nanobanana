import React from 'react';
import type { Prompt, PromptData, GeneratedImage } from '../types';
import Loader from './Loader';
import { ImageIcon, CheckCircleIcon, PaletteIcon, TextIcon } from './icons';

interface PromptDisplayProps {
    prompts: PromptData;
    onGenerateImage: (prompt: Prompt) => void;
    loadingStates: { [key: string]: boolean };
    generatedImages: GeneratedImage[];
    mainImageText: string;
    setMainImageText: (text: string) => void;
}

interface PromptCardProps {
    prompt: Prompt;
    onGenerate: (prompt: Prompt) => void;
    isLoading: boolean;
    isGenerated: boolean;
    isMainPrompt?: boolean;
    textOverlay?: string;
    onTextOverlayChange?: (text: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({
    prompt,
    onGenerate,
    isLoading,
    isGenerated,
    isMainPrompt = false,
    textOverlay,
    onTextOverlayChange,
}) => {
    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="text-gray-800">{prompt.japanese}</p>
                    <p className="text-gray-500 text-sm italic mt-1">"{prompt.english}"</p>
                </div>
                <button
                    onClick={() => onGenerate(prompt)}
                    disabled={isLoading || isGenerated}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 whitespace-nowrap"
                >
                    {isLoading ? (
                        <>
                            <Loader />
                            <span>生成中...</span>
                        </>
                    ) : isGenerated ? (
                        <>
                            <CheckCircleIcon className="h-5 w-5" />
                            <span>生成済み</span>
                        </>
                    ) : (
                        <>
                            <ImageIcon className="h-5 w-5" />
                            <span>画像を生成</span>
                        </>
                    )}
                </button>
            </div>
            {isMainPrompt && (
                <div className="border-t border-gray-200 pt-4">
                    <label htmlFor="text-overlay-input" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <TextIcon className="h-4 w-4" />
                        画像に挿入するテキスト（任意）
                    </label>
                    <input
                        id="text-overlay-input"
                        type="text"
                        value={textOverlay}
                        onChange={(e) => onTextOverlayChange?.(e.target.value)}
                        placeholder="例：ブログのタイトル"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200"
                        disabled={isLoading || isGenerated}
                    />
                </div>
            )}
        </div>
    );
};


const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompts, onGenerateImage, loadingStates, generatedImages, mainImageText, setMainImageText }) => {
    const generatedPrompts = new Set(generatedImages.map(img => img.prompt.english));

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">2. 画像を生成</h2>
            <p className="text-gray-500 mb-6">プロンプトをクリックして画像を生成します。すべての画像は下のスタイルガイドに基づいて生成されます。</p>
            
            <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                 <h3 className="text-lg font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                    <PaletteIcon className="h-5 w-5" />
                    <span>共通スタイルガイド</span>
                </h3>
                <p className="text-indigo-800 font-mono bg-indigo-100 px-2 py-1 rounded-md inline-block">{prompts.styleGuide}</p>
            </div>
            
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">メインアイキャッチ画像プロンプト</h3>
                    <PromptCard 
                        prompt={prompts.mainPrompt}
                        onGenerate={onGenerateImage}
                        isLoading={loadingStates[prompts.mainPrompt.english]}
                        isGenerated={generatedPrompts.has(prompts.mainPrompt.english)}
                        isMainPrompt={true}
                        textOverlay={mainImageText}
                        onTextOverlayChange={setMainImageText}
                    />
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">見出し画像プロンプト</h3>
                    <div className="space-y-3">
                        {prompts.headingPrompts.map((prompt, index) => (
                           <PromptCard 
                                key={index}
                                prompt={prompt}
                                onGenerate={onGenerateImage}
                                isLoading={loadingStates[prompt.english]}
                                isGenerated={generatedPrompts.has(prompt.english)}
                           />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptDisplay;