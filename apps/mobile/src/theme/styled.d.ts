import 'styled-components/native';
import type { AppTheme } from './index';

declare module 'styled-components/native' {
  export interface DefaultTheme extends AppTheme {}
}
