


export const GridSquare_2 = (props) => {
    
    return (
        <div>
            {(props.hit || props.miss) && <div className="grid_square hit" />}
            {!props.hit && !props.miss && !props.success && <div className="grid_square" />}
            {props.success && <div className="grid_square active" />}
            
        </div>
        

    )
}