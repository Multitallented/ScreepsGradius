
export class MineEnergyAction {
    static KEY = 'mine-energy';

    static run(creep:Creep) {
        if (creep.store.getFreeCapacity() === 0) {
            delete creep.memory['target'];
            delete creep.memory['path'];
            creep['setNextAction']();
            return;
        }
        if (!creep.memory['target']) {
            let source:Source = creep.room['findNextEnergySource'](creep.pos);
            creep.memory['target'] = source.id;
        }
        let harvestMessage = creep.harvest(Game.getObjectById(creep.memory['target']));
        if (harvestMessage === ERR_NOT_IN_RANGE) {
            creep['moveToTarget']();
        }
    }

    static setAction(creep:Creep) {
        creep.memory['action'] = this.KEY;
        creep.say('🔄 harvest');
    }
}