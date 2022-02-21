const { game } = require('../battleship/app.js')
var battleship_game = false;
beforeEach(() => {
    battleship_game = new game()
})
describe("server-side game testing", () => {
    describe("grid functionality",() => {
        it("places ships correcty horizontally", () => {
            battleship_game.place_ship(0,[0,0],[5,0])
            expect(battleship_game.player_grid[0][0][3]).toBe(1)
        })
        it("places ships correctly vertically", () => {
            battleship_game.place_ship(1,[1,0],[1,5])
            expect(battleship_game.player_grid[1][4][1]).toBe(1)
        })
        it("checks valid ship position correctly for invalid placement", () => {
            battleship_game.player_grid[0][0] = [0,0,1,1,1,0,0,0]
            expect(battleship_game.check_valid_ship_placement(0,[1,0],[6,0])).toBe(false)
        })
        it("checks valid ship position correctly for valid placement", () => {
            battleship_game.player_grid[0][0] = [1,1,1,0,0,0,0,0]
            expect(battleship_game.check_valid_ship_placement(0,[3,0],[6,0])).toBe(true)
        })
        it("hit updates board correctly", () => {
            let send = jest.fn();
            let on = jest.fn()
            const player_1 = {send, on}
            const player_2 = {send, on}
            battleship_game.add_player(player_1)
            battleship_game.add_player(player_2)
            battleship_game.player_grid[1][5][3] = 1
            battleship_game.hit(0,[5,3])
            expect(battleship_game.player_grid[1][3][5]).toBe(2)
        })
        it("hit function returns correct value", () => {
            let send = jest.fn();
            let on = jest.fn()
            const player_1 = {send, on}
            const player_2 = {send, on}
            battleship_game.add_player(player_1)
            battleship_game.add_player(player_2)
            battleship_game.player_grid[1][4] = [0,0,0,1,1,1,0,0]
            expect(battleship_game.hit(0,[4,4])).toBe(true)
        })
    })
    describe("game functionality", () => {
        it("swaps turns correctly", () => {
            let send = jest.fn();
            let on = jest.fn()
            battleship_game.add_player({send, on})
            battleship_game.add_player({send, on})
            battleship_game.turn = 0
            battleship_game.swap_turns()
            expect(battleship_game.turn).toBe(1)
        })
        it("adds one player correctly", () => {
            let send;
            const player_1 = {send}
            battleship_game.add_player(player_1)
            expect(battleship_game.players.length).toBe(1)
        })
        it("adds two player correctly", () => {
            let send = jest.fn();
            let on = jest.fn()
            const player_1 = {send, on}
            const player_2 = {send, on}
            battleship_game.add_player(player_1)
            battleship_game.add_player(player_2)
            expect(send.mock.calls.length).toBe(2)
        })
        it("player can place ship in valid position", async () => {
            let send = jest.fn();
            let event_callback;
            // stores event listener callback in event_callback
            const on = (type,callback) => {
                event_callback = callback
            }
            const player_1 = {send, on}
            battleship_game.add_player(player_1)
            await battleship_game.setup_receive_listeners()
            const message = {
                type: "PLACE_SHIP",
                player_number : 0,
                value: [[0,0],[5,0]]
            }
            await event_callback(JSON.stringify(message))
            expect(battleship_game.player_grid[0][0][3]).toBe(1)
        })
        it("player can't place ship in invalid position", async () => {
            battleship_game.player_grid[0][0] = [1,1,1,1,0,0,0,0]
            let send = jest.fn();
            let event_callback;
            // stores event listener callback in event_callback
            const on = (type,callback) => {
                event_callback = callback
            }
            const player_1 = {send, on}
            battleship_game.add_player(player_1)
            await battleship_game.setup_receive_listeners()
            const message = {
                type: "PLACE_SHIP",
                player_number : 0,
                value: [[0,0],[5,0]]
            }
            await event_callback(JSON.stringify(message))
            expect(battleship_game.player_grid[0][0][5]).toBe(0)
        })
        it("player can hit point on board",async () => {
            let send = jest.fn();
            let event_callback;
            // stores event listener callback in event_callback
            const on = (type,callback) => {
                event_callback = callback
            }
            const player_1 = {send, on}
            const player_2 = {send, on}
            battleship_game.add_player(player_1)
            battleship_game.add_player(player_2)
            await battleship_game.setup_receive_listeners()
            const message = {
                type: "SEND_HIT",
                player_number : 0,
                value: [3,5]
            }
            await event_callback(JSON.stringify(message))
            expect(battleship_game.player_grid[1][5][3]).toBe(2)
        })
        it("player can win game with hit", async () => {
            battleship_game.player_grid[1][0] = [0,0,0,0,1,0,0,0]
            let send = jest.fn();
            let event_callback;
            // stores event listener callback in event_callback
            const on = (type,callback) => {
                event_callback = callback
            }
            const player_1 = {send, on}
            const player_2 = {send, on}
            battleship_game.add_player(player_1)
            battleship_game.add_player(player_2)
            await battleship_game.setup_receive_listeners()
            const message = {
                type: "SEND_HIT",
                player_number : 0,
                value: [4,0]
            }
            await event_callback(JSON.stringify(message))
            expect(battleship_game.won).toBe(true)
        })
    })
    describe("checkwin functionality", () => {
        it("detects player 1 win", () => {
            battleship_game.player_grid[0] = [[0,2,2,2,0,0,0,0],[0,2,2,2,0,0,0,0],[0,2,2,2,0,0,0,0],[0,2,2,2,0,0,0,0],[0,2,2,2,0,0,0,0],[0,2,2,2,0,0,0,0],[0,2,2,2,0,0,0,0],[0,2,2,2,0,0,0,0]]
            expect(battleship_game.checkwin()).toBe(1)
        })
    })
})