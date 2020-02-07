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
            room.buildMemory();
            // TODO set flag?
        }
    }

    checkHostiles(room:Room) {
        // TODO gather more info
        let hostiles:Array<Creep> = room.find(FIND_HOSTILE_CREEPS, {filter: (c:Creep) => {
                return c.owner && (c.owner.username === 'Invader' || c.owner.username === 'kpopcowboy');
            }});
        if (hostiles.length) {
            room.memory['hostiles'] = hostiles.length;
        } else {
            delete room.memory['hostiles'];
        }
    }

    spawnCreeps(room:Room) {
        _.forEach(room.find(FIND_STRUCTURES, {filter: (structure:Structure) => {return structure.structureType === STRUCTURE_SPAWN;}}),
            (spawn:StructureSpawn) => {
            SpawnController.run(spawn);
        });
    }
}