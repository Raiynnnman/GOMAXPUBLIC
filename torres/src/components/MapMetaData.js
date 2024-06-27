import React from 'react';
import { Grid, Box, Typography, Avatar, Badge } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LaunchIcon from '@mui/icons-material/Launch'
import { Rating } from '@mui/material';
import formatPhoneNumber from '../pain/utils/formatPhone';
 

const MapMetaData = ({ selected }) => {
  return (
    <Box
      sx={{
        backgroundColor: 'white',
        boxShadow: 4,
        borderRadius: 1,
      }}
    >
      {selected === null ? (
        <Typography variant="h6" fontWeight="500">No marker selected!</Typography>
        ) : (
        <>
          <Grid container spacing={2} justifyContent="space-between">
            <Grid item xs={12} sm={12}>
              <Box px={2} style={{marginBottom:20}}>
                <Typography variant="h6" fontWeight="500" gutterBottom>
                  {selected.name}
                </Typography>

                {/* Ratings */}
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
                      {selected.client_count + " clients"} <EventSeatIcon style={{fontSize:20}}/>
                    </Typography>
                </a>

                <Typography variant="body2" color="textSecondary" mt={1}>
                  {selected.category}
                </Typography>

                <Typography variant="body2" color="textSecondary" mt={1}>
                  {selected.office_type}
                </Typography>

                {/* Address */}
                <Typography variant="body2" color="textSecondary" mt={1}>
                  {selected.addr1}, {selected.zipcode}
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  {selected.city}, {selected.state} {selected.zipcode}
                </Typography>

                {/* Phone */}
                {selected?.phone && (
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="textSecondary" noWrap>
                      Phone: {selected.phone ? formatPhoneNumber(selected.phone) : 'N/A'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default MapMetaData;
