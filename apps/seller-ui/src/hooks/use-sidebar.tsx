'use client'

import { useAtom } from 'jotai'
import { activeSidebarItem } from '../config/constants'


const useSidebar = () => {
    const [active, setActive] = useAtom(activeSidebarItem)
    return { active, setActive }
}

export default useSidebar
