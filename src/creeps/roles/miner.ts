import {CreepSpawnData} from "../../spawns/creep-spawn-data";
import {WithdrawEnergyAction} from "../actions/withdraw-energy";
import {MineEnergyAction} from "../actions/mine-energy";
import {TransferEnergyAction} from "../actions/transfer-energy";

export class Miner {
    static KEY = 'miner';
    static setAction(creep:Creep) {
        let runNextAction = true;
        // noinspection FallThroughInSwitchStatementJS
        switch (creep.memory['action']) {
            case WithdrawEnergyAction.KEY:
            case MineEnergyAction.KEY:
                let closestContainer:Structure = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                        return s.structureType === STRUCTURE_CONTAINER;
                    }});

                if (closestContainer != null) {
                    TransferEnergyAction.setAction(creep, closestContainer);
                }
                break;
            case TransferEnergyAction.KEY:
                runNextAction = false;
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
        energyAvailable = Math.min(energyAvailable, 1000);
        energyAvailable -= 200;
        let partCount = { 'WORK': 1, 'MOVE': 1, 'CARRY': 1 };
        while (energyAvailable >= 50) {
            if (energyAvailable >= CreepSpawnData.getBodyPartCost(WORK)) {
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