'use client'

import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


const Provider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            <Toaster position="top-center" />
            { children }
        </QueryClientProvider>
    )
}

export default Provider