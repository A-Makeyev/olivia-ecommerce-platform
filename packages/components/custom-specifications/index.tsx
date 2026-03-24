import { useEffect } from 'react'
import { Controller, useFieldArray } from 'react-hook-form'
import { PlusCircle, Trash2 } from 'lucide-react'
import Input from '../input'


const CustomSpecifications = ({ control, errors }: any) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'custom_specifications'
    })

    useEffect(() => {
        if (fields.length === 0) {
            append({ name: '', value: '' })
        }
    }, [])

    return (
        <div>
            <label className="block font-semibold text-slate-300 mb-3">
                Custom Specifications
            </label>
            <div className="flex flex-col gap-3">
                {fields?.length > 0 && (
                    <div className="flex gap-2">
                        <div className="w-[200px]">
                            <span className="block text-slate-400 text-sm px-1">
                                e.g. size, material
                            </span>
                        </div>
                        <div className="flex-1 max-w-[200px]">
                            <span className="block text-slate-400 text-sm px-1">
                                e.g. large, cotton
                            </span>
                        </div>
                    </div>
                )}
                {fields?.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                        <div className="w-[200px]">
                            <Controller 
                                name={`custom_specifications.${index}.name`}
                                control={control}
                                rules={{ required: 'Specification name is required'}}
                                render={({ field }) => (
                                    <Input 
                                        size="sm"
                                        label="Name"
                                        placeholder="Name"
                                        {...field}
                                    />
                                )}
                            />
                        </div>
                        <div className="flex-1 max-w-[200px]">
                            <Controller 
                                name={`custom_specifications.${index}.value`}
                                control={control}
                                rules={{ required: 'Specification value is required'}}
                                render={({ field }) => (
                                    <Input 
                                        size="sm"
                                        label="Value"
                                        placeholder="Value"
                                        {...field}
                                    />
                                )}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-1 text-slate-300 hover:scale-110 transition mt-3"
                            title="Remove specification"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => append({ name: '', value: '' })}
                    className="flex items-center gap-2 w-[20%] mt-2 text-blue-500 hover:text-blue-400 transition"
                >
                    <PlusCircle size={20} />
                    Add Specification
                </button>
            </div>
            {errors?.custom_specifications && (
                <p className="mt-2 text-red-500 font-medium">
                    {errors.custom_specifications.message as string}
                </p>
            )}
        </div>
    )
}

export default CustomSpecifications