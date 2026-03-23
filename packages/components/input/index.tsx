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
            ${icon ? 'pl-11' : 'pl-4'} ${error ? 'border-red-500' : 'border-slate-400 focus:border-[#80DEEA]'} w-full p-3.5 outline-0  
            rounded-lg border transition-all duration-300 ease-out bg-transparent text-lg text-white peer placeholder-transparent
        `

        const labelStyle = 
        `
            ${icon ? 'left-11' : 'left-4'}
            absolute transition-all duration-300 ease-out pointer-events-none top-4
            peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm peer-focus:text-white text-lg text-slate-400
            peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-sm
            peer-[:not(:placeholder-shown)]:text-white
            bg-black px-1.5
        `

        const iconStyle =
        `
            absolute top-[20px] left-4 text-slate-400 pointer-events-none transition-colors
            peer-focus:text-white peer-[:not(:placeholder-shown)]:text-white
        `

        return (
            <div className="w-full text-white">
                <div className="relative my-2">
                    {type === 'textarea' ? (
                        <textarea
                            ref={ref as Ref<HTMLTextAreaElement>}
                            placeholder=" "
                            className={`${inputBaseStyle} min-h-[100px] max-h-[250px] resize-y ${className}`}
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