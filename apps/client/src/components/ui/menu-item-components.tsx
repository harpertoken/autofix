import * as React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemProps extends React.HTMLAttributes<HTMLElement> {
  inset?: boolean;
}

export function createMenuItem(ItemPrimitive: React.ComponentType<any>) {
  const MenuItem = React.forwardRef<HTMLElement, MenuItemProps>(
    ({ className, inset, ...props }, ref) => (
      <ItemPrimitive
        ref={ref}
        className={cn(
          'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          inset && 'pl-8',
          className
        )}
        {...props}
      />
    )
  );
  MenuItem.displayName = (ItemPrimitive as any).displayName || 'MenuItem';
  return MenuItem;
}

export function createMenuCheckboxItem(
  CheckboxItemPrimitive: any,
  ItemIndicatorPrimitive: any
) {
  const MenuCheckboxItem = React.forwardRef<
    any,
    React.ComponentPropsWithoutRef<any>
  >(({ className, children, checked, ...props }, ref) => (
    <CheckboxItemPrimitive
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ItemIndicatorPrimitive>
          <Check className="h-4 w-4" />
        </ItemIndicatorPrimitive>
      </span>
      {children}
    </CheckboxItemPrimitive>
  ));
  MenuCheckboxItem.displayName =
    (CheckboxItemPrimitive as any).displayName || 'MenuCheckboxItem';
  return MenuCheckboxItem;
}

export function createMenuRadioItem(
  RadioItemPrimitive: any,
  ItemIndicatorPrimitive: any
) {
  const MenuRadioItem = React.forwardRef<
    any,
    React.ComponentPropsWithoutRef<any>
  >(({ className, children, ...props }, ref) => (
    <RadioItemPrimitive
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ItemIndicatorPrimitive>
          <Circle className="h-2 w-2 fill-current" />
        </ItemIndicatorPrimitive>
      </span>
      {children}
    </RadioItemPrimitive>
  ));
  MenuRadioItem.displayName =
    (RadioItemPrimitive as any).displayName || 'MenuRadioItem';
  return MenuRadioItem;
}

export function createMenuLabel(LabelPrimitive: any, labelClass: string) {
  const MenuLabel = React.forwardRef<
    any,
    React.ComponentPropsWithoutRef<any> & { inset?: boolean }
  >(({ className, inset, ...props }, ref) => (
    <LabelPrimitive
      ref={ref}
      className={cn(labelClass, inset && 'pl-8', className)}
      {...props}
    />
  ));
  MenuLabel.displayName = (LabelPrimitive as any).displayName || 'MenuLabel';
  return MenuLabel;
}
