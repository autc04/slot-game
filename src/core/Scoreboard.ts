import * as PIXI from 'pixi.js';


export default class Scoreboard {
    private static readonly MONEY_LABEL = '$';
    private static readonly PAYOUT_LABEL = 'Jackpot: $';
    private static readonly BET_LABEL = 'Einsatz: $';

    public container: PIXI.Container;
    public moneyContainer: PIXI.Container;
    public outOfMoney = false;
    private winPayoutText: PIXI.Text;
    private betText: PIXI.Text;
    private moneyText: PIXI.Text;
    private money: number = 100;
    private bet: number = 5;
    private winPayout: number = 10;
    public winBias: number = 0;
    private jackpot: number = 0;
    private jackpotIncrement: number = 0;
    private fetchCounter: number = 0;
    private game : any = null;

    fetchmoney() {
        let saveCounter = ++this.fetchCounter;
        Promise.all([
            fetch(window.GAME_CONFIG.moneyPath, { method: 'GET' }).then(res => res.json()),
            fetch(window.GAME_CONFIG.winPayoutPath, { method: 'GET' }).then(res => res.json()),
            fetch(window.GAME_CONFIG.winBiasPath, { method: 'GET' }).then(res => res.json()),
            fetch(window.GAME_CONFIG.betPricePath, { method: 'GET' }).then(res => res.json()),
            fetch(window.GAME_CONFIG.jackpotPath, { method: 'GET' }).then(res => res.json()),
            fetch(window.GAME_CONFIG.jackpotIncrementPath, { method: 'GET' }).then(res => res.json()),
        ]).then(([moneyRes, winPayoutRes, winBiasRes, betPriceRes, jackpotRes, jackpotIncrementRes]) => {
            if (saveCounter != this.fetchCounter) return;
            this.money = parseInt(moneyRes.toString());
            this.winPayout = parseInt(winPayoutRes.toString());
            this.winBias = parseInt(winBiasRes.toString());
            this.bet = parseInt(betPriceRes.toString());
            this.jackpot = parseInt(jackpotRes.toString());
            this.jackpotIncrement = parseInt(jackpotIncrementRes.toString());
            this.moneyText.text = `${Scoreboard.MONEY_LABEL}${this.money}`;
            this.winPayoutText.text = `${Scoreboard.PAYOUT_LABEL}${this.winPayout + this.jackpot}`;
            this.betText.text = `${Scoreboard.BET_LABEL}${this.bet}`;
            if (this.money - this.bet < 0) {
                this.outOfMoney = true;
            } else {
                this.outOfMoney = false;
            }
            this.game.updateButton();
        });
    }

    constructor(app: PIXI.Application, game: any, playBtnSprite: PIXI.Sprite) {
        this.container = new PIXI.Container();
        this.moneyContainer = new PIXI.Container();
        this.generate(app.screen.width, app.screen.height, playBtnSprite);
        this.game = game;
        this.fetchmoney();
        window.setInterval(() => {
            this.fetchmoney();
        }, 1000);
        
    }

    decrement() {
        if (!this.outOfMoney) {
            this.money -= this.bet;
            this.moneyText.text = `${Scoreboard.MONEY_LABEL}${this.money}`;
        }
        if (this.money - this.bet < 0) {
            this.outOfMoney = true;
        }
        ++this.fetchCounter;
        // post money to server
        fetch(window.GAME_CONFIG.moneyPath, {
            method: 'POST',
            body: this.money.toString(),
        });
    }

    increment() {
        this.money += this.winPayout + this.jackpot;
        this.moneyText.text = `${Scoreboard.MONEY_LABEL}${this.money}`;
        if (this.outOfMoney) this.outOfMoney = false;
        const wonJackpot = this.jackpot;
        this.jackpot = 0;
        this.winPayoutText.text = `${Scoreboard.PAYOUT_LABEL}${this.winPayout + wonJackpot}`;
        // post money to server
        ++this.fetchCounter;
        fetch(window.GAME_CONFIG.moneyPath, {
            method: 'POST',
            body: this.money.toString(),
        });
        // reset jackpot
        fetch(window.GAME_CONFIG.jackpotPath, {
            method: 'POST',
            body: '0',
        });
    }

    addToJackpot() {
        this.jackpot += this.jackpotIncrement;
        this.winPayoutText.text = `${Scoreboard.PAYOUT_LABEL}${this.winPayout + this.jackpot}`;
        ++this.fetchCounter;
        fetch(window.GAME_CONFIG.jackpotPath, {
            method: 'POST',
            body: this.jackpot.toString(),
        });
    }

    private generate(appWidth: number, appHeight: number, playBtnSprite: PIXI.Sprite) {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 'yellow',
        });

        const moneyStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 'yellow',
        });

        this.moneyText = new PIXI.Text(`${Scoreboard.MONEY_LABEL}${this.money}`, moneyStyle);
        this.moneyContainer.x = playBtnSprite.x + (playBtnSprite.width - this.moneyText.width) / 2;
        this.moneyContainer.y = playBtnSprite.y - this.moneyText.height - 40;
        this.moneyContainer.addChild(this.moneyText);

        this.betText = new PIXI.Text(`${Scoreboard.BET_LABEL}${this.bet}`, style);
        this.betText.y = 5;

        this.winPayoutText = new PIXI.Text(`${Scoreboard.PAYOUT_LABEL}${this.winPayout}`, style);
        this.winPayoutText.y = this.betText.y + this.betText.height + 5;

        this.betText.x = this.winPayoutText.x = 10;

        const rect = new PIXI.Graphics();
        rect.beginFill(0x02474E, 0.8);
        const rectHeight = this.betText.height + this.winPayoutText.height + 18;
        rect.drawRect(0, 0, 160, rectHeight);
        rect.endFill();

        this.container.x = appWidth - rect.width - 7;
        this.container.y = appHeight / 2 + 90;
        this.container.addChild(rect, this.betText, this.winPayoutText);
    }
}
