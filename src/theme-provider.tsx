import { ConfigProvider } from 'antd';
import throttle from 'lodash/throttle';

import { useMemo, useState } from 'react';

import { Expression } from './expression';


export default function ThemeProvider({ children }: any) {

  const [theme, setTheme] = useState<string>('');

  const expressionChange = useMemo(
    () => throttle((expression: string) => {

      console.log(expression)
      const map: any = {
        happy: 'rgb(245, 34, 45)',
        sad: 'rgb(192, 192, 192)',
        surprised: 'rgb(250, 173, 20)',
      };

      setTheme(map[expression] ? map[expression] : 'rgb(22, 119, 255)')
    }, 1000), [])


  return (
    <ConfigProvider theme={{
      token: {
        colorPrimary: theme || 'rgb(22, 119, 255)',
      }
    }}>
      <Expression onExpressionChange={expressionChange} />
      {children}
    </ConfigProvider>
  )
}