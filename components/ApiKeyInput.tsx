
import React from 'react';
import { KeyIcon } from './icons';

interface ApiKeyInputProps {
    apiKey: string;
    onApiKeyChange: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onApiKeyChange }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
            <label htmlFor="api-key-input" className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-1">
                <KeyIcon className="h-6 w-6 text-yellow-500" />
                <span>Google AI APIキー</span>
            </label>
            <p className="text-gray-500 mb-4">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google AI Studio</a>
                で取得したAPIキーを入力してください。キーはブラウザのローカルストレージに保存されます。
            </p>
            <input
                id="api-key-input"
                type="password"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="APIキーをここに貼り付け"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 font-mono"
                aria-label="Google AI APIキー"
            />
        </div>
    );
};

export default ApiKeyInput;
