
import React, { useState, useEffect } from 'react';
import type { GeneratedImage } from '../types';
import Loader from './Loader';
import { XIcon, EditIcon } from './icons';

interface EditImageModalProps {
    image: GeneratedImage | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (image: GeneratedImage, prompt: string) => void;
    isEditing: boolean;
}

const EditImageModal: React.FC<EditImageModalProps> = ({ image, isOpen, onClose, onEdit, isEditing }) => {
    const [editText, setEditText] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setEditText('');
        }
    }, [isOpen]);

    if (!isOpen || !image) {
        return null;
    }

    const handleEditClick = () => {
        onEdit(image, editText);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            aria-labelledby="edit-image-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 id="edit-image-modal-title" className="text-lg font-semibold text-gray-800">画像を編集</h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        aria-label="閉じる"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/2">
                            <p className="text-sm font-medium text-gray-600 mb-2">現在の画像</p>
                            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border">
                                <img src={image.imageUrl} alt="編集対象の画像" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="md:w-1/2 flex flex-col">
                             <label htmlFor="edit-prompt" className="text-sm font-medium text-gray-600 mb-2">編集指示</label>
                             <textarea
                                id="edit-prompt"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                placeholder="例：キャラクターを笑顔にしてください"
                                className="w-full flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-y"
                                disabled={isEditing}
                                rows={4}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse sm:items-center gap-3 rounded-b-xl">
                    <button
                        onClick={handleEditClick}
                        disabled={isEditing || !editText.trim()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        {isEditing ? (
                            <>
                                <Loader />
                                <span>編集中...</span>
                            </>
                        ) : (
                            <>
                                <EditIcon className="h-5 w-5" />
                                <span>編集を実行</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isEditing}
                        className="w-full sm:w-auto mt-2 sm:mt-0 bg-white text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        キャンセル
                    </button>
                </div>
                {/* FIX: The `jsx` and `global` props are not standard for the `<style>` element in React and cause a TypeScript error. Removing them resolves the issue. The styles will be applied globally as intended. */}
                <style>{`
                    @keyframes fadeInScale {
                        from { transform: scale(0.95); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    .animate-fade-in-scale {
                        animation: fadeInScale 0.3s ease-out forwards;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default EditImageModal;
