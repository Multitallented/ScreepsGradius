
const findNextEnergySource = function(pos:RoomPosition):Source {
    return pos.findClosestByPath(this.find(FIND_SOURCES)) as Source; // TODO
};

const displayMessage = function(pos:RoomPosition, message: string) {
    this.visual.text(message, pos.x + 1, pos.y, {align: 'left', opacity: 0.8});
};

declare global {
    interface Room {
        findNextEnergySource(pos:RoomPosition):Source;
        displayMessage(pos:RoomPosition, message:string);
        init:boolean;
    }
}

export class RoomPrototype {
    static init() {
        if (!Room['init']) {
            Room.prototype.findNextEnergySource = findNextEnergySource;
            Room.prototype.displayMessage = displayMessage;
            Room.prototype.init = true;
        }
    }

}