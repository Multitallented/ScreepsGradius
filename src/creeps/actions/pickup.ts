
export class PickupAction {
    static KEY = 'pickup';

    static run(creep:Creep) {
        if (!creep.memory['target']) {
            delete creep.memory['path'];
            creep.setNextAction();
            return;
        }
        let targetResource:Resource = Game.getObjectById(creep.memory['target']);
        if (!targetResource ||
            targetResource.amount > creep.store.getFreeCapacity(targetResource.resourceType)) {

            delete creep.memory['target'];
            delete creep.memory['path'];
            creep.setNextAction();
            return;
        }
        let pickup = creep.pickup(targetResource);
        if (pickup === ERR_NOT_IN_RANGE) {
            creep.moveToTarget();
        }
    }

    static setAction(creep:Creep, resource:Resource) {
        creep.memory['target'] = resource.id;
        creep.memory['action'] = this.KEY;
    }
}