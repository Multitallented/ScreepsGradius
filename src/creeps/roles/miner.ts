import {CreepSpawnData} from "../../structures/spawns/creep-spawn-data";
import * as _ from "lodash";
import {MineEnergyAction} from "../actions/mine-energy";
import {TransferEnergyAction} from "../actions/transfer-energy";

export class Miner {
    static KEY = 'miner';
    static findNearestContainer(creep:Creep):Structure {
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
        return Game.getObjectById(creep.memory['container']);
    }

    static setAction(creep:Creep) {
        let runNextAction = true;
        // noinspection FallThroughInSwitchStatementJS
        switch (creep.memory['action']) {
            case MineEnergyAction.KEY:
                let container = Miner.findNearestContainer(creep);
                if (container != null) {
                    TransferEnergyAction.setAction(creep, container);
                }
                break;
            case TransferEnergyAction.KEY:
                runNextAction = false;
            default:
                if (!creep.memory['source']) {
                    let availableSources:Array<Source> = creep.room.find(FIND_SOURCES);
                    _.forEach(creep.room.find(FIND_MY_CREEPS, {filter: (c:Creep) => {
                            return c.memory['role'] && c.memory['target'] && c.memory['role'] === Miner.KEY;
                        }}), (c:Creep) => {
                        let currentSource:Source = Game.getObjectById(c.memory['target']);
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
                if (source != null) {
                    MineEnergyAction.setActionWithTarget(creep, source);
                } else {
                    MineEnergyAction.setAction(creep);
                }
                break;
        }
        if (runNextAction) {
            creep.runAction();
        }
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, CARRY, WORK ];
        energyAvailable = Math.min(energyAvailable, 1000);
        energyAvailable -= 200;
        let partCount = { 'WORK': 1, 'MOVE': 1, 'CARRY': 1 };
        while (energyAvailable >= 50) {
            if (energyAvailable >= CreepSpawnData.getBodyPartCost(WORK)) {
                bodyArray.unshift(WORK);
                partCount['WORK'] += 1;
                energyAvailable -= CreepSpawnData.getBodyPartCost(WORK);
            } else {
                bodyArray.unshift(CARRY);
                partCount['CARRY'] += 1;
                energyAvailable -= CreepSpawnData.getBodyPartCost(CARRY);
            }
        }
        return bodyArray;
    }
}