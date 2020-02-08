import {CreepSpawnData} from "../../structures/spawns/creep-spawn-data";
import {AttackAction} from "../actions/attack";
import * as _ from "lodash";
import {TravelingAction} from "../actions/traveling";
import {MoveAction} from "../actions/move";

export class Chaser {
    static KEY = 'chaser';
    static setAction(creep:Creep) {
        creep.memory['attacker'] = true;
        let invader:Creep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (invader) {
            AttackAction.setAction(creep, invader);
            creep.runAction();
            return;
        }
        let invaderStructure:Structure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
        if (invaderStructure) {
            AttackAction.setAction(creep, invaderStructure);
            creep.runAction();
            return;
        }

        let hostilesExist = false;
        _.forEach(Memory['roomData'], (data:Object, roomName:string) => {
            if (!data['hostiles'] || roomName === creep.pos.roomName) {
                return;
            }
            hostilesExist = true;
            let numberOfHostiles = data['hostiles'];
            if (creep.room.find(FIND_MY_CREEPS, {filter: (c:Creep) => {
                    return c.memory['attacker'];
                    }}).length >= numberOfHostiles) {
                TravelingAction.setAction(creep, new RoomPosition(25, 25, roomName));
                creep.runAction();
                return;
            }
        });
        if (!hostilesExist) {
            let nearestSpawn:StructureSpawn = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (s:Structure) => {
                    return s.structureType === STRUCTURE_SPAWN;
                }}) as StructureSpawn;
            if (nearestSpawn && creep.pos.inRangeTo(nearestSpawn, 1)) {
                nearestSpawn.recycleCreep(creep);
                return;
            } else if (nearestSpawn) {
                MoveAction.setActionPos(creep, nearestSpawn.pos);
                creep.runAction();
                return;
            }
            TravelingAction.setAction(creep, new RoomPosition(25, 25, creep.memory['homeRoom']));
            creep.runAction();
            return;
        }
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, ATTACK ];
        energyAvailable -= 130;
        let partCount = { 'ATTACK': 1, 'MOVE': 1, 'TOUGH': 0 };
        while (energyAvailable >= 50) {
            if (partCount['MOVE'] / bodyArray.length < .75 && energyAvailable >= CreepSpawnData.getBodyPartCost(MOVE)) {
                partCount['MOVE'] += 1;
                bodyArray.unshift(MOVE);
                energyAvailable -= CreepSpawnData.getBodyPartCost(MOVE);
            } else if (energyAvailable >= CreepSpawnData.getBodyPartCost(ATTACK)) {
                partCount['ATTACK'] += 1;
                bodyArray.unshift(ATTACK);
                energyAvailable -= CreepSpawnData.getBodyPartCost(ATTACK);
            }
        }
        return bodyArray;
    }
}