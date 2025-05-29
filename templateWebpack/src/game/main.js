import Phaser from 'phaser';
import GameScene from './scenes/GameScene';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    parent: 'game-container',
    scene: [GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

export default function StartGame(containerId) {
    const game = new Phaser.Game(config);
    return game;
}
