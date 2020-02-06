import {CreepSpawnData} from "../../structures/spawns/creep-spawn-data";
import * as _ from "lodash";
import {ClaimControllerAction} from "../actions/claim-controller";
import {ReserveControllerAction} from "../actions/reserve-controller";
import {LeaveRoomAction} from "../actions/leave-room";

export class Claimer {
    static KEY = 'claimer';

    static canClaimAnyRoom():boolean {
        let numberOfOwnedRooms = _.filter(Game.rooms, (r) => {
            return r.controller && r.controller.my;
        }).length;
        return Game.gcl.level > numberOfOwnedRooms;
    }

    static getBestRoom():string {
        let mostSources = 0;
        let mostSpots = 0;
        let bestRoom = null;
        _.forEach(Memory['roomData'], (roomData, key) => {
            let numberOfSources = roomData['sources']['qty'];
            let numberOfSpots = roomData['sources']['spots'];
            if (numberOfSources > mostSources ||
                (numberOfSources === mostSources && mostSpots > numberOfSpots)) {
                bestRoom = key;
                mostSpots = numberOfSpots;
                mostSources = numberOfSources;
            }
        });
        return bestRoom;
    }

    static setAction(creep:Creep) {
        let canClaimAnyRoom = Claimer.canClaimAnyRoom();
        if (canClaimAnyRoom && !creep.memory['destinationRoom'] && Memory['roomData']) {
            let bestRoom = Claimer.getBestRoom();
            if (bestRoom) {
                creep.memory['destinationRoom'] = bestRoom;
            }
        }
        LeaveRoomAction.moveIntoRoom(creep);

        if (!creep.memory['destinationRoom'] && (!creep.room.controller || creep.room.controller.my)) {
            LeaveRoomAction.setAction(creep, null);
            creep.runAction();
            return;
        } else if (!canClaimAnyRoom || creep.room.name === creep.memory['destinationRoom']) {
            if (canClaimAnyRoom && creep.room.name === Claimer.getBestRoom()) {
                ClaimControllerAction.setAction(creep);
                creep.runAction();
                return;
            } else {
                ReserveControllerAction.setAction(creep);
                creep.runAction();
                return;
            }
        }

        if (creep.memory['destinationRoom'] && !creep.memory['path']) {
            creep.memory['path'] = creep.pos.findPathTo(new RoomPosition(25, 25, creep.memory['destinationRoom']));
        }
        if (creep.memory['path']) {
            creep.moveToTarget();
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