import {Builder} from "./builder";
import * as _ from "lodash";
import {LeaveRoomAction} from "../actions/leave-room";
import {SpawnUtil} from "../../structures/spawns/spawn-util";
import {TravelingAction} from "../actions/traveling";

export class Traveler {
    static KEY = 'traveler';

    static setDestinationRoom(creep:Creep) {
        let helpRoom = null;
        _.forEach(Game.rooms, (room:Room) => {
            if (room.name === creep.memory['destinationRoom']) {
                return;
            }
            if ((room.controller && room.controller.reservation &&
                    room.controller.reservation.username === Memory['username']) || room.memory['sendBuilders']) {
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

    static setAction(creep:Creep) {
        if (!creep.memory['originRoom']) {
            creep.memory['originRoom'] = creep.room.name;
        }
        if (!creep.memory['destinationRoom']) {
            Traveler.setDestinationRoom(creep);
        }
        if (!creep.memory['destinationRoom']) {
            LeaveRoomAction.setAction(creep, null);
            creep.runAction();
            return;
        }

        if (creep.room.name === creep.memory['destinationRoom'] ||
                creep.memory['originRoom'] === creep.memory['destinationRoom']) {

            if (!creep.room.controller) {
                Traveler.setDestinationRoom(creep);
            } else {
                let newRole:string = SpawnUtil.getNextTravelerRole(creep.room);
                if (newRole) {
                    delete creep.memory['destinationRoom'];
                    creep.memory['role'] = newRole;
                    creep.setNextAction();
                    return;
                } else {
                    return;
                }
            }
        }
        if (creep.memory['destinationRoom']) {
            TravelingAction.setAction(creep, (new RoomPosition(25, 25, creep.memory['destinationRoom'])));
            creep.runAction();
            return;
        }
        LeaveRoomAction.setAction(creep, null);
        creep.runAction();
        return;
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        return Builder.buildBodyArray(energyAvailable);
    }
}