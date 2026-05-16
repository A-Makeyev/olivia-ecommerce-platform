'use client'

import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, ClipboardPen, Clock, DollarSign, Link, Package, Tag, Loader2, Award, LayoutGrid, Layers } from 'lucide-react'
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder'
import ColorSelector from 'packages/components/color-selector'
import CustomSpecifications from 'packages/components/custom-specifications'
import CustomProperties from 'packages/components/custom-properties'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import Input from 'packages/components/input'


const Page = () => {
    const [images, setImages] = useState<(File | null)[]>([null])
    const [isChanged, setIsChanged] = useState(false)
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full mx-auto p-8 text-white shadow-lg rounded-lg">
            <h2 className="text-2xl py-2 font-semibold text-white font-Poppins">
                Create Product
            </h2>
            <div className="flex items-center text-sm">
                <span className="text-[#80DEEA] cursor-pointer">
                    Dashboard
                </span>
                <ChevronRight size={15} className="opacity-[0.8]" />
                <span>Create Product</span>
            </div>
            <div className="flex w-full gap-6 py-4">
                <div className="md:w-[35%]">
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
                <div className="md:w-[65%] space-y-4">
                    <div className="grid grid-cols-2 gap-4 -mb-2">
                        <div className="col-span-2 md:col-span-1">
                            <Input 
                                size="sm"
                                label="Product Title" 
                                icon={<Package size={20} />}
                                placeholder="Product Title" 
                                error={errors.title?.message as string}
                                {...register('title', { required: 'Product title is required' })} 
                            />
                        </div>
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
                                        message: 'Slug must be in lowercase and can only contain letters, numbers, and hyphens'
                                    },
                                    minLength: {
                                        value: 3,
                                        message: 'Slug must be at least 3 characters long'
                                    },
                                    maxLength: {
                                        value: 50,
                                        message: 'Slug must be less than 50 characters long'
                                    }
                                })} 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 -mb-2">
                        <div className="col-span-2 md:col-span-1">
                            {   isLoading ? (
                                <div className="w-full h-[38px] flex items-center px-3 my-2 rounded-lg border border-slate-400/50 bg-slate-800/50">
                                    <Loader2 className="animate-spin text-[#80DEEA]" size={18} />
                                    <span className="ml-2 text-slate-400 text-sm">Loading Categories...</span>
                                </div>
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
                                                { ...rest }
                                                ref={ref}
                                                className='peer w-full pl-9 pr-10 py-1.5 min-h-[38px] appearance-none outline-0 rounded-lg border border-slate-400 focus:border-[#80DEEA] transition-all duration-300 ease-out bg-transparent text-sm text-white cursor-pointer relative z-20'
                                                onClick={() => setIsCategoryOpen(prev => !prev)}
                                                onBlur={() => {
                                                    setIsCategoryOpen(false)
                                                    onBlur()
                                                }}
                                            >
                                                <option value="" hidden></option>
                                                {categories?.map((category: string) => (
                                                    <option key={category} value={category} className="bg-slate-900">
                                                        {category}
                                                    </option>
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
                                <p className="mt-1 text-red-500 text-sm font-medium">
                                    {errors.category.message as string}
                                </p>
                            )}
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            {isLoading ? (
                                <div className="w-full h-[38px] flex items-center px-3 my-2 rounded-lg border border-slate-400/50 bg-slate-800/50">
                                    <Loader2 className="animate-spin text-[#80DEEA]" size={18} />
                                    <span className="ml-2 text-slate-400 text-sm">Loading Sub Categories...</span>
                                </div>
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
                                                { ...rest }
                                                ref={ref}
                                                className='peer w-full pl-9 pr-10 py-1.5 min-h-[38px] appearance-none outline-0 rounded-lg border border-slate-400 focus:border-[#80DEEA] transition-all duration-300 ease-out bg-transparent text-sm text-white cursor-pointer relative z-20'
                                                onClick={() => setIsSubCategoryOpen(prev => !prev)}
                                                onBlur={() => {
                                                    setIsSubCategoryOpen(false)
                                                    onBlur()
                                                }}
                                            >
                                                <option value="" hidden></option>
                                                {subCategoriesOptions?.map((category: string) => (
                                                    <option key={category} value={category} className="bg-slate-900">
                                                        {category}
                                                    </option>
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
                                <p className="mt-1 text-red-500 text-sm font-medium">
                                    {errors.subCategories.message as string}
                                </p>
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
                                label="Tags (comma separated)" 
                                icon={<Tag size={20} />}
                                placeholder="Product Tags" 
                                error={errors.tags?.message as string}
                                {...register('tags', { required: 'One or more tags separated by comma is required' })} 
                            />
                        </div>
                    </div>
                    <div className="w-full !-mb-2">
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
                    <div className="flex w-full gap-4">
                        <div className="w-full md:w-1/2">
                            <Input 
                                size="sm"
                                label="Warranty" 
                                icon={<Clock size={20} />}
                                placeholder="Warranty" 
                                error={errors.warranty?.message as string}
                                {...register('warranty', { required: 'Warranty is required' })} 
                            />
                        </div>
                    </div>
                    <div className="pt-2 border-t border-slate-700/50">
                        <ColorSelector control={control} errors={errors} />  
                    </div>
                    <div className="pt-2 border-t border-slate-700/50">
                        <CustomSpecifications control={control} errors={errors} /> 
                    </div>
                    <div className="pt-2 border-t border-slate-700/50">
                        <CustomProperties control={control} errors={errors} /> 
                    </div>
                    <div className="pt-2 border-t border-slate-700/50">
                        <div className="w-[240px]">
                            <label className="block font-bold text-slate-300 text-base tracking-tight mb-3">
                                Cash On Delivery
                            </label>
                            <div className="relative my-2">
                                <div className="absolute top-[11px] left-3 text-slate-400 pointer-events-none">
                                    <DollarSign size={16} />
                                </div>
                                <select
                                    defaultValue="yes"
                                    className="w-full pl-9 pr-10 py-1.5 min-h-[40px] appearance-none outline-0 rounded-lg border border-slate-400 focus:border-[#80DEEA] transition-all duration-300 ease-out bg-transparent text-sm text-white"
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
                                <div className={`absolute top-[11px] right-3 text-slate-400 pointer-events-none transition-transform ${isCodOpen ? 'rotate-180' : 'rotate-0'}`}>
                                    <ChevronDown size={20} />
                                </div>
                            </div>
                            {errors.cash_on_delivery && (
                                <p className="mt-2 text-red-500 font-medium">
                                    {errors.cash_on_delivery.message as string}
                                </p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </form>
    )
}

export default Page