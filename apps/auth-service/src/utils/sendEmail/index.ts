import ejs from 'ejs'
import path from 'path'
import dovenv from 'dotenv'
import nodemailer from 'nodemailer'

dovenv.config()
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
})

// Render EJS template
const renderEmailTemplate = async (templateName: string, data: Record<string, any>): Promise<string> => {
    const templatePath = path.join(
        process.cwd(),
        'auth-service',
        'src',
        'utils',
        'emailTemplates',
        `${templateName}.ejs`
    )
    return ejs.renderFile(templatePath, data)
}

// Send email
export const sendEmail = async (to: string, subject: string, templateName: string, data: Record<string, any>) => {
    try {
        const html = await renderEmailTemplate(templateName, data)

        await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL,
            to,
            subject,
            html,
        })

        console.log(`Email sent to ${to}`)
        return true
    } catch (err) {
        console.error(`Error sending email to ${to}:`, err)
        return false
    } 
}