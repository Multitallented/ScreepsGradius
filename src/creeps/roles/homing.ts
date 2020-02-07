import {LeaveRoomAction} from "../actions/leave-room";
import {Courier} from "./courier";
import {TravelingAction} from "../actions/traveling";

export class Homing {
    static KEY = 'homing';

    static setAction(creep:Creep) {
        if (creep.store.getUsedCapacity() < 50) {
            delete creep.memory['target'];
            delete creep.memory['destination'];
            creep.memory['role'] = 'traveler';
            creep.setNextAction();
            return;
        }
        if (!creep.memory['originRoom'] || !creep.room.controller || !creep.room.controller.my) {
            // TODO find nearest claimed room and set to originRoom
        }

        LeaveRoomAction.moveIntoRoom(creep);
        if (creep.room.name === creep.memory['originRoom'] ||
            creep.memory['originRoom'] === creep.memory['destinationRoom']) {
            if (Courier.deliverEnergy(creep, {})) {
                return;
            }
        }

        if (creep.memory['originRoom'] && creep.memory['originRoom'] !== creep.room.name &&
                (!creep.memory['destination'] || !creep.memory['action'])) {
            TravelingAction.setAction(creep, new RoomPosition(25, 25, creep.memory['originRoom']));
            creep.runAction();
            return;
        }
    }
}