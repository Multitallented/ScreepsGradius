
export class UpgradeControllerAction {
    static KEY = 'upgrade-controller';

    static run(creep:Creep) {
        if (creep.room.controller && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
                (creep.room.controller.reservation || !creep.room.controller.my)) {
            delete creep.memory['path'];
            delete creep.memory['action'];
            delete creep.memory['target'];
            delete creep.memory['destination'];
            creep.memory['role'] = 'homing';
            creep.setNextAction();
            return;
        }
        if (!creep.memory['target'] || creep.memory['target'] !== creep.room.controller.id) {
            creep.memory['target'] = creep.room.controller.id;
        }
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            delete creep.memory['path'];
            creep.setNextAction();
            return;
        }
        let upgradeMessage = creep.upgradeController(creep.room.controller);
        if (upgradeMessage === ERR_NOT_IN_RANGE) {
            creep.moveToTarget();
        }
    }

    static setAction(creep:Creep) {
        creep.memory['action'] = this.KEY;
        creep.say('⚡ upgrade');
    }
}
