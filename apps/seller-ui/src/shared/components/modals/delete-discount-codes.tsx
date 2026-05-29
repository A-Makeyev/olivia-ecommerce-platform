import { AxiosError } from "axios"
import { Loader2, X } from "lucide-react"

const DeleteDiscountCodeModal = ({ discount, onClose, onConfirm, isPending, isError, error }: {
    discount: any
    onClose: () => void
    onConfirm: () => void
    isPending: boolean
    isError: boolean
    error: unknown
}) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white font-Poppins">Confirm Delete</h3>
                    <button
                        className="text-slate-400 hover:text-white transition-colors"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        <X size={20} />
                    </button>
                </div>
                <p className="text-slate-300 text-sm">
                    Are you sure you want to delete code {' '}
                    <span className="text-white font-semibold">&quot;{discount?.public_name}&quot;?</span>
                    <br />
                    This action cannot be undone
                </p>
                <div className="flex gap-3 pt-5 text-sm font-semibold text-slate-300">
                    <button
                        className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700/70 transition rounded-lg"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </button>
                    <button
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600/60 hover:bg-red-600/80 transition rounded-lg"
                        onClick={onConfirm}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            'Delete'
                        )}
                    </button>
                </div>
                {isError && (
                    <p className="text-red-500 text-sm mt-3 text-center">
                        {(error as AxiosError<{ message: string }>)?.response?.data?.message || 'Something went wrong'}
                    </p>
                )}
            </div>
        </div>
    )
}

export default DeleteDiscountCodeModal