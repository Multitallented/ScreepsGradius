import {CreepSpawnData} from "../../structures/spawns/creep-spawn-data";
import * as _ from "lodash";
import {MineEnergyAction} from "../actions/mine-energy";
import {TransferAction} from "../actions/transfer";

export class Miner {
    static KEY = 'miner';
    static findNearestContainer(creep:Creep):Structure {
        if (!creep.memory['link'] && creep.memory['source']) {
            let source:Source = Game.getObjectById(creep.memory['source']);
            let startPos:RoomPosition = creep.pos;
            if (source != null) {
                startPos = source.pos;
            }
            let closestLink = startPos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (s:Structure) => {
                    return s.structureType === STRUCTURE_LINK && source.pos.inRangeTo(s.pos, 3);
                }});

            if (closestLink != null) {
                if (source != null) {
                    creep.memory['link'] = closestLink.id;
                }
                return closestLink;
            }
        }

        if (!creep.memory['container']) {
            let source = null;
            if (creep.memory['source']) {
                source = Game.getObjectById(creep.memory['source']);
            }
            let startPos:RoomPosition = creep.pos;
            if (source != null) {
                startPos = source.pos;
            }
            let closestContainer = startPos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                    return s.structureType === STRUCTURE_CONTAINER;
                }});

            if (closestContainer != null) {
                if (source != null) {
                    creep.memory['container'] = closestContainer.id;
                }
                return closestContainer;
            }
        }
        if (creep.memory['link']) {
            let link:Structure = Game.getObjectById(creep.memory['link']);
            if (link && link['store'].getFreeCapacity(RESOURCE_ENERGY) > 0) {
                return link;
            }
        }
        if (creep.memory['container']) {
            return Game.getObjectById(creep.memory['container']);
        }
        return null;
    }

    static setAction(creep:Creep) {
        switch (creep.memory['action']) {
            case MineEnergyAction.KEY:
                let container = Miner.findNearestContainer(creep);
                if (container != null) {
                    TransferAction.setAction(creep, container, RESOURCE_ENERGY);
                }
                break;
            case TransferAction.KEY:
            default:
                if (!creep.memory['source']) {
                    let availableSources:Array<Source> = creep.room.find(FIND_SOURCES);
                    _.forEach(creep.room.find(FIND_MY_CREEPS, {filter: (c:Creep) => {
                            return c.memory['role'] && c.memory['source'] && c.memory['role'] === Miner.KEY;
                        }}), (c:Creep) => {
                        let currentSource:Source = Game.getObjectById(c.memory['source']);
                        let index = availableSources.indexOf(currentSource);
                        if (index !== -1) {
                            availableSources.splice(index, 1);
                        }
                    });
                    if (availableSources.length > 0) {
                        creep.memory['source'] = availableSources[0].id;
                    }
                }
                let source = null;
                if (creep.memory['source']) {
                    source = Game.getObjectById(creep.memory['source']);
                }
                if (source) {
                    MineEnergyAction.setActionWithTarget(creep, source);
                } else {
                    MineEnergyAction.setAction(creep);
                }
                break;
        }
        creep.runAction();
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, CARRY, WORK ];
        energyAvailable -= 200;
        let partCount = { 'WORK': 1, 'MOVE': 1, 'CARRY': 1 };
        while (energyAvailable >= 50 && bodyArray.length < 30) {
            if (partCount['WORK'] < 8 && energyAvailable >= CreepSpawnData.getBodyPartCost(WORK)) {
                bodyArray.unshift(WORK);
                partCount['WORK'] += 1;
                energyAvailable -= CreepSpawnData.getBodyPartCost(WORK);
            } else {
                bodyArray.unshift(MOVE);
                partCount['MOVE'] += 1;
                energyAvailable -= CreepSpawnData.getBodyPartCost(MOVE);
            }
        }
        return bodyArray;
    }
}