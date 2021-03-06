import * as _ from "lodash";
import {RoomUtil} from "./room-util";
import {ConstructionSiteData} from "../structures/construction-site-data";
import {StructureUtil} from "../structures/structure-util";

const findNextEnergySource = function(pos:RoomPosition):Source {
    let creepCount = {};
    _.forEach(this.find(FIND_CREEPS), (creep:Creep) => {
        if (creep && creep.memory && creep.memory['target']) {
            if (creepCount[creep.memory['target']]) {
                creepCount[creep.memory['target']] += 1;
            } else {
                creepCount[creep.memory['target']] = 1;
            }
        } else if (creep && creep.memory && creep.memory['source']) {
            if (creepCount[creep.memory['source']]) {
                creepCount[creep.memory['source']] += 1;
            } else {
                creepCount[creep.memory['source']] = 1;
            }
        }
    });
    let possibleSources = [];
    _.forEach(this.find(FIND_SOURCES_ACTIVE), (source:Source) => {
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
        let sources = this.find(FIND_SOURCES);
        if (!Memory['roomData']) {
            Memory['roomData'] = {};
        }
        if (!Memory['roomData'][this.name]) {
            Memory['roomData'][this.name] = {};
        }
        Memory['roomData'][this.name]['sources'] = {
            qty: sources.length
        };
        if (!this.memory['sites']) {
            this.memory['sites'] = {0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}};
        }
        if (!this.memory['sites2']) {
            this.memory['sites2'] = {};
        }
        let totalSourceSpots = 0;
        _.forEach(sources, (source:Source) => {
            let currentNumberOfSpots = RoomUtil.getNumberOpenAdjacentSpots(source.pos);
            totalSourceSpots += currentNumberOfSpots;
            this.memory.sources[source.id] = currentNumberOfSpots;
        });
        Memory['roomData'][this.name]['sources']['spots'] = totalSourceSpots;
        return;
    }

    if (!this.memory['exits']) {
        this.memory['exits'] = {};
        this.memory['exits'][FIND_EXIT_TOP] = this.findExitAndPlanWalls(FIND_EXIT_TOP);
        return;
    }
    if (Object.keys(this.memory['exits']).indexOf("" + FIND_EXIT_BOTTOM) === -1) {
        this.memory['exits'][FIND_EXIT_BOTTOM] = this.findExitAndPlanWalls(FIND_EXIT_BOTTOM);
        return;
    }
    if (Object.keys(this.memory['exits']).indexOf("" + FIND_EXIT_LEFT) === -1) {
        this.memory['exits'][FIND_EXIT_LEFT] = this.findExitAndPlanWalls(FIND_EXIT_LEFT);
        return;
    }
    if (Object.keys(this.memory['exits']).indexOf("" + FIND_EXIT_RIGHT) === -1) {
        this.memory['exits'][FIND_EXIT_RIGHT] = this.findExitAndPlanWalls(FIND_EXIT_RIGHT);
        return;
    }

    if (!this.controller || (!this.controller.reservation && !this.controller.my)) {
        return;
    }

    if (!this.memory.containerStructure) {
        let sources = this.find(FIND_SOURCES);
        let containerLocationsNeeded = [];
        let linkNumber = 5;
        _.forEach(sources, (source:Source) => {
            RoomUtil.placeContainerAndLink(source.pos, linkNumber);
            linkNumber++;
            containerLocationsNeeded.push(source);
        });
        if (this.controller) {
            containerLocationsNeeded.push(this.controller);
            RoomUtil.placeContainerAndLink(this.controller.pos, 5);
        }
        this.memory['center'] = this.getPositionAt(25, 25);
        if (containerLocationsNeeded.length) {
            this.memory['center'] = RoomUtil.getCenterOfArray(containerLocationsNeeded, this);
        }

        let minerals = this.find(FIND_MINERALS);
        if (minerals.length) {
            this.memory['sites'][6][minerals[0].pos.x + ":" + minerals[0].pos.y] = STRUCTURE_EXTRACTOR;
        }
        this.memory.containerStructure = true;
        return;
    }

    if (!this.memory[STRUCTURE_TOWER + 'Structure'] && this.memory.center && this.controller && this.controller.my) {
        RoomUtil.planBuildings(this, STRUCTURE_TOWER);
        return;
    }
    if (!this.memory[STRUCTURE_STORAGE + 'Structure'] && this.memory.center && this.controller && this.controller.my) {
        RoomUtil.planBuildings(this, STRUCTURE_STORAGE);
        return;
    }
    if (!this.memory[STRUCTURE_SPAWN + 'Structure'] && this.memory.center && this.controller && this.controller.my) {
        RoomUtil.planBuildings(this, STRUCTURE_SPAWN);
        return;
    }
    if (!this.memory[STRUCTURE_POWER_SPAWN + 'Structure'] && this.memory.center && this.controller && this.controller.my) {
        RoomUtil.planBuildings(this, STRUCTURE_POWER_SPAWN);
        return;
    }
    if (!this.memory[STRUCTURE_TERMINAL + 'Structure'] && this.memory.center && this.controller && this.controller.my) {
        RoomUtil.planBuildings(this, STRUCTURE_TERMINAL);
        return;
    }

    if (!this.memory.sourceRoads) {
        let pointsOfImportance = this.find(FIND_SOURCES);
        pointsOfImportance.push(this.controller);

        _.forEach(pointsOfImportance, (origin:RoomObject) => {
            _.forEach(pointsOfImportance, (destination:RoomObject) => {
                if (!origin || !destination || origin === destination) {
                    return;
                }
                let path:Array<PathStep> = origin.pos.findPathTo(destination.pos.x, destination.pos.y,
                    {ignoreCreeps: true, costCallback: RoomUtil.getPlannedCostMatrix(this)});
                RoomUtil.planRoadAlongPath(this, path);
            });
        });

        this.memory['sourceRoads'] = true;
        return;
    }

    if (!this.memory.exitRoads && this.memory.center) {
        let directions:Array<ExitConstant> = [ FIND_EXIT_TOP, FIND_EXIT_LEFT, FIND_EXIT_BOTTOM, FIND_EXIT_RIGHT ];
        _.forEach(directions, (direction:ExitConstant) => {
            let startPosition:RoomPosition = this.getPositionAt(25, 25);
            let exitPoint:RoomPosition = startPosition.findClosestByPath(direction);
            if (exitPoint) {
                let path:Array<PathStep> = startPosition.findPathTo(exitPoint.x, exitPoint.y,
                    {ignoreCreeps: true, costCallback: RoomUtil.getPlannedCostMatrix(this)});
                RoomUtil.planRoadAlongPath(this, path);
            }
        });
        this.memory['exitRoads'] = true;
        return;
    }

    // TODO break this up into multiple ticks?
    if (!this.memory[STRUCTURE_EXTENSION + 'Structure'] && this.memory.center && this.controller && this.controller.my) {
        RoomUtil.planBuildings(this, STRUCTURE_EXTENSION);
        return;
    }

    // this.memory['complete'] = true;
};

const makeConstructionSites = function() {
    if (this.memory['ticksTillNextConstruction']) {
        this.memory['ticksTillNextConstruction'] -= 1;
    }
    if (!this.memory.sites || this.memory['ticksTillNextConstruction']) {
        return;
    }
    this.memory['ticksTillNextConstruction'] = 120;
    let numberConstructionSites = this.find(FIND_MY_CONSTRUCTION_SITES).length;
    if (numberConstructionSites > 2) {
        return;
    }
    let constructionSites:Array<ConstructionSiteData> = [];
    let controllerLevel = this.controller ? this.controller.level : 0;
    for (let i = 0; i <= controllerLevel; i++) {
        if (this.memory.sites[i]) {
            _.forEach(this.memory.sites[i], (structureType:StructureConstant, key:string) => {
                let roomPosition = new RoomPosition(+key.split(":")[0], +key.split(":")[1], this.name);
                if (RoomUtil.isSpotOpen(roomPosition)) {
                    constructionSites.push(new ConstructionSiteData(roomPosition, structureType));
                }
            });
        }
    }
    if (controllerLevel > 1) {
        _.forEach(this.memory['sites2'], (structureType:StructureConstant, key:string) => {
            let roomPosition = new RoomPosition(+key.split(":")[0], +key.split(":")[1], this.name);
            if (RoomUtil.canPlaceRampart(roomPosition)) {
                constructionSites.push(new ConstructionSiteData(roomPosition, structureType));
            }
        });
    }
    if (constructionSites.length > 0) {
        StructureUtil.sortByPriority(constructionSites, null);
        console.log(constructionSites[0].pos.roomName + " " + constructionSites[0].structureType + ": " + constructionSites[0].pos.x + "x " + constructionSites[0].pos.y + "y");
        this.createConstructionSite(constructionSites[0].pos, constructionSites[0].structureType);
        if (numberConstructionSites < 2 && constructionSites.length > 1) {
            console.log(constructionSites[1].pos.roomName + " " + constructionSites[1].structureType + ": " + constructionSites[1].pos.x + "x " + constructionSites[1].pos.y + "y");
            this.createConstructionSite(constructionSites[1].pos, constructionSites[1].structureType);
        }
        if (numberConstructionSites < 1 && constructionSites.length > 2) {
            console.log(constructionSites[2].pos.roomName + " " + constructionSites[2].structureType + ": " + constructionSites[2].pos.x + "x " + constructionSites[2].pos.y + "y");
            this.createConstructionSite(constructionSites[2].pos, constructionSites[2].structureType);
        }
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

const findExitAndPlanWalls = function(exit:ExitConstant):boolean {
    if (!this.memory['sites2']) {
        this.memory['sites2'] = {};
    }
    if (!this.memory['sites']) {
        this.memory['sites'] = {0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}};
    }
    if (!this.memory['sites'][2]) {
        this.memory['sites'][2] = {};
    }
    let exitExists = false;
    let x = -1;
    let y = -1;
    let isX = false;
    let exits = [];
    let exitSize = 0;
    for (let dynamicCoord=2; dynamicCoord<49; dynamicCoord++) {
        if (exit === FIND_EXIT_TOP) {
            y = 2;
            x = dynamicCoord;
            isX = true;
        } else if (exit === FIND_EXIT_BOTTOM) {
            y = 47;
            x = dynamicCoord;
            isX = true;
        } else if (exit === FIND_EXIT_RIGHT) {
            x = 47;
            y = dynamicCoord;
        } else if (exit === FIND_EXIT_LEFT) {
            x = 2;
            y = dynamicCoord;
        }
        let isRampart = false;
        let spotHasNoWall = false;
        if (isX) {
            let newY = y === 2 ? 0 : 49;
            spotHasNoWall = _.filter(this.lookAt(x, newY), (c:LookAtResultWithPos) => {
                if (c.type === 'structure' && c.structure.structureType !== STRUCTURE_RAMPART &&
                    c.structure.structureType !== STRUCTURE_WALL) {
                    isRampart = true;
                }
                return c.type === 'terrain' && c.terrain === 'wall';
            }).length < 1;
        } else {
            let newX = x === 2 ? 0 : 49;
            spotHasNoWall = _.filter(this.lookAt(newX, y), (c:LookAtResultWithPos) => {
                if (c.type === 'structure' && c.structure.structureType !== STRUCTURE_RAMPART &&
                    c.structure.structureType !== STRUCTURE_WALL) {
                    isRampart = true;
                }
                return c.type === 'terrain' && c.terrain === 'wall';
            }).length < 1;
        }
        if (spotHasNoWall) {
            if (exitSize === 0) {
                if (isX) {
                    if (RoomUtil.isSpotOpen(new RoomPosition(x - 1, y, this.name))) {
                        this.memory['sites'][2][(x - 1) + ":" + y] = STRUCTURE_WALL;
                    }
                    if (RoomUtil.isSpotOpen(new RoomPosition(x - 1, y, this.name))) {
                        this.memory['sites'][2][(x - 2) + ":" + y] = STRUCTURE_WALL;
                    }
                    let newY = y === 2 ? 1 : 48;
                    if (RoomUtil.isSpotOpen(new RoomPosition(x - 1, newY, this.name))) {
                        this.memory['sites'][2][(x - 2) + ":" + newY] = STRUCTURE_WALL;
                    }
                } else {
                    if (RoomUtil.isSpotOpen(new RoomPosition(x, y - 1, this.name))) {
                        this.memory['sites'][2][x + ":" + (y - 1)] = STRUCTURE_WALL;
                    }
                    if (RoomUtil.isSpotOpen(new RoomPosition(x, y - 1, this.name))) {
                        this.memory['sites'][2][x + ":" + (y - 2)] = STRUCTURE_WALL;
                    }
                    let newX = x === 2 ? 1 : 48;
                    if (RoomUtil.isSpotOpen(new RoomPosition(newX, y - 1, this.name))) {
                        this.memory['sites'][2][newX + ":" + (y - 2)] = STRUCTURE_WALL;
                    }
                }
            }
            exitSize += 1;
            if (isRampart) {
                this.memory['sites2'][x + ":" + y] = STRUCTURE_RAMPART;
            } else {
                this.memory['sites'][2][x + ":" + y] = STRUCTURE_WALL;
            }
        } else if (exitSize) {
            if (isX) {
                if (RoomUtil.isSpotOpen(new RoomPosition(x, y, this.name))) {
                    this.memory['sites'][2][x + ":" + y] = STRUCTURE_WALL;
                }
                if (RoomUtil.isSpotOpen(new RoomPosition(x + 1, y, this.name))) {
                    this.memory['sites'][2][(x + 1) + ":" + y] = STRUCTURE_WALL;
                }
                let newY = y === 2 ? 1 : 48;
                if (RoomUtil.isSpotOpen(new RoomPosition(x + 1, newY, this.name))) {
                    this.memory['sites'][2][(x + 1) + ":" + newY] = STRUCTURE_WALL;
                }
            } else {
                if (RoomUtil.isSpotOpen(new RoomPosition(x, y, this.name))) {
                    this.memory['sites'][2][x + ":" + y] = STRUCTURE_WALL;
                }
                if (RoomUtil.isSpotOpen(new RoomPosition(x, y + 1, this.name))) {
                    this.memory['sites'][2][x + ":" + (y + 1)] = STRUCTURE_WALL;
                }
                let newX = x === 2 ? 1 : 48;
                if (RoomUtil.isSpotOpen(new RoomPosition(newX, y + 1, this.name))) {
                    this.memory['sites'][2][newX + ":" + (y + 1)] = STRUCTURE_WALL;
                }
            }
            exits.push(dynamicCoord - Math.round(exitSize / 2));
            exitSize = 0;
        }
        exitExists = exitExists || spotHasNoWall;
    }

    // TODO check if exit works or if needs to shift
    for (let exitIndex = 0; exitIndex < exits.length; exitIndex++) {
        if (isX) {
            delete this.memory['sites'][2][(exits[exitIndex] - 1) + ":" + y];
            delete this.memory['sites'][2][exits[exitIndex] + ":" + y];
            delete this.memory['sites'][2][(exits[exitIndex] + 1) + ":" + y];
            this.memory['sites2'][(exits[exitIndex] - 1) + ":" + y] = STRUCTURE_RAMPART;
            this.memory['sites2'][exits[exitIndex] + ":" + y] = STRUCTURE_RAMPART;
            this.memory['sites2'][(exits[exitIndex] + 1) + ":" + y] = STRUCTURE_RAMPART;
        } else {
            delete this.memory['sites'][2][x + ":" + (exits[exitIndex] - 1)];
            delete this.memory['sites'][2][x + ":" + exits[exitIndex]];
            delete this.memory['sites'][2][x + ":" + (exits[exitIndex] + 1)];
            this.memory['sites2'][x + ":" + (exits[exitIndex] - 1)] = STRUCTURE_RAMPART;
            this.memory['sites2'][x + ":" + exits[exitIndex]] = STRUCTURE_RAMPART;
            this.memory['sites2'][x + ":" + (exits[exitIndex] + 1)] = STRUCTURE_RAMPART;
        }
    }
    return exitExists;
};

const canReserve = function(username:string):boolean {
    return this.controller && (!this.controller.reservation || this.controller.reservation.username === username)
        && !this.controller.my && !this.controller.owner;
};

declare global {
    interface Room {
        canReserve(username:string):boolean;
        getAdjacentRoomName(direction:ExitConstant):string;
        makeConstructionSites();
        buildMemory();
        findExitAndPlanWalls(exit:ExitConstant):boolean;
        findNextEnergySource(pos:RoomPosition):Source;
        displayMessage(pos:RoomPosition, message:string);
        init:boolean;
    }
}

export class RoomPrototype {
    static init() {
        if (!Room['init']) {
            Room.prototype.findExitAndPlanWalls = findExitAndPlanWalls;
            Room.prototype.canReserve = canReserve;
            Room.prototype.getAdjacentRoomName = getAdjacentRoomName;
            Room.prototype.makeConstructionSites = makeConstructionSites;
            Room.prototype.buildMemory = buildMemory;
            Room.prototype.findNextEnergySource = findNextEnergySource;
            Room.prototype.displayMessage = displayMessage;
            Room.prototype.init = true;
        }
    }

}