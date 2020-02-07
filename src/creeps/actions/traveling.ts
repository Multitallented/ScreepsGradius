import {LeaveRoomAction} from "./leave-room";

export class TravelingAction {
    static KEY = 'traveling';

    static run(creep:Creep) {
        LeaveRoomAction.moveIntoRoom(creep);
        if (creep.fatigue > 0) {
            return;
        }
        if (!creep.memory['endDestination']) {
            delete creep.memory['destination'];
            delete creep.memory['destinationRoom'];
            creep.setNextAction();
            return;
        }
        if (creep.memory['endDestination'] === creep.room.name) {
            delete creep.memory['destination'];
            delete creep.memory['destinationRoom'];
            creep.setNextAction();
            return;
        }
        if (!creep.memory['destinationRoom'] || creep.memory['destinationRoom'] === creep.room.name) {
            let route = Game.map.findRoute(creep.room, creep.memory['endDestination']);
            if (route && route['length']) {
                creep.memory['destinationRoom'] = route[0].room;
                creep.memory['destination'] = creep.pos.findClosestByRange(route[0].exit);
                creep.moveToTarget();
            } else {
                delete creep.memory['destination'];
                delete creep.memory['destinationRoom'];
                creep.setNextAction();
            }
            return;
        }
        if (!creep.memory['destination']) {
            let exitDirection = creep.room.findExitTo(creep.memory['destinationRoom']);
            if (exitDirection) {
                creep.memory['destination'] = creep.pos.findClosestByRange(<ExitConstant> exitDirection);
            } else {
                delete creep.memory['destination'];
                delete creep.memory['destinationRoom'];
                creep.setNextAction();
            }
        }
        creep.moveToTarget();
    }

    static setAction(creep:Creep, pos:RoomPosition) {
        creep.memory['endDestination'] = pos.roomName;
        let route = Game.map.findRoute(creep.room, pos.roomName);
        if (route && route['length']) {
            creep.memory['destinationRoom'] = route[0].room;
            creep.memory['destination'] = creep.pos.findClosestByRange(route[0].exit);
            creep.moveToTarget();
        }
        creep.memory['action'] = TravelingAction.KEY;
        creep.say('✈ traveling');
    }
}