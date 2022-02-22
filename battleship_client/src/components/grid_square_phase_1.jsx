import { useState, useContext } from "react";
import { serverContext, playerNumberContext } from "./game_manager";

export const GridSquare_1 = (props) => {
    const server = useContext(serverContext)
    const playerNumber = useContext(playerNumberContext)
    const [ship_placed, set_ship_placed] = useState(false)
    const [hover, set_hover] = useState(false)
    const place_ship = () => {
        
        const message = {
            type: "PLACE_SHIP",
            player_number : playerNumber,
            value : [[props.x,props.y],[props.x,props.y]]
        }
        console.log(message)
        server.send(JSON.stringify(message))
    }
    const handle_drag_over = (e) => {
        e.preventDefault();
        set_hover(true);
    }
    const handle_drag_leave = (e) => {
        e.preventDefault();
        set_hover(false);
    }
    const handle_drop = (e) => {
        e.preventDefault();
        if (!ship_placed) {
            console.log("dropping")
            set_hover(false);
            set_ship_placed(true);
            place_ship();
        }
    }
    return (
        <div>
            {ship_placed && <div className="grid_square active" />}
            {hover && <div onDrop={handle_drop} onDragLeave={handle_drag_leave} onDragOver={handle_drag_over} className="grid_square hover" />}
            {(!hover && !ship_placed) && <div onDragOver={handle_drag_over} className="grid_square" />}
            
        </div>
        

    )
}