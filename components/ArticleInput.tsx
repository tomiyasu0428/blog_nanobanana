
import React from 'react';
import Loader from './Loader';
import { SparklesIcon } from './icons';

interface ArticleInputProps {
    article: string;
    setArticle: (article: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

const ArticleInput: React.FC<ArticleInputProps> = ({ article, setArticle, onGenerate, isLoading }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">1. ブログ記事を貼り付け</h2>
            <p className="text-gray-500 mb-4">AIがコンテンツを分析し、最適な画像プロンプトを作成します。</p>
            <textarea
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                placeholder="ブログ記事の全文をここに貼り付けてください..."
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-y"
                disabled={isLoading}
            />
            <button
                onClick={onGenerate}
                disabled={isLoading || !article.trim()}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300"
            >
                {isLoading ? (
                    <>
                        <Loader />
                        <span>プロンプトを生成中...</span>
                    </>
                ) : (
                    <>
                        <SparklesIcon className="h-5 w-5" />
                        <span>画像プロンプトを生成</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default ArticleInput;