import { NotFoundError, ValidationError } from '@packages/error-handler'
import { Request, Response, NextFunction } from 'express'
import { imagekit } from '@packages/libs/imagekit'
import prisma from '@packages/libs/prisma'


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
      success: true
    })
  } catch(err) {
    return next(err)
  }
}

export const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileName } = req.body

    if (!fileName.includes('data:image')) {
      return next(new ValidationError('Invalid file type'))
    }

    const uploadedFile = await imagekit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: '/products'
    })

    res.status(201).json({
      success: true,
      file_url: uploadedFile.url,
      fileId: uploadedFile.fileId
    })  
  } catch(err) {
    return next(err)
  }
}

export const deleteProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { file_id } = req.body
    
    if (!file_id) {
      return next(new ValidationError("file_id is required"))
    }

    await imagekit.deleteFile(file_id)

    res.status(200).json({
      success: true
    })

  } catch(err) {
    return next(err)
  }
}

export const createProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discount_codes = [],
      stock,
      sale_price,
      regular_price,
      subCategory,
      custom_properties = {},
      images = []
    } = req.body

    if (
      !title ||
      !short_description ||
      !detailed_description ||
      !slug ||
      !category ||
      !subCategory ||
      sale_price === undefined ||
      stock === undefined || stock === null ||
      regular_price === undefined || regular_price === null
    ) {
      return next(new ValidationError('Missing required fields'))
    }

    if (!req.seller?.id) {
      return next(new ValidationError('Seller not authenticated'))
    }

    const existingSlug = await prisma.products.findUnique({
      where: { slug }
    })

    if (existingSlug) {
      return next(new ValidationError('Slug already exists'))
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        slug,
        category,
        subCategory,
        short_description,
        detailed_description,
        video_url,
        brand,
        colors,
        sizes,
        tags: Array.isArray(tags) ? tags : tags.split(','),
        stock: Number(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        warranty,
        custom_specifications,
        custom_properties,
        cash_on_delivery,
        shopId: req.seller?.shop?.id!,
        discount_codes: discount_codes,
        images: {
          create: images
            .filter((img: any) => img && img.file_id && img.url)
            .map((img: any) => ({
              file_id: img.file_id,
              url: img.url
            }))
        }
      },
      include: { images: true }
    })

    res.status(201).json({
      success: true,
      newProduct
    })
  } catch (err) {
    return next(err)
  }
}

export const getShopProducts = async (req: any, res: Response, next: NextFunction) => {
  try {
    console.log('seller:', req.seller?.id)
    console.log('shopId:', req.seller?.shop?.id)

    const products = await prisma.products.findMany({
      where: {
        shopId: req.seller?.shop?.id
      },
      include: {
        images: true
      }
    })

    res.status(200).json({
      success: true,
      products
    })
  } catch (err) {
    return next(err)
  }
}