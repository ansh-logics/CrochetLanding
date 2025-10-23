"use client"
import { useState, useEffect } from "react";
import { Product } from "@/hooks/useProducts";
import { CloudinaryUploadWidgetInfo } from 'next-cloudinary';
import imageCompression from 'browser-image-compression';
import { useProductsQuery, useDeleteProduct } from "@/hooks/useProductsQuery";

type AdminView = 'list' | 'add' | 'edit';

export default function Admin() {
    const [currentView, setCurrentView] = useState<AdminView>('list');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [resource, setResource] = useState<string | CloudinaryUploadWidgetInfo | undefined>();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        variantCount: ''
    });
    const [colorVariants, setColorVariants] = useState<{ color: string; images: File[]; existingImageUrls?: string[]; existingPublicIds?: string[] }[]>([]);
    const [isCompressing, setIsCompressing] = useState(false);

    // Use React Query for products
    const { data: productsData, isLoading: loadingProducts, refetch } = useProductsQuery(1, 100);
    const products = productsData?.products || [];
    const deleteProductMutation = useDeleteProduct();

    // Refetch products when view changes to list
    useEffect(() => {
        if (currentView === 'list') {
            refetch();
        }
    }, [currentView, refetch]);

    // Image compression function
    const compressImage = async (file: File): Promise<File> => {
        const options = {
            maxSizeMB: 8,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/jpeg',
            quality: 0.8
        };

        try {
            console.log(`Compressing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            const compressedFile = await imageCompression(file, options);
            console.log(`Compressed to: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            
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
            const newVariants = Array(count).fill(null).map(() => ({ 
                color: '', 
                images: [] as File[],
                existingImageUrls: [],
                existingPublicIds: []
            }));
            setColorVariants(newVariants);
            setStep(1);
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

    const removeExistingImage = (variantIndex: number, imageIndex: number) => {
        setColorVariants(prev => 
            prev.map((variant, i) => {
                if (i === variantIndex) {
                    const newExistingUrls = [...(variant.existingImageUrls || [])];
                    const newExistingPublicIds = [...(variant.existingPublicIds || [])];
                    newExistingUrls.splice(imageIndex, 1);
                    newExistingPublicIds.splice(imageIndex, 1);
                    return { 
                        ...variant, 
                        existingImageUrls: newExistingUrls,
                        existingPublicIds: newExistingPublicIds
                    };
                }
                return variant;
            })
        );
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const colors: string[] = [];
            const allImageUrls: string[] = [];
            const allImagePublicIds: string[] = [];
            const oldImagePublicIds: string[] = [];

            // For editing, collect removed image public IDs
            if (editingProduct && editingProduct.ImagePublicIds) {
                const currentExistingIds = colorVariants.flatMap(v => v.existingPublicIds || []);
                oldImagePublicIds.push(
                    ...editingProduct.ImagePublicIds.filter(id => !currentExistingIds.includes(id))
                );
            }

            // Upload images for each color variant
            for (const variant of colorVariants) {
                if (variant.color) {
                    colors.push(variant.color);

                    // Add existing images
                    if (variant.existingImageUrls) {
                        allImageUrls.push(...variant.existingImageUrls);
                    }
                    if (variant.existingPublicIds) {
                        allImagePublicIds.push(...variant.existingPublicIds);
                    }

                    // Upload new images if any
                    if (variant.images.length > 0) {
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

                        const { urls, publicIds } = await uploadResponse.json();
                        allImageUrls.push(...urls);
                        allImagePublicIds.push(...publicIds);
                    }
                }
            }

            const productData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                colors: colors,
                imageURLs: allImageUrls,
                imagePublicIds: allImagePublicIds,
                ...(editingProduct && { oldImagePublicIds })
            };

            const url = editingProduct 
                ? `/api/update-product/${editingProduct.id}`
                : '/api/add-product';
            
            const method = editingProduct ? 'PUT' : 'POST';

            const productResponse = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (!productResponse.ok) {
                throw new Error(editingProduct ? 'Failed to update product' : 'Failed to create product');
            }

            alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');

            // Reset and return to list
            resetForm();
            setCurrentView('list');
            refetch(); // Refetch products to show updates

        } catch (error) {
            console.error('Error submitting product:', error);
            alert(`Failed to ${editingProduct ? 'update' : 'create'} product. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (productId: number) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteProductMutation.mutateAsync(productId);
            alert('Product deleted successfully!');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        
        // Pre-fill form data
        setFormData({
            title: product.Title,
            description: product.Description,
            price: product.Price.toString(),
            variantCount: product.Colors.length.toString()
        });

        // Calculate images per color
        const imagesPerColor = Math.floor(product.ImageURLs.length / product.Colors.length);
        
        // Pre-fill color variants with existing data
        const variants = product.Colors.map((color, index) => {
            const startIdx = index * imagesPerColor;
            const endIdx = startIdx + imagesPerColor;
            
            return {
                color: color,
                images: [] as File[],
                existingImageUrls: product.ImageURLs.slice(startIdx, endIdx),
                existingPublicIds: product.ImagePublicIds?.slice(startIdx, endIdx) || []
            };
        });

        setColorVariants(variants);
        setStep(0);
        setCurrentView('edit');
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', price: '', variantCount: '' });
        setColorVariants([]);
        setStep(0);
        setEditingProduct(null);
    };

    const isStep0Complete = formData.title && formData.description && formData.price && formData.variantCount;
    const isStep1Complete = colorVariants.length > 0 && colorVariants.every(v => v.color.trim() !== '');
    const isStep2Complete = colorVariants.length > 0 && colorVariants.every(v => 
        v.images.length > 0 || (v.existingImageUrls && v.existingImageUrls.length > 0)
    );

    const canProceedToNext = (currentStep: number) => {
        if (currentStep === 0) return isStep0Complete;
        if (currentStep === 1) return isStep1Complete;
        if (currentStep === 2) return isStep2Complete && !isCompressing;
        return true;
    };

    // Product List View
    if (currentView === 'list') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#F5E6D3] px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="font-tangerine text-6xl md:text-8xl font-bold text-[#8B4513] mb-4">
                            Admin Panel
                        </h1>
                        <p className="text-[#A0522D] text-lg font-medium mb-6">
                            Manage your crochet products
                        </p>
                        <button
                            onClick={() => setCurrentView('add')}
                            className="px-8 py-3 bg-[#8B4513] text-[#FFF8F0] rounded-full hover:bg-[#A0522D] transition-colors duration-300 font-medium shadow-lg"
                        >
                            + Add New Product
                        </button>
                    </div>

                    {loadingProducts ? (
                        <div className="text-center py-12">
                            <div className="inline-block w-12 h-12 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[#A0522D] mt-4">Loading products...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 bg-white/80 rounded-2xl">
                            <p className="text-[#A0522D] text-lg">No products found. Add your first product!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-[#CD853F]/20 hover:shadow-xl transition-shadow">
                                    <div className="aspect-square bg-gradient-to-br from-[#F5E6D3] to-[#CD853F]/20 overflow-hidden">
                                        {product.ImageURLs[0] ? (
                                            <img
                                                src={product.ImageURLs[0]}
                                                alt={product.Title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-[#A0522D]/40">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-semibold text-xl text-[#8B4513] mb-2 truncate">
                                            {product.Title}
                                        </h3>
                                        <p className="text-[#A0522D] text-sm mb-3 line-clamp-2">
                                            {product.Description}
                                        </p>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-2xl font-bold text-[#8B4513]">
                                                ${product.Price.toFixed(2)}
                                            </span>
                                            <span className="text-sm text-[#A0522D]">
                                                {product.Colors.length} colors
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="flex-1 px-4 py-2 bg-[#8B4513] text-[#FFF8F0] rounded-lg hover:bg-[#A0522D] transition-colors font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Add/Edit Form View
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#F5E6D3] px-4 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <button
                        onClick={() => {
                            resetForm();
                            setCurrentView('list');
                        }}
                        className="mb-4 px-6 py-2 border border-[#CD853F] text-[#8B4513] rounded-full hover:bg-[#8B4513] hover:text-[#FFF8F0] transition-all duration-300 font-medium"
                    >
                        ← Back to Products
                    </button>
                    <h1 className="font-tangerine text-6xl md:text-8xl font-bold text-[#8B4513] mb-4">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p className="text-[#A0522D] text-lg font-medium">
                        {editingProduct ? 'Update product details' : 'Add new products to your crochet collection'}
                    </p>
                </div>

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
                                     'Review everything before saving'}
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
                                                disabled={!!editingProduct}
                                                className="flex-1 px-4 py-3 border border-[#CD853F]/30 rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white/90 placeholder-[#A0522D]/60 disabled:opacity-50"
                                            />
                                            {!editingProduct && (
                                                <button
                                                    type="button"
                                                    onClick={handleVariantGeneration}
                                                    disabled={!formData.variantCount || parseInt(formData.variantCount) < 1}
                                                    className="px-6 py-3 bg-[#8B4513] text-[#FFF8F0] rounded-xl hover:bg-[#A0522D] transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Generate Variants
                                                </button>
                                            )}
                                        </div>
                                        {editingProduct && (
                                            <p className="text-sm text-[#A0522D] mt-2">
                                                Number of variants cannot be changed when editing
                                            </p>
                                        )}
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
                                            
                                            {/* Existing Images */}
                                            {variant.existingImageUrls && variant.existingImageUrls.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-[#A0522D] mb-2 font-medium">Current Images:</p>
                                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                                        {variant.existingImageUrls.map((url, imageIndex) => (
                                                            <div key={imageIndex} className="relative group">
                                                                <img
                                                                    src={url}
                                                                    alt={`${variant.color} existing ${imageIndex + 1}`}
                                                                    className="w-full h-24 object-cover rounded-lg"
                                                                />
                                                                <button
                                                                    onClick={() => removeExistingImage(variantIndex, imageIndex)}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

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
                                                        {isCompressing ? 'Compressing...' : 'Select New Images'}
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

                                            {/* New Images */}
                                            {variant.images.length > 0 && (
                                                <div>
                                                    <p className="text-sm text-[#A0522D] mb-2 font-medium">New Images to Upload:</p>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {variant.images.map((file, imageIndex) => (
                                                            <div key={imageIndex} className="relative group">
                                                                <img
                                                                    src={URL.createObjectURL(file)}
                                                                    alt={`${variant.color} new ${imageIndex + 1}`}
                                                                    className="w-full h-24 object-cover rounded-lg border-2 border-green-400"
                                                                />
                                                                <button
                                                                    onClick={() => removeVariantImage(variantIndex, imageIndex)}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="text-center space-y-6">
                                    <div className="bg-[#FFF8F0]/50 rounded-2xl p-8 border border-[#CD853F]/20">
                                        <h3 className="text-xl font-semibold text-[#8B4513] mb-4">
                                            {editingProduct ? 'Ready to Update Product?' : 'Ready to Add Product?'}
                                        </h3>
                                        <p className="text-[#A0522D] mb-6">
                                            Review your product details in the preview panel and click submit when ready.
                                        </p>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || isCompressing}
                                            className="px-12 py-4 bg-[#8B4513] text-[#FFF8F0] rounded-full hover:bg-[#A0522D] transition-colors duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (editingProduct ? 'Updating...' : 'Creating Product...') : 
                                             isCompressing ? 'Compressing Images...' : 
                                             (editingProduct ? 'Update Product' : 'Add to Catalog')}
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

                    {/* Preview Panel */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-[#CD853F]/20">
                        <h3 className="text-2xl font-semibold text-[#8B4513] mb-6 text-center">Live Preview</h3>

                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#CD853F]/10">
                            <div className="aspect-square bg-gradient-to-br from-[#F5E6D3] to-[#CD853F]/20 flex items-center justify-center">
                                {colorVariants.length > 0 ? (
                                    colorVariants[0].images.length > 0 ? (
                                        <img
                                            src={URL.createObjectURL(colorVariants[0].images[0])}
                                            alt="Product preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : colorVariants[0].existingImageUrls && colorVariants[0].existingImageUrls.length > 0 ? (
                                        <img
                                            src={colorVariants[0].existingImageUrls[0]}
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
                                    )
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
                                    <span className={`w-3 h-3 rounded-full ${isStep0Complete ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#A0522D]">Color Variants Set</span>
                                    <span className={`w-3 h-3 rounded-full ${isStep1Complete ? 'bg-green-500' : 'bg-gray-300'}`}></span>
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
            </div>
        </div>
    );
}
