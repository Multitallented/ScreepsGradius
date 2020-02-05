import {MineEnergyAction} from "../actions/mine-energy";
import * as _ from "lodash";
import {UpgradeControllerAction} from "../actions/upgrade-controller";
import {CreepSpawnData} from "../../structures/spawns/creep-spawn-data";
import {TransferEnergyAction} from "../actions/transfer-energy";
import {WithdrawEnergyAction} from "../actions/withdraw-energy";

export class Jack {
    static KEY = 'jack';
    static setAction(creep:Creep) {
        switch (creep.memory['action']) {
            case WithdrawEnergyAction.KEY:
            case MineEnergyAction.KEY:
                let spawns:Array<Structure> = creep.room.find(FIND_STRUCTURES);

                let spawnNeedingEnergy:StructureSpawn = null;
                _.forEach(spawns, (spawn:StructureSpawn) => {
                    if (spawn.structureType !== STRUCTURE_SPAWN && spawn.structureType != STRUCTURE_TOWER) {
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
            case UpgradeControllerAction.KEY:
            default:
                let closestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                        return (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
                            s['store'].energy > 0;
                    }});
                if (closestContainer != null) {
                    WithdrawEnergyAction.setAction(creep, closestContainer);
                    break;
                }
                MineEnergyAction.setAction(creep);
                break;
        }
        creep.runAction();
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