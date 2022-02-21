"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require('express');
const websocket = require('ws');
const http = require('http');
const app = express();
const server = http.createServer(app);
const wsServer = new websocket.Server({ server });
const games = [];
class game {
    constructor() {
        this.place_ship = (player, start, end) => {
            for (let x = start[0]; x <= end[0]; x++) {
                for (let y = start[1]; y <= end[1]; y++) {
                    this.player_grid[player][y][x] = 1;
                }
            }
            this.player_ships[player] -= 1;
            console.log(this.player_ships[0]);
            console.log(this.player_ships[1]);
            if (this.player_ships[0] === 0 && this.player_ships[1] === 0) {
                this.begin_phase_2();
            }
        };
        this.hit = (player_number, point) => {
            let hit = false;
            if (this.player_grid[(player_number + 1) % 2][point[1]][point[0]] == 1) {
                send_message("HIT_SUCCESS", this.players[player_number], point);
                hit = true;
            }
            this.player_grid[(player_number + 1) % 2][point[1]][point[0]] = 2;
            if (!hit)
                send_message("HIT_FAIL", this.players[player_number], point);
            send_message("RECEIVE_HIT", this.players[(player_number + 1) % 2], point);
            if (hit && this.checkwin() !== -1) {
                // send win messages
                this.end_phase_2();
            }
            return hit;
        };
        this.check_valid_ship_placement = (player, start, end) => {
            for (let x = start[0]; x <= end[0]; x++) {
                for (let y = start[1]; y <= end[1]; y++) {
                    if (this.player_grid[player][y][x] == 1) {
                        return false;
                    }
                }
            }
            return true;
        };
        this.swap_turns = () => {
            this.turn == 1 ? this.turn = 0 : this.turn = 1;
            send_message("TURN_SWITCH", this.players[this.turn], true);
        };
        this.checkwin = () => {
            let player_1_loss = true;
            let player_2_loss = true;
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (this.player_grid[0][i][j] == 1) {
                        player_1_loss = false;
                    }
                    if (this.player_grid[1][i][j] == 1) {
                        player_2_loss = false;
                    }
                }
            }
            if (player_1_loss) {
                this.won = true;
                send_message("WIN_GAME", this.players[1], true);
                return 1;
            }
            if (player_2_loss) {
                this.won = true;
                send_message("WIN_GAME", this.players[0], true);
                return 0;
            }
            return -1;
        };
        this.add_player = (socket) => {
            this.players.push(socket);
            if (this.players.length == 2) {
                this.begin_phase_1();
            }
        };
        this.begin_phase_1 = () => {
            console.log('phase 1');
            this.setup_receive_listeners();
            for (let player of this.players) {
                send_message("GAME_START", player, true);
            }
        };
        this.begin_phase_2 = () => {
            console.log("phase 2");
            for (let player of this.players) {
                send_message("NEXT_PHASE", player, true);
            }
            send_message("TURN_SWITCH", this.players[this.turn], true);
        };
        this.end_phase_2 = () => {
            for (let player of this.players) {
                send_message("END_GAME", player, true);
            }
        };
        this.setup_receive_listeners = () => {
            for (let player of this.players) {
                player.on("message", (messageData) => __awaiter(this, void 0, void 0, function* () {
                    const { type, player_number, value } = yield JSON.parse(messageData);
                    switch (type) {
                        case "PLACE_SHIP":
                            const [start, end] = value;
                            if (this.check_valid_ship_placement(player_number, start, end)) {
                                this.place_ship(player_number, start, end);
                                send_message("SHIP_PLACED", player, [start, end]);
                            }
                            break;
                        case "SEND_HIT":
                            this.hit(player_number, value);
                            this.swap_turns();
                            break;
                    }
                }));
            }
        };
        let player_1_grid = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
        let player_2_grid = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
        this.player_grid = [player_1_grid, player_2_grid];
        this.player_ships = [5, 5];
        this.turn = 0;
        this.won = false;
        this.players = [];
    }
}
const send_message = (type, socket, value) => __awaiter(void 0, void 0, void 0, function* () {
    const message = {
        type,
        value
    };
    socket.send(JSON.stringify(message));
});
wsServer.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("connection");
    if (games.length == 0) {
        games.push(new game());
        yield send_message("PLAYER_NUMBER", socket, 0);
        games[0].add_player(socket);
    }
    else if (games[games.length - 1].players.length < 2) {
        yield send_message("PLAYER_NUMBER", socket, 1);
        games[games.length - 1].add_player(socket);
    }
    else {
        games.push(new game());
        yield send_message("PLAYER_NUMBER", socket, 0);
        games[games.length - 1].add_player(socket);
    }
}));
module.exports = { game, server };
