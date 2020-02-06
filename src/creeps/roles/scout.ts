import {LeaveRoomAction} from "../actions/leave-room";
import {RoomUtil} from "../../rooms/room-util";

export class Scout {
    static KEY = 'scout';

    static setAction(creep:Creep) {
        if (!creep.memory['originRoom']) {
            creep.memory['originRoom'] = creep.room.name;
        }
        if (creep.room.controller && (creep.room.controller.my || creep.room.controller.reservation)) {
            creep.memory['originRoom'] = creep.room.name;
            delete creep.memory['path'];
            delete creep.memory['destination'];
            LeaveRoomAction.setAction(creep, null);
            creep.runAction();
            return;
        } else if (creep.memory['originRoom'] !== creep.room.name) {
            let scouts = creep.room.find(FIND_MY_CREEPS, {filter: (c:Creep) => {
                return c.memory['role'] && c.memory['role'] === Scout.KEY &&
                    c.memory['originRoom'] && c.memory['originRoom'] === c.room.name;
            }});
            if (scouts.length) {
                LeaveRoomAction.setAction(creep, null);
                creep.runAction();
                return;
            } else {
                creep.memory['originRoom'] = creep.room.name;
                if (RoomUtil.crowDistance(creep.pos, creep.room.getPositionAt(25, 25)) > 15) {
                    creep.memory['destination'] = creep.room.getPositionAt(25, 25);
                    creep.moveToTarget();
                    return;
                }
            }
        } else if (RoomUtil.crowDistance(creep.pos, creep.room.getPositionAt(25, 25)) > 15) {
            creep.memory['destination'] = creep.room.getPositionAt(25, 25);
            creep.moveToTarget();
            return;
        }
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        return [ MOVE ];
    }
}