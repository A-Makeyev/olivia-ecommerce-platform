import { AxiosError } from "axios"
import { AlertTriangle, Loader2, RotateCcw, Trash2, X } from "lucide-react"


const formatExpiry = (date: string | Date) =>
    new Date(date).toLocaleString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
    })

const hoursUntilExpiry = (deletedAt: string) =>
    (new Date(deletedAt).getTime() - Date.now()) / (1000 * 60 * 60)

const DeleteProductModal = ({ product, onClose, onConfirm, onRestore, isPending, isError, error }: {
    product: any
    onClose: () => void
    onConfirm: () => void
    onRestore: () => void
    isPending: boolean
    isError: boolean
    error: unknown
}) => {
    const isDeleted = product?.isDeleted
    const estimatedExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const hours = isDeleted && product?.deletedAt ? hoursUntilExpiry(product.deletedAt) : null
    const isUrgent = hours !== null && hours > 0 && hours < 12

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-slate-900 border rounded-2xl w-full max-w-sm p-6 transition-colors ${
                isUrgent ? 'border-orange-500/30' : 'border-slate-800'
            }`}>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <span className={`p-1.5 rounded-lg ${isDeleted ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                            {isDeleted
                                ? <RotateCcw size={15} className="text-emerald-400" />
                                : <Trash2 size={15} className="text-red-400" />
                            }
                        </span>
                        <h3 className="text-base font-semibold text-white font-Poppins">
                            {isDeleted ? 'Restore Product' : 'Delete Product'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-3">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        <span className="text-white font-semibold">
                            &quot;{product?.title}&quot;
                        </span>{' '}
                        {isDeleted
                            ? 'is scheduled for permanent deletion.'
                            : 'will be queued for deletion in 24 hours.'
                        }
                    </p>

                    {isDeleted && product?.deletedAt ? (
                        isUrgent ? (
                            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-orange-500/8 border border-orange-500/20">
                                <AlertTriangle size={13} className="shrink-0 mt-0.5 text-orange-400" />
                                <span className="text-xs text-orange-300 leading-relaxed">
                                    Expires{' '}
                                    <span className="font-semibold tabular-nums">
                                        {formatExpiry(product.deletedAt)}
                                    </span>{' '}
                                    — restore it now before it's permanently removed.
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                                <span className="text-xs text-slate-400">
                                    Restore by{' '}
                                    <span className="font-semibold text-slate-300 tabular-nums">
                                        {formatExpiry(product.deletedAt)}
                                    </span>
                                </span>
                            </div>
                        )
                    ) : !isDeleted ? (
                        <div className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                            <span className="text-xs text-slate-400">
                                You can restore it until{' '}
                                <span className="font-semibold text-slate-300 tabular-nums">
                                    {formatExpiry(estimatedExpiry)}
                                </span>
                            </span>
                        </div>
                    ) : null}
                </div>

                <div className="flex gap-3 pt-5 text-sm font-semibold">
                    <button
                        className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700/70 text-slate-300 transition rounded-xl disabled:opacity-50"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </button>
                    <button
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 transition rounded-xl disabled:opacity-60 ${
                            isDeleted
                                ? 'bg-emerald-600/60 hover:bg-emerald-600/80 text-emerald-100'
                                : 'bg-red-600/60 hover:bg-red-600/80 text-red-100'
                        }`}
                        onClick={isDeleted ? onRestore : onConfirm}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="animate-spin" size={15} />
                        ) : isDeleted ? (
                            <>Restore</>
                        ) : (
                            <>Delete</>
                        )}
                    </button>
                </div>

                {isError && (
                    <p className="text-red-400 text-xs mt-3 text-center">
                        {(error as AxiosError<{ message: string }>)?.response?.data?.message || 'Something went wrong'}
                    </p>
                )}
            </div>
        </div>
    )
}

export default DeleteProductModal