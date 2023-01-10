import { css, cx, injectGlobal, type CSSObject } from '@emotion/css';
import type { Emotion } from '@emotion/css/create-instance';
import { useMemo } from 'react';

import { useTheme } from '@/hooks';
import {
  CommonStyleUtils,
  FullStylish,
  FullToken,
  ReturnStyleToUse,
  StyleDefinition,
  Theme,
  ThemeAppearance,
} from '@/types';

export interface CreateStylesTheme extends CommonStyleUtils {
  token: FullToken;
  stylish: FullStylish;
  appearance: ThemeAppearance;
}

/**
 * 最终返回 styles 对象的类型定义
 */
export interface ReturnStyles<Obj> {
  styles: ReturnStyleToUse<Obj>;
  theme: Theme;
  cx: Emotion['cx'];
}

// 获取样式
export type GetStyleFn<Input> = <P>(theme: CreateStylesTheme, props?: P) => StyleDefinition<Input>;

/**
 * 创建样式的函数或者对象
 */
export type StyleOrGetStyleFn<Input> = Input extends (...args: any[]) => any
  ? StyleDefinition<Input>
  : GetStyleFn<Input>;

/**
 * 业务应用中创建样式基础写法
 */
export const createStyles =
  <Input>(styleOrGetStyleFn: StyleOrGetStyleFn<Input>) =>
  <P>(props?: P): ReturnStyles<Input> => {
    const theme = useTheme();

    // FIXME：如何收敛类型？ How to fix types?
    // @ts-ignore
    return useMemo<ReturnStyles<Input>>(() => {
      let styles;

      if (styleOrGetStyleFn instanceof Function) {
        const { stylish, appearance, ...token } = theme;

        styles = styleOrGetStyleFn({ token, stylish, appearance, cx, css, injectGlobal }, props);
      } else {
        styles = styleOrGetStyleFn;
      }

      if (typeof styles === 'object') {
        styles = Object.fromEntries(
          Object.entries(styles).map(([key, value]) => {
            if (typeof value === 'object') {
              return [key, css(value as CSSObject)];
            }

            return [key, value];
          }),
        );
      }

      return {
        styles,
        cx,
        theme,
      };
    }, [theme, props]);
  };
