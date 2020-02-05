
export class WithdrawAction {
    static KEY = 'withdraw';

    static run(creep:Creep) {
        let resourceType = RESOURCE_ENERGY;
        if (creep.memory['resourceType']) {
            resourceType = creep.memory['resourceType'];
        }
        if (!creep.memory['target'] || creep.store.getFreeCapacity(resourceType) === 0) {
            delete creep.memory['path'];
            delete creep.memory['target'];
            delete creep.memory['resourceType'];
            creep.setNextAction();
            return;
        }
        let container = Game.getObjectById(creep.memory['target']);
        if (!container || !container['store'] || container['store'].getUsedCapacity(resourceType) === 0) {
            delete creep.memory['path'];
            delete creep.memory['target'];
            delete creep.memory['resourceType'];
            creep.setNextAction();
            return;
        }
        let withdrawMessage = creep.withdraw(<Structure | Tombstone> container, resourceType,
            Math.min(creep.store.getFreeCapacity(resourceType), container['store'].getUsedCapacity(resourceType)));
        if (withdrawMessage === ERR_NOT_IN_RANGE) {
            creep.moveToTarget();
        } else {
            delete creep.memory['target'];
            delete creep.memory['path'];
            delete creep.memory['resourceType'];
            creep.setNextAction();
        }
    }

    static setAction(creep:Creep, target, resourceType:ResourceConstant) {
        creep.memory['action'] = this.KEY;
        creep.memory['target'] = target.id;
        creep.memory['resourceType'] = resourceType;
        creep.say('⚡ take');
    }
}