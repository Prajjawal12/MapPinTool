import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// Define button variants and styles with a fresh aesthetic
const buttonVariants = cva(
  'flex items-center justify-center gap-4 rounded-lg text-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow-lg hover:from-teal-400 hover:to-teal-300 active:scale-95',
        danger:
          'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg hover:from-red-400 hover:to-red-300 active:scale-95',
        outline:
          'border border-gray-300 bg-white text-gray-700 shadow hover:bg-gray-100 active:scale-95',
        success:
          'bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg hover:from-green-400 hover:to-green-300 active:scale-95',
        subtle: 'text-gray-600 hover:bg-gray-200 active:scale-95',
      },
      size: {
        small: 'h-9 px-4 text-sm',
        medium: 'h-10 px-6',
        large: 'h-12 px-10 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean; // Add a loading state
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading} // Disable button when loading
        {...props}
      >
        {loading ? (
          <span className="loader animate-spin">
            {' '}
            {/* Loader with spin effect */}
            {/* Optionally, you can use an SVG icon or any loading animation here */}
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
