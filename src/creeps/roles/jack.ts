import {MineEnergyAction} from "../actions/mine-energy";
import * as _ from "lodash";
import {UpgradeControllerAction} from "../actions/upgrade-controller";
import {CreepSpawnData} from "../../structures/spawns/creep-spawn-data";
import {TransferAction} from "../actions/transfer";
import {WithdrawAction} from "../actions/withdraw";

export class Jack {
    static KEY = 'jack';
    static setAction(creep:Creep) {
        switch (creep.memory['action']) {
            case WithdrawAction.KEY:
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
                    TransferAction.setAction(creep, spawnNeedingEnergy, RESOURCE_ENERGY);
                    break;
                }
                UpgradeControllerAction.setAction(creep);
                break;
            case TransferAction.KEY:
            case UpgradeControllerAction.KEY:
            default:
                let closestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                        return (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE ||
                            s.structureType === STRUCTURE_LINK) &&
                            s['store'].energy > 0;
                    }});
                if (closestContainer != null) {
                    WithdrawAction.setAction(creep, closestContainer, RESOURCE_ENERGY);
                    break;
                }
                MineEnergyAction.setAction(creep);
                break;
        }
        creep.runAction();
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, CARRY, WORK ];
        energyAvailable -= 200;
        let partCount = { 'WORK': 1, 'MOVE': 1, 'CARRY': 1 };
        while (energyAvailable >= 50 && bodyArray.length < 30) {
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