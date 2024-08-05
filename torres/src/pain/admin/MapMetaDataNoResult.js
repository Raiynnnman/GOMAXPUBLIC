import React from 'react';
import { Grid, Box, Typography, Avatar, Badge } from '@mui/material';

import EventSeatIcon from '@mui/icons-material/EventSeat';
import LaunchIcon from '@mui/icons-material/Launch'
import { Rating } from '@mui/material';
import formatPhoneNumber from '../utils/formatPhone';
 

const MapMetaDataNoResult = ({ selected }) => {

    return (
    <>
        <div style={{display:"flex",justifyContent:"space-between"}}>
            <Typography variant="h6" fontWeight="500" gutterBottom>
              {selected.uuid.substring(0,10)}&nbsp;
            </Typography>
        </div>

        <Typography variant="body2" color="textSecondary" mt={1}>
          {selected.category}
        </Typography>

        <Typography variant="body2" color="textSecondary" mt={1}>
          Location: {selected.coords[0].lat + ", " + selected.coords[0].lng}
        </Typography>

        <Typography variant="body2" color="textSecondary" mt={1}>
            Count: {selected.count}
        </Typography>
    </>
    )

}

export default MapMetaDataNoResult;
