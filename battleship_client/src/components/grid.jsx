import { useEffect, useState } from 'react'

export const Grid = (props) => {
    const [grid, set_grid] = useState([])
    useEffect(() => {
        let temp_grid = [];
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                temp_grid.push([x,y])
            }
        }
        set_grid(temp_grid)
    },[])
    return (
        <div className="grid">
            {grid.map((element, index) => {
                return (
                    <props.square_component enemy={props.enemy} x={element[1]} y={element[0]}  />
                )
            })}
        </div>
    )
}