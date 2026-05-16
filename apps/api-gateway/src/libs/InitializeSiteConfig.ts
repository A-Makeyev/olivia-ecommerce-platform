import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

const initializeSiteConfig = async () => {
    try {
        const existingConfig = await prisma.site_config.findFirst()
        
        if (!existingConfig) {
            await prisma.site_config.create({
                data: {
                    categories: [
                        'Electronics',
                        'Accessories',
                        'Fashion'
                    ],
                    subCategories: {
                        'Electronics': ['Computers', 'Phones', 'Tablets'],
                        'Accessories': ['Glasses', 'Watches', 'Jewelry'],
                        'Fashion': ['Sportswear', 'Formal', 'Casual']
                    }
                }
            })
        }
    } catch (err) {
        console.error('Failed to initialize site config:', err)
    }
}

export default initializeSiteConfig