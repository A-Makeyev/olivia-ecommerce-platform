'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ChevronRight, Package } from 'lucide-react'
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder'
import Input from 'packages/components/input'


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
                    <div className="w-[45%] grid grid-cols-2 gap-2">
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
                                {...register('title', { required: 'Product title is required' })} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default Page