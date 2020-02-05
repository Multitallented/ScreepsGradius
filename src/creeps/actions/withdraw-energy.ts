
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
        let container:Structure = Game.getObjectById(creep.memory['target']);
        if (!container || !container['store']) {
            delete creep.memory['path'];
            delete creep.memory['target'];
            creep.setNextAction();
            return;
        }
        let withdrawMessage = creep.withdraw(container, RESOURCE_ENERGY,
            Math.min(capacity - creep.store.energy, container['store'].energy));
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
        // creep.say('⚡ take');
    }
}