import { AuthError } from '@packages/error-handler'
import { NextFunction, Response } from 'express'

export const isUser = (req: any, res: Response, next: NextFunction) => {
    if (req.role !== 'user') {
        return next(new AuthError('Forbidden. Only users can access this route'))
    }
}

export const isSeller = (req: any, res: Response, next: NextFunction) => {
    if (req.role !== 'seller') {
        return next(new AuthError('Forbidden. Only sellers can access this route'))
    }
}