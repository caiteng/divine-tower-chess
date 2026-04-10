declare module 'cc' {
  export namespace _decorator {
    export function ccclass(name: string): ClassDecorator;
    export function property(type?: unknown): PropertyDecorator;
  }

  export class Component {
    public node: Node;
  }

  export class Node {
    public children: Node[];
    public layer: number;
    public parent: Node | null;

    public constructor(name?: string);
    public addChild(child: Node): void;
    public addComponent<T>(component: new () => T): T;
    public getComponent<T>(component: new () => T): T | null;
    public removeAllChildren(): void;
    public setPosition(position: Vec3): void;
    public on(eventType: string, callback: () => void, target?: unknown): void;
  }

  export class Vec3 {
    public constructor(x?: number, y?: number, z?: number);
  }

  export class Color {
    public constructor(r?: number, g?: number, b?: number, a?: number);
  }

  export class UITransform extends Component {
    public setContentSize(width: number, height: number): void;
  }

  export class Label extends Component {
    public string: string;
    public color: Color;
    public fontSize: number;
    public lineHeight: number;
  }

  export class Graphics extends Component {
    public fillColor: Color;
    public rect(x: number, y: number, width: number, height: number): void;
    public circle(x: number, y: number, radius: number): void;
    public fill(): void;
  }

  export class Button extends Component {
    public static EventType: {
      CLICK: string;
    };
  }

  export class Sprite extends Component {
    public spriteFrame: SpriteFrame | null;
    public color: Color;
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

  export const resources: {
    load<T>(path: string, type: new () => T, callback: (err: Error | null, asset: T | null) => void): void;
  };
}
