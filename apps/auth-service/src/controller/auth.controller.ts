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

        await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        res.status(201).json({
            message: 'Accout created successfully',
            success: true
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

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refresh_token

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

        // if (decodedToken.role === 'user') 
        const user = await prisma.users.findUnique({ where: { id: decodedToken.id } })

        if (!user) {
            return new AuthError('User not found')
        }

        const newAccessToken = jwt.sign({
            id: decodedToken.id, 
            role: decodedToken.role,
        }, process.env.ACCESS_TOKEN as string, { expiresIn: '15m' })

        setCookie(res, 'access_token', newAccessToken)

        res.status(201).json({
            message: 'Token refreshed successfully',
            success: true
        })
    } catch (err) {
        return next(err)
    }
}

export const getUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user

        res.status(201).json({
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
        const seller = await prisma.sellers.findUnique({ where: { email } })

        if (seller) {
            return new ValidationError(`${email} is already registered`)
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