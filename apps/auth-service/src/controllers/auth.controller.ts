import prisma from '../../../../packages/libs/prisma'
import { Request, Response, NextFunction } from 'express'
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData } from '../utils/auth.helper'
import { ValidationError } from '../../../../packages/error-handler'

// Register a new user
export const userRgistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, 'user')

        const { name, email } = req.body
        const existingUser = await prisma.users.findUnique({ where: { email } })

        if (existingUser) {
            return next(new ValidationError('User already exists'))
        }

        await checkOtpRestrictions(email, next)
        await trackOtpRequests(email, next)
        await sendOtp(name, email, 'user-verification-email')

        res.status(200).json({ message: 'OTP sent to email' })
    } catch (err) {
        return next(err)
    }
}