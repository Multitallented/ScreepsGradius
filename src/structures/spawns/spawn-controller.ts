import {SpawnPrototype} from "./spawn-prototype";
import {CreepSpawnData} from "./creep-spawn-data";
import {Scout} from "../../creeps/roles/scout";

export class SpawnController {
    static run(spawn:StructureSpawn) {
        SpawnPrototype.init();
        if (spawn.room.memory['ticksTilNextScoutSpawn']) {
            if (spawn.room.memory['ticksTilNextScoutSpawn'] < 1) {
                delete spawn.room.memory['ticksTilNextScoutSpawn'];
            } else {
                spawn.room.memory['ticksTilNextScoutSpawn'] -= 1;
            }
        }
        if (spawn.room.memory['ticksTilNextTravelerSpawn']) {
            if (spawn.room.memory['ticksTilNextTravelerSpawn'] < 1) {
                delete spawn.room.memory['ticksTilNextTravelerSpawn'];
            } else {
                spawn.room.memory['ticksTilNextTravelerSpawn'] -= 1;
            }
        }
        if (spawn.spawning) {
            if (spawn.spawning['memory'] && spawn.spawning['memory']['role']) {
                spawn.room.displayMessage(spawn.pos, spawn.spawning.name);
            }
            return;
        }

        let nextCreepToSpawn: CreepSpawnData = spawn.getNextCreepToSpawn();
        if (nextCreepToSpawn && nextCreepToSpawn.options &&
                nextCreepToSpawn.options['memory'] && nextCreepToSpawn.options['memory']['role']) {
            spawn.room.displayMessage(spawn.pos, nextCreepToSpawn.options['memory']['role']);
            if (nextCreepToSpawn.getEnergyRequired() <= spawn.room.energyAvailable &&
                (nextCreepToSpawn.getEnergyRequired() + 100 < spawn.room.energyAvailable ||
                    spawn.room.energyAvailable / spawn.room.energyCapacityAvailable > nextCreepToSpawn.minPercentCapacity)) {
                let spawnMessage = spawn.spawnCreep(nextCreepToSpawn.bodyArray, nextCreepToSpawn.name, nextCreepToSpawn.options);
                if (spawnMessage === OK) {
                    if (Scout.KEY === nextCreepToSpawn.options['memory']['role']) {
                        spawn.room.memory['ticksTilNextScoutSpawn'] = 120;
                    } else if ('traveler' === nextCreepToSpawn.options['memory']['role']) {
                        spawn.room.memory['ticksTilNextTravelerSpawn'] = 60;
                    }
                }
            }
        }
    }
}