'use client'

import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, ClipboardPen, DollarSign, Link, Package, Tag, Award, LayoutGrid, Layers, Loader2, Banknote, Coins, Boxes, ShieldCheck, Video } from 'lucide-react'
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder'
import ColorSelector from 'packages/components/color-selector'
import CustomSpecifications from 'packages/components/custom-specifications'
import CustomProperties from 'packages/components/custom-properties'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import Input from 'packages/components/input'
import RichTextEditor from 'packages/components/rich-text-editor'
import SizeSelector from 'packages/components/size-selector'

const Page = () => {
    const [images, setImages] = useState<(File | null)[]>([null])
    const [isChanged, setIsChanged] = useState(true)
    const [loading, setLoading] = useState(false)
    const [isCodOpen, setIsCodOpen] = useState(false)
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false)

    const { 
        register, 
        control, 
        watch, 
        setValue, 
        handleSubmit, 
        formState: { errors } 
    } = useForm()

    const { data, isLoading, isError } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get('/product/api/get-categories')
                return res.data
            } catch(err) {
                console.log(err)
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 2
    })

    const categories = data?.categories || []
    const subCategories = data?.subCategories || {}
    const selectedCategory = watch('category')
    const regularPrice = watch('regular_price')

    const subCategoriesOptions = useMemo(() => {
        return selectedCategory ? subCategories[selectedCategory] || [] : []
    }, [selectedCategory, subCategories])

    const onSubmit = (data: any) => {
        console.log(data)
    }

    const handleImageChange = (file: File | null, index: number) => {
        const updatedImages = [...images]
        updatedImages[index] = file
        
        if (index === images.length - 1 && images.length < 8) {
            updatedImages.push(null)
        }

        setImages(updatedImages)
        setValue('images', updatedImages)
    }

    const handleImageRemove = (index: number) => {
        setImages((prevImages) => {
            let updatedImages = [...prevImages]
            
            if (index === -1) {
                updatedImages[0] = null
            } else {
                updatedImages.splice(index, 1)
            }

            if (!updatedImages.includes(null) && updatedImages.length < 8) {
                updatedImages.push(null)
            }

            return updatedImages
        })

        setValue('images', images)
    }

    const handleSaveDraft = () => {}

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full mx-auto p-8 text-white shadow-lg rounded-lg">
            <h2 className="text-2xl py-2 font-semibold text-white font-Poppins">
                Create Product
            </h2>
            <div className="flex items-center text-sm">
                <span className="text-[#80DEEA] cursor-pointer">Dashboard</span>
                <ChevronRight size={15} className="opacity-[0.8]" />
                <span>Create Product</span>
            </div>

            <div className="flex flex-col md:flex-row w-full gap-6 py-4">
                <div className="w-full md:w-[35%]">
                    {images?.length > 0 && (
                        <ImagePlaceholder 
                            small={false}
                            size="765 x 850"
                            onImageChange={handleImageChange}
                            onRemove={handleImageRemove}
                            index={0}
                        />
                    )}
                    <div className="grid grid-cols-2 gap-2 py-4">
                        {images.slice(1).map((_, index) => (
                            <ImagePlaceholder 
                                small
                                size="765 x 850"
                                onImageChange={handleImageChange}
                                onRemove={handleImageRemove}
                                index={index + 1}
                                key={index}
                            />
                        ))}
                    </div>
                </div>

                <div className="w-full md:w-[65%] space-y-2">
                    <div className="w-full mb-4">
                        <Input 
                            size="sm"
                            label="Product Title" 
                            icon={<Package size={20} />}
                            placeholder="Product Title" 
                            error={errors.title?.message as string}
                            {...register('title', { required: 'Product title is required' })} 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            {isLoading ? (
                                <div className="w-full h-[38px] bg-slate-700 animate-pulse rounded-lg my-2" />
                            ) : isError ? (
                                <p className="text-red-500 text-sm my-2">Failed to load</p>
                            ) : (
                                <Controller
                                    name="category"
                                    control={control}
                                    rules={{ required: "Category is required" }}
                                    render={({ field: { onBlur, ref, ...rest } }) => (
                                        <div className="relative my-2">
                                            <select
                                                {...rest}
                                                ref={ref}
                                                className='peer w-full pl-9 pr-10 py-1.5 min-h-[38px] appearance-none outline-0 rounded-lg border border-slate-400 focus:border-[#80DEEA] transition-all duration-300 ease-out bg-transparent text-sm text-white cursor-pointer relative z-20'
                                                onClick={() => setIsCategoryOpen(prev => !prev)}
                                                onBlur={() => { setIsCategoryOpen(false); onBlur() }}
                                            >
                                                <option value="" hidden></option>
                                                {categories?.map((category: string) => (
                                                    <option key={category} value={category} className="bg-slate-900">{category}</option>
                                                ))}
                                            </select>
                                            <div className="absolute top-[10px] left-3 text-slate-400 pointer-events-none z-30 peer-focus:text-white transition-colors">
                                                <LayoutGrid size={16} />
                                            </div>
                                            <label className={`absolute transition-all duration-300 ease-out pointer-events-none z-30 bg-black px-1.5 peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm peer-focus:text-white ${rest.value ? '-top-3 left-3 text-sm text-white' : 'top-2 left-9 text-sm text-slate-400'}`}>
                                                Category
                                            </label>
                                            <div className={`absolute top-[9px] right-3 text-slate-400 pointer-events-none z-30 transition-transform ${isCategoryOpen ? 'rotate-180' : 'rotate-0'}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    )}
                                />
                            )}
                            {errors.category && (
                                <p className="mt-1 text-red-500 text-sm font-medium">{errors.category.message as string}</p>
                            )}
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            {isLoading ? (
                                <div className="w-full h-[38px] bg-slate-700 animate-pulse rounded-lg my-2" />
                            ) : isError ? (
                                <p className="text-red-500 text-sm my-2">Failed to load</p>
                            ) : (
                                <Controller
                                    name="subCategories"
                                    control={control}
                                    rules={{ required: "Sub Category is required" }}
                                    render={({ field: { onBlur, ref, ...rest } }) => (
                                        <div className="relative my-2">
                                            <select
                                                {...rest}
                                                ref={ref}
                                                className='peer w-full pl-9 pr-10 py-1.5 min-h-[38px] appearance-none outline-0 rounded-lg border border-slate-400 focus:border-[#80DEEA] transition-all duration-300 ease-out bg-transparent text-sm text-white cursor-pointer relative z-20'
                                                onClick={() => setIsSubCategoryOpen(prev => !prev)}
                                                onBlur={() => { setIsSubCategoryOpen(false); onBlur() }}
                                            >
                                                <option value="" hidden></option>
                                                {subCategoriesOptions?.map((category: string) => (
                                                    <option key={category} value={category} className="bg-slate-900">{category}</option>
                                                ))}
                                            </select>
                                            <div className="absolute top-[10px] left-3 text-slate-400 pointer-events-none z-30 peer-focus:text-white transition-colors">
                                                <Layers size={16} />
                                            </div>
                                            <label className={`absolute transition-all duration-300 ease-out pointer-events-none z-30 bg-black px-1.5 peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm peer-focus:text-white ${rest.value ? '-top-3 left-3 text-sm text-white' : 'top-2 left-9 text-sm text-slate-400'}`}>
                                                Sub Category
                                            </label>
                                            <div className={`absolute top-[9px] right-3 text-slate-400 pointer-events-none z-30 transition-transform ${isSubCategoryOpen ? 'rotate-180' : 'rotate-0'}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    )}
                                />
                            )}
                            {errors.subCategories && (
                                <p className="mt-1 text-red-500 text-sm font-medium">{errors.subCategories.message as string}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <Input 
                                size="sm"
                                label="Brand" 
                                icon={<Award size={20} />}
                                placeholder="Product Brand" 
                                error={errors.brand?.message as string}
                                {...register('brand', { required: 'Brand is required' })} 
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <Input 
                                size="sm"
                                label="Stock"
                                icon={<Boxes size={20} />}
                                placeholder="Stock"
                                error={errors.stock?.message as string}
                                {...register('stock', { 
                                    valueAsNumber: true,
                                    min: { value: 0, message: 'Stock must be at least 0' },
                                    max: { value: 1000, message: 'Stock must be less than 1000' },
                                    validate: (value) => {
                                        if (isNaN(value)) return 'Please enter a valid number' 
                                        if (!Number.isInteger(value)) return 'Stock must be a whole number'
                                        return true
                                    }
                                })} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <Input 
                                size="sm"
                                label="Regular Price" 
                                icon={<Banknote size={20} />}
                                placeholder="Regular Price"
                                error={errors.regular_price?.message as string}
                                {...register('regular_price', { 
                                    valueAsNumber: true,
                                    min: { value: 1, message: 'Minimum price is at least 1' },
                                    validate: (value) => !isNaN(value) || 'Please enter a valid number'
                                })} 
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <Input 
                                size="sm"
                                label="Sale Price" 
                                icon={<Coins size={20} />}
                                placeholder="Sale Price"
                                error={errors.sale_price?.message as string}
                                {...register('sale_price', { 
                                    valueAsNumber: true,
                                    min: { value: 1, message: 'Minimum price is at least 1' },
                                    validate: (value) => {
                                        if (isNaN(value)) return 'Please enter a valid number' 
                                        if (regularPrice && value >= regularPrice) return 'Sale price must be less than regular price'
                                        return true
                                    }
                                })} 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <Input 
                                size="sm"
                                label="Tags (comma separated)" 
                                icon={<Tag size={20} />}
                                placeholder="Product Tags" 
                                error={errors.tags?.message as string}
                                {...register('tags', { required: 'One or more tags separated by comma is required' })} 
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <Input 
                                size="sm"
                                label="Warranty" 
                                icon={<ShieldCheck size={20} />}
                                placeholder="Warranty" 
                                error={errors.warranty?.message as string}
                                {...register('warranty', { required: 'Warranty is required' })} 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <Input 
                                size="sm"
                                label="Product URL (Slug)" 
                                icon={<Link size={20} />}
                                placeholder="Product Slug" 
                                error={errors.slug?.message as string}
                                {...register('slug', { 
                                    required: 'Slug is required',
                                    pattern: {
                                        value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                        message: 'Slug must be lowercase with letters, numbers, and hyphens'
                                    },
                                    minLength: { value: 3, message: 'Slug must be at least 3 characters long' },
                                    maxLength: { value: 50, message: 'Slug must be less than 50 characters long' }
                                })} 
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <Input 
                                size="sm"
                                label="Video URL" 
                                icon={<Video size={20} />}
                                placeholder="Video URL" 
                                error={errors.video_url?.message as string}
                                {...register('video_url', { 
                                    required: 'Video URL is required',
                                    pattern: {
                                        value: /^((http(s?):\/\/)?(www.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?)$/,
                                        message: 'Invalid video URL'
                                    },
                                })} 
                            />
                        </div>
                    </div>
                    <div className="w-full !mt-4">
                        <Input 
                            size="sm"
                            type="textarea"
                            label="Product Description" 
                            icon={<ClipboardPen size={20} />}
                            placeholder="Product Description" 
                            error={errors.description?.message as string}
                            {...register('description', { 
                                required: 'Product description is required', 
                                validate: (value) => {
                                    const words = value.trim().split(/\s+/).length
                                    return words <= 150 || `Description must be less than 150 words. Current: ${words}`
                                }
                            })} 
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className='w-full md:w-1/2'>
                            <label className="font-bold text-slate-300 text-base tracking-tight mb-3 block">
                                Product Details
                            </label>
                            <Controller 
                                name="details"
                                control={control}
                                rules={{
                                    required: 'Details are required',
                                    validate: (value) => {
                                        const words = value?.split(/\s+/).filter((word: string) => word).length
                                        return words >= 100 || `Details must be at least 100 words. Current: ${words}`
                                    }
                                }}
                                render={({ field }) => (
                                    <RichTextEditor value={field.value} onChange={field.onChange} />
                                )}
                            />
                            {errors.specifications && (
                                <p className="mt-1 text-red-500 text-sm font-medium">
                                    {errors.specifications.message as string}
                                </p>
                            )}

                            <div className="pt-4">
                                <CustomProperties control={control} errors={errors} /> 
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 flex flex-col">
                            <ColorSelector control={control} errors={errors} />
                            <div className="-mt-2">
                                <SizeSelector control={control} errors={errors} />
                            </div>
                            <div className="mt-3 pt-3">
                                <label className="block font-bold text-slate-300 text-base tracking-tight mb-3">
                                    Cash On Delivery
                                </label>
                                <div className="relative">
                                    <div className="absolute top-[9px] left-3 text-slate-400 pointer-events-none z-30">
                                        <DollarSign size={14} />
                                    </div>
                                    <select
                                        defaultValue="yes"
                                        className="w-full pl-8 pr-8 py-1 min-h-[32px] appearance-none outline-0 rounded-lg border border-slate-400 focus:border-[#80DEEA] transition-all duration-300 ease-out bg-transparent text-sm text-white relative z-20 cursor-pointer"
                                        onClick={() => setIsCodOpen(prev => !prev)}
                                        {...(() => {
                                            const { onBlur, ...rest } = register('cash_on_delivery', { required: 'Cash on delivery is required' })
                                            return {
                                                ...rest,
                                                onBlur: (e: React.FocusEvent<HTMLSelectElement>) => {
                                                    setIsCodOpen(false)
                                                    onBlur(e)
                                                }
                                            }
                                        })()}
                                    >
                                        <option value="yes" className="bg-slate-900">Yes</option>
                                        <option value="no" className="bg-slate-900">No</option>
                                    </select>
                                    <div className={`absolute top-[7px] right-3 text-slate-400 pointer-events-none z-30 transition-transform ${isCodOpen ? 'rotate-180' : 'rotate-0'}`}>
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                                {errors.cash_on_delivery && (
                                    <p className="mt-2 text-red-500 font-medium text-sm">
                                        {errors.cash_on_delivery.message as string}
                                    </p>
                                )}
                            </div>

                            <div className="mt-3 pt-3">
                                <CustomSpecifications control={control} errors={errors} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                {isChanged && (
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="px-4 py-2 bg-slate-800/50 text-slate-300 rounded-md hover:bg-slate-800 transition-colors"
                    >
                        Save Draft
                    </button>
                )}
                <button 
                    type="submit"
                    disabled={loading}
                    className="w-[84px] h-[40px] flex items-center justify-center bg-slate-800/50 text-slate-300 rounded-md hover:bg-slate-800 transition-colors"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
                </button>
            </div>
        </form>
    )
}

export default Page