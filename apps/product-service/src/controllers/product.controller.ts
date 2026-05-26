import { NotFoundError, ValidationError } from '@packages/error-handler'
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

export const createDiscountCode = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body

    const isDiscountCodeExists = await prisma.discount_codes.findUnique({ 
      where: { 
        discountCode
      } 
    })

    if (isDiscountCodeExists) {
      return next(
        new ValidationError('Discount code already exists')
      )
    }

    const isTitleExists = await prisma.discount_codes.findFirst({
      where: {
        sellerId: req.seller.id,
        public_name: {
          equals: public_name.trim(),
          mode: 'insensitive'
        }
      }
    })

    if (isTitleExists) {
      return next(
        new ValidationError('A discount code with this title already exists')
      )
    }

    const newDiscountCode = await prisma.discount_codes.create({
      data: {
        public_name,
        discountCode,
        discountType,
        discountValue: parseFloat(discountValue),
        sellerId: req.seller.id
      }
    })

    res.status(201).json({
      success: true,
      newDiscountCode
    })
  } catch(err) {
    return next(err)
  }
}

export const getDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
  try {
    const discountCodes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id
      }
    })

    res.status(200).json({
      success: true,
      discountCodes
    })
  } catch(err) {
    return next(err)
  }
}

export const deleteDiscountCode = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const sellerId = req.seller?.id

    const discountCode = await prisma.discount_codes.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        sellerId: true
      }
    })

    if (!discountCode) {
      return next(new NotFoundError('Discount code not found'))
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new ValidationError('Not authorized to perform this action'))
    }

    await prisma.discount_codes.delete({
      where: {
        id
      }
    })

    res.status(200).json({
      success: true,
      message: 'Discount code deleted successfully'
    })
  } catch(err) {
    return next(err)
  }
}