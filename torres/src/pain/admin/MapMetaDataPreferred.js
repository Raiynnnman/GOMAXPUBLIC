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
              {selected.name}&nbsp;
            </Typography>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
            <Typography variant="h6" fontWeight="500" gutterBottom>
                {selected.score && selected.score.toFixed ? (selected.score/10).toFixed(2) : selected.score || "0.00"}
            </Typography>
            </div>
          </div>

        {!selected.users || selected.users.length < 1 && (
            <Typography variant="body2" color="textSecondary" noWrap mt={1}>
                No users on file
            </Typography>
        )}
        {selected.users && selected.users.length > 0 && (
        <>
            {selected.users.map((f) => { 
                return (
                <>
                    <Typography variant="body2" color="textSecondary" noWrap mt={1}>
                      {f.first_name + " " + f.last_name}
                      &nbsp;{f.email}&nbsp;{f.phone ? formatPhoneNumber(f.phone) : 'N/A'}
                    </Typography>
                </>
                )
            })}
            
        </>
        )}

        <Box display="flex" alignItems="center">
          <Typography variant="body2" color="textSecondary">
            <a style={{color:"black"}} target="_blank" href={"/app/main/admin/providers/" + selected.office_id}>
                <Typography variant="body2" color="textSecondary" mt={1}>
                {"ID: " + selected.office_id + " (" + selected.id + ")"} <LaunchIcon style={{fontSize:20}}/> 
                </Typography>
            </a>
          </Typography>
        </Box>

        <a style={{color:"black"}} target="_blank" href={"/app/main/admin/search/" + selected.id}>
            <Typography variant="body2" color="textSecondary" mt={1}>
              {selected.client_count  ? selected.client_count : "0" + " clients"} <EventSeatIcon style={{fontSize:20}}/>
            </Typography>
        </a>

        <Typography variant="body2" color="textSecondary" mt={1}>
            Rating: <Rating name="read-only" size="small" precision={0.5} 
                value={selected.rating ? selected.rating : 0} readOnly />
        </Typography>

        <Typography variant="body2" color="textSecondary" mt={1}>
          {selected.category}
        </Typography>

        <Typography variant="body2" color="textSecondary" mt={1}>
          {selected.office_type}
        </Typography>
        {!selected.plan || selected.plan.length < 1 && (
            <Typography variant="body2" color="textSecondary" mt={1}>
              No plan assigned
            </Typography>
        )}
        {selected.plan && selected.plan.length > 0 && (
            <Typography variant="body2" color="textSecondary" mt={1}>
                {selected.plan[0].description + " - @" + selected.plan[0].start_date + " - " + selected.plan[0].age + " days"}
            </Typography>
            
        )}

        {/* Address */}
        <Typography variant="body2" color="textSecondary" mt={1}>
          {selected.addr1}, {selected.zipcode}
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          {selected.city}, {selected.state} {selected.zipcode}
        </Typography>

        {/* Phone */}
        {!selected.phone && (
          <Box display="flex" alignItems="center" mt={1}>
            <Typography variant="body2" color="textSecondary" noWrap>
              Phone: No phone on file
            </Typography>
          </Box>
        )}
        {selected.phone && (
          <Box display="flex" alignItems="center" mt={1}>
            <Typography variant="body2" color="textSecondary" noWrap>
              Phone: {selected.phone ? formatPhoneNumber(selected.phone) : 'N/A'}
            </Typography>
          </Box>
        )}
    </>
    )

}

export default MapMetaDataPreferred;
