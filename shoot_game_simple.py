#!/usr/bin/env python3
"""
简单单人射击游戏
玩家控制飞船，射击从上方飞来的敌机
使用键盘方向键控制，空格射击
"""

import random
import time
import os
import sys
import threading
import msvcrt if os.name == 'nt' else None
from typing import List, Tuple


class GameEntity:
    """游戏实体基类"""
    def __init__(self, x: int, y: int, char: str):
        self.x = x
        self.y = y
        self.char = char


class Player(GameEntity):
    """玩家飞船"""
    def __init__(self, x: int, y: int):
        super().__init__(x, y, "^")
        self.health = 3


class Enemy(GameEntity):
    """敌机"""
    def __init__(self, x: int, y: int):
        super().__init__(x, y, "V")


class Bullet(GameEntity):
    """子弹"""
    def __init__(self, x: int, y: int):
        super().__init__(x, y, "|")


class ShootGame:
    """射击游戏主类"""
    def __init__(self, width: int = 20, height: int = 15):
        self.width = width
        self.height = height
        self.player = Player(width // 2, height - 1)
        self.enemies: List[Enemy] = []
        self.bullets: List[Bullet] = []
        self.score = 0
        self.game_over = False
        self.enemy_spawn_timer = 0
        self.enemy_spawn_interval = 10  # 敌机生成间隔
        self.input_queue = []
        self.input_thread = None
        
    def start_input_thread(self):
        """启动输入处理线程"""
        self.input_thread = threading.Thread(target=self.input_handler)
        self.input_thread.daemon = True
        self.input_thread.start()
    
    def input_handler(self):
        """处理键盘输入的线程函数"""
        while not self.game_over:
            if os.name == 'nt':  # Windows
                if msvcrt.kbhit():
                    key = msvcrt.getch().decode('utf-8').lower()
                    if key == '\xe0':  # Special key prefix
                        key = msvcrt.getch().decode('utf-8')
                        if key == 'K':  # Left arrow
                            self.input_queue.append('left')
                        elif key == 'M':  # Right arrow
                            self.input_queue.append('right')
                        elif key == 'H':  # Up arrow
                            self.input_queue.append('up')
                        elif key == 'P':  # Down arrow
                            self.input_queue.append('down')
                    elif key == ' ':
                        self.input_queue.append('shoot')
                    elif key == 'q':
                        self.input_queue.append('quit')
            else:  # Unix/Linux
                import select
                if select.select([sys.stdin], [], [], 0.01) == ([sys.stdin], [], []):
                    key = sys.stdin.read(1).lower()
                    if key == 'a':
                        self.input_queue.append('left')
                    elif key == 'd':
                        self.input_queue.append('right')
                    elif key == 'w':
                        self.input_queue.append('up')
                    elif key == 's':
                        self.input_queue.append('down')
                    elif key == ' ':
                        self.input_queue.append('shoot')
                    elif key == 'q':
                        self.input_queue.append('quit')
    
    def spawn_enemy(self):
        """生成敌机"""
        x = random.randint(0, self.width - 1)
        self.enemies.append(Enemy(x, 0))
    
    def move_player(self, direction: str):
        """移动玩家"""
        if direction == "left" and self.player.x > 0:
            self.player.x -= 1
        elif direction == "right" and self.player.x < self.width - 1:
            self.player.x += 1
        elif direction == "up" and self.player.y > 0:
            self.player.y -= 1
        elif direction == "down" and self.player.y < self.height - 1:
            self.player.y += 1
    
    def shoot(self):
        """发射子弹"""
        bullet = Bullet(self.player.x, self.player.y - 1)
        self.bullets.append(bullet)
    
    def update_enemies(self):
        """更新敌机位置"""
        for enemy in self.enemies[:]:
            enemy.y += 1
            # 检查敌机是否到达底部
            if enemy.y >= self.height:
                self.enemies.remove(enemy)
                self.player.health -= 1
                if self.player.health <= 0:
                    self.game_over = True
    
    def update_bullets(self):
        """更新子弹位置"""
        for bullet in self.bullets[:]:
            bullet.y -= 1
            # 移除超出屏幕的子弹
            if bullet.y < 0:
                self.bullets.remove(bullet)
    
    def check_collisions(self):
        """检查碰撞"""
        # 检查子弹与敌机的碰撞
        for bullet in self.bullets[:]:
            for enemy in self.enemies[:]:
                if bullet.x == enemy.x and bullet.y == enemy.y:
                    # 碰撞发生
                    if bullet in self.bullets:
                        self.bullets.remove(bullet)
                    if enemy in self.enemies:
                        self.enemies.remove(enemy)
                    self.score += 10
                    break
    
    def check_player_enemy_collision(self):
        """检查玩家与敌机的碰撞"""
        for enemy in self.enemies:
            if self.player.x == enemy.x and self.player.y == enemy.y:
                self.player.health -= 1
                self.enemies.remove(enemy)
                if self.player.health <= 0:
                    self.game_over = True
                break
    
    def update(self):
        """更新游戏状态"""
        if self.game_over:
            return
            
        # 处理输入队列
        while self.input_queue:
            command = self.input_queue.pop(0)
            if command == 'left':
                self.move_player("left")
            elif command == 'right':
                self.move_player("right")
            elif command == 'up':
                self.move_player("up")
            elif command == 'down':
                self.move_player("down")
            elif command == 'shoot':
                self.shoot()
            elif command == 'quit':
                self.game_over = True
                return
        
        # 生成敌机
        self.enemy_spawn_timer += 1
        if self.enemy_spawn_timer >= self.enemy_spawn_interval:
            self.spawn_enemy()
            self.enemy_spawn_timer = 0
            # 随着分数增加，加快敌机生成速度
            if self.score > 0 and self.score % 50 == 0:
                self.enemy_spawn_interval = max(5, self.enemy_spawn_interval - 1)
        
        self.update_enemies()
        self.update_bullets()
        self.check_collisions()
        self.check_player_enemy_collision()
    
    def draw(self):
        """绘制游戏画面"""
        # 清屏
        os.system('cls' if os.name == 'nt' else 'clear')
        
        # 创建游戏画布
        canvas = [[' ' for _ in range(self.width)] for _ in range(self.height)]
        
        # 绘制玩家
        canvas[self.player.y][self.player.x] = self.player.char
        
        # 绘制敌机
        for enemy in self.enemies:
            if 0 <= enemy.y < self.height and 0 <= enemy.x < self.width:
                canvas[enemy.y][enemy.x] = enemy.char
        
        # 绘制子弹
        for bullet in self.bullets:
            if 0 <= bullet.y < self.height and 0 <= bullet.x < self.width:
                canvas[bullet.y][bullet.x] = bullet.char
        
        # 打印画布
        print("+" + "-" * self.width + "+")
        for row in canvas:
            print("|" + "".join(row) + "|")
        print("+" + "-" * self.width + "+")
        
        # 打印游戏信息
        print(f"生命值: {self.player.health} | 分数: {self.score}")
        print("控制: 方向键(移动) 空格(射击) Q(退出)")
    
    def run(self):
        """运行游戏主循环"""
        print("欢迎来到射击游戏！")
        print("按 Enter 键开始游戏...")
        input()
        
        # 启动输入处理线程
        self.start_input_thread()
        
        while not self.game_over:
            self.draw()
            self.update()
            time.sleep(0.1)  # 控制游戏速度
        
        # 游戏结束
        self.draw()
        print(f"\n游戏结束！最终分数: {self.score}")
        print("按 Enter 键退出...")
        input()


def main():
    game = ShootGame()
    game.run()


if __name__ == "__main__":
    main()
