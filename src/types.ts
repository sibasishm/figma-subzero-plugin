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
  Grid = 'Grid',
  Link = 'Link',
  List = 'List',
  ListItem = 'ListItem',
  Menu = 'Menu',
  MenuItem = 'MenuItem',
  Tabs = 'Tabs',
  Tab = 'Tab'
}

// Subzero specific props mapping
export interface SubzeroProps {
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'text.primary' | 'text.secondary';
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'button' | 'caption' | 'overline' |
  'text' | 'contained' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  spacing?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  gutterBottom?: boolean;
  noWrap?: boolean;
}
