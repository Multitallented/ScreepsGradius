import {MineEnergyAction} from "../actions/mine";
import {UpgradeControllerAction} from "../actions/upgrade-controller";

export class Harvester {
    static KEY = 'harvester';
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
    }
}