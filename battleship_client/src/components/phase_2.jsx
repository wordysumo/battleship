import {useState, useEffect } from 'react'
import { Grid } from './grid';

export const Phase2 = (props) => {
    useEffect(() => {
        console.log(props.hits_received)
    },[props.hits_received])
    const [target, set_target] = useState(false);
    const handle_change = ({target}) => {
        set_target(target.value);
    }
    const fire = () => {
        const message = {
            type: "SEND_HIT",
            player_number: props.playerNumber,
            value: JSON.parse(target)
        }
        console.log(message)
        props.server.send(JSON.stringify(message))

    }
    return (
        <div>
            phase 2
                
            <div>
                hits_received ={props.hits_received}
            </div>
            <div>
                successful hits = {props.hits_success}
            </div>
            <div>
                missed hits = {props.hits_fail}
            </div>
            <div className='phase_2'>
                <Grid phase={2} hits_received={props.hits_received} server={props.server} playerNumber={props.playerNumber} />
                <Grid phase={2} enemy={true} success={props.hits_success} miss={props.hits_fail}  server={props.server} playerNumber={props.playerNumber} />
            </div>
            {props.turn && <div>
                <input value={target} onChange={handle_change}></input>
                <button onClick={fire}>Fire</button>
            </div>}
            
        </div>
    )
}