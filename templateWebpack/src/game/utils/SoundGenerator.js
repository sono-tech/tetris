export default class SoundGenerator {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.isBgmPlaying = false;
        this.bgmScheduleTimeout = null;
        this.bgmGainNode = null;
        this.bgmOscillator = null;
        this.isBgmEnabled = true;
        this.isSeEnabled = true;
    }

    // BGMのON/OFF切り替え
    toggleBGM() {
        this.isBgmEnabled = !this.isBgmEnabled;
        if (this.isBgmEnabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
        return this.isBgmEnabled;
    }

    // SEのON/OFF切り替え
    toggleSE() {
        this.isSeEnabled = !this.isSeEnabled;
        return this.isSeEnabled;
    }

    // BGMを開始
    startBGM() {
        if (this.isBgmPlaying || !this.isBgmEnabled) return;

        // AudioContextが停止状態の場合は再開
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // ゲインノードを作成（音量制御用）
        this.bgmGainNode = this.audioContext.createGain();
        this.bgmGainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        this.bgmGainNode.connect(this.audioContext.destination);

        // オシレーターを作成
        this.bgmOscillator = this.audioContext.createOscillator();
        this.bgmOscillator.type = 'sine';
        this.bgmOscillator.connect(this.bgmGainNode);

        // Korobeiniki風のメロディを生成
        // 音符の定義: [周波数, 長さ(秒)]
        const notes = [
            // 1小節目
            [659.25, 0.15], // E5
            [587.33, 0.15], // D5
            [523.25, 0.15], // C5
            [587.33, 0.15], // D5
            [392.00, 0.3],  // G4
            [392.00, 0.3],  // G4
            // 2小節目
            [523.25, 0.15], // C5
            [493.88, 0.15], // B4
            [440.00, 0.15], // A4
            [493.88, 0.15], // B4
            [392.00, 0.3],  // G4
            [392.00, 0.3],  // G4
            // 3小節目
            [440.00, 0.15], // A4
            [493.88, 0.15], // B4
            [523.25, 0.15], // C5
            [587.33, 0.15], // D5
            [659.25, 0.3],  // E5
            [659.25, 0.3],  // E5
            // 4小節目
            [587.33, 0.15], // D5
            [523.25, 0.15], // C5
            [493.88, 0.15], // B4
            [440.00, 0.15], // A4
            [392.00, 0.3],  // G4
            [392.00, 0.3],  // G4
            // 5小節目
            [523.25, 0.15], // C5
            [440.00, 0.15], // A4
            [392.00, 0.15], // G4
            [440.00, 0.15], // A4
            [493.88, 0.3],  // B4
            [493.88, 0.3],  // B4
            // 6小節目
            [523.25, 0.15], // C5
            [493.88, 0.15], // B4
            [440.00, 0.15], // A4
            [493.88, 0.15], // B4
            [523.25, 0.3],  // C5
            [523.25, 0.3],  // C5
            // 7小節目
            [587.33, 0.15], // D5
            [523.25, 0.15], // C5
            [493.88, 0.15], // B4
            [440.00, 0.15], // A4
            [392.00, 0.3],  // G4
            [392.00, 0.3],  // G4
            // 8小節目
            [392.00, 0.15], // G4
            [440.00, 0.15], // A4
            [493.88, 0.15], // B4
            [523.25, 0.15], // C5
            [392.00, 0.3],  // G4
            [392.00, 0.3],  // G4
        ];

        // ループ再生を実装
        const playLoop = () => {
            if (!this.isBgmPlaying) return;

            const startTime = this.audioContext.currentTime;
            let currentTime = startTime;

            // 1ループ分の音符をスケジュール
            notes.forEach(([frequency, duration]) => {
                this.bgmOscillator.frequency.setValueAtTime(frequency, currentTime);
                currentTime += duration;
            });

            // 次のループをスケジュール
            const loopDuration = currentTime - startTime;
            const timeUntilNextLoop = loopDuration * 1000;
            
            this.bgmScheduleTimeout = setTimeout(() => {
                if (this.isBgmPlaying) {
                    playLoop();
                }
            }, timeUntilNextLoop);
        };

        // オシレーターを開始
        this.bgmOscillator.start();
        this.isBgmPlaying = true;
        playLoop();
    }

    // BGMを停止
    stopBGM() {
        if (!this.isBgmPlaying) return;

        if (this.bgmScheduleTimeout) {
            clearTimeout(this.bgmScheduleTimeout);
            this.bgmScheduleTimeout = null;
        }

        if (this.bgmOscillator) {
            this.bgmOscillator.stop();
            this.bgmOscillator.disconnect();
            this.bgmOscillator = null;
        }

        if (this.bgmGainNode) {
            this.bgmGainNode.disconnect();
            this.bgmGainNode = null;
        }

        this.isBgmPlaying = false;
    }

    // 回転音を生成
    generateRotateSound() {
        if (!this.isSeEnabled) return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // 移動音を生成
    generateMoveSound() {
        if (!this.isSeEnabled) return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    // 着地音を生成
    generateDropSound() {
        if (!this.isSeEnabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);  // 開始周波数を上げる
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);  // 終了周波数も調整
        
        gainNode.gain.setValueAtTime(0.8, this.audioContext.currentTime);  // 音量を大きくする
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    // ライン消去音を生成
    generateClearSound() {
        if (!this.isSeEnabled) return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    // ゲームオーバー音を生成
    generateGameOverSound() {
        if (!this.isSeEnabled) return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
} 