"use client"
import { CloudinaryUploadWidgetInfo } from 'next-cloudinary';
import { useState, useEffect } from "react";
import imageCompression from 'browser-image-compression';
import { useProducts, Product } from '@/hooks/useProducts';

type ViewMode = 'add' | 'manage';
type EditingProduct = Product & { newImages?: File[] };

export default function admin() {
    const [viewMode, setViewMode] = useState<ViewMode>('manage');
    const [resource, setResource] = useState<string | CloudinaryUploadWidgetInfo | undefined>();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        variantCount: ''
    });
    const [colorVariants, setColorVariants] = useState<{ color: string; images: File[] }[]>([]);
    const [isCompressing, setIsCompressing] = useState(false);
    
    // Product management states
    const { products, loading, error, pagination, loadProducts, refresh } = useProducts(1, 20);
    const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
    const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Image compression function
    const compressImage = async (file: File): Promise<File> => {
        const options = {
            maxSizeMB: 8, // Maximum file size in MB (well under Cloudinary's 10MB limit)
            maxWidthOrHeight: 1920, // Maximum width or height
            useWebWorker: true, // Use web worker for better performance
            fileType: 'image/jpeg', // Convert to JPEG for better compression
            quality: 0.8 // Quality between 0-1
        };

        try {
            console.log(`Compressing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            const compressedFile = await imageCompression(file, options);
            console.log(`Compressed to: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            
            // Create a new file with original name but .jpg extension
            const fileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            return new File([compressedFile], fileName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
            });
        } catch (error) {
            console.error('Error compressing image:', error);
            throw new Error(`Failed to compress ${file.name}`);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleVariantGeneration = () => {
        const count = parseInt(formData.variantCount);
        if (count > 0) {
            const newVariants = Array(count).fill(null).map(() => ({ color: '', images: [] as File[] }));
            setColorVariants(newVariants);
            setStep(1); // Move to variant step
        }
    };

    const handleColorChange = (index: number, color: string) => {
        setColorVariants(prev => 
            prev.map((variant, i) => 
                i === index ? { ...variant, color } : variant
            )
        );
    };

    const handleVariantImageSelect = async (index: number, newFiles: File[]) => {
        setIsCompressing(true);
        
        try {
            // Compress all new files
            const compressedFiles = await Promise.all(
                newFiles.map(file => compressImage(file))
            );

            setColorVariants(prev => 
                prev.map((variant, i) => 
                    i === index ? { ...variant, images: [...variant.images, ...compressedFiles] } : variant
                )
            );
        } catch (error) {
            console.error('Error compressing images:', error);
            alert('Failed to compress images. Please try with smaller files.');
        } finally {
            setIsCompressing(false);
        }
    };

    const removeVariantImage = (variantIndex: number, imageIndex: number) => {
        setColorVariants(prev => 
            prev.map((variant, i) => 
                i === variantIndex 
                    ? { ...variant, images: variant.images.filter((_, idx) => idx !== imageIndex) }
                    : variant
            )
        );
    };

    // Delete product handler
    const handleDeleteProduct = async (productId: number) => {
        if (!confirm('Are you sure you want to delete this product? This will also delete all associated images from Cloudinary.')) {
            return;
        }

        setDeletingProductId(productId);

        try {
            const response = await fetch(`/api/delete-product/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            alert('Product and images deleted successfully!');
            refresh(); // Refresh the product list
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        } finally {
            setDeletingProductId(null);
        }
    };

    // Edit product handler
    const handleEditProduct = (product: Product) => {
        setEditingProduct({ ...product });
    };

    // Update product handler
    const handleUpdateProduct = async () => {
        if (!editingProduct) return;

        setIsSubmitting(true);

        try {
            let imageURLs = editingProduct.ImageURLs;

            // If there are new images to upload
            if (editingProduct.newImages && editingProduct.newImages.length > 0) {
                const formData = new FormData();
                editingProduct.newImages.forEach(file => {
                    formData.append('files', file);
                });

                const uploadResponse = await fetch('/api/cloudinary-params', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload new images');
                }

                const { urls } = await uploadResponse.json();
                imageURLs = [...imageURLs, ...urls];
            }

            const updateData = {
                title: editingProduct.Title,
                description: editingProduct.Description,
                price: editingProduct.Price,
                colors: editingProduct.Colors,
                imageURLs: imageURLs
            };

            const response = await fetch(`/api/update-product/${editingProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Failed to update product');
            }

            alert('Product updated successfully!');
            setEditingProduct(null);
            refresh(); // Refresh the product list
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Search handler
    const handleSearch = () => {
        loadProducts(1, searchTerm);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            // Prepare data for submission
            const colors: string[] = [];
            const allImageUrls: string[] = [];

            // Upload images for each color variant
            for (const variant of colorVariants) {
                if (variant.color && variant.images.length > 0) {
                    colors.push(variant.color);

                    // Upload images for this variant
                    const formData = new FormData();
                    variant.images.forEach(file => {
                        formData.append('files', file);
                    });

                    const uploadResponse = await fetch('/api/cloudinary-params', {
                        method: 'POST',
                        body: formData
                    });

                    if (!uploadResponse.ok) {
                        throw new Error(`Failed to upload images for ${variant.color}`);
                    }

                    const { urls } = await uploadResponse.json();
                    allImageUrls.push(...urls);
                }
            }

            const productData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                colors: colors,
                imageURLs: allImageUrls
            };

            const productResponse = await fetch('/api/add-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (!productResponse.ok) {
                throw new Error('Failed to create product');
            }

            alert('Product created successfully!');

            // Reset form
            setFormData({ title: '', description: '', price: '', variantCount: '' });
            setColorVariants([]);
            setStep(0);
            refresh(); // Refresh the product list

        } catch (error) {
            console.error('Error submitting product:', error);
            alert('Failed to create product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStep0Complete = formData.title && formData.description && formData.price && formData.variantCount;
    const isStep1Complete = colorVariants.length > 0 && colorVariants.every(v => v.color.trim() !== '');
    const isStep2Complete = colorVariants.length > 0 && colorVariants.every(v => v.images.length > 0);

    const canProceedToNext = (currentStep: number) => {
        if (currentStep === 0) return isStep0Complete;
        if (currentStep === 1) return isStep1Complete;
        if (currentStep === 2) return isStep2Complete && !isCompressing;
        return true;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#F5E6D3] px-4 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="font-tangerine text-6xl md:text-8xl font-bold text-[#8B4513] mb-4">
                        Admin Panel
                    </h1>
                    <p className="text-[#A0522D] text-lg font-medium mb-6">
                        Manage your crochet collection
                    </p>
                    
                    {/* View Mode Toggle */}
                    <div className="flex justify-center gap-4 mb-8">
                        <button
                            onClick={() => setViewMode('manage')}
                            className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                                viewMode === 'manage'
                                    ? 'bg-[#8B4513] text-[#FFF8F0] shadow-lg'
                                    : 'bg-white/80 text-[#8B4513] hover:bg-white'
                            }`}
                        >
                            📦 Manage Products
                        </button>
                        <button
                            onClick={() => setViewMode('add')}
                            className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                                viewMode === 'add'
                                    ? 'bg-[#8B4513] text-[#FFF8F0] shadow-lg'
                                    : 'bg-white/80 text-[#8B4513] hover:bg-white'
                            }`}
                        >
                            ➕ Add New Product
                        </button>
                    </div>
                </div>

                {/* Manage Products View */}
                {viewMode === 'manage' && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-[#CD853F]/20">
                        {/* Search Bar */}
                        <div className="mb-6 flex gap-3">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search products by name or description..."
                                className="flex-1 px-4 py-3 border border-[#CD853F]/30 rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white/90 placeholder-[#A0522D]/60"
                            />
                            <button
                                onClick={handleSearch}
                                className="px-6 py-3 bg-[#8B4513] text-[#FFF8F0] rounded-xl hover:bg-[#A0522D] transition-colors duration-300 font-medium"
                            >
                                Search
                            </button>
                            <button
                                onClick={() => { setSearchTerm(''); loadProducts(1, ''); }}
                                className="px-6 py-3 bg-white text-[#8B4513] border-2 border-[#8B4513] rounded-xl hover:bg-[#F5E6D3] transition-colors duration-300 font-medium"
                            >
                                Clear
                            </button>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
                                <p className="text-[#A0522D] mt-4">Loading products...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="text-center py-12">
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={refresh}
                                    className="px-6 py-2 bg-[#8B4513] text-[#FFF8F0] rounded-full hover:bg-[#A0522D] transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Products Grid */}
                        {!loading && !error && products.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#CD853F]/10 hover:shadow-xl transition-shadow duration-300"
                                        >
                                            <div className="aspect-square relative bg-gradient-to-br from-[#F5E6D3] to-[#CD853F]/20">
                                                <img
                                                    src={product.ImageURLs[0] || '/placeholder-image.jpg'}
                                                    alt={product.Title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-lg text-[#8B4513] mb-2 truncate">
                                                    {product.Title}
                                                </h3>
                                                <p className="text-[#A0522D] text-sm mb-2 line-clamp-2">
                                                    {product.Description}
                                                </p>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xl font-bold text-[#8B4513]">
                                                        ${product.Price}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        {product.Colors.slice(0, 3).map((color, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-[#F5E6D3] text-[#8B4513] rounded text-xs"
                                                            >
                                                                {color}
                                                            </span>
                                                        ))}
                                                        {product.Colors.length > 3 && (
                                                            <span className="px-2 py-1 bg-[#F5E6D3] text-[#8B4513] rounded text-xs">
                                                                +{product.Colors.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditProduct(product)}
                                                        className="flex-1 px-4 py-2 bg-[#8B4513] text-[#FFF8F0] rounded-lg hover:bg-[#A0522D] transition-colors duration-300 text-sm font-medium"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        disabled={deletingProductId === product.id}
                                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 text-sm font-medium disabled:opacity-50"
                                                    >
                                                        {deletingProductId === product.id ? '🔄' : '🗑️'} Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4">
                                        <button
                                            onClick={() => loadProducts(pagination.currentPage - 1, searchTerm)}
                                            disabled={!pagination.hasPrevPage}
                                            className="px-4 py-2 bg-[#8B4513] text-[#FFF8F0] rounded-lg hover:bg-[#A0522D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-[#8B4513] font-medium">
                                            Page {pagination.currentPage} of {pagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() => loadProducts(pagination.currentPage + 1, searchTerm)}
                                            disabled={!pagination.hasNextPage}
                                            className="px-4 py-2 bg-[#8B4513] text-[#FFF8F0] rounded-lg hover:bg-[#A0522D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Empty State */}
                        {!loading && !error && products.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold text-[#8B4513] mb-2">No Products Found</h3>
                                <p className="text-[#A0522D] mb-6">
                                    {searchTerm ? 'Try a different search term' : 'Start by adding your first product'}
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={() => setViewMode('add')}
                                        className="px-6 py-3 bg-[#8B4513] text-[#FFF8F0] rounded-full hover:bg-[#A0522D] transition-colors duration-300 font-medium"
                                    >
                                        Add First Product
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Edit Product Modal */}
                {editingProduct && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-[#CD853F]/20">
                                <h2 className="text-2xl font-semibold text-[#8B4513]">Edit Product</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[#8B4513] font-medium mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={editingProduct.Title}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, Title: e.target.value })}
                                        className="w-full px-4 py-3 border border-[#CD853F]/30 rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white/90"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#8B4513] font-medium mb-2">Description</label>
                                    <textarea
                                        value={editingProduct.Description}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, Description: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-[#CD853F]/30 rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white/90 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#8B4513] font-medium mb-2">Price</label>
                                    <input
                                        type="number"
                                        value={editingProduct.Price}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, Price: parseFloat(e.target.value) })}
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-[#CD853F]/30 rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white/90"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#8B4513] font-medium mb-2">Colors (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={editingProduct.Colors.join(', ')}
                                        onChange={(e) => setEditingProduct({ 
                                            ...editingProduct, 
                                            Colors: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                                        })}
                                        className="w-full px-4 py-3 border border-[#CD853F]/30 rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white/90"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#8B4513] font-medium mb-2">Current Images</label>
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        {editingProduct.ImageURLs.map((url, idx) => (
                                            <div key={idx} className="relative group">
                                                <img src={url} alt={`Product ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                                                <button
                                                    onClick={() => {
                                                        const newUrls = editingProduct.ImageURLs.filter((_, i) => i !== idx);
                                                        setEditingProduct({ ...editingProduct, ImageURLs: newUrls });
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-[#CD853F]/20 flex justify-end gap-3">
                                <button
                                    onClick={() => setEditingProduct(null)}
                                    className="px-6 py-2 border border-[#CD853F] text-[#8B4513] rounded-full hover:bg-[#F5E6D3] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateProduct}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-[#8B4513] text-[#FFF8F0] rounded-full hover:bg-[#A0522D] transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Product View */}
                {viewMode === 'add' && (

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-[#CD853F]/20">
                        <div className="mb-8">
                            <div className="flex items-center justify-center space-x-4 mb-8">
                                {[0, 1, 2, 3].map((index) => (
                                    <div key={index} className="flex items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${step >= index
                                                ? 'bg-[#8B4513] text-[#FFF8F0] shadow-lg'
                                                : 'bg-[#F5E6D3] text-[#A0522D] border-2 border-[#CD853F]'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        {index < 3 && (
                                            <div className={`w-16 h-1 mx-2 rounded transition-all duration-300 ${step > index ? 'bg-[#8B4513]' : 'bg-[#F5E6D3]'
                                                }`} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-semibold text-[#8B4513] mb-2">
                                    {step === 0 ? 'Product Details' : 
                                     step === 1 ? 'Color Variants' : 
                                     step === 2 ? 'Upload Images' : 
                                     'Preview & Confirm'}
                                </h2>
                                <p className="text-[#A0522D]">
                                    {step === 0 ? 'Enter basic product information' :
                                     step === 1 ? 'Set up color variants for your product' :
                                     step === 2 ? 'Add images for each color variant' :
                                     'Review everything before adding to catalog'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {step === 0 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[#8B4513] font-medium mb-2">Product Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="Cozy Winter Scarf"
                                            className="w-full px-4 py-3 border border-[#CD853F]/30 rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white/90 placeholder-[#A0522D]/60"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#8B4513] font-medium mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Handcrafted with love using soft, premium yarn..."
                                            rows={4}
                                            className="w-full px-4 py-3 border border-[#CD853F]/30 rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white/90 placeholder-[#A0522D]/60 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#8B4513] font-medium mb-2">Price</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3 text-[#8B4513] font-medium">$</span>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder="29.99"
                                                step="0.01"
                                                min="0"
                                                className="w-full pl-8 pr-4 py-3 border border-[#CD853F]/30 rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white/90 placeholder-[#A0522D]/60"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[#8B4513] font-medium mb-2">Number of Color Variants</label>
                                        <div className="flex gap-4">
                                            <input
                                                type="number"
                                                name="variantCount"
                                                value={formData.variantCount}
                                                onChange={handleInputChange}
                                                placeholder="2"
                                                step="1"
                                                min="1"
                                                max="10"
                                                className="flex-1 px-4 py-3 border border-[#CD853F]/30 rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white/90 placeholder-[#A0522D]/60"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleVariantGeneration}
                                                disabled={!formData.variantCount || parseInt(formData.variantCount) < 1}
                                                className="px-6 py-3 bg-[#8B4513] text-[#FFF8F0] rounded-xl hover:bg-[#A0522D] transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Generate Variants
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                                            Set Color Names for {colorVariants.length} Variants
                                        </h3>
                                        <p className="text-[#A0522D] text-sm">
                                            Enter a unique color name for each variant
                                        </p>
                                    </div>
                                    {colorVariants.map((variant, index) => (
                                        <div key={index} className="bg-[#FFF8F0]/50 rounded-xl p-4 border border-[#CD853F]/20">
                                            <label className="block text-[#8B4513] font-medium mb-2">
                                                Variant {index + 1} Color Name
                                            </label>
                                            <input
                                                type="text"
                                                value={variant.color}
                                                onChange={(e) => handleColorChange(index, e.target.value)}
                                                placeholder={`e.g., Forest Green, Ocean Blue, Rose Pink`}
                                                className="w-full px-4 py-3 border border-[#CD853F]/30 rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white/90 placeholder-[#A0522D]/60"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                                            Upload Images for Each Color Variant
                                        </h3>
                                        <p className="text-[#A0522D] text-sm">
                                            Add at least one image per color variant
                                        </p>
                                    </div>
                                    {colorVariants.map((variant, variantIndex) => (
                                        <div key={variantIndex} className="bg-[#FFF8F0]/50 rounded-xl p-6 border border-[#CD853F]/20">
                                            <h4 className="text-[#8B4513] font-semibold mb-4">
                                                {variant.color || `Variant ${variantIndex + 1}`}
                                            </h4>
                                            
                                            <div className="border-2 border-dashed border-[#CD853F] rounded-xl p-8 bg-white/50 mb-4">
                                                <div className="text-center">
                                                    <div className="w-12 h-12 mx-auto bg-[#8B4513]/10 rounded-full flex items-center justify-center mb-3">
                                                        <svg className="w-6 h-6 text-[#8B4513]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={async (e) => {
                                                            const files = Array.from(e.target.files || []);
                                                            if (files.length > 0) {
                                                                await handleVariantImageSelect(variantIndex, files);
                                                            }
                                                        }}
                                                        className="hidden"
                                                        id={`variant-upload-${variantIndex}`}
                                                        disabled={isCompressing}
                                                    />
                                                    <label
                                                        htmlFor={`variant-upload-${variantIndex}`}
                                                        className={`inline-block px-6 py-2 rounded-full transition-colors duration-300 font-medium cursor-pointer text-sm ${
                                                            isCompressing 
                                                                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                                                : 'bg-[#8B4513] text-[#FFF8F0] hover:bg-[#A0522D]'
                                                        }`}
                                                    >
                                                        {isCompressing ? 'Compressing...' : 'Select Images'}
                                                    </label>
                                                    <p className="text-xs text-[#A0522D] mt-2">
                                                        Images will be automatically compressed for optimal upload
                                                    </p>
                                                    {isCompressing && (
                                                        <p className="text-xs text-[#8B4513] font-medium mt-1">
                                                            🔄 Compressing images...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {variant.images.length > 0 && (
                                                <div className="grid grid-cols-3 gap-3">
                                                    {variant.images.map((file, imageIndex) => (
                                                        <div key={imageIndex} className="relative group">
                                                            <img
                                                                src={URL.createObjectURL(file)}
                                                                alt={`${variant.color} variant ${imageIndex + 1}`}
                                                                className="w-full h-24 object-cover rounded-lg"
                                                            />
                                                            <button
                                                                onClick={() => removeVariantImage(variantIndex, imageIndex)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="text-center space-y-6">
                                    <div className="bg-[#FFF8F0]/50 rounded-2xl p-8 border border-[#CD853F]/20">
                                        <h3 className="text-xl font-semibold text-[#8B4513] mb-4">Ready to Add Product?</h3>
                                        <p className="text-[#A0522D] mb-6">
                                            Review your product details in the preview panel and click submit when ready.
                                        </p>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || isCompressing}
                                            className="px-12 py-4 bg-[#8B4513] text-[#FFF8F0] rounded-full hover:bg-[#A0522D] transition-colors duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Creating Product...' : 
                                             isCompressing ? 'Compressing Images...' : 
                                             'Add to Catalog'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between pt-6">
                                {step > 0 && (
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        className="px-6 py-3 border border-[#CD853F] text-[#8B4513] rounded-full hover:bg-[#8B4513] hover:text-[#FFF8F0] transition-all duration-300 font-medium"
                                    >
                                        Back
                                    </button>
                                )}

                                {step < 3 && (
                                    <button
                                        onClick={() => setStep(step + 1)}
                                        disabled={!canProceedToNext(step)}
                                        className={`ml-auto px-6 py-3 rounded-full transition-all duration-300 font-medium ${canProceedToNext(step)
                                                ? 'bg-[#8B4513] text-[#FFF8F0] hover:bg-[#A0522D] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-[#CD853F]/20">
                        <h3 className="text-2xl font-semibold text-[#8B4513] mb-6 text-center">Live Preview</h3>

                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#CD853F]/10">
                            <div className="aspect-square bg-gradient-to-br from-[#F5E6D3] to-[#CD853F]/20 flex items-center justify-center">
                                {colorVariants.length > 0 && colorVariants[0].images.length > 0 ? (
                                    <img
                                        src={URL.createObjectURL(colorVariants[0].images[0])}
                                        alt="Product preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto bg-[#8B4513]/10 rounded-full flex items-center justify-center mb-3">
                                            <svg className="w-8 h-8 text-[#8B4513]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-[#A0522D]/60 text-sm">Upload images to see preview</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <h4 className="font-semibold text-xl text-[#8B4513] mb-2">
                                    {formData.title || "Product Title"}
                                </h4>

                                {colorVariants.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-sm text-[#A0522D] font-medium mb-2">Available Colors:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {colorVariants.map((variant, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-[#F5E6D3] text-[#8B4513] rounded-full text-xs font-medium"
                                                >
                                                    {variant.color || `Color ${index + 1}`}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4 text-[#CD853F] fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    ))}
                                    <span className="text-sm text-[#A0522D] ml-2">(5.0)</span>
                                </div>

                                <p className="text-[#A0522D] text-sm mb-4 line-clamp-3">
                                    {formData.description || "Product description will appear here..."}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-[#8B4513]">
                                        ${formData.price || "0.00"}
                                    </span>
                                    <button className="px-4 py-2 bg-[#8B4513] text-[#FFF8F0] rounded-full text-sm font-medium hover:bg-[#A0522D] transition-colors shadow-md">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-[#FFF8F0]/50 rounded-xl">
                            <h4 className="font-medium text-[#8B4513] mb-3">Completion Status:</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-[#A0522D]">Product Details</span>
                                    <span className={`w-3 h-3 rounded-full ${formData.title && formData.description && formData.price && formData.variantCount ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#A0522D]">Color Variants Set</span>
                                    <span className={`w-3 h-3 rounded-full ${colorVariants.length > 0 && colorVariants.every(v => v.color) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#A0522D]">Images Uploaded</span>
                                    <div className="flex items-center gap-2">
                                        {isCompressing && <span className="text-xs text-[#8B4513]">🔄</span>}
                                        <span className={`w-3 h-3 rounded-full ${isStep2Complete ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}
