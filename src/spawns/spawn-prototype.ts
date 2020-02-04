import * as _ from "lodash";
import {CreepSpawnData} from "./creep-spawn-data";
import {Jack} from "../creeps/roles/jack";

const getNextCreepToSpawn = function(): CreepSpawnData {
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

    let nextCreepData = null;
    if (!creepCount[Jack.KEY]) {
        nextCreepData = new CreepSpawnData(Jack.buildBodyArray(this.store.energy),
            Jack.KEY + Game.time,
            {
                "role": Jack.KEY
            });
    }
    return nextCreepData;
};

declare global {
    interface StructureSpawn {
        getNextCreepToSpawn();
        init:boolean;
    }
}

export class SpawnPrototype {
    static init() {
        if (!StructureSpawn['init']) {
            StructureSpawn.prototype.getNextCreepToSpawn = getNextCreepToSpawn;
            StructureSpawn.prototype.init = true;
        }
    }
}