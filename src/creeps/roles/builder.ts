import {BuildAction} from "../actions/build";
import {MineEnergyAction} from "../actions/mine-energy";
import {UpgradeControllerAction} from "../actions/upgrade-controller";
import {Jack} from "./jack";
import {WithdrawEnergyAction} from "../actions/withdraw-energy";
import {RepairAction} from "../actions/repair";
import * as _ from "lodash";

export class Builder {
    static KEY =  'builder';

    static getAlreadyTaggedTargets(creep:Creep):Object {
        let alreadyTaggedTargets = {};
        _.forEach(creep.room.find(FIND_MY_CREEPS, {filter: (c:Creep) => {
                return c.memory['role'] && c.memory['role'] === Builder.KEY && c.memory['target'];
            }}), (c:Creep) => {
            alreadyTaggedTargets[c.memory['target']] = true;
        });
        return alreadyTaggedTargets;
    }

    static setAction(creep:Creep) {
        let alreadyTaggedTargets = Builder.getAlreadyTaggedTargets(creep);
        if (creep.store.energy > 0) {
            let closestStructureNeedingRepair:Structure = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                    return s.hitsMax && (s.hits / s.hitsMax < 0.9) && !alreadyTaggedTargets[s.id];
                }});
            if (closestStructureNeedingRepair != null) {
                RepairAction.setAction(creep, closestStructureNeedingRepair);
            } else {
                let closestConstructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                if (closestConstructionSite != null) {
                    BuildAction.setAction(creep, closestConstructionSite);
                } else {
                    UpgradeControllerAction.setAction(creep);
                }
            }
        } else {
            let closestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                    return (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
                        s['store'].energy > 0;
                }});
            if (closestContainer != null) {
                WithdrawEnergyAction.setAction(creep, closestContainer);
            } else {
                MineEnergyAction.setAction(creep);
            }
        }
        creep.runAction();
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        return Jack.buildBodyArray(energyAvailable);
    }
}