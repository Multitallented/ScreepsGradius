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

    if (!this.memory.towerStructure && this.memory.center) {
        let towersPlaced = 0;
        let center:RoomPosition = this.memory['center'];
        let size = 38 - 2 * Math.max(Math.abs(center.x - 25), Math.abs(center.y - 25));
        for (let i = 0; i < 9; i++) {
            while (towersPlaced < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][i]) {
                towersPlaced++;
                let constructionSiteData:ConstructionSiteData = RoomUtil.getPositionWithBuffer(this,
                    center.x, center.y, size, 1, STRUCTURE_TOWER);
                if (constructionSiteData) {
                    this.memory.sites[i][constructionSiteData.pos.x + ":" + constructionSiteData.pos.y] = STRUCTURE_TOWER;
                }
            }
        }
        this.memory.towerStructure = true;
        return;
    }
    if (!this.memory.storageStructure && this.memory.center) {
        let storagePlaced = 0;
        let center:RoomPosition = this.memory['center'];
        let size = 38 - 2 * Math.max(Math.abs(center.x - 25), Math.abs(center.y - 25));
        for (let i = 0; i < 9; i++) {
            while (storagePlaced < CONTROLLER_STRUCTURES[STRUCTURE_STORAGE][i]) {
                storagePlaced++;
                let constructionSiteData:ConstructionSiteData = RoomUtil.getPositionWithBuffer(this,
                    center.x, center.y, size, 1, STRUCTURE_STORAGE);
                if (constructionSiteData) {
                    this.memory.sites[i][constructionSiteData.pos.x + ":" + constructionSiteData.pos.y] = STRUCTURE_STORAGE;
                }
            }
        }
        this.memory.storageStructure = true;
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
        constructionSites.sort((x:ConstructionSiteData, y:ConstructionSiteData):number => {
            let xPriority:number = StructureUtil.getStructureTypePriority(x.structureType);
            let yPriority:number = StructureUtil.getStructureTypePriority(y.structureType);
            if (xPriority > yPriority) {
                return -1;
            } else if (yPriority > xPriority) {
                return 1;
            } else {
                return 0;
            }
        });
        this.createConstructionSite(constructionSites[0].pos, constructionSites[0].structureType);
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
            Room.prototype.hasExit = hasExit;
            Room.prototype.makeConstructionSites = makeConstructionSites;
            Room.prototype.buildMemory = buildMemory;
            Room.prototype.findNextEnergySource = findNextEnergySource;
            Room.prototype.displayMessage = displayMessage;
            Room.prototype.init = true;
        }
    }

}