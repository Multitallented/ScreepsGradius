import {BuildAction} from "../actions/build";
import {MineEnergyAction} from "../actions/mine-energy";
import {UpgradeControllerAction} from "../actions/upgrade-controller";
import {Jack} from "./jack";

export class Builder {
    static KEY =  'builder';
    static setAction(creep:Creep) {

        switch (creep.memory['action']) {
            case MineEnergyAction.KEY:
                let constructionSites = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                if (constructionSites != null) {
                    BuildAction.setAction(creep, constructionSites[0]);
                    break;
                }
                UpgradeControllerAction.setAction(creep);
                break;
            default:
                MineEnergyAction.setAction(creep);
                break;
        }
        creep.runAction();
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        return Jack.buildBodyArray(energyAvailable);
    }
}