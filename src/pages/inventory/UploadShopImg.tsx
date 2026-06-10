import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Edit2, X, Check, ImageIcon, AlertCircle, GalleryHorizontal } from 'lucide-react';
import { shopService } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => { fetchImages(); }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
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
    } catch {
      setError('Error uploading image');
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
    } catch {
      setError('Error updating image');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      setError(null);
      const data = await shopService.deleteShopImage(id);
      if (data.success) {
        setImages(images.filter(img => img.id !== id));
      } else {
        setError('Failed to delete image');
      }
    } catch {
      setError('Error deleting image');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-[#1e3a5f] bg-clip-text text-transparent">
          Shop Image Manager
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Upload and manage your storefront banners and promotional images
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="text-red-500 shrink-0 h-4 w-4" />
          <p className="text-red-700 text-sm font-semibold flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-600" />
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Upload className="h-5 w-5 text-amber-500" />
              Upload New Image
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-400">
              Add banners, logos, or promotional images to your storefront
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {/* File input */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Image</Label>
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-amber-50/20 transition-all duration-200 group">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-amber-500 transition-colors">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-xs font-bold">Click to browse image</span>
                  </div>
                )}
              </label>
              {newImage && (
                <p className="text-xs text-slate-500 font-semibold truncate">{newImage.name}</p>
              )}
            </div>

            {/* Image type select */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image Type</Label>
              <Select value={newDescription} onValueChange={setNewDescription}>
                <SelectTrigger className="h-10 border-slate-200 focus:border-amber-400 focus:ring-amber-400 rounded-xl">
                  <SelectValue placeholder="Choose image type..." />
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

            <Button
              onClick={handleUpload}
              disabled={!newImage || uploading}
              className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold rounded-xl py-5 transition-all"
            >
              {uploading ? (
                <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Uploading...</span>
              ) : (
                <span className="flex items-center gap-2"><Upload className="h-4 w-4" /> Upload Image</span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Image Gallery */}
        <div className="lg:col-span-2">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-600" />
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                <GalleryHorizontal className="h-5 w-5 text-amber-500" />
                Your Images
                <Badge className="ml-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                  {images.length} uploaded
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-video rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
                  <ImageIcon className="h-14 w-14 text-slate-200" />
                  <p className="font-bold text-slate-500">No images uploaded yet</p>
                  <p className="text-xs text-slate-400">Upload your first banner using the form on the left</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {images.map((image) => (
                    <div key={image.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-amber-300 hover:shadow-md transition-all duration-200">
                      <div className="aspect-video bg-slate-100 overflow-hidden">
                        <img
                          src={image.imageurl}
                          alt={image.description || 'Shop image'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 space-y-2">
                        {editingId === image.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Image description"
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-amber-400"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleUpdate(image.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-8 text-xs font-bold gap-1">
                                <Check className="h-3.5 w-3.5" /> Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditDescription(''); }} className="flex-1 h-8 text-xs font-bold rounded-lg">
                                <X className="h-3.5 w-3.5" /> Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700 truncate max-w-[160px]">
                                {image.description || 'No label'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                {new Date(image.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => { setEditingId(image.id); setEditDescription(image.description || ''); }} className="flex-1 h-8 text-xs font-bold rounded-lg border-slate-200 hover:border-blue-400 hover:text-blue-600 gap-1">
                                <Edit2 className="h-3.5 w-3.5" /> Edit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDelete(image.id)} className="flex-1 h-8 text-xs font-bold rounded-lg border-slate-200 hover:border-red-400 hover:text-red-600 gap-1">
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
