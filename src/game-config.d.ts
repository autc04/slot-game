interface GameConfig {
    instance: '1' | '2';
    assetBase: string;
    moneyPath: string;
    winPayoutPath: string;
}

interface Window {
    GAME_CONFIG: GameConfig;
}
