import { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import { PackageOpen, PlusCircle, X } from 'lucide-react'
import Input from '../input'


const CustomProperties = ({ control, errors }: any) => {
    const [properties, setProperties] = useState<{ label: string, values: string[] }[]>([])
    const [newLabel, setNewLabel] = useState('')
    const [newValue, setNewValue] = useState('')

    return (
        <div>
            <div className="flex flex-col gap-3">
                <div className="w-full">
                    <Controller 
                        name="custom_properties"
                        control={control}
                        render={({ field }) => {
                            useEffect(() => {
                                field.onChange(properties)
                            }, [properties])

                            const addProperty = () => {
                                if (!newLabel.trim()) return
                                setProperties([...properties, { label: newLabel, values: [] }])
                                setNewLabel('')
                            }

                            const addValue = (index: number) => {
                                if (!newValue.trim()) return
                                const updatedProperties = [...properties]
                                updatedProperties[index].values.push(newValue)
                                setProperties(updatedProperties)
                                setNewValue('')
                            }

                            const removeProperty = (index: number) => {
                                setProperties(properties.filter((_, i) => i !== index))
                            }

                            return (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <label className="block font-bold text-slate-300 text-base tracking-tight">
                                        Custom Properties
                                    </label>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="mb-2">
                                        <div className="flex gap-2 mb-1">
                                            <div className="w-[240px]">
                                                <span className="block text-slate-400 text-sm px-1">
                                                    e.g. storage, model
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-[240px]">
                                                <Input 
                                                    size="sm"
                                                    label="Property"
                                                    placeholder="Property Name"
                                                    icon={<PackageOpen size={16} />}
                                                    value={newLabel}
                                                    onChange={(e: any) => setNewLabel(e.target.value)}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addProperty}
                                                className="flex h-[40px] items-center gap-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-md transition"
                                                title="Add property"
                                            >
                                                <PlusCircle size={20} />
                                                <span>Add</span>
                                            </button>
                                        </div>
                                    </div>
                                    {properties.length > 0 && (
                                        <div className="flex flex-col gap-3">
                                            {properties.map((property, index) => (
                                                <div key={index} className="group border border-slate-700/40 w-[450px] p-3 rounded-xl bg-slate-800/40 hover:border-blue-500/30 transition-all duration-300">
                                                    <div className="flex items-center justify-between pb-2 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <PackageOpen size={16} className="text-blue-400" />
                                                            <span className="text-slate-200 font-bold uppercase text-[10px] tracking-wider">
                                                                {property.label}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeProperty(index)}
                                                            className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                                                            title="Remove property"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <input 
                                                                type="text" 
                                                                placeholder="Add value (e.g. XL, Blue, 128GB)"
                                                                value={newValue}
                                                                onChange={(e) => setNewValue(e.target.value)}
                                                                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg py-1.5 px-3 focus:border-blue-500/50 focus:outline-none transition-all placeholder:text-slate-500 text-xs" 
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => addValue(index)}
                                                            className="h-[32px] px-3 bg-slate-700 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all text-xs flex items-center gap-1.5"
                                                            title="Add value"
                                                        >
                                                            <span>Done</span>
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {property.values.map((value, vIndex) => (
                                                            <span key={vIndex} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-md text-[10px] font-bold">
                                                                {value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {errors?.custom_properties && (
                                    <p className="mt-2 text-red-500 font-bold text-xs">
                                        {errors.custom_properties.message as string}
                                    </p>
                                )}
                            </div>
                        )
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default CustomProperties