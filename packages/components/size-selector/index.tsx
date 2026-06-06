import { Controller } from "react-hook-form"


const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

const SizeSelector = ({ control, errors }: any) => {
  return (
    <div className="mt-2">
      <label className="block font-bold text-gray-300 mb-2">Sizes</label>
      <Controller
        name="sizes"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => {
              const isSelected = (field.value || []).includes(size)

              return (
                <button
                  type="button"
                  key={size}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((s: string) => s !== size)
                        : [...(field.value || []), size]
                    )
                  }
                  className={`px-3 py-1 rounded-lg font-Poppins border transition ${
                    isSelected
                      ? "bg-slate-700 text-white border-[#ffffff6b]"
                      : "bg-slate-800 text-slate-300 border-transparent hover:bg-slate-700"
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        )}
      />
      {errors.sizes && (
        <p className="mt-1 text-red-500 text-sm font-medium">
          {errors.sizes.message as string}
        </p>
      )}
    </div>
  )
}

export default SizeSelector