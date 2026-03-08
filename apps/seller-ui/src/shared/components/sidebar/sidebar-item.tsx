import Link from 'next/link'


interface Props {
    icon: React.ReactNode
    title: string
    isActive?: boolean
    href: string
}

const SidebarItem = ({icon, title, isActive, href}: Props) => {
    return (
        <Link href={href} className="block my-2">
            <div className={`flex items-center gap-2 w-full h-full min-h-12 px-[13px] rounded-lg cursor-pointer hover:bg-[#2B2F31] transition 
                ${isActive && "scale-[0.98] bg-[#0F3158] fill-blue-200 hover:!bg-[#0F3158D6]"}`}
            >
                {icon}
                <h1 className="ml-3 text-lg text-slate-200">
                    {title}
                </h1>
            </div>
        </Link>
    )
}

export default SidebarItem