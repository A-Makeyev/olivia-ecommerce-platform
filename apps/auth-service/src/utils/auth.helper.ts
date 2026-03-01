import crypto from "crypto"
import redis from "@packages/libs/redis"
import { ValidationError } from "@packages/error-handler"
import { sendEmail } from "./sendEmail"
import prisma from "@packages/libs/prisma"
import { NextFunction, Request, Response } from "express"


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateRegistrationData = (data: any, userType: 'user' | 'seller') => {
    const { name, email, password, phone_number, country } = data

    if (!name || !email || !password || (userType === 'seller' && (!phone_number || !country))) {
        throw new ValidationError('Missing required fields')
    }

    if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format')
    }
}

export const checkOtpRestrictions = async (email: string) => {
    if (await redis.get(`otp_lock:${email}`)) {
        throw new ValidationError('Account locked due to multiple attempts, please try again in 30 minutes')
    }

    if (await redis.get(`otp_spam_lock:${email}`)) {
        throw new ValidationError('Too many OTP requests, please try again in 1 hour')
    }

    if (await redis.get(`otp_cooldown:${email}`)) {
        throw new ValidationError('Please wait 1 minute before requesting another OTP')
    }
}

export const trackOtpRequest = async (email: string) => {
    const otpRequestKey = `otp_request_count:${email}`
    let otpRequests = parseInt(await redis.get(otpRequestKey) || '0')

    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, 'true', 'EX', 3600) // Lock for 1 hour
        throw new ValidationError('Too many OTP requests, try again in 1 hour')
    }

    await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600) // Track OTP requests for 1 hour
}

export const sendOtp = async (name: string, email: string, template: string) => {
    const otp = crypto.randomInt(1000, 9999).toString()

    await sendEmail(email, 'Verification Code', template, { name, otp })
    await redis.set(`otp:${email}`, otp, 'EX', 300) // OTP expires in 5 minutes
    await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60) // Cooldown of 1 minute before requesting another OTP
}

export const verifyOtp = async (email: string, otp: string) => {
    const storedOtp = await redis.get(`otp:${email}`)

    if (!storedOtp) {
        throw new ValidationError('Invalid or expired OTP')
    }

    const failedAttemptsKey = `otp_attempts:${email}`
    const failedAttempts = parseInt(await redis.get(failedAttemptsKey) || '0')

    if (storedOtp !== otp) {
        if (failedAttempts >= 2) {
            await redis.set(`otp_lock:${email}`, 'true', 'EX', 1800) // Lock for 30 minutes
            await redis.del(`otp:${email}`, failedAttemptsKey)
            throw new ValidationError('Account locked due to multiple failed attempts, try again in 30 minutes')
        }
        await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300) // Track failed attempts for 5 minutes
        throw new ValidationError(`Invalid code ${2 - failedAttempts} attempts remaining`)
    }

    await redis.del(`otp:${email}`, failedAttemptsKey)
}

export const verifyForgotPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body
        
        if (!email || !otp) {
            return next(new ValidationError('Email and OTP are required'))
        }

        await verifyOtp(email, otp)
        
        res.status(200).json({
            message: 'OTP verified successfully',
            success: true
        })
    } catch (err) {
        return next(err)
    }
}

export const handleForgotPassword = async (req: Request, res: Response, next: NextFunction, userType: 'user' | 'seller') => {
    try {
        const { email } = req.body

        if (!email) {
            return next(new ValidationError('Email is required'))
        }

        const user = userType === 'user' 
            ? await prisma.users.findUnique({ where: { email } }) 
            : await prisma.sellers.findUnique({ where: { email } })

        if (!user) {
            return next(new ValidationError(`${email} is not registered`))
        }

        await checkOtpRestrictions(email)
        await trackOtpRequest(email)
        await sendOtp(user.name, email, userType === 'user' ? 'user-forgot-password-email' : 'seller-forgot-password-email')

        res.status(200).json({
            message: `OTP sent to ${email} for account recovery`
        })
    } catch (err) {
        return next(err)
    }
}