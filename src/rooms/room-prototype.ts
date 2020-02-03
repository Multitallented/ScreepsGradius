
const findNextEnergySource = function(pos:RoomPosition):any {
    return pos.findClosestByPath(this.find(FIND_SOURCES));
};

export class RoomPrototype {
    static init() {
        if (!Room['init']) {
            Room.prototype['findNextEnergySource'] = findNextEnergySource;
            Room.prototype['init'] = true;
        }
    }

}