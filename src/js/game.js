// 斗兽棋游戏逻辑
class AnimalChess {
    constructor() {
        this.board = [];
        this.currentPlayer = 'blue'; // blue 或 red
        this.selectedPiece = null;
        this.gameOver = false;
        this.moveHistory = [];
        
        // 动物等级（数字越大等级越高）
        this.animalRanks = {
            'mouse': 0,   // 鼠
            'cat': 1,     // 猫
            'dog': 2,     // 狗
            'wolf': 3,    // 狼
            'leopard': 4, // 豹
            'tiger': 5,   // 虎
            'lion': 6,    // 狮
            'elephant': 7 // 象
        };
        
        // 动物图标
        this.animalIcons = {
            'mouse': '🐭',
            'cat': '🐱',
            'dog': '🐶',
            'wolf': '🐺',
            'leopard': '🐆',
            'tiger': '🐯',
            'lion': '🦁',
            'elephant': '🐘'
        };
        
        this.initBoard();
        this.renderBoard();
        this.attachEventListeners();
    }
    
    // 初始化棋盘
    initBoard() {
        // 创建9行7列的棋盘
        this.board = Array(9).fill().map(() => Array(7).fill(null));
        
        // 设置河流位置
        this.riverPositions = [
            [2, 1], [2, 2], [3, 1], [3, 2], [4, 1], [4, 2],
            [2, 4], [2, 5], [3, 4], [3, 5], [4, 4], [4, 5]
        ];
        
        // 设置陷阱位置
        this.trapPositions = {
            'blue': [[8, 2], [8, 3], [8, 4]], // 蓝方陷阱
            'red': [[0, 2], [0, 3], [0, 4]]   // 红方陷阱
        };
        
        // 设置兽穴位置
        this.denPosition = {
            'blue': [8, 3], // 蓝方兽穴
            'red': [0, 3]   // 红方兽穴
        };
        
        // 放置初始棋子
        this.placePieces();
    }
    
    // 放置初始棋子
    placePieces() {
        // 蓝方棋子 (底部)
        this.board[6][0] = { type: 'elephant', player: 'blue' };
        this.board[6][1] = { type: 'lion', player: 'blue' };
        this.board[6][2] = { type: 'tiger', player: 'blue' };
        this.board[6][3] = { type: 'leopard', player: 'blue' };
        this.board[6][4] = { type: 'wolf', player: 'blue' };
        this.board[6][5] = { type: 'dog', player: 'blue' };
        this.board[6][6] = { type: 'cat', player: 'blue' };
        this.board[7][1] = { type: 'mouse', player: 'blue' };
        this.board[7][5] = { type: 'mouse', player: 'blue' };
        
        // 红方棋子 (顶部)
        this.board[0][6] = { type: 'elephant', player: 'red' };
        this.board[0][5] = { type: 'lion', player: 'red' };
        this.board[0][4] = { type: 'tiger', player: 'red' };
        this.board[0][3] = { type: 'leopard', player: 'red' };
        this.board[0][2] = { type: 'wolf', player: 'red' };
        this.board[0][1] = { type: 'dog', player: 'red' };
        this.board[0][0] = { type: 'cat', player: 'red' };
        this.board[1][1] = { type: 'mouse', player: 'red' };
        this.board[1][5] = { type: 'mouse', player: 'red' };
    }
    
    // 渲染棋盘
    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // 检查是否为河流
                if (this.isInRiver(row, col)) {
                    cell.classList.add('river');
                }
                
                // 检查是否为陷阱
                if (this.isInTrap(row, col)) {
                    cell.classList.add('trap');
                }
                
                // 检查是否为兽穴
                if (this.isDen(row, col)) {
                    cell.classList.add('den');
                }
                
                // 放置棋子
                const piece = this.board[row][col];
                if (piece) {
                    const animal = document.createElement('div');
                    animal.className = `animal ${piece.player}`;
                    animal.textContent = this.animalIcons[piece.type];
                    animal.dataset.type = piece.type;
                    animal.dataset.player = piece.player;
                    cell.appendChild(animal);
                }
                
                gameBoard.appendChild(cell);
            }
        }
    }
    
    // 检查位置是否在河中
    isInRiver(row, col) {
        return this.riverPositions.some(pos => pos[0] === row && pos[1] === col);
    }
    
    // 检查位置是否在陷阱中
    isInTrap(row, col) {
        return this.trapPositions.blue.some(pos => pos[0] === row && pos[1] === col) ||
               this.trapPositions.red.some(pos => pos[0] === row && pos[1] === col);
    }
    
    // 检查位置是否为兽穴
    isDen(row, col) {
        return (this.denPosition.blue[0] === row && this.denPosition.blue[1] === col) ||
               (this.denPosition.red[0] === row && this.denPosition.red[1] === col);
    }
    
    // 获取兽穴拥有者
    getDenOwner(row, col) {
        if (this.denPosition.blue[0] === row && this.denPosition.blue[1] === col) {
            return 'blue';
        }
        if (this.denPosition.red[0] === row && this.denPosition.red[1] === col) {
            return 'red';
        }
        return null;
    }
    
    // 附加事件监听器
    attachEventListeners() {
        document.getElementById('game-board').addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (!cell || this.gameOver) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            this.handleCellClick(row, col);
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undoMove();
        });
    }
    
    // 处理单元格点击
    handleCellClick(row, col) {
        const piece = this.board[row][col];
        
        // 如果点击的单元格有己方棋子
        if (piece && piece.player === this.currentPlayer) {
            this.selectPiece(row, col);
            return;
        }
        
        // 如果已经选择了棋子，尝试移动
        if (this.selectedPiece) {
            this.movePiece(row, col);
        }
    }
    
    // 选择棋子
    selectPiece(row, col) {
        // 清除之前的选择
        this.clearSelection();
        
        this.selectedPiece = { row, col };
        this.highlightValidMoves(row, col);
        
        // 高亮选中的棋子
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('selected');
    }
    
    // 高亮有效移动
    highlightValidMoves(row, col) {
        const validMoves = this.getValidMoves(row, col);
        
        for (const move of validMoves) {
            const cell = document.querySelector(`.cell[data-row="${move.row}"][data-col="${move.col}"]`);
            if (cell) {
                cell.classList.add('valid-move');
            }
        }
    }
    
    // 清除选择
    clearSelection() {
        // 移除所有高亮
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'valid-move');
        });
        
        this.selectedPiece = null;
    }
    
    // 获取有效移动
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        const directions = [
            [-1, 0], // 上
            [1, 0],  // 下
            [0, -1], // 左
            [0, 1]   // 右
        ];
        
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidMove(row, col, newRow, newCol)) {
                moves.push({ row: newRow, col: newCol });
            }
        }
        
        return moves;
    }
    
    // 检查移动是否有效
    isValidMove(fromRow, fromCol, toRow, toCol) {
        // 检查边界
        if (toRow < 0 || toRow >= 9 || toCol < 0 || toCol >= 7) {
            return false;
        }
        
        const fromPiece = this.board[fromRow][fromCol];
        const toPiece = this.board[toRow][toCol];
        
        // 检查是否为己方兽穴
        if (this.isDen(toRow, toCol) && this.getDenOwner(toRow, toCol) === fromPiece.player) {
            return false;
        }
        
        // 检查是否为对方兽穴（获胜条件）
        if (this.isDen(toRow, toCol) && this.getDenOwner(toRow, toCol) !== fromPiece.player) {
            return true;
        }
        
        // 检查是否为陷阱
        if (this.isInTrap(toRow, toCol) && this.getDenOwner(toRow, toCol) !== fromPiece.player) {
            return true; // 进入对方陷阱允许
        }
        
        // 检查是否为己方棋子
        if (toPiece && toPiece.player === fromPiece.player) {
            return false;
        }
        
        // 检查是否为相邻位置
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        
        if (rowDiff + colDiff !== 1) {
            return false; // 只能移动到相邻位置
        }
        
        // 检查跳跃规则（狮虎跳河）
        if ((fromPiece.type === 'lion' || fromPiece.type === 'tiger') && 
            this.isRiverJump(fromRow, fromCol, toRow, toCol)) {
            return this.canJumpRiver(fromRow, fromCol, toRow, toCol);
        }
        
        // 检查普通移动
        if (this.isInRiver(toRow, toCol)) {
            // 河流中的棋子只能被同在河流的棋子吃掉（除了鼠）
            if (toPiece && fromPiece.type !== 'mouse') {
                if (!this.isInRiver(fromRow, fromCol)) {
                    return false;
                }
            }
        }
        
        // 检查捕食规则
        if (toPiece) {
            return this.canCapture(fromPiece, toPiece);
        }
        
        return true;
    }
    
    // 检查是否为河跳跃
    isRiverJump(fromRow, fromCol, toRow, toCol) {
        // 水道水平跳跃
        if (fromRow === toRow && Math.abs(fromCol - toCol) > 1) {
            return (fromRow === 2 || fromRow === 3 || fromRow === 4) && 
                   ((fromCol === 1 && toCol === 4) || (fromCol === 4 && toCol === 1));
        }
        
        // 水道垂直跳跃
        if (fromCol === toCol && Math.abs(fromRow - toRow) > 1) {
            return (fromCol === 1 || fromCol === 2 || fromCol === 4 || fromCol === 5) && 
                   ((fromRow === 2 && toRow === 5) || (fromRow === 5 && toRow === 2));
        }
        
        return false;
    }
    
    // 检查是否可以跳跃河流
    canJumpRiver(fromRow, fromCol, toRow, toCol) {
        // 检查跳跃路径上是否有鼠
        if (fromRow === toRow && Math.abs(fromCol - toCol) > 1) { // 水平跳跃
            const startCol = Math.min(fromCol, toCol);
            const endCol = Math.max(fromCol, toCol);
            for (let col = startCol; col <= endCol; col++) {
                if (this.isInRiver(fromRow, col) && this.board[fromRow][col] && 
                    this.board[fromRow][col].type === 'mouse') {
                    return false; // 路径上有鼠，不能跳跃
                }
            }
        } else if (fromCol === toCol && Math.abs(fromRow - toRow) > 1) { // 垂直跳跃
            const startRow = Math.min(fromRow, toRow);
            const endRow = Math.max(fromRow, toRow);
            for (let row = startRow; row <= endRow; row++) {
                if (this.isInRiver(row, fromCol) && this.board[row][fromCol] && 
                    this.board[row][fromCol].type === 'mouse') {
                    return false; // 路径上有鼠，不能跳跃
                }
            }
        }
        
        return true;
    }
    
    // 检查是否可以捕食
    canCapture(fromPiece, toPiece) {
        // 鼠可以吃象，象不能吃鼠
        if (fromPiece.type === 'mouse' && toPiece.type === 'elephant') {
            return true;
        }
        if (fromPiece.type === 'elephant' && toPiece.type === 'mouse') {
            return false;
        }
        
        // 等级高的可以吃等级低的
        return this.animalRanks[fromPiece.type] >= this.animalRanks[toPiece.type];
    }
    
    // 移动棋子
    movePiece(toRow, toCol) {
        if (!this.selectedPiece) return;
        
        const { row: fromRow, col: fromCol } = this.selectedPiece;
        const piece = this.board[fromRow][fromCol];
        
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            this.clearSelection();
            return;
        }
        
        // 记录移动前的状态
        const prevState = JSON.parse(JSON.stringify(this.board));
        const prevPlayer = this.currentPlayer;
        
        // 执行移动
        const capturedPiece = this.board[toRow][toCol];
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // 记录移动到历史
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: capturedPiece,
            player: this.currentPlayer,
            boardState: prevState
        });
        
        // 检查是否获胜
        if (this.isDen(toRow, toCol) && this.getDenOwner(toRow, toCol) !== piece.player) {
            this.gameOver = true;
            document.getElementById('game-status').textContent = `${piece.player === 'blue' ? '蓝方' : '红方'} 获胜！`;
            document.getElementById('current-player').textContent = '游戏结束';
        } else {
            // 切换玩家
            this.currentPlayer = this.currentPlayer === 'blue' ? 'red' : 'blue';
            document.getElementById('current-player').textContent = this.currentPlayer === 'blue' ? '蓝方' : '红方';
        }
        
        // 清除选择并重新渲染
        this.clearSelection();
        this.renderBoard();
    }
    
    // 悔棋
    undoMove() {
        if (this.moveHistory.length === 0 || this.gameOver) return;
        
        const lastMove = this.moveHistory.pop();
        
        // 恢复棋盘状态
        this.board = lastMove.boardState;
        
        // 将移动的棋子放回原位置
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        
        // 如果有被吃掉的棋子，恢复它
        if (lastMove.captured) {
            this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured;
        }
        
        // 恢复玩家
        this.currentPlayer = lastMove.player;
        document.getElementById('current-player').textContent = this.currentPlayer === 'blue' ? '蓝方' : '红方';
        
        // 更新游戏状态
        if (this.gameOver) {
            this.gameOver = false;
            document.getElementById('game-status').textContent = '游戏进行中';
        }
        
        // 清除选择并重新渲染
        this.clearSelection();
        this.renderBoard();
    }
    
    // 重新开始游戏
    restartGame() {
        this.currentPlayer = 'blue';
        this.selectedPiece = null;
        this.gameOver = false;
        this.moveHistory = [];
        this.initBoard();
        this.renderBoard();
        document.getElementById('current-player').textContent = '蓝方';
        document.getElementById('game-status').textContent = '游戏进行中';
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new AnimalChess();
});