import * as _ from "lodash";
import {RoomUtil} from "./room-util";
import {ConstructionSiteData} from "../structures/construction-site-data";
import {StructureUtil} from "../structures/structure-util";
import has = Reflect.has;

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
        this.memory['center'] = RoomUtil.getCenterOfArray(containerLocationsNeeded);
        _.forEach(containerLocationsNeeded, (roomObject:RoomObject) => {
            let containerPos:RoomPosition = RoomUtil.getFirstOpenAdjacentSpot(roomObject.pos);
            if (containerPos != null) {
                this.memory.sites[0][containerPos.x + ":" + containerPos.y] = STRUCTURE_CONTAINER;
            }
        });
        this.memory.containerStructure = true;
        return;
    }

    if (!this.memory[STRUCTURE_TOWER + 'Structure'] && this.memory.center) {
        RoomUtil.planBuildings(this, STRUCTURE_TOWER);
        return;
    }
    if (!this.memory[STRUCTURE_STORAGE + 'Structure'] && this.memory.center) {
        RoomUtil.planBuildings(this, STRUCTURE_STORAGE);
        return;
    }
    if (!this.memory[STRUCTURE_SPAWN + 'Structure'] && this.memory.center) {
        RoomUtil.planBuildings(this, STRUCTURE_SPAWN);
        return;
    }
    if (!this.memory[STRUCTURE_POWER_SPAWN + 'Structure'] && this.memory.center) {
        RoomUtil.planBuildings(this, STRUCTURE_POWER_SPAWN);
        return;
    }
    if (!this.memory.exitRoads && this.memory.center) {
        let directions:Array<ExitConstant> = [ FIND_EXIT_TOP, FIND_EXIT_LEFT, FIND_EXIT_BOTTOM, FIND_EXIT_RIGHT ];
        _.forEach(directions, (direction:ExitConstant) => {
            if (this.hasExit(direction)) {
                let startPosition:RoomPosition = this.getPositionAt(25, 25);
                let exitPoint:RoomPosition = startPosition.findClosestByPath(direction);
                let path:Array<PathStep> = startPosition.findPathTo(exitPoint.x, exitPoint.y,
                    {ignoreCreeps: true, swampCost: 1, costCallback: RoomUtil.getPlannedCostMatrix(this)});
                RoomUtil.planRoadAlongPath(this, path);
            }
        });
        this.memory['exitRoads'] = true;
        return;
    }

    if (!this.memory.sourceRoads) {
        let pointsOfImportance = this.find(FIND_SOURCES);
        pointsOfImportance.push(this.controller);

        _.forEach(pointsOfImportance, (origin:RoomObject) => {
            _.forEach(pointsOfImportance, (destination:RoomObject) => {
                if (origin === destination) {
                    return;
                }
                let path:Array<PathStep> = origin.pos.findPathTo(destination.pos.x, destination.pos.y,
                    {ignoreCreeps: true, swampCost: 1, costCallback: RoomUtil.getPlannedCostMatrix(this)});
                RoomUtil.planRoadAlongPath(this, path);
            });
        });

        this.memory['sourceRoads'] = true;
        return;
    }
    // TODO break this up into multiple ticks?
    if (!this.memory[STRUCTURE_EXTENSION + 'Structure'] && this.memory.center) {
        RoomUtil.planBuildings(this, STRUCTURE_EXTENSION);
        return;
    }
};

const makeConstructionSites = function() {
    if (!this.memory.sites) {
        return;
    }
    let numberConstructionSites = this.find(FIND_MY_CONSTRUCTION_SITES).length;
    if (numberConstructionSites > 2) {
        return;
    }
    let constructionSites:Array<ConstructionSiteData> = [];
    let controllerLevel = this.controller ? this.controller.level : 0;
    for (let i = 0; i < controllerLevel; i++) {
        if (this.memory.sites[i]) {
            _.forEach(this.memory.sites[i], (structureType:StructureConstant, key:string) => {
                let roomPosition = new RoomPosition(+key.split(":")[0], +key.split(":")[1], this.name);
                if (RoomUtil.isSpotOpen(roomPosition)) {
                    constructionSites.push(new ConstructionSiteData(roomPosition, structureType));
                }
            });
        }
    }
    if (constructionSites.length > 0) {
        StructureUtil.sortByPriority(constructionSites, null);
        this.createConstructionSite(constructionSites[0].pos, constructionSites[0].structureType);
    }
};

const getAdjacentRoomName = function(direction:ExitConstant):string {
    let isWest = this.name.indexOf("W") !== -1;
    let isNorth = this.name.indexOf("N") !== -1;
    let splitName = this.name.slice(1).split(isNorth ? "N" : "S");
    let x = Number(splitName[0]);
    let y = Number(splitName[1]);

    if (direction === FIND_EXIT_TOP) {
        if (isNorth) {
            return (isWest ? "W" : "E") + x + "N" + (y+1);
        } else {
            return (isWest ? "W" : "E") + x + "S" + (y-1);
        }
    } else if (direction === FIND_EXIT_LEFT) {
        if (isWest) {
            return "W" + (x+1) + (isNorth ? "N" : "S") + y;
        } else {
            return "W" + (x-1) + (isNorth ? "N" : "S") + y;
        }
    } else if (direction === FIND_EXIT_RIGHT) {
        if (isWest) {
            return "W" + (x-1) + (isNorth ? "N" : "S") + y;
        } else {
            return "W" + (x+1) + (isNorth ? "N" : "S") + y;
        }
    } else if (direction === FIND_EXIT_BOTTOM) {
        if (isNorth) {
            return (isWest ? "W" : "E") + x + "N" + (y-1);
        } else {
            return (isWest ? "W" : "E") + x + "S" + (y+1);
        }
    }
};

const hasExit = function(exit:ExitConstant):boolean {
    let exitExists = false;
    if (exit === FIND_EXIT_TOP) {
        for (let x=2; x<49; x++) {
            exitExists = exitExists || _.filter(this.lookAt(x, 0), (c) => {
                return c.type === 'terrain' && c.terrain === 'wall';
            }).length < 1;
            if (exitExists) {
                return exitExists;
            }
        }
    } else if (exit === FIND_EXIT_LEFT) {
        for (let x=2; x<49; x++) {
            exitExists = exitExists || _.filter(this.lookAt(0, x), (c) => {
                return c.type === 'terrain' && c.terrain === 'wall';
            }).length < 1;
            if (exitExists) {
                return exitExists;
            }
        }
    } else if (exit === FIND_EXIT_BOTTOM) {
        for (let x=2; x<49; x++) {
            exitExists = exitExists || _.filter(this.lookAt(x, 49), (c) => {
                return c.type === 'terrain' && c.terrain === 'wall';
            }).length < 1;
            if (exitExists) {
                return exitExists;
            }
        }
    } else if (exit === FIND_EXIT_RIGHT) {
        for (let x=2; x<49; x++) {
            exitExists = exitExists || _.filter(this.lookAt(49, x), (c) => {
                return c.type === 'terrain' && c.terrain === 'wall';
            }).length < 1;
            if (exitExists) {
                return exitExists;
            }
        }
    }
    return exitExists;
};

declare global {
    interface Room {
        getAdjacentRoomName(direction:ExitConstant):string;
        hasExit(exit:ExitConstant):boolean;
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
            Room.prototype.getAdjacentRoomName = getAdjacentRoomName;
            Room.prototype.hasExit = hasExit;
            Room.prototype.makeConstructionSites = makeConstructionSites;
            Room.prototype.buildMemory = buildMemory;
            Room.prototype.findNextEnergySource = findNextEnergySource;
            Room.prototype.displayMessage = displayMessage;
            Room.prototype.init = true;
        }
    }

}