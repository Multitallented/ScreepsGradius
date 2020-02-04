import * as _ from "lodash";

const findNextEnergySource = function(pos:RoomPosition):Source {
    return pos.findClosestByPath(this.find(FIND_SOURCES)) as Source; // TODO
};

const displayMessage = function(pos:RoomPosition, message: string) {
    this.visual.text(message, pos.x + 1, pos.y, {align: 'left', opacity: 0.8});
};

const buildMemory = function() {
    if (this.memory.complete) {
        return;
    }
    if (!this.memory.sources) {
        this.memory.sources = {};
        _.forEach(this.find(FIND_SOURCES), (source:Source) => {
            this.memory.sources[source.id] = this.getOpenAdjacentSpots(source.pos, false);
        });
        return;
    }
};

const getOpenAdjacentSpots = function(pos: RoomPosition): number {
    let runningTotal = 9;
    let positionMap = {};
    _.forEach(this.lookAtArea(pos.y-1, pos.x-1, pos.y+1, pos.x+1, true), (s:LookAtResultWithPos) => {
        if (positionMap[s.x + ":" + s.y]) {
            return;
        }
        if (!((s.type !== 'terrain' || s.terrain !== 'wall') &&
                !(s.type === 'structure' && s.structure.structureType !== STRUCTURE_CONTAINER))) {
            runningTotal--;
            positionMap[s.x + ":" + s.y] = true;
        }
    });

    return runningTotal;
};

declare global {
    interface Room {
        getOpenAdjacentSpots(pos:RoomPosition, countCreeps:boolean): number;
        buildMemory();
        findNextEnergySource(pos:RoomPosition):Source;
        displayMessage(pos:RoomPosition, message:string);
        init:boolean;
    }
}

export class RoomPrototype {
    static init() {
        if (!Room['init']) {
            Room.prototype.getOpenAdjacentSpots = getOpenAdjacentSpots;
            Room.prototype.buildMemory = buildMemory;
            Room.prototype.findNextEnergySource = findNextEnergySource;
            Room.prototype.displayMessage = displayMessage;
            Room.prototype.init = true;
        }
    }

}