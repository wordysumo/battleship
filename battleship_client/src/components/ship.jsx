import { useState } from "react"

export const Ship = (props) => {
    const handle_drag = () => {
        props.set_current_ship(props.size)
        console.log(props.size)
    }
    return (
        <div onDragStart={handle_drag} className="ship" draggable >
            {props.size}
            </div>
    )

}