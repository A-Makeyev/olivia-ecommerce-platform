'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { enhancements } from 'apps/seller-ui/src/utils/imagekit-enhancement'
import { ChevronRight, ClipboardPen, DollarSign, Package, Tag, Award, LayoutGrid, Layers, Link2, Loader2, Banknote, Coins, Boxes, ShieldCheck, Video, PlusCircle, X, Wand2, Loader, ChevronDown } from 'lucide-react'
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder'
import ColorSelector from 'packages/components/color-selector'
import CustomSpecifications from 'packages/components/custom-specifications'
import CustomProperties from 'packages/components/custom-properties'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import Input from 'packages/components/input'
import RichTextEditor from 'packages/components/rich-text-editor'
import SizeSelector from 'packages/components/size-selector'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface UploadedImage {
    file_id: string
    url: string
}

const Page = () => {
    const router = useRouter()
    const queryClient = useQueryClient()
    
    const [loading, setLoading] = useState(false)
    const [isChanged, setIsChanged] = useState(true)
    const [isCodOpen, setIsCodOpen] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [displayImage, setDisplayImage] = useState('')
    const [selectedImage, setSelectedImage] = useState('')
    const [openImageModal, setOpenImageModal] = useState(false)
    const [subCategoryTouched, setSubCategoryTouched] = useState(false)
    const [activeEffect, setActiveEffect] = useState<string | null>(null)
    const [images, setImages] = useState<(UploadedImage | null)[]>([null])
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

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
            const res = await axiosInstance.get('/product/api/get-categories')
            return res.data
        },
        meta: {
            onError: (err: unknown) => console.log(err)
        },
        staleTime: 1000 * 60 * 5,
        retry: 2
    })

    const { data: discountCodes = [], isLoading: discountCodesLoading, isError: discountCodesError } = useQuery({
        queryKey: ['discount-codes'],
        queryFn: async () => {
            const res = await axiosInstance.get('/product/api/get-discount-codes')
            return res?.data?.discountCodes || []
        }
    })

    const categories = data?.categories || []
    const subCategories = data?.subCategories || {}
    const selectedCategory = watch('category')
    const regularPrice = watch('regular_price')

    const subCategoriesOptions = useMemo(() => {
        return selectedCategory ? subCategories[selectedCategory] || [] : []
    }, [selectedCategory, subCategories])

    const convertFileToBase64 = (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = error => reject(error)
        })
    }

    const handleImageChange = async (file: File | null, index: number) => {
        if (!file) return 

        setUploadingIndex(index)

        try {
            const fileName = await convertFileToBase64(file)
            const res = await axiosInstance.post('/product/api/upload-product-image', { fileName })
            
            const uploadedImage: UploadedImage = {
                file_id: res.data.fileId,
                url: res.data.file_url
            }

            setImages(prev => {
                const updatedImages = [...prev]
                updatedImages[index] = uploadedImage

                if (index === prev.length - 1 && updatedImages.length < 8) {
                    updatedImages.push(null)
                }

                setValue('images', updatedImages)
                return updatedImages
            })
        } catch(err) {
            toast.error('Failed to upload image. Please try again')
        } finally {
            setUploadingIndex(null)
        }
    }

    const handleImageRemove = async (index: number) => {
        try {
            const imageToDelete = images[index]
            
            if (imageToDelete && typeof imageToDelete === 'object' && 'file_id' in imageToDelete) {
                await axiosInstance.delete('/product/api/delete-product-image', { 
                    data: { 
                        file_id: imageToDelete.file_id
                    } 
                })
            }

            setImages(prev => {
                const updatedImages = [...prev]
                updatedImages.splice(index, 1)

                if (updatedImages.length === 0 || !updatedImages.includes(null)) {
                    if (updatedImages.length < 8) {
                        updatedImages.push(null)
                    }
                }

                setValue('images', updatedImages)
                return updatedImages
            })
        } catch(err: any) {
            toast.error(err?.response?.data?.message || 'Failed to remove image. Please try again')
        }
    }

    const applyTransformation = async (transformation: string) => {
        if (!selectedImage || processing) return

        setProcessing(true)
        setActiveEffect(transformation)

        try {
            const baseUrl = selectedImage.split('?')[0]
            const transformUrl = `${baseUrl}?tr=${transformation}`

            await new Promise<void>((resolve, reject) => {
                const img = new window.Image()
                img.src = transformUrl
                img.onload = () => resolve()
                img.onerror = () => reject(new Error('Image failed to load'))
            })

            setSelectedImage(transformUrl)
            setDisplayImage(transformUrl)
        } catch(err) {
            toast.error('Failed to enhance. Please try again')
            console.log(err)
        } finally {
            setProcessing(false)
        }
    }

    const handleSelectImage = (url: string) => {
        setSelectedImage(url)
        setDisplayImage(url)
        setActiveEffect(null)
    }

    const handleSaveDraft = () => { }

    const onSubmit = async (data: any) => {
        setLoading(true)

        try {
            await axiosInstance.post('/product/api/create-product', data)
            await queryClient.invalidateQueries({ queryKey: ['shop-products'] })

            toast.success('Product created successfully')
            setTimeout(() => {
                router.push('/dashboard/all-products')
            }, 1500)
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to create product. Please try again')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form 
            className="w-full mx-auto p-8 text-white shadow-lg rounded-lg"
            onSubmit={handleSubmit(onSubmit)} 
            onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                    e.preventDefault()
                }
            }}
        >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 font-semibold">
                <div>
                    <h2 className="text-2xl text-white font-Poppins">
                        Create Product
                    </h2>
                    <div className="flex items-center text-sm text-slate-400 mt-1">
                        <Link href={"/dashboard"} className="text-[#80DEEA] hover:underline cursor-pointer">
                            Dashboard
                        </Link>
                        <ChevronRight size={14} className="mx-1 opacity-[0.8]" />
                        <span>Create Product</span>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    {isChanged && (
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            className="px-4 py-2 text-sm font-semibold bg-slate-800/50 text-slate-300 rounded-md hover:bg-slate-800/70 transition-colors"
                        >
                            Save Draft
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-[84px] h-[40px] flex items-center justify-center text-sm font-semibold text-slate-950 bg-[#80DEEA] hover:bg-[#4dd0e1] rounded-lg transition disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
                    </button>
                </div> 
            </div>
            <div className="flex flex-col md:flex-row w-full gap-6 py-4">
                <div className="w-full md:w-[35%]">
                    {images?.length > 0 && (
                        <ImagePlaceholder
                            small={false}
                            size="765 x 850"
                            images={images}
                            setSelectedImage={handleSelectImage}
                            setOpenImageModal={setOpenImageModal}
                            onImageChange={handleImageChange}
                            onRemove={handleImageRemove}
                            uploadingIndex={uploadingIndex}
                            index={0}
                        />
                    )}
                    <div className="grid grid-cols-2 gap-2 py-4">
                        {images.slice(1).map((_, index) => (
                            <ImagePlaceholder
                                small
                                size="765 x 850"
                                images={images}
                                setSelectedImage={handleSelectImage}
                                setOpenImageModal={setOpenImageModal}
                                onImageChange={handleImageChange}
                                onRemove={handleImageRemove}
                                uploadingIndex={uploadingIndex}
                                index={index + 1}
                                key={index}
                            />
                        ))}
                    </div>
                </div>
                <div className="w-full md:w-[65%] space-y-2">
                    <div className="w-full mb-4">
                        <Input
                            required
                            size="sm"
                            label="Product Title"
                            icon={<Package size={20} />}
                            error={errors.title?.message as string}
                            {...register('title', { required: 'Product title is required' })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            {isLoading ? (
                                <div className="w-full h-[38px] bg-slate-700 animate-pulse rounded-lg my-2" />
                            ) : isError ? (
                                <p className="text-red-500 text-sm mt-2">Failed to load categories</p>
                            ) : (
                                <Controller
                                    name="category"
                                    control={control}
                                    rules={{ required: 'Category is required' }}
                                    render={({ field }) => (
                                        <Input
                                            required
                                            type="select"
                                            size="sm"
                                            label="Category"
                                            icon={<LayoutGrid size={16} />}
                                            error={errors.category?.message as string}
                                            {...field}
                                        >
                                            <option value="" hidden></option>
                                            {categories?.map((category: string) => (
                                                <option key={category} value={category} className="bg-slate-900">{category}</option>
                                            ))}
                                        </Input>
                                    )}
                                />
                            )}
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            {isLoading ? (
                                <div className="w-full h-[38px] bg-slate-700 animate-pulse rounded-lg my-2" />
                            ) : isError ? (
                                <p className="text-red-500 text-sm mt-2">Failed to load sub categories</p>
                            ) : (
                                <Controller
                                    name="subCategory"
                                    control={control}
                                    rules={{ required: 'Sub Category is required' }}
                                    render={({ field }) => (
                                        <div className="relative">
                                            <Input
                                                required
                                                type="select"
                                                size="sm"
                                                label="Sub Category"
                                                icon={<Layers size={16} />}
                                                error={errors.subCategory?.message as string}
                                                disabled={!selectedCategory}
                                                {...field}
                                            >
                                                <option value="" hidden></option>
                                                {subCategoriesOptions?.map((category: string) => (
                                                    <option key={category} value={category} className="bg-slate-900">{category}</option>
                                                ))}
                                            </Input>
                                            {!selectedCategory && (
                                                <div
                                                    className="absolute inset-0 z-40 cursor-not-allowed"
                                                    onClick={() => setSubCategoryTouched(true)}
                                                />
                                            )}
                                            {!selectedCategory && subCategoryTouched && (
                                                <p className="mt-1 text-yellow-500 text-sm font-medium">Please select a category first</p>
                                            )}
                                        </div>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <Input
                                required
                                size="sm"
                                label="Stock"
                                icon={<Boxes size={20} />}
                                error={errors.stock?.message as string}
                                {...register('stock', {
                                    required: 'Stock is required',
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
                        <div className="col-span-2 md:col-span-1">
                            <Input
                                size="sm"
                                label="Brand"
                                icon={<Award size={20} />}
                                error={errors.brand?.message as string}
                                {...register('brand')}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <Input
                                required
                                size="sm"
                                label="Regular Price"
                                icon={<Banknote size={20} />}
                                error={errors.regular_price?.message as string}
                                {...register('regular_price', {
                                    required: 'Regular price is required',
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
                                error={errors.sale_price?.message as string}
                                {...register('sale_price', {
                                    valueAsNumber: true,
                                    min: { value: 1, message: 'Minimum price is at least 1' },
                                    validate: (value) => {
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
                                required
                                size="sm"
                                label="Tags (comma separated)"
                                icon={<Tag size={20} />}
                                error={errors.tags?.message as string}
                                {...register('tags', { required: 'One or more tags separated by comma is required' })}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <Input
                                size="sm"
                                label="Warranty"
                                icon={<ShieldCheck size={20} />}
                                error={errors.warranty?.message as string}
                                {...register('warranty')}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <Input
                                required
                                size="sm"
                                label="Product URL (Slug)"
                                icon={<Link2 size={20} />}
                                error={errors.slug?.message as string}
                                {...register('slug', {
                                    required: 'Slug is required',
                                    pattern: {
                                        value: /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
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
                                error={errors.video_url?.message as string}
                                {...register('video_url', {
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
                            required
                            size="sm"
                            type="textarea"
                            label="Product Description"
                            icon={<ClipboardPen size={20} />}
                            error={errors.short_description?.message as string}
                            {...register('short_description', {
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
                                Product Details <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="detailed_description"
                                control={control}
                                rules={{
                                    required: 'Details are required',
                                    validate: (value) => {
                                        const words = value?.split(/\s+/).filter((word: string) => word).length
                                        return words <= 100 || `Details must be less than 100 words. Current: ${words}`
                                    }
                                }}
                                render={({ field }) => (
                                    <RichTextEditor value={field.value} onChange={field.onChange} />
                                )}
                            />
                            {errors.detailed_description && (
                                <p className="mt-1 text-red-500 text-sm font-medium">
                                    {errors.detailed_description.message as string}
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
                                    <Input
                                        type="select"
                                        size="sm"
                                        icon={<DollarSign size={14} />}
                                        defaultValue="yes"
                                        {...(() => {
                                            const { onBlur, ...rest } = register('cash_on_delivery') as any
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
                                    </Input>
                                </div>
                                {errors.cash_on_delivery && (
                                    <p className="mt-2 text-red-500 font-medium text-sm">
                                        {errors.cash_on_delivery.message as string}
                                    </p>
                                )}
                                <label className="block font-bold text-slate-300 text-base tracking-tight my-4">
                                    Discount Codes
                                </label>
                                {discountCodesLoading ? (
                                    <Loader2 className="animate-spin text-[#80DEEA]" />
                                ) : discountCodesError ? (
                                    <p className="text-red-500 text-sm mt-2">Failed to load discount codes</p>
                                ) : discountCodes?.length === 0 ? (
                                    <div className="flex justify-start items-center gap-2">
                                        <p className="text-slate-500 text-sm">
                                            No discount codes available.
                                        </p>
                                        <Link href={"/dashboard/discount-codes"} className="flex items-center gap-1 text-[#80DEEA] hover:text-[#4DD0E1] text-sm cursor-pointer transition-colors">
                                            <PlusCircle size={16} />
                                            <span>Create</span>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-3">
                                        {discountCodes?.map((code: any) => (
                                            <button
                                                key={code.id}
                                                type="button"
                                                className={`px-3 py-1 text-sm font-semibold border rounded-md transition duration-100
                                                    ${watch('discount_codes')?.includes(code.id) ? "bg-cyan-500 text-black scale-105" : "text-slate-300 hover:bg-slate-700"}
                                                `}
                                                onClick={() => {
                                                    const currentSelection = watch('discount_codes') || []
                                                    const updatedSelection = currentSelection?.includes(code.id)
                                                        ? currentSelection.filter((id: string) => id !== code.id)
                                                        : [...currentSelection, code.id]
                                                    setValue('discount_codes', updatedSelection, { shouldDirty: true })
                                                }}
                                            >
                                                {code?.discountCode} - {code?.discountType === 'percentage' ? `${code?.discountValue}%` : `$${code?.discountValue}`}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 pt-3">
                                <CustomSpecifications control={control} errors={errors} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {openImageModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-2xl p-6 bg-slate-900 border border-slate-800 rounded-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 font-Poppins">
                                <Wand2 size={20} />
                                Image Enhancements
                            </h3>
                            <button
                                className="text-white hover:text-slate-300 transition-colors"
                                onClick={() => setOpenImageModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="relative w-full h-[420px] rounded-md overflow-hidden">
                            <Image
                                fill
                                src={displayImage || selectedImage}
                                alt="Product Image"
                                className="object-cover"
                            />
                            {processing && (
                                <div className="absolute inset-0 z-10 rounded-md overflow-hidden">
                                    <div className="absolute inset-0 bg-black/50" />
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                                        <Loader size={36} className="animate-spin text-[#80DEEA]" />
                                    </div>
                                </div>
                            )}
                        </div>
                        {selectedImage && (
                            <div className="mt-4 space-y-2">
                                <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-auto">
                                    {enhancements?.map(({ label, effect }) => (
                                        <button
                                            key={effect}
                                            disabled={processing}
                                            onClick={() => applyTransformation(effect)}
                                            className={`flex justify-center items-center gap-2 p-2 text-sm font-semibold rounded-md transition 
                                                ${activeEffect === effect ? "text-black bg-cyan-500 hover:bg-cyan-400" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                            `}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </form>
    )
}

export default Page