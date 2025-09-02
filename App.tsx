
import React, { useState, useCallback } from 'react';
import ArticleInput from './components/ArticleInput';
import PromptDisplay from './components/PromptDisplay';
import ImageGallery from './components/ImageGallery';
import EditImageModal from './components/EditImageModal';
import ApiKeyInput from './components/ApiKeyInput';
import { generateImagePrompts, generateImage, editImage } from './services/geminiService';
import type { Prompt, PromptData, GeneratedImage } from './types';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini-api-key') || '');
    const [article, setArticle] = useState<string>('');
    const [prompts, setPrompts] = useState<PromptData | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isPromptLoading, setIsPromptLoading] = useState<boolean>(false);
    const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({});
    const [mainImageText, setMainImageText] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
    const [isEditingImage, setIsEditingImage] = useState<boolean>(false);

    const handleApiKeyChange = (key: string) => {
        setApiKey(key);
        if (key) {
            localStorage.setItem('gemini-api-key', key);
        } else {
            localStorage.removeItem('gemini-api-key');
        }
    };

    const handleGeneratePrompts = useCallback(async () => {
        if (!apiKey.trim()) {
            setError('APIキーを入力してください。');
            return;
        }
        if (!article.trim()) {
            setError('最初にブログ記事を貼り付けてください。');
            return;
        }
        setIsPromptLoading(true);
        setError(null);
        setPrompts(null);
        setGeneratedImages([]);
        setMainImageText('');
        try {
            const result = await generateImagePrompts(apiKey, article);
            setPrompts(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
        } finally {
            setIsPromptLoading(false);
        }
    }, [article, apiKey]);

    const handleGenerateImage = useCallback(async (prompt: Prompt) => {
        if (!apiKey.trim()) {
            setError('APIキーを入力してください。');
            return;
        }
        if (!prompts?.styleGuide) {
            setError('スタイルガイドが見つかりません。');
            return;
        }
        setImageLoadingStates(prev => ({ ...prev, [prompt.english]: true }));
        setError(null);
        try {
            const isMainPrompt = prompts?.mainPrompt.english === prompt.english;
            const textToOverlay = isMainPrompt ? mainImageText : undefined;

            const imageUrl = await generateImage(apiKey, prompt.english, prompts.styleGuide, textToOverlay);
            setGeneratedImages(prev => [...prev, { prompt, imageUrl, textOverlay: textToOverlay }]);
        } catch (err) {
            setError(err instanceof Error ? err.message : '画像生成中に不明なエラーが発生しました。');
        } finally {
            setImageLoadingStates(prev => ({ ...prev, [prompt.english]: false }));
        }
    }, [prompts, mainImageText, apiKey]);

    const handleStartEdit = (image: GeneratedImage) => {
        setEditingImage(image);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingImage(null);
    };

    const handleEditImage = useCallback(async (image: GeneratedImage, editText: string) => {
        if (!apiKey.trim()) {
            setError('APIキーを入力してください。');
            return;
        }
        if (!editText.trim()) {
            setError('編集指示を入力してください。');
            return;
        }
        setIsEditingImage(true);
        setError(null);
        try {
            const [header, data] = image.imageUrl.split(',');
            if (!header || !data) throw new Error('Invalid image URL format');
            const mimeTypeMatch = header.match(/:(.*?);/);
            if (!mimeTypeMatch || !mimeTypeMatch[1]) throw new Error('Could not determine mime type');
            const mimeType = mimeTypeMatch[1];
            
            const newImageUrl = await editImage(apiKey, data, mimeType, editText);

            setGeneratedImages(prev => 
                prev.map(img => 
                    img.prompt.english === image.prompt.english ? { ...img, imageUrl: newImageUrl, prompt: { ...img.prompt, english: `${img.prompt.english} (edited)` }} : img
                )
            );
            handleCloseEditModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : '画像編集中に不明なエラーが発生しました。');
        } finally {
            setIsEditingImage(false);
        }
    }, [apiKey]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                    <LogoIcon className="h-10 w-10 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">ブログ画像をかんたん作成 — Nano Banana</h1>
                        <p className="text-sm text-gray-500">記事を貼るだけ。プロンプト生成から画像の作成・編集までブラウザで完結</p>
                    </div>
                </div>
            </header>
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                            <strong className="font-bold">エラー: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    <ApiKeyInput apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />

                    <ArticleInput 
                        article={article}
                        setArticle={setArticle}
                        onGenerate={handleGeneratePrompts}
                        isLoading={isPromptLoading}
                    />

                    {prompts && (
                        <div className="mt-8">
                            <PromptDisplay 
                                prompts={prompts}
                                onGenerateImage={handleGenerateImage}
                                loadingStates={imageLoadingStates}
                                generatedImages={generatedImages}
                                mainImageText={mainImageText}
                                setMainImageText={setMainImageText}
                            />
                        </div>
                    )}

                    {generatedImages.length > 0 && (
                         <div className="mt-8">
                            <ImageGallery images={generatedImages} onStartEdit={handleStartEdit} />
                         </div>
                    )}
                </div>
            </main>

            <EditImageModal 
                image={editingImage}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onEdit={handleEditImage}
                isEditing={isEditingImage}
            />
        </div>
    );
};

export default App;
