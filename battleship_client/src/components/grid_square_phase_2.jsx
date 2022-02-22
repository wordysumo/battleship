import { useContext, useEffect } from "react";
import { serverContext, playerNumberContext, shipsContext, hitsReceivedContext, hitsMissedContext, hitsSuccessContext, turnContext } from "./game_manager";


export const GridSquare_2 = (props) => {
    const server = useContext(serverContext);
    const playerNumber = useContext(playerNumberContext);
    const ships = useContext(shipsContext);
    const hitsReceived = useContext(hitsReceivedContext);
    const hitsSuccess = useContext(hitsSuccessContext);
    const hitsMiss = useContext(hitsMissedContext);
    const myturn = useContext(turnContext)
    useEffect(() => {
        console.log(ships)
    },[])
    const fire = () => {
        if (myturn) {
            const message = {
                type: "SEND_HIT",
                player_number: playerNumber,
                value: [props.x,props.y]
            }
            console.log(message)
            server.send(JSON.stringify(message))
        }
    }
    if (props.enemy) {
        for (let hit of hitsSuccess) {
            if (hit[0] === props.x && hit[1] === props.y) {
                return (
                    <div className="grid_square active" />
                )
            }
        }
        for (let hit of hitsMiss) {
            if (hit[0] === props.x && hit[1] === props.y) {
                return (
                    <div className="grid_square hit" />
                )
            }
        }

    } else {
        
        for (let hit of hitsReceived) {
            if (hit[0] === props.x && hit[1] === props.y) {
                return (
                    <div className="grid_square hit" />
                )
            }
        }
        for (let ship of ships) {
            if (ship[0][0] === props.x && ship[0][1] === props.y) {
                return (
                    <div className="grid_square active" />
                )
            }
        }

    }
    return (
        <div>
            {!props.enemy && <div className="grid_square" />}
            {props.enemy && <div onClick={fire} className="grid_square" />}
        </div>
        

    )
}