
const findNextEnergySource = function(pos:RoomPosition):Source {
    return pos.findClosestByPath(this.find(FIND_SOURCES)) as Source;
};

declare global {
    interface Room {
        findNextEnergySource(pos:RoomPosition):Source;
        init:boolean;
    }
}

export class RoomPrototype {
    static init() {
        if (!Room['init']) {
            Room.prototype.findNextEnergySource = findNextEnergySource;
            Room.prototype.init = true;
        }
    }

}