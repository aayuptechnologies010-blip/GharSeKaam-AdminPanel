import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Edit2, X, Check, ImageIcon, AlertCircle } from 'lucide-react';
import { shopService } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ShopImage {
  id: string;
  shopkeeperId: string;
  imageurl: string;
  description: string;
  uploadedAt: string;
}


export default function ShopImageManager() {
  const [images, setImages] = useState<ShopImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shopService.getShopImages();
      
      if (data.success) {
        setImages(data.images || []);
      } else {
        setError('Failed to load images');
      }
    } catch (err) {
      setError('Error loading images');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage) return;

    try {
      setUploading(true);
      setError(null);
      
      const data = await shopService.addShopImage(newImage, newDescription);
      
      if (data.success && data.shopImage) {
        setImages([data.shopImage, ...images]);
        setNewImage(null);
        setNewDescription('');
        setPreviewUrl(null);
      } else {
        setError('Failed to upload image');
      }
    } catch (err) {
      setError('Error uploading image');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      setError(null);
      const data = await shopService.updateShopImage(id, editDescription);
      
      if (data.success && data.updated) {
        setImages(images.map(img => img.id === id ? data.updated : img));
        setEditingId(null);
        setEditDescription('');
      } else {
        setError('Failed to update image');
      }
    } catch (err) {
      setError('Error updating image');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      setError(null);
      const data = await shopService.deleteShopImage(id);
      
      if (data.success) {
        setImages(images.filter(img => img.id !== id));
      } else {
        setError('Failed to delete image');
      }
    } catch (err) {
      setError('Error deleting image');
      console.error(err);
    }
  };

  const startEdit = (image: ShopImage) => {
    setEditingId(image.id);
    setEditDescription(image.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDescription('');
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Shop Image Manager</h1>
          <p className="text-black">Upload and manage your shop images</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <p className="text-red-200">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-200 hover:text-white">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-black/2 backdrop-blur-lg rounded-xl p-6 mb-8 border border-black/20">
          <h2 className="text-2xl font-semibold text-black mb-4 flex items-center gap-2">
            <Upload size={24} />
            Upload New Image
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-black mb-2">Select Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full bg-black/5 border border-white/20 rounded-lg p-3 text-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
                required
              />
            </div>

            {previewUrl && (
              <div className="relative">
                <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-contain rounded-lg bg-black/20" />
              </div>
            )}

            <div>
              <Label className="block text-black mb-2">Image Type (Optional)</Label>
              <Select
                value={newDescription}
                onValueChange={(value) => setNewDescription(value)}
              >
                <SelectTrigger className="w-full bg-black/2 border border-black/20 rounded-lg p-3 text-black">
                  <SelectValue placeholder="Choose image type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main Banner 1">Main Banner 1</SelectItem>
                  <SelectItem value="Main Banner 2">Main Banner 2</SelectItem>
                  <SelectItem value="Main Banner 3">Main Banner 3</SelectItem>
                  <SelectItem value="Logo">Logo</SelectItem>
                  <SelectItem value="Offer Banner">Offer Banner</SelectItem>
                  <SelectItem value="Diwali Offer">Diwali Offer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                handleUpload(e);
              }}
              disabled={!newImage || uploading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload size={20} />
                  Upload Image
                </>
              )}
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <ImageIcon size={24} />
            Your Images ({images.length})
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              <p className="text-purple-200 mt-4">Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon size={48} className="mx-auto text-purple-300 mb-4" />
              <p className="text-purple-200">No images uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div key={image.id} className="bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-purple-400 transition-all">
                  <div className="aspect-video bg-black/20 relative">
                    <img
                      src={image.imageurl}
                      alt={image.description || 'Shop image'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    {editingId === image.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description"
                          className="w-full bg-white/10 border border-white/20 rounded p-2 text-black placeholder-purple-300/50 focus:outline-none focus:border-purple-400"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(image.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded flex items-center justify-center gap-2"
                          >
                            <Check size={16} />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded flex items-center justify-center gap-2"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-black font-medium mb-2 line-clamp-2">
                          {image.description || 'No description'}
                        </p>
                        <p className="text-black-300 text-sm mb-4">
                          {new Date(image.uploadedAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(image)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2"
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(image.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded flex items-center justify-center gap-2"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}