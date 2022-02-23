import { useEffect, useState, useContext } from 'react'
import { serverContext, playerNumberContext, shipsPlacedContext } from "./game_manager";
import { Ship } from './ship';

export const Grid = (props) => {
    const [grid, set_grid] = useState([])
    const [mouse_pos,set_mouse_pos] = useState([])
    const [current_ship, set_current_ship] = useState(0)
    const server = useContext(serverContext)
    const playerNumber = useContext(playerNumberContext)
    const ships = useContext(shipsPlacedContext)
    useEffect(() => {
        let temp_grid = [];
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                temp_grid.push([x,y])
            }
        }
        set_grid(temp_grid)
    },[])
    const place_ship = (point_1, point_2) => {
        
        const message = {
            type: "PLACE_SHIP",
            player_number : playerNumber,
            value : [point_1,point_2]
        }
        console.log(message)
        server.send(JSON.stringify(message))
    }
    const handle_drag_over = (e) => {
        e.preventDefault();
    }
    const handle_drop = (e) => {
        e.preventDefault();
        const [x, y] = mouse_pos
        const start = x - Math.trunc(current_ship / 2)
        const end = x + Math.trunc(current_ship / 2)
        place_ship([start,y],[end,y])
        set_current_ship(0);
        set_mouse_pos([]);
    }
    
    return (
        <div>

        <div onDrop={handle_drop} onDragOver={handle_drag_over} className="grid">
            {grid.map((element, index) => {
                return (
                    <props.square_component key={index} highlight={mouse_pos[0] - Math.trunc(current_ship / 2) <= element[1] && mouse_pos[0] + Math.trunc(current_ship / 2) >= element[1] && mouse_pos[1] === element[0]} update_hover={set_mouse_pos} enemy={props.enemy} x={element[1]} y={element[0]}  />
                    )
                })}
        </div>
            {ships.map((element, index) => (
                <Ship key={index} size={element} set_current_ship={set_current_ship} />
            ))}
        </div>
    )
}