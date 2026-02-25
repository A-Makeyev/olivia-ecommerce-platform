'use client'

import { Loader2, Search } from 'lucide-react'
import Link from 'next/link'
import ProfileIcon from '../../assets/svgs/profile-icon'
import HeartIcon from '../../assets/svgs/heart-icon'
import CartIcon from '../../assets/svgs/cart-icon'
import HeaderBottom from '../sub-header'
import useUser from 'apps/user-ui/src/hooks/useUser'

const Header = () => {
    const { user, isLoading, isError, refetch } = useUser()

    console.log('user', user)
    console.log('isLoading', isLoading)
    console.log('isError', isError)

    return (
        <div className="w-full bg-white">
            <div className="w-[80%] py-5 m-auto flex items-center justify-between">
                <div>
                    <Link href="/">
                        <span className="text-3xl font-600">Ecom</span>
                    </Link>
                </div>

                <div className="w-[50%] relative">
                    <input
                        type="text"
                        placeholder="Search products"
                        className="w-full px-4 font-poppins font-medium border-[2.5px] border-[#3489FF] rounded-xl outline-none h-[50px]"
                    />
                    <div className="w-[60px] flex items-center justify-center h-[50px] bg-[#3489FF] absolute top-0 right-0 rounded-r-xl cursor-pointer">
                        <Search color="white" className="hover:scale-105 transition-transform" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-[80px] h-[20px] flex items-center justify-end">
                            {isLoading || (!user && !isError) ? (
                                <div className="h-4 w-full rounded-md bg-slate-200 animate-pulse" />
                            ) : user ? (
                                <Link
                                    href="/profile"
                                    className="font-medium hover:text-slate-700 truncate transition"
                                >
                                    {user?.name?.split(" ")[0]}
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="font-medium hover:text-slate-700 transition"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                        <Link
                            href={user ? "/profile" : "/login"}
                            className="flex items-center justify-center w-[40px] h-[40px] border-2 border-[#010F1C1A] rounded-full hover:scale-105 transition-transform"
                        >
                            {isLoading || (!user && !isError) ? (
                                <Loader2 className="animate-spin text-[#3489FF]" />
                            ) : (
                                <ProfileIcon />
                            )}
                        </Link>

                        {/* {!isLoading && user ? (
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
                        )} */}

                    </div>
                    <div className="flex items-center gap-5">
                        <Link href="/whishlist" className="relative hover:text-slate-600 transition">
                            <HeartIcon />
                            <div className="flex items-center justify-center absolute top-[-10px] right-[-15px] w-6 h-6 border-2 border-white bg-red-500 rounded-full">
                                <span className="text-white font-medium text-xs">69</span>
                            </div>
                        </Link>
                        <Link href="/cart" className="relative hover:text-slate-600 transition">
                            <CartIcon />
                            <div className="flex items-center justify-center absolute top-[-10px] right-[-15px] w-6 h-6 border-2 border-white bg-red-500 rounded-full">
                                <span className="text-white font-medium text-xs">69</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="border-b border-b-slate-300" />
            <HeaderBottom />
        </div>
    )
}

export default Header