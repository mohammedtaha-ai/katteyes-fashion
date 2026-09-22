import * as React from 'react'
import * as ScrollAreaPrimitive from 'radix-ui'
import { cn } from '@/lib/utils'

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollArea.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollArea.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollArea.Root
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollArea.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.ScrollArea.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.ScrollArea.Corner />
  </ScrollAreaPrimitive.ScrollArea.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.ScrollArea.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollArea.Scrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollArea.Scrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollArea.Scrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-[1px]',
      orientation === 'horizontal' &&
        'h-2.5 flex-col border-t border-t-transparent p-[1px]',
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollArea.Thumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollArea.Scrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollArea.Scrollbar.displayName

export { ScrollArea, ScrollBar }
