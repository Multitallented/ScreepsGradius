import {CreepSpawnData} from "../../structures/spawns/creep-spawn-data";
import {WithdrawEnergyAction} from "../actions/withdraw-energy";
import {TransferEnergyAction} from "../actions/transfer-energy";
import {StructureUtil} from "../../structures/structure-util";

export class Courier {
    static KEY = 'courier';
    static setAction(creep:Creep) {
        switch (creep.memory['action']) {
            case WithdrawEnergyAction.KEY:
                let storageStructures:Array<Structure> = creep.room.find(FIND_STRUCTURES, {filter: (s:Structure) => {
                    return (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_STORAGE ||
                        s.structureType === STRUCTURE_EXTENSION) &&
                        s['store'].getCapacity(RESOURCE_ENERGY) > s['store'].getUsedCapacity(RESOURCE_ENERGY);
                }});

                if (storageStructures.length > 0) {
                    StructureUtil.sortByPriority(storageStructures);
                    TransferEnergyAction.setAction(creep, storageStructures[0]);
                }
                break;
            default:
                let closestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                        return (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
                            s['store'].energy > 0;
                    }});
                if (closestContainer != null) {
                    WithdrawEnergyAction.setAction(creep, closestContainer);
                    break;
                }
        }
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, CARRY ];
        energyAvailable = Math.min(energyAvailable, 600);
        energyAvailable -= 100;
        let partCount = { 'MOVE': 1, 'CARRY': 1 };
        while (energyAvailable >= 50) {
            if (partCount['MOVE'] <= partCount['WORK'] && partCount['MOVE'] <= partCount['CARRY']) {
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