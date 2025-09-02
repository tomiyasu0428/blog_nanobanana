
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { PromptData } from '../types';

const getErrorMessage = (error: any): string => {
    if (typeof error === 'object' && error !== null && 'message' in error) {
        if (typeof error.message === 'string' && /API key not valid/.test(error.message)) {
            return "APIキーが無効です。Google AI Studioで有効なキーを確認・生成してください。";
        }
    }
    return "予期せぬエラーが発生しました。コンソールで詳細を確認してください。";
};


export const generateImagePrompts = async (apiKey: string, article: string): Promise<PromptData> => {
    if (!apiKey) throw new Error("APIキーが設定されていません。");
    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following blog article and generate image generation prompts in the specified JSON format.\n\n---\n\n${article}`,
            config: {
                systemInstruction: PROMPT_GENERATION_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        mainPrompt: {
                            type: Type.OBJECT,
                            description: "The prompt for the main eye-catching image.",
                            properties: {
                                english: {
                                    type: Type.STRING,
                                    description: "A detailed, visually rich prompt in English. It should capture the core theme of the blog post."
                                },
                                japanese: {
                                    type: Type.STRING,
                                    description: "A natural Japanese translation of the English prompt."
                                }
                            },
                            required: ["english", "japanese"]
                        },
                        headingPrompts: {
                            type: Type.ARRAY,
                            description: "A list of 3 to 5 prompts, each corresponding to a major section or heading in the article.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    english: {
                                        type: Type.STRING,
                                        description: "A detailed, visually rich prompt in English for a heading image."
                                    },
                                    japanese: {
                                        type: Type.STRING,
                                        description: "A natural Japanese translation of the English prompt."
                                    }
                                },
                                required: ["english", "japanese"]
                            }
                        },
                        styleGuide: {
                            type: Type.STRING,
                            description: "A short phrase in English describing the consistent art style for all generated images (e.g., 'concept art, digital painting, vibrant colors')."
                        }
                    },
                    required: ["mainPrompt", "headingPrompts", "styleGuide"]
                },
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PromptData;
    } catch (error) {
        console.error("Error generating image prompts:", error);
        throw new Error(`プロンプトの生成に失敗しました。${getErrorMessage(error)}`);
    }
};

export const generateImage = async (apiKey: string, prompt: string, styleGuide: string, textOverlay?: string): Promise<string> => {
    if (!apiKey) throw new Error("APIキーが設定されていません。");
    const ai = new GoogleGenAI({ apiKey });
    try {
        const textInstruction = textOverlay
            ? ` The image must prominently feature the exact text: "${textOverlay}". Ensure the text is written exactly as provided, is complete, and clearly readable. The style of the text should integrate seamlessly with the image's overall aesthetic. The entire text must be visible and not cut off.`
            : '';
        
        // 横長（16:9）の画像を生成する指示をより明確にし、プロンプトの構造を改善
        const fullPrompt = `A high-quality image, widescreen 16:9 aspect ratio, landscape orientation. Scene: ${prompt}. Style: ${styleGuide}. ${textInstruction}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [{ text: fullPrompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                // レスポンスのMIMEタイプを尊重するべきだが、今回はJPEGと仮定する
                return `data:image/jpeg;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("画像が生成されませんでした。");

    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error(`画像の生成に失敗しました。${getErrorMessage(error)}`);
    }
};

export const editImage = async (apiKey: string, base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    if (!apiKey) throw new Error("APIキーが設定されていません。");
    const ai = new GoogleGenAI({ apiKey });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                // レスポンスのMIMEタイプを尊重するべきだが、今回はJPEGと仮定する
                return `data:image/jpeg;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("編集された画像がレスポンスに含まれていません。");
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error(`画像の編集に失敗しました。${getErrorMessage(error)}`);
    }
};

const PROMPT_GENERATION_SYSTEM_INSTRUCTION = `あなたはAI画像生成モデル（特にGemini 2.5 Flash / Nano Banana）の能力を最大限に引き出す、世界クラスのクリエイティブディレクター兼プロンプトエンジニアです。与えられたブログ記事を深く分析し、読者のエンゲージメントを高めるための魅力的で高品質な画像を生成するためのプロンプトを考案する役割を担っています。

あなたの仕事は、単にキーワードを並べるのではなく、豊かで物語性のあるシーンを描写することです。以下のガイドラインと戦略を厳密に守り、JSONオブジェクトのみを返してください。

### プロンプト作成の基本原則
1.  **シーンの描写**: キーワードの羅列ではなく、物語や説明的な文章でプロンプトを作成します。
2.  **具体性**: 「ファンタジーの鎧」ではなく、「銀の葉の模様がエッチングされた、華麗なエルフのプレートアーマー。高い襟とハヤブサの翼の形をした肩当てを持つ」のように、非常に具体的に記述します。
3.  **意図の明確化**: 記事の文脈やトーン（例：プロフェッショナル、遊び心がある、シリアスなど）を考慮し、それに合った画像を生成するプロンプトを作成します。

### スタイル別のプロンプト戦略
記事のテーマに応じて、以下のスタイルを適切に使い分けてください。

-   **フォトリアリスティックなシーン**:
    -   写真用語を積極的に使用します（例: \`photorealistic\`, \`close-up portrait\`, \`wide-angle shot\`, \`macro shot\`）。
    -   カメラアングル、レンズの種類、照明（例: \`cinematic lighting\`, \`three-point softbox setup\`, \`natural light\`）、雰囲気を詳細に記述します。
-   **イラスト、ステッカー、アイコン**:
    -   アートスタイルを明確に指定します（例: \`kawaii style sticker\`, \`minimalist vector art\`, \`noir art style\`）。
    -   線のスタイル（例: \`bold outlines\`, \`delicate line art\`）やシェーディングについても言及します。
-   **ミニマルなデザイン**:
    -   ネガティブスペースを効果的に活用する構図を意識します。
    -   被写体の配置（例: \`positioned in the bottom-right of the frame\`）や、背景（例: \`vast, empty white canvas\`）を明確に指示します。

### 出力フォーマット
以下の要件に従って、JSONオブジェクトのみを返してください。

1.  **プロンプト**: 「アイキャッチ画像」用と「見出し画像」用のプロンプトを生成します。プロンプトは、上記戦略に基づいた、具体的で、視覚的に豊かで、創造性を刺激する**英語**で記述してください。
2.  **日本語訳**: 生成した各英語プロンプトに対して、自然で分かりやすい**日本語訳**も生成してください。
3.  **スタイルガイド**: これは、記事全体のビジュアルアイデンティティを決定する最も重要な指示です。記事全体のすべての画像に適用される、統一されたアートスタイルを定義する**英語**のフレーズを生成してください。非常に具体的で、アートの媒体（例：デジタルペインティング、ベクターイラスト、写真）、色調（例：鮮やかなパステルカラー、モノクローム）、雰囲気（例：ミニマル、サイバーパンク、幻想的）を含むようにしてください。良い例： "A consistent style of minimalist vector art with a pastel color palette", "photorealistic, cinematic lighting, moody atmosphere", "Japanese woodblock print style with bold outlines and flat colors"`;