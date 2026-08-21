'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Mail, Loader2, Lock, EyeOff, Eye } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance'
import toast from 'react-hot-toast'
import Link from 'next/link'


type FormData = {
    email: string
    password: string
}

const ForgotPassword = () => {
    const router = useRouter()
    const [timer, setTimer] = useState(60)
    const [otp, setOtp] = useState(['', '', '', ''])
    const [canResend, setCanResend] = useState(true)
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [serverError, setServerError] = useState<string | null>(null)
    const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email')
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

    const requestOtpMutation = useMutation({
        mutationFn: async ({ email }: { email: string }) => {
            const response = await axiosInstance.post('/api/forgot-password', 
                { email }
            )
            return response.data
        }, 
        onSuccess: (_, { email }) => {
            setUserEmail(email)
            setStep('otp')
            setCanResend(false)
            setTimer(60)
            setServerError(null)
            startResendTimer()
            toast.success('Verification code sent')
        },
        onError: (error: AxiosError<{message?: string}>) => {
            const errorMessage = error.response?.data?.message || 'Something went wrong'
            setServerError(errorMessage)
            toast.error(errorMessage)
        }
    })

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!userEmail) return

            const response = await axiosInstance.post('/api/verify-forgot-password', 
                { email: userEmail, otp: otp.join('') }
            )
            return response.data
        },
        onSuccess: () => {
            setStep('reset')
            setServerError(null)
        },
        onError: (error: AxiosError<{message?: string}>) => {
            const errorMessage = error.response?.data?.message || 'Something went wrong'
            setServerError(errorMessage)
        }
    })

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ password }: { password: string }) => {
            if (!password) return

            const response = await axiosInstance.post('/api/reset-password', 
                { email: userEmail, newPassword: password }
            )
            return response.data
        },
        onSuccess: () => {
            setServerError(null)
            router.push('/login')
            toast.success('Password reset successfully')
        },
        onError: (error: AxiosError<{message?: string}>) => {
            const errorMessage = error.response?.data?.message || 'Something went wrong'
            setServerError(errorMessage)
            toast.error(errorMessage)
        }
    })

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

    const onSubmitEmail = ({ email }: { email: string }) => {
        requestOtpMutation.mutate({ email })
    }

    const onSubmitPassword = ({ password }: { password: string }) => {
        resetPasswordMutation.mutate({ password })
    }

    const onSubmit = (data: FormData) => {
        console.log(data)
    }

    return (
        <div className="w-full py-10 min-h-[85vh] bg-[#F1F1F1]">
            <h1 className="text-3xl font-poppins font-semibold text-black text-center">
                Forgot Password
            </h1>
            <p className="text-center text-lg font-medium py-3 text-[#00000099]">
                Home · Forgot Password
            </p>
            <div className="w-full flex justify-center">
                <div className="md:w-[480px] p-8 bg-white rounded-lg shadow-lg">
                    {step === 'email' && (
                        <>
                            <h3 className="text-3xl font-semibold text-center mb-10">
                                Reset your password
                            </h3>
                            <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-4">
                                <div className="relative mt-10">
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
                                    <p className="text-red-500 font-medium">
                                        {String(errors.email.message)}
                                    </p>
                                )}
                                <button 
                                    type="submit" 
                                    disabled={!isValid || isSubmitting || requestOtpMutation.isPending} 
                                    className="w-full text-lg py-2 rounded-lg flex justify-center cursor-pointer bg-black text-white hover:enabled:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed">
                                    {requestOtpMutation.isPending ? (
                                        <Loader2 size={28} className="animate-spin mr-2" />
                                    ) : (
                                        'Send Reset Code'
                                    )}
                                </button>
                                {serverError && (
                                    <p className="text-red-500 font-medium text-center">
                                        {serverError} 
                                    </p>
                                )}
                            </form>
                        </>
                    )}

                    {step === 'otp' && (
                        <>
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
                                className="w-full text-lg mt-6 my-6 py-2 rounded-lg cursor-pointer bg-black text-white flex justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:enabled:bg-gray-800 transition"
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
                                    <p className="my-4 text-red-500 font-medium text-center">
                                        {verifyOtpMutation?.error?.response?.data?.message || 'Something went wrong'}
                                    </p>
                                )
                            }
                            <p className="my-4 text-center text-sm font-medium">
                                { canResend ? (
                                    <button onClick={() => requestOtpMutation.mutate({ email: userEmail! })} className="cursor-pointer text-slate-900 hover:text-slate-700 transition">
                                        Send new code
                                    </button>
                                ) : (
                                    `Resend code in ${timer} seconds`
                                )}
                            </p>
                        </>
                    )}

                    {step === 'reset' && (
                        <>
                            <h3 className="text-2xl font-semibold text-center mb-10">
                                Set a new password
                            </h3>
                            <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
                                <div className="relative mt-4">
                                    <div className="absolute top-2.5 left-3 text-slate-500 pointer-events-none">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        placeholder=" "
                                        className="w-full p-2 pl-10 pr-10 outline-0 rounded-lg border border-slate-400 peer placeholder-transparent"
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
                                        New Password
                                    </label>
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-3 flex items-center text-slate-500"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                    >
                                        {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 font-medium">
                                        {String(errors.password.message)}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={!isValid || isSubmitting || resetPasswordMutation.isPending}
                                    className="w-full text-lg py-2 rounded-lg flex justify-center cursor-pointer bg-black text-white hover:enabled:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed">
                                    {resetPasswordMutation.isPending ? (
                                        <Loader2 size={28} className="animate-spin mr-2" />
                                    ) : (
                                        'Reset'
                                    )}
                                </button>
                                {serverError && (
                                    <p className="text-red-500 font-medium text-center">
                                        {serverError}
                                    </p>
                                )}
                            </form>
                        </>
                    )}
                    <div className="flex justify-center mt-10">
                        <p className="text-center text-[#00000099] font-semibold">
                            Back to {' '}
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

export default ForgotPassword