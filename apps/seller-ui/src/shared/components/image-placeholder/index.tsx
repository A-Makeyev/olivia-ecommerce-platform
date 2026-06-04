import { PencilIcon, WandSparkles, X, Loader2 } from 'lucide-react'
import Image from 'next/image'


interface ImagePlaceholderProps {
    size?: string
    small?: boolean
    images: any
    onRemove?: (index: number) => void
    uploadingIndex: number | null
    onImageChange: (file: File | null, index: number) => void
    setSelectedImage: (selectedImage: string) => void
    setOpenImageModal: (openImageModal: boolean) => void
    defaultImage?: string | null
    index?: any
}

const ImagePlaceholder = ({
    small,
    size,
    images,
    onRemove,
    uploadingIndex,
    onImageChange,
    setSelectedImage,
    setOpenImageModal,
    defaultImage = null,
    index = null
}: ImagePlaceholderProps) => {
    const currentImage = images[index]
    const imagePreview = currentImage?.url || defaultImage
    const isUploading = uploadingIndex === index
    const isAnyUploading = uploadingIndex !== null

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            onImageChange(file, index!)
        }
        // Reset input value so the same file can be re-selected
        event.target.value = ''
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
                disabled={isAnyUploading}
             />
            {imagePreview ? (
                <div className="absolute flex gap-2 right-2 top-2 z-10">
                    <button 
                        type="button" 
                        className="p-2 bg-blue-600 hover:bg-blue-500 transition-colors rounded shadow-lg cursor-pointer flex items-center justify-center"
                        disabled={isAnyUploading}
                        onClick={() => {
                            setSelectedImage(currentImage.url)
                            setOpenImageModal(true)
                        }}
                    >
                        <WandSparkles size={15} />
                    </button>
                    <button 
                        type="button" 
                        className="p-2 bg-red-600 hover:bg-red-500 transition-colors rounded shadow-lg cursor-pointer flex items-center justify-center"
                        disabled={isAnyUploading}
                        onClick={() => onRemove?.(index!)} 
                    >
                        <X size={15} />
                    </button>
                </div>
            ) : (
                <div className="absolute flex gap-2 right-2 top-2 z-10">
                    <label 
                        htmlFor={`image-upload-${index}`} 
                        className={`p-2 bg-blue-600 hover:bg-blue-500 transition-colors rounded shadow-lg flex items-center justify-center ${isAnyUploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}
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
                    className="object-cover rounded-md !cursor-default"
                />
            ) : (
                <label 
                    htmlFor={`image-upload-${index}`}
                    className={`flex flex-col items-center justify-center w-full h-full rounded-md ${isAnyUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <p className={`font-semibold text-slate-400 ${small ? "text-xl" : "text-3xl"}`}>
                        {size}
                    </p>
                    <p className={`text-center p-2 text-slate-500 ${small ? "text-sm" : "text-medium"}`}>
                        Choose an image 
                    </p>
                </label>
            )}
            {isUploading && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg pointer-events-auto">
                    <Loader2 size={small ? 24 : 38} className="animate-spin text-[#80DEEA]" />
                    <span className="text-slate-400 text-xs mt-2 font-medium tracking-wide">Uploading..</span>
                </div>
            )}
        </div>
    )
}

export default ImagePlaceholder