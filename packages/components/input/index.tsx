import { forwardRef, InputHTMLAttributes, Ref, SelectHTMLAttributes, TextareaHTMLAttributes, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface BaseProps {
    type?: 'text' | 'number' | 'password' | 'email' | 'textarea' | 'select'
    labelTheme?: 'dark' | 'white' | 'dim' | 'transparent'
    label?: string
    className?: string
    icon?: React.ReactNode
    error?: string
    required?: boolean
    size?: 'sm' | 'md' | 'lg'
    children?: React.ReactNode
}

type InputProps    = BaseProps & InputHTMLAttributes<HTMLInputElement>
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>
type SelectProps   = BaseProps & SelectHTMLAttributes<HTMLSelectElement>
type Props = InputProps | TextareaProps | SelectProps

const themes = {
    dark:        { bg: 'bg-black'       },
    white:       { bg: 'bg-white'       },
    dim:         { bg: 'bg-slate-900'   },
    transparent: { bg: 'bg-transparent' },
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, Props>(
    ({ type = 'text', label, labelTheme = 'dark', className, icon, error, required, size = 'md', children, ...props }, ref) => {
        const isSm = size === 'sm'
        const isLg = size === 'lg'
        const theme = themes[labelTheme]
        const [isOpen, setIsOpen] = useState(false)

        const inputBaseStyle =
        `
            ${icon ? (isSm ? 'pl-9' : isLg ? 'pl-14' : 'pl-11') : (isSm ? 'pl-3' : isLg ? 'pl-6' : 'pl-4')}
            ${error ? 'border-red-500' : 'border-slate-400 focus:border-[#80DEEA]'}
            w-full ${isSm ? 'p-2' : isLg ? 'p-5' : 'p-3.5'} outline-0
            rounded-lg border transition-all duration-300 ease-out bg-transparent
            ${isSm ? 'text-sm' : isLg ? 'text-xl' : 'text-lg'} text-white peer placeholder-transparent
        `

        const selectBaseStyle =
        `
            ${icon ? (isSm ? 'pl-9' : isLg ? 'pl-14' : 'pl-11') : (isSm ? 'pl-3' : isLg ? 'pl-6' : 'pl-4')}
            ${error ? 'border-red-500' : 'border-slate-400 focus:border-[#80DEEA]'}
            w-full ${isSm ? 'py-1.5 min-h-[34px]' : isLg ? 'py-5 min-h-[64px]' : 'py-3.5 min-h-[52px]'} pr-10 outline-0
            appearance-none rounded-lg border transition-all duration-300 ease-out bg-transparent
            ${isSm ? 'text-sm' : isLg ? 'text-xl' : 'text-lg'} text-white cursor-pointer relative z-20
        `

        const labelStyle =
        `
            ${theme.bg}
            ${icon ? (isSm ? 'left-9' : isLg ? 'left-14' : 'left-11') : (isSm ? 'left-3' : isLg ? 'left-6' : 'left-4')}
            absolute transition-all duration-300 ease-out pointer-events-none px-1.5
            ${isSm ? 'top-2' : isLg ? 'top-5' : 'top-4'}
            peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm peer-focus:text-white
            ${isSm ? 'text-sm' : isLg ? 'text-xl' : 'text-lg'} text-slate-400
            peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-3
            peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-white
        `

        const selectLabelStyle =
        `
            ${theme.bg}
            absolute transition-all duration-300 ease-out pointer-events-none px-1.5 z-30
            ${isSm ? 'text-sm' : isLg ? 'text-xl' : 'text-lg'}
            ${props.value
                ? `-top-3 left-3 text-sm text-white`
                : `${isSm ? 'top-2' : isLg ? 'top-5' : 'top-4'} ${icon ? (isSm ? 'left-9' : isLg ? 'left-14' : 'left-11') : (isSm ? 'left-3' : isLg ? 'left-6' : 'left-4')} text-slate-400`
            }
        `

        const iconStyle =
        `
            absolute ${isSm ? 'top-[10px] left-3' : isLg ? 'top-[22px] left-6' : 'top-[16px] left-4'}
            text-slate-400 pointer-events-none transition-colors
            peer-focus:text-white peer-[:not(:placeholder-shown)]:text-white
        `

        const selectIconStyle =
        `
            absolute ${isSm ? 'top-[10px] left-3' : isLg ? 'top-[22px] left-6' : 'top-[16px] left-4'}
            text-slate-400 pointer-events-none z-30 transition-colors
            ${props.value ? 'text-white' : 'text-slate-400'}
        `

        if (type === 'select') {
            return (
                <div className="w-full text-white">
                    <div className="relative my-2">
                        <select
                            ref={ref as Ref<HTMLSelectElement>}
                            className={`${selectBaseStyle} ${className}`}
                            onClick={() => setIsOpen(prev => !prev)}
                            onBlur={(e) => {
                                setIsOpen(false);
                                (props as SelectHTMLAttributes<HTMLSelectElement>).onBlur?.(e)
                            }}
                            {...(props as SelectHTMLAttributes<HTMLSelectElement>)}
                        >
                            {children}
                        </select>
                        {icon && (
                            <div className={selectIconStyle}>
                                {typeof icon === 'object' && 'props' in (icon as any)
                                    ? Object.assign({}, icon, { props: { ...((icon as any).props), size: isSm ? 16 : isLg ? 24 : 20 } })
                                    : icon}
                            </div>
                        )}
                        {label && (
                            <label className={selectLabelStyle}>
                                {label}
                                {required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                        )}
                        <div className={`absolute ${isSm ? 'top-[9px]' : isLg ? 'top-[22px]' : 'top-[16px]'} right-3 text-slate-400 pointer-events-none z-30 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                            <ChevronDown size={isSm ? 16 : isLg ? 24 : 20} />
                        </div>
                    </div>
                    {error && (
                        <p className="mt-2 text-red-500 font-medium text-sm">
                            {error}
                        </p>
                    )}
                </div>
            )
        }

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
                            {required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                    )}
                </div>
                {error && (
                    <p className="mt-2 text-red-500 font-medium text-sm">
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input