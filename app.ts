const express = require('express')
const websocket = require('ws')
const http = require('http')

const app = express()

const server = http.createServer(app)

const wsServer = new websocket.Server({server})
const games : any[] = []
const private_games : any[] = []

class game {
    turn : number;
    won : boolean;
    player_ships : number[];
    players : any[];
    player_grid : number[][][]
    constructor() {
        let player_1_grid = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]
        let player_2_grid = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]
        this.player_grid = [player_1_grid,player_2_grid]
        this.player_ships = [5,5]
        this.turn  = 0
        this.won = false
        this.players = []

    }
    place_ship = (player : number,start : number[] , end: number[]) => {
        for(let x = start[0]; x <= end[0]; x++) {
            for (let y = start[1]; y<= end[1]; y++) {
                this.player_grid[player][y][x] = 1
            }
        }
        this.player_ships[player] -= 1
        console.log(this.player_ships[0])
        console.log(this.player_ships[1])
        if (this.player_ships[0] === 0 && this.player_ships[1] === 0) {
            this.begin_phase_2();
        }
    }
    hit = (player_number : number, point: number[]) => {
        let hit : boolean = false;
        if (this.player_grid[(player_number + 1) % 2][point[1]][point[0]] == 1) {
            send_message("HIT_SUCCESS",this.players[player_number],point)
            hit = true;
        }
        this.player_grid[(player_number + 1) % 2][point[1]][point[0]] = 2;
        if (!hit) send_message("HIT_FAIL",this.players[player_number],point)
        send_message("RECEIVE_HIT",this.players[(player_number + 1) % 2],point)

        if (hit && this.checkwin() !== -1) {
            // send win messages
            this.end_phase_2();

        }
        return hit
        
    }
    check_valid_ship_placement = (player : number, start : number[], end : number[]):boolean => {
        if (start[0] < 0 || start[0] > 7) return false
        if (start[1] < 0 || start[1] > 7) return false
        if (end[0] < 0 || end[0] > 7) return false
        if (end[1] < 0 || end[1] > 7) return false
        for(let x : number = start[0]; x <= end[0]; x++) {
            for (let y : number = start[1]; y<= end[1]; y++) {
                if (this.player_grid[player][y][x] == 1) {
                    return false;
                }
            }
        }
        return true;
    }

    swap_turns = ():void => {
        this.turn == 1 ? this.turn = 0 : this.turn = 1
        send_message("TURN_SWITCH",this.players[this.turn],true)
    }
    checkwin = ():number => {
        let player_1_loss : boolean = true;
        let player_2_loss : boolean = true
        for (let i : number = 0; i< 8; i++) {
            for (let j : number = 0; j<8;j++) {
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
            send_message("WIN_GAME",this.players[1],true)
            return 1;
        }
        if (player_2_loss) {
            this.won = true;
            send_message("WIN_GAME",this.players[0],true)
            return 0
        } 
        return -1;

    }
    add_player = (socket : any):void => {
        this.players.push(socket);
        if (this.players.length == 2) {
            this.begin_phase_1();
        }
    }
    begin_phase_1 = () => {
        console.log('phase 1')
        this.setup_receive_listeners();
        for (let player of this.players) {
            send_message("GAME_START",player,true);
        }
    }
    begin_phase_2 = () => {
        console.log("phase 2")
        for (let player of this.players) {
            send_message("NEXT_PHASE",player,true);
        }
        send_message("TURN_SWITCH",this.players[this.turn],true);
    }
    end_phase_2 = () => {
        for (let player of this.players) {
            send_message("END_GAME",player,true)
        }
    }
    setup_receive_listeners = () => {
        for (let player of this.players) {
            player.on("message", async (messageData : any) => {
                
                const {type, player_number, value} : {type : string, player_number : number, value: any} = await JSON.parse(messageData)
                switch (type) {
                    case "PLACE_SHIP":
                        const [start ,end] : [start: number[], end: number[]] = value;
                        if (this.check_valid_ship_placement(player_number,start,end)) {
                            this.place_ship(player_number,start,end)
                            send_message("SHIP_PLACED",player,[start,end])
                        }
                        break;
                    case "SEND_HIT":
                        this.hit(player_number,value);
                        this.swap_turns();
                        break;
                }
            })
        }
    }

}
class private_game extends game {
    keyword: string;
    constructor(keyword : string) {
        super();
        this.keyword= keyword
    }
}

const send_message = async (type: string, socket : any, value : any) => {
    const message : object = {
        type,
        value
    }
    socket.send(JSON.stringify(message))
}

wsServer.on('connection',async (socket : any) => {
    console.log("connection")
    socket.on('message', async (data : any) => {
        const {type, value} = JSON.parse(data);
        switch (type) {
            case 'PRIVATE_HOST':
                const session = new private_game(value);
                private_games.push(session);
                await send_message("PLAYER_NUMBER",socket,0)
                session.add_player(socket)
                break;
            case 'PRIVATE_JOIN':
                for (let game of private_games) {
                    if (game.keyword === value && game.players.length < 2) {
                        await send_message("PLAYER_NUMBER",socket,1)
                        game.add_player(socket)
                    }
                }
                break;
            case 'PUBLIC_JOIN':
                if (games.length == 0) {
                    games.push(new game());
                    await send_message("PLAYER_NUMBER",socket,0)
                    games[0].add_player(socket);
                    
                }
                else if (games[games.length - 1].players.length < 2) {
                    await send_message("PLAYER_NUMBER",socket,1)
                    games[games.length - 1].add_player(socket)
                    
                } else {
                    games.push(new game());
                    await send_message("PLAYER_NUMBER",socket,0)
                    games[games.length - 1].add_player(socket);
                    
                }
                break;
        }
    })
    
    
})

module.exports = { game, server }