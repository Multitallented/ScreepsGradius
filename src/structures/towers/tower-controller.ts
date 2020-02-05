import * as _ from "lodash";

export class TowerController {
    static run(room:Room) {
        _.forEach(room.find(FIND_MY_STRUCTURES, {filter: (s:Structure) => {
                return s.structureType === STRUCTURE_TOWER;
            }}), (tower:StructureTower) => {

            let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                tower.attack(closestHostile);
            }
        });
    }
}