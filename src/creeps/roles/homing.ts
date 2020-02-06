import {LeaveRoomAction} from "../actions/leave-room";
import {Courier} from "./courier";

export class Homing {
    static KEY = 'homing';

    static setAction(creep:Creep) {
        if (creep.store.getUsedCapacity() < 50) {
            delete creep.memory['path'];
            delete creep.memory['target'];
            delete creep.memory['destination'];
            creep.memory['role'] = 'traveler';
            creep.setNextAction();
            return;
        }
        if (!creep.memory['originRoom']) {
            // TODO find nearest claimed room and set to originRoom
        }

        LeaveRoomAction.moveIntoRoom(creep);
        if (creep.room.name === creep.memory['originRoom'] ||
            creep.memory['originRoom'] === creep.memory['destinationRoom']) {
            if (Courier.deliverEnergy(creep, {})) {
                return;
            }
        }

        if (creep.memory['originRoom'] && !creep.memory['path']) {
            creep.memory['path'] = creep.pos.findPathTo(new RoomPosition(25, 25, creep.memory['originRoom']));
        }
        if (creep.memory['path']) {
            creep.moveToTarget();
        }
    }
}