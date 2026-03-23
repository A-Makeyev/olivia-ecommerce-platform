'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ChevronRight, ClipboardPen, Clock, Link, Package, Tag } from 'lucide-react'
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder'
import Input from 'packages/components/input'
import ColorSelector from 'packages/components/color-selector'


const Page = () => {
    const [images, setImages] = useState<(File | null)[]>([null])
    const [isChanged, setIsChanged] = useState(false)
    const [loading, setLoading] = useState(false)

    const { 
        register, 
        control, 
        watch, 
        setValue, 
        handleSubmit, 
        formState: { errors } 
    } = useForm()

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
                <div className="md:w-[65%]">
                    <div className="flex w-full gap-6">
                        <div className="w-2/4">
                            <Input 
                                label="Product Title" 
                                icon={<Package size={20} />}
                                placeholder="Product Title" 
                                error={errors.title?.message as string}
                                {...register('title', { required: 'Product title is required' })} 
                            />
                        </div>
                    </div>
                    <div className="flex w-full gap-6">
                        <div className="w-2/4">
                            <Input 
                                label="Tags" 
                                icon={<Tag size={20} />}
                                placeholder="Product Tags" 
                                error={errors.tags?.message as string}
                                {...register('tags', { required: 'One or more tags separated by comma is required' })} 
                            />
                        </div>
                    </div>
                    <div className="flex w-full gap-6">
                        <div className="w-2/4">
                            <Input 
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
                    </div>
                    <div className="flex w-full gap-6">
                        <div className="w-2/4">
                            <Input 
                                label="Warranty" 
                                icon={<Clock size={20} />}
                                placeholder="Warranty" 
                                error={errors.warranty?.message as string}
                                {...register('warranty', { required: 'Warranty is required' })} 
                            />
                        </div>
                    </div>
                    <div className="flex w-full gap-6">
                        <div className="w-2/4">
                            <Input 
                                label="Slug" 
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
                    <div className="flex w-full gap-6">
                        <div className="w-2/4">
                            <Input 
                                label="Brand" 
                                icon={<Tag size={20} />}
                                placeholder="Product Brand" 
                                error={errors.brand?.message as string}
                                {...register('brand', { required: 'Brand is required' })} 
                            />
                        </div>
                    </div>
                    <div className="my-2">
                        <ColorSelector control={control} errors={errors} />  
                    </div>
                </div>
            </div>
        </form>
    )
}

export default Page