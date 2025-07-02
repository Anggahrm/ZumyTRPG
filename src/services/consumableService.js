const { consumables } = require('../data/consumables');
const PlayerService = require('./playerService');
const Player = require('../models/Player');

class ConsumableService {
    /**
     * Use a consumable item
     */
    static async useConsumable(player, itemName, quantity = 1) {
        const consumable = consumables[itemName];
        
        if (!consumable) {
            return { success: false, error: 'Item tidak dapat digunakan' };
        }
        
        // Check if player has the item
        const playerQuantity = player.inventory.get(itemName) || 0;
        if (playerQuantity < quantity) {
            return { success: false, error: 'Kamu tidak memiliki item ini' };
        }
        
        // Check cooldown
        const cooldownKey = `consumable_${consumable.id}`;
        const lastUsed = player.consumableCooldowns?.get(cooldownKey);
        if (lastUsed && consumable.cooldown > 0) {
            const now = Date.now();
            const timeSinceLastUse = now - lastUsed;
            if (timeSinceLastUse < consumable.cooldown * 1000) {
                const remainingCooldown = Math.ceil((consumable.cooldown * 1000 - timeSinceLastUse) / 1000 / 60);
                return { 
                    success: false, 
                    error: `Item masih cooldown. Sisa waktu: ${remainingCooldown} menit` 
                };
            }
        }
        
        // Apply effects
        const result = await this.applyConsumableEffect(player, consumable, quantity);
        
        if (result.success) {
            // Remove item from inventory
            await PlayerService.removeItem(player.userId, itemName, quantity);
            
            // Set cooldown
            if (consumable.cooldown > 0) {
                await Player.updateOne(
                    { userId: player.userId },
                    { $set: { [`consumableCooldowns.${cooldownKey}`]: Date.now() } }
                );
            }
        }
        
        return result;
    }
    
    /**
     * Apply consumable effects to player
     */
    static async applyConsumableEffect(player, consumable, quantity = 1) {
        const effect = consumable.effect;
        const updates = {};
        const results = [];
        
        try {
            // Healing effects
            if (effect.hp) {
                let healAmount;
                if (effect.hp === 'full') {
                    healAmount = player.maxHp - player.hp;
                    updates.hp = player.maxHp;
                } else {
                    healAmount = effect.hp * quantity;
                    updates.hp = Math.min(player.hp + healAmount, player.maxHp);
                }
                
                if (healAmount > 0) {
                    results.push(`❤️ +${healAmount} HP`);
                }
            }
            
            // Cooldown reduction
            if (effect.cooldown_reduction) {
                const reduction = effect.cooldown_reduction * quantity;
                const now = new Date();
                
                // Reduce hunt cooldown
                if (player.lastHunt) {
                    const newHuntTime = new Date(player.lastHunt.getTime() - reduction);
                    if (newHuntTime < now) {
                        updates.lastHunt = null;
                    } else {
                        updates.lastHunt = newHuntTime;
                    }
                }
                
                // Reduce adventure cooldown
                if (player.lastAdventure) {
                    const newAdvTime = new Date(player.lastAdventure.getTime() - reduction);
                    if (newAdvTime < now) {
                        updates.lastAdventure = null;
                    } else {
                        updates.lastAdventure = newAdvTime;
                    }
                }
                
                // Reduce work cooldown
                if (player.lastWork) {
                    const newWorkTime = new Date(player.lastWork.getTime() - reduction);
                    if (newWorkTime < now) {
                        updates.lastWork = null;
                    } else {
                        updates.lastWork = newWorkTime;
                    }
                }
                
                results.push(`⏰ Cooldown dikurangi ${Math.floor(reduction / 60000)} menit`);
            }
            
            // Reset all cooldowns
            if (effect.reset_cooldowns) {
                updates.lastHunt = null;
                updates.lastAdventure = null;
                updates.lastWork = null;
                results.push(`⚡ Semua cooldown direset!`);
            }
            
            // Buff effects
            if (effect.attack_multiplier || effect.defense_multiplier || effect.luck_multiplier || effect.xp_multiplier) {
                const buffDuration = effect.duration || (30 * 60 * 1000); // Default 30 minutes
                const expiresAt = new Date(Date.now() + buffDuration);
                
                const buffs = player.activeBuffs || [];
                
                if (effect.attack_multiplier) {
                    buffs.push({
                        type: 'attack_multiplier',
                        value: effect.attack_multiplier,
                        expiresAt,
                        source: consumable.name
                    });
                    results.push(`💪 Attack boost ${Math.floor((effect.attack_multiplier - 1) * 100)}% untuk ${Math.floor(buffDuration / 60000)} menit`);
                }
                
                if (effect.defense_multiplier) {
                    buffs.push({
                        type: 'defense_multiplier',
                        value: effect.defense_multiplier,
                        expiresAt,
                        source: consumable.name
                    });
                    results.push(`🛡️ Defense boost ${Math.floor((effect.defense_multiplier - 1) * 100)}% untuk ${Math.floor(buffDuration / 60000)} menit`);
                }
                
                if (effect.luck_multiplier) {
                    buffs.push({
                        type: 'luck_multiplier',
                        value: effect.luck_multiplier,
                        expiresAt,
                        source: consumable.name
                    });
                    results.push(`🍀 Luck boost ${Math.floor((effect.luck_multiplier - 1) * 100)}% untuk ${Math.floor(buffDuration / 60000)} menit`);
                }
                
                if (effect.xp_multiplier) {
                    buffs.push({
                        type: 'xp_multiplier',
                        value: effect.xp_multiplier,
                        expiresAt,
                        source: consumable.name
                    });
                    results.push(`⭐ XP boost ${Math.floor((effect.xp_multiplier - 1) * 100)}% untuk ${Math.floor(buffDuration / 60000)} menit`);
                }
                
                updates.activeBuffs = buffs;
            }
            
            // Stat bonus effects (temporary)
            if (effect.attack_bonus || effect.defense_bonus) {
                const buffDuration = effect.duration || (30 * 60 * 1000);
                const expiresAt = new Date(Date.now() + buffDuration);
                const buffs = player.activeBuffs || [];
                
                if (effect.attack_bonus) {
                    buffs.push({
                        type: 'attack_bonus',
                        value: effect.attack_bonus,
                        expiresAt,
                        source: consumable.name
                    });
                    results.push(`⚔️ +${effect.attack_bonus} attack untuk ${Math.floor(buffDuration / 60000)} menit`);
                }
                
                if (effect.defense_bonus) {
                    buffs.push({
                        type: 'defense_bonus',
                        value: effect.defense_bonus,
                        expiresAt,
                        source: consumable.name
                    });
                    results.push(`🛡️ +${effect.defense_bonus} defense untuk ${Math.floor(buffDuration / 60000)} menit`);
                }
                
                updates.activeBuffs = buffs;
            }
            
            // Cure effects
            if (effect.cure_poison || effect.cure_debuffs) {
                // Remove negative buffs
                const buffs = player.activeBuffs || [];
                const cleanBuffs = buffs.filter(buff => 
                    !buff.type.includes('poison') && 
                    !buff.type.includes('curse') &&
                    !buff.type.includes('debuff')
                );
                updates.activeBuffs = cleanBuffs;
                results.push(`🧪 Efek negatif dihilangkan`);
            }
            
            // Revive effect
            if (effect.revive && player.hp <= 0) {
                updates.hp = effect.hp === 'full' ? player.maxHp : effect.hp;
                results.push(`🪶 Kamu dihidupkan kembali!`);
            }
            
            // Apply updates to database
            if (Object.keys(updates).length > 0) {
                await Player.updateOne({ userId: player.userId }, { $set: updates });
                
                // Update local player object
                Object.assign(player, updates);
            }
            
            return {
                success: true,
                results,
                message: results.join('\n')
            };
            
        } catch (error) {
            console.error('Error applying consumable effect:', error);
            return {
                success: false,
                error: 'Terjadi error saat menggunakan item'
            };
        }
    }
    
    /**
     * Get player's active buffs with remaining time
     */
    static getActiveBuffs(player) {
        const now = new Date();
        const activeBuffs = (player.activeBuffs || []).filter(buff => 
            new Date(buff.expiresAt) > now
        );
        
        return activeBuffs.map(buff => ({
            ...buff,
            remainingTime: Math.max(0, new Date(buff.expiresAt) - now)
        }));
    }
    
    /**
     * Clean expired buffs from player
     */
    static async cleanExpiredBuffs(player) {
        const now = new Date();
        const activeBuffs = (player.activeBuffs || []).filter(buff => 
            new Date(buff.expiresAt) > now
        );
        
        if (activeBuffs.length !== (player.activeBuffs || []).length) {
            await Player.updateOne(
                { userId: player.userId },
                { $set: { activeBuffs } }
            );
            return true;
        }
        
        return false;
    }
    
    /**
     * Calculate total stats with buffs
     */
    static calculateBuffedStats(player) {
        const activeBuffs = this.getActiveBuffs(player);
        
        let attack = player.attack;
        let defense = player.defense;
        let attackMultiplier = 1;
        let defenseMultiplier = 1;
        let luckMultiplier = 1;
        let xpMultiplier = 1;
        
        for (const buff of activeBuffs) {
            switch (buff.type) {
                case 'attack_bonus':
                    attack += buff.value;
                    break;
                case 'defense_bonus':
                    defense += buff.value;
                    break;
                case 'attack_multiplier':
                    attackMultiplier *= buff.value;
                    break;
                case 'defense_multiplier':
                    defenseMultiplier *= buff.value;
                    break;
                case 'luck_multiplier':
                    luckMultiplier *= buff.value;
                    break;
                case 'xp_multiplier':
                    xpMultiplier *= buff.value;
                    break;
            }
        }
        
        return {
            attack: Math.floor(attack * attackMultiplier),
            defense: Math.floor(defense * defenseMultiplier),
            luckMultiplier,
            xpMultiplier,
            activeBuffs
        };
    }
    
    /**
     * Auto-use consumables (like Phoenix Feather on death)
     */
    static async autoUseConsumables(player, trigger) {
        const autoUsableItems = Object.entries(consumables)
            .filter(([name, item]) => item.autoUse && player.inventory.get(name) > 0);
        
        const results = [];
        
        for (const [itemName, item] of autoUsableItems) {
            if (trigger === 'death' && item.effect.revive && player.hp <= 0) {
                const result = await this.useConsumable(player, itemName, 1);
                if (result.success) {
                    results.push(`🪶 ${itemName} digunakan otomatis!`);
                }
            }
        }
        
        return results;
    }
    
    /**
     * Format buff display for UI
     */
    static formatBuffDisplay(activeBuffs) {
        if (!activeBuffs || activeBuffs.length === 0) {
            return 'Tidak ada buff aktif';
        }
        
        return activeBuffs.map(buff => {
            const remainingMinutes = Math.ceil(buff.remainingTime / 60000);
            const emoji = this.getBuffEmoji(buff.type);
            const name = this.getBuffName(buff.type);
            
            return `${emoji} ${name} (${remainingMinutes}m)`;
        }).join('\n');
    }
    
    static getBuffEmoji(type) {
        const emojis = {
            'attack_multiplier': '💪',
            'defense_multiplier': '🛡️',
            'luck_multiplier': '🍀',
            'xp_multiplier': '⭐',
            'attack_bonus': '⚔️',
            'defense_bonus': '🛡️'
        };
        return emojis[type] || '✨';
    }
    
    static getBuffName(type) {
        const names = {
            'attack_multiplier': 'Attack Boost',
            'defense_multiplier': 'Defense Boost',
            'luck_multiplier': 'Luck Boost',
            'xp_multiplier': 'XP Boost',
            'attack_bonus': 'Attack Bonus',
            'defense_bonus': 'Defense Bonus'
        };
        return names[type] || 'Unknown Buff';
    }
}

module.exports = ConsumableService;
