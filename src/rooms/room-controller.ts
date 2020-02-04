import * as _ from "lodash";
import {RoomPrototype} from "./room-prototype";
import {SpawnController} from "../spawns/spawn-controller";

export class RoomController {
    constructor() {
        RoomPrototype.init();
        _.forEach(Game.rooms, (room:Room) => {
            this.handle(room);
        });
    }

    handle(room:Room) {
        room.buildMemory();
        this.spawnCreeps(room);
    }

    spawnCreeps(room:Room) {
        _.forEach(room.find(FIND_STRUCTURES, {filter: (structure:Structure) => {return structure.structureType === STRUCTURE_SPAWN;}}),
            (spawn:StructureSpawn) => {
            SpawnController.run(spawn);
        });
    }
}