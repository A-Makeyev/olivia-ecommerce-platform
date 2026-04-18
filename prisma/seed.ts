import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const confirmAction = async (message: string): Promise<boolean> => {
  if (process.argv.includes('-y') || process.argv.includes('--yes')) {
    return true
  }

  return new Promise((resolve) => {
    rl.question(`${message} (y/n):`, (answer) => {
      resolve(answer.toLowerCase().trim() === 'y')
    })
  })
}

async function cleanDatabase() {
  console.log('\n Cleaning database..')
  try {
    await prisma.shopReviews.deleteMany()
    await prisma.shops.deleteMany()
    await prisma.images.deleteMany()
    await prisma.users.deleteMany()
    await prisma.sellers.deleteMany()
    console.log('✅ Database cleaned')
  } catch (error) {
    console.error('❌ Failed to clean database:', error)
    throw error
  }
}

async function importData() {
  try {
    const userCount = await prisma.users.count()
    const sellerCount = await prisma.sellers.count()
    const shopCount = await prisma.shops.count()

    if (userCount > 0 || sellerCount > 0 || shopCount > 0) {
      console.log(`\n⚠️  Database currently contains: ${userCount} users, ${sellerCount} sellers, ${shopCount} shops`)
      const confirmed = await confirmAction(
        '❗❗ Are you sure you want to import new data? This will overwrite existing data'
      )
      if (!confirmed) {
        console.log('❌ Action cancelled')
        return
      }
    }

    await cleanDatabase()

    const dataPath = path.join(__dirname, 'data.json')
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Data file not found at ${dataPath}`)
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

    console.log(' Seeding users..')
    if (data.users && data.users.length > 0) {
      await prisma.users.createMany({
        data: data.users,
      })
      console.log(`   Added ${data.users.length} users`)
    }

    console.log(' Seeding sellers and shops..')
    if (data.sellers && data.sellers.length > 0) {
      let shopCount = 0
      for (const sellerData of data.sellers) {
        const seller = await prisma.sellers.create({
          data: sellerData,
        })

        const shopData = data.shops.find((s: any) => s.sellerEmail === seller.email)
        if (shopData) {
          const { sellerEmail, ...shopFields } = shopData
          await prisma.shops.create({
            data: {
              ...shopFields,
              sellerId: seller.id,
            },
          })
          shopCount++
        }
      }
      console.log(`   Added ${data.sellers.length} sellers and ${shopCount} shops`)
    }

    console.log('\n ✅ DATA IMPORTED\n')
  } catch (err) {
    console.error('\n❌ Error during data import:', err)
    process.exit(1)
  }
}

async function destroyData() {
  try {
    const userCount = await prisma.users.count()
    const sellerCount = await prisma.sellers.count()

    if (userCount === 0 && sellerCount === 0) {
      console.log('\nℹ️  Database is already empty')
      return
    }

    console.log(`\n⚠️  Database contains: ${userCount} users, ${sellerCount} sellers`)
    
    const confirmed1 = await confirmAction(
      '❗❗ Are you sure you want to delete everything from the database?'
    )
    if (!confirmed1) {
      console.log('❌ Action cancelled')
      return
    }

    const confirmed2 = await confirmAction('❗❗ This cannot be undone. Proceed?')
    if (!confirmed2) {
      console.log('❌ Action cancelled')
      return
    }

    await cleanDatabase()
    console.log('✅ DATA DESTROYED\n')
  } catch (err) {
    console.error('\n❌ Error during data destruction:', err)
    process.exit(1)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const isDestroy = args.includes('-d') || args.includes('--destroy')
  
  if (isDestroy) {
    await destroyData()
  } else {
    await importData()
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Unexpected fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    rl.close()
  })
