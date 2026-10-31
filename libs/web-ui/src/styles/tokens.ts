import { buttonVariants } from '../atoms/button';
import { inputVariants } from '../atoms/input';

/** The classes the forms and tables share, so an input or a button looks the same on every page. They come from the atoms' variants. */
export const inputClass = inputVariants({ shape: 'pill' });
export const buttonClass = buttonVariants({ variant: 'outline' });
export const primaryButtonClass = buttonVariants({ variant: 'primary' });
