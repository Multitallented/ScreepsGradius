import {SpawnController} from "../../src/structures/spawns/spawn-controller";

describe("Respawn Tests", function() {

    beforeEach(function() {
        require('../mocks/game')();
        Game.spawns['Spawn1'].room.energyAvailable = 200;
        Game.spawns['Spawn1'].room.energyCapacityAvailable = 600;
        Game.getObjectById = function(id) {
            return Game.spawns['Spawn1'];
        }
    });

    test("Respawn should build jack if none exist and energy at least 200", function() {
        SpawnController.run(Game.spawns['Spawn1']);
        expect(Game.spawns['Spawn1'].spawning['options'].role).toBe("jack");
    });

    test("Respawn should not build jack if one exists", function() {
        Game.spawns['Spawn1'].room['entities'][FIND_CREEPS].push(
            require('../mocks/creep')([MOVE, CARRY, WORK], 'Jack1',
                {memory: {role: "jack"}}, Game.rooms.Room1)
        );
        SpawnController.run(Game.spawns['Spawn1']);
        expect(Game.spawns['Spawn1'].spawning).toBe(null);
    });
});