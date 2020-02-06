import {Builder} from "./builder";
import * as _ from "lodash";
import {LeaveRoomAction} from "../actions/leave-room";
import {CreepSpawnData} from "../../structures/spawns/creep-spawn-data";
import {SpawnUtil} from "../../structures/spawns/spawn-util";

export class Traveler {
    static KEY = 'traveler';

    static setDestinationRoom(creep:Creep) {
        if (!creep.memory['destinationRoom']) {
            let helpRoom = null;
            _.forEach(Game.rooms, (room:Room) => {
                if ((room.controller && room.controller.reservation) || room.memory['sendBuilders']) {
                    let numberOfSpots = 0;
                    let numberOfCreeps = room.find(FIND_MY_CREEPS).length;
                    _.forEach(room.memory['sources'], (sourceNumber) => {
                        numberOfSpots += sourceNumber;
                    });
                    if (numberOfCreeps > numberOfSpots) {
                        return;
                    }
                    helpRoom = room.name;
                }
            });
            if (helpRoom) {
                creep.memory['destinationRoom'] = helpRoom;
            }
        }
    }

    static setAction(creep:Creep) {
        if (!creep.memory['originRoom']) {
            creep.memory['originRoom'] = creep.room.name;
        }
        Traveler.setDestinationRoom(creep);
        LeaveRoomAction.moveIntoRoom(creep);

        if (creep.room.name === creep.memory['destinationRoom'] ||
                creep.memory['originRoom'] === creep.memory['destinationRoom']) {
            let newRole:string = SpawnUtil.getNextTravelerRole(creep.room);
            if (newRole) {
                delete creep.memory['destinationRoom'];
                creep.memory['role'] = newRole;
                creep.setNextAction();
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
        return Builder.buildBodyArray(energyAvailable);
    }
}