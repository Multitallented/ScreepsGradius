import {BuildAction} from "../actions/build";
import {MineEnergyAction} from "../actions/mine-energy";
import {UpgradeControllerAction} from "../actions/upgrade-controller";
import {Jack} from "./jack";
import {WithdrawAction} from "../actions/withdraw";
import {RepairAction} from "../actions/repair";
import * as _ from "lodash";
import {StructureUtil} from "../../structures/structure-util";

export class Builder {
    static KEY =  'builder';

    static needsRepair(structureType:StructureConstant, hits:number, hitsMax:number):boolean {
        switch(structureType) {
            case STRUCTURE_RAMPART:
            case STRUCTURE_WALL:
                return hits < 10000;
            default:
                return hits / hitsMax < 0.75
        }
    }

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
                    return s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART &&
                        s.hitsMax && Builder.needsRepair(s.structureType, s.hits, s.hitsMax) && !alreadyTaggedTargets[s.id];
                }});
            if (closestStructureNeedingRepair != null) {
                RepairAction.setAction(creep, closestStructureNeedingRepair);
            } else {
                let constructionSites:Array<ConstructionSite> = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

                if (constructionSites.length) {
                    StructureUtil.sortByPriority(constructionSites,  null);
                    BuildAction.setAction(creep, constructionSites[0]);
                } else {
                    UpgradeControllerAction.setAction(creep);
                }
            }
        } else {
            let closestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                    return (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
                        s['store'].energy > 0;
                }});
            if (closestContainer) {
                WithdrawAction.setAction(creep, closestContainer, RESOURCE_ENERGY);
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