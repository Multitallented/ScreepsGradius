import {MineEnergyAction} from "../actions/mine-energy";
import * as _ from "lodash";
import {UpgradeControllerAction} from "../actions/upgrade-controller";
import {CreepSpawnData} from "../../spawns/creep-spawn-data";
import {TransferEnergyAction} from "../actions/transfer-energy";

export class Jack {
    static KEY = 'jack';
    static setAction(creep:Creep) {
        let runNextAction = true;
        // noinspection FallThroughInSwitchStatementJS
        switch (creep.memory['action']) {
            case MineEnergyAction.KEY:
                let spawns:Array<Structure> = creep.room.find(FIND_STRUCTURES);

                let spawnNeedingEnergy:StructureSpawn = null;
                _.forEach(spawns, (spawn:StructureSpawn) => {
                    if (spawn.structureType !== STRUCTURE_SPAWN) {
                        return;
                    }
                    if (spawn.store.getCapacity(RESOURCE_ENERGY) !== spawn.store.energy) {
                        spawnNeedingEnergy = spawn;
                    }
                });
                if (spawnNeedingEnergy != null) {
                    TransferEnergyAction.setAction(creep, spawnNeedingEnergy);
                    break;
                }
                UpgradeControllerAction.setAction(creep);
                break;
            case TransferEnergyAction.KEY:
                runNextAction = false;
            case UpgradeControllerAction.KEY:
            default:
                MineEnergyAction.setAction(creep);
                break;
        }
        if (runNextAction) {
            creep.runAction();
        }
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, CARRY, WORK ];
        energyAvailable = Math.min(energyAvailable, 600);
        energyAvailable -= 200;
        let partCount = { 'WORK': 1, 'MOVE': 1, 'CARRY': 1 };
        while (energyAvailable >= 50) {
            if (partCount['MOVE'] <= partCount['WORK'] && partCount['MOVE'] <= partCount['CARRY']) {
                partCount['MOVE'] += 1;
                bodyArray.unshift(MOVE);
                energyAvailable -= CreepSpawnData.getBodyPartCost(MOVE);
            } else if (partCount['WORK'] <= partCount['CARRY'] &&
                    energyAvailable >= CreepSpawnData.getBodyPartCost(WORK)) {
                bodyArray.unshift(WORK);
                partCount['WORK'] += 1;
                energyAvailable -= CreepSpawnData.getBodyPartCost(WORK);
            } else {
                bodyArray.unshift(CARRY);
                partCount['CARRY'] += 1;
                energyAvailable -= CreepSpawnData.getBodyPartCost(CARRY);
            }
        }
        return bodyArray;
    }
}