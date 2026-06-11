import prisma from '@packages/libs/prisma'
import cron from 'node-cron'


// '*/5 * * * * *' for every 5 seconds
cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date()

        const products = await prisma.products.findMany({
        where: {
            isDeleted: true,
            deletedAt: { lte: now }
        },
        select: { id: true }
        })

        const ids = products.map(p => p.id)

        if (ids.length === 0) return

        await prisma.images.deleteMany({
        where: {
            productsId: { in: ids }
        }
        })

        const deletedProducts = await prisma.products.deleteMany({
        where: {
            id: { in: ids }
        }
        })

        if (deletedProducts.count >= 1) {
            console.log(`${deletedProducts.count} expired ${deletedProducts.count > 1 ? 'products were' : 'product was'} permanently deleted`)
        }

    } catch (err) {
        console.log(err)
    }
})