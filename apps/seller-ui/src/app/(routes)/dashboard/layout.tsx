import SidebarWrapper from 'apps/seller-ui/src/shared/components/sidebar/sidebar'


const Layout = ({ children } : { children: React.ReactNode }) => {
    return (
        <div className="flex h-full bg-black min-h-screen">
            <aside className="w-[280px] min-w-[250px] max-w-[300px] p-4 border-r border-r-slate-800 text-white">
                <div className="sticky top-0">
                    <SidebarWrapper />
                </div>
            </aside>
            <main className="flex-1">
                <div className="overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

export default Layout