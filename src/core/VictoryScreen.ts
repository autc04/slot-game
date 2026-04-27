import * as PIXI from 'pixi.js';

export default class VictoryScreen {
    public container: PIXI.Container;
    private overlay: PIXI.Graphics;
    private text: PIXI.Text;
    private rectX: number;
    private rectWidth: number;
    private appHeight: number;

    constructor(app: PIXI.Application) {
        this.container = new PIXI.Container();
        this.generate(app.screen.width, app.screen.height);
    }

    show(amount: number) {
        this.text.text = `+ $${amount}`;
        this.text.x = this.rectX + (this.rectWidth - this.text.width) / 2;
        this.text.y = (this.appHeight - this.text.height) / 2;
        this.container.visible = true;
        const id = window.setTimeout(this.hide.bind(this), 3000);
        const handler = () => {
            window.clearTimeout(id);
            this.hide();
        };
        this.overlay.addListener('pointerdown', handler.bind(this));
    }

    hide() {
        this.container.visible = false;
    }

    private generate(appWidth: number, appHeight: number) {
        this.container.visible = false;
        this.appHeight = appHeight;

        this.overlay = new PIXI.Graphics();
        this.overlay.beginFill(0xFFFFFF, 0.001);
        this.overlay.drawRect(0, 0, appWidth, appHeight);
        this.overlay.endFill();
        this.overlay.interactive = true;
        this.overlay.buttonMode = true;
        this.overlay.cursor = 'default';

        const rect = new PIXI.Graphics();
        rect.beginFill(0x02474E, 0.8);
        rect.drawRect(0, 0, 717.5, 400);
        rect.x = 70;
        rect.y = (appHeight - rect.height) / 2;
        rect.endFill();
        this.rectX = rect.x;
        this.rectWidth = rect.width;

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 96,
            fill: 'yellow',
        });

        this.text = new PIXI.Text('', style);
        // x/y set in show() after text content is known

        this.container.addChild(rect, this.text, this.overlay);
    }
}
