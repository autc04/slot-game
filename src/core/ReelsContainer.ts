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

    async spin(winBias: number = 0, shiftingDelay: number = 800, speed: number = 50, initialDelay: number = 0) {
        const remainingReels = [...this.reels];

        // Spin all reels together for the initial delay before stopping them one by one
        if (initialDelay > 0) {
            const start = Date.now();
            do {
                await Promise.all(remainingReels.map(r => r.spinOneTime(speed)));
                this.blessRNG();
            } while (Date.now() < start + initialDelay);
        }

        while (remainingReels.length > 0) {
            // Spin all remaining reels for shiftingDelay ms
            const start = Date.now();
            do {
                await Promise.all(remainingReels.map(r => r.spinOneTime(speed)));
                this.blessRNG();
            } while (Date.now() < start + shiftingDelay);

            // Stop the frontmost reel
            const stoppedReel = remainingReels.shift()!;
            const isLastReel = remainingReels.length === 0;

            if (isLastReel && winBias < 0) {
                // Negative bias: probabilistically decide whether to prevent a win
                const preventProbability = -winBias / 10.0;
                if (Math.random() < preventProbability) {
                    for (let extra = 0; extra < 20; extra++) {
                        if (!this.checkForWin(this.reels.map(r => r.sprites[2]))) break;
                        await stoppedReel.spinOneTime(speed);
                        this.blessRNG();
                    }
                }
            } else if (winBias > 0) {
                if (isLastReel) {
                    // Positive bias: spin last reel extra steps until a win occurs
                    for (let extra = 0; extra < winBias; extra++) {
                        if (this.checkForWin(this.reels.map(r => r.sprites[2]))) break;
                        await stoppedReel.spinOneTime(speed);
                        this.blessRNG();
                    }
                } else {
                    // Positive bias: spin stopped reel + remaining together while win is impossible
                    for (let extra = 0; extra < winBias; extra++) {
                        if (this.isWinPossible(stoppedReel)) break;
                        await Promise.all([stoppedReel, ...remainingReels].map(r => r.spinOneTime(speed)));
                        this.blessRNG();
                    }
                }
            }
        }

        // reel.sprites[2] - Middle visible symbol of the reel
        //
        return this.checkForWin(this.reels.map(reel => reel.sprites[2]));
    }

    private isWinPossible(lastStoppedReel: Reel): boolean {
        const stoppedIndex = this.reels.indexOf(lastStoppedReel);
        if (stoppedIndex < 1) return true; // First reel alone never blocks a win

        const sym = (reel: Reel) =>
            reel.sprites[2].texture.textureCacheIds[0].split('.')[0];
        const s0 = sym(this.reels[0]);
        const s1 = sym(this.reels[1]);
        // Win is impossible only when two different non-wild symbols have already appeared
        return !(s0 !== 'SYM1' && s1 !== 'SYM1' && s0 !== s1);
    }

    private checkForWin(symbols: Array<PIXI.Sprite>): boolean {
        // Set of strings: 'SYM1', 'SYM2', ...
        //
        const combination: Set<string> = new Set();
        symbols.forEach(symbol => combination.add(symbol.texture.textureCacheIds[0].split('.')[0]));
        if (combination.size === 1 && !combination.has('SYM1')) return true;
        return combination.size === 2 && combination.has('SYM1');
    }

    private blessRNG() {
        this.reels.forEach(reel => {
            reel.sprites[0].texture = reel.textures[Math.floor(Math.random() * reel.textures.length)];
        });
    }
}
