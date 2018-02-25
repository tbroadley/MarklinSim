import * as PIXI from 'pixi.js';
import { ITrain } from '../../model/train';

export class TrainView {
    private readonly id: number;
    private readonly length: number;
    private readonly width: number;
    private readonly wheelOffset: number;
    private readonly lightWidth = 10;
    private readonly sprite: PIXI.Graphics;

    private lightOn = false;
    private reversed = false;

    public constructor(model: ITrain) {
        this.id = model.id;
        this.length = model.length;
        this.width = model.width;
        this.wheelOffset = model.wheelOffset;

        this.sprite = new PIXI.Graphics();
        this.sprite.beginFill(0xCCCCCC);
        this.sprite.lineStyle(2, 0x333333, 1);
        this.sprite.drawRect(-this.length + this.wheelOffset, -this.width / 2, this.length, this.width);
        this.sprite.endFill();
        this.sprite.beginFill(0xCC3333);
        this.sprite.drawCircle(0, 0, this.width / 4);
        this.sprite.endFill();

        // Add train number
        const style = new PIXI.TextStyle({
            align: 'center',
            fontFamily: 'monospace',
            fontSize: 16,
            fill: 0x333333
        });
        const trainLabel = new PIXI.Text(model.id.toString(10), style);
        trainLabel.y = -8;
        trainLabel.x = -this.length + 2 * this.wheelOffset;

        this.turnLightOff();

        this.sprite.addChild(trainLabel);
    }

    public turnLightOff() {
        this.sprite.beginFill(0xCCCCCC);
        this.sprite.lineStyle(2, 0x333333, 1);
        this.sprite.drawRect(-this.length + this.wheelOffset, -this.width / 2, this.lightWidth, this.width);
        this.sprite.drawRect(this.wheelOffset - this.lightWidth, -this.width / 2, this.lightWidth, this.width);
        this.sprite.endFill();
        this.lightOn = false;
    }

    public turnLightOn(reverse: boolean) {
        this.sprite.beginFill(reverse ? 0xFFFFFF : 0xCC3333);
        this.sprite.lineStyle(2, 0x333333, 1);
        this.sprite.drawRect(-this.length + this.wheelOffset, -this.width / 2, this.lightWidth, this.width);
        this.sprite.endFill();
        this.sprite.beginFill(reverse ? 0xCC3333 : 0xFFFFFF);
        this.sprite.lineStyle(2, 0x333333, 1);
        this.sprite.drawRect(this.wheelOffset - this.lightWidth, -this.width / 2, this.lightWidth, this.width);
        this.sprite.endFill();
        this.lightOn = true;
        this.reversed = reverse;
    }

    public isLightOn() {
        return this.lightOn;
    }

    public isReversed() {
        return this.reversed;
    }

    public getSprite(): PIXI.DisplayObject {
        return this.sprite;
    }
}