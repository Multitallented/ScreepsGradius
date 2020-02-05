
export class MineEnergyAction {
    static KEY = 'mine-energy';

    static run(creep:Creep) {
        let usedCapacity = creep.store.getUsedCapacity(RESOURCE_ENERGY);
        if (usedCapacity !== 0 && usedCapacity === creep.store.getCapacity(RESOURCE_ENERGY)) {
            delete creep.memory['target'];
            delete creep.memory['path'];
            creep.setNextAction();
            return;
        }
        if (!creep.memory['target']) {
            let source:Source = creep.room.findNextEnergySource(creep.pos);
            if (source) {
                creep.memory['target'] = source.id;
            } else {
                return;
            }
        }
        let source:Source = Game.getObjectById(creep.memory['target']);
        if (!source) {
            delete creep.memory['target'];
            delete creep.memory['path'];
            creep.setNextAction();
            return;
        }
        let harvestMessage = creep.harvest(source);
        if (harvestMessage === ERR_NOT_IN_RANGE) {
            creep.moveToTarget();
        }
    }

    static setActionWithTarget(creep:Creep, target:Source) {
        creep.memory['action'] = this.KEY;
        creep.memory['target'] = target.id;
        creep.say('⚡ mine');
        // creep.say('🔄 harvest');
    }

    static setAction(creep:Creep) {
        creep.memory['action'] = this.KEY;
        let source:Source = creep.room.findNextEnergySource(creep.pos);
        if (source) {
            creep.memory['target'] = source.id;
        }
        creep.say('⚡ mine');
        // creep.say('🔄 harvest');
    }
}