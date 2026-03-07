'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar-style'
import useSeller from 'apps/seller-ui/src/hooks/use-seller'
import useSidebar from 'apps/seller-ui/src/hooks/use-sidebar'
import LogoLight from '../../../assets/svgs/logo-light'
import SidebarItem from './sidebar-item'
import Link from 'next/link'
import Box from '../box'
import AccountsIcon from 'apps/seller-ui/src/assets/icons/accounts'
import HomeIcon from 'apps/seller-ui/src/assets/icons/home'
import SidebarMenu from './sidebar-menu'
import { List } from 'lucide-react'
import PaymentsIcon from 'apps/seller-ui/src/assets/icons/payments'



const SidebarWrapper = () => {
    const pathName = usePathname()
    const { activeSidebar, setActiveSidebar } = useSidebar()
    const { seller, isLoading } = useSeller()
    
    const getIconColor = (route: string) => activeSidebar === route ? '#0085FF' : '#969696'

    useEffect(() => {
        setActiveSidebar(pathName)
    }, [pathName, setActiveSidebar])

    return (    
        <Box css={{ 
            top: "0",
            height: "100vh", 
            position: "sticky",
            overflowY: "scroll",
            scrollbarWidth: "none",
            padding: "8px",
            zIndex: 202
        }}
            className="sidebar-wrapper"
        >
            <Sidebar.Header>
                <Box>
                   <Link href={"/"} className="flex items-center gap-4 px-1">
                        <LogoLight />
                        <Box>
                             <h3 className="text-xl font-medium text-[#ECEDEE]">
                                 {isLoading ? (
                                     <div className="w-32 h-6 bg-slate-700 animate-pulse rounded-md" />
                                 ) : (
                                     seller?.shop?.name
                                 )}
                             </h3>
                             <h5 className="text-xs font-medium max-w-[170px] text-[#ECEDEECF] whitespace-nowrap overflow-hidden text-ellipsis">
                                {seller?.shop?.address}
                             </h5>
                        </Box>
                   </Link>
                </Box>
            </Sidebar.Header>
            <div className="block h-full my-3">
                <Sidebar.Body>
                    <SidebarItem 
                        title="Dashboard"
                        href="/dashboard"
                        isActive={activeSidebar === '/dashboard'}
                        icon={<AccountsIcon fill={getIconColor('/dashboard')} />}
                    />
                    <div className="block mt-2">
                        <SidebarMenu title="Menu">
                            <SidebarItem 
                                title="Orders"
                                href="/dashboard/orders"
                                isActive={activeSidebar === '/dashboard/orders'}
                                icon={<List fill={getIconColor('/dashboard/orders')} />}
                            />
                            <SidebarItem 
                                title="Payments"
                                href="/dashboard/payments"
                                isActive={activeSidebar === '/dashboard/payments'}
                                icon={<PaymentsIcon fill={getIconColor('/payments')} />}
                            />
                        </SidebarMenu>
                    </div>
                </Sidebar.Body>
            </div>
        </Box>
    )
}

export default SidebarWrapper