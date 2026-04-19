import bcrypt from "bcryptjs"
import prisma from "@packages/libs/prisma"
import jwt, { JsonWebTokenError } from "jsonwebtoken"
import { AuthError, ValidationError } from "@packages/error-handler"
import { NextFunction, Request, Response } from "express"
import { setCookie } from "../utils/cookies/setCookie"
import { 
    checkOtpRestrictions, 
    handleForgotPassword, 
    sendOtp, 
    trackOtpRequest, 
    validateRegistrationData, 
    verifyForgotPasswordOtp,
    verifyOtp
} from "../utils/auth.helper"
import Stripe from "stripe"


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover'
})

export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, 'user')

        const { name, email, password } = req.body
        const existingUser = await prisma.users.findUnique({ where: { email } })

        if (existingUser) {
            return next(new ValidationError(`${email} is already registered`))
        }

        await checkOtpRestrictions(email)
        await trackOtpRequest(email)
        await sendOtp(name, email, 'user-activation-email')

        res.status(200).json({
            message: `OTP sent to ${email} for account verification`
        })
    } catch (err) {
        return next(err)
    }
}

export const userVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password, name } = req.body

        if (!email || !otp || !password || !name) {
            return next(new ValidationError('Missing required fields'))
        }

        const existingUser = await prisma.users.findUnique({ where: { email } })

        if (existingUser) {
            return next(new ValidationError(`${email} is already registered`))
        }

        await verifyOtp(email, otp)

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        const accessToken = jwt.sign({
            id: user.id,
            role: 'user',
        }, process.env.ACCESS_TOKEN as string, { expiresIn: '15m' })

        const refreshToken = jwt.sign({
            id: user.id,
            role: 'user',
        }, process.env.REFRESH_TOKEN as string, { expiresIn: '7d' })

        res.clearCookie('seller_access_token')
        res.clearCookie('seller_refresh_token')

        setCookie(res, 'access_token', accessToken)
        setCookie(res, 'refresh_token', refreshToken)

        res.status(201).json({
            message: 'Accout created successfully',
            success: true,
            user
        })
    } catch (err) {
        return next(err)
    }
}

export const userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return next(new ValidationError('Email and password are required'))
        }

        const user = await prisma.users.findUnique({ where: { email } })

        if (!user) {
            return next(new AuthError('Invalid email or password'))
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password!)

        if (!isPasswordMatch) {
            return next(new AuthError('Invalid email or password'))
        }

        res.clearCookie('seller_access_token')
        res.clearCookie('seller_refresh_token')

        const accessToken = jwt.sign({
            id: user.id,
            role: "user",
        }, process.env.ACCESS_TOKEN as string, { expiresIn: '15m' })

        const refreshToken = jwt.sign({
            id: user.id,
            role: "user",
        }, process.env.REFRESH_TOKEN as string, { expiresIn: '7d' })

        setCookie(res, 'access_token', accessToken)
        setCookie(res, 'refresh_token', refreshToken)

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })
    } catch (err) {
        return next(err)
    }
}

export const refreshToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies['refresh_token'] || req.cookies['seller_refresh_token'] || req.headers.authorization?.split(' ')[1]

        if (!refreshToken) {
            return new ValidationError('Refresh token not found')
        }

        const decodedToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN as string
        ) as { id: string, role: string }

        if (!decodedToken || !decodedToken.id || !decodedToken.role) {
            return new JsonWebTokenError('Invalid refresh token')
        }

        let account 
        if (decodedToken.role === 'user') {
            account = await prisma.users.findUnique({ where: { id: decodedToken.id } })
        } else if (decodedToken.role === 'seller') {
            account = await prisma.sellers.findUnique({ where: { id: decodedToken.id }, include: { shop: true } })
        }

        if (!account) {
            return new AuthError('Account not found')
        }

        const newAccessToken = jwt.sign({
            id: decodedToken.id, 
            role: decodedToken.role,
        }, process.env.ACCESS_TOKEN as string, { expiresIn: '15m' })

        if (decodedToken.role === 'user') {
            setCookie(res, 'access_token', newAccessToken)
        } else if (decodedToken.role === 'seller') {
            setCookie(res, 'seller_access_token', newAccessToken)
        }
    
        req.role = decodedToken.role

        res.status(201).json({
            success: true
        })
    } catch (err) {
        return next(err)
    }
}

export const getUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user

        res.status(200).json({
            success: true,
            user
        })
    } catch (err) {
        return next(err)
    }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await handleForgotPassword(req, res, next, 'user')
}

export const verifyUserForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await verifyForgotPasswordOtp(req, res, next)
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, newPassword } = req.body

        if (!email || !newPassword) {
            return next(new ValidationError('Email and password are required'))
        }

        const user = await prisma.users.findUnique({ where: { email } })

        if (!user) {
            return next(new ValidationError('User does not exist'))
        }

        const isPasswordSame = await bcrypt.compare(newPassword, user.password!)

        if (isPasswordSame) {
            return next(new ValidationError('New password cannot be the same as the old password'))
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.users.update({
            where: { email },
            data: { password: hashedPassword }
        })

        res.status(200).json({
            message: 'Password reset successful'
        })
    } catch (err) {
        return next(err)
    }
}

export const sellerRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, 'seller')

        const { name, email } = req.body
        const existingSeller = await prisma.sellers.findUnique({ where: { email } })

        if (existingSeller) {
            return next(new ValidationError('Email is already in use'))
        }

        await checkOtpRestrictions(email)
        await trackOtpRequest(email)
        await sendOtp(name, email, 'seller-activation-email')

        res.status(200).json({
            message: `OTP sent to ${email} for account verification`
        })
    } catch (err) {
        return next(err)
    }
}

export const sellerVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password, name, phone_number, country } = req.body

        if (!email || !otp || !password || !name || !phone_number || !country) {
            return next(new ValidationError('Missing required fields'))
        }

        const existingSeller = await prisma.sellers.findUnique({ where: { email } })

        if (existingSeller) {
            return next(new ValidationError('Email is already in use'))
        }

        await verifyOtp(email, otp)

        const hashedPassword = await bcrypt.hash(password, 10)

        const seller = await prisma.sellers.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone_number,
                country
            }
        })

        const accessToken = jwt.sign({
            id: seller.id,
            role: 'seller'
        }, process.env.ACCESS_TOKEN as string, { expiresIn: '15m' })

        const refreshToken = jwt.sign({
            id: seller.id,
            role: 'seller'
        }, process.env.REFRESH_TOKEN as string, { expiresIn: '7d' })

        res.clearCookie('access_token')
        res.clearCookie('refresh_token')

        setCookie(res, 'seller_access_token', accessToken)
        setCookie(res, 'seller_refresh_token', refreshToken)

        res.status(201).json({
            message: 'Account created successfully',
            seller
        })
    } catch (err) {
        return next(err)
    }
}

export const createShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, bio, address, opening_hours, website, category, sellerId } = req.body

        if (!name || !bio || !address || !opening_hours || !category || !sellerId) {
            return next(new ValidationError('Missing required fields'))
        }

        const shopData: any = {
            name,
            bio,
            address,
            opening_hours,
            category,
            sellerId
        }

        if (website && website.trim() !== '') {
            shopData.website = website
        }

        const shop = await prisma.shops.create({
            data: shopData
        })

        res.status(201).json({
            message: 'Shop created successfully',
            shop
        })
    } catch (err) {
        return next(err)
    }
}

export const createStripeConnectLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sellerId } = req.body

        if (!sellerId) {
            return next(new ValidationError('Seller ID is required'))
        }

        const seller = await prisma.sellers.findUnique({ where: { id: sellerId } })

        if (!seller) {
            return next(new ValidationError('Seller not found'))
        }

        const account = await stripe.accounts.create({
            type: 'express',
            email: seller?.email,
            country: seller?.country,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        })

        await prisma.sellers.update({
            where: { id: sellerId },
            data: { stripeId: account.id }
        })

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `http://localhost:3000/success`,
            return_url: `http://localhost:3000/success`,
            type: 'account_onboarding',
        })

        res.status(200).json({
            message: 'Stripe account created successfully',
            url: accountLink.url
        })

    } catch (err) {
        return next(err)
    }
}

export const sellerLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return next(new ValidationError('Email and password are required'))
        }

        const seller = await prisma.sellers.findUnique({ where: { email }, include: { shop: true } })

        if (!seller) {
            return next(new ValidationError('Invalid email or password'))
        }

        const isPasswordValid = await bcrypt.compare(password, seller.password!)

        if (!isPasswordValid) {
            return next(new ValidationError('Invalid email or password'))
        }

        res.clearCookie('access_token')
        res.clearCookie('refresh_token')

        const accessToken = jwt.sign({
            id: seller.id,
            role: 'seller'
        }, process.env.ACCESS_TOKEN as string, { expiresIn: '15m' })

        const refreshToken = jwt.sign({
            id: seller.id,
            role: 'seller'
        }, process.env.REFRESH_TOKEN as string, { expiresIn: '7d' })

        setCookie(res, 'seller_access_token', accessToken)
        setCookie(res, 'seller_refresh_token', refreshToken)

        res.status(200).json({
            message: 'Login successful',
            seller
        })
    } catch (err) {
        return next(err)
    }
}

export const getSeller = async (req: any, res: Response, next: NextFunction) => {
    try {
        const seller = req.seller

        res.status(200).json({
            success: true,
            seller
        })
    } catch (err) {
        return next(err)
    }
}