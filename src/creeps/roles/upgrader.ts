import {MineEnergyAction} from "../actions/mine-energy";
import {UpgradeControllerAction} from "../actions/upgrade-controller";
import {Jack} from "./jack";
import {WithdrawEnergyAction} from "../actions/withdraw-energy";

export class Upgrader {
    static KEY = 'upgrader';
    static setAction(creep:Creep) {
        let runNextAction = true;

        switch (creep.memory['action']) {
            case UpgradeControllerAction.KEY:
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
            case WithdrawEnergyAction.KEY:
                runNextAction = false;
            case MineEnergyAction.KEY:
            default:
                UpgradeControllerAction.setAction(creep);
                break;
        }
        if (runNextAction) {
            creep.runAction();
        }
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        return Jack.buildBodyArray(energyAvailable);
    }
}