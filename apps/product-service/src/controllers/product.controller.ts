import prisma from '@packages/libs/prisma'
import { Request, Response, NextFunction } from 'express'


export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await prisma.site_config.findFirst()

    if (!config) {
      return res.status(404).json({ 'message': 'No Site Configurations found' })
    }

    res.status(200).json({ 
        categories: config.categories,
        subCategories: config.subCategories
    })
  } catch (err) {
    return next(err)
  }
}