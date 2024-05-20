import type { CSSProperties, ReactElement } from 'react';

import type { ThemeColor, ThemeIconSize } from '../types';

import s from './SvgIcon.module.scss';

type Props = {
  color?: ThemeColor;
  icon: ReactElement;
  noFill?: boolean;
  noStroke?: boolean;
  size?: ThemeIconSize;
  style?: CSSProperties;
};

export const SvgIcon = ({ color = 'current', icon, noFill, noStroke, size = 's', style }: Props) => {
  return (
    <div
      className={s.svgIcon}
      data-size={size}
      data-no-fill={noFill}
      data-no-stroke={noStroke}
      style={{
        color: color ? (color === 'current' ? 'currentColor' : `var(--${color})`) : undefined,
        ...style,
      }}
    >
      {icon}
    </div>
  );
};
