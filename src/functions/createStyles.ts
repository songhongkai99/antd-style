import { useMemo } from 'react';
import { css, cx, type CSSObject, type Emotion } from './css';

import { useTheme } from '@/hooks';
import {
  CommonStyleUtils,
  FullStylish,
  FullToken,
  ReturnStyleToUse,
  StyleInputType,
  Theme,
  ThemeAppearance,
} from '@/types';

export interface CreateStylesTheme extends CommonStyleUtils {
  token: FullToken;
  stylish: FullStylish;
  appearance: ThemeAppearance;
  isDarkMode: boolean;
}

/**
 * 最终返回 styles 对象的类型定义
 */
export interface ReturnStyles<T extends StyleInputType> {
  styles: ReturnStyleToUse<T>;
  theme: Theme;
  cx: Emotion['cx'];
}

// 获取样式
export type GetStyleFn<Input extends StyleInputType, Props> = (
  theme: CreateStylesTheme,
  props: Props,
) => Input;

/**
 * 创建样式的函数或者对象
 */
export type StyleOrGetStyleFn<Input extends StyleInputType, Props> =
  | Input
  | GetStyleFn<Input, Props>;

/**
 * 业务应用中创建样式基础写法
 */
export const createStyles =
  <Props, Input extends StyleInputType = StyleInputType>(
    styleOrGetStyleFn: StyleOrGetStyleFn<Input, Props>,
  ) =>
  (props?: Props): ReturnStyles<Input> => {
    const theme = useTheme();

    const styles = useMemo(() => {
      let tempStyles: ReturnStyleToUse<Input>;

      if (styleOrGetStyleFn instanceof Function) {
        const { stylish, appearance, isDarkMode, ...token } = theme;

        tempStyles = styleOrGetStyleFn(
          { token, stylish, appearance, cx, css, isDarkMode },
          props!,
        ) as any;
      } else {
        tempStyles = styleOrGetStyleFn as any;
      }

      if (typeof tempStyles === 'object') {
        tempStyles = Object.fromEntries(
          Object.entries(tempStyles).map(([key, value]) => {
            if (typeof value === 'object') {
              return [key, css(value as CSSObject)];
            }

            return [key, value];
          }),
        ) as any;
      }

      return tempStyles;
    }, [styleOrGetStyleFn, props, theme]);

    return useMemo(() => ({ styles, cx, theme }), [styles, theme]);
  };
