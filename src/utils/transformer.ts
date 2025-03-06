import { SubzeroComponent, SubzeroComponentType, SubzeroProps } from '../types';

// Subzero spacing tokens (in pixels)
const SPACING_TOKENS = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40
};

// Subzero color tokens
const COLOR_TOKENS = {
  primary: {
    main: '#0c8ce9',
    light: '#7cc4f8',
    dark: '#0a6dc2'
  },
  secondary: {
    main: '#8a38f5',
    light: '#d1a8ff',
    dark: '#652ca8'
  },
  error: {
    main: '#e03e1a',
    light: '#fca397',
    dark: '#96332'
  },
  warning: {
    main: '#f3c11b',
    light: '#f7d15f',
    dark: '#e4a711'
  },
  success: {
    main: '#198f51',
    light: '#79d297',
    dark: '#0a5c35'
  },
  text: {
    primary: '#ffffff',
    secondary: '#ffffffb2'
  }
};

const SUBZERO_MAPPING: Record<string, SubzeroComponentType> = {
  RECTANGLE: SubzeroComponentType.Box,
  TEXT: SubzeroComponentType.Typography,
  GROUP: SubzeroComponentType.Stack,
  INSTANCE: SubzeroComponentType.Button,
  FRAME: SubzeroComponentType.Container,
  COMPONENT: SubzeroComponentType.Box,
  COMPONENT_SET: SubzeroComponentType.Grid,
};

const detectTypographyVariant = (element: TextNode): SubzeroProps['variant'] => {
  const fontSize = Number(element.fontSize);
  const fontWeight = Number(element.fontWeight);

  if (fontSize >= 96) return 'h1';
  if (fontSize >= 60) return 'h2';
  if (fontSize >= 48) return 'h3';
  if (fontSize >= 34) return 'h4';
  if (fontSize >= 24) return 'h5';
  if (fontSize >= 20) return 'h6';
  if (fontSize >= 16) {
    if (fontWeight >= 500) return 'subtitle1';
    return 'body1';
  }
  if (fontSize >= 14) {
    if (fontWeight >= 500) return 'subtitle2';
    return 'body2';
  }
  if (fontSize >= 12) return 'caption';
  return 'body2';
};

const detectComponentType = (element: SceneNode): SubzeroComponentType => {
  if (element.type === 'TEXT') {
    return SubzeroComponentType.Typography;
  }

  if (element.type === 'INSTANCE') {
    const name = element.name.toLowerCase();
    if (name.includes('button')) return SubzeroComponentType.Button;
    if (name.includes('input') || name.includes('textfield')) return SubzeroComponentType.TextField;
    if (name.includes('select')) return SubzeroComponentType.Select;
    if (name.includes('checkbox')) return SubzeroComponentType.Checkbox;
    if (name.includes('radio')) return SubzeroComponentType.Radio;
    if (name.includes('switch')) return SubzeroComponentType.Switch;
    if (name.includes('card')) return SubzeroComponentType.Card;
    if (name.includes('paper')) return SubzeroComponentType.Paper;
    if (name.includes('divider')) return SubzeroComponentType.Divider;
    if (name.includes('list')) return SubzeroComponentType.List;
    if (name.includes('menu')) return SubzeroComponentType.Menu;
    if (name.includes('tab')) return SubzeroComponentType.Tabs;
    if (name.includes('link')) return SubzeroComponentType.Link;
  }

  if (element.type === 'GROUP' || element.type === 'FRAME') {
    if ('layoutMode' in element) {
      return SubzeroComponentType.Stack;
    }
  }

  return SUBZERO_MAPPING[element.type] || SubzeroComponentType.Box;
};

const mapSpacing = (value: number): SubzeroProps['spacing'] => {
  const closest = Object.entries(SPACING_TOKENS).reduce((prev, [token, pixels]) => {
    return Math.abs(pixels - value) < Math.abs(pixels - prev.pixels)
      ? { token: Number(token), pixels }
      : prev;
  }, { token: 1, pixels: SPACING_TOKENS[1] });

  return closest.token as SubzeroProps['spacing'];
};

const findClosestColor = (figmaColor: RGB): SubzeroProps['color'] => {
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexColor = rgbToHex(figmaColor.r, figmaColor.g, figmaColor.b);

  // Compare with our color tokens
  type ColorKey = keyof typeof COLOR_TOKENS;

  const colorMatches = Object.entries(COLOR_TOKENS).map(([name, variants]) => {
    if (name === 'text') {
      const textVariants = variants as typeof COLOR_TOKENS['text'];
      if (hexColor === textVariants.primary) return 'text.primary';
      if (hexColor === textVariants.secondary) return 'text.secondary';
      return null;
    }

    const colorVariants = variants as { main: string; light: string; dark: string };
    if (hexColor === colorVariants.main) return name as ColorKey;
    if (hexColor === colorVariants.light) return name as ColorKey;
    if (hexColor === colorVariants.dark) return name as ColorKey;
    return null;
  }).filter(Boolean);

  return (colorMatches[0] || 'primary') as SubzeroProps['color'];
};

const extractSubzeroProps = (element: SceneNode): Partial<SubzeroProps> => {
  const props: Partial<SubzeroProps> = {};

  // Handle fills for color
  if ('fills' in element && Array.isArray(element.fills) && element.fills.length > 0) {
    const fill = element.fills[0];
    if (fill.type === 'SOLID' && fill.color) {
      props.color = findClosestColor(fill.color);
    }
  }

  if ('componentProperties' in element) {
    const componentProps = element.componentProperties;

    // Extract variant
    if ('variant' in componentProps) {
      const variantValue = String(componentProps.variant.value);
      props.variant = variantValue as SubzeroProps['variant'];
    }

    // Extract color from component properties if not already set
    if ('color' in componentProps && !props.color) {
      const colorValue = String(componentProps.color.value);
      props.color = colorValue as SubzeroProps['color'];
    }

    // Extract size
    if ('size' in componentProps) {
      props.size = String(componentProps.size.value) as SubzeroProps['size'];
    }

    // Extract other boolean props
    if ('fullWidth' in componentProps) {
      props.fullWidth = componentProps.fullWidth.value === 'true';
    }
    if ('disabled' in componentProps) {
      props.disabled = componentProps.disabled.value === 'true';
    }
  }

  // Handle text properties
  if ('characters' in element) {
    props.variant = detectTypographyVariant(element);
    if ('textAlignHorizontal' in element) {
      props.textAlign = element.textAlignHorizontal.toLowerCase() as SubzeroProps['textAlign'];
    }
  }

  // Handle layout properties
  if ('layoutMode' in element) {
    props.direction = element.layoutMode === 'HORIZONTAL' ? 'row' : 'column';

    if ('itemSpacing' in element) {
      props.spacing = mapSpacing(element.itemSpacing);
    }

    if ('primaryAxisAlignItems' in element) {
      props.justifyContent = element.primaryAxisAlignItems.toLowerCase() as SubzeroProps['justifyContent'];
    }

    if ('counterAxisAlignItems' in element) {
      props.alignItems = element.counterAxisAlignItems.toLowerCase() as SubzeroProps['alignItems'];
    }
  }

  return props;
};

export const transformFigmaElement = (element: SceneNode): SubzeroComponent | null => {
  const type = detectComponentType(element);
  const subzeroProps = extractSubzeroProps(element);

  const baseProps: Record<string, any> = {
    ...subzeroProps,
    id: element.id,
    name: element.name,
  };

  // Handle text content
  if ('characters' in element) {
    baseProps.children = element.characters;
  }

  const children = 'children' in element && element.children ?
    element.children.map(child => transformFigmaElement(child)).filter((child): child is SubzeroComponent => child !== null) :
    undefined;

  return {
    type,
    props: baseProps,
    styles: {},  // We'll use Subzero's built-in props instead of sx
    children
  };
};

export const generateCode = (component: SubzeroComponent): string => {
  const { type, props, children } = component;

  // Filter out internal props but keep the text content
  const { id, name, ...componentProps } = props;

  const propsString = Object.entries(componentProps)
    .filter(([key]) => key !== 'children') // Filter out children from props
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}="${value}"`;
      if (typeof value === 'boolean') return value ? key : '';
      return `${key}={${value}}`;
    })
    .filter(Boolean)
    .join(' ');

  // Handle text content from props.children
  if (componentProps.children && typeof componentProps.children === 'string') {
    return `<${type} ${propsString}>${componentProps.children}</${type}>`;
  }

  // Handle nested components
  if (children) {
    if (Array.isArray(children)) {
      const childrenCode = children.map(child => generateCode(child)).join('\n');
      return `<${type} ${propsString}>\n${childrenCode}\n</${type}>`;
    }
    return `<${type} ${propsString}>${children}</${type}>`;
  }

  return `<${type} ${propsString} />`;
}; 