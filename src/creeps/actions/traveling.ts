import {LeaveRoomAction} from "./leave-room";

export class TravelingAction {
    static KEY = 'traveling';

    static run(creep:Creep) {
        LeaveRoomAction.moveIntoRoom(creep);
        if (!creep.memory['destination']) {
            delete creep.memory['path'];
            creep.setNextAction();
            return;
        }
        if (creep.memory['destinationRoom'] === creep.room.name) {
            LeaveRoomAction.moveIntoRoom(creep);
            delete creep.memory['path'];
            delete creep.memory['destination'];
            creep.setNextAction();
            return;
        }
        creep.moveToTarget();
    }

    static setAction(creep:Creep, pos:RoomPosition) {
        creep.memory['destination'] = pos;
        creep.memory['path'] = creep.pos.findPathTo(pos);
        creep.memory['destinationRoom'] = pos.roomName;
        creep.memory['action'] = TravelingAction.KEY;
        creep.say('✈ traveling');
    }
}