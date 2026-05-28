import express, { Router } from 'express'
import isAuthenticated from '@packages/middleware/is-authenticated'
import { createDiscountCode, deleteDiscountCode, getCategories, getDiscountCodes, uploadProductImage } from '../controllers/product.controller'


const router: Router = express.Router()

router.get('/get-categories', getCategories)
router.get('/get-discount-codes', isAuthenticated, getDiscountCodes)
router.post('/create-discount-code', isAuthenticated, createDiscountCode)
router.delete('/delete-discount-code/:id', isAuthenticated, deleteDiscountCode)
router.post('/upload-product-image', isAuthenticated, uploadProductImage)

export default router