import {
  Byte,
  Color,
  Count,
  Degree,
  Frequency,
  Length,
  Percent,
  Settings,
  Shape,
  OutCircle,
  OutColor,
  OutFloat,
  OutPolygon,
  OutRectangle,
  OutObject,
  Output,
  OutSpinner,
  Angle,
} from "../../schema/schema.js";

export function generate(
  spinnerRadiusRatio: number,
  settings: Settings
): Output {
  const spinner = generateSpinner(spinnerRadiusRatio);
  const objects = generateObjects(settings);
  return {
    spinner,
    objects,
  };
}

function generateSpinner(spinnerRadiusRatio: number): OutSpinner {
  return {
    vertices: [
      posFromAngle((Math.PI / 6) * 1, spinnerRadiusRatio * 1.3),
      posFromAngle((Math.PI / 6) * 5, spinnerRadiusRatio * 1.3),
      posFromAngle((Math.PI / 6) * 9, spinnerRadiusRatio * 1.3),
      posFromAngle((Math.PI / 6) * 0.999, spinnerRadiusRatio * 1.3),
      posFromAngle((Math.PI / 6) * 0.999, spinnerRadiusRatio),
      posFromAngle((Math.PI / 6) * 9, spinnerRadiusRatio),
      posFromAngle((Math.PI / 6) * 5, spinnerRadiusRatio),
      posFromAngle((Math.PI / 6) * 1, spinnerRadiusRatio),
    ],
  };
}
function generateObjects(settings: Settings): OutObject[] {
  const objects: OutObject[] = [];
  for (const object of settings.objects) {
    for (let i = 0; i < generateInt(object.count); i++) {
      objects.push(generateObject(object.shape));
    }
  }
  objects.sort(() => Math.random() - 0.5);
  return objects;
}
function generateObject(shape: Shape): OutObject {
  if (shape.type === "circle") {
    const circle: OutCircle = {
      type: "circle",
      radius: generateFloat(shape.radius),
      fill: shape.fill != null ? generateColor(shape.fill) : "transparent",
      stroke:
        shape.stroke != null ? generateColor(shape.stroke) : "transparent",
      strokeWidth:
        shape.strokeWidth != null ? generateFloat(shape.strokeWidth) : 0,
    };
    return circle;
  } else if (shape.type === "rectangle") {
    const rectangle: OutRectangle = {
      type: "rectangle",
      width: generateFloat(shape.width),
      height: generateFloat(shape.height),
      fill: shape.fill != null ? generateColor(shape.fill) : "transparent",
      stroke:
        shape.stroke != null ? generateColor(shape.stroke) : "transparent",
      strokeWidth:
        shape.strokeWidth != null ? generateFloat(shape.strokeWidth) : 0,
    };
    return rectangle;
  } else {
    const polygon: OutPolygon = {
      type: "polygon",
      sides: generateInt(shape.sides),
      radius: generateFloat(shape.radius),
      fill: shape.fill != null ? generateColor(shape.fill) : "transparent",
      stroke:
        shape.stroke != null ? generateColor(shape.stroke) : "transparent",
      strokeWidth:
        shape.strokeWidth != null ? generateFloat(shape.strokeWidth) : 0,
    };
    return polygon;
  }
}
function generateInt(value: Count): number {
  if (typeof value === "number") {
    return value;
  } else {
    return randomInt(value.min, value.max);
  }
}
function generateFloat(value: Length | Byte | Degree | Percent): OutFloat {
  if (typeof value === "number") {
    return value;
  } else if ("frequency" in value) {
    return {
      frequency: generateFrequency(value.frequency),
      angle: generateAngle(value.angle),
      offset: generateFloat(value.offset),
      amplitude: generateFloat(value.amplitude),
    };
  } else {
    return randomFloat(value.min, value.max);
  }
}
function generateFrequency(frequency: Frequency): number {
  if (typeof frequency === "number") {
    return frequency;
  } else {
    return randomFloat(frequency.min, frequency.max);
  }
}
function generateAngle(angle: Angle | undefined): number {
  if (angle == null) {
    return randomFloat(0, Math.PI * 2);
  } else if (typeof angle === "number") {
    return angle * ((2 * Math.PI) / 360);
  } else {
    return randomFloat(angle.min, angle.max) * ((2 * Math.PI) / 360);
  }
}
export function generateColor(color: Color): OutColor {
  if (typeof color === "string") {
    return color;
  } else if (Array.isArray(color)) {
    return generateColor(color[Math.floor(Math.random() * color.length)]);
  } else if (color.type === "rgb") {
    return {
      type: "rgb",
      r: generateFloat(color.r),
      g: generateFloat(color.g),
      b: generateFloat(color.b),
    };
  } else if (color.type === "hsl") {
    return {
      type: "hsl",
      h: generateFloat(color.h),
      s: generateFloat(color.s),
      l: generateFloat(color.l),
    };
  } else {
    return {
      type: "rgb",
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };
  }
}
function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
function posFromAngle(angle, radius) {
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}
