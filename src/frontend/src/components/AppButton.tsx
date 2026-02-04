import { forwardRef, ComponentPropsWithoutRef } from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

type AppButtonProps = ComponentPropsWithoutRef<typeof Button>;

const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn('app-button', className)}
        {...props}
      />
    );
  }
);

AppButton.displayName = 'AppButton';

export default AppButton;
