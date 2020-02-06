import * as _ from "lodash";
import {CreepSpawnData} from "./creep-spawn-data";
import {Jack} from "../../creeps/roles/jack";
import {Upgrader} from "../../creeps/roles/upgrader";
import {Courier} from "../../creeps/roles/courier";
import {Miner} from "../../creeps/roles/miner";
import {Builder} from "../../creeps/roles/builder";
import {Scout} from "../../creeps/roles/scout";
import {Claimer} from "../../creeps/roles/claimer";

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

    static getNextCreepToSpawn(room:Room): CreepSpawnData {
        let creepCount = SpawnUtil.getCreepCount(room);
        let structureCount = SpawnUtil.getStructureCount(room);
        let energyAvailable = room.energyAvailable;
        let numberOfSources = room.find(FIND_SOURCES).length;
        let ticksTilNextScoutSpawn = 0;
        if (room.memory['ticksTilNextScoutSpawn']) {
            ticksTilNextScoutSpawn = room.memory['ticksTilNextScoutSpawn'];
        }
        let roomNeedingHelp = null;
        _.forEach(Game.rooms, (room:Room) => {
            let numberOfSpots = 0;
            let numberOfCreeps = room.find(FIND_MY_CREEPS).length;
            _.forEach(room.memory['sources'], (sourceNumber) => {
                numberOfSpots += sourceNumber;
            });

            if (room.memory['sendBuilders'] && numberOfCreeps <= numberOfSpots) {
                roomNeedingHelp = room.name;
            }
        });

        let nextCreepData = null;
        if (!creepCount[Jack.KEY] || creepCount[Jack.KEY] === 1) {
            nextCreepData = CreepSpawnData.build(Jack.KEY, Jack.buildBodyArray(Math.min(energyAvailable, 600)), 0);
        } else if (!creepCount[Upgrader.KEY]) {
            nextCreepData = CreepSpawnData.build(Upgrader.KEY, Upgrader.buildBodyArray(Math.min(energyAvailable, 600)), 0);
        } else if (structureCount[STRUCTURE_EXTENSION] && structureCount[STRUCTURE_CONTAINER] && (!creepCount[Courier.KEY])) {
            nextCreepData = CreepSpawnData.build(Courier.KEY, Courier.buildBodyArray(Math.min(energyAvailable, 400)), 0);
        } else if (structureCount[STRUCTURE_CONTAINER] && (!creepCount[Miner.KEY])) {
            nextCreepData = CreepSpawnData.build(Miner.KEY, Miner.buildBodyArray(Math.min(energyAvailable, 1000)), 0.5);
        } else if (structureCount[STRUCTURE_CONTAINER] && (!creepCount[Miner.KEY] || creepCount[Miner.KEY] < numberOfSources)) {
            nextCreepData = CreepSpawnData.build(Miner.KEY, Miner.buildBodyArray(Math.min(energyAvailable, 1000)), 0.9);
        } else if (!creepCount[Builder.KEY]) {
            nextCreepData = CreepSpawnData.build(Builder.KEY, Builder.buildBodyArray(Math.min(energyAvailable, 600)), 0.5);
        } else if (structureCount[STRUCTURE_EXTENSION] && structureCount[STRUCTURE_CONTAINER] && (!creepCount[Courier.KEY] || creepCount[Courier.KEY] < 3)) {
            nextCreepData = CreepSpawnData.build(Courier.KEY, Courier.buildBodyArray(Math.min(energyAvailable, 600)), 0.75);
        } else if (roomNeedingHelp) {
            nextCreepData = CreepSpawnData.build('traveler', Builder.buildBodyArray(Math.min(energyAvailable, 600)), 0);
        } else if (!creepCount[Builder.KEY] || creepCount[Builder.KEY] < 3) {
            nextCreepData = CreepSpawnData.build(Builder.KEY, Builder.buildBodyArray(Math.min(energyAvailable, 600)), 0.75);
        } else if (!creepCount[Upgrader.KEY] || creepCount[Upgrader.KEY] < 4) {
            nextCreepData = CreepSpawnData.build(Upgrader.KEY, Upgrader.buildBodyArray(Math.min(energyAvailable, 600)), 0.9);
        } else if (ticksTilNextScoutSpawn < 1) {
            nextCreepData = CreepSpawnData.build(Scout.KEY, Scout.buildBodyArray(Math.min(energyAvailable, 50)), 0.75);
        } else {
            nextCreepData = CreepSpawnData.build(Claimer.KEY, Claimer.buildBodyArray(Math.min(energyAvailable, 700)), 0.9);
        }
        return nextCreepData;
    }
}