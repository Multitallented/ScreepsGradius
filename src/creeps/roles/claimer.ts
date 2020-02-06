import {CreepSpawnData} from "../../structures/spawns/creep-spawn-data";
import {ClaimControllerAction} from "../actions/claim-controller";
import {ReserveControllerAction} from "../actions/reserve-controller";
import {LeaveRoomAction} from "../actions/leave-room";
import {RoomUtil} from "../../rooms/room-util";
import {TravelingAction} from "../actions/traveling";

export class Claimer {
    static KEY = 'claimer';

    static setAction(creep:Creep) {
        let canClaimAnyRoom = RoomUtil.canClaimAnyRoom();
        if (canClaimAnyRoom && !creep.memory['destinationRoom'] && Memory['roomData']) {
            let bestRoom = RoomUtil.getBestRoom(creep.room, false);
            if (bestRoom) {
                creep.memory['destinationRoom'] = bestRoom;
                // TODO set Memory
            }
        }
        LeaveRoomAction.moveIntoRoom(creep);

        if (!creep.memory['destinationRoom'] && (!creep.room.controller || creep.room.controller.my)) {
            LeaveRoomAction.setAction(creep, null);
            creep.runAction();
            return;
        } else if (!canClaimAnyRoom || creep.room.name === creep.memory['destinationRoom']) {
            if (canClaimAnyRoom && creep.room.name === RoomUtil.getBestRoom(creep.room, false)) {
                ClaimControllerAction.setAction(creep);
                creep.runAction();
                return;
            } else if (creep.room.controller && (!creep.room.controller.reservation && !creep.room.controller.my)) {
                ReserveControllerAction.setAction(creep);
                creep.runAction();
                return;
            } else {
                let bestRoomName = RoomUtil.getBestRoom(creep.room, true);
                if (bestRoomName && bestRoomName !== creep.room.name && Game.rooms[bestRoomName]) {
                    creep.memory['destinationRoom'] = bestRoomName;
                } else {
                    LeaveRoomAction.setAction(creep, null);
                    creep.runAction();
                    return;
                }
            }
        }

        if (creep.memory['destinationRoom']) {
            TravelingAction.setAction(creep, new RoomPosition(25, 25, creep.memory['destinationRoom']));
            creep.runAction();
            return;
        }
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, CLAIM ];
        energyAvailable -= 650;
        let partCount = { 'CLAIM': 1, 'MOVE': 1, 'TOUGH': 0 };
        while (energyAvailable >= 10) {
            if (partCount['MOVE'] - 3 < partCount['TOUGH']) {
                partCount['MOVE'] += 1;
                bodyArray.unshift(MOVE);
                energyAvailable -= CreepSpawnData.getBodyPartCost(MOVE);
            } else {
                partCount['TOUGH'] += 1;
                bodyArray.unshift(TOUGH);
                energyAvailable -= CreepSpawnData.getBodyPartCost(TOUGH);
            }
        }
        return bodyArray;
    }
}