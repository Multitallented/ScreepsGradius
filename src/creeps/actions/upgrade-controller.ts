
export class UpgradeControllerAction {
    static KEY = 'upgrade-controller';

    static run(creep:Creep) {
        if (creep.store.getUsedCapacity() === 0) {
            delete creep.memory['target'];
            delete creep.memory['path'];
            creep.setNextAction();
            return;
        }
        if (!creep.memory['target']) {
            creep.memory['target'] = creep.room.controller.id;
        }
        let upgradeMessage = creep.upgradeController(Game.getObjectById(creep.memory['target']));
        if (upgradeMessage === ERR_NOT_IN_RANGE) {
            creep.moveToTarget();
        }
    }

    static setAction(creep:Creep) {
        creep.memory['action'] = this.KEY;
        // creep.say('⚡ upgrade');
    }
}
