import {CreepController} from "./creeps/creep-controller";
import {RoomController} from "./rooms/room-controller";

module.exports = {
    loop: function() {

        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }

        new RoomController();
        new CreepController();
    }
};