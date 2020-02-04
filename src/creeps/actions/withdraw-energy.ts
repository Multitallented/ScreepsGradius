
export class WithdrawEnergyAction {
    static KEY = 'withdraw-energy';

    static run(creep:Creep) {
        const capacity = creep.store.getCapacity();
        if (!creep.memory['target'] || creep.store.energy === capacity) {
            delete creep.memory['path'];
            delete creep.memory['target'];
            creep.setNextAction();
            return;
        }
        let withdrawMessage = creep.withdraw(Game.getObjectById(creep.memory['target']), RESOURCE_ENERGY,
            capacity - creep.store.energy);
        if (withdrawMessage === ERR_NOT_IN_RANGE) {
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
        creep.say('⚡ take');
    }
}