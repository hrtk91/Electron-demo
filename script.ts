import * as PIXI from 'pixi.js';
import { Circle, Rect, Star, Shape, Particle } from './ts/Shape/Shape';
import { Fireworks } from './ts/Fireworks/Fireworks'
import { Vector2 } from './ts/Vector2/Vector2';
import { hsl } from './util';
import * as Matter from 'matter-js';

class Application {
    protected pixiApp: PIXI.Application
    protected engine: Matter.Engine
    protected touchEvent: { touched: boolean, x: number, y: number }
    protected particles: PIXI.Container
    protected fires: PIXI.Container
    protected text: PIXI.Text
    protected particleType: number
    protected pairs: { body: Matter.Body, graphic: Particle }[]
    protected count: number
    
    constructor() {
        /* PIXIアプリケーション作成 */
        const app = this.pixiApp = new PIXI.Application({
            width: 1600,
            height: 1200,
            antialias: true,
            // transparent: true,
            resolution: 1,
            autoStart: true,
        });
        app.renderer.autoResize = true;

        /* Matterエンジン作成 */
        const engine = this.engine = Matter.Engine.create();
        engine.world.gravity.x = 0;
        engine.world.gravity.y = 0;

        const ground = Matter.Bodies.rectangle(app.view.width / 2, app.view.height - 60, app.view.width, 60, { isStatic: true });
        Matter.World.add(engine.world, [
            ground,
            Matter.Bodies.rectangle(app.view.width / 2, 0, app.view.width, 1, { isStatic: true }),
            Matter.Bodies.rectangle(0, app.view.height / 2, 1, app.view.height, { isStatic: true }),
            Matter.Bodies.rectangle(app.view.width, app.view.height / 2, 1, app.view.height, { isStatic: true })
        ]);
        const gr = new PIXI.Graphics();
        gr.beginFill(hsl(0, 50, 50), 1);
        gr.drawRect(0, app.view.height - 90, app.view.width, app.view.height);
        gr.endFill();
        this.pixiApp.stage.addChild(gr);

        /* タッチイベント */
        const touchEvent = this.touchEvent = {
            touched: false as boolean,
            x: 0 as number,
            y: 0 as number
        }
        function point(evt: PIXI.interaction.InteractionEvent) {
            touchEvent.touched = true;
        }
        function touched(evt: PIXI.interaction.InteractionEvent) {
            const x = evt.data.getLocalPosition(app.stage).x;
            const y = evt.data.getLocalPosition(app.stage).y;
            touchEvent.x = x;
            touchEvent.y = y;
        }
        function release(evt: PIXI.interaction.InteractionEvent) {
            const x = evt.data.getLocalPosition(app.stage).x;
            const y = evt.data.getLocalPosition(app.stage).y;
            touchEvent.x = x;
            touchEvent.y = y;
            touchEvent.touched = false;
        }
        app.renderer.plugins.interaction.on('pointerdown', point);
        app.renderer.plugins.interaction.on('pointermove', touched);
        app.renderer.plugins.interaction.on('pointerup', release);


        /* パーティクル格納コンテナ */
        const particles = this.particles = new PIXI.Container();
        const fires = this.fires = new PIXI.Container();
        const pairs = this.pairs = [];

        const blur = new PIXI.filters.BlurFilter(0.5);
        blur.blur = 1;
        particles.filters = [blur]

        /* パーティクル数表示テキスト */
        const text = this.text = new PIXI.Text('');
        text.x = app.view.width / 2;
        text.y = app.view.height / 2;
        text.style.fill = 0xffffff;

        /* パーティクルタイプ */
        var ParticleType: number = this.particleType = PIXI.SHAPES.CIRC;

        /* パーティクル変更用テキスト */
        const shapeButton = new PIXI.Text('Shape:Circle');
        shapeButton.interactive = true;
        shapeButton.on('pointerdown', () => {
            if (this.particleType === PIXI.SHAPES.CIRC) {
                this.particleType = PIXI.SHAPES.RECT;
                shapeButton.text = 'Shape:Rectangle';
            } else if (this.particleType === PIXI.SHAPES.POLY) {
                this.particleType = PIXI.SHAPES.CIRC;
                shapeButton.text = 'Shape:Circle';
            } else if (this.particleType === PIXI.SHAPES.RECT) {
                this.particleType = PIXI.SHAPES.POLY;
                shapeButton.text = 'Shape:Star';
            } else {
                shapeButton.text = 'Shape:NONE';
            }
        });
        shapeButton.position.set(0, 0);
        shapeButton.style.fill = 0xffffff;

        app.renderer.backgroundColor = 0x061639;
        app.renderer.autoResize = true;
        this.count = 0;
        app.stage.position.set(0, 0);
        app.stage.addChild(particles);
        app.stage.addChild(fires);
        app.stage.addChild(text);
        app.stage.addChild(shapeButton);
        document.body.appendChild(app.view);
    }

    public start = () => {
        /* Main */
        Matter.Events.on(this.engine, 'afterUpdate', this.update);
        Matter.Engine.run(this.engine);
        this.pixiApp.ticker.add(this.tick);
        this.pixiApp.ticker.add(this.fireworks);
    }

    public update = (evt: { timestamp: number }): void => {
        this.pairs.forEach(pair => {
            const particle = pair.graphic;
            const body = pair.body;

            if (particle.life-- < 0) {
                particle.parent.removeChild(particle);
                Matter.World.remove(this.engine.world, body);
                this.pairs.splice(this.pairs.indexOf(pair), 1);
                return;
            }

            particle.x = body.position.x;
            particle.y = body.position.y;
            particle.rotation += body.angle;
            particle.scale.y
                = particle.scale.x
                = particle.alpha
                = particle.life / particle.maxLife;
            
            if (Math.ceil(particle.life) % 4 == 0) {
                particle.setFill(particle.fillValue, 0.5);
            }
            if (Math.ceil(particle.life) % 10 == 0) {
                particle.setFill(particle.fillValue, 1);
            }
        });
    }

    public tick = (delta: number): void => {
        if (this.touchEvent.touched) {
            for (let i = 0; i < 1; i++) {
                const options = {
                    x: this.touchEvent.x,
                    y: this.touchEvent.y,
                    type: this.particleType,
                    life: 240 + (Math.random() * this.pixiApp.ticker.FPS),
                    blendMode: PIXI.BLEND_MODES.ADD,
                    radius: this.pixiApp.view.width / 100,
                    width: this.pixiApp.view.width / 100,
                    height: this.pixiApp.view.width / 100,
                    fillValue: hsl(Math.round(Math.random() * 360), 75, 50)
                };

                const particle = new Particle(options);
                particle.init();
                particle.attachBody();
                this.particles.addChild(particle);
    
                const rad = Math.PI * (-1 + Math.random() * 2);
                if (particle.body) {
                    const body = particle.body;
                    Matter.Body.setVelocity(body, new Vector2(Math.cos(rad) * 10, Math.sin(rad) * 10));
                    body.restitution = 1;
                    body.velocity.x = Math.cos(rad);
                    body.velocity.y = Math.sin(rad);
                    body.frictionAir = 0;
                    this.pairs.push({ body: body, graphic: particle });

                    Matter.World.add(this.engine.world, body);
                }
            }
        }
        this.text.text = this.particles.children.length.toString();
        this.particles.children.forEach(p => p instanceof Particle && p.update(delta));
    }

    public fireworks = (delta: number) => {
        if (this.count++ % 10 === 0) {
            const p = new Fireworks({
                x: Math.random() * this.pixiApp.view.width,
                y: this.pixiApp.view.height,
                v: new Vector2(0, -( 2 + ( Math.random() * 2 ) )),
                radius: 1,
                life: Math.ceil(60 * (1 + Math.random())),
                type: PIXI.SHAPES.CIRC,
                blendMode: PIXI.BLEND_MODES.ADD,
                fillValue: hsl(Math.ceil(Math.random() * 360), 75, 50),
                flowerNum: 150,
                flowerRadius: 0.5 + Math.random()
            });
            p.init();
            this.fires.addChild(p);
        }

        this.fires.children.forEach((particle: PIXI.DisplayObject) => {
            if (particle instanceof Fireworks) {
                particle.update(1000/60);
            }
        });
    }
}

const app = new Application();
app.start();
