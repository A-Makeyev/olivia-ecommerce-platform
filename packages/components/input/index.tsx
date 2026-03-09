import { forwardRef, InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react'


interface BaseProps {
    label?: string
    type?: 'text' | 'number' | 'password' | 'email' | 'textarea'
    className?: string
    icon?: React.ReactNode
    error?: string
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>
type Props = InputProps | TextareaProps

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
    ({ label, type = "text", className, icon, error, ...props }, ref) => {
        const inputBaseStyle = 
        `
            ${icon ? 'pl-10' : 'pl-3'} ${error ? 'border-red-500' : 'border-slate-400'} w-full p-2 outline-0  
            rounded-lg border transition-all duration-300 ease-out bg-transparent text-white peer placeholder-transparent
        `

        const labelStyle = 
        `
            ${icon ? 'left-10' : 'left-3'}
            absolute transition-all duration-300 ease-out pointer-events-none top-2 
            peer-focus:-top-6 peer-focus:left-1 peer-focus:text-sm peer-focus:text-white text-base text-slate-200
            peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:left-1 peer-[:not(:placeholder-shown)]:text-sm
            peer-[:not(:placeholder-shown)]:text-white
        `

        const iconStyle =
        `
            absolute top-2.5 left-3 text-slate-200 pointer-events-none transition-colors
            peer-focus:text-white peer-[:not(:placeholder-shown)]:text-white
        `

        return (
            <div className="w-full text-white">
                <div className="relative mt-2">
                    {type === 'textarea' ? (
                        <textarea
                            ref={ref as Ref<HTMLTextAreaElement>}
                            placeholder=" "
                            className={`${inputBaseStyle} ${className}`}
                            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
                        />
                    ) : (
                        <input
                            type={type}
                            ref={ref as Ref<HTMLInputElement>}
                            placeholder=" "
                            className={`${inputBaseStyle} ${className}`}
                            {...(props as InputHTMLAttributes<HTMLInputElement>)}
                        />
                    )}
                    {icon && (
                        <div className={iconStyle}>
                            {icon}
                        </div>
                    )}
                    {label && (
                        <label className={labelStyle}>
                            {label}
                        </label>
                    )}
                </div>
                {error && (
                    <p className="mt-2 text-red-500 font-medium">
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input