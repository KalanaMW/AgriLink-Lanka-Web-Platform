import React, { useState } from 'react';
import ImageUpload from '../../components/upload/ImageUpload';

function CreateProductPage() {
  const [images, setImages] = useState([]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-semibold mb-4">Create Product</h1>
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <div className="mt-2">
            <ImageUpload value={images} onChange={setImages} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input className="mt-1 block w-full border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input type="number" className="mt-1 block w-full border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea className="mt-1 block w-full border-gray-300 rounded-md" rows="4" />
        </div>
        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Save</button>
      </form>
    </div>
  );
}

export default CreateProductPage;


