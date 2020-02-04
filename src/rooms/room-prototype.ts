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
            this.memory.sources[source.id] = RoomUtil.getNumberOpenAdjacentSpots(source.pos);
        });
        return;
    }
    if (!this.memory.containerStructure) {
        this.memory.sites = {0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}};
        let containerLocationsNeeded = this.find(FIND_SOURCES);
        containerLocationsNeeded.push(this.controller);
        _.forEach(containerLocationsNeeded, (roomObject:RoomObject) => {
            let containerPos:RoomPosition = RoomUtil.getFirstOpenAdjacentSpot(roomObject.pos);
            if (containerPos != null) {
                this.memory.sites[0][containerPos.x + ":" + containerPos.y] = STRUCTURE_CONTAINER;
            }
        });
        this.memory.containerStructure = true;
        return;
    }
    let controllerLevel = this.controller ? this.controller.level : 0;
};

const makeConstructionSites = function() {
    if (!this.memory.sites) {
        return;
    }
    let controllerLevel = this.controller ? this.controller.level : 0;
    for (let i = 0; i < controllerLevel; i++) {
        if (this.memory.sites[i]) {
            _.forEach(this.memory.sites[i], (structureType:StructureConstant, key:string) => {
                let roomPosition = new RoomPosition(+key.split(":")[0], +key.split(":")[1], this.name);
                if (RoomUtil.isSpotOpen(roomPosition)) {
                    this.createConstructionSite(roomPosition, structureType);
                }
            });
        }
    }
};

declare global {
    interface Room {
        makeConstructionSites();
        buildMemory();
        findNextEnergySource(pos:RoomPosition):Source;
        displayMessage(pos:RoomPosition, message:string);
        init:boolean;
    }
}

export class RoomPrototype {
    static init() {
        if (!Room['init']) {
            Room.prototype.makeConstructionSites = makeConstructionSites;
            Room.prototype.buildMemory = buildMemory;
            Room.prototype.findNextEnergySource = findNextEnergySource;
            Room.prototype.displayMessage = displayMessage;
            Room.prototype.init = true;
        }
    }

}