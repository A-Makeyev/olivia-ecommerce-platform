'use client'

import { useEffect, useState, useRef } from 'react'
import { navItems } from '../config/constants'
import { AlignLeft, ChevronDown, Search } from 'lucide-react'
import Link from 'next/link'
import ProfileIcon from '../assets/svgs/profile-icon'
import CartIcon from '../assets/svgs/cart-icon'
import HeartIcon from '../assets/svgs/heart-icon'
import useUser from 'apps/user-ui/src/hooks/use-user'


const HeaderBottom = () => {
    const [show, setShow] = useState(false)
    const [sticky, setSticky] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const { user, isLoading, isError, refetch } = useUser()

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setSticky(true)
            } else {
                setSticky(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false)
            }
        }

        if (searchOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [searchOpen])

    return (
        <div className={`${sticky ? "fixed top-0 left-0 py-4 z-[100] bg-white shadow-lg" : "relative"} w-full transition-all duration-300`}>
            <div className={`${sticky ? "pt-3" : "py-0"} w-[95%] md:w-[90%] relative m-auto flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div
                            className={`${show && sticky ? "rounded-t-lg" : show ? "" : sticky ? "rounded-lg" : "rounded-b-lg"} w-[250px] flex items-center justify-between px-5 h-[50px] bg-[#3489FF] transition-all duration-300 cursor-pointer`}
                            onClick={() => setShow(!show)}
                        >
                            <div className="flex items-center gap-2">
                                <AlignLeft color="white" />
                                <span className="text-white font-medium">All Categories</span>
                            </div>
                            {show ?
                                <ChevronDown color="white" className="rotate-180 transition duration-300" />
                                :
                                <ChevronDown color="white" className="transition duration-300" />
                            }
                        </div>
                        
                        <div className={`${sticky ? "top-[48px]" : "top-[50px]"} ${show ? "opacity-100 visible" : "opacity-0 invisible"} absolute left-0 z-50 w-[250px] h-[400px] bg-[#F5F5F5] shadow-xl transition-all duration-300`}>
                            {/* Category content would go here */}
                        </div>
                    </div>

                    <div className="w-auto flex justify-start">
                        {sticky && (
                            <div ref={searchRef} className={`${searchOpen ? "w-[300px]" : "w-[50px]"} transition-all duration-300`}>
                                <div className="flex items-center h-[50px] border-[2px] border-[#3489FF] rounded-lg bg-white overflow-hidden">
                                     <button
                                        onClick={() => setSearchOpen(!searchOpen)}
                                        className="w-[45px] h-full flex items-center justify-center active:scale-95 transition-all flex-shrink-0"
                                    >
                                        <Search color="#3489FF" className="hover:scale-105 transition-transform" />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Search products"
                                        autoFocus={searchOpen}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                console.log('Search:', e.currentTarget.value)
                                                setSearchOpen(false)
                                            }
                                        }}
                                        className={`flex-1 px-3 font-medium outline-none ${searchOpen ? "opacity-100" : "opacity-0 hidden"}`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className={`absolute left-1/2 flex items-center transition-all duration-300 ${sticky ? "-translate-x-1/4" : "-translate-x-1/2"}`}>
                    {navItems.map((item: NavItemTypes, index: number) => (
                        <Link href={item.href} key={index} className="px-5 font-medium text-lg hover:text-blue-600 transition">
                            {item.title}
                        </Link>
                    ))}
                </div>
                <div>
                    {sticky && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 cursor-pointer">
                                {!isLoading && user ? (
                                    <>
                                        <Link href={"/profile"} className="font-medium hover:text-slate-700 transition">
                                            {user?.name?.split(' ')[0]}
                                        </Link>
                                        <Link href={"/profile"} className="flex items-center justify-center w-[40px] h-[40px] border-2 border-[#010F1C1A] rounded-full hover:scale-105 transition-transform">
                                            <ProfileIcon />
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link href={"/login"} className="font-medium hover:text-slate-700 transition">
                                            Login
                                        </Link>
                                        <Link href={"/login"} className="flex items-center justify-center w-[40px] h-[40px] border-2 border-[#010F1C1A] rounded-full hover:scale-105 transition-transform">
                                            <ProfileIcon />
                                        </Link>
                                    </>
                                )}
                            
                            </div>
                            <div className="flex items-center gap-6">
                                <Link href={"/whishlist"} className="relative hover:text-slate-600 transition">
                                    <HeartIcon />
                                    <div className="flex items-center justify-center absolute top-[-10px] right-[-15px] w-6 h-6 border-2 border-white bg-red-500 rounded-full">
                                        <span className="text-white font-medium text-xs">69</span>
                                    </div>
                                </Link>
                                <Link href={"/cart"} className="relative hover:text-slate-600 transition">
                                    <CartIcon />
                                    <div className="flex items-center justify-center absolute top-[-10px] right-[-15px] w-6 h-6 border-2 border-white bg-red-500 rounded-full">
                                        <span className="text-white font-medium text-xs">69</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HeaderBottom