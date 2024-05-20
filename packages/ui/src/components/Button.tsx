import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactElement } from 'react';
import { forwardRef } from 'react';
import s from './Button.module.scss';

type Fill = 'solid' | 'outline' | 'ghost';
type Size = 'small' | 'default' | 'large';
type Variant = 'primary' | 'secondary' | 'affirmative' | 'destructive';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> & {
  disabled?: boolean;
  fill?: Fill;
  href?: string;
  target?: string;
  icon?: ReactElement; // TODO
  iconLeft?: ReactElement; // TODO
  iconRight?: ReactElement; // TODO
  label: string;
  loading?: boolean;
  size?: Size;
  type?: 'button' | 'submit';
  variant?: Variant;
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      className = '',
      disabled,
      fill = 'solid',
      href,
      icon,
      iconLeft,
      iconRight,
      label,
      loading,
      size = 'default',
      type = 'button',
      variant = 'primary',
      ...forwardedProps
    },
    ref,
  ) => {
    const conditionalAttributes: Record<string, unknown> = href
      ? {
          href,
        }
      : {
          type,
          disabled: disabled || loading,
        };

    if (icon) {
      conditionalAttributes['aria-label'] = label;
    }

    const ButtonElement: any = href ? Link : 'button';

    return (
      <ButtonElement
        className={`${s.button} ${className}`}
        data-icon={!!icon}
        data-fill={fill}
        data-loading={loading}
        data-size={size}
        data-variant={variant}
        ref={ref}
        {...conditionalAttributes}
        {...forwardedProps}
      >
        <span className={s.inner}>
          {icon ? (
            <span className={s.icon}>{icon}</span>
          ) : (
            <>
              {iconLeft && <span className={s.icon}>{iconLeft}</span>}
              <span className={s.label}>{label}</span>
              {iconLeft && <span className={s.icon}>{iconRight}</span>}
            </>
          )}
        </span>
      </ButtonElement>
    );
  },
);

Button.displayName = 'Button';
