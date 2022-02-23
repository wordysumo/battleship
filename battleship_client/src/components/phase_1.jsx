import { Grid } from './grid'
import { GridSquare_1 } from './grid_square_phase_1'

export const Phase1 = (props) => {
 
    return (
        <div className='phase_1'>
        <Grid square_component={GridSquare_1} playerNumber={props.playerNumber} server={props.server} />
        
        </div>
    )
}