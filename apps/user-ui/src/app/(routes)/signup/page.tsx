'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Mail, Lock, UserPen, Loader2 } from 'lucide-react'
import axios, { AxiosError } from 'axios'
import GoogleButton from 'apps/user-ui/src/shared/components/google-button'
import toast from 'react-hot-toast'
import Link from 'next/link'


type FormData = {
    name: string
    email: string
    password: string
}

const Signup = () => {
    const router = useRouter()
    const [timer, setTimer] = useState(60)
    const [otp, setOtp] = useState(['', '', '', ''])
    const [showOtp, setShowOtp] = useState(false)
    const [canResend, setCanResend] = useState(true)
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [userData, setUserData] = useState<FormData | null>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isValid, isSubmitting } 
    } = useForm<FormData>({
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
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-registration`, data)
            return response.data
        },
        onSuccess: (_, formData) => {
            setUserData(formData)
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
            if (!userData) return

            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-verification`,
                {
                    ...userData,
                    otp: otp.join('')
                }
            )
            return response.data
        },
        onSuccess: () => {
            router.push('/login')
        },
        onError: (error: AxiosError<{message?: string}>) => {
            const errorMessage = error.response?.data?.message || 'Something went wrong'
            toast.error(errorMessage)
        }
    })

    const onSubmit = (data: FormData) => {
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
        if (userData) {
            signupMutation.mutate(userData)
        }
    }

    return (
        <div className="w-full py-10 min-h-[85vh] bg-[#F1F1F1]">
            <h1 className="text-3xl font-poppins font-semibold text-black text-center">
                Signup
            </h1>
            <p className="text-center text-lg font-medium py-3 text-[#00000099]">
                Home · Signup
            </p>
            <div className="w-full flex justify-center">
                <div className="md:w-[480px] p-8 bg-white rounded-lg shadow-lg">
                    <h3 className="text-3xl font-semibold text-center mb-5">
                        Create an account
                    </h3>
                    <GoogleButton />
                    <div className="flex items-center my-5 text-slate-400 text-sm">
                        <div className="flex-1 border-t border-slate-300" />
                            <span className="px-3">or</span>
                        <div className="flex-1 border-t border-slate-300" />
                    </div>
                    {!showOtp ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                    'Sign up'
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
                        </form>
                    ) : (
                        <div>
                            <h3 className="text-xl font-semibold text-center my-4">
                                Verification Code
                            </h3>
                            <div className="flex justify-center gap-6">
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
                                className="w-full text-lg mt-6 py-2 rounded-lg cursor-pointer bg-black text-white flex justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:enabled:bg-gray-800 transition"
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
                                    <button onClick={handleResendOtp} className="cursor-pointer text-slate-900 hover:text-slate-700 transition">
                                        Send new code
                                    </button>
                                ) : (
                                    `Resend code in ${timer} seconds`
                                )}
                            </p>
                        </div>
                    )}
                    <div className="flex justify-center mt-4">
                        <p className="text-center text-[#00000099] font-semibold">
                            Already have an account? {' '}
                            <Link href={"/login"} className="text-blue-600 hover:text-blue-500 transition">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signup