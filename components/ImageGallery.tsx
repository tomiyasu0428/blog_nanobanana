
import React from 'react';
import type { GeneratedImage } from '../types';
import { ClipboardIcon, DownloadIcon, TextIcon, EditIcon } from './icons';

const ImageCard: React.FC<{ image: GeneratedImage; onEdit: (image: GeneratedImage) => void; }> = ({ image, onEdit }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(image.prompt.english);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 group transform hover:-translate-y-1 transition-transform duration-300">
            <div className="aspect-w-16 aspect-h-9">
                 <img src={image.imageUrl} alt={image.prompt.english} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
                <p className="text-sm text-gray-800">{image.prompt.japanese}</p>
                <p className="text-xs text-gray-500 h-10 overflow-hidden italic mt-1">"{image.prompt.english}"</p>
                {image.textOverlay && (
                    <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded-md flex items-center gap-2">
                            <TextIcon className="h-4 w-4 text-gray-500" />
                            <span>挿入テキスト: <strong>{image.textOverlay}</strong></span>
                    </div>
                )}
                 <div className="flex items-center justify-end gap-2 mt-3">
                    <button onClick={() => onEdit(image)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors" title="この画像を編集">
                        <EditIcon className="h-5 w-5" />
                    </button>
                    <button onClick={handleCopy} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors" title="英語プロンプトをコピー">
                        <ClipboardIcon className="h-5 w-5" />
                    </button>
                    {copied && <span className="text-xs text-indigo-600">コピーしました！</span>}
                    <a href={image.imageUrl} download={`generated-image-${Date.now()}.jpg`} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-emerald-600 transition-colors" title="画像をダウンロード">
                        <DownloadIcon className="h-5 w-5" />
                    </a>
                </div>
            </div>
        </div>
    );
};

const ImageGallery: React.FC<{ images: GeneratedImage[]; onStartEdit: (image: GeneratedImage) => void; }> = ({ images, onStartEdit }) => {
    if (images.length === 0) {
        return null;
    }
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">3. 生成されたアセット</h2>
            <p className="text-gray-500 mb-6">作成された画像です。プロンプトをコピーしたり、画像をダウンロード・編集できます。</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {images.map((image, index) => (
                    <ImageCard key={index} image={image} onEdit={onStartEdit} />
                ))}
            </div>
        </div>
    );
};

export default ImageGallery;
