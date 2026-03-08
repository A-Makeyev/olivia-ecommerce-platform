'use client'

import { useEffect } from 'react'
import { Bell, CalendarCheck, CalendarPlus, List, LogOut, Mail, PackageSearch, Settings, SquarePlus, TicketPercent } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar-style'
import useSeller from 'apps/seller-ui/src/hooks/use-seller'
import useSidebar from 'apps/seller-ui/src/hooks/use-sidebar'
import LogoLight from '../../../assets/svgs/logo-light'
import AccountsIcon from 'apps/seller-ui/src/assets/icons/accounts'
import PaymentsIcon from 'apps/seller-ui/src/assets/icons/payments'
import SidebarItem from './sidebar-item'
import SidebarMenu from './sidebar-menu'
import Link from 'next/link'
import Box from '../box'


const SidebarWrapper = () => {
    const pathName = usePathname()
    const { activeSidebar, setActiveSidebar } = useSidebar()
    const { seller, isLoading } = useSeller()
    const getIconColor = (route: string) => activeSidebar === route ? '#FFFFFF' : '#969696'

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
                        icon={<AccountsIcon color={getIconColor('/dashboard')} />}
                    />
                    <div className="block mt-2">
                        <SidebarMenu title="Menu">
                            <SidebarItem 
                                title="Orders"
                                href="/dashboard/orders"
                                isActive={activeSidebar === '/dashboard/orders'}
                                icon={<List color={getIconColor('/dashboard/orders')} />}
                            />
                            <SidebarItem 
                                title="Payments"
                                href="/dashboard/payments"
                                isActive={activeSidebar === '/dashboard/payments'}
                                icon={<PaymentsIcon color={getIconColor('/dashboard/payments')} />}
                            />
                        </SidebarMenu>
                        <SidebarMenu title="Products">
                            <SidebarItem 
                                title="All Products"
                                href="/dashboard/all-products"
                                isActive={activeSidebar === '/dashboard/all-products'}
                                icon={<PackageSearch color={getIconColor('/dashboard/all-products')} />}
                            />
                            <SidebarItem 
                                title="Create Product"
                                href="/dashboard/create-product"
                                isActive={activeSidebar === '/dashboard/create-product'}
                                icon={<SquarePlus color={getIconColor('/dashboard/create-product')} />}
                            />
                        </SidebarMenu>
                        <SidebarMenu title="Events">
                            <SidebarItem 
                                title="All Events"
                                href="/dashboard/all-events"
                                isActive={activeSidebar === '/dashboard/all-events'}
                                icon={<CalendarCheck color={getIconColor('/dashboard/all-events')} />}
                            />
                            <SidebarItem 
                                title="Create Event"
                                href="/dashboard/create-event"
                                isActive={activeSidebar === '/dashboard/create-event'}
                                icon={<CalendarPlus color={getIconColor('/dashboard/create-event')} />}
                            />
                            <SidebarItem 
                                title="Discount Codes"
                                href="/dashboard/discount-codes"
                                isActive={activeSidebar === '/dashboard/discount-codes'}
                                icon={<TicketPercent color={getIconColor('/dashboard/discount-codes')} />}
                            />
                        </SidebarMenu>
                        <SidebarMenu title="Contact">
                            <SidebarItem 
                                title="Inbox"
                                href="/dashboard/inbox"
                                isActive={activeSidebar === '/dashboard/inbox'}
                                icon={<Mail color={getIconColor('/dashboard/inbox')} />}
                            />
                            <SidebarItem 
                                title="Notifications"
                                href="/dashboard/notifications"
                                isActive={activeSidebar === '/dashboard/notifications'}
                                icon={<Bell color={getIconColor('/dashboard/notifications')} />}
                            />
                        </SidebarMenu>
                        <SidebarMenu title="General">
                            <SidebarItem 
                                title="Settings"
                                href="/dashboard/settings"
                                isActive={activeSidebar === '/dashboard/settings'}
                                icon={<Settings color={getIconColor('/dashboard/settings')} />}
                            />
                            <SidebarItem 
                                title="Logout"
                                href="/dashboard/logout"
                                isActive={activeSidebar === '/dashboard/logout'}
                                icon={<LogOut color={getIconColor('/dashboard/logout')} />}
                            />
                        </SidebarMenu>
                    </div>
                </Sidebar.Body>
            </div>
        </Box>
    )
}

export default SidebarWrapper