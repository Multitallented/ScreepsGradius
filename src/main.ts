import {CreepController} from "./creeps/creep-controller";
import {RoomController} from "./rooms/room-controller";

module.exports = {
    loop: function() {
        if (!Memory['username']) {
            Memory['username'] = Game.spawns[Object.keys(Game.spawns)[0]].owner.username;
        }
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }

        new RoomController();
        new CreepController();
    }
};