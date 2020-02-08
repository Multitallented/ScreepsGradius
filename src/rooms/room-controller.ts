import * as _ from "lodash";
import {RoomPrototype} from "./room-prototype";
import {SpawnController} from "../structures/spawns/spawn-controller";
import {TowerController} from "../structures/towers/tower-controller";

export class RoomController {
    constructor() {
        RoomPrototype.init();
        _.forEach(Game.rooms, (room:Room) => {
            this.handle(room);
        });
    }

    handle(room:Room) {
        if (room.controller && room.controller.my) {
            this.checkHostiles(room);
            room.buildMemory();
            room.makeConstructionSites();
            this.spawnCreeps(room);
            TowerController.run(room);
        } else if (room.controller && room.controller.reservation &&
                room.controller.reservation.username === Memory['username']) {
            this.checkHostiles(room);
            room.buildMemory();
            room.makeConstructionSites();
        } else {
            this.checkHostiles(room);
            room.buildMemory();
            // TODO set flag?
        }
    }

    checkHostiles(room:Room) {
        // TODO gather more info
        let hostiles:Array<Creep> = room.find(FIND_HOSTILE_CREEPS, {filter: (c:Creep) => {
                return c.owner && (c.owner.username === 'Invader' || c.owner.username === 'kpopcowboy');
            }});
        let hostileStructures:Array<AnyOwnedStructure> = room.find(FIND_HOSTILE_STRUCTURES, {filter: (c:AnyOwnedStructure) => {
                return c.owner && (c.owner.username === 'Invader' || c.owner.username === 'kpopcowboy');
            }});
        if (!Memory['roomData']) {
            Memory['roomData'] = {};
        }
        if (!Memory['roomData'][room.name]) {
            Memory['roomData'][room.name] = {};
        }
        if (hostiles.length || hostileStructures.length) {
            Memory['roomData'][room.name]['hostiles'] = hostiles.length;
        } else {
            delete Memory['roomData'][room.name]['hostiles'];
        }
    }

    spawnCreeps(room:Room) {
        _.forEach(room.find(FIND_STRUCTURES, {filter: (structure:Structure) => {return structure.structureType === STRUCTURE_SPAWN;}}),
            (spawn:StructureSpawn) => {
            SpawnController.run(spawn);
        });
    }
}