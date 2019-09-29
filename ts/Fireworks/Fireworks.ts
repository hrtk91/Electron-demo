import * as PIXI from 'pixi.js'
import { Particle, ParticleOption } from '../Shape/Shape'
import { Vector2 } from '../Vector2/Vector2'

export { Fireworks }

class Ball extends Particle {
    constructor(option: ParticleOption) {
        super(option);
    }

    public update(delta: number): void {
        this.x += this.v.x;
        this.y += this.v.y;

        this.life -= delta;
        this.scale.y = this.scale.x = this.alpha = this.life / this.maxLife;
        if (this.life < 0) {
            this.parent.removeChild(this);
        }
    }
}

class Fireworks extends Particle {
    fillValue: number
    flowerRadius: number
    flowerNum: number
    outers: PIXI.Container
    inners: PIXI.Container

    constructor(option: any) {
        option = option || {};
        super(option);
        this.fillValue = option.fillValue || 0xaaa;
        this.flowerRadius = option.flowerRadius || 1.5;
        this.flowerNum = option.flowerNum || 30;
        this.outers = new PIXI.Container();
        this.inners = new PIXI.Container();
    }

    public init() {
        super.init();
        this.addChild(this.outers);
        this.addChild(this.inners);
    }

    public outer(outers: PIXI.Container) {
        const baserad = (2 * Math.PI) / this.outers.children.length;
        this.outers.children.forEach((p, i, ary) => {
            (p as Particle).v = new Vector2(Math.cos(i * baserad), Math.sin(i * baserad));
            (p as Particle).v.normalize();
            (p as Particle).v.mul(this.flowerRadius);
        });
    }

    public createOuters(option: any) {
        option = option || {};
        const flowersNum = option.num;
        for (var i = 0; i < flowersNum; i++) {
            var p = new Ball({
                type: PIXI.SHAPES.CIRC,
                life: 100,
                fillValue: this.fillValue,
                blendMode: PIXI.BLEND_MODES.ADD,
                radius: option.radius || 3
            });
            p.init();
            this.outers.addChild(p);
        }
        return this.outers;
    }
    public inner(inners: PIXI.Container) {
        const baserad = (2 * Math.PI) / this.inners.children.length;
        this.inners.children.forEach((p, i: number, ary: any[]) => {
            (p as Particle).v = new Vector2(Math.cos(i * baserad), Math.sin(i * baserad));
            (p as Particle).v.normalize();
            (p as Particle).v.mul(Math.random() * this.flowerRadius);
        });
    }

    public createInners(option: any) {
        option = option || {};
        const flowerNum = option.num;
        for (var i = 0; i < flowerNum; i++) {
            var p = new Ball({
                type: PIXI.SHAPES.CIRC,
                life: 100,
                fillValue: this.fillValue >> 1,
                blendMode: PIXI.BLEND_MODES.ADD,
                radius: option.radius || 5
            });
            p.init();
            this.inners.addChild(p);
        }
        return this.inners;
    }

    public explosion() {
        const flowerNum = this.flowerNum;
        this.createOuters({num:flowerNum >> 4});
        this.createInners({num:flowerNum});
        this.outer(this.outers);
        this.inner(this.inners);
    }

    public update(delta: number) {
        super.update(delta);
        if (this.life-- == 0) {
            this.graphics.alpha = 0;
            this.explosion();
        }
        else if (this.life < 0) {
            this.life = -1;
            if (this.outers.children.length < 1 && this.inners.children.length < 1) {
                this.parent.removeChild(this);
            } else {
                this.outers.children.forEach((p) => {
                    (p as Ball).update(delta);
                });
                this.inners.children.forEach((p) => {
                    (p as Ball).update(delta);
                });
            }
        }
        else {
            this.x += this.v.x;
            this.y += this.v.y;
        }
    }
}
