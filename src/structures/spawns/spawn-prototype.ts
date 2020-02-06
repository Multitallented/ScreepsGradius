import * as _ from "lodash";
import {CreepSpawnData} from "./creep-spawn-data";
import {Jack} from "../../creeps/roles/jack";
import {Upgrader} from "../../creeps/roles/upgrader";
import {Builder} from "../../creeps/roles/builder";
import {Miner} from "../../creeps/roles/miner";
import {Courier} from "../../creeps/roles/courier";
import {Scout} from "../../creeps/roles/scout";

const getCreepCount = function():Object {
    let creepCount = {};

    _.forEach(this.room.find(FIND_CREEPS,{filter: (creep) => {return creep.memory && creep.memory['role'];}}),
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
};

const getStructureCount = function():Object {
    let structureCount = {};
    _.forEach(this.room.find(FIND_STRUCTURES), (s:Structure) => {
        if (structureCount[s.structureType]) {
            structureCount[s.structureType] += 1;
        } else {
            structureCount[s.structureType] = 1;
        }
    });
    return structureCount;
};

const getNextCreepToSpawn = function(): CreepSpawnData {
    let creepCount = this.getCreepCount();
    let structureCount = this.getStructureCount();
    let energyAvailable = this.room.energyAvailable;
    let numberOfSources = this.room.find(FIND_SOURCES).length;
    let ticksTilNextScoutSpawn = 0;
    if (this.room.memory['ticksTilNextScoutSpawn']) {
        ticksTilNextScoutSpawn = this.room.memory['ticksTilNextScoutSpawn'];
    }

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
    } else if (!creepCount[Builder.KEY] || creepCount[Builder.KEY] < 3) {
        nextCreepData = CreepSpawnData.build(Builder.KEY, Builder.buildBodyArray(Math.min(energyAvailable, 600)), 0.75);
    } else if (!creepCount[Upgrader.KEY] || creepCount[Upgrader.KEY] < 4) {
        nextCreepData = CreepSpawnData.build(Upgrader.KEY, Upgrader.buildBodyArray(Math.min(energyAvailable, 600)), 0.9);
    } else if (ticksTilNextScoutSpawn < 1) {
        nextCreepData = CreepSpawnData.build(Scout.KEY, Scout.buildBodyArray(Math.min(energyAvailable, 50)), 0.75);
    }
    return nextCreepData;
};


declare global {
    interface StructureSpawn {
        getStructureCount():Object;
        getCreepCount():Object;
        getNextCreepToSpawn();
        init:boolean;
    }
}

export class SpawnPrototype {
    static init() {
        if (!StructureSpawn['init']) {
            StructureSpawn.prototype.getStructureCount = getStructureCount;
            StructureSpawn.prototype.getCreepCount = getCreepCount;
            StructureSpawn.prototype.getNextCreepToSpawn = getNextCreepToSpawn;
            StructureSpawn.prototype.init = true;
        }
    }
}