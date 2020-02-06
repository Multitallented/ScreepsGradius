import {CreepSpawnData} from "../../structures/spawns/creep-spawn-data";

export class Claimer {
    static KEY = 'claimer';

    static setAction(creep:Creep) {
        // TODO
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, CLAIM ];
        energyAvailable -= 650;
        let partCount = { 'CLAIM': 1, 'MOVE': 1, 'TOUGH': 0 };
        while (energyAvailable >= 10) {
            if (partCount['MOVE'] - 3 < partCount['TOUGH']) {
                partCount['MOVE'] += 1;
                bodyArray.unshift(MOVE);
                energyAvailable -= CreepSpawnData.getBodyPartCost(MOVE);
            } else {
                partCount['TOUGH'] += 1;
                bodyArray.unshift(TOUGH);
                energyAvailable -= CreepSpawnData.getBodyPartCost(TOUGH);
            }
        }
        return bodyArray;
    }
}