import { NextFunction, Response } from 'express'
import prisma from '@packages/libs/prisma'
import jwt from 'jsonwebtoken'


const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies['access_token'] || req.cookies['seller_access_token'] || req.headers.authorization?.split(' ')[1]

        
        if (!token) {
            return res.status(401).json({ message: 'Token not found' })
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN!) as { id: string, role: 'user' | 'seller' }

        if (!decodedToken) {
            return res.status(401).json({ message: 'Token not verified' })
        }

        let account

        if (decodedToken.role === 'user') {
            account = await prisma.users.findUnique({ where: { id: decodedToken.id } })
            req.user = account
        } else if (decodedToken.role === 'seller') {
            account = await prisma.sellers.findUnique({ where: { id: decodedToken.id }, include: { shop: true } })
            req.seller = account
        }

        if (!account) {
            return res.status(401).json({ message: 'Account not found' })
        }

        req.role = decodedToken.role

        return next()
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized. Token invalid or expired' })
    }
}

export default isAuthenticated