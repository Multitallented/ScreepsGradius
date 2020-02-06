
export class ClaimControllerAction {
    static KEY = 'claim-controller';

    static run(creep:Creep) {
        let claimedRoom = creep.room.controller && creep.room.controller.my;
        if (claimedRoom) {
            creep.setNextAction();
            return;
        }

        creep.memory['target'] = creep.room.controller.id;
        let claimMessage = creep.claimController(creep.room.controller);
        if (claimMessage === ERR_NOT_IN_RANGE) {
            creep.moveToTarget();
        }
    }
}