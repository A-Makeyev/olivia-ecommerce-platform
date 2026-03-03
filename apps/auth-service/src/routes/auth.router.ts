import express, { Router } from "express"
import { 
    getUser, 
    userLogin, 
    forgotPassword, 
    refreshToken, 
    resetPassword, 
    userRegistration, 
    userVerification, 
    verifyUserForgotPassword, 
    sellerRegistration,
    sellerVerification,
    createShop
} from "../controller/auth.controller"
import isAuthenticated from "@packages/middleware/is-authenticated"


const router: Router = express.Router()

router.post('/user-registration', userRegistration)
router.post('/user-verification', userVerification)
router.post('/user-login', userLogin)

router.post('/refresh-token', refreshToken)
router.post('/forgot-password', forgotPassword)
router.post('/verify-forgot-password', verifyUserForgotPassword)
router.post('/reset-password', resetPassword)

router.post('/seller-registration', sellerRegistration)
router.post('/seller-verification', sellerVerification)
router.post('/create-shop', createShop)

router.get('/authenticate-user', isAuthenticated, getUser)

export default router