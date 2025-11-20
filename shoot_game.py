#!/usr/bin/env python3
"""
简单单人射击游戏
玩家控制飞船，射击从上方飞来的敌机
"""

import random
import time
import os
import sys
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
        self.last_input_time = time.time()
        
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
        print("控制: A(左) D(右) W(上) S(下) 空格(射击) Q(退出)")
    
    def handle_input(self):
        """处理用户输入"""
        # 在实际应用中，这里会使用键盘输入库
        # 为了简化，我将模拟输入处理
        pass

    def run(self):
        """运行游戏主循环"""
        print("欢迎来到射击游戏！")
        print("按任意键开始游戏...")
        input()
        
        while not self.game_over:
            self.draw()
            self.update()
            
            # 获取用户输入
            print("请输入操作 (a/d/w/s/空格/q): ", end='', flush=True)
            try:
                # 使用非阻塞输入模拟
                user_input = input().strip().lower()
                
                if user_input == 'q':
                    print("游戏退出！")
                    return
                elif user_input == 'a':
                    self.move_player("left")
                elif user_input == 'd':
                    self.move_player("right")
                elif user_input == 'w':
                    self.move_player("up")
                elif user_input == 's':
                    self.move_player("down")
                elif user_input == ' ':
                    self.shoot()
            except:
                # 如果输入处理出错，继续游戏
                pass
            
            time.sleep(0.2)  # 控制游戏速度
        
        # 游戏结束
        self.draw()
        print(f"游戏结束！最终分数: {self.score}")
        print("按任意键退出...")
        input()


def main():
    game = ShootGame()
    game.run()


if __name__ == "__main__":
    main()