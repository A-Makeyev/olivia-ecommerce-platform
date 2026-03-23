import { forwardRef, InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react'


interface BaseProps {
    label?: string
    type?: 'text' | 'number' | 'password' | 'email' | 'textarea'
    className?: string
    icon?: React.ReactNode
    error?: string
    size?: 'sm' | 'md' | 'lg'
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>
type Props = InputProps | TextareaProps

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
    ({ label, type = "text", className, icon, error, size = 'md', ...props }, ref) => {
        const isSm = size === 'sm'
        const isLg = size === 'lg'

        const inputBaseStyle = 
        `
            ${icon ? (isSm ? 'pl-9' : isLg ? 'pl-14' : 'pl-11') : (isSm ? 'pl-3' : isLg ? 'pl-6' : 'pl-4')} 
            ${error ? 'border-red-500' : 'border-slate-400 focus:border-[#80DEEA]'} 
            w-full ${isSm ? 'p-2' : isLg ? 'p-5' : 'p-3.5'} outline-0  
            rounded-lg border transition-all duration-300 ease-out bg-transparent 
            ${isSm ? 'text-sm' : isLg ? 'text-xl' : 'text-lg'} text-white peer placeholder-transparent
        `

        const labelStyle = 
        `
            ${icon ? (isSm ? 'left-9' : isLg ? 'left-14' : 'left-11') : (isSm ? 'left-3' : isLg ? 'left-6' : 'left-4')}
            absolute transition-all duration-300 ease-out pointer-events-none 
            ${isSm ? 'top-2' : isLg ? 'top-5' : 'top-4'}
            peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm peer-focus:text-white 
            ${isSm ? 'text-sm' : isLg ? 'text-xl' : 'text-lg'} text-slate-400
            peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-sm
            peer-[:not(:placeholder-shown)]:text-white
            bg-black px-1.5
        `

        const iconStyle =
        `
            absolute ${isSm ? 'top-[12px] left-3' : isLg ? 'top-[24px] left-6' : 'top-[20px] left-4'} 
            text-slate-400 pointer-events-none transition-colors
            peer-focus:text-white peer-[:not(:placeholder-shown)]:text-white
        `

        return (
            <div className="w-full text-white">
                <div className="relative my-2">
                    {type === 'textarea' ? (
                        <textarea
                            ref={ref as Ref<HTMLTextAreaElement>}
                            placeholder=" "
                            className={`${inputBaseStyle} min-h-[180px] resize-none ${className}`}
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
                            {typeof icon === 'object' && 'props' in (icon as any) 
                                ? Object.assign({}, icon, { props: { ...((icon as any).props), size: isSm ? 16 : isLg ? 24 : 20 } }) 
                                : icon}
                        </div>
                    )}
                    {label && (
                        <label className={labelStyle}>
                            {label}
                        </label>
                    )}
                </div>
                {error && (
                    <p className="mt-2 text-red-500 font-medium text-xs">
                        {error}
                    </p>
                )}
            </div>
        )
    }
)


Input.displayName = 'Input'

export default Input