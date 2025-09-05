
import React, { useState, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Product } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave }) => {
  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleFileChange(event.dataTransfer.files);
  }, []);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleSave = () => {
    if (productName && preview) {
      onSave({ name: productName, image: preview });
      onClose();
      // Reset state for next time
      setProductName('');
      setProductImage(null);
      setPreview(null);
    } else {
        alert("제품 이름과 이미지를 모두 입력해주세요.")
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="제품 추가" className="max-w-lg">
      <div className="space-y-6">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-1">제품 이름</label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">제품 이미지</label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer"
          >
            <div className="space-y-1 text-center">
              {preview ? (
                <img src={preview} alt="Product preview" className="mx-auto h-48 w-auto rounded-md" />
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-indigo-500">
                      <span>파일 업로드</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files)} accept="image/*" />
                    </label>
                    <p className="pl-1">또는 드래그 앤 드롭</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button onClick={handleSave} disabled={!productName || !productImage}>제품 저장</Button>
        </div>
      </div>
    </Modal>
  );
};
