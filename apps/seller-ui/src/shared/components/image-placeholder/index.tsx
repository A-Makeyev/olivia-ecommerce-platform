import { useState } from 'react'
import { PencilIcon, WandSparkles, X } from 'lucide-react'
import Image from 'next/image'


interface ImagePlaceholderProps {
    size?: string
    small?: boolean
    onRemove?: (index: number) => void
    onImageChange: (file: File | null, index: number) => void
    setOpenImageModal?: (openImageModal: boolean) => void
    defaultImage?: string | null
    index?: any
}

const ImagePlaceholder = ({
    small,
    size,
    onRemove,
    onImageChange,
    setOpenImageModal,
    defaultImage = null,
    index = null
}: ImagePlaceholderProps) => {
    const [imagePreview, setImagePreview] = useState<string | null>(defaultImage)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setImagePreview(URL.createObjectURL(file))
            onImageChange(file, index!)
        }
    }
    return (
        <div className={`flex flex-col justify-center items-center relative w-full bg-[#1E1E1E] border-slate-600 rounded-lg cursor-pointer 
            ${small ? "h-[180px]" : "h-[450px]"}`
        }>
            <input 
                type="file" 
                accept="image/*" 
                className="hidden"
                id={`image-upload-${index}`}
                onChange={handleFileChange} 
             />
            {imagePreview ? (
                <div className="absolute flex gap-2 right-2 top-2 z-10">
                    <button 
                        type="button" 
                        onClick={() => setOpenImageModal?.(true)}
                        className="p-2 bg-blue-600 hover:bg-blue-500 transition-colors rounded shadow-lg cursor-pointer flex items-center justify-center"
                    >
                        <WandSparkles size={15} />
                    </button>
                    <button 
                        type="button" 
                        onClick={() => onRemove?.(index!)} 
                        className="p-2 bg-red-600 hover:bg-red-500 transition-colors rounded shadow-lg cursor-pointer flex items-center justify-center"
                    >
                        <X size={15} />
                    </button>
                </div>
            ) : (
                <div className="absolute flex gap-2 right-2 top-2 z-10">
                    <label 
                        htmlFor={`image-upload-${index}`} 
                        className="p-2 bg-blue-600 hover:bg-blue-500 transition-colors rounded shadow-lg cursor-pointer flex items-center justify-center"
                    >
                        <PencilIcon size={15} />
                    </label>
                </div>
            )}

            {imagePreview ? (
                <Image
                    fill
                    src={imagePreview}
                    alt="Image Preview"
                    className="w-full h-full object-cover rounded-lg"
                />
            ) : (
                <label 
                    htmlFor={`image-upload-${index}`}
                    className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer"
                >
                    <p className={`font-semibold text-slate-400 ${small ? "text-xl" : "text-3xl"}`}>
                        {size}
                    </p>
                    <p className={`text-center p-2 text-slate-500 ${small ? "text-sm" : "text-medium"}`}>
                        Choose an image 
                    </p>
                </label>
            )}
        </div>
    )
}

export default ImagePlaceholder