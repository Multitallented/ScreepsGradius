
export class TransferEnergyAction {
    static KEY = 'transfer-energy';

    static run(creep:Creep) {
        if (!creep.memory['target']) {
            delete creep.memory['path'];
            creep.setNextAction();
            return;
        }
        let structure:Structure = Game.getObjectById(creep.memory['target']);
        if (!structure || structure['store'].getFreeCapacity(RESOURCE_ENERGY) < 1) {
            delete creep.memory['target'];
            delete creep.memory['path'];
            creep.setNextAction();
            return;
        }
        let transferMessage = creep.transfer(structure, RESOURCE_ENERGY);
        if (transferMessage === ERR_NOT_IN_RANGE) {
            creep.moveToTarget();
        } else {
            delete creep.memory['target'];
            delete creep.memory['path'];
            creep.setNextAction();
        }
    }

    static setAction(creep:Creep, target:Structure) {
        creep.memory['action'] = this.KEY;
        creep.memory['target'] = target.id;
        // creep.say('⚡ give');
    }
}