import {CreepSpawnData} from "../../structures/spawns/creep-spawn-data";
import {ClaimControllerAction} from "../actions/claim-controller";
import {ReserveControllerAction} from "../actions/reserve-controller";
import {LeaveRoomAction} from "../actions/leave-room";
import {RoomUtil} from "../../rooms/room-util";
import {TravelingAction} from "../actions/traveling";
import * as _ from "lodash";

export class Claimer {
    static KEY = 'claimer';

    static setAction(creep:Creep) {
        let canClaimAnyRoom = RoomUtil.canClaimAnyRoom();
        if (canClaimAnyRoom && !creep.memory['toRoom'] && Memory['roomData']) {
            let bestRoom = RoomUtil.getBestRoomToClaim(creep.room, false);
            if (bestRoom) {
                creep.memory['endRoom'] = bestRoom;
            }
        }
        LeaveRoomAction.moveIntoRoom(creep);

        if (!creep.memory['endRoom'] && (!creep.room.controller || creep.room.controller.my)) {
            let directions:Array<ExitConstant> = [ FIND_EXIT_LEFT, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_TOP];
            let directionToTravel = null;
            _.forEach(directions, (direction:ExitConstant) => {
                if (!creep.room.memory['exits'][direction]) {
                    return;
                }
                let currentRoom = Game.rooms[creep.room.getAdjacentRoomName(direction)];
                if (!currentRoom) {
                    return;
                }
                if (currentRoom.controller && !currentRoom.controller.my && !currentRoom.controller.reservation) {
                    directionToTravel = direction;
                }
            });
            if (directionToTravel) {
                LeaveRoomAction.setAction(creep, directionToTravel);
                creep.runAction();
                return;
            } else {
                let nearestSpawn:StructureSpawn = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (s:Structure) => {
                        return s.structureType === STRUCTURE_SPAWN;
                    }}) as StructureSpawn;
                if (nearestSpawn && creep.pos.inRangeTo(nearestSpawn, 1)) {
                    nearestSpawn.recycleCreep(creep);
                    return;
                }
            }
        } else if (!canClaimAnyRoom || creep.room.name === creep.memory['endRoom']) {
            if (canClaimAnyRoom && creep.room.name === RoomUtil.getBestRoomToClaim(creep.room, false)) {
                ClaimControllerAction.setAction(creep);
                creep.runAction();
                return;
            } else if (creep.room.controller && (!creep.room.controller.reservation && !creep.room.controller.my)) {
                ReserveControllerAction.setAction(creep);
                creep.runAction();
                return;
            } else {
                let bestRoomName = RoomUtil.getBestRoomToClaim(creep.room, true);
                if (bestRoomName && bestRoomName !== creep.room.name && Game.rooms[bestRoomName]) {
                    creep.memory['endRoom'] = bestRoomName;
                } else {
                    LeaveRoomAction.setAction(creep, null);
                    creep.runAction();
                    return;
                }
            }
        }

        if (creep.memory['endRoom']) {
            TravelingAction.setAction(creep, new RoomPosition(25, 25, creep.memory['endRoom']));
            creep.runAction();
            return;
        }
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, CLAIM ];
        energyAvailable -= 650;
        let partCount = { 'CLAIM': 1, 'MOVE': 1, 'TOUGH': 0 };
        while (energyAvailable >= 10 && bodyArray.length < 30) {
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
