import {Builder} from "./builder";
import * as _ from "lodash";
import {LeaveRoomAction} from "../actions/leave-room";
import {SpawnUtil} from "../../structures/spawns/spawn-util";
import {TravelingAction} from "../actions/traveling";
import {RoomUtil} from "../../rooms/room-util";

export class Traveler {
    static KEY = 'traveler';

    static setEndRoom(creep:Creep) {
        let helpRoom = null;
        let helpReallyNeeded = false;
        let emergencyHelpNeeded = false;
        _.forEach(Game.rooms, (room:Room) => {
            if (room.name === creep.memory['endRoom']) {
                return;
            }
            let numberOfSpots = 0;
            let numberOfCreeps = room.find(FIND_MY_CREEPS).length;
            _.forEach(room.memory['sources'], (sourceNumber) => {
                numberOfSpots += sourceNumber;
            });
            if (numberOfCreeps - 4 < Math.max(2, numberOfSpots) && room.controller && room.controller.my) {
                emergencyHelpNeeded = true;
                helpRoom = room.name;
            }
            const roomDistance = RoomUtil.getDistanceBetweenTwoRooms(room.name, creep.room.name);
            if (roomDistance > 1) {
                return;
            }
            if ((room.controller && room.controller.reservation &&
                    room.controller.reservation.username === Memory['username']) || room.memory['sendBuilders']) {

                 if (!emergencyHelpNeeded && numberOfCreeps - 1 < Math.max(2, numberOfSpots)) {
                    helpReallyNeeded = true;
                    helpRoom = room.name;
                } else if (!emergencyHelpNeeded && !helpReallyNeeded && numberOfCreeps - 4 < Math.max(2, numberOfSpots)) {
                    helpRoom = room.name;
                } else if (!emergencyHelpNeeded && !helpReallyNeeded) {
                    helpRoom = room.name;
                }
            }
        });
        if (helpRoom) {
            creep.memory['endRoom'] = helpRoom;
        }
    }

    static setAction(creep:Creep) {
        if (!creep.memory['homeRoom']) {
            creep.memory['homeRoom'] = creep.room.name;
        }
        if (!creep.memory['endRoom']) {
            Traveler.setEndRoom(creep);
        }
        if (!creep.memory['endRoom']) {
            LeaveRoomAction.setAction(creep, null);
            creep.runAction();
            return;
        }
        if (creep.memory['homeRoom'] && creep.memory['homeRoom'] === creep.room.name) {
            Traveler.setEndRoom(creep);
            if (!creep.memory['endRoom']) {
                LeaveRoomAction.setAction(creep, null);
                creep.runAction();
                return;
            } else if (creep.memory['homeRoom'] !== creep.memory['endRoom']) {
                TravelingAction.setAction(creep, new RoomPosition(25, 25, creep.memory['endRoom']));
                creep.runAction();
                return;
            }
        }

        if (creep.room.name === creep.memory['endRoom'] ||
                creep.memory['homeRoom'] === creep.memory['endRoom']) {

            if (!creep.room.controller) {
                Traveler.setEndRoom(creep);
            } else if (creep.room.controller.my) {
                let endRoom = creep.memory['endRoom'];
                Traveler.setEndRoom(creep);
                if (creep.memory['endRoom'] === endRoom) {
                    let nextTravelerRole:string = SpawnUtil.getNextTravelerRole(creep.room);
                    if (nextTravelerRole) {
                        delete creep.memory['endRoom'];
                        creep.memory['role'] = nextTravelerRole;
                        creep.setNextAction();
                        return;
                    }
                }
            } else {
                let nextTravelerRole:string = SpawnUtil.getNextTravelerRole(creep.room);
                if (nextTravelerRole) {
                    delete creep.memory['endRoom'];
                    creep.memory['role'] = nextTravelerRole;
                    creep.setNextAction();
                    return;
                } else {
                    Traveler.setEndRoom(creep);
                    return;
                }
            }
        }
        if (creep.memory['endRoom'] && creep.room.name !== creep.memory['endRoom']) {
            TravelingAction.setAction(creep, (new RoomPosition(25, 25, creep.memory['endRoom'])));
            creep.runAction();
            return;
        }
        if (creep.room.controller && !creep.room.controller.my) {
            let newRole:string = SpawnUtil.getNextTravelerRole(creep.room);
            if (newRole) {
                delete creep.memory['endRoom'];
                creep.memory['role'] = newRole;
                creep.setNextAction();
                return;
            }
        }
        creep.memory['role'] = 'scout';
        creep.setNextAction();
        return;
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        return Builder.buildBodyArray(energyAvailable);
    }
}
