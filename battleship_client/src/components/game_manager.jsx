import {useState, useEffect } from 'react'
import { Phase1 } from './phase_1';
import { Phase2 } from './phase_2';
export const GameManger = () => {
    const [playerNumber, setPlayerNumber] = useState(-1);
    const [myTurn, setMyTurn] = useState(false)
    const [game_phase, setGame_Phase] = useState(0)
    const [ship_positions, set_ship_positions] = useState([])
    const [server, set_server] = useState(false)
    const [place_ship_position, set_place_ship_position] = useState(false)
    const [disconnected, set_disconnected] = useState(false);
    const [ships_placed, set_ships_placed] = useState(5)
    const [hit_positions, set_hit_positions] = useState([])
    const [hit_successes, set_hit_successes] = useState([])
    const [hit_fails, set_hit_fails] = useState([])
    const [won, set_won] = useState(false);


    useEffect(() => {
        const wsClient = new WebSocket("ws://127.0.0.1:8999")
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
                set_ships_placed(ships_placed - 1)
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
    
    const handle_ship_input_change = ({target}) => {
        set_place_ship_position(target.value)
    }
    return (
        <div className="App">
        {disconnected && <h2>no connection</h2>}
        My Player number is {playerNumber}
        {myTurn && "it is my turn"}
        current positions = {JSON.stringify(ship_positions)}
        
        
        {game_phase === 1 && <Phase1 playerNumber={playerNumber} server={server} ship_position={place_ship_position} update_ship_position={handle_ship_input_change} placed={ships_placed} />}
            
            

        {game_phase === 2 && <Phase2 playerNumber={playerNumber} server={server} turn={myTurn} ships={ship_positions} hits_received={hit_positions} hits_success={hit_successes} hits_fail={hit_fails} />}

        {game_phase === 3 && <div>
            {won && <h1>you have won</h1>}
            {!won && <h1>you have lost</h1>}
            </div>}


        </div>
    );
}