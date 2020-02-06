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
                if (room.memory['sendBuilders']) {
                    helpRoom = room.name;
                }
            });
            if (helpRoom) {
                creep.memory['destinationRoom'] = helpRoom;
            }
        }
    }

    static setAction(creep:Creep) {
        Traveler.setDestinationRoom(creep);
        LeaveRoomAction.moveIntoRoom(creep);

        if (creep.room.name === creep.memory['destinationRoom']) {
            let newRoleData:CreepSpawnData = SpawnUtil.getNextCreepToSpawn(creep.room);
            let newRole = null;
            if (newRoleData && newRoleData.options['memory']['role'] &&
                    newRoleData.options['memory']['role'] !== Traveler.KEY) {
                newRole = newRoleData.options['memory']['role'];
            }
            if (newRole) {
                creep.memory['role'] = newRole;
                creep.name = newRole + Game.time;
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