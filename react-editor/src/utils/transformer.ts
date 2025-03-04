import { SubzeroComponent, SubzeroComponentType } from '../types';

interface StyleProps {
  bgcolor?: string;
  fontSize?: number;
  fontWeight?: number;
  width?: number;
  height?: number;
  [key: string]: any;
}

const SUBZERO_MAPPING: Record<string, SubzeroComponentType> = {
  RECTANGLE: SubzeroComponentType.Box,
  TEXT: SubzeroComponentType.Typography,
  GROUP: SubzeroComponentType.Stack,
  INSTANCE: SubzeroComponentType.Button, // For component instances
};

export const transformFigmaElement = (element: SceneNode): SubzeroComponent | null => {
  const type = SUBZERO_MAPPING[element.type] || SubzeroComponentType.Box;

  const baseProps: Record<string, any> = {
    id: element.id,
    name: element.name,
  };

  const styles: Record<string, any> = {
    width: element.width,
    height: element.height,
  };

  if ('fills' in element && Array.isArray(element.fills) && element.fills.length > 0) {
    const fill = element.fills[0];
    if (fill?.type === 'SOLID') {
      styles.backgroundColor = `rgba(${fill.color.r * 255}, ${fill.color.g * 255}, ${fill.color.b * 255}, ${fill.opacity || 1})`;
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

  // Handle component variants
  if (element.type === 'INSTANCE') {
    const componentProps = Object.entries(element.componentProperties || {}).reduce((acc: Record<string, any>, [key, value]) => {
      acc[key] = value.value;
      return acc;
    }, {});
    Object.assign(baseProps, componentProps);
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

  const propsString = Object.entries(props)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  const styleProps = Object.entries(styles).reduce<StyleProps>((acc, [key, value]) => {
    // Convert to MUI/Subzero style props where possible
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