import { cn } from '@/lib/utils'

export function OptionPicker<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-2">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            data-testid={`opt-${opt}`}
            className={cn(
              'border rounded-md px-3 py-1 text-xs transition',
              value === opt
                ? 'border-black bg-black text-white font-bold'
                : 'border-zinc-300 bg-white text-zinc-700',
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
