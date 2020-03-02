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
    static canPlaceRampart(pos:RoomPosition):boolean {
        let isOpen = true;
        _.forEach(Game.rooms[pos.roomName].lookAt(pos), (s:LookAtResultWithPos) => {
            if ((s.type === 'structure' && s.structure.structureType === STRUCTURE_RAMPART) ||
                    (s.type === 'terrain' && s.terrain === 'wall') || s.type === 'constructionSite') {
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
            if (RoomUtil.hasPlannedStructureAt(new RoomPosition(s.x, s.y, pos.roomName))) {
                delete positionMap[s.x + ":" + s.y];
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

    static placeContainerAndLink(pos:RoomPosition, linkNumber:number) {
        let room:Room = Game.rooms[pos.roomName];
        if (!room) {
            return;
        }
        let positionMap = {};
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                positionMap[(pos.x + i) + ":" + (pos.y + j)] = new RoomPosition(pos.x + i, pos.y + j, pos.roomName);
            }
        }
        let containerPos = null;
        let linkPos = null;
        _.forEach(Game.rooms[pos.roomName].lookAtArea(pos.y-1, pos.x-1, pos.y+1, pos.x+1, true), (s:LookAtResultWithPos) => {
            if (!positionMap[s.x + ":" + s.y]) {
                return;
            }
            if (s.type === 'structure' && s.structure.structureType === STRUCTURE_CONTAINER) {
                containerPos = new RoomPosition(s.x, s.y, room.name);
                delete positionMap[s.x + ":" + s.y];
                return;
            }
            if (s.type === 'structure' && s.structure.structureType === STRUCTURE_LINK) {
                linkPos = new RoomPosition(s.x, s.y, room.name);
                delete positionMap[s.x + ":" + s.y];
                return;
            }
            if (RoomUtil.isOpen(s)) {
                delete positionMap[s.x + ":" + s.y];
                return;
            }
        });
        if (containerPos) {
            room.memory['sites'][0][containerPos.x + ":" + containerPos.y] = STRUCTURE_CONTAINER;
        }
        if (linkPos) {
            room.memory['sites'][5][linkPos.x + ":" + linkPos.y] = STRUCTURE_LINK;
        }
        if (containerPos && linkPos) {
            return;
        }
        for (let key in positionMap) {
            if (key && positionMap[key]) {
                if (!containerPos) {
                    containerPos = positionMap[key];
                    room.memory['sites'][0][key] = STRUCTURE_CONTAINER;
                } else if (!linkPos) {
                    linkPos = positionMap[key];
                    room.memory['sites'][linkNumber][key] = STRUCTURE_LINK;
                }
            }
        }
        if (!linkPos && containerPos) {
            let nextAvailablePosition = RoomUtil.getFirstOpenAdjacentSpot(containerPos);
            if (nextAvailablePosition) {
                linkPos = nextAvailablePosition;
                room.memory['sites'][linkNumber][linkPos.x + ":" + linkPos.y] = STRUCTURE_LINK;
            }
        }
    }

    static crowDistance(pos1: RoomPosition, pos2: RoomPosition):number {
        return Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
    }

    static canClaimAnyRoom():boolean {
        let numberOfOwnedRooms = _.filter(Game.rooms, (r) => {
            return r.controller && r.controller.my;
        }).length;
        return Game.gcl.level > numberOfOwnedRooms;
    }

    static getBestRoomToClaim(room:Room, reserve:boolean):string {
        let mostSources = 0;
        let mostSpots = 0;
        let bestRoom = null;
        _.forEach(Memory['roomData'], (roomData, key) => {
            let currentRoom = Game.rooms[key];
            if (!currentRoom || !currentRoom.controller || currentRoom.controller.my) {
                return;
            }
            if (currentRoom && reserve && currentRoom.canReserve(Memory['username'])) {
                return;
            }
            if (room && RoomUtil.getDistanceBetweenTwoRooms(room.name, key) > 3) {
                return;
            }
            let numberOfSources = 0;
            let numberOfSpots = 0;
            if (roomData && roomData['sources']) {
                numberOfSources = roomData['sources']['qty'];
                numberOfSpots = roomData['sources']['spots'];
            }

            if (numberOfSources > mostSources ||
                (numberOfSources === mostSources && mostSpots > numberOfSpots)) {
                bestRoom = key;
                mostSpots = numberOfSpots;
                mostSources = numberOfSources;
            }
        });
        return bestRoom;
    }

    static getDistanceBetweenTwoRooms(room1Name:string, room2Name:string):number {
        let is1West = room1Name.indexOf("W") !== -1;
        let is1North = room1Name.indexOf("N") !== -1;
        let split1Name = room1Name.slice(1).split(is1North ? "N" : "S");
        let x1 = Number(split1Name[0]);
        let y1 = Number(split1Name[1]);

        let is2West = room2Name.indexOf("W") !== -1;
        let is2North = room2Name.indexOf("N") !== -1;
        let split2Name = room2Name.slice(1).split(is2North ? "N" : "S");
        let x2 = Number(split2Name[0]);
        let y2 = Number(split2Name[1]);

        let verticalDistance = Math.abs(is1West === is2West ? x1 - x2 : x1 + x2);
        let horizontalDistance = Math.abs(is1North === is2North ? y1 - y2 : y1 + y2);
        return Math.max(verticalDistance, horizontalDistance);
    }

    static getCenterOfArray(roomObjects:Array<RoomObject>, room:Room):RoomPosition {
        let maxX = 50;
        let minX = 0;
        let maxY = 50;
        let minY = 0;
        let roomName = room.name;
        _.forEach(roomObjects, (entity:RoomObject) => {
            if (!entity || !entity.pos) {
                return;
            }
            maxX = entity.pos.x > maxX ? entity.pos.x : maxX;
            minX = entity.pos.x < minX ? entity.pos.x : minX;
            maxY = entity.pos.y > maxY ? entity.pos.y : maxY;
            minY = entity.pos.y < minY ? entity.pos.y : minY;
        });
        let x = Math.round(minX + Math.floor(Math.abs(maxX - minX) / 2));
        let y = Math.round(minY + Math.floor(Math.abs(maxY - minY) / 2));
        return new RoomPosition(x, y, roomName);
    }

    static hasPlannedStructureAt(roomPosition:RoomPosition):boolean {
        const room = Game.rooms[roomPosition.roomName];
        if (!room.memory['sites']) {
            return false;
        }
        for (let i = 0; i < 9; i++) {
            let key = roomPosition.x + ":" + roomPosition.y;
            if (room.memory['sites'][i] && room.memory['sites'][i][key]) {
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
                if (numberAlreadyPlanned < CONTROLLER_STRUCTURES[structureType][i]) {
                    numberAlreadyPlanned++;
                    room.memory['sites'][i][s.pos.x + ":" + s.pos.y] = structureType;
                    if (structureType === STRUCTURE_SPAWN || structureType === STRUCTURE_STORAGE ||
                            structureType === STRUCTURE_TOWER || structureType === STRUCTURE_LINK ||
                            structureType === STRUCTURE_TERMINAL || structureType === STRUCTURE_LAB) {
                        room.memory['sites2'][s.pos.x + ":" + s.pos.y] = STRUCTURE_RAMPART;
                    }
                    return;
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

    static getPositionWithBuffer(room:Room, buffer:number, type:StructureConstant):ConstructionSiteData {
        let center:RoomPosition = room.memory['center'];
        if (!room.memory['loopCenter']) {
            room.memory['loopCenter'] = {};
        }
        let size:number = 38 - 2 * Math.max(Math.abs(center.x - 25), Math.abs(center.y - 25));
        let siteFound:ConstructionSiteData = null;
        this.loopFromCenter(room, center.x, center.y, size, (currentX:number, currentY:number) => {
            if (room.memory['loopCenter'][currentX + ":" + currentY]) {
                return false;
            }
            room.memory['loopCenter'][currentX + ":" + currentY] = true;
            let positionOk = true;
            let currentPlannedPosition:RoomPosition = new RoomPosition(currentX, currentY, room.name);
            if (RoomUtil.hasPlannedStructureAt(currentPlannedPosition) || _.filter(room.lookAt(currentX, currentY), (c) => {
                    return c.type === 'structure' || (c.type === 'terrain' && c.terrain === 'wall'); }).length) {
                positionOk = false;
            }
            if (buffer > 0 && positionOk) {
                this.loopFromCenter(room, currentX, currentY, 1 + 2 * buffer, (bufferX:number, bufferY:number) => {
                    let currentBufferPosition:RoomPosition = new RoomPosition(bufferX, bufferY, room.name);
                    if (RoomUtil.hasPlannedStructureAt(currentBufferPosition) || _.filter(room.lookAt(bufferX, bufferY),(c:LookAtResultWithPos) => {
                            return c.type === 'structure' && c.structure.structureType !== STRUCTURE_ROAD; }).length) {
                        positionOk = false;
                        return true;
                    }
                    return false;
                });
            }
            if (positionOk) {
                siteFound = new ConstructionSiteData(new RoomPosition(currentX, currentY, room.name), type);
                return true;
            }
            return false;
        });
        return siteFound;
    }

    static loopFromCenter(room:Room, x:number, y:number, size:number, callback:Function) {
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
