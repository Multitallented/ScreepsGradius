
export class ReserveControllerAction {
    static KEY = 'reserve-controller';

    static run(creep:Creep) {
        let claimedRoom = creep.room.controller && creep.room.controller.my;
        let claimUnnecessary = creep.room && creep.room.controller && creep.room.controller.reservation &&
            creep.room.controller.reservation.ticksToEnd > 3000;
        if (claimedRoom || claimUnnecessary) {
            creep.setNextAction();
            return;
        }
        creep.memory['target'] = creep.room.controller.id;
        let claimMessage = creep.reserveController(creep.room.controller);
        if (claimMessage === ERR_NOT_IN_RANGE) {
            creep.moveToTarget();
        }
    }

    static setAction(creep:Creep) {
        creep.memory['action'] = this.KEY;
        creep.say('® reserve');
    }
}