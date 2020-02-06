import {RoomUtil} from "../../src/rooms/room-util";

describe("RoomUtil Tests", function() {
    beforeEach(function() {
        require('../mocks/game')();
    });

    test("RoomUtil roomDistance should work", function() {
        expect(RoomUtil.roomDistance("W19N19", "W19N14")).toBe(5);
        expect(RoomUtil.roomDistance("W19N19", "W19N15")).toBe(4);
        expect(RoomUtil.roomDistance("E1N19", "W1N19")).toBe(2);
    });
});