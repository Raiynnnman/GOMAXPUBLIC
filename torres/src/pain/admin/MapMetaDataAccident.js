import React from 'react';
import { Grid, Box, Typography, Avatar, Badge } from '@mui/material';

import EventSeatIcon from '@mui/icons-material/EventSeat';
import LaunchIcon from '@mui/icons-material/Launch'
import { Rating } from '@mui/material';
import formatPhoneNumber from '../utils/formatPhone';
 

const MapMetaDataPreferred = ({ selected }) => {

    return (
    <>
        <div style={{display:"flex",justifyContent:"space-between"}}>
            <Typography variant="h6" fontWeight="500" gutterBottom>
              {selected.uuid.substring(0,10)}&nbsp;
            </Typography>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
            <Typography variant="h6" fontWeight="500" gutterBottom>
                {selected.city + ", " + selected.state}
            </Typography>
            </div>
        </div>

        <Typography variant="body2" color="textSecondary" mt={1}>
          {selected.category}
        </Typography>

        <Typography variant="body2" color="textSecondary" mt={1}>
          {selected.coords[0].lat + ", " + selected.coords[0].lng}
        </Typography>

        <Typography variant="body2" color="textSecondary" mt={1}>
            {selected.traf_from}
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
            {selected.traf_start_time}
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
            {}
        </Typography>
        <Typography variant="body2" mt={1}>Name:<br/>{
            selected.contact.first_name ? 
                selected.contact.last_name + ", " + selected.contact.first_name : "Processing..."}
        </Typography>
        <Typography variant="body2" mt={1}>DOB:<br/>
            {selected.contact.dob ? selected.contact.dob : ''}
        </Typography>
        <Typography variant="body2" mt={1}>Phone:<br/> {formatPhoneNumber(selected.contact.phone)}</Typography>
        <Typography variant="body2" mt={1}>Email:<br/>{
            selected.contact.email ?  selected.contact.email : ""
        }</Typography>
        <Typography variant="body2" mt={1}>First Contact:<br/>{selected.contact.contacted_timer  ? selected.contact.contacted_timer + "m" : ''}</Typography>
        <Typography variant="body2" mt={1}>Make/Model:<br/>{
            selected.contact.car_year + " " + 
            selected.contact.car_make + " " + selected.contact.car_model
            }</Typography>
        <Typography variant="body2" mt={1}>Color:<br/>{
            selected.contact.car_color ? selected.contact.car_color : ''
            }</Typography>
        <Typography variant="body2" mt={1}>Status:<br/>{selected.contact.status ? selected.contact.status : ''}</Typography>
            

    </>
    )

}

export default MapMetaDataPreferred;
