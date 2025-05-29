import Phaser from 'phaser';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 18;
const BLOCK_SIZE = 30;
const BOARD_OFFSET_X = 250;
const BOARD_OFFSET_Y = 20;  // 上部の余白を20pxに調整

const TETROMINOES = {
    I: {
        shape: [[1, 1, 1, 1]],
        color: 0x00ffff
    },
    O: {
        shape: [[1, 1], [1, 1]],
        color: 0xffff00
    },
    T: {
        shape: [[0, 1, 0], [1, 1, 1]],
        color: 0x800080
    },
    S: {
        shape: [[0, 1, 1], [1, 1, 0]],
        color: 0x00ff00
    },
    Z: {
        shape: [[1, 1, 0], [0, 1, 1]],
        color: 0xff0000
    },
    J: {
        shape: [[1, 0, 0], [1, 1, 1]],
        color: 0x0000ff
    },
    L: {
        shape: [[0, 0, 1], [1, 1, 1]],
        color: 0xffa500
    }
};

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;  // 次のブロックを保持
        this.gameOver = false;
        this.score = 0;
        this.lastDrop = 0;
    }

    create() {
        this.createBoard();
        this.createScoreText();
        this.createControlsText();
        this.createNextPiecePreview();  // 次のブロック表示用の領域を作成
        this.spawnPiece();
        this.setupInput();
        this.lastDrop = 0;
        this.createGameOverText();

        // シーンが一時停止中でもキーイベントを受け取れるように設定
        this.input.keyboard.addCapture(['R']);
    }

    createBoard() {
        // ボードの初期化
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            this.board[y] = new Array(BOARD_WIDTH).fill(0);
        }

        // ボードの描画
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0xffffff);
        
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                graphics.strokeRect(
                    x * BLOCK_SIZE + BOARD_OFFSET_X,
                    y * BLOCK_SIZE + BOARD_OFFSET_Y,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
            }
        }
    }

    createScoreText() {
        this.scoreText = this.add.text(50, 50, 'Score: 0', {
            fontSize: '24px',
            fill: '#fff'
        });
    }

    createControlsText() {
        const controls = [
            '操作方法:',
            '← → : 左右移動',
            '↑ : 回転',
            '↓ : 下に移動'
        ];

        const style = {
            fontSize: '20px',
            fill: '#fff',
            align: 'left'
        };

        controls.forEach((text, index) => {
            this.add.text(50, 100 + (index * 30), text, style);
        });
    }

    createGameOverText() {
        // 背景の半透明な黒い四角形を追加
        this.gameOverBackground = this.add.rectangle(400, 300, 400, 200, 0x000000, 0.7);
        this.gameOverBackground.setOrigin(0.5);
        this.gameOverBackground.setVisible(false);

        // ゲームオーバーテキスト
        this.gameOverText = this.add.text(400, 300, 'GAME OVER\nPress R to restart', {
            fontSize: '32px',
            fill: '#ff0000',
            align: 'center'
        });
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setVisible(false);
    }

    createNextPiecePreview() {
        // 次のブロック表示用のテキスト
        this.add.text(600, 50, 'Next:', {
            fontSize: '24px',
            fill: '#fff'
        });

        // 次のブロック表示用の背景
        this.nextPieceGraphics = this.add.graphics();
        this.nextPieceGraphics.fillStyle(0x000000);
        this.nextPieceGraphics.fillRect(600, 80, 120, 120);
        this.nextPieceGraphics.lineStyle(1, 0xffffff);
        this.nextPieceGraphics.strokeRect(600, 80, 120, 120);
    }

    drawNextPiece() {
        if (this.nextPiecePreviewGraphics) {
            this.nextPiecePreviewGraphics.clear();
        } else {
            this.nextPiecePreviewGraphics = this.add.graphics();
        }

        if (this.nextPiece) {
            this.nextPiecePreviewGraphics.fillStyle(this.nextPiece.color);
            
            // プレビュー表示用のオフセット計算
            const offsetX = 600 + (120 - this.nextPiece.shape[0].length * BLOCK_SIZE) / 2;
            const offsetY = 80 + (120 - this.nextPiece.shape.length * BLOCK_SIZE) / 2;
            
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        this.nextPiecePreviewGraphics.fillRect(
                            offsetX + x * BLOCK_SIZE,
                            offsetY + y * BLOCK_SIZE,
                            BLOCK_SIZE - 1,
                            BLOCK_SIZE - 1
                        );
                    }
                }
            }
        }
    }

    spawnPiece() {
        const pieces = Object.keys(TETROMINOES);
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        const piece = TETROMINOES[randomPiece];

        // 次のブロックが設定されていない場合は、現在のブロックを次のブロックとして設定
        if (!this.nextPiece) {
            this.nextPiece = {
                shape: piece.shape,
                color: piece.color
            };
            // 新しい次のブロックを生成
            const nextRandomPiece = pieces[Math.floor(Math.random() * pieces.length)];
            const nextPiece = TETROMINOES[nextRandomPiece];
            this.nextPiece = {
                shape: nextPiece.shape,
                color: nextPiece.color
            };
        }

        // 現在のブロックを次のブロックに設定
        this.currentPiece = {
            shape: this.nextPiece.shape,
            color: this.nextPiece.color,
            x: Math.floor(BOARD_WIDTH / 2) - Math.floor(this.nextPiece.shape[0].length / 2),
            y: 0
        };

        // 新しい次のブロックを生成
        const nextRandomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        const nextPiece = TETROMINOES[nextRandomPiece];
        this.nextPiece = {
            shape: nextPiece.shape,
            color: nextPiece.color
        };

        // 新しいテトリミノを描画する前に、ボードの状態を再描画
        this.redrawBoard();
        this.drawPiece();
        this.drawNextPiece();  // 次のブロックを描画
    }

    drawPiece() {
        if (this.pieceGraphics) {
            this.pieceGraphics.clear();
        } else {
            this.pieceGraphics = this.add.graphics();
        }

        if (this.currentPiece) {
            this.pieceGraphics.fillStyle(this.currentPiece.color);
            
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.pieceGraphics.fillRect(
                            (this.currentPiece.x + x) * BLOCK_SIZE + BOARD_OFFSET_X,
                            (this.currentPiece.y + y) * BLOCK_SIZE + BOARD_OFFSET_Y,
                            BLOCK_SIZE - 1,
                            BLOCK_SIZE - 1
                        );
                    }
                }
            }
        }
    }

    setupInput() {
        // 通常の操作キー
        this.input.keyboard.on('keydown-LEFT', () => {
            if (!this.gameOver) this.movePiece(-1);
        });
        this.input.keyboard.on('keydown-RIGHT', () => {
            if (!this.gameOver) this.movePiece(1);
        });
        this.input.keyboard.on('keydown-DOWN', () => {
            if (!this.gameOver) this.moveDown();
        });
        this.input.keyboard.on('keydown-UP', () => {
            if (!this.gameOver) this.rotatePiece();
        });

        // リスタート用のキー設定
        this.input.keyboard.on('keydown-R', () => {
            console.log('R key pressed - Current gameOver state:', this.gameOver);
            if (this.gameOver) {
                console.log('Attempting to restart game...');
                this.restartGame();
            } else {
                console.log('Game is not in game over state');
            }
        });
    }

    movePiece(dx) {
        this.currentPiece.x += dx;
        if (this.checkCollision()) {
            this.currentPiece.x -= dx;
        } else {
            this.drawPiece();
        }
    }

    moveDown() {
        this.currentPiece.y++;
        if (this.checkCollision()) {
            this.currentPiece.y--;
            this.lockPiece();
            this.clearLines();
            this.redrawBoard();
            this.spawnPiece();
            if (this.checkCollision()) {
                console.log('Game Over - Starting game over sequence');
                this.gameOver = true;
                this.gameOverBackground.setVisible(true);
                this.gameOverText.setVisible(true);
                console.log('Game Over - Game over state set');
            }
        } else {
            this.drawPiece();
        }
    }

    rotatePiece() {
        const originalShape = this.currentPiece.shape;
        const rows = originalShape.length;
        const cols = originalShape[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                rotated[x][rows - 1 - y] = originalShape[y][x];
            }
        }

        this.currentPiece.shape = rotated;
        if (this.checkCollision()) {
            this.currentPiece.shape = originalShape;
        } else {
            this.drawPiece();
        }
    }

    checkCollision() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;

                    if (
                        boardX < 0 ||
                        boardX >= BOARD_WIDTH ||
                        boardY >= BOARD_HEIGHT ||
                        (boardY >= 0 && this.board[boardY][boardX])
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(new Array(BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }

        if (linesCleared > 0) {
            this.score += linesCleared * 100;
            this.scoreText.setText(`Score: ${this.score}`);
            this.redrawBoard();
        }
    }

    redrawBoard() {
        if (this.boardGraphics) {
            this.boardGraphics.clear();
        } else {
            this.boardGraphics = this.add.graphics();
        }

        // ボードの背景を描画
        this.boardGraphics.fillStyle(0x000000);
        this.boardGraphics.fillRect(
            BOARD_OFFSET_X,
            BOARD_OFFSET_Y,
            BOARD_WIDTH * BLOCK_SIZE,
            BOARD_HEIGHT * BLOCK_SIZE
        );

        // 固定されたブロックを描画
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.boardGraphics.fillStyle(this.board[y][x]);
                    this.boardGraphics.fillRect(
                        x * BLOCK_SIZE + BOARD_OFFSET_X,
                        y * BLOCK_SIZE + BOARD_OFFSET_Y,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            }
        }
    }

    update() {
        if (!this.gameOver) {
            if (!this.lastDrop) {
                this.lastDrop = this.time.now;
            }
            
            if (this.time.now > this.lastDrop) {
                this.moveDown();
                this.lastDrop = this.time.now + 1000;
            }
            
            this.drawPiece();
        }
    }

    restartGame() {
        console.log('Restarting game... Current state:', {
            gameOver: this.gameOver,
            sceneActive: this.scene.isActive(),
            scenePaused: this.scene.isPaused()
        });

        if (this.gameOver) {
            // ゲームの状態をリセット
            this.board = [];
            for (let y = 0; y < BOARD_HEIGHT; y++) {
                this.board[y] = new Array(BOARD_WIDTH).fill(0);
            }
            this.score = 0;
            this.scoreText.setText('Score: 0');
            this.gameOver = false;
            this.gameOverBackground.setVisible(false);
            this.gameOverText.setVisible(false);
            
            // ボードをクリア
            if (this.boardGraphics) {
                this.boardGraphics.clear();
            }
            
            // 次のブロックのプレビューをクリア
            if (this.nextPiecePreviewGraphics) {
                this.nextPiecePreviewGraphics.clear();
            }
            
            // 新しいテトリミノを生成
            this.nextPiece = null;  // 次のブロックをリセット
            this.spawnPiece();
            
            // シーンを再開
            this.scene.resume();
            this.lastDrop = this.time.now;
            
            console.log('Game restarted - New state:', {
                gameOver: this.gameOver,
                sceneActive: this.scene.isActive(),
                scenePaused: this.scene.isPaused()
            });
        }
    }
} 