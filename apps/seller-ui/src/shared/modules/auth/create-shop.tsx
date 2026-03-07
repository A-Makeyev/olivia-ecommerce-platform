import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import axios, { AxiosError } from 'axios'
import { ChevronDown, Clock, Globe, Loader2, MapPin, NotebookText, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import { shopCategories } from 'apps/seller-ui/src/utils/categories'
import { useState } from 'react'


const CreateShop = ({
    sellerId, 
    setActiveStep
}: {
    sellerId: string,
    setActiveStep: (step: number) => void}
) => {
    const [isCategoryFocused, setIsCategoryFocused] = useState(false)

    const { 
        register, 
        handleSubmit, 
        formState: { errors, isValid } 
    } = useForm({
        mode: 'onChange'
    })

    const createShopMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-shop`, data)
            return response.data
        },
        onSuccess: () => {
            setActiveStep(3)
        },
        onError: (error: AxiosError<{message?: string}>) => {
            const errorMessage = error.response?.data?.message || 'Something went wrong'
            toast.error(errorMessage)
        }
    })

    const onSubmit = async (data: any) => {
        const shopData = { ...data, sellerId }
        createShopMutation.mutate(shopData)
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-3xl font-semibold text-center mb-10">
                    Setup new shop
                </h3>
                <div className="relative mt-4">
                    <div className="absolute top-2.5 left-3 text-slate-500 pointer-events-none">
                        <Store size={20} />
                    </div>
                    <input 
                        type="text" 
                        placeholder=" "
                        className="w-full p-2 pl-10 outline-0 rounded-lg border border-slate-400 peer placeholder-transparent" 
                        { ...register('name', {
                            required: 'Name is required',
                        })}
                    />
                    <label className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-slate-500 transition-all 
                        peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:bg-transparent
                        peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-slate-600 peer-focus:bg-white">
                        Name
                    </label>
                </div>
                {errors.name && (
                    <p className="mt-2 text-red-500 font-medium">
                        {String(errors.name.message)}
                    </p>
                )}
                <div className="relative mt-4">
                    <div className="absolute top-2.5 left-3 text-slate-500 pointer-events-none">
                        <NotebookText size={20} />
                    </div>
                    <input 
                        type="text" 
                        placeholder=" "
                        className="w-full p-2 pl-10 outline-0 rounded-lg border border-slate-400 peer placeholder-transparent" 
                        { ...register('bio', {
                            required: 'Bio is required',
                            validate: (value) => value.trim() !== '' && value.trim().split(/\s+/).length <= 100 || 'Bio must be less than 100 words'
                        })}
                    />  
                    <label className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-slate-500 transition-all 
                        peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:bg-transparent
                        peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-slate-600 peer-focus:bg-white">
                        Bio
                    </label>
                </div>
                {errors.bio && (
                    <p className="mt-2 text-red-500 font-medium">   
                        {String(errors.bio.message)}
                    </p>
                )}
                <div className="relative mt-4">
                    <div className="absolute top-2.5 left-3 text-slate-500 pointer-events-none">
                        <MapPin size={20} />
                    </div>
                    <input 
                        type="text" 
                        placeholder=" "
                        className="w-full p-2 pl-10 outline-0 rounded-lg border border-slate-400 peer placeholder-transparent" 
                        { ...register('address', {
                            required: 'Address is required',
                        })}
                    />  
                    <label className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-slate-500 transition-all 
                        peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:bg-transparent
                        peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-slate-600 peer-focus:bg-white">
                        Address
                    </label>
                </div>
                {errors.address && (
                    <p className="mt-2 text-red-500 font-medium">   
                        {String(errors.address.message)}
                    </p>
                )}
                <div className="relative mt-4">
                    <div className="absolute top-2.5 left-3 text-slate-500 pointer-events-none">
                        <Clock size={20} />
                    </div>
                    <input 
                        type="text" 
                        placeholder=" "
                        className="w-full p-2 pl-10 outline-0 rounded-lg border border-slate-400 peer placeholder-transparent" 
                        { ...register('opening_hours', {
                            required: 'Opening hours is required',
                        })}
                    />  
                    <label className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-slate-500 transition-all 
                        peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:bg-transparent
                        peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-slate-600 peer-focus:bg-white">
                        Opening Hours
                    </label>
                </div>
                {errors.opening_hours && (
                    <p className="mt-2 text-red-500 font-medium">   
                        {String(errors.opening_hours.message)}
                    </p>
                )}
                <div className="relative mt-4">
                    <div className="absolute top-2.5 left-3 text-slate-500 pointer-events-none">
                        <Globe size={20} />
                    </div>
                    <input 
                        type="text" 
                        placeholder=" "
                        className="w-full p-2 pl-10 outline-0 rounded-lg border border-slate-400 peer placeholder-transparent" 
                        { ...register('website', {
                           pattern: {
                                value: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                                message: 'Invalid website URL'
                           }
                        })}
                    />  
                    <label className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-slate-500 transition-all 
                        peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:bg-transparent
                        peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-slate-600 peer-focus:bg-white">
                        Website
                    </label>
                </div>
                {errors.website && (
                    <p className="mt-2 text-red-500 font-medium">   
                        {String(errors.website.message)}
                    </p>
                )}
                <div className="relative mt-4">
                    <select 
                        className="w-full p-2 pl-10 pr-10 outline-0 rounded-lg border border-slate-400 peer bg-transparent appearance-none" 
                        { ...register("category", {
                            required: "Category is required",
                        })}
                        onFocus={() => setIsCategoryFocused(true)}
                        onBlur={() => setIsCategoryFocused(false)}
                        onChange={(e) => {
                            register("category").onChange(e);
                            (e.target as HTMLSelectElement).blur()
                        }}
                    >
                        <option value="" disabled hidden></option>
                        {shopCategories.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute top-2.5 left-3 text-slate-500 pointer-events-none">
                        <Globe size={20} />
                    </div>
                    <div className="absolute top-2.5 right-3 text-slate-500 pointer-events-none">
                        <ChevronDown 
                            size={20} 
                            className={`transition-transform duration-200 ${isCategoryFocused ? 'rotate-180' : ''}`} 
                        />
                    </div>
                    <label className="absolute left-10 transition-all pointer-events-none px-1
                        peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-slate-600 peer-focus:bg-white
                        peer-valid:-top-2.5 peer-valid:text-sm peer-valid:text-slate-500 peer-valid:bg-white
                        top-2 text-base text-slate-400 bg-transparent">
                        Category
                    </label>
                    {errors.category && (
                        <p className="mt-2 text-red-500 font-medium">
                            {String(errors.category.message)}
                        </p>
                    )}
                </div>
                <button 
                    type="submit"
                    disabled={createShopMutation.isPending}
                    className="w-full text-lg mt-6 py-2 rounded-lg cursor-pointer bg-black text-white flex justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:enabled:bg-gray-800 transition"
                >
                    {createShopMutation.isPending ? (
                        <Loader2 size={28} className="animate-spin mr-2" />
                    ) : (
                        'Create'
                    )}
                </button>
            </form>
        </div>
    )
}

export default CreateShop