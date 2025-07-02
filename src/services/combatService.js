const { monsters, getRandomMonster, dungeons } = require('../data/monsters');
const { calculateDamage, getRandomInt, getRandomElement } = require('../utils/common');
const PlayerService = require('./playerService');
const QuestService = require('./questService');
const config = require('../../config');

class CombatService {
    // Hunt a random monster
    static async hunt(player) {
        // Get random monster based on player level
        const [monsterName, monsterData] = getRandomMonster(player.level);
        
        // Create monster instance
        const monster = {
            name: monsterName,
            ...monsterData,
            currentHp: monsterData.hp
        };
        
        // Simulate combat
        const combatResult = this.simulateCombat(player, monster);
        
        // Process results
        if (combatResult.victory) {
            // Award XP and gold
            const xpResult = await PlayerService.addXp(player, monster.xp);
            await PlayerService.addGold(player, combatResult.goldEarned);
            
            // Update stats
            await PlayerService.updateStats(player, {
                totalHunts: 1,
                monstersKilled: 1
            });
            
            // Check for item drops
            const droppedItems = this.calculateItemDrops(monster);
            for (const [itemName, quantity] of Object.entries(droppedItems)) {
                await PlayerService.addItem(player, itemName, quantity);
            }
            
            // Update quest progress
            await QuestService.updateQuestProgress(player, 'hunt');
            await QuestService.updateQuestProgress(player, 'monster_killed', { 
                monsterName: monster.name 
            });
            
            // Check achievements
            const achievements = await PlayerService.checkAchievements(player);
            
            return {
                success: true,
                victory: true,
                monster,
                damage: combatResult.damage,
                xp: monster.xp,
                gold: combatResult.goldEarned,
                items: droppedItems,
                levelUps: xpResult.levelUps,
                achievements,
                combatLog: combatResult.combatLog
            };
        } else {
            // Player lost - take damage
            await PlayerService.damagePlayer(player, combatResult.damage);
            
            return {
                success: true,
                victory: false,
                monster,
                damage: combatResult.damage,
                combatLog: combatResult.combatLog
            };
        }
    }
    
    // Simulate combat between player and monster
    static simulateCombat(player, monster) {
        const combatLog = [];
        let playerHp = player.hp;
        let monsterHp = monster.currentHp;
        
        // Combat loop
        while (playerHp > 0 && monsterHp > 0) {
            // Player attacks
            const playerAttack = calculateDamage(player, monster, config.GAME_CONFIG.COMBAT);
            monsterHp -= playerAttack.damage;
            
            combatLog.push({
                attacker: 'player',
                damage: playerAttack.damage,
                isCrit: playerAttack.isCrit,
                targetHp: Math.max(0, monsterHp)
            });
            
            if (monsterHp <= 0) break;
            
            // Monster attacks
            const monsterAttack = calculateDamage(monster, player, config.GAME_CONFIG.COMBAT);
            playerHp -= monsterAttack.damage;
            
            combatLog.push({
                attacker: 'monster',
                damage: monsterAttack.damage,
                isCrit: monsterAttack.isCrit,
                targetHp: Math.max(0, playerHp)
            });
        }
        
        const victory = monsterHp <= 0;
        const goldEarned = victory ? getRandomInt(monster.gold[0], monster.gold[1]) : 0;
        const damage = player.hp - playerHp;
        
        return {
            victory,
            goldEarned,
            damage: Math.max(0, damage),
            combatLog
        };
    }
    
    // Calculate item drops from monster
    static calculateItemDrops(monster) {
        const drops = {};
        
        if (monster.items && monster.dropRates) {
            for (const item of monster.items) {
                const dropRate = monster.dropRates[item] || 0.1;
                if (Math.random() < dropRate) {
                    drops[item] = 1;
                }
            }
        }
        
        return drops;
    }
    
    // Enter dungeon
    static async enterDungeon(player, dungeonName) {
        const dungeon = dungeons[dungeonName];
        if (!dungeon) {
            return { success: false, message: 'Dungeon tidak ditemukan' };
        }
        
        // Check level requirement
        if (player.level < dungeon.minLevel) {
            return { 
                success: false, 
                message: `Level minimum untuk dungeon ini: ${dungeon.minLevel}` 
            };
        }
        
        // Check HP requirement (at least 50% HP)
        if (player.hp < player.maxHp * 0.5) {
            return { 
                success: false, 
                message: 'HP kamu terlalu rendah untuk masuk dungeon! Heal terlebih dahulu.' 
            };
        }
        
        // Simulate dungeon run
        const dungeonResult = this.simulateDungeon(player, dungeon);
        
        // Process results
        if (dungeonResult.success) {
            // Award rewards
            const xpResult = await PlayerService.addXp(player, dungeon.rewards.xp);
            await PlayerService.addGold(player, dungeonResult.goldEarned);
            
            // Update stats
            await PlayerService.updateStats(player, {
                totalDungeons: 1,
                monstersKilled: dungeonResult.monstersKilled,
                bossesKilled: 1
            });
            
            // Award dungeon items
            const dungeonItems = this.calculateDungeonRewards(dungeon);
            for (const [itemName, quantity] of Object.entries(dungeonItems)) {
                await PlayerService.addItem(player, itemName, quantity);
            }
            
            // Update quest progress
            await QuestService.updateQuestProgress(player, 'dungeon_complete');
            await QuestService.updateQuestProgress(player, 'kill_boss');
            
            // Check achievements
            const achievements = await PlayerService.checkAchievements(player);
            
            // Damage player
            await PlayerService.damagePlayer(player, dungeonResult.damage);
            
            return {
                success: true,
                victory: true,
                dungeon,
                damage: dungeonResult.damage,
                xp: dungeon.rewards.xp,
                gold: dungeonResult.goldEarned,
                items: dungeonItems,
                levelUps: xpResult.levelUps,
                achievements,
                floors: dungeonResult.floors
            };
        } else {
            // Failed dungeon - take damage and lose some gold
            await PlayerService.damagePlayer(player, dungeonResult.damage);
            const goldLost = Math.min(player.gold, Math.floor(player.gold * 0.1));
            if (goldLost > 0) {
                await PlayerService.removeGold(player, goldLost);
            }
            
            return {
                success: true,
                victory: false,
                dungeon,
                damage: dungeonResult.damage,
                goldLost,
                floors: dungeonResult.floors
            };
        }
    }
    
    // Simulate dungeon run
    static simulateDungeon(player, dungeon) {
        const floors = [];
        let totalDamage = 0;
        let monstersKilled = 0;
        
        // Simulate each floor
        for (let floor = 1; floor <= dungeon.floors; floor++) {
            const isLastFloor = floor === dungeon.floors;
            let floorResult;
            
            if (isLastFloor) {
                // Boss floor
                const bossName = dungeon.boss;
                const bossData = monsters[bossName] || monsters['Dragon'];
                const boss = {
                    name: bossName,
                    ...bossData,
                    currentHp: bossData.hp
                };
                
                floorResult = this.simulateCombat(player, boss);
                floorResult.type = 'boss';
                floorResult.enemy = boss;
            } else {
                // Regular floor with random monster
                const monsterName = getRandomElement(dungeon.monsters);
                const monsterData = monsters[monsterName];
                const monster = {
                    name: monsterName,
                    ...monsterData,
                    currentHp: monsterData.hp
                };
                
                floorResult = this.simulateCombat(player, monster);
                floorResult.type = 'monster';
                floorResult.enemy = monster;
            }
            
            floors.push({
                floor,
                ...floorResult
            });
            
            totalDamage += floorResult.damage;
            
            if (floorResult.victory) {
                monstersKilled++;
            } else {
                // Failed on this floor
                return {
                    success: false,
                    damage: totalDamage,
                    floors,
                    monstersKilled
                };
            }
        }
        
        // Calculate total gold earned
        const goldEarned = getRandomInt(dungeon.rewards.gold[0], dungeon.rewards.gold[1]);
        
        return {
            success: true,
            damage: totalDamage,
            goldEarned,
            floors,
            monstersKilled
        };
    }
    
    // Calculate dungeon rewards
    static calculateDungeonRewards(dungeon) {
        const rewards = {};
        
        if (dungeon.rewards.items && dungeon.rewards.dropRates) {
            for (const item of dungeon.rewards.items) {
                const dropRate = dungeon.rewards.dropRates[item] || 0.1;
                if (Math.random() < dropRate) {
                    rewards[item] = 1;
                }
            }
        }
        
        return rewards;
    }
    
    // PvP duel against bot
    static async duel(player) {
        // Create bot opponent based on player level
        const botLevel = Math.max(1, player.level + getRandomInt(-2, 2));
        const bot = {
            name: `Bot Player (Level ${botLevel})`,
            level: botLevel,
            hp: botLevel * 50 + getRandomInt(-20, 20),
            attack: botLevel * 8 + getRandomInt(-5, 5),
            defense: botLevel * 3 + getRandomInt(-2, 2)
        };
        
        bot.currentHp = bot.hp;
        
        // Simulate combat
        const combatResult = this.simulateCombat(player, bot);
        
        if (combatResult.victory) {
            // Player wins
            const goldWon = Math.max(10, botLevel * 5);
            const xpWon = Math.max(5, botLevel * 3);
            
            const xpResult = await PlayerService.addXp(player, xpWon);
            await PlayerService.addGold(player, goldWon);
            
            // Update stats
            await PlayerService.updateStats(player, {
                totalDuels: 1
            });
            
            // Take some damage even when winning
            const damage = Math.floor(combatResult.damage * 0.5);
            await PlayerService.damagePlayer(player, damage);
            
            return {
                success: true,
                victory: true,
                bot,
                damage,
                xp: xpWon,
                gold: goldWon,
                levelUps: xpResult.levelUps,
                combatLog: combatResult.combatLog
            };
        } else {
            // Player loses
            const goldLost = Math.min(player.gold, Math.max(5, botLevel * 3));
            await PlayerService.removeGold(player, goldLost);
            await PlayerService.damagePlayer(player, combatResult.damage);
            
            // Update stats
            await PlayerService.updateStats(player, {
                totalDuels: 1
            });
            
            return {
                success: true,
                victory: false,
                bot,
                damage: combatResult.damage,
                goldLost,
                combatLog: combatResult.combatLog
            };
        }
    }
    
    // Format combat log for display
    static formatCombatLog(combatLog, playerName, enemyName) {
        const log = [];
        
        for (const entry of combatLog) {
            const attacker = entry.attacker === 'player' ? playerName : enemyName;
            const target = entry.attacker === 'player' ? enemyName : playerName;
            const critText = entry.isCrit ? ' (CRIT!)' : '';
            
            log.push(`${attacker} menyerang ${target} sebesar ${entry.damage} damage${critText}`);
        }
        
        return log.join('\n');
    }
    
    // Get available dungeons for player
    static getAvailableDungeons(player) {
        const available = [];
        
        for (const [dungeonName, dungeon] of Object.entries(dungeons)) {
            if (player.level >= dungeon.minLevel) {
                available.push({
                    name: dungeonName,
                    ...dungeon,
                    canEnter: player.hp >= player.maxHp * 0.5
                });
            }
        }
        
        return available;
    }
    
    // Get combat statistics
    static getCombatStats(player) {
        return {
            level: player.level,
            hp: player.hp,
            maxHp: player.maxHp,
            attack: player.attack,
            defense: player.defense,
            totalHunts: player.stats.totalHunts,
            totalDungeons: player.stats.totalDungeons,
            totalDuels: player.stats.totalDuels,
            monstersKilled: player.stats.monstersKilled,
            bossesKilled: player.stats.bossesKilled
        };
    }
}

module.exports = CombatService;

