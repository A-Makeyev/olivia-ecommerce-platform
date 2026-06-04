import { Controller, useFieldArray, useWatch } from 'react-hook-form'
import { PlusCircle, Trash2 } from 'lucide-react'
import Input from '../input'


const sanitize = (value: string) => value.replace(/[,\-~| ]/g, '')

const CustomSpecifications = ({ control, errors, takenNames = [] }: any) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'custom_specifications'
    })

    const watchedFields = useWatch({ control, name: 'custom_specifications' }) ?? []

    const isDuplicateName = (name: string, currentIndex: number) => {
        const lower = name.toLowerCase()
        const dupeInSpecs = watchedFields.some((f: any, i: number) =>
            i !== currentIndex && f?.name?.toLowerCase() === lower
        )
        const dupeInProps = takenNames.some((n: string) => n.toLowerCase() === lower)
        return dupeInSpecs || dupeInProps
    }

    return (
        <div>
            <label className="block font-semibold text-slate-300 mb-4">
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
                    <div key={field.id} className="flex items-center gap-2">
                        <div className="w-[200px]">
                            <Controller 
                                name={`custom_specifications.${index}.name`}
                                control={control}
                                rules={{
                                    required: 'Name is required',
                                    validate: (val) => !isDuplicateName(val, index) || 'Name already exists'
                                }}
                                render={({ field, fieldState }) => (
                                    <Input 
                                        size="sm"
                                        label="Name"
                                        placeholder="Name"
                                        {...field}
                                        onChange={(e: any) => field.onChange(sanitize(e.target.value))}
                                        error={fieldState.error?.message}
                                    />
                                )}
                            />
                        </div>
                        <div className="flex-1 max-w-[200px]">
                            <Controller 
                                name={`custom_specifications.${index}.value`}
                                control={control}
                                rules={{ required: 'Value is required' }}
                                render={({ field, fieldState }) => (
                                    <Input 
                                        size="sm"
                                        label="Value"
                                        placeholder="Value"
                                        {...field}
                                        onChange={(e: any) => field.onChange(sanitize(e.target.value))}
                                        error={fieldState.error?.message}
                                    />
                                )}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-1 text-slate-300 hover:text-red-400 hover:scale-110 transition flex-shrink-0"
                            title="Remove specification"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => append({ name: '', value: '' })}
                    className="flex items-center gap-1.5 mt-1 text-blue-500 hover:text-blue-400 transition text-sm"
                >
                    <PlusCircle size={16} />
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