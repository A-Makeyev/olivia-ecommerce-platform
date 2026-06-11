import express, { Router } from 'express'
import isAuthenticated from '@packages/middleware/is-authenticated'
import { 
    archiveProduct,
    createDiscountCode, 
    createProduct, 
    deleteDiscountCode, 
    deleteProduct, 
    deleteProductImage,
    getCategories, 
    getDiscountCodes, 
    getShopProducts, 
    restoreDeletedProduct, 
    unarchiveProduct, 
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
router.delete('/delete-product/:id', isAuthenticated, deleteProduct)
router.put('/restore-product/:id', isAuthenticated, restoreDeletedProduct)
router.put('/archive-product/:id',   isAuthenticated, archiveProduct)
router.put('/unarchive-product/:id', isAuthenticated, unarchiveProduct)

export default router