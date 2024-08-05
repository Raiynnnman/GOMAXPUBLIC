import React from 'react';
import { Grid, Box, Typography, Avatar, Badge } from '@mui/material';

import EventSeatIcon from '@mui/icons-material/EventSeat';
import LaunchIcon from '@mui/icons-material/Launch'
import { Rating } from '@mui/material';
import formatPhoneNumber from '../utils/formatPhone';
import MapMetaDataPreferred from './MapMetaDataPreferred';
import MapMetaDataAccident from './MapMetaDataAccident';
import MapMetaDataNoResult from './MapMetaDataNoResult';
 

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
        <div style={{height:200,display:"flex",alignContent:"center",justifyContent:"center"}}>
        <Typography variant="h6" fontWeight="500">Select an item to see important details</Typography>
        </div>
        ) : (
        <>
          <Grid container spacing={2} justifyContent="space-between">
            <Grid item xs={12} sm={12}>
              <Box px={2} style={{marginBottom:20}}>
              <>
                    {(selected.category_id === 99) && (
                        <MapMetaDataPreferred selected={selected}/>
                    )}
                    {(selected.category_id === 101) && (
                        <MapMetaDataPreferred selected={selected}/>
                    )}
                    {(selected.category_id === 104) && (
                        <MapMetaDataPreferred selected={selected}/>
                    )}
                    {(selected.category_id === 2) && (
                        <MapMetaDataAccident selected={selected}/>
                    )}
                    {(selected.category_id === 103) && (
                        <MapMetaDataNoResult selected={selected}/>
                    )}
              </>
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default MapMetaData;
