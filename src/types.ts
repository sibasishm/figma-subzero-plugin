import { EventHandler } from '@create-figma-plugin/utilities'

export interface InsertCodeHandler extends EventHandler {
  name: 'INSERT_CODE'
  handler: (code: string) => void
}

export interface SubzeroComponent {
  type: string;
  props: Record<string, any>;
  styles: Record<string, any>;
  children?: SubzeroComponent[];
  variant?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

export interface TransformOptions {
  withStyles: boolean;
  withVariants: boolean;
  generateInterface: boolean;
  useSubzeroProps: boolean;
}

export interface MessageToUI {
  type: 'selection' | 'error';
  components?: SubzeroComponent[];
  error?: string;
  code?: string;
}

export interface MessageToPlugin {
  type: 'transform';
  options: TransformOptions;
}

// Subzero component types mapping
export enum SubzeroComponentType {
  Button = 'Button',
  Typography = 'Typography',
  Box = 'Box',
  Stack = 'Stack',
  Card = 'Card',
  IconButton = 'IconButton',
  TextField = 'TextField',
  Select = 'Select',
  Checkbox = 'Checkbox',
  Radio = 'Radio',
  Switch = 'Switch',
  Divider = 'Divider',
  Paper = 'Paper',
  Container = 'Container',
  Grid = 'Grid'
}

// Subzero specific props mapping
export interface SubzeroProps {
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  variant?: 'text' | 'contained' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  elevation?: number;
  spacing?: number | string;
  direction?: 'row' | 'column';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
}
