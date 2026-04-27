import * as PIXI from 'pixi.js';
import Loader from './Loader';
import PlayButton from './PlayButton';
import Background from './Background';
import ReelsContainer from './ReelsContainer';
import Scoreboard from './Scoreboard';
import VictoryScreen from './VictoryScreen';

export default class Game {
    public app: PIXI.Application;
    private playBtn: PlayButton;
    private reelsContainer: ReelsContainer;
    private scoreboard: Scoreboard;
    private victoryScreen: VictoryScreen;
    private playing: boolean = false;

    constructor() {
        this.app = new PIXI.Application({ width: 960, height: 536 });
        window.document.body.appendChild(this.app.view);
        new Loader(this.app, this.init.bind(this));
    }

    private init() {
        this.createScene();
        this.createPlayButton();
        this.createReels();
        this.createScoreboard();
        this.createVictoryScreen();
    }

    private createScene() {
        const bg = new Background(this.app.loader);
        this.app.stage.addChild(bg.sprite);
    }

    private createPlayButton() {
        this.playBtn = new PlayButton(this.app, this.handleStart.bind(this));
        this.app.stage.addChild(this.playBtn.sprite);
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.code === 'Space' && this.playBtn.sprite.interactive) {
                this.handleStart();
            }
        });
    }

    private createReels() {
        this.reelsContainer = new ReelsContainer(this.app);
        this.app.stage.addChild(this.reelsContainer.container);
    }

    private createScoreboard() {
        this.scoreboard = new Scoreboard(this.app, this, this.playBtn.sprite);
        this.app.stage.addChild(this.scoreboard.container);
        this.app.stage.addChild(this.scoreboard.moneyContainer);
    }

    private createVictoryScreen() {
        this.victoryScreen = new VictoryScreen(this.app);
        this.app.stage.addChild(this.victoryScreen.container);
    }

    updateButton() {
        if (this.playing) {
            this.playBtn.setDisabled();
        } else if (this.scoreboard.outOfMoney) {
            this.playBtn.setDisabled();
        } else {
            this.playBtn.setEnabled();
        }
    }

    handleStart() {
        if (this.scoreboard.outOfMoney) {
            this.playBtn.setDisabled();
            return;
        }
        this.playing = true;
        this.scoreboard.decrement();
        this.playBtn.setDisabled();
        this.reelsContainer.spin(this.scoreboard.winBias, this.scoreboard.shiftingDelay, this.scoreboard.speed, this.scoreboard.initialDelay)
            .then(this.processSpinResult.bind(this));
        const totalTime = this.scoreboard.initialDelay + this.scoreboard.shiftingDelay * this.reelsContainer.reels.length;
        if (totalTime > 4000) {
            new Audio('assets/spin1.m4a').play();
        } else {
            new Audio('assets/spin2.m4a').play();
        }
        if (totalTime > 2800) {
           window.setTimeout(() => {
                new Audio('assets/spin2.m4a').play();
            }, totalTime - 2500);
        }
        window.document.body.requestFullscreen();
    }

    private processSpinResult(isWin: boolean) {
        if (isWin) {
            const winAmount = this.scoreboard.increment();
            window.setTimeout(() => this.victoryScreen.show(winAmount), 500);
            new Audio('assets/win.m4a').play();
        } else {
            this.scoreboard.addToJackpot();
        }
        this.playing = false;
        this.updateButton();

    }
}
