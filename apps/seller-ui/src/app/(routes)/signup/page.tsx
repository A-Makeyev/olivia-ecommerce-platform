'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Mail, Lock, UserPen, Loader2, Phone, Globe, ChevronDown } from 'lucide-react'
import { countries } from 'apps/seller-ui/src/utils/countries'
import axios, { AxiosError } from 'axios'
import CreateShop from 'apps/seller-ui/src/shared/modules/auth/create-shop'
import StripeIcon from 'apps/seller-ui/src/assets/svgs/stripe-icon'
import toast from 'react-hot-toast'
import Link from 'next/link'


const Signup = () => {
    const router = useRouter()
    const [activeStep, setActiveStep] = useState(1)
    const [timer, setTimer] = useState(60)
    const [otp, setOtp] = useState(['', '', '', ''])
    const [showOtp, setShowOtp] = useState(false)
    const [canResend, setCanResend] = useState(true)
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [sellerData, setSellerData] = useState<FormData | null>(null)
    const [sellerId, setSellerId] = useState('')
    const [isCountryFocused, setIsCountryFocused] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isValid, isSubmitting } 
    } = useForm({
        mode: 'onChange'
    })

    const startResendTimer = () => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(interval)
                    setCanResend(true)
                    return 0
                }
                return prevTimer - 1
            })
        }, 1000)
    }
    
    const signupMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-registration`, data)
            return response.data
        },
        onSuccess: (_, formData) => {
            setSellerData(formData)
            setShowOtp(true)
            setCanResend(false)
            setTimer(60)
            startResendTimer()
            toast.success('Verification code sent')
        },
        onError: (error: AxiosError<{message?: string}>) => {
            const errorMessage = error.response?.data?.message || 'Something went wrong'
            toast.error(errorMessage)
        }
    })

    const verifyOtpMutation = useMutation({
        mutationFn: async() => {
            if (!sellerData) return

            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-verification`,
                {
                    ...sellerData,
                    otp: otp.join('')
                }
            )
            return response.data
        },
        onSuccess: (data) => {
            setSellerId(data?.seller?.id)
            setActiveStep(2)
            toast.success('Verification successful')
        },
        onError: (error: AxiosError<{message?: string}>) => {
            const errorMessage = error.response?.data?.message || 'Something went wrong'
            toast.error(errorMessage)
        }
    })

    const onSubmit = (data: any) => {
        signupMutation.mutate(data)
    }

    const handleOtpChange = (index: number, value: string) => {
        if (value === "") {
             const newOtp = [...otp]
             newOtp[index] = value
             setOtp(newOtp)
             return
        }
        if (!/^[0-9]$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        if (value && index <inputRefs.current.length -1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeydown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleResendOtp = () => {
        if (sellerData) {
            signupMutation.mutate(sellerData)
        }
    }

    const connectStripeMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-stripe-connect-link`, {
                sellerId
            })
            return response.data
        },
        onSuccess: (data) => {
            if (data.url) {
                window.location.href = data.url
            }
        },
        onError: (error: AxiosError<{message?: string}>) => {
            const errorMessage = error.response?.data?.message || 'Something went wrong'
            toast.error(errorMessage)
        }
    })

    return (
        <div className="w-full flex flex-col items-center pt-10 min-h-screen">
             <div className="relative flex items-center justify-between mb-8 md:w-[50%]">
                <div className="absolute top-[25%] left-0 ml-4 w-[80%] md:w-[85%] lg:w-[90%] h-1 -z-10 bg-slate-300" />
                {[1,2,3].map((step) => (
                    <div key={step}>
                        <div className={`w-10 h-10 mb-1 ml-4 rounded-full flex items-center justify-center text-white font-bold 
                            ${activeStep >= step ? 'bg-blue-600' : 'bg-slate-300'}
                        `}>
                            {step}
                        </div>
                        <span className="font-medium ml-[-15px]">
                            {step === 1 ? 'Create Account' : step === 2 ? 'Setup Shop' : 'Connect Bank'}
                        </span>
                    </div>
                ))}
            </div>
            <div className="md:w-[480px] mt-8 p-8 bg-white rounded-lg shadow-xl">
                {activeStep === 1 && (
                    <>
                        {!showOtp ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
                                <h3 className="text-3xl font-semibold text-center mb-10">
                                    Create an account
                                </h3>
                                <div className="relative mt-4">
                                    <div className="absolute top-2.5 left-3 text-slate-500 pointer-events-none">
                                        <UserPen size={20} />
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
                                        <Mail size={20} />
                                    </div>
                                    <input 
                                        type="email" 
                                        placeholder=" "
                                        className="w-full p-2 pl-10 outline-0 rounded-lg border border-slate-400 peer placeholder-transparent" 
                                        { ...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                                message: 'Invalid email address'
                                            },
                                        })}
                                    />
                                    <label className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-slate-500 transition-all 
                                        peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:bg-transparent
                                        peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-slate-600 peer-focus:bg-white">
                                        Email
                                    </label>
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-red-500 font-medium">
                                        {String(errors.email.message)}
                                    </p>
                                )}
                                <div className="relative mt-4">
                                    <input 
                                        type="tel" 
                                        placeholder=" " 
                                        className="w-full p-2 pl-10 outline-0 rounded-lg border border-slate-400 peer placeholder-transparent" 
                                        { ...register("phone_number", {
                                            required: "Phone Number is required",
                                            pattern: {
                                                value: /^\+?([0-9\s()-]){6,20}$/,
                                                message: "Invalid phone number",
                                            },
                                            minLength: {
                                                value: 10,
                                                message: "Phone Number must be at least 10 digits",
                                            },
                                            maxLength: {
                                                value: 15,
                                                message: "Phone Number must be at most 15 digits",
                                            },
                                        })}
                                    />
                                    <div className="absolute top-2.5 left-3 text-slate-500 pointer-events-none">
                                        <Phone size={20} />
                                    </div>
                                    <label className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-slate-500 transition-all 
                                        peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:bg-transparent
                                        peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-slate-600 peer-focus:bg-white">
                                        Phone Number
                                    </label>
                                    {errors.phone_number && (
                                        <p className="mt-2 text-red-500 font-medium">
                                            {String(errors.phone_number.message)}
                                        </p>
                                    )}
                                </div>
                                <div className="relative mt-4">
                                    <select 
                                        className="w-full p-2 pl-10 pr-10 outline-0 rounded-lg border border-slate-400 peer bg-transparent appearance-none" 
                                        { ...register("country", {
                                            required: "Country is required",
                                        })}
                                        onFocus={() => setIsCountryFocused(true)}
                                        onBlur={() => setIsCountryFocused(false)}
                                        onChange={(e) => {
                                            register("country").onChange(e);
                                            (e.target as HTMLSelectElement).blur()
                                        }}
                                    >
                                        <option value="" disabled hidden></option>
                                        {countries.map((country) => (
                                            <option key={country.code} value={country.code}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute top-2.5 left-3 text-slate-500 pointer-events-none">
                                        <Globe size={20} />
                                    </div>
                                    <div className="absolute top-2.5 right-3 text-slate-500 pointer-events-none">
                                        <ChevronDown 
                                            size={20} 
                                            className={`transition-transform duration-200 ${isCountryFocused ? 'rotate-180' : ''}`} 
                                        />
                                    </div>
                                    <label className="absolute left-10 transition-all pointer-events-none px-1
                                        peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-slate-600 peer-focus:bg-white
                                        peer-valid:-top-2.5 peer-valid:text-sm peer-valid:text-slate-500 peer-valid:bg-white
                                        top-2 text-base text-slate-400 bg-transparent">
                                        Country
                                    </label>
                                    {errors.country && (
                                        <p className="mt-2 text-red-500 font-medium">
                                            {String(errors.country.message)}
                                        </p>
                                    )}
                                </div>
                                <div className="relative mt-4">
                                    <div className="absolute top-2.5 left-3 text-slate-500 pointer-events-none">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        placeholder=" "
                                        className="w-full p-2 pl-10 outline-0 rounded-lg border border-slate-400 peer placeholder-transparent"
                                        { ...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters",
                                            },
                                        })}
                                    />
                                    <label className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-slate-500 transition-all 
                                        peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:bg-transparent
                                        peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-slate-600 peer-focus:bg-white">
                                        Password
                                    </label>
                                    <button 
                                        type="button"  
                                        className="absolute inset-y-0 right-3 flex items-center text-slate-500" 
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                    >
                                        {passwordVisible ? <EyeOff /> :<Eye />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-red-500 font-medium">
                                        {String(errors.password.message)}
                                    </p>
                                )}
                                <button 
                                    type="submit" 
                                    disabled={!isValid || isSubmitting || signupMutation.isPending}  
                                    className="w-full text-lg py-2 rounded-lg cursor-pointer bg-black text-white flex justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:enabled:bg-gray-800 transition">
                                    {signupMutation.isPending ? (
                                        <Loader2 size={28} className="animate-spin mr-2" />
                                    ) : (
                                        'Register'
                                    )}
                                </button>
                                {
                                    signupMutation?.isError &&
                                    signupMutation.error instanceof AxiosError && (
                                        <p className="my-4 mt-2 text-red-500 font-medium text-center">
                                            {signupMutation.error.response?.data?.message || 'Something went wrong'}
                                        </p>
                                    )
                                }
                                <div className="flex justify-center mt-4">
                                    <p className="text-center text-[#00000099] font-semibold">
                                        Already have an account? {' '}
                                        <Link href={"/login"} className="text-blue-600 hover:text-blue-500 transition">
                                            Login
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <h3 className="text-xl font-semibold text-center">
                                    Verification Code
                                </h3>
                                <div className="flex justify-center my-6 gap-6">
                                    {otp?.map((digit, index) => (
                                        <input 
                                            type="text"    
                                            key={index}
                                            value={digit}
                                            maxLength={1}
                                            className="w-12 h-12 text-center border border-slate-500 outline-none rounded-lg"
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeydown(index, e)}
                                            ref={(el) => {
                                                if (el) inputRefs.current[index] = el
                                            }}
                                        />
                                    ))}
                                </div>
                                <button 
                                    disabled={verifyOtpMutation.isPending || !otp.every(digit => digit !== '')}
                                    onClick={() => verifyOtpMutation.mutate()}
                                    className="w-full text-lg mt-6 py-2 rounded-lg bg-black text-white flex justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:enabled:bg-gray-800 transition"
                                >
                                    {verifyOtpMutation.isPending ? (
                                        <Loader2 size={28} className="animate-spin mr-2" />
                                    ) : (
                                        'Verify'
                                    )}
                                </button>
                                {
                                    verifyOtpMutation?.isError && 
                                    verifyOtpMutation?.error instanceof AxiosError && (
                                        <p className="my-4 mt-2 text-red-500 font-medium text-center">
                                            {verifyOtpMutation?.error?.response?.data?.message || 'Something went wrong'}
                                        </p>
                                    )
                                }
                                <p className="my-4 text-center text-sm font-medium">
                                    { canResend ? (
                                        <button onClick={handleResendOtp} className="text-slate-900 hover:text-slate-700 transition">
                                            Send New Code
                                        </button>
                                    ) : (
                                        `Resend code in ${timer} seconds`
                                    )}
                                </p>
                            </div>
                        )}
                    </>
                )}
                {activeStep === 2 && (
                    <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
                )}
                {activeStep === 3 && (
                    <div className="text-center">
                        <h3 className="text-2xl font-semibold">
                            Payment Method
                        </h3>
                        <br />
                        <button 
                            onClick={() => connectStripeMutation.mutate()}
                            className="w-full m-auto flex items-center justify-center gap-3 py-2 text-lg rounded-lg bg-black text-white hover:bg-gray-800 transition"
                        >
                            {connectStripeMutation.isPending ? (
                                <Loader2 size={28} className="animate-spin mr-2" />
                            ) : (
                                <>
                                    <StripeIcon /> 
                                    Connect Stripe
                                </>
                            )}
                        </button>
                        {
                            connectStripeMutation.isError &&
                            connectStripeMutation.error instanceof AxiosError && (
                                <p className="my-4 mt-2 text-red-500 font-medium text-center">
                                    {connectStripeMutation.error.response?.data?.message || 'Something went wrong'}
                                </p>
                            )
                        }
                    </div>
                )}
            </div>
        </div>
    )
}

export default Signup