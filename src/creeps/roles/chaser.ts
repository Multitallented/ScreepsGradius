import {CreepSpawnData} from "../../structures/spawns/creep-spawn-data";
import {AttackAction} from "../actions/attack";
import * as _ from "lodash";
import {TravelingAction} from "../actions/traveling";
import {LeaveRoomAction} from "../actions/leave-room";

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

        let hostilesExist = false;
        _.forEach(Game.rooms, (room:Room) => {
            if (!room || !room.memory['hostiles'] || room.name === creep.pos.roomName ||
                    (room.controller && room.controller.owner != Memory['username'])) {
                return;
            }
            hostilesExist = true;
            let numberOfHostiles = room.memory['hostiles'];
            if (creep.room.find(FIND_MY_CREEPS, {filter: (c:Creep) => {
                    return c.memory['attacker'];
                    }}).length >= numberOfHostiles) {
                TravelingAction.setAction(creep, room.getPositionAt(25, 25));
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
            }
            LeaveRoomAction.setAction(creep, null);
            creep.runAction();
        }
    }

    static buildBodyArray(energyAvailable:number):Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, ATTACK ];
        energyAvailable -= 130;
        let partCount = { 'ATTACK': 1, 'MOVE': 1, 'TOUGH': 0 };
        while (energyAvailable >= 10) {
            if (partCount['MOVE'] / bodyArray.length < .33 && energyAvailable >= CreepSpawnData.getBodyPartCost(MOVE)) {
                partCount['MOVE'] += 1;
                bodyArray.unshift(MOVE);
                energyAvailable -= CreepSpawnData.getBodyPartCost(MOVE);
            } else if (energyAvailable >= CreepSpawnData.getBodyPartCost(ATTACK)) {
                partCount['ATTACK'] += 1;
                bodyArray.unshift(ATTACK);
                energyAvailable -= CreepSpawnData.getBodyPartCost(ATTACK);
            } else {
                partCount['TOUGH'] += 1;
                bodyArray.unshift(TOUGH);
                energyAvailable -= CreepSpawnData.getBodyPartCost(TOUGH);
            }
        }
        return bodyArray;
    }
}