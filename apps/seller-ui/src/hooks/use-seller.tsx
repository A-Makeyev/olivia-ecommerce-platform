import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../utils/axiosInstance'


const getSeller = async () => {
    const response = await axiosInstance.get('/api/authenticate-seller')
    return response.data.seller
}

const useSeller = () => {
    const { 
        data: seller, 
        isLoading, 
        isError, 
        refetch
    } = useQuery({
        queryKey: ['seller'],
        queryFn: getSeller,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })

    return {
        seller,
        isLoading,
        isError,
        refetch
    }
}

export default useSeller