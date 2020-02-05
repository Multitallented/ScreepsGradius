
export class MineEnergyAction {
    static KEY = 'mine-energy';

    static run(creep:Creep) {
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) < 1) {
            delete creep.memory['target'];
            delete creep.memory['path'];
            creep.setNextAction();
            return;
        }
        if (!creep.memory['target']) {
            let source:Source = creep.room.findNextEnergySource(creep.pos);
            if (source != null) {
                creep.memory['target'] = source.id;
            } else {
                return;
            }
        }
        let harvestMessage = creep.harvest(Game.getObjectById(creep.memory['target']));
        if (harvestMessage === ERR_NOT_IN_RANGE) {
            creep.moveToTarget();
        }
    }

    static setActionWithTarget(creep:Creep, target:Source) {
        creep.memory['action'] = this.KEY;
        creep.memory['target'] = target.id;
        // creep.say('🔄 harvest');
    }

    static setAction(creep:Creep) {
        creep.memory['action'] = this.KEY;
        creep.say('⚡ mine');
        // creep.say('🔄 harvest');
    }
}