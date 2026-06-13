import cron from 'node-cron'
import prisma from '@packages/libs/prisma'

cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date()

        const products = await prisma.products.findMany({
            where: { status: 'Deleted', deletedAt: { lte: now } },
            select: { id: true }
        })

        const ids = products.map(p => p.id)

        if (ids.length === 0) return

        await prisma.images.deleteMany({ where: { productsId: { in: ids } } })

        const result = await prisma.products.deleteMany({ where: { id: { in: ids } } })

        if (result.count >= 1) {
            console.log(`${result.count} expired ${result.count > 1 ? 'products were' : 'product was'} permanently deleted`)
        }
    } catch (err) {
        console.error('[cron:purge]', err)
    }
})