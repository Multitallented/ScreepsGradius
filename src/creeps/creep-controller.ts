import * as _ from "lodash";
import { CreepPrototype } from "./creep-prototype";

export class CreepController {
    constructor() {
        CreepPrototype.init();
        _.forEach(Game.creeps, (creep) => {
            if (!creep.spawning) {
                creep.runAction();
            }
        });
    }
}