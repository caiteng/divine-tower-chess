declare module 'cc' {
  export namespace _decorator {
    export function ccclass(name: string): ClassDecorator;
    export function property(type?: unknown): PropertyDecorator;
  }

  export class Component {
    public node: Node;
    public enabled: boolean;
  }

  export class Node {
    public static EventType: {
      TOUCH_END: string;
    };
    public children: Node[];
    public layer: number;
    public parent: Node | null;
    public active: boolean;

    public constructor(name?: string);
    public addChild(child: Node): void;
    public addComponent<T>(component: new () => T): T;
    public getComponent<T>(component: new () => T): T | null;
    public removeAllChildren(): void;
    public setPosition(position: Vec3): void;
    public on(eventType: string, callback: (...args: unknown[]) => void, target?: unknown): void;
  }

  export class Vec3 {
    public x: number;
    public y: number;
    public z: number;
    public constructor(x?: number, y?: number, z?: number);
  }

  export class Color {
    public constructor(r?: number, g?: number, b?: number, a?: number);
  }

  export class UITransform extends Component {
    public setContentSize(width: number, height: number): void;
    public convertToNodeSpaceAR(position: Vec3): Vec3;
  }

  export class UIOpacity extends Component {
    public opacity: number;
  }

  export class Label extends Component {
    public string: string;
    public color: Color;
    public fontSize: number;
    public lineHeight: number;
  }

  export class Graphics extends Component {
    public fillColor: Color;
    public strokeColor: Color;
    public lineWidth: number;
    public rect(x: number, y: number, width: number, height: number): void;
    public circle(x: number, y: number, radius: number): void;
    public moveTo(x: number, y: number): void;
    public lineTo(x: number, y: number): void;
    public fill(): void;
    public stroke(): void;
  }

  export class Button extends Component {
    public static EventType: {
      CLICK: string;
    };
  }

  export class ProgressBar extends Component {
    public static Mode: {
      HORIZONTAL: number;
    };
    public barSprite: Sprite;
    public mode: number;
    public totalLength: number;
    public progress: number;
  }

  export class Sprite extends Component {
    public static SizeMode: {
      CUSTOM: number;
    };
    public spriteFrame: SpriteFrame | null;
    public color: Color;
    public sizeMode: number;
    public trim: boolean;
  }

  export class SpriteFrame {
    public static createWithImage(imageAsset: ImageAsset): SpriteFrame;
  }

  export class ImageAsset {}

  export class Camera extends Component {
    public visibility: number;
    public orthoHeight: number;
  }

  export class Canvas extends Component {
    public cameraComponent: Camera | null;
  }

  export const Layers: {
    Enum: {
      UI_2D: number;
    };
  };

  export const director: {
    getScene(): Node | null;
  };

  export const sys: {
    localStorage: {
      getItem(key: string): string | null;
      setItem(key: string, value: string): void;
      removeItem(key: string): void;
    };
  };

  export const resources: {
    load<T>(path: string, type: new () => T, callback: (err: Error | null, asset: T | null) => void): void;
  };

  export class Tween<T> {
    public to(duration: number, props: Partial<T>): Tween<T>;
    public start(): void;
    public static stopAllByTarget(target: unknown): void;
  }

  export function tween<T>(target: T): Tween<T>;
}
