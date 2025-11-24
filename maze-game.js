// 游戏状态
let game = {
    canvas: null,
    ctx: null,
    maze: [],
    cellSize: 0,
    player: { x: 0, y: 0 },
    finish: { x: 0, y: 0 },
    startTime: 0,
    currentTime: 0,
    moves: 0,
    timerInterval: null,
    isGameRunning: false,
    difficulty: 'medium',
    timerMode: 'stopwatch'
};

// 初始化游戏
function init() {
    game.canvas = document.getElementById('maze-canvas');
    game.ctx = game.canvas.getContext('2d');
    
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
    
    // 键盘控制
    document.addEventListener('keydown', handleKeyPress);
    
    // 难度和计时模式变化事件
    document.getElementById('difficulty').addEventListener('change', function() {
        game.difficulty = this.value;
    });
    
    document.getElementById('timer-mode').addEventListener('change', function() {
        game.timerMode = this.value;
    });
    
    // 初始化迷宫
    updateCanvasSize();
    drawStartScreen();
}

// 根据难度更新画布大小
function updateCanvasSize() {
    const size = getMazeSize();
    game.canvas.width = size * 30;
    game.canvas.height = size * 30;
    game.cellSize = Math.min(30, Math.floor(game.canvas.width / size));
}

// 获取迷宫尺寸
function getMazeSize() {
    switch(game.difficulty) {
        case 'easy': return 10;
        case 'medium': return 15;
        case 'hard': return 20;
        default: return 15;
    }
}

// 绘制开始界面
function drawStartScreen() {
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    game.ctx.fillStyle = '#4a5568';
    game.ctx.font = '20px Arial';
    game.ctx.textAlign = 'center';
    game.ctx.fillText('点击"开始游戏"创建迷宫', game.canvas.width/2, game.canvas.height/2);
}

// 生成迷宫 (使用深度优先搜索算法)
function generateMaze() {
    const size = getMazeSize();
    game.maze = Array(size).fill().map(() => Array(size).fill({ top: true, right: true, bottom: true, left: true, visited: false }));
    
    // 使用深度优先搜索生成迷宫
    const stack = [];
    let current = { x: 0, y: 0 };
    game.maze[0][0].visited = true;
    
    while (true) {
        const neighbors = getUnvisitedNeighbors(current, size);
        
        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            // 移除墙壁
            removeWall(current, next);
            
            stack.push(current);
            current = next;
            game.maze[current.y][current.x].visited = true;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else {
            break;
        }
    }
    
    // 设置起点和终点
    game.player = { x: 0, y: 0 };
    game.finish = { x: size - 1, y: size - 1 };
}

// 获取未访问的邻居
function getUnvisitedNeighbors(cell, size) {
    const neighbors = [];
    const directions = [
        { x: 0, y: -1, wall: 'top' },  // 上
        { x: 1, y: 0, wall: 'right' }, // 右
        { x: 0, y: 1, wall: 'bottom' }, // 下
        { x: -1, y: 0, wall: 'left' }  // 左
    ];
    
    for (const dir of directions) {
        const nx = cell.x + dir.x;
        const ny = cell.y + dir.y;
        
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && !game.maze[ny][nx].visited) {
            neighbors.push({ x: nx, y: ny, wall: dir.wall });
        }
    }
    
    return neighbors;
}

// 移除墙壁
function removeWall(current, next) {
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    
    if (dx === 1) { // 右
        game.maze[current.y][current.x].right = false;
        game.maze[next.y][next.x].left = false;
    } else if (dx === -1) { // 左
        game.maze[current.y][current.x].left = false;
        game.maze[next.y][next.x].right = false;
    } else if (dy === 1) { // 下
        game.maze[current.y][current.x].bottom = false;
        game.maze[next.y][next.x].top = false;
    } else if (dy === -1) { // 上
        game.maze[current.y][current.x].top = false;
        game.maze[next.y][next.x].bottom = false;
    }
}

// 绘制迷宫
function drawMaze() {
    const size = getMazeSize();
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    
    // 绘制网格
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = game.maze[y][x];
            const px = x * game.cellSize;
            const py = y * game.cellSize;
            
            // 绘制墙壁
            game.ctx.strokeStyle = '#2d3748';
            game.ctx.lineWidth = 2;
            
            if (cell.top) {
                game.ctx.beginPath();
                game.ctx.moveTo(px, py);
                game.ctx.lineTo(px + game.cellSize, py);
                game.ctx.stroke();
            }
            if (cell.right) {
                game.ctx.beginPath();
                game.ctx.moveTo(px + game.cellSize, py);
                game.ctx.lineTo(px + game.cellSize, py + game.cellSize);
                game.ctx.stroke();
            }
            if (cell.bottom) {
                game.ctx.beginPath();
                game.ctx.moveTo(px, py + game.cellSize);
                game.ctx.lineTo(px + game.cellSize, py + game.cellSize);
                game.ctx.stroke();
            }
            if (cell.left) {
                game.ctx.beginPath();
                game.ctx.moveTo(px, py);
                game.ctx.lineTo(px, py + game.cellSize);
                game.ctx.stroke();
            }
        }
    }
    
    // 绘制起点
    game.ctx.fillStyle = '#48bb78';
    game.ctx.fillRect(
        game.player.x * game.cellSize + game.cellSize * 0.2,
        game.player.y * game.cellSize + game.cellSize * 0.2,
        game.cellSize * 0.6,
        game.cellSize * 0.6
    );
    
    // 绘制终点
    game.ctx.fillStyle = '#e53e3e';
    game.ctx.fillRect(
        game.finish.x * game.cellSize + game.cellSize * 0.2,
        game.finish.y * game.cellSize + game.cellSize * 0.2,
        game.cellSize * 0.6,
        game.cellSize * 0.6
    );
}

// 开始游戏
function startGame() {
    game.isGameRunning = true;
    game.moves = 0;
    updateCanvasSize();
    generateMaze();
    drawMaze();
    resetTimer();
    startTimer();
    
    document.getElementById('moves').textContent = '0';
    document.getElementById('win-message').classList.add('hidden');
}

// 重置计时器
function resetTimer() {
    if (game.timerInterval) {
        clearInterval(game.timerInterval);
        game.timerInterval = null;
    }
    
    game.startTime = Date.now();
    game.currentTime = 0;
    updateTimerDisplay();
}

// 开始计时
function startTimer() {
    if (game.timerMode === 'none') return;
    
    game.timerInterval = setInterval(() => {
        game.currentTime = Date.now() - game.startTime;
        updateTimerDisplay();
        
        // 如果是倒计时模式，检查时间是否用完
        if (game.timerMode === 'countdown') {
            if (game.currentTime >= 300000) { // 5分钟
                clearInterval(game.timerInterval);
                alert('时间到！游戏结束！');
            }
        }
    }, 100);
}

// 更新计时器显示
function updateTimerDisplay() {
    const timeDisplay = document.getElementById('time');
    const seconds = Math.floor(game.currentTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;
    
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
}

// 处理键盘按键
function handleKeyPress(e) {
    if (!game.isGameRunning) return;
    
    let newX = game.player.x;
    let newY = game.player.y;
    
    switch(e.key) {
        case 'ArrowUp':
            if (!game.maze[game.player.y][game.player.x].top) {
                newY--;
            }
            break;
        case 'ArrowDown':
            if (!game.maze[game.player.y][game.player.x].bottom) {
                newY++;
            }
            break;
        case 'ArrowLeft':
            if (!game.maze[game.player.y][game.player.x].left) {
                newX--;
            }
            break;
        case 'ArrowRight':
            if (!game.maze[game.player.y][game.player.x].right) {
                newX++;
            }
            break;
        default:
            return;
    }
    
    // 检查边界
    const size = getMazeSize();
    if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
        game.player.x = newX;
        game.player.y = newY;
        game.moves++;
        document.getElementById('moves').textContent = game.moves;
        
        drawMaze();
        checkWin();
    }
}

// 检查是否获胜
function checkWin() {
    if (game.player.x === game.finish.x && game.player.y === game.finish.y) {
        endGame();
    }
}

// 结束游戏
function endGame() {
    game.isGameRunning = false;
    clearInterval(game.timerInterval);
    
    document.getElementById('win-time').textContent = document.getElementById('time').textContent;
    document.getElementById('win-moves').textContent = game.moves;
    document.getElementById('win-message').classList.remove('hidden');
}

// 页面加载完成后初始化
window.onload = init;