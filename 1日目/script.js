/**
 * オセロゲームクラス
 */
class OthelloGame {
    constructor() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.showingHints = false;
        
        this.initializeBoard();
        this.createBoardUI();
        this.updateUI();
    }

    /**
     * ボードの初期配置を設定
     */
    initializeBoard() {
        // 中央4マスの初期配置
        this.board[3][3] = 'white';
        this.board[3][4] = 'black';
        this.board[4][3] = 'black';
        this.board[4][4] = 'white';
    }

    /**
     * ボードのUIを作成
     */
    createBoardUI() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                boardElement.appendChild(cell);
            }
        }
    }

    /**
     * UIを更新
     */
    updateUI() {
        const cells = document.querySelectorAll('.cell');
        const scores = this.calculateScores();
        
        // ボードの更新
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const piece = this.board[row][col];
            
            cell.innerHTML = '';
            cell.classList.remove('valid-move');
            
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece ${piece}`;
                cell.appendChild(pieceElement);
            } else if (!this.gameOver && this.isValidMove(row, col, this.currentPlayer)) {
                cell.classList.add('valid-move');
            }
        });

        // スコア更新
        document.getElementById('blackScore').textContent = scores.black;
        document.getElementById('whiteScore').textContent = scores.white;
        
        // 現在のプレイヤー表示
        const currentPlayerImage = document.getElementById('currentPlayerImage');
        if (!this.gameOver) {
            currentPlayerImage.src = `img/${this.currentPlayer}/stone.png`;
            currentPlayerImage.alt = this.currentPlayer === 'black' ? '黒の番' : '白の番';
        }


        // ゲーム終了チェック
        if (!this.hasValidMoves('black') && !this.hasValidMoves('white')) {
            this.endGame(scores);
        }
    }

    /**
     * 指定位置に石を置けるかチェック
     * @param {number} row - 行
     * @param {number} col - 列
     * @param {string} player - プレイヤー ('black' or 'white')
     * @returns {boolean} 置けるかどうか
     */
    isValidMove(row, col, player) {
        if (this.board[row][col] !== null) return false;
        
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (let [dr, dc] of directions) {
            if (this.checkDirection(row, col, dr, dc, player)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 指定方向に石をひっくり返せるかチェック
     * @param {number} row - 開始行
     * @param {number} col - 開始列
     * @param {number} dr - 行方向の移動量
     * @param {number} dc - 列方向の移動量
     * @param {string} player - プレイヤー
     * @returns {boolean} ひっくり返せるかどうか
     */
    checkDirection(row, col, dr, dc, player) {
        let r = row + dr;
        let c = col + dc;
        let hasOpponent = false;
        
        while (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] !== null) {
            if (this.board[r][c] !== player) {
                hasOpponent = true;
            } else if (hasOpponent) {
                return true;
            } else {
                break;
            }
            r += dr;
            c += dc;
        }
        return false;
    }

    /**
     * 石を配置してひっくり返す
     * @param {number} row - 行
     * @param {number} col - 列
     * @returns {boolean} 配置できたかどうか
     */
    makeMove(row, col) {
        if (!this.isValidMove(row, col, this.currentPlayer)) return false;
        
        this.board[row][col] = this.currentPlayer;
        this.flipStones(row, col);

        return true;
    }

    /**
     * 配置した石の周りの石をひっくり返す
     * @param {number} row - 配置した行
     * @param {number} col - 配置した列
     */
    flipStones(row, col) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (let [dr, dc] of directions) {
            const toFlip = [];
            let r = row + dr;
            let c = col + dc;
            
            while (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] !== null) {
                if (this.board[r][c] !== this.currentPlayer) {
                    toFlip.push([r, c]);
                } else {
                    // 自分の石に到達したらひっくり返す
                    toFlip.forEach(([fr, fc]) => {
                        this.board[fr][fc] = this.currentPlayer;
                    });
                    break;
                }
                r += dr;
                c += dc;
            }
        }
    }

    /**
     * 指定プレイヤーが打てる手があるかチェック
     * @param {string} player - プレイヤー
     * @returns {boolean} 打てる手があるかどうか
     */
    hasValidMoves(player) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.isValidMove(row, col, player)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 現在のスコアを計算
     * @returns {Object} 黒と白のスコア
     */
    calculateScores() {
        let black = 0, white = 0;
        this.board.forEach(row => {
            row.forEach(cell => {
                if (cell === 'black') black++;
                if (cell === 'white') white++;
            });
        });
        return { black, white };
    }

    /**
     * セルクリック時の処理
     * @param {number} row - クリックした行
     * @param {number} col - クリックした列
     */
    handleCellClick(row, col) {
        if (this.gameOver || !this.isValidMove(row, col, this.currentPlayer)) return;
        
        if (this.makeMove(row, col)) {
            const nextPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
            
            // 次のプレイヤーが打てるかチェック
            if (this.hasValidMoves(nextPlayer)) {
                this.currentPlayer = nextPlayer;
            } else if (!this.hasValidMoves(this.currentPlayer)) {
                // 両方とも打てない場合はゲーム終了
                const scores = this.calculateScores();
                this.endGame(scores);
                return;
            }
            // 現在のプレイヤーが続行可能な場合はそのまま
            
            this.updateUI();
        }
    }

    /**
     * ゲーム終了処理
     * @param {Object} scores - 最終スコア
     */
    endGame(scores) {
        this.gameOver = true;
        const gameOverElement = document.getElementById('gameOver');
        
        let message, className;
        if (scores.black > scores.white) {
            message = `🎉 召使の勝利！ (${scores.black} vs ${scores.white})`;
            className = 'game-over winner';
        } else if (scores.white > scores.black) {
            message = `🎉 フリーナの勝利！ (${scores.white} vs ${scores.black})`;
            className = 'game-over winner';
        } else {
            message = `🤝 引き分け！ (${scores.black} vs ${scores.white})`;
            className = 'game-over';
        }
        
        gameOverElement.textContent = message;
        gameOverElement.className = className;
        gameOverElement.style.display = 'block';
        
        document.getElementById('currentPlayerText').textContent = 'ゲーム終了';
    }

    /**
     * ゲームリセット
     */
    reset() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.showingHints = false;
        
        this.initializeBoard();
        this.updateUI();
        
        document.getElementById('gameOver').style.display = 'none';
    }


}

// グローバル変数
let game;

/**
 * ゲームリセット関数（HTMLから呼び出し）
 */
function resetGame() {
    if (game) {
        game.reset();
    }
}

/**
 * ヒント表示関数（HTMLから呼び出し）
 */
function showHint() {
    if (game) {
        game.toggleHints();
    }
}

// ページ読み込み完了時にゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    game = new OthelloGame();
});

// ページがアンロードされる前の処理（必要に応じて）
window.addEventListener('beforeunload', () => {
    // 必要に応じてゲーム状態の保存など
});