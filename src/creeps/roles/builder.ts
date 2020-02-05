import {BuildAction} from "../actions/build";
import {MineEnergyAction} from "../actions/mine-energy";
import {UpgradeControllerAction} from "../actions/upgrade-controller";
import {Jack} from "./jack";
import {WithdrawEnergyAction} from "../actions/withdraw-energy";
import {RepairAction} from "../actions/repair";

export class Builder {
    static KEY =  'builder';
    static setAction(creep:Creep) {
        switch (creep.memory['action']) {
            case WithdrawEnergyAction.KEY:
            case MineEnergyAction.KEY:
                let closestStructureNeedingRepair:Structure = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                        return s.hitsMax && (s.hits / s.hitsMax < 0.9);
                    }});
                if (closestStructureNeedingRepair != null) {
                    RepairAction.setAction(creep, closestStructureNeedingRepair);
                    break;
                }

                let closestConstructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                if (closestConstructionSite != null) {
                    BuildAction.setAction(creep, closestConstructionSite);
                    break;
                }
                UpgradeControllerAction.setAction(creep);
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
                MineEnergyAction.setAction(creep);
                break;
        }
        creep.runAction();
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        return Jack.buildBodyArray(energyAvailable);
    }
}