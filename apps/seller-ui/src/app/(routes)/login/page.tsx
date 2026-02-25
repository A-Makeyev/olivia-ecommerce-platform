'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import Link from 'next/link'


type FormData = {
    email: string
    password: string
}

const Login = () => {
    const router = useRouter()
    const [rememberMe, setRememberMe] = useState(false)
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

    const { 
        register, 
        handleSubmit, 
        formState: { errors, isValid, isSubmitting } 
    } = useForm<FormData>({
        mode: 'onChange'
    })
    
    const loginMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-login`, 
                data, 
                { withCredentials: true }
            )
            return response.data
        },
        onSuccess: (data) => {
            setServerError(null)
            router.push('/')
        },
        onError: (error: AxiosError<{message?: string}>) => {
            const errorMessage = error.response?.data?.message || 'Something went wrong'
            setServerError(errorMessage)
        }
    })

    const onSubmit = (data: FormData) => {
        loginMutation.mutate(data)
    }

    return (
        <div className="w-full py-10 min-h-screen bg-[#F1F1F1]">
            <h1 className="text-3xl font-poppins font-semibold text-black text-center">
                Login
            </h1>
            <p className="text-center text-lg font-medium py-3 text-[#00000099]">
                Home · Login
            </p>
            <div className="w-full flex justify-center">
                <div className="md:w-[480px] p-8 bg-white rounded-lg shadow-lg">
                    <h3 className="text-3xl font-semibold text-center mb-5">
                        Login to your account
                    </h3>
                    <div className="flex items-center my-5 text-slate-400 text-sm">
                        <div className="flex-1 border-t border-slate-300" />
                            <span className="px-3">or</span>
                        <div className="flex-1 border-t border-slate-300" />
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        <div className="flex justify-between items-center my-4">
                            <label className="flex items-center text-sm text-slate-600">
                                <input 
                                    type="checkbox" 
                                    className="mr-2" 
                                    checked={rememberMe} 
                                    onChange={() => setRememberMe(!rememberMe)} 
                                />
                                Remember me
                            </label>
                            <Link href={"/forgot-password"} className="text-sm text-blue-600 hover:text-blue-500 transition">
                                Forgot password?
                            </Link> 
                        </div>
                        <button 
                            type="submit" 
                            disabled={!isValid || isSubmitting || loginMutation.isPending} 
                            className="w-full text-lg py-2 rounded-lg flex justify-center cursor-pointer bg-black text-white hover:enabled:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed">
                            {loginMutation.isPending ? (
                                <Loader2 size={28} className="animate-spin mr-2" />
                            ) : (
                                'Login'
                            )}
                        </button>
                        {serverError && (
                            <p className="mt-2 text-red-500 font-medium text-center">
                                {serverError} 
                            </p>
                        )}
                    </form>
                    <div className="flex justify-center mt-4">
                        <p className="text-center text-[#00000099] font-semibold">
                            Don't have an account? {' '}
                            <Link href={"/signup"} className="text-blue-600 hover:text-blue-500 transition">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login