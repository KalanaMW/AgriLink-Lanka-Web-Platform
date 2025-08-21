import React, { useRef, useState } from 'react';
import axios from 'axios';

function ImageUpload({ value = [], onChange }) {
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handlePick = () => inputRef.current?.click();

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setError('');
    setIsUploading(true);
    try {
      const form = new FormData();
      files.forEach((f) => form.append('images', f));
      const res = await axios.post('/api/uploads/images', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = res.data?.images || [];
      onChange?.([...(value || []), ...uploaded]);
      inputRef.current.value = '';
    } catch (e) {
      setError(e?.response?.data?.error || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAt = (idx) => {
    const next = [...(value || [])];
    next.splice(idx, 1);
    onChange?.(next);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePick}
          className="px-3 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading…' : 'Upload Images'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
      </div>
      {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
      {!!(value && value.length) && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {value.map((img, idx) => (
            <div key={img.publicId || idx} className="relative group">
              <img
                src={img.url}
                alt={img.caption || 'Uploaded'}
                className="w-full h-32 object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-1 right-1 px-2 py-1 text-xs bg-white/90 border rounded shadow hover:bg-white"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;


