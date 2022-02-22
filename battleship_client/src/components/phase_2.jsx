
import { Grid } from './grid';
import { GridSquare_2 } from './grid_square_phase_2';

export const Phase2 = (props) => {
    return (
        <div>
            phase 2
            <div className='phase_2'>
                <Grid square_component={GridSquare_2}  />
                <Grid square_component={GridSquare_2} enemy={true} />
            </div>
            
        </div>
    )
}