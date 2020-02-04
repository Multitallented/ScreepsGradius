import * as _ from "lodash";
import {CreepSpawnData} from "./creep-spawn-data";
import {Jack} from "../creeps/roles/jack";
import {Upgrader} from "../creeps/roles/upgrader";

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

const getNextCreepToSpawn = function(): CreepSpawnData {
    let creepCount = this.getCreepCount();

    let nextCreepData = null;
    if (!creepCount[Jack.KEY] || creepCount[Jack.KEY] === 1) {
        nextCreepData = CreepSpawnData.build(Jack.KEY, Jack.buildBodyArray(this.store.energy));
    } else if (!creepCount[Upgrader.KEY] || creepCount[Upgrader.KEY] < 6) {
        nextCreepData = CreepSpawnData.build(Upgrader.KEY, Upgrader.buildBodyArray(this.store.energy));
    }
    return nextCreepData;
};


declare global {
    interface StructureSpawn {
        getCreepCount():Object;
        getNextCreepToSpawn();
        init:boolean;
    }
}

export class SpawnPrototype {
    static init() {
        if (!StructureSpawn['init']) {
            StructureSpawn.prototype.getCreepCount = getCreepCount;
            StructureSpawn.prototype.getNextCreepToSpawn = getNextCreepToSpawn;
            StructureSpawn.prototype.init = true;
        }
    }
}