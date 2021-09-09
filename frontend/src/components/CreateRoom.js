import React from 'react'
import { v4 as uuidv4 } from 'uuid';

const CreateRoom = (props) => {
    const create = () => {
        const conference_id = uuidv4()
        props.history.push(`/blueforce/conference/${conference_id}`)
    }
    return (
        <div>
            <button onClick={create}>
                Start A Call
            </button>
        </div>
    )
}

export default CreateRoom
