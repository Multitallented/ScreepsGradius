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
            room.buildMemory();
            room.makeConstructionSites();
            this.spawnCreeps(room);
            TowerController.run(room);
        } else if (room.controller && room.controller.reservation) {
            room.buildMemory();
            room.makeConstructionSites();
        } else {
            room.buildMemory();
            // TODO set flag?
        }
    }

    spawnCreeps(room:Room) {
        _.forEach(room.find(FIND_STRUCTURES, {filter: (structure:Structure) => {return structure.structureType === STRUCTURE_SPAWN;}}),
            (spawn:StructureSpawn) => {
            SpawnController.run(spawn);
        });
    }
}