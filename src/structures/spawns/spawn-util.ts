import * as _ from "lodash";
import {CreepSpawnData} from "./creep-spawn-data";
import {Jack} from "../../creeps/roles/jack";
import {Upgrader} from "../../creeps/roles/upgrader";
import {Courier} from "../../creeps/roles/courier";
import {Miner} from "../../creeps/roles/miner";
import {Builder} from "../../creeps/roles/builder";
import {Scout} from "../../creeps/roles/scout";
import {Claimer} from "../../creeps/roles/claimer";
import {RoomUtil} from "../../rooms/room-util";
import {Chaser} from "../../creeps/roles/chaser";

export class SpawnUtil {
    static getCreepCount(room:Room):Object {
        let creepCount = {};

        _.forEach(room.find(FIND_CREEPS,{filter: (creep) => {return creep.memory && creep.memory['role'];}}),
            (creep:Creep) => {
                if (creep.memory['role']) {
                    if (creepCount[creep.memory['role']]) {
                        creepCount[creep.memory['role']] += 1;
                    } else {
                        creepCount[creep.memory['role']] = 1;
                    }
                }
            });
        return creepCount;
    }

    static getStructureCount(room:Room):Object {
        let structureCount = {};
        _.forEach(room.find(FIND_STRUCTURES), (s:Structure) => {
            if (structureCount[s.structureType]) {
                structureCount[s.structureType] += 1;
            } else {
                structureCount[s.structureType] = 1;
            }
        });
        return structureCount;
    }

    static getNextTravelerRole(room:Room): string {
        let creepCount = SpawnUtil.getCreepCount(room);
        let structureCount = SpawnUtil.getStructureCount(room);
        let roomClaimed = room.controller && room.controller.my;
        let numberOfSources;
        if (room.memory['sources']) {
            numberOfSources = Object.keys(room.memory['sources']).length;
        } else if (Memory[room.name] && Memory[room.name]['roomData']) {
            numberOfSources = Memory[room.name]['roomData'][room.name]['sources']['qty'];
        } else {
            numberOfSources = room.find(FIND_SOURCES).length;
        }
        if (roomClaimed && (!creepCount[Jack.KEY] || creepCount[Jack.KEY] === 1)) {
            return Jack.KEY;
        } else if (roomClaimed && !creepCount[Upgrader.KEY]) {
            return Upgrader.KEY;
        } else if (structureCount[STRUCTURE_EXTENSION] && structureCount[STRUCTURE_CONTAINER] && (!creepCount[Courier.KEY])) {
            return Courier.KEY;
        } else if (structureCount[STRUCTURE_CONTAINER] && (!creepCount[Miner.KEY] || creepCount[Miner.KEY] < numberOfSources)) {
            return Miner.KEY;
        } else if (!creepCount[Builder.KEY]) {
            return Builder.KEY;
        } else if (structureCount[STRUCTURE_EXTENSION] && structureCount[STRUCTURE_CONTAINER] && (!creepCount[Courier.KEY] || creepCount[Courier.KEY] < 3)) {
            return Courier.KEY;
        } else if (!creepCount[Builder.KEY] || creepCount[Builder.KEY] < 3) {
            return Builder.KEY;
        } else if (!creepCount[Upgrader.KEY] || creepCount[Upgrader.KEY] < 4) {
            return Upgrader.KEY;
        }
    }

    static getNextCreepToSpawn(room:Room): CreepSpawnData {
        let creepCount = SpawnUtil.getCreepCount(room);
        let structureCount = SpawnUtil.getStructureCount(room);
        let energyAvailable = room.energyAvailable;
        let numberOfSources;
        if (room.memory['sources']) {
            numberOfSources = Object.keys(room.memory['sources']).length;
        } else if (Memory[room.name] && Memory[room.name]['roomData']) {
            numberOfSources = Memory[room.name]['roomData'][room.name]['sources']['qty'];
        } else {
            numberOfSources = room.find(FIND_SOURCES).length;
        }
        let ticksTilNextScoutSpawn = 0;
        if (room.memory['ticksTilNextScoutSpawn']) {
            ticksTilNextScoutSpawn = room.memory['ticksTilNextScoutSpawn'];
        }
        let roomNeedingTravelers = null;
        let roomNeedingDefenders = false;
        _.forEach(Game.rooms, (currentRoom: Room) => {
            if (!currentRoom || RoomUtil.roomDistance(room.name, currentRoom.name) > 4) {
                return;
            }
            if (currentRoom.find(FIND_HOSTILE_CREEPS).length) {
                roomNeedingDefenders = true;
            }
            if ((currentRoom.controller && currentRoom.controller.reservation) || currentRoom.memory['sendBuilders']) {
                if (currentRoom.memory['sendBuilders'] && currentRoom.find(FIND_MY_STRUCTURES, {
                    filter: (s: Structure) => {
                        return s.structureType === STRUCTURE_SPAWN;
                    }
                }).length) {
                    delete currentRoom.memory['sendBuilders'];
                }

                let numberOfSpots = 0;
                let numberOfCreeps = currentRoom.find(FIND_MY_CREEPS).length;
                _.forEach(currentRoom.memory['sources'], (sourceNumber) => {
                    numberOfSpots += sourceNumber;
                });
                if (numberOfCreeps >= numberOfSpots) {
                    return;
                }
                roomNeedingTravelers = currentRoom.name;
            }
        });

        let needClaimers = RoomUtil.canClaimAnyRoom();
        if (!needClaimers) {
            let directions: Array<ExitConstant> = [FIND_EXIT_TOP, FIND_EXIT_BOTTOM, FIND_EXIT_RIGHT, FIND_EXIT_LEFT];
            _.forEach(directions, (direction: ExitConstant) => {
                if (room.hasExit(direction)) {
                    let adjacentRoom: Room = Game.rooms[room.getAdjacentRoomName(direction)];
                    if (adjacentRoom && adjacentRoom.controller && !adjacentRoom.controller.my && !adjacentRoom.controller.reservation) {
                        needClaimers = true;
                    }
                }
            });
        }

        let nextCreepData = null;
        if (!creepCount[Jack.KEY] || creepCount[Jack.KEY] === 1) {
            nextCreepData = CreepSpawnData.build(Jack.KEY, Jack.buildBodyArray(Math.min(energyAvailable, 600)), 0);
        } else if (!creepCount[Upgrader.KEY]) {
            nextCreepData = CreepSpawnData.build(Upgrader.KEY, Upgrader.buildBodyArray(Math.min(energyAvailable, 600)), 0);
        } else if (structureCount[STRUCTURE_EXTENSION] && structureCount[STRUCTURE_CONTAINER] && (!creepCount[Courier.KEY])) {
            nextCreepData = CreepSpawnData.build(Courier.KEY, Courier.buildBodyArray(Math.min(energyAvailable, 400)), 0);
        } else if (structureCount[STRUCTURE_CONTAINER] && (!creepCount[Miner.KEY])) {
            nextCreepData = CreepSpawnData.build(Miner.KEY, Miner.buildBodyArray(Math.min(energyAvailable, 1000)), 0);
        } else if (structureCount[STRUCTURE_CONTAINER] && (!creepCount[Miner.KEY] || creepCount[Miner.KEY] < numberOfSources)) {
            nextCreepData = CreepSpawnData.build(Miner.KEY, Miner.buildBodyArray(Math.min(energyAvailable, 1000)), 0.75);
        } else if (!creepCount[Builder.KEY]) {
            nextCreepData = CreepSpawnData.build(Builder.KEY, Builder.buildBodyArray(Math.min(energyAvailable, 600)), 0.5);
        } else if (structureCount[STRUCTURE_EXTENSION] && structureCount[STRUCTURE_CONTAINER] && (!creepCount[Courier.KEY] || creepCount[Courier.KEY] < 3)) {
            nextCreepData = CreepSpawnData.build(Courier.KEY, Courier.buildBodyArray(Math.min(energyAvailable, 600)), 0.75);
        } else if (roomNeedingDefenders) {
            nextCreepData = CreepSpawnData.build(Chaser.KEY, Chaser.buildBodyArray(Math.min(energyAvailable, 500)), 0.25);
        } else if (roomNeedingTravelers) {
            nextCreepData = CreepSpawnData.build('traveler', Builder.buildBodyArray(Math.min(energyAvailable, 600)), 0.1);
        } else if (!creepCount[Builder.KEY] || creepCount[Builder.KEY] < 3) {
            nextCreepData = CreepSpawnData.build(Builder.KEY, Builder.buildBodyArray(Math.min(energyAvailable, 600)), 0.75);
        } else if (!creepCount[Upgrader.KEY] || creepCount[Upgrader.KEY] < 4) {
            nextCreepData = CreepSpawnData.build(Upgrader.KEY, Upgrader.buildBodyArray(Math.min(energyAvailable, 600)), 0.9);
        } else if (ticksTilNextScoutSpawn < 1) {
            nextCreepData = CreepSpawnData.build(Scout.KEY, Scout.buildBodyArray(Math.min(energyAvailable, 50)), 0.75);
        } else if (needClaimers) {
            nextCreepData = CreepSpawnData.build(Claimer.KEY, Claimer.buildBodyArray(Math.min(energyAvailable, 700)), 0.9);
        }
        return nextCreepData;
    }
}