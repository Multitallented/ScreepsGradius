import {MineEnergyAction} from "../actions/mine-energy";
import {UpgradeControllerAction} from "../actions/upgrade-controller";
import {Jack} from "./jack";
import {WithdrawAction} from "../actions/withdraw";

export class Upgrader {
    static KEY = 'upgrader';
    static setAction(creep:Creep) {
        if (creep.store.getFreeCapacity() < 50 && creep.memory['originRoom'] && creep.room.controller && creep.room.controller.reservation) {
            creep.memory['role'] = 'traveler';
            creep.memory['destinationRoom'] = creep.memory['originRoom'];
            creep.memory['originRoom'] = creep.room.name;
            delete creep.memory['action'];
            delete creep.memory['path'];
            creep.runAction();
            return;
        }

        switch (creep.memory['action']) {
            case UpgradeControllerAction.KEY:
                let closestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                        return (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
                            s['store'].energy > 0;
                    }});
                if (closestContainer != null) {
                    WithdrawAction.setAction(creep, closestContainer, RESOURCE_ENERGY);
                    break;
                }
                MineEnergyAction.setAction(creep);
                break;
            case WithdrawAction.KEY:
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