import express, { Router } from 'express'
import isAuthenticated from '@packages/middleware/is-authenticated'
import { 
    createDiscountCode, 
    createProduct, 
    deleteDiscountCode, 
    deleteProductImage,
    getCategories, 
    getDiscountCodes, 
    getShopProducts, 
    uploadProductImage 
} from '../controllers/product.controller'


const router: Router = express.Router()

router.get('/get-categories', getCategories)
router.get('/get-discount-codes', isAuthenticated, getDiscountCodes)
router.get('/get-shop-products', isAuthenticated, getShopProducts)
router.post('/create-discount-code', isAuthenticated, createDiscountCode)
router.post('/upload-product-image', isAuthenticated, uploadProductImage)
router.post('/create-product', isAuthenticated, createProduct)
router.delete('/delete-discount-code/:id', isAuthenticated, deleteDiscountCode)
router.delete('/delete-product-image', isAuthenticated, deleteProductImage)

export default router