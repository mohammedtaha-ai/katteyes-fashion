import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-bold transition disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand-accent text-white hover:bg-black',
        ghost: 'bg-transparent text-black hover:bg-zinc-100',
        outline: 'border border-zinc-300 text-black hover:bg-zinc-50',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = ({ className, variant, size, ...props }: ButtonProps) => (
  <button
    className={cn(buttonVariants({ variant, size }), className)}
    {...props}
  />
)
