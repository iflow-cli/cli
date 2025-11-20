// 跳一跳游戏逻辑
document.addEventListener('DOMContentLoaded', () => {
    // 游戏元素
    const gameBoard = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    // 游戏状态
    let gameActive = false;
    let score = 0;
    let highScore = localStorage.getItem('jumpGameHighScore') || 0;
    let player = null;
    let platforms = [];
    let currentPlayerPosition = { x: 0, y: 0 };
    let currentPlatformIndex = 0;
    let power = 0;
    let isCharging = false;
    let chargeInterval = null;
    
    // 游戏配置
    const config = {
        gravity: 0.5,
        jumpStrength: 15,
        playerSize: 30,
        platformWidth: 100,
        platformHeight: 20,
        gameWidth: gameBoard.clientWidth,
        gameHeight: gameBoard.clientHeight,
        platformGap: 150
    };
    
    // 更新最高分显示
    highScoreElement.textContent = highScore;
    
    // 创建平台
    function createPlatform(x, y, width = config.platformWidth) {
        const platform = document.createElement('div');
        platform.className = 'platform';
        platform.style.left = `${x}px`;
        platform.style.top = `${y}px`;
        platform.style.width = `${width}px`;
        platform.style.height = `${config.platformHeight}px`;
        gameBoard.appendChild(platform);
        
        return {
            element: platform,
            x: x,
            y: y,
            width: width,
            height: config.platformHeight
        };
    }
    
    // 创建玩家
    function createPlayer(x, y) {
        player = document.createElement('div');
        player.className = 'player';
        player.style.left = `${x}px`;
        player.style.top = `${y}px`;
        gameBoard.appendChild(player);
        
        currentPlayerPosition = { x, y };
    }
    
    // 初始化游戏
    function initGame() {
        // 清除现有元素
        while (gameBoard.firstChild) {
            gameBoard.removeChild(gameBoard.firstChild);
        }
        
        // 重置游戏状态
        score = 0;
        scoreElement.textContent = score;
        currentPlatformIndex = 0;
        platforms = [];
        
        // 创建初始平台
        const startY = config.gameHeight - 100;
        const platform1 = createPlatform(
            (config.gameWidth - config.platformWidth) / 2, 
            startY
        );
        platforms.push(platform1);
        
        // 创建几个初始平台
        let lastX = platform1.x;
        let lastY = platform1.y;
        
        for (let i = 1; i < 5; i++) {
            const newX = Math.max(50, Math.min(config.gameWidth - config.platformWidth - 50, 
                lastX + (Math.random() * 200 - 100)));
            const newY = lastY - (config.platformGap + Math.random() * 50 - 25);
            
            if (newY > 50) { // 确保平台不会太高
                const platform = createPlatform(newX, newY);
                platforms.push(platform);
                lastX = platform.x;
                lastY = platform.y;
            }
        }
        
        // 创建玩家并放在第一个平台上
        createPlayer(
            platform1.x + platform1.width / 2 - config.playerSize / 2,
            platform1.y - config.playerSize
        );
    }
    
    // 跳跃功能
    function jump() {
        if (!gameActive || !player) return;
        
        // 计算跳跃向量（基于蓄力值和鼠标位置）
        const jumpDistance = power * config.jumpStrength / 100;
        
        // 计算目标平台
        const nextPlatformIndex = currentPlatformIndex + 1;
        if (nextPlatformIndex >= platforms.length) {
            // 如果没有下一个平台，创建一个新平台
            createNextPlatform();
        }
        
        const targetPlatform = platforms[nextPlatformIndex];
        
        // 计算跳跃方向
        const dx = targetPlatform.x + targetPlatform.width/2 - currentPlayerPosition.x - config.playerSize/2;
        const dy = targetPlatform.y - currentPlayerPosition.y - config.playerSize;
        
        // 归一化并应用跳跃距离
        const distance = Math.sqrt(dx * dx + dy * dy);
        const ratio = jumpDistance / distance;
        
        const moveX = dx * ratio;
        const moveY = dy * ratio;
        
        // 执行跳跃动画
        animateJump(moveX, moveY, targetPlatform);
    }
    
    // 创建下一个平台
    function createNextPlatform() {
        const lastPlatform = platforms[platforms.length - 1];
        const newX = Math.max(50, Math.min(config.gameWidth - config.platformWidth - 50, 
            lastPlatform.x + (Math.random() * 200 - 100)));
        const newY = lastPlatform.y - (config.platformGap + Math.random() * 50 - 25);
        
        if (newY > 50) { // 确保平台不会太高
            const platform = createPlatform(newX, newY);
            platforms.push(platform);
        }
    }
    
    // 执行跳跃动画
    function animateJump(moveX, moveY, targetPlatform) {
        player.classList.add('jumping');
        let currentX = currentPlayerPosition.x;
        let currentY = currentPlayerPosition.y;
        
        // 使用抛物线轨迹
        const totalTime = 30; // 动画总帧数
        let currentFrame = 0;
        
        const jumpInterval = setInterval(() => {
            currentFrame++;
            
            // 计算抛物线轨迹
            const progress = currentFrame / totalTime;
            const x = currentPlayerPosition.x + moveX * progress;
            const y = currentPlayerPosition.y + moveY * progress - 200 * Math.sin(progress * Math.PI);
            
            player.style.left = `${x}px`;
            player.style.top = `${y}px`;
            
            if (currentFrame >= totalTime) {
                clearInterval(jumpInterval);
                
                // 检查是否成功着陆
                const landingX = x + config.playerSize / 2;
                const landingY = y + config.playerSize;
                
                if (landingX >= targetPlatform.x && 
                    landingX <= targetPlatform.x + targetPlatform.width &&
                    landingY >= targetPlatform.y && 
                    landingY <= targetPlatform.y + targetPlatform.height + 20) {
                    
                    // 成功着陆
                    currentPlayerPosition = {
                        x: x,
                        y: targetPlatform.y - config.playerSize
                    };
                    
                    player.style.left = `${currentPlayerPosition.x}px`;
                    player.style.top = `${currentPlayerPosition.y}px`;
                    
                    // 更新分数
                    score++;
                    scoreElement.textContent = score;
                    currentPlatformIndex++;
                    
                    // 更新最高分
                    if (score > highScore) {
                        highScore = score;
                        highScoreElement.textContent = highScore;
                        localStorage.setItem('jumpGameHighScore', highScore);
                    }
                } else {
                    // 失败，游戏结束
                    gameOver();
                }
                
                player.classList.remove('jumping');
            }
        }, 30);
    }
    
    // 游戏结束
    function gameOver() {
        gameActive = false;
        
        // 创建游戏结束界面
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <h2>游戏结束!</h2>
            <p>最终得分: ${score}</p>
            <p>最高分: ${highScore}</p>
            <button id="continue-btn" class="btn">再玩一次</button>
        `;
        gameBoard.appendChild(gameOverDiv);
        
        // 隐藏开始按钮，显示重新开始按钮
        startBtn.classList.add('hidden');
        restartBtn.classList.remove('hidden');
        
        document.getElementById('continue-btn').addEventListener('click', () => {
            initGame();
            gameOverDiv.remove();
            restartBtn.classList.add('hidden');
        });
    }
    
    // 开始游戏
    function startGame() {
        gameActive = true;
        startBtn.classList.add('hidden');
        restartBtn.classList.add('hidden');
        initGame();
    }
    
    // 重新开始游戏
    function restartGame() {
        initGame();
        gameActive = true;
        startBtn.classList.add('hidden');
        restartBtn.classList.add('hidden');
    }
    
    // 蓄力功能
    function startCharging() {
        if (!gameActive) return;
        
        isCharging = true;
        power = 0;
        
        chargeInterval = setInterval(() => {
            if (isCharging) {
                power = (power + 1) % 100;
                updatePowerMeter();
            }
        }, 20);
    }
    
    function stopCharging() {
        if (!isCharging) return;
        
        isCharging = false;
        if (chargeInterval) {
            clearInterval(chargeInterval);
        }
        
        // 执行跳跃
        jump();
        
        // 重置蓄力条
        power = 0;
        updatePowerMeter();
    }
    
    // 更新蓄力条
    function updatePowerMeter() {
        let powerMeter = document.querySelector('.power-meter');
        if (!powerMeter) {
            powerMeter = document.createElement('div');
            powerMeter.className = 'power-meter';
            gameBoard.appendChild(powerMeter);
            
            const powerFill = document.createElement('div');
            powerFill.className = 'power-fill';
            powerMeter.appendChild(powerFill);
        }
        
        const powerFill = powerMeter.querySelector('.power-fill');
        powerFill.style.width = `${power}%`;
    }
    
    // 事件监听器
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    
    // 鼠标/触摸事件
    gameBoard.addEventListener('mousedown', (e) => {
        if (gameActive) {
            startCharging();
        }
    });
    
    gameBoard.addEventListener('mouseup', () => {
        if (gameActive && isCharging) {
            stopCharging();
        }
    });
    
    gameBoard.addEventListener('mouseleave', () => {
        if (gameActive && isCharging) {
            stopCharging();
        }
    });
    
    // 触摸设备支持
    gameBoard.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameActive) {
            startCharging();
        }
    });
    
    gameBoard.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (gameActive && isCharging) {
            stopCharging();
        }
    });
    
    // 初始化最高分显示
    highScoreElement.textContent = highScore;
});