import * as _ from "lodash";

export class TowerController {
    static isOnEdge(pos:RoomPosition):boolean {
        return pos.x < 3 || pos.x > 47 || pos.y < 3 || pos.y > 47;
    }

    static run(room:Room) {
        let engagedTowers = 0;
        _.forEach(room.find(FIND_MY_STRUCTURES, {filter: (s:Structure) => {
                return s.structureType === STRUCTURE_TOWER;
            }}), (tower:StructureTower) => {

            let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile && (engagedTowers < 1 || !TowerController.isOnEdge(closestHostile.pos))) {
                let attackMessage = tower.attack(closestHostile);
                if (attackMessage === OK) {
                    engagedTowers += 1;
                }
            }
        });
    }
}