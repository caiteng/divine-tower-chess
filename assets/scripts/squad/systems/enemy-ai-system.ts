import { ENEMY_STATS, SQUAD_UNIT_STATS } from '../config/squad-battle-config';
import type { BattleEffectState, EnemyUnitState, SquadUnitState } from '../types';
import { applyArmor } from './attack-system';
import { distance, normalize } from './math';

const CONTACT_BUFFER = 10;
const SHIELD_GUARD_CONTACT_BONUS = 12;
const ENGAGEMENT_DEADBAND = 8;
const SLOT_TOLERANCE = 5;
const BODY_BLOCK_LOOKAHEAD = 46;
const BODY_BLOCK_STEER = 0.82;

export class EnemyAiSystem {
  public tick(enemies: EnemyUnitState[], allies: SquadUnitState[], dt: number): Omit<BattleEffectState, 'id' | 'age'>[] {
    const effects: Omit<BattleEffectState, 'id' | 'age'>[] = [];
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      enemy.attackCooldownLeft = Math.max(0, enemy.attackCooldownLeft - dt);

      const target = this.pickNearestAliveAlly(enemy, allies);
      if (!target) {
        enemy.velocity.x = 0;
        enemy.velocity.y = 0;
        continue;
      }

      const cfg = ENEMY_STATS[enemy.enemyType];
      const dist = distance(enemy.position, target.position);
      const engagementRange = this.getEngagementRange(enemy, target);
      const slot = this.getEngagementSlot(enemy, target, engagementRange);
      const slotDist = distance(enemy.position, slot);
      const holdingContact = dist >= engagementRange - ENGAGEMENT_DEADBAND
        && dist <= engagementRange + ENGAGEMENT_DEADBAND;
      if (holdingContact || slotDist <= SLOT_TOLERANCE) {
        enemy.velocity.x = 0;
        enemy.velocity.y = 0;
        if (enemy.attackCooldownLeft <= 0) {
          const targetArmor = SQUAD_UNIT_STATS[target.unitId].armor;
          const damage = applyArmor(cfg.attackDamage, targetArmor);
          target.currentHp = Math.max(0, target.currentHp - damage);
          target.hurtTimeLeft = 0.34;
          target.alive = target.currentHp > 0;
          enemy.attackCooldownLeft = cfg.attackInterval;
          effects.push({ kind: 'damage', to: { ...target.position }, value: damage, ttl: 0.7 });
        }
      } else {
        const desiredDir = normalize(enemy.position, slot);
        const dir = this.applyBodyBlockAvoidance(enemy, desiredDir, enemies);
        const step = Math.min(cfg.moveSpeed * dt, slotDist);
        const effectiveSpeed = dt > 0 ? step / dt : 0;
        enemy.velocity.x = dir.x * effectiveSpeed;
        enemy.velocity.y = dir.y * effectiveSpeed;
        enemy.position.x += dir.x * step;
        enemy.position.y += dir.y * step;
      }
    }
    return effects;
  }

  private pickNearestAliveAlly(enemy: EnemyUnitState, allies: SquadUnitState[]): SquadUnitState | undefined {
    return allies
      .filter((ally) => ally.alive)
      .map((ally) => ({ ally, score: distance(enemy.position, ally.position) * this.getTauntMultiplier(ally) }))
      .sort((a, b) => a.score - b.score)[0]?.ally;
  }

  private getTauntMultiplier(ally: SquadUnitState): number {
    if (ally.unitId === 'shield_guard') return 0.52;
    if (ally.role === 'priest') return 1.18;
    if (ally.role === 'ranged') return 1.08;
    return 1;
  }

  private getEngagementRange(enemy: EnemyUnitState, target: SquadUnitState): number {
    const enemyStats = ENEMY_STATS[enemy.enemyType];
    const targetStats = SQUAD_UNIT_STATS[target.unitId];
    const guardBonus = target.unitId === 'shield_guard' ? SHIELD_GUARD_CONTACT_BONUS : 0;
    return Math.max(enemyStats.attackRange, enemyStats.collisionRadius + targetStats.collisionRadius + CONTACT_BUFFER + guardBonus);
  }

  private getEngagementSlot(enemy: EnemyUnitState, target: SquadUnitState, engagementRange: number): { x: number; y: number } {
    const baseAngle = Math.atan2(enemy.position.y - target.position.y, enemy.position.x - target.position.x);
    const spread = this.getStableSpread(enemy.instanceId);
    const angle = baseAngle + spread;
    return {
      x: target.position.x + Math.cos(angle) * engagementRange,
      y: target.position.y + Math.sin(angle) * engagementRange,
    };
  }

  private getStableSpread(instanceId: string): number {
    let hash = 0;
    for (let i = 0; i < instanceId.length; i += 1) {
      hash = (hash * 31 + instanceId.charCodeAt(i)) >>> 0;
    }
    return ((hash % 5) - 2) * 0.32;
  }

  private applyBodyBlockAvoidance(enemy: EnemyUnitState, desiredDir: { x: number; y: number }, enemies: EnemyUnitState[]): { x: number; y: number } {
    const enemyRadius = ENEMY_STATS[enemy.enemyType].collisionRadius;
    let steerX = desiredDir.x;
    let steerY = desiredDir.y;

    for (const other of enemies) {
      if (other === enemy || !other.alive) continue;
      const dx = other.position.x - enemy.position.x;
      const dy = other.position.y - enemy.position.y;
      const forward = dx * desiredDir.x + dy * desiredDir.y;
      if (forward <= 0 || forward > BODY_BLOCK_LOOKAHEAD + enemyRadius) continue;

      const sideX = -desiredDir.y;
      const sideY = desiredDir.x;
      const lateral = dx * sideX + dy * sideY;
      const minLane = enemyRadius + ENEMY_STATS[other.enemyType].collisionRadius + 8;
      if (Math.abs(lateral) >= minLane) continue;

      const sideSign = lateral >= 0 ? -1 : 1;
      const strength = (1 - Math.abs(lateral) / minLane) * (1 - forward / (BODY_BLOCK_LOOKAHEAD + enemyRadius));
      steerX += sideX * sideSign * strength * BODY_BLOCK_STEER;
      steerY += sideY * sideSign * strength * BODY_BLOCK_STEER;
    }

    const len = Math.hypot(steerX, steerY);
    if (len <= 0.001) return desiredDir;
    return { x: steerX / len, y: steerY / len };
  }
}
