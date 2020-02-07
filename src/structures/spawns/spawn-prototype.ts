import {CreepSpawnData} from "./creep-spawn-data";
import {SpawnUtil} from "./spawn-util";

const getNextCreepToSpawn = function(): CreepSpawnData {
    return SpawnUtil.getNextCreepToSpawn(this);
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