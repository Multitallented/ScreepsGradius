import {MineEnergyAction} from "../actions/mine";
import {UpgradeControllerAction} from "../actions/upgrade-controller";

export class Jack {
    static KEY = 'jack';
    static setAction(creep:Creep) {
        switch (creep.memory['action']) {
            case MineEnergyAction.KEY:
                UpgradeControllerAction.setAction(creep);
                break;
            case UpgradeControllerAction.KEY:
            default:
                MineEnergyAction.setAction(creep);
                break;
        }
        creep.runAction();
    }
}