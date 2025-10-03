import express, { Router } from 'express'
import { userRgistration } from '../controllers/auth.controller'

const router: Router = express.Router()

router.post('/user-registration', userRgistration)

export default router