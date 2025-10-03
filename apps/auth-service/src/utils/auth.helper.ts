import crypto from 'crypto'
import redis from '../../../../packages/libs/redis'
import { NextFunction } from 'express'
import { ValidationError } from '../../../../packages/error-handler'
import { sendEmail } from './sendEmail'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateRegistrationData = (data: any, userType: 'user' | 'seller') => {
    const { name, email, password, phoneNumber, country } = data

    if (!name || !email || !password || (userType === 'seller' && (!phoneNumber || !country))) {
        throw new ValidationError('Missing required fields')
    }

    if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format')
    }
}

export const checkOtpRestrictions = async (email: string, next: NextFunction) => {
    if (await redis.get(`otp_lock:${email}`)) {
        return next(new ValidationError('Too many failed attempts. Please try again later.'))
    }

    if (await redis.get(`otp_spam_lock:${email}`)) {
        return next(new ValidationError('Too many OTP requests. Please try again later.'))
    }

    if (await redis.get(`otp_cooldown:${email}`)) {
        return next(new ValidationError('Please wait before requesting a new OTP.'))
    }
}

export const trackOtpRequests = async (email: string, next: NextFunction) => {
    const otpRequestKey = `otp_request_count:${email}`
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || '0')

    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600)
        return next(new ValidationError('Too many OTP requests. Please try again later.'))
    }

    await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600)
}

export const sendOtp = async(name: string, email: string, template: string) => {
    const otp = crypto.randomInt(1000, 9999).toString()

    await sendEmail(email, 'Your OTP Code', template, { name, otp })
    await redis.set(`otp:${email}`, otp, 'EX', 300)
    await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60)
}