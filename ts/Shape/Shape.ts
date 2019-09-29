import * as PIXI from 'pixi.js';
import { Vector2 } from '../Vector2/Vector2';
import { Bodies, Body } from 'matter-js';
export { ParticleOption, Particle, Shape, Circle, Rect, Star }

/* パーティクル設定値IF */
interface ParticleOption {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    radius?: number;
    fillValue?: number;
    alpha?: number;
    life?: number;
    shapeType?: number;
    points?: number;
    blendMode?: number;
    type?: number;
    v?: Vector2;
}

class Particle extends PIXI.Container {
    protected graphics: Shape;
    fillValue: number;
    maxLife: number;
    life: number;
    v: Vector2;
    body?: Body;

    constructor(option?: ParticleOption) {
        super();

        option = option || {};
        this.maxLife = this.life = Math.floor(option.life || 60);
        this.life = this.maxLife;
        this.v = option.v || new Vector2(0, 0);
        this.x = option.x || 0;
        this.y = option.y || 0;
        this.width = option.width || 10;
        this.height = option.height || 10;
        option.type = option.type == 0 ? 0 : option.type || PIXI.SHAPES.RECT;

        if (option.type === PIXI.SHAPES.POLY) {
            this.graphics = new Star(option);
        } else if (option.type === PIXI.SHAPES.RECT) {
            this.graphics = new Rect(option);
        } else {
            this.graphics = new Circle(option);
        }
        this.fillValue = this.graphics.fillValue;
    }

    public init() {
        this.addChild(this.graphics);
    }

    public attachBody(body?: Body) {
        if (!body) {
            if (this.graphics.shapeType === PIXI.SHAPES.CIRC) {
                body = Bodies.circle(this.x, this.y, this.graphics.radius);
            } else if (this.graphics.shapeType === PIXI.SHAPES.RECT) {
                body = Bodies.rectangle(this.x, this.y, this.width, this.height);
            } else if (this.graphics.shapeType === PIXI.SHAPES.POLY) {
                body = Bodies.polygon(this.x, this.y, (this.graphics as Star).points, this.graphics.radius);
            }
        }
        this.body = body;
    }

    public setFill(color: number, alpha?: number) {
        this.graphics.fillValue = this.fillValue = color;
        if (alpha) this.graphics.alpha = alpha;
        this.graphics.reRender();
    }

    public update(delta?: number): void {
        if (this.body) {
            this.x = this.body.position.x;
            this.y = this.body.position.y;
        }
    }
}

/* パーティクル描画クラス */
abstract class Shape extends PIXI.Graphics {
    radius: number;
    maxLife: number;
    life: number;
    fillValue: number;
    shapeType: number;

    private _height: number;
    get height()
    {
        return Math.abs(this.scale.y) * this._height;
    }
    set height(value)
    {
        const s = this.scale.y > 0 ? 1 : -1;

        this.scale.y = s * value / this._height;
        this._height = value;
    }

    private _width: number;
    get width()
    {
        return Math.abs(this.scale.x) * this._width;
    }
    set width(value)
    {
        const s = this.scale.x > 0 ? 1 : -1;

        this.scale.x = s * value / this._width;
        this._width = value;
    }

    constructor(option?: ParticleOption ) {
        super();
        option = option || {};
        this.x = 0;
        this.y = 0;
        this.radius = option.radius || 5;

        this._width = option.width || 10;
        this._height = option.height || 10;
        this.fillValue = option.fillValue || 0xffffff;
        this.shapeType = option.shapeType || PIXI.SHAPES.RECT;
        this.alpha = option.alpha || 1;
        this.blendMode = option.blendMode || this.blendMode;
        this.maxLife = this.life = Math.floor(option.life || 60);
    }

    public reRender() {}
}
class Circle extends Shape {
    constructor(option?: ParticleOption ) {
        super(option);
        this.shapeType = PIXI.SHAPES.CIRC;

        this.beginFill(this.fillValue, this.alpha);
        this.drawCircle(0, 0, this.radius);
        this.endFill();
    }
    public reRender(delta?: number): void {
        this.clear();
        this.beginFill(this.fillValue, this.alpha);
        this.drawCircle(0, 0, this.radius);
        this.endFill();
    }
}
class Rect extends Shape {
    constructor(option?: ParticleOption ) {
        super(option);
        this.shapeType = PIXI.SHAPES.RECT;

        const halfWidth = this.width * 0.5;
        const halfHeight = this.height * 0.5;
        this.beginFill(this.fillValue, this.alpha);
        this.drawRect(-halfWidth, -halfHeight, this.width, this.height);
        this.endFill();
    }

    public reRender(delta?: number): void {
        this.clear();
        this.beginFill(this.fillValue, this.alpha);
        this.drawRect(0, 0, this.width, this.height);
        this.endFill();
    }
}
class Star extends Shape {
    public points: number;
    
    private _innerRadius: number;
    get innerRadius(): number
    {
        return this._innerRadius;
    }
    set innerRadius(value: number)
    {
        this._innerRadius = value;
    }

    constructor(option?: ParticleOption ) {
        option = option || {};

        super(option);

        this.shapeType = PIXI.SHAPES.POLY;
        this.points = option.points || 5;
        this._innerRadius = this.radius * 0.5;

        this.beginFill(this.fillValue, this.alpha);
        this.drawStar(0, 0, this.points, this.radius, this.innerRadius, this.rotation);
        this.endFill();
    }
    public reRender(delta?: number): void {
        this.clear();
        this.beginFill(this.fillValue, this.alpha);
        this.drawStar(0, 0, this.points, this.radius, this.innerRadius, this.rotation);
        this.endFill();
    }
}
