import * as _ from "lodash";
import {RoomUtil} from "./room-util";

const findNextEnergySource = function(pos:RoomPosition):Source {
    let creepCount = {};
    _.forEach(this.find(FIND_CREEPS), (creep:Creep) => {
        if (creep.memory['target']) {
            if (creepCount[creep.memory['target']]) {
                creepCount[creep.memory['target']] += 1;
            } else {
                creepCount[creep.memory['target']] = 1;
            }
        }
    });
    let possibleSources = [];
    _.forEach(this.find(FIND_SOURCES), (source:Source) => {
        if (!creepCount[source.id] || !this.memory['sources'] ||
                !this.memory['sources'][source.id] ||
                creepCount[source.id] < this.memory['sources'][source.id]) {
            possibleSources.push(source);
        }
    });
    possibleSources.sort((x:Source, y:Source):number => {
        if (RoomUtil.crowDistance(x.pos, pos) > RoomUtil.crowDistance(y.pos, pos)) {
            return 1;
        } else if (RoomUtil.crowDistance(x.pos, pos) < RoomUtil.crowDistance(y.pos, pos)) {
            return -1;
        } else {
            return 0;
        }
    });
    // return pos.findClosestByPath(this.find(FIND_SOURCES)) as Source;
    return possibleSources.length > 0 ? possibleSources[0] : null;
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
            this.memory.sources[source.id] = RoomUtil.getOpenAdjacentSpots(source.pos);
        });
        return;
    }
    if (!this.memory.containerStructure) {
        let containerStructures = [];
        let containerSpots = this.find(FIND_SOURCES);
        containerSpots.push(this.controller);
        _.forEach(containerSpots, (roomObject:RoomObject) => {
            let containerPos = null;
            let sourceArea:Array<LookAtResultWithPos> = this.lookAtArea(roomObject.pos.y-1, roomObject.pos.x-1,
                    roomObject.pos.y+1, roomObject.pos.x+1, true);
            _.filter(sourceArea, (c:LookAtResultWithPos) => {
                return c.type !== 'creep' && (c.type !== 'terrain' || c.terrain === 'wall');
            });
            _.forEach(sourceArea, (c:LookAtResultWithPos) => { // TODO fix this
                if (c.type === 'structure' && containerPos && containerPos.x == c.x && containerPos.y == c.y) {
                    containerPos = null;
                } else {
                    containerPos = {x: c.x, y: c.y};
                }
            });
            if (containerPos != null) {
                containerStructures.push(containerPos);
            }
        });
        this.memory.containerStructure = containerStructures;
        return;
    }
    let controllerLevel = this.controller ? this.controller.level : 0;
};

declare global {
    interface Room {
        buildMemory();
        findNextEnergySource(pos:RoomPosition):Source;
        displayMessage(pos:RoomPosition, message:string);
        init:boolean;
    }
}

export class RoomPrototype {
    static init() {
        if (!Room['init']) {
            Room.prototype.buildMemory = buildMemory;
            Room.prototype.findNextEnergySource = findNextEnergySource;
            Room.prototype.displayMessage = displayMessage;
            Room.prototype.init = true;
        }
    }

}