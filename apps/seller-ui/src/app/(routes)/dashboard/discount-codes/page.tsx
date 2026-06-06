'use client'
import { useState } from 'react'
import { ChevronRight, Loader2, Trash2, X, Tag, Coins, TicketPercent, Percent } from 'lucide-react'
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
    <div className="w-full min-h-screen font-semibold p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white font-Poppins tracking-tight">
                    Discount Codes
                </h1>
                <div className="flex items-center gap-1 text-sm text-slate-500 mt-1.5">
                    <Link href="/dashboard" className="text-[#80DEEA] hover:text-[#4dd0e1] transition-colors">
                        Dashboard
                    </Link>
                    <ChevronRight size={13} className="opacity-40" />
                    <span>Discount Codes</span>
                </div>
            </div>
            <button 
                disabled={discountCodes?.length >= 8}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-950 bg-[#80DEEA] hover:bg-[#4dd0e1] rounded-lg transition disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                onClick={() => setShowModal(true)}
            >
                Create Discount
            </button>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Active Discount Codes
                </h3>
            </div>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
                    <Loader2 size={28} className="animate-spin text-[#80DEEA]" />
                    <p className="text-sm">Loading discount codes</p>
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center py-24 gap-2">
                    <p className="text-red-400 font-semibold">Failed to load discount codes</p>
                    <p className="text-slate-500 text-sm">Please try again later</p>
                </div>
            ) : discountCodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center ring-1 ring-slate-700">
                        <TicketPercent size={28} className="text-slate-600" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-slate-300">No discount codes yet</p>
                        <p className="text-sm text-slate-500 mt-1">Create your first discount code to get started</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-1 text-sm text-[#80DEEA] hover:underline font-medium"
                    >
                        Create Discount Code
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex flex-col divide-y divide-slate-800/50 md:hidden">
                        {discountCodes.map((discount: any) => (
                            <div key={discount?.id} className="flex items-start gap-3 p-4 hover:bg-slate-800/25 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-white font-semibold text-sm truncate block">
                                            {discount?.public_name}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteCode(discount)}
                                            disabled={deleteDiscountCodeMutation.isPending}
                                            className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                            title="Delete discount code"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span className="inline-block px-2 py-1 text-sm bg-[#80DEEA]/10 text-[#80DEEA] rounded-md ring-1 ring-slate-700/60">
                                            {discount?.discountCode}
                                        </span>
                                        <span className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded font-medium ring-1 ring-slate-700/60 capitalize">
                                            {discount?.discountType === 'percentage' ? 'Percentage' : 'Fixed'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm font-semibold text-white tabular-nums">
                                            {discount?.discountType === 'percentage' ? `${discount.discountValue}%` : `$${discount.discountValue}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden md:block w-full overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800/80">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {discountCodes.map((discount: any) => (
                                    <tr key={discount?.id} className="hover:bg-slate-800/25 transition group">
                                        <td className="px-5 py-3.5 text-sm text-white font-semibold">{discount?.public_name}</td>
                                        <td className="px-5 py-3.5 text-sm">
                                            <span className="inline-block px-2 py-1 text-sm bg-[#80DEEA]/10 text-[#80DEEA] rounded-md ring-1 ring-slate-700/60">
                                                {discount?.discountCode}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm capitalize text-slate-300">
                                            {discount?.discountType === 'percentage' ? 'Percentage (%)' : 'Fixed ($)'}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-semibold text-white tabular-nums">
                                            {discount?.discountType === 'percentage' ? `${discount.discountValue}%` : `$${discount.discountValue}`}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm">
                                            <button
                                                onClick={() => handleDeleteCode(discount)}
                                                disabled={deleteDiscountCodeMutation.isPending}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                                                title="Delete discount code"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="px-5 py-3.5 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-600">
                            {discountCodes.length} total code{discountCodes.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </>
            )}
        </div>
        {showModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-[450px] p-6 bg-slate-900 border border-slate-800 rounded-md">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white font-Poppins">New Discount Code</h3>
                        <button
                            className="text-white hover:text-slate-300 transition-colors"
                            onClick={() => setShowModal(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                        <Input 
                            size="sm"
                            label="Name"
                            labelTheme="dim"
                            placeholder="Name"
                            icon={<Tag />}
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
                                <Input
                                    type="select"
                                    size="sm"
                                    label="Discount Type"
                                    labelTheme="dim"
                                    icon={<Percent />}
                                    value={watch('discountType')}
                                    {...register('discountType')}
                                >
                                    <option value="percentage" className="bg-slate-900">Percentage (%)</option>
                                    <option value="fixed" className="bg-slate-900">Fixed Amount ($)</option>
                                </Input>
                                </div>
                            )}
                        />
                        <Input 
                            type="number"
                            size="sm"
                            label="Value"
                            labelTheme="dim"
                            placeholder="Value"
                            icon={<Coins />}
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
                             labelTheme="dim"
                             placeholder="Code"
                             icon={<TicketPercent />}
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
)}

export default Page
