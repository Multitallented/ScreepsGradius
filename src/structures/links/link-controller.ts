import * as _ from "lodash";

export class LinkController {
    static run(room:Room) {
        const links:Array<AnyOwnedStructure> = room.find(FIND_MY_STRUCTURES, {filter: (s:Structure) => {
                return s.structureType === STRUCTURE_LINK;
            }});
        if (links.length < 2) {
            return;
        }

        let lowestLink:StructureLink = null;
        let highestLink:StructureLink = null;
        let lowestLinkAmount = 801;
        let highestLinkAmount = -1;
        _.forEach(links, (link:StructureLink) => {
            if (link.store && link.store.energy > highestLinkAmount) {
                highestLinkAmount = link.store.energy;
                highestLink = link;
            }
            if (link.store && link.store.energy < lowestLinkAmount) {
                lowestLinkAmount = link.store.energy;
                lowestLink = link;
            }
        });
        if (highestLink.cooldown > 0) {
            return;
        }
        if (lowestLink && highestLink && lowestLink !== highestLink) {
            let difference = Math.round((highestLink.store.energy - lowestLink.store.energy) / 2);
            if (difference > 0) {
                highestLink.transferEnergy(lowestLink, difference);
            }
        }
    }
}