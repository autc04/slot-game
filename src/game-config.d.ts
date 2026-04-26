interface GameConfig {
    instance: '1' | '2';
    assetBase: string;
    moneyPath: string;
    winAmountPath: string;
}

interface Window {
    GAME_CONFIG: GameConfig;
}
