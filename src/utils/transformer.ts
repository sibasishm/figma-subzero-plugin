import { SubzeroComponent, SubzeroComponentType, SubzeroProps } from '../types';

interface StyleProps {
  bgcolor?: string;
  fontSize?: number;
  fontWeight?: number;
  width?: number;
  height?: number;
  p?: number | string;
  m?: number | string;
  [key: string]: any;
}

const SUBZERO_MAPPING: Record<string, SubzeroComponentType> = {
  RECTANGLE: SubzeroComponentType.Box,
  TEXT: SubzeroComponentType.Typography,
  GROUP: SubzeroComponentType.Stack,
  INSTANCE: SubzeroComponentType.Button,
  FRAME: SubzeroComponentType.Container,
  COMPONENT: SubzeroComponentType.Box,
  COMPONENT_SET: SubzeroComponentType.Grid,
};

const detectComponentType = (element: SceneNode): SubzeroComponentType => {
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
  }
  return SUBZERO_MAPPING[element.type] || SubzeroComponentType.Box;
};

const extractSubzeroProps = (element: SceneNode): Partial<SubzeroProps> => {
  const props: Partial<SubzeroProps> = {};

  if ('componentProperties' in element) {
    const componentProps = element.componentProperties;

    // Extract variant
    if ('variant' in componentProps) {
      const variantValue = String(componentProps.variant.value);
      if (['text', 'contained', 'outlined'].includes(variantValue)) {
        props.variant = variantValue as SubzeroProps['variant'];
      }
    }

    // Extract color
    if ('color' in componentProps) {
      const colorValue = String(componentProps.color.value);
      if (['primary', 'secondary', 'error', 'warning', 'info', 'success'].includes(colorValue)) {
        props.color = colorValue as SubzeroProps['color'];
      }
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

  const styles: Record<string, any> = {
    width: element.width,
    height: element.height,
  };

  // Handle layout properties
  if ('layoutMode' in element) {
    if (element.layoutMode === 'HORIZONTAL') {
      baseProps.direction = 'row';
    } else if (element.layoutMode === 'VERTICAL') {
      baseProps.direction = 'column';
    }

    if ('itemSpacing' in element) {
      baseProps.spacing = element.itemSpacing;
    }

    if ('primaryAxisAlignItems' in element) {
      baseProps.justifyContent = element.primaryAxisAlignItems.toLowerCase();
    }

    if ('counterAxisAlignItems' in element) {
      baseProps.alignItems = element.counterAxisAlignItems.toLowerCase();
    }
  }

  if ('fills' in element && Array.isArray(element.fills) && element.fills.length > 0) {
    const fill = element.fills[0];
    if (fill?.type === 'SOLID') {
      styles.bgcolor = `rgba(${fill.color.r * 255}, ${fill.color.g * 255}, ${fill.color.b * 255}, ${fill.opacity || 1})`;
    }
  }

  if ('strokes' in element && element.strokes.length > 0) {
    const stroke = element.strokes[0];
    if (stroke?.type === 'SOLID') {
      styles.border = `${String(element.strokeWeight)}px solid rgba(${stroke.color.r * 255}, ${stroke.color.g * 255}, ${stroke.color.b * 255}, ${stroke.opacity || 1})`;
    }
  }

  if ('characters' in element) {
    baseProps.children = element.characters;
    if ('fontSize' in element) {
      styles.fontSize = element.fontSize;
    }
    if ('fontWeight' in element) {
      styles.fontWeight = element.fontWeight;
    }
  }

  // Handle padding and margin
  if ('paddingTop' in element) {
    styles.p = Math.max(element.paddingTop, element.paddingRight, element.paddingBottom, element.paddingLeft);
  }

  const children = 'children' in element && element.children ?
    element.children.map(child => transformFigmaElement(child)).filter((child): child is SubzeroComponent => child !== null) :
    undefined;

  return {
    type,
    props: baseProps,
    styles,
    children
  };
};

export const generateCode = (component: SubzeroComponent): string => {
  const { type, props, styles, children } = component;

  // Filter out props that should be in sx
  const { id, name, children: _, ...componentProps } = props;

  const propsString = Object.entries(componentProps)
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}="${value}"`;
      if (typeof value === 'boolean') return value ? key : '';
      return `${key}={${value}}`;
    })
    .filter(Boolean)
    .join(' ');

  const styleProps = Object.entries(styles).reduce<StyleProps>((acc, [key, value]) => {
    if (key === 'backgroundColor') acc.bgcolor = value;
    else if (key === 'fontSize') acc.fontSize = value;
    else if (key === 'fontWeight') acc.fontWeight = value;
    else acc[key] = value;
    return acc;
  }, {});

  const styleString = Object.keys(styleProps).length ?
    ` sx={${JSON.stringify(styleProps, null, 2)}}` : '';

  if (children) {
    if (Array.isArray(children)) {
      const childrenCode = children.map(child => generateCode(child)).join('\n');
      return `<${type} ${propsString}${styleString}>\n${childrenCode}\n</${type}>`;
    }
    return `<${type} ${propsString}${styleString}>${children}</${type}>`;
  }

  return `<${type} ${propsString}${styleString} />`;
}; 