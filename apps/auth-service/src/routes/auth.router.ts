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
    sellerLogin,
    getSeller,
    createShop,
    createStripeConnectLink,
} from "../controller/auth.controller"
import { isSeller } from "@packages/middleware/authorize-roles"
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
router.post('/seller-login', sellerLogin)
router.post('/create-shop', createShop)
router.post('/create-stripe-connect-link', createStripeConnectLink)

router.get('/get-seller', isAuthenticated, isSeller, getSeller)
router.get('/authenticate-user', isAuthenticated, getUser)

export default router