import * as _ from "lodash";
import { CreepPrototype } from "./creep-prototype";
import {MineEnergyAction} from "./actions/mine";
import {UpgradeControllerAction} from "./actions/upgrade-controller";

export class CreepController {
    constructor() {
        CreepPrototype.init();
        _.forEach(Game.creeps, (creep) => {
            CreepController.runNextAction(creep);
        });
    }

    static runNextAction(creep:Creep) {
        if (!creep.memory['action']) {
            creep.memory['action'] = MineEnergyAction.KEY;
        }
        switch (creep.memory['action']) {
            case UpgradeControllerAction.KEY:
                UpgradeControllerAction.run(creep);
                break;
            case MineEnergyAction.KEY:
            default:
                MineEnergyAction.run(creep);
                break;
        }
    }

    static setNextAction(creep:Creep) {

    }
}