import {SpawnPrototype} from "./spawn-prototype";
import {CreepSpawnData} from "./creep-spawn-data";
import {Scout} from "../../creeps/roles/scout";

export class SpawnController {
    static run(spawn:StructureSpawn) {
        SpawnPrototype.init();
        if (spawn.spawning) {
            if (spawn.spawning['memory'] && spawn.spawning['memory']['role']) {
                spawn.room.displayMessage(spawn.pos, spawn.spawning['memory']['role']);
            }
            return;
        }
        if (spawn.room.memory['ticksTilNextScoutSpawn']) {
            if (spawn.room.memory['ticksTilNextScoutSpawn'] < 1) {
                delete spawn.room.memory['ticksTilNextScoutSpawn'];
            } else {
                spawn.room.memory['ticksTilNextScoutSpawn'] -= 1;
            }
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
                        spawn.room.memory['ticksTilNextScoutSpawn'] = 300;
                    }
                }
            }
        }
    }
}