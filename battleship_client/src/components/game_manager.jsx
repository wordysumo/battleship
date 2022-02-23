import {useState, useEffect, createContext } from 'react'
import { Phase1 } from './phase_1';
import { Phase2 } from './phase_2';
export const playerNumberContext = createContext();
export const serverContext = createContext();
export const shipsContext = createContext();
export const hitsReceivedContext = createContext();
export const hitsSuccessContext = createContext();
export const hitsMissedContext = createContext();
export const turnContext = createContext();
export const shipsPlacedContext = createContext();
export const GameManger = () => {
    const [playerNumber, setPlayerNumber] = useState(-1);
    const [myTurn, setMyTurn] = useState(false)
    const [game_phase, setGame_Phase] = useState(0)
    const [ship_positions, set_ship_positions] = useState([])
    const [server, set_server] = useState(false)
    const [place_ship_position, set_place_ship_position] = useState(false)
    const [disconnected, set_disconnected] = useState(false);
    const [ships_placed, set_ships_placed] = useState([5,3,3,1,1])
    const [hit_positions, set_hit_positions] = useState([])
    const [hit_successes, set_hit_successes] = useState([])
    const [hit_fails, set_hit_fails] = useState([])
    const [won, set_won] = useState(false);
    const [host_key, set_host_key] = useState('test')

    useEffect(() => {
        
        const wsClient = new WebSocket("ws://127.0.0.1:8999")
        wsClient.onerror = (err) => {
            console.log(err);
            set_disconnected(true);
        }
        set_server(wsClient)
        
        
        
    },[])
    useEffect(() => {
        if (server) {
        set_disconnected(false);
        server.onmessage = (message) => {
            const data = JSON.parse(message.data)
            switch (data.type) {
            case "PLAYER_NUMBER":
                console.log("PLayer number: ");
                console.log(data.value)
                setPlayerNumber(Number(data.value))
                break;
            case "TURN_SWITCH":
                setMyTurn(true)
                break;
            case "GAME_START":
                setGame_Phase(1);
                break;
            case "NEXT_PHASE":
                setGame_Phase(2);
                break;
            case "SHIP_PLACED":
                console.log("ship confirmation received")
                set_ship_positions([...ship_positions, data.value])
                const ship_length = (data.value[1][0] - data.value[0][0]) + 1
                const index = ships_placed.indexOf(ship_length)
                set_ships_placed(prev_ships_placed => prev_ships_placed.slice(0,index).concat(prev_ships_placed.slice(index+1)))
                break;
            case "RECEIVE_HIT":
                console.log("hit data received received");
                set_hit_positions([...hit_positions, data.value])
                break;
            case "HIT_SUCCESS":
                set_hit_successes([...hit_successes, data.value])
                setMyTurn(false);
                break;
            case "HIT_FAIL":
                set_hit_fails([...hit_fails, data.value])
                setMyTurn(false);
                break;
            case "END_GAME":
                setGame_Phase(3);
                break;
            case "WIN_GAME":
                set_won(true);
                break;
            default:
                console.log(data.value)
                break;
            }
        }
        } else {
        set_disconnected(true);
        }
        
    },[server,ship_positions,place_ship_position, hit_positions,hit_successes,hit_fails,ships_placed])
    const join_public_game = () => {
        const message = {
            type: "PUBLIC_JOIN",
            value: true
        }
        server.send(JSON.stringify(message));
    }
    const host_private_game = () => {
        const message = {
            type: 'PRIVATE_HOST',
            value: host_key
        }
        server.send(JSON.stringify(message));
    }
    const join_private_game = () => {
        const message = {
            type: 'PRIVATE_JOIN',
            value: host_key
        }
        server.send(JSON.stringify(message));
    }
    return (
        <div className="App">
        <playerNumberContext.Provider value={playerNumber}>
            <serverContext.Provider value={server}>
                <shipsContext.Provider value={ship_positions}>
                    <hitsReceivedContext.Provider value={hit_positions}>
                        <hitsSuccessContext.Provider value={hit_successes}>
                            <hitsMissedContext.Provider value={hit_fails}>
                                <turnContext.Provider value={myTurn}>
                                    <shipsPlacedContext.Provider value={ships_placed}>
                                        {disconnected && <h2>no connection</h2>}
                                {myTurn && "it is my turn"}
                                {game_phase === 0 && <div>
                                    <button onClick={join_public_game}>Join public</button>
                                    <button onClick={join_private_game}>Join private</button>
                                    <button onClick={host_private_game}>Host private</button>
                                    </div>}
                                {game_phase === 1 && <Phase1 />}
                                {game_phase === 2 && <Phase2 turn={myTurn} />}
                                {game_phase === 3 && <div>
                                    {won && <h1>you have won</h1>}
                                    {!won && <h1>you have lost</h1>}
                                    </div>}
                                    </shipsPlacedContext.Provider>
                                </turnContext.Provider>
                            </hitsMissedContext.Provider>
                        </hitsSuccessContext.Provider>
                    </hitsReceivedContext.Provider>
                </shipsContext.Provider>
            </serverContext.Provider>
        </playerNumberContext.Provider>
        </div>
    );
}