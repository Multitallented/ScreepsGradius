import {CreepSpawnData} from "../../structures/spawns/creep-spawn-data";
import {WithdrawEnergyAction} from "../actions/withdraw-energy";
import {TransferEnergyAction} from "../actions/transfer-energy";
import {StructureUtil} from "../../structures/structure-util";

export class Courier {
    static KEY = 'courier';

    static getNextContainerNeedingEnergy(creep:Creep):Structure {
        let storageStructures:Array<Structure> = creep.room.find(FIND_STRUCTURES, {filter: (s:Structure) => {
                return (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_STORAGE ||
                    s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_TOWER ||
                    s.structureType === STRUCTURE_CONTAINER) &&
                    s['store'].getCapacity(RESOURCE_ENERGY) > s['store'].getUsedCapacity(RESOURCE_ENERGY);
            }});

        if (storageStructures.length > 0) {
            StructureUtil.sortByPriority(storageStructures, (x, y) => {
                if (x.store.energy > y.store.energy) {
                    return 1;
                } else if (y.store.energy > x.store.energy) {
                    return -1;
                } else {
                    return 0;
                }
            });
            return storageStructures[0];
        }
        return null;
    }

    static setAction(creep:Creep) {
        if (creep.store.energy > 0) {
            let container = Courier.getNextContainerNeedingEnergy(creep);
            if (container) {
                TransferEnergyAction.setAction(creep, container);
            }
        } else {
            let containers:Array<Structure> = creep.room.find(FIND_STRUCTURES, {filter: (s:Structure) => {
                    return (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
                        s['store'].energy > 0;
                }});
            containers.sort((x:Structure, y:Structure):number => {
                if (x['store'].energy > y['store'].energy) {
                    return -1;
                } else if (x['store'].energy < y['store'].energy) {
                    return 1;
                } else {
                    return 0;
                }
            });
            if (containers.length > 0) {
                WithdrawEnergyAction.setAction(creep, containers[0]);
            }
        }
        creep.runAction();
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, CARRY ];
        energyAvailable = Math.min(energyAvailable, 600);
        energyAvailable -= 100;
        let partCount = { 'MOVE': 1, 'CARRY': 1 };
        while (energyAvailable >= 50) {
            if (partCount['MOVE'] <= partCount['CARRY']) {
                partCount['MOVE'] += 1;
                bodyArray.unshift(MOVE);
                energyAvailable -= CreepSpawnData.getBodyPartCost(MOVE);
            } else {
                bodyArray.unshift(CARRY);
                partCount['CARRY'] += 1;
                energyAvailable -= CreepSpawnData.getBodyPartCost(CARRY);
            }
        }
        return bodyArray;
    }
}