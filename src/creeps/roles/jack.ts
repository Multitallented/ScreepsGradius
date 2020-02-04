import {MineEnergyAction} from "../actions/mine-energy";
import * as _ from "lodash";
import {UpgradeControllerAction} from "../actions/upgrade-controller";
import {CreepSpawnData} from "../../spawns/creep-spawn-data";
import {TransferEnergyAction} from "../actions/transfer-energy";

export class Jack {
    static KEY = 'jack';
    static setAction(creep:Creep) {
        switch (creep.memory['action']) {
            case MineEnergyAction.KEY:
                let spawnNeedingEnergy:StructureSpawn = null;
                _.forEach(creep.room.find(FIND_STRUCTURES, {filter: (structure:Structure) => {return structure.structureType === STRUCTURE_SPAWN;}}),
                    (spawn:StructureSpawn) => {
                    console.log(spawn.store.getFreeCapacity(RESOURCE_ENERGY));
                    if (0 !== spawn.store.getFreeCapacity(RESOURCE_ENERGY)) {
                        spawnNeedingEnergy = spawn;
                    }
                });
                if (spawnNeedingEnergy != null) {
                    TransferEnergyAction.setAction(creep, spawnNeedingEnergy);
                    break;
                }
                UpgradeControllerAction.setAction(creep);
                break;
            case UpgradeControllerAction.KEY:
            case TransferEnergyAction.KEY:
            default:
                MineEnergyAction.setAction(creep);
                break;
        }
        creep.runAction();
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, CARRY, WORK ];
        energyAvailable = Math.min(energyAvailable, 600);
        energyAvailable -= 200;
        let partCount = { WORK: 1, MOVE: 1, CARRY: 1 };
        while (energyAvailable >= 50) {
            if (partCount[MOVE] <= partCount[WORK] && partCount[MOVE] <= partCount[CARRY]) {
                partCount[MOVE] += 1;
                bodyArray.unshift(MOVE);
                energyAvailable -= CreepSpawnData.getBodyPartCost(MOVE);
            } else if (partCount[WORK] <= partCount[CARRY] &&
                    energyAvailable >= CreepSpawnData.getBodyPartCost(WORK)) {
                bodyArray.unshift(WORK);
                partCount[WORK] += 1;
                energyAvailable -= CreepSpawnData.getBodyPartCost(WORK);
            } else {
                bodyArray.unshift(CARRY);
                partCount[CARRY] += 1;
                energyAvailable -= CreepSpawnData.getBodyPartCost(CARRY);
            }
        }
        return bodyArray;
    }
}