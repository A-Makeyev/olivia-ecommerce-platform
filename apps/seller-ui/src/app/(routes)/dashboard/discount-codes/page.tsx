'use client'

import { useState } from 'react'
import { ChevronRight, Loader2, PlusCircle, Trash2, X, Tag, Coins, TicketPercent, ChevronDown, Percent } from 'lucide-react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import toast from 'react-hot-toast'
import { Controller, useForm } from 'react-hook-form'
import Input from 'packages/components/input'
import { AxiosError } from 'axios'
import DeleteDiscountCodeModal from 'apps/seller-ui/src/shared/components/modals/delete-discount-codes'


const Page = () => {
    const queryClient = useQueryClient()
    const [showModal, setShowModal] = useState(false)
    const [isTypeOpen, setIsTypeOpen] = useState(false)
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false)
    const [selectedDiscount, setSelectedDiscount] = useState<any>(null)

    const { data: discountCodes = [], isLoading, isError } = useQuery({
        queryKey: ['discount-codes'],
        queryFn: async () => {
            const res = await axiosInstance.get('/product/api/get-discount-codes')
            return res?.data?.discountCodes || []
        }
    })

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            public_name: '',
            discountCode: '',
            discountType: 'percentage',
            discountValue: ''
        }
    })

    const createDiscountCodeMutation = useMutation({
        mutationFn: async (data: any) => {
            await axiosInstance.post('/product/api/create-discount-code', data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discount-codes'] })
            toast.success('Discount code created')
            setShowModal(false)
            reset()
        }
    })

    const deleteDiscountCodeMutation = useMutation({
        mutationFn: async (discountId: string) => {
            await axiosInstance.delete(`/product/api/delete-discount-code/${discountId}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discount-codes'] })
            toast.success('Discount code deleted')
            setConfirmDeleteModal(false)
            setSelectedDiscount(null)
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to delete discount code')
            setConfirmDeleteModal(false)
            setSelectedDiscount(null)
        }
    })

    const handleDeleteCode = (discount: any) => {
        setSelectedDiscount(discount)
        setConfirmDeleteModal(true)
    }

    const onSubmit = (data: any) => {
        if (discountCodes.length >= 8) {
            toast.error('You can only create 8 discount codes')
            return
        }
        createDiscountCodeMutation.mutate(data)
    }

    const discountType = watch('discountType')

    return (
        <div className="w-full min-h-screen p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-white font-Poppins">
                        Discount Codes
                    </h2>
                    <div className="flex items-center text-sm text-slate-400 mt-1">
                        <Link href={"/dashboard"} className="text-[#80DEEA] hover:underline cursor-pointer">
                            Dashboard
                        </Link>
                        <ChevronRight size={14} className="mx-1 opacity-[0.8]" />
                        <span>Discount Codes</span>
                    </div>
                </div>
                <button 
                    disabled={discountCodes?.length >= 8}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-slate-950 bg-[#80DEEA] hover:bg-[#4dd0e1] rounded-lg shadow-lg transition disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                    onClick={() => setShowModal(true)}
                >
                    <PlusCircle size={18} />
                    Create Discount
                </button>
            </div>
            <div className="mt-6 sm:p-6 bg-slate-900 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Your Discount Codes
                </h3>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-3">
                        <Loader2 size={30} className="animate-spin text-[#80DEEA]" />
                        <p className="text-sm font-medium tracking-wide">Loading discount codes</p>
                    </div>
                ) : isError ? (
                    <p className="text-red-500 py-4">Failed to fetch discount codes</p>
                ) : discountCodes && discountCodes.length > 0 ? (
                    <>
                        {/* Mobile card list */}
                        <div className="flex flex-col gap-3 md:hidden">
                            {discountCodes.map((discount: any) => (
                                <div key={discount?.id} className=" flex justify-between items-start gap-4 p-4 bg-slate-800/40 border border-slate-800 rounded-xl">
                                    <div className="flex flex-col gap-1.5 min-w-0">
                                        <span className="text-white font-semibold truncate">{discount?.public_name}</span>
                                        <span className="font-mono text-sm font-semibold text-[#80DEEA]">{discount?.discountCode}</span>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
                                            <span className="capitalize">
                                                {discount?.discountType === 'percentage' ? 'Percentage' : 'Fixed'}
                                            </span>
                                            <span className="text-slate-600">·</span>
                                            <span className="text-slate-300 font-semibold">
                                                {discount?.discountType === 'percentage' ? `${discount.discountValue}%` : `$${discount.discountValue}`}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCode(discount)}
                                        disabled={deleteDiscountCodeMutation.isPending}
                                        className="shrink-0 text-red-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                                        title="Delete discount code"
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* Desktop table */}
                        <div className="hidden md:block w-full">
                            <table className="w-full text-slate-300">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400 text-sm">
                                        <th className="py-3 text-left font-medium">Name</th>
                                        <th className="py-3 text-left font-medium">Code</th>
                                        <th className="py-3 text-left font-medium">Type</th>
                                        <th className="py-3 text-left font-medium">Value</th>
                                        <th className="py-3 text-left font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {discountCodes.map((discount: any) => (
                                        <tr key={discount?.id} className="font-semibold border-t border-slate-800/60 hover:bg-slate-800/40 transition">
                                            <td className="py-3 text-white">{discount?.public_name}</td>
                                            <td className="py-3 font-mono text-[#80DEEA]">{discount?.discountCode}</td>
                                            <td className="py-3 capitalize">
                                                {discount?.discountType === 'percentage' ? 'Percentage (%)' : 'Fixed ($)'}
                                            </td>
                                            <td className="py-3">
                                                {discount?.discountType === 'percentage' ? `${discount.discountValue}%` : `$${discount.discountValue}`}
                                            </td>
                                            <td className="py-3">
                                                <button
                                                    onClick={() => handleDeleteCode(discount)}
                                                    disabled={deleteDiscountCodeMutation.isPending}
                                                    className="text-red-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:scale-105"
                                                    title="Delete discount code"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="text-slate-400 py-14 mb-6 text-center font-medium border border-dashed border-slate-800 rounded-lg">
                        No codes available
                    </div>
                )}
            </div>
            {showModal && (
                <div className="flex items-center justify-center fixed w-full h-full top-0 left-0 text-white bg-black/60 backdrop-blur-sm z-50 p-4">
                    <div className="relative p-6 w-full max-w-[450px] bg-black border border-slate-800 rounded-2xl shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center pb-4">
                            <h3 className="text-lg font-semibold text-white font-Poppins">New Discount Code</h3>
                            <button
                                className="text-slate-400 hover:text-white transition-colors"
                                onClick={() => setShowModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                            <Input 
                                size="sm"
                                label="Name"
                                icon={<Tag />}
                                placeholder="Name"
                                error={errors.public_name?.message}
                                {...register('public_name', { 
                                    required: 'Name is required',
                                    pattern: {
                                        value: /^[a-zA-Z0-9 ]+$/,
                                        message: 'Code must contain only letters and numbers'
                                    },
                                    validate: (value) => 
                                        !discountCodes.some((code: any) => code.public_name.trim().toLowerCase() === value.trim().toLowerCase()) 
                                        || 'A discount code with this name already exists'
                                })}
                            />
                            <Controller 
                                name="discountType"
                                control={control}
                                render={({ field: { onBlur, ref, ...rest } }) => (
                                    <div className="relative my-2">
                                        <select
                                            {...rest}
                                            ref={ref}
                                            className="peer w-full pl-9 pr-10 py-1.5 min-h-[38px] appearance-none outline-0 rounded-lg border border-slate-400 focus:border-[#80DEEA] transition-all duration-300 ease-out bg-transparent text-sm text-white cursor-pointer relative z-20"
                                            onClick={() => setIsTypeOpen(prev => !prev)}
                                            onBlur={() => { setIsTypeOpen(false); onBlur() }}
                                        >
                                            <option value="percentage" className="bg-slate-900">Percentage (%)</option>
                                            <option value="fixed" className="bg-slate-900">Fixed Amount ($)</option>
                                        </select>
                                        <div className="absolute top-[10px] left-3 text-slate-400 pointer-events-none z-30 peer-focus:text-white transition-colors">
                                            <Percent size={16} />
                                        </div>
                                        <label className={`absolute transition-all duration-300 ease-out pointer-events-none z-30 bg-black px-1.5 peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm peer-focus:text-white ${rest.value ? '-top-3 left-3 text-sm text-white' : 'top-2 left-9 text-sm text-slate-400'}`}>
                                            Discount Type
                                        </label>
                                        <div className={`absolute top-[9px] right-3 text-slate-400 pointer-events-none z-30 transition-transform ${isTypeOpen ? 'rotate-180' : 'rotate-0'}`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    </div>
                                )}
                            />
                            <Input 
                                type="number"
                                size="sm"
                                label="Value"
                                icon={<Coins />}
                                placeholder="Value"
                                min={1}
                                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                error={errors.discountValue?.message}
                                {...register('discountValue', { 
                                    required: 'Value is required',
                                    valueAsNumber: true,
                                    min: {
                                        value: 1,
                                        message: 'Value must be at least 1'
                                    },
                                    max: {
                                        value: discountType === 'percentage' ? 100 : 10000,
                                        message: discountType === 'percentage' ? 'Value must be 100% or less' : 'Value must be $10,000 or less'
                                    }
                                })}
                            />
                             <Input 
                                 size="sm"
                                 label="Code"
                                 icon={<TicketPercent />}
                                 placeholder="Code"
                                 error={errors.discountCode?.message}
                                 {...register('discountCode', { 
                                    required: 'Code is required',
                                    maxLength: {
                                        value: 10,
                                        message: 'Code must be 10 characters or less'
                                    },
                                    pattern: {
                                        value: /^[a-zA-Z0-9 ]+$/,
                                        message: 'Code must contain only letters and numbers'
                                    },
                                    setValueAs: (value) => value?.replace(/\s/g, '').toUpperCase()
                                 })}
                             />
                            <div className="flex justify-start gap-3 pt-1">
                                <button
                                    type="submit"
                                    disabled={createDiscountCodeMutation.isPending}
                                    className="flex items-center justify-center min-w-[100px] w-full px-4 py-2 text-sm bg-[#80DEEA] text-slate-950 hover:bg-[#4dd0e1] font-semibold transition rounded-lg"
                                >
                                    {createDiscountCodeMutation.isPending ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        'Create'
                                    )}
                                </button>
                            </div>
                            {createDiscountCodeMutation.isError && (
                                <p className="text-red-500 text-sm mt-4 text-center">
                                    {(
                                        createDiscountCodeMutation.error as AxiosError<{ message: string }>
                                    )?.response?.data?.message || 'Something went wrong'}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            )}
            {confirmDeleteModal && selectedDiscount && (
                <DeleteDiscountCodeModal
                    discount={selectedDiscount}
                    onClose={() => setConfirmDeleteModal(false)}
                    onConfirm={() => deleteDiscountCodeMutation.mutate(selectedDiscount?.id)}
                    isPending={deleteDiscountCodeMutation.isPending}
                    isError={deleteDiscountCodeMutation.isError}
                    error={deleteDiscountCodeMutation.error}
                />
            )}
        </div>
    )
}

export default Page