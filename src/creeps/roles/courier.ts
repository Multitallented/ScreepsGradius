import {CreepSpawnData} from "../../structures/spawns/creep-spawn-data";
import {WithdrawAction} from "../actions/withdraw";
import {TransferAction} from "../actions/transfer";
import {StructureUtil} from "../../structures/structure-util";
import {PickupAction} from "../actions/pickup";
import * as _ from "lodash";
import {RoomUtil} from "../../rooms/room-util";
import {MoveAction} from "../actions/move";

export class Courier {
    static KEY = 'courier';

    static getNextContainerNeedingEnergy(creep:Creep, alreadyTaggedTargets):Structure {
        let storageStructures:Array<Structure> = creep.room.find(FIND_STRUCTURES, {filter: (s:Structure) => {
                return (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_STORAGE ||
                    s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_TOWER ||
                    s.structureType === STRUCTURE_CONTAINER) &&
                    (s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_CONTAINER || !alreadyTaggedTargets[s.id]) &&
                    s['store'].getCapacity(RESOURCE_ENERGY) > s['store'].getUsedCapacity(RESOURCE_ENERGY);
            }});

        if (storageStructures.length > 0) {
            StructureUtil.sortByPriority(storageStructures, (x, y) => {
                if (x.store.energy > y.store.energy) {
                    return 1;
                } else if (y.store.energy > x.store.energy) {
                    return -1;
                } else {
                    let xDistance = RoomUtil.crowDistance(creep.pos, x.pos);
                    let yDistance = RoomUtil.crowDistance(creep.pos, y.pos);
                    if (xDistance > yDistance) {
                        return 1;
                    } else if (yDistance > xDistance) {
                        return -1;
                    } else {
                        return 0;
                    }
                }
            });
            return storageStructures[0];
        }
        return null;
    }

    static getAlreadyTaggedTargets(creep:Creep):Object {
        let alreadyTaggedTargets = {};
        _.forEach(creep.room.find(FIND_MY_CREEPS, {filter: (c:Creep) => {
                return c.memory['role'] && c.memory['role'] === Courier.KEY && c.memory['target'];
            }}), (c:Creep) => {
            alreadyTaggedTargets[c.memory['target']] = true;
        });
        return alreadyTaggedTargets;
    }

    static deliverEnergy(creep:Creep, alreadyTaggedTargets):boolean {
        if (creep.store.energy < 50) {
            return false;
        }
        let container = Courier.getNextContainerNeedingEnergy(creep, alreadyTaggedTargets);
        if (container) {
            TransferAction.setAction(creep, container, RESOURCE_ENERGY);
            creep.runAction();
            return true;
        }
        return false;
    }

    static unloadResources(creep:Creep):boolean {
        let storedResources:Array<ResourceConstant> = _.filter(Object.keys(creep.store), (r:ResourceConstant) => {
            return r !== RESOURCE_ENERGY && creep.store[r] > 0;
        }) as Array<ResourceConstant>;
        if (storedResources.length) {
            let closestStorage = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                return (s.structureType === STRUCTURE_STORAGE) &&
                    s['store'].getFreeCapacity(storedResources[0]) > 0;
            }});
            if (!closestStorage) {
                closestStorage = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                        return (s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_CONTAINER) &&
                            s['store'].getFreeCapacity(storedResources[0]) > 0;
                    }});
            }
            if (closestStorage) {
                TransferAction.setAction(creep, closestStorage, storedResources[0]);
                creep.runAction();
                return true;
            }
        }
        return false;
    }

    private static withdrawResourcesFromContainer(creep: Creep) {
        let closestStorage = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (s:Structure) => {
                return s.structureType === STRUCTURE_STORAGE && s['store'].getFreeCapacity() > 0;
            }});
        if (!closestStorage) {
            return false;
        }
        let closestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                return s.structureType === STRUCTURE_CONTAINER &&
                    s['store'].getUsedCapacity(RESOURCE_ENERGY) !== s['store'].getUsedCapacity();
            }});
        if (!closestContainer) {
            return false;
        }
        let storedResources:Array<ResourceConstant> = _.filter(Object.keys(closestContainer['store']), (r:ResourceConstant) => {
            return r !== RESOURCE_ENERGY && closestContainer['store'][r] > 0;
        }) as Array<ResourceConstant>;
        if (storedResources.length) {
            WithdrawAction.setAction(creep, closestContainer, storedResources[0]);
            creep.runAction();
            return true;
        }
        return false;
    }

    static pickUpEnergy(creep:Creep, alreadyTaggedTargets):boolean {
        let energy:Resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: (r) => {
                return r.resourceType && r.amount > 20 && !alreadyTaggedTargets[r.id]; }});
        if (energy) {
            PickupAction.setAction(creep, energy);
            creep.runAction();
            return true;
        }
        return false;
    }

    static withdrawFromTombstone(creep:Creep, alreadyTaggedTargets):boolean {
        let tombstone:Tombstone = creep.pos.findClosestByRange(FIND_TOMBSTONES, {filter: (t:Tombstone) => {
                return t.store.getUsedCapacity() !== 0 && !alreadyTaggedTargets[t.id];
            }});
        if (tombstone) {
            let storedResources:Array<ResourceConstant> = _.filter(Object.keys(tombstone.store), (r:ResourceConstant) => {
                return tombstone.store[r] > 0;
            }) as Array<ResourceConstant>;
            if (storedResources.length) {
                WithdrawAction.setAction(creep, tombstone, storedResources[0]);
                creep.runAction();
                return true;
            }
        }
        return false;
    }

    static withdrawFromContainer(creep:Creep) {
        let containers:Array<Structure> = creep.room.find(FIND_STRUCTURES, {filter: (s:Structure) => {
                return (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
                    s['store'].getCapacity(RESOURCE_ENERGY) !== s['store'].getFreeCapacity(RESOURCE_ENERGY);
            }});
        containers.sort((x:Structure, y:Structure):number => {
            if (x['store'].getFreeCapacity(RESOURCE_ENERGY) > y['store'].getFreeCapacity(RESOURCE_ENERGY)) {
                return 1;
            } else if (x['store'].getFreeCapacity(RESOURCE_ENERGY) < y['store'].getFreeCapacity(RESOURCE_ENERGY)) {
                return -1;
            } else {
                return 0;
            }
        });
        if (containers.length > 0) {
            let storedResources:Array<ResourceConstant> = _.filter(Object.keys(containers[0]['store']), (r:ResourceConstant) => {
                return containers[0]['store'][r] > 0;
            }) as Array<ResourceConstant>;
            if (storedResources.length) {
                WithdrawAction.setAction(creep, containers[0], storedResources[0]);
                creep.runAction();
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    static setAction(creep:Creep) {
        if (creep.memory['delivering'] &&
                creep.store.getUsedCapacity(RESOURCE_ENERGY) < 50 &&
                creep.store.getUsedCapacity(RESOURCE_ENERGY) === creep.store.getUsedCapacity()) {
            delete creep.memory['delivering'];
        }
        if (creep.store.getFreeCapacity() < 50) {
            creep.memory['delivering'] = true;
        }
        let alreadyTaggedTargets = Courier.getAlreadyTaggedTargets(creep);
        if (creep.memory['delivering'] && Courier.deliverEnergy(creep, alreadyTaggedTargets)) {
            return;
        }
        if (creep.memory['delivering'] && Courier.unloadResources(creep)) {
            return;
        }
        if (Courier.pickUpEnergy(creep, alreadyTaggedTargets)) {
            return;
        }
        if (Courier.withdrawFromTombstone(creep, alreadyTaggedTargets)) {
            return;
        }

        if (Courier.withdrawResourcesFromContainer(creep)) {
            return;
        }

        if (Courier.withdrawFromContainer(creep)) {
            return;
        }

        let spawn = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (s:Structure) => {
                return s.structureType === STRUCTURE_SPAWN;
            }});
        MoveAction.setActionTarget(creep, spawn);
        creep.runAction();
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, CARRY ];
        energyAvailable -= 100;
        let partCount = { 'MOVE': 1, 'CARRY': 1 };
        while (energyAvailable >= 50) {
            if (partCount['MOVE'] <= partCount['CARRY']) {
                partCount['MOVE'] += 1;
                bodyArray.unshift(MOVE);
                energyAvailable -= CreepSpawnData.getBodyPartCost(MOVE);
            } else {
                bodyArray.unshift(CARRY);
                partCount['CARRY'] += 1;
                energyAvailable -= CreepSpawnData.getBodyPartCost(CARRY);
            }
        }
        return bodyArray;
    }
}