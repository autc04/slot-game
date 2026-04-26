import * as PIXI from 'pixi.js';
import Reel from './Reel';

export default class ReelsContainer {
    public readonly reels: Array<Reel> = [];
    public readonly container: PIXI.Container;

    constructor(app: PIXI.Application) {
        const REEL_OFFSET_LEFT = 70;
        const NUMBER_OF_REELS = 3;
        this.container = new PIXI.Container();

        for (let i = 0; i < NUMBER_OF_REELS; i++) {
            const reel = new Reel(app, i);
            this.reels.push(reel);
            this.container.addChild(reel.container);
        }

        this.container.x = REEL_OFFSET_LEFT;
    }

    async spin(winBias: number = 0) {
        // Overall time of spinning = shiftingDelay * this.reels.length
        //
        const shiftingDelay = 800;
        const start = Date.now();
        const reelsToSpin = [...this.reels];
        
        for await (let value of this.infiniteSpinning(reelsToSpin, winBias)) {
            const shiftingWaitTime = (this.reels.length - reelsToSpin.length + 1) * shiftingDelay;
            
            if (Date.now() >= start + shiftingWaitTime) {
                reelsToSpin.shift();
            }

            if (!reelsToSpin.length) break;
        }

        // reel.sprites[2] - Middle visible symbol of the reel
        //
        return this.checkForWin(this.reels.map(reel => reel.sprites[2]));
    }

    private async* infiniteSpinning(reelsToSpin: Array<Reel>, winBias: number) {
        while (true) {
            const spinningPromises = reelsToSpin.map(reel => reel.spinOneTime());
            await Promise.all(spinningPromises);
            this.blessRNG(winBias);
            yield;
        }
    }

    private checkForWin(symbols: Array<PIXI.Sprite>): boolean {
        // Set of strings: 'SYM1', 'SYM2', ...
        //
        const combination: Set<string> = new Set();
        symbols.forEach(symbol => combination.add(symbol.texture.textureCacheIds[0].split('.')[0]));
        if (combination.size === 1 && !combination.has('SYM1')) return true;
        return combination.size === 2 && combination.has('SYM1');
    }

    private blessRNG(winBias: number) {
        this.reels.forEach(reel => {
            const pool = [...reel.textures];
            if (winBias > 0) {
                for (let i = 0; i < winBias; i++) pool.push(reel.textures[1]);
            } else if (winBias < 0) {
                for (let i = 0; i < -winBias; i++) pool.push(reel.textures[0]);
            }
            reel.sprites[0].texture = pool[Math.floor(Math.random() * pool.length)];
        });
    }
}
