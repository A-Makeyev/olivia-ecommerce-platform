import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'


const defaultColors = [
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFFFFF', // White
    '#000000', // Black
]

const ColorSelector = ({ control, errors }: any) => {
    const [customColors, setCustomColors] = useState<string[]>([])
    const [showCustomPicker, setShowCustomPicker] = useState(false)
    const [newColor, setNewColor] = useState('#FFFFFF')

    return (
        <div className="mt-2">
            <label className="block font-semibold text-slate-300 mb-2">
                Colors
            </label>
            <Controller
                name="colors"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                    <div className="flex flex-wrap gap-3">
                        {[...defaultColors, ...customColors].map((color) => {
                            const isSelected = (field.value || []).includes(color)
                            const isLightColor = ['#FFFFFF', '#FFFF00', '#FF00FF', '#00FFFF'].includes(color)
                            
                            return (
                                <button
                                    type="button"
                                    key={color}
                                    className={`
                                        flex items-center justify-center w-7 h-7 p-2 rounded-md border-2 transition
                                        ${isSelected ? "border-white scale-110" : "border-slate-600 hover:scale-105"}

                                    `}
                                    style={{ backgroundColor: color }}
                                    onClick={() => 
                                        field.onChange(
                                            isSelected 
                                                ? field.value.filter((c: string) => c !== color) 
                                                : [...(field.value || []), color]
                                        )
                                    }
                                />
                            )
                        })}
                        <button
                            type="button"
                            className="flex items-center justify-center w-8 h-8 p-2 -mt-0.5 rounded-full border-2 border-slate-600 bg-slate-900 hover:bg-slate-800 transition"
                            onClick={() => setShowCustomPicker(!showCustomPicker)}
                        >
                            <Plus size={20} />
                        </button>
                        {showCustomPicker && (
                            <div className="relative flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={newColor}
                                    onChange={(e) => setNewColor(e.target.value)}
                                    className="w-7 h-7 p-0 rounded-md border-2 border-slate-600 cursor-pointer overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-moz-color-swatch]:border-none"
                                />
                                <button
                                    type="button"
                                    className="flex items-center justify-center w-16 h-8 p-2 -mt-0.5 font-semibold rounded-md border-2 border-slate-600 bg-slate-900 hover:bg-slate-800 transition"
                                    onClick={() => {
                                        setCustomColors([...customColors, newColor])
                                        setShowCustomPicker(false)
                                    }}
                                >
                                    Select
                                </button>
                            </div>
                        )}
                    </div>
                )}
            />
        </div>
    )
}

export default ColorSelector