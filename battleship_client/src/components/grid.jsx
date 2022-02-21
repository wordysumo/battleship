import { useEffect, useState } from 'react'
import { GridSquare_1 } from './grid_square_phase_1'
import { GridSquare_2 } from './grid_square_phase_2'

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
                if (props.phase === 1) {
                    return (
                        <GridSquare_1 key={index} x={element[1]} y={element[0]} playerNumber={props.playerNumber} server={props.server} />
                    )
                } else {
                    
                    if (!props.enemy && props.hits_received.length > 0) {
                        for (let hit of props.hits_received) {
                            if (hit[0] === element[0] && hit[1] === element[1]) {
                                return (
                                    <GridSquare_2 hit />
                                )
                            }
                        }
                    }
                    if(props.enemy) {
                        console.log(props.success)
                        console.log(props.miss)
                        if (props.success.length > 0) {
                            for (let hit of props.success) {
                                if (hit[0] === element[1] && hit[1] === element[0]) {
                                    return (
                                        <GridSquare_2 success />
                                    )
                                }
                            }
                        }
                        if (props.miss.length > 0) {
                            for (let hit of props.miss) {
                                if (hit[0] === element[1] && hit[1] === element[0]) {
                                    return (
                                        <GridSquare_2 miss />
                                    )
                                }
                            }
                        }
                    }
                    return (
                        <GridSquare_2 />
                    )
                }
            })}
        </div>
    )
}