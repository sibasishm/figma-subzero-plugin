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
}

export interface TransformOptions {
  withStyles: boolean;
  withVariants: boolean;
  generateInterface: boolean;
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
  // Add more as needed
}
