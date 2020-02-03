import * as _ from "lodash";
import {RoomPrototype} from "./room-prototype";

export class RoomController {
    constructor() {
        RoomPrototype.init();
        _.forEach(Game.rooms, (room:Room) => {
            RoomController.handle(room);
        });
    }

    static handle(room:Room) {
        // TODO
    }
}