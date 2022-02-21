import {useState, useEffect } from 'react'
import { Grid } from './grid'

export const Phase1 = (props) => {
    
    

    
    

    return (
        <div className='phase_1'>
        <Grid phase={1} playerNumber={props.playerNumber} server={props.server} />
        {props.placed > 0 && <div className='ships_section'>
        <div className='ship' draggable></div>
        </div>}
        
        </div>
    )
}