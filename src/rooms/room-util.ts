import * as _ from "lodash";
import {ConstructionSiteData} from "../structures/construction-site-data";

export class RoomUtil {
    static getNumberOpenAdjacentSpots(pos: RoomPosition): number {
        let runningTotal = 9;
        let positionMap = {};
        _.forEach(Game.rooms[pos.roomName].lookAtArea(pos.y-1, pos.x-1, pos.y+1, pos.x+1, true), (s:LookAtResultWithPos) => {
            if (positionMap[s.x + ":" + s.y]) {
                return;
            }
            if (RoomUtil.isOpen(s)) {
                runningTotal--;
                positionMap[s.x + ":" + s.y] = true;
            }
        });

        return runningTotal;
    }

    static isOpen(s:LookAtResultWithPos): boolean {
        return !((s.type !== 'terrain' || s.terrain !== 'wall') &&
            s.type !== 'structure' && s.type !== 'constructionSite');
    }

    static isSpotOpen(pos:RoomPosition):boolean {
        let isOpen = true;
        _.forEach(Game.rooms[pos.roomName].lookAt(pos), (s:LookAtResultWithPos) => {
            if (RoomUtil.isOpen(s)) {
                isOpen = false;
            }
        });
        return isOpen;
    }

    static getFirstOpenAdjacentSpot(pos:RoomPosition):RoomPosition {
        let positionMap = {};
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                positionMap[(pos.x + i) + ":" + (pos.y + j)] = new RoomPosition(pos.x + i, pos.y + j, pos.roomName);
            }
        }
        _.forEach(Game.rooms[pos.roomName].lookAtArea(pos.y-1, pos.x-1, pos.y+1, pos.x+1, true), (s:LookAtResultWithPos) => {
            if (!positionMap[s.x + ":" + s.y]) {
                return;
            }
            if (RoomUtil.isOpen(s)) {
                delete positionMap[s.x + ":" + s.y];
            }
        });
        for (let key in positionMap) {
            if (key && positionMap[key]) {
                return positionMap[key];
            }
        }
        return null;
    }

    static crowDistance(pos1: RoomPosition, pos2: RoomPosition):number {
        return Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
    }

    static getCenterOfArray(roomObjects:Array<RoomObject>):RoomPosition {
        let maxX = 0;
        let minX = 50;
        let maxY = 0;
        let minY = 50;
        let roomName = null;
        _.forEach(roomObjects, (entity:RoomObject) => {
            if (!roomName) {
                roomName = entity.pos.roomName;
            }
            maxX = entity.pos.x > maxX ? entity.pos.x : maxX;
            minX = entity.pos.x < minX ? entity.pos.x : minX;
            maxY = entity.pos.y > maxY ? entity.pos.y : maxY;
            minY = entity.pos.y < minY ? entity.pos.y : minY;
        });
        return new RoomPosition(minX + Math.floor(Math.abs(maxX - minX) / 2),
            minY + Math.floor(Math.abs(maxY - minY) / 2), roomName);
    }

    static hasPlannedStructureAt(roomPosition:RoomPosition):boolean {
        const room = Game.rooms[roomPosition.roomName];
        if (!room.memory['sites']) {
            return false;
        }
        for (let i = 0; i < 9; i++) {
            if (room.memory['sites'][i][roomPosition.x + ":" + roomPosition.y]) {
                return true;
            }
        }
        return false;
    }

    static getPlannedCostMatrix(room:Room) {
        return (roomName:string, costMatrix:CostMatrix):CostMatrix => {
            if (roomName == room.name) {
                for (let i = 0; i < 9; i++) {
                    _.forEach(room.memory['sites'][i], (value, key) => {
                        if (value !== STRUCTURE_ROAD) {
                            costMatrix.set(+key.split(":")[0], +key.split(":")[1], 256);
                        }
                    });
                }
            }
            return costMatrix;
        }
    }

    static planBuildings(room:Room, structureType:StructureConstant) {
        let alreadyPlaced:Array<Structure> = room.find(FIND_STRUCTURES, {filter: (s:Structure) => {
                return s.structureType === structureType;
            }});
        let numberAlreadyPlanned = 0;
        _.forEach(alreadyPlaced, (s:Structure) => {
            for (let i = 0; i < 9; i++) {
                while (numberAlreadyPlanned < CONTROLLER_STRUCTURES[structureType][i]) {
                    numberAlreadyPlanned++;
                    room.memory['sites'][i][s.pos.x + ":" + s.pos.y] = structureType;
                }
            }
        });
        let numberPlaced = alreadyPlaced.length;
        for (let i = 0; i < 9; i++) {
            while (numberPlaced < CONTROLLER_STRUCTURES[structureType][i]) {
                numberPlaced++;
                let constructionSiteData:ConstructionSiteData = RoomUtil.getPositionWithBuffer(room, 1, structureType);
                if (constructionSiteData) {
                    room.memory['sites'][i][constructionSiteData.pos.x + ":" + constructionSiteData.pos.y] = structureType;
                }
            }
        }
        room.memory[structureType + 'Structure'] = true;
    }

    static planRoadAlongPath(room:Room, path:Array<PathStep>) {
        if (path != null && path.length > 0) {
            _.forEach(path, (pathStep:PathStep) => {
                if (pathStep.x !== 0 && pathStep.y !== 0 &&
                        pathStep.x !== 49 && pathStep.y !== 49 &&
                        !RoomUtil.hasPlannedStructureAt(new RoomPosition(pathStep.x, pathStep.y, room.name))) {
                    room.memory['sites'][0][pathStep.x + ":" + pathStep.y] = STRUCTURE_ROAD;
                }
            });
        }
    }

    static getPositionWithBuffer(room:Room, buffer:number,
                                 type:StructureConstant):ConstructionSiteData {
        let center:RoomPosition = room.memory['center'];
        let size:number = 38 - 2 * Math.max(Math.abs(center.x - 25), Math.abs(center.y - 25));
        let siteFound:ConstructionSiteData = null;
        this.loopFromCenter(center.x, center.y, size, (currentX:number, currentY:number) => {
            let positionOk = true;
            if (room.memory['checkedPositions'] && room.memory['checkedPositions'][currentX + ":" + currentY]) {
                return false;
            }
            let currentPlannedPosition:RoomPosition = new RoomPosition(currentX, currentY, room.name);
            if (RoomUtil.hasPlannedStructureAt(currentPlannedPosition) || _.filter(room.lookAt(currentX, currentY), (c) => {
                return c.type === 'structure' || (c.type === 'terrain' && c.terrain === 'wall'); }).length) {
                positionOk = false;
            }
            if (buffer > 0 && positionOk) {
                this.loopFromCenter(currentX, currentY, 1 + 2 * buffer, (bufferX:number, bufferY:number) => {
                    let currentBufferPosition:RoomPosition = new RoomPosition(bufferX, bufferY, room.name);
                    if (RoomUtil.hasPlannedStructureAt(currentBufferPosition) || _.filter(room.lookAt(bufferX, bufferY), (c) => {
                        return c.type === 'structure'; }).length) {
                        positionOk = false;
                        return true;
                    }
                });
            }
            if (positionOk) {
                siteFound = new ConstructionSiteData(new RoomPosition(currentX, currentY, room.name), type);
                return true;
            } else {
                if (!room.memory['checkedPositions']) {
                    room.memory['checkedPositions'] = {};
                }
                room.memory['checkedPositions'][currentX + ":" + currentY] = true;
            }
            return false;
        });
        return siteFound;
    }

    static loopFromCenter(x:number, y:number, size:number, callback:Function) {
        let d = 3;
        let c = 0;
        let s = 1;

        for (let k=1;k<=(size - 1); k++) {
            for (let j=0; j < (k<(size-1) ? 2 : 3); j++) {
                for (let i=0; i<s; i++) {
                    if (callback(x, y)) {
                        return;
                    }

                    c++;
                    switch (d) {
                        case 0: y = y+1; break;
                        case 1: x = x+1; break;
                        case 2: y = y-1; break;
                        case 3: x = x-1; break;
                    }
                }
                d = (d+1)%4;
            }
            s = s+1;
        }
        callback(x, y);
    }
}