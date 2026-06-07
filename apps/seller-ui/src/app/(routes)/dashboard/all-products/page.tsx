'use client'

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, AlertTriangle, BarChart2, ChevronRight, Eye, Loader2, Package, Pencil, RotateCcw, Search, Trash2 } from "lucide-react"
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from "@tanstack/react-table"
import DeleteProductModal from "apps/seller-ui/src/shared/components/modals/delete-product"
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"


const StarRating = ({ rating, max = 5 }: { rating: number; max?: number }) => {
    const stars = Array.from({ length: max }, (_, i) => ({
        index: i,
        filled: rating >= i + 1,
        half: !(rating >= i + 1) && rating > i && rating < i + 1,
    }))

    return (
        <div className="flex items-center gap-0.5">
            {stars.map(({ index, filled, half }) => (
                <span
                    key={index}
                    className="relative inline-flex items-center justify-center w-[14px] h-[14px]"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="absolute inset-0 w-full h-full text-slate-700">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {(filled || half) && (
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="absolute inset-0 w-full h-full text-yellow-400"
                            style={half ? { clipPath: "inset(0 50% 0 0)" } : undefined}
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    )}
                </span>
            ))}
            <span className="ml-1.5 text-xs font-semibold text-slate-400 tabular-nums">
                {rating > 0 ? rating.toFixed(1) : '—'}
            </span>
        </div>
    )
}

const StockBadge = ({ stock }: { stock: number }) => {
    if (stock === 0) return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 bg-red-500/10 text-red-400 ring-red-500/20 max-w-[120px] truncate">
            Out of stock
        </span>
    )
    if (stock < 10) return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 bg-orange-500/10 text-orange-400 ring-orange-500/20 max-w-[120px] truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shrink-0" />
            {stock} left
        </span>
    )
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 max-w-[120px] truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            {stock}
        </span>
    )
}

const PriceDisplay = ({ regular, sale }: { regular: number; sale?: number }) => {
    if (sale) {
        const pct = Math.round((1 - sale / regular) * 100)
        return (
            <div className="flex flex-col gap-0.5 leading-tight">
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white tabular-nums">${sale}</span>
                    <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-semibold">
                        -{pct}%
                    </span>
                </div>
                <span className="text-sm text-slate-500 line-through tabular-nums">${regular}</span>
            </div>
        )
    }
    return <span className="font-semibold text-white tabular-nums">${regular}</span>
}

const formatExpiry = (date: string) =>
    new Date(date).toLocaleString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
    })

const hoursUntilExpiry = (deletedAt: string) =>
    (new Date(deletedAt).getTime() - Date.now()) / (1000 * 60 * 60)

const isExpiringSoon = (deletedAt: string, threshold = 12) => {
    const h = hoursUntilExpiry(deletedAt)
    return h > 0 && h < threshold
}

const getProducts = async () => {
    const res = await axiosInstance.get('/product/api/get-shop-products')
    return res?.data?.products
}

type Tab = 'active' | 'deleted'

const ProductList = () => {
    const queryClient = useQueryClient()
    const [globalFilter, setGlobalFilter] = useState('')
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<Tab>('active')

    const { data: products = [], isLoading, isError } = useQuery({
        queryKey: ['shop-products'],
        queryFn: getProducts,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })

    const deleteProductMutation = useMutation({
        mutationFn: async (id: string) => {
            await axiosInstance.delete(`/product/api/delete-product/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop-products'] })
            setConfirmDeleteModal(false)
            toast.success('Product deleted successfully')
        },
        onError: () => {
            toast.error('Failed to delete product')
        }
    })

    const restoreProductMutation = useMutation({
        mutationFn: async (id: string) => {
            await axiosInstance.put(`/product/api/restore-product/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop-products'] })
            setConfirmDeleteModal(false)
            toast.success('Product restored successfully')
        },
        onError: () => {
            toast.error('Failed to restore product')
        }
    })

    const openConfirmDeleteModal = (product: any) => {
        setSelectedProduct(product)
        setConfirmDeleteModal(true)
    }

    const activeProducts = useMemo(() => products.filter((p: any) => !p.isDeleted), [products])
    const deletedProducts = useMemo(() =>
        products
            .filter((p: any) => p.isDeleted)
            .sort((a: any, b: any) => new Date(a.deletedAt).getTime() - new Date(b.deletedAt).getTime()),
        [products]
    )
    const displayProducts = activeTab === 'active' ? activeProducts : deletedProducts

    const urgentProducts = useMemo(
        () => deletedProducts.filter((p: any) => p.deletedAt && isExpiringSoon(p.deletedAt)),
        [deletedProducts]
    )
    const soonestExpiry = useMemo(() => {
        if (urgentProducts.length === 0) return null
        return urgentProducts.reduce((min: any, p: any) =>
            new Date(p.deletedAt) < new Date(min.deletedAt) ? p : min
        )
    }, [urgentProducts])

    const columns = useMemo(() => {
        const base: any[] = [
        {
            accessorKey: 'title',
            header: 'Product',
            cell: ({ row }: any) => (
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden ring-1 ring-slate-700/80 shrink-0">
                        <Image
                            fill
                            src={row.original.images[0]?.url}
                            alt={row.original.title}
                            className="object-cover"
                        />
                    </div>
                    <Link
                        href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                        title={row.original.title}
                        className="font-semibold text-white hover:text-[#80DEEA] line-clamp-1 transition min-w-[150px] max-w-[300px]"
                    >
                        {row.original.title}
                    </Link>
                </div>
            ),
        },
        {
            accessorKey: 'price',
            header: 'Price',
            cell: ({ row }: any) => (
                <PriceDisplay regular={row.original.regular_price} sale={row.original.sale_price} />
            ),
        },
        {
            accessorKey: 'stock',
            header: 'Stock',
            cell: ({ row }: any) => <StockBadge stock={row.original.stock} />,
        },
        {
            accessorKey: 'category',
            header: 'Category',
            cell: ({ row }: any) => (
                <span className="inline-block px-2 py-1 text-sm bg-[#80DEEA]/10 text-[#80DEEA] rounded-md ring-1 ring-slate-700/60">
                    {row.original.category}
                </span>
            ),
        },
        {
            accessorKey: 'rating',
            header: 'Rating',
            cell: ({ row }: any) => <StarRating rating={row.original.rating || 0} />,
        },
        ]

        if (activeTab === 'deleted') {
            base.push({
                id: 'expires',
                header: 'Restore by',
                cell: ({ row }: any) => {
                    if (!row.original.deletedAt) return <span className="text-slate-600 text-xs">—</span>
                    const hours = hoursUntilExpiry(row.original.deletedAt)
                    const urgent = hours > 0 && hours < 12
                    const expired = hours <= 0
                    return (
                        <div className={`flex items-center gap-1.5 text-xs font-semibold tabular-nums ${
                            expired ? 'text-slate-600' : urgent ? 'text-red-400' : 'text-slate-400'
                        }`}>
                            {expired ? 'Expired' : formatExpiry(row.original.deletedAt)}
                        </div>
                    )
                },
            })
        }

        base.push({
            header: 'Actions',
            cell: ({ row }: any) => (
                <div className="flex items-center gap-0.5">
                    <Link
                        href={`/product/${row.original.id}`}
                        title="View"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-150"
                    >
                        <Eye size={15} />
                    </Link>
                    <Link
                        href={`/product/edit/${row.original.id}`}
                        title="Edit"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-150"
                    >
                        <Pencil size={15} />
                    </Link>
                    <button
                        title="Analytics"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-150"
                    >
                        <BarChart2 size={15} />
                    </button>
                    {row.original.isDeleted ? (
                        <button
                            title="Restore"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-150"
                            onClick={() => openConfirmDeleteModal(row.original)}
                        >
                            <RotateCcw size={15} />
                        </button>
                    ) : (
                        <button
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                            onClick={() => openConfirmDeleteModal(row.original)}
                        >
                            <Trash2 size={15} />
                        </button>
                    )}
                </div>
            ),
        })

        return base
    }, [activeTab])

    const table = useReactTable({
        data: displayProducts,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: 'includesString',
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    })

    const visibleRows = table.getRowModel().rows

    return (
        <div className="w-full min-h-screen p-4 sm:p-8 font-semibold">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
                <div>
                    <h2 className="text-2xl text-white font-Poppins">
                        All Products
                    </h2>
                    <div className="flex items-center text-sm text-slate-400 mt-1">
                        <Link href={"/dashboard"} className="text-[#80DEEA] hover:underline cursor-pointer">
                            Dashboard
                        </Link>
                        <ChevronRight size={14} className="mx-1 opacity-[0.8]" />
                        <span>All Products</span>
                    </div>
                </div>
                <Link
                    href="/dashboard/create-product"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-950 bg-[#80DEEA] hover:bg-[#4dd0e1] rounded-lg transition"
                >
                    Create Product
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 bg-slate-900/60 border border-slate-800/80 rounded-xl p-1 w-fit">
                <button
                    onClick={() => { setActiveTab('active'); setGlobalFilter('') }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                        activeTab === 'active'
                            ? 'bg-[#80DEEA]/10 text-[#80DEEA] ring-1 ring-[#80DEEA]/20'
                            : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <Package size={14} />
                    Active
                    {!isLoading && !isError && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
                            activeTab === 'active'
                                ? 'bg-[#80DEEA]/15 text-[#80DEEA]'
                                : 'bg-slate-800 text-slate-500'
                        }`}>
                            {activeProducts.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => { setActiveTab('deleted'); setGlobalFilter('') }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                        activeTab === 'deleted'
                            ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                            : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <Trash2 size={14} />
                    Trash
                    {!isLoading && !isError && deletedProducts.length > 0 && (
                        urgentProducts.length > 0 ? (
                            <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
                                activeTab === 'deleted'
                                    ? 'bg-orange-500/15 text-orange-400'
                                    : 'bg-orange-500/10 text-orange-400'
                            }`}>
                                <AlertTriangle size={10} className="animate-pulse" />
                                {deletedProducts.length}
                            </span>
                        ) : (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
                                activeTab === 'deleted'
                                    ? 'bg-red-500/15 text-red-400'
                                    : 'bg-slate-800 text-slate-500'
                            }`}>
                                {deletedProducts.length}
                            </span>
                        )
                    )}
                </button>
            </div>

            <div className="mb-5 flex items-center gap-3 bg-slate-900/70 border border-slate-800 rounded-xl px-4 py-3 focus-within:border-[#80DEEA]/40 focus-within:ring-1 focus-within:ring-[#80DEEA]/10 transition-all duration-200">
                <Search size={14} className="text-slate-500 shrink-0" />
                <input
                    type="text"
                    placeholder="Search by title, category…"
                    className="bg-transparent text-white text-sm outline-none w-full placeholder:text-slate-600"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                />
                {globalFilter && (
                    <button
                        onClick={() => setGlobalFilter('')}
                        className="text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors shrink-0"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Stats — active tab only */}
            {activeTab === 'active' && !isLoading && !isError && activeProducts.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'Total Products', value: activeProducts.length },
                        { label: 'On Sale',        value: activeProducts.filter((p: any) => p.sale_price).length, accent: true },
                        { label: 'Low Stock',      value: activeProducts.filter((p: any) => p.stock > 0 && p.stock < 10).length, warn: true },
                        { label: 'Out of Stock',   value: activeProducts.filter((p: any) => p.stock === 0).length, danger: true }
                    ].map(({ label, value, warn, danger, accent }) => (
                        <div key={label} className="flex flex-col items-center bg-slate-900/60 border border-slate-800/80 rounded-xl px-3 py-3">
                            <p className="text-sm text-slate-500">{label}</p>
                            <p className={`text-xl font-semibold mt-1 tabular-nums ${
                                danger ? 'text-red-400' : warn ? 'text-orange-400' : accent ? 'text-[#80DEEA]' : 'text-white'
                            }`}>
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'deleted' && !isLoading && !isError && deletedProducts.length > 0 && (
                urgentProducts.length > 0 ? (
                    <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                        <AlertCircle size={18} className="shrink-0 text-red-400" />
                        <span>
                            <span className="font-semibold text-red-400">
                                {urgentProducts.length} product{urgentProducts.length !== 1 ? 's' : ''} expiring soon
                            </span>
                            {soonestExpiry && (
                                <> — earliest on <span className="font-semibold tabular-nums">{formatExpiry(soonestExpiry.deletedAt)}</span></>
                            )}.{' '}
                            Restore {urgentProducts.length === 1 ? 'it' : 'them'} before permanent removal
                        </span>
                    </div>
                ) : (
                    <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-300/60 text-orange-300 text-sm">
                        <AlertCircle size={18} className="shrink-0 text-orange-300" />
                        <span>
                            {deletedProducts.length} product{deletedProducts.length !== 1 ? 's' : ''} scheduled for deletion,
                            restore {deletedProducts.length === 1 ? 'it' : 'them'} under actions tab
                        </span>
                    </div>
                )
            )}

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        {activeTab === 'active' ? 'Active Inventory' : 'Archived Products'}
                    </h3>
                    {!isLoading && !isError && globalFilter && (
                        <span className="text-xs text-slate-500">
                            {visibleRows.length} of {displayProducts.length} results
                        </span>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
                        <Loader2 size={28} className="animate-spin text-[#80DEEA]" />
                        <p className="text-sm">Loading products</p>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-2">
                        <p className="text-red-400 font-semibold">Failed to load products</p>
                        <p className="text-slate-500 text-sm">Please try again later</p>
                    </div>
                ) : displayProducts.length === 0 ? (
                    activeTab === 'deleted' ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center ring-1 ring-slate-700">
                                <Trash2 size={28} className="text-slate-600" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-slate-300">Trash is empty</p>
                                <p className="text-sm text-slate-500 mt-1">Deleted products will appear here</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center ring-1 ring-slate-700">
                                <Package size={28} className="text-slate-600" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-slate-300">No products yet</p>
                                <p className="text-sm text-slate-500 mt-1">Create your first product to get started</p>
                            </div>
                            <Link
                                href="/dashboard/create-product"
                                className="mt-1 text-sm text-[#80DEEA] hover:underline font-medium"
                            >
                                Create Product
                            </Link>
                        </div>
                    )
                ) : visibleRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                        <p className="text-sm font-semibold text-slate-400">No results for "{globalFilter}"</p>
                        <button onClick={() => setGlobalFilter('')} className="text-xs text-[#80DEEA] hover:underline">
                            Clear search
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Mobile cards */}
                        <div className="flex flex-col divide-y divide-slate-800/50 md:hidden">
                            {visibleRows.map((row) => {
                                const p = row.original as any
                                return (
                                    <div
                                        key={row.id}
                                        className="flex items-start gap-3 p-4 hover:bg-slate-800/25 transition-colors"
                                    >
                                        <div className="relative w-14 h-14 rounded-xl overflow-hidden ring-1 ring-slate-700/80 shrink-0">
                                            <Image src={p.images[0]?.url} alt={p.title} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <Link
                                                    href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${p.slug}`}
                                                    className="text-white font-semibold text-sm truncate block hover:text-[#80DEEA] transition-colors"
                                                >
                                                    {p.title}
                                                </Link>
                                                {p.isDeleted ? (
                                                    <button
                                                        title="Restore"
                                                        onClick={() => openConfirmDeleteModal(p)}
                                                        className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                                                    >
                                                        <RotateCcw size={14} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        title="Delete"
                                                        onClick={() => openConfirmDeleteModal(p)}
                                                        className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <span className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded font-medium ring-1 ring-slate-700/60">
                                                    {p.category}
                                                </span>
                                                <StockBadge stock={p.stock} />
                                            </div>
                                            {p.isDeleted && p.deletedAt && (() => {
                                                const hours = hoursUntilExpiry(p.deletedAt)
                                                const urgent = hours > 0 && hours < 12
                                                return (
                                                    <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-medium tabular-nums ${urgent ? 'text-orange-400' : 'text-slate-500'}`}>
                                                        {urgent && <AlertTriangle size={10} className="shrink-0" />}
                                                        <span>Restore by {formatExpiry(p.deletedAt)}</span>
                                                    </div>
                                                )
                                            })()}
                                            <div className="flex items-center justify-between mt-2">
                                                <PriceDisplay regular={p.regular_price} sale={p.sale_price} />
                                                <StarRating rating={p.rating || 0} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden md:block w-full overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id} className="border-b border-slate-800/80">
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                                >
                                                    {header.isPlaceholder ? null : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    {visibleRows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-slate-800/25 transition group"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-5 py-3.5 text-sm">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-5 py-3.5 border-t border-slate-800/60 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-600">
                                {visibleRows.length} of {displayProducts.length} product{visibleRows.length !== 1 ? "s" : ""}
                            </span>
                            {globalFilter && visibleRows.length !== displayProducts.length && (
                                <span className="text-xs text-slate-500">
                                    Showing {visibleRows.length} match{visibleRows.length !== 1 ? "es" : ""}
                                </span>
                            )}
                        </div>
                    </>
                )}

                {confirmDeleteModal && (
                    <DeleteProductModal
                        product={selectedProduct}
                        onClose={() => setConfirmDeleteModal(false)}
                        onConfirm={() => deleteProductMutation.mutate(selectedProduct?.id)}
                        onRestore={() => restoreProductMutation.mutate(selectedProduct?.id)}
                        isPending={deleteProductMutation.isPending || restoreProductMutation.isPending}
                        isError={deleteProductMutation.isError || restoreProductMutation.isError}
                        error={deleteProductMutation.error || restoreProductMutation.error}
                    />
                )}
            </div>
        </div>
    )
}

export default ProductList