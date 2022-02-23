import { useState, useContext } from "react";
import { shipsContext } from "./game_manager";

export const GridSquare_1 = (props) => {
    const ships = useContext(shipsContext)
    
    const handle_drag_over = (e) => {
        e.preventDefault();
        props.update_hover([props.x,props.y])
    }
    const handle_drag_leave = (e) => {
        e.preventDefault();
        props.update_hover([])
    }
    for (let ship of ships) {
        if (props.x >= ship[0][0] && props.x <= ship[1][0] && props.y >= ship[0][1] && props.y <= ship[1][1]) {
            return (
                <div onDragLeave={handle_drag_leave} onDragOver={handle_drag_over} className="grid_square active"></div>
            )
        }
    }

    if (props.highlight) {
        return (
            <div onDragLeave={handle_drag_leave} onDragOver={handle_drag_over} className="grid_square hover"/>
        )
    }
    return (
            <div onDragOver={handle_drag_over} className="grid_square"/>
            
        

    )
}