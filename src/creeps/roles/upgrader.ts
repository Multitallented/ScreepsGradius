import {MineEnergyAction} from "../actions/mine-energy";
import {UpgradeControllerAction} from "../actions/upgrade-controller";
import {Jack} from "./jack";

export class Upgrader {
    static KEY = 'upgrader';
    static setAction(creep:Creep) {
        switch (creep.memory['action']) {
            case UpgradeControllerAction.KEY:
                MineEnergyAction.setAction(creep);
                break;
            case MineEnergyAction.KEY:
            default:
                UpgradeControllerAction.setAction(creep);
                break;
        }
        creep.runAction();
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        return Jack.buildBodyArray(energyAvailable);
    }
}