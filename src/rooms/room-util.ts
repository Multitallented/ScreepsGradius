import * as _ from "lodash";

export class RoomUtil {
    static getNumberOpenAdjacentSpots(pos: RoomPosition): number {
        let runningTotal = 9;
        let positionMap = {};
        _.forEach(Game.rooms[pos.roomName].lookAtArea(pos.y-1, pos.x-1, pos.y+1, pos.x+1, true), (s:LookAtResultWithPos) => {
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
            if (!((s.type !== 'terrain' || s.terrain !== 'wall') &&
                !(s.type === 'structure' && s.structure.structureType !== STRUCTURE_CONTAINER))) {
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
}