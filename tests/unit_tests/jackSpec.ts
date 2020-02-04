import {Jack} from "../../src/creeps/roles/jack";

describe("Jack Tests", function() {
    beforeEach(function() {
        require('../mocks/game')();
    });

    test("Jack Should Construct Body Array", function() {
        expect(Jack.buildBodyArray(200).length).toBe(3);
        expect(Jack.buildBodyArray(300).length).toBe(5);
    });
});