import React from 'react';
import { Grid, Box, Typography, Avatar, Badge } from '@mui/material';
import { Rating } from '@mui/material';
import formatPhoneNumber from '../pain/utils/formatPhone';
 

const MapMetaData = ({ selected }) => {
  return (
    <Box
      sx={{
        backgroundColor: 'white',
        backgroundColor: 'white',
        p: 2,
        mt: { xs:19, md: 'auto' },
        mb:{xs:3,md:12},
        mr: { xs: 5, md: 25 },
        height: { xs:'auto',md: 'auto' },
        width: { md: 'auto' },
        ml: {  xs: 2, md: 13  },
        boxShadow: 4,
        borderRadius: 1,
      }}
    >
      {selected === null ? (
        <Typography variant="h6" fontWeight="500">No marker selected!</Typography>
        ) : (
        <>
          <Grid container spacing={2} justifyContent="space-between">
            <Grid item xs={12} sm={8}>
              <Box px={2}>
                <Typography variant="h6" fontWeight="500" gutterBottom>
                  {selected.name}
                </Typography>

                {/* Ratings */}
                <Box display="flex" alignItems="center">
                  {/*<Rating size="small" value={Number(selected.lead_strength)} readOnly />*/}
                  <Typography variant="body2" color="textSecondary" ml={1}>
                    {selected.lead_strength_id}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" ml="auto">
                    {selected.price_level}
                  </Typography>
                </Box>

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
            <Grid item xs={12} sm={4} display="flex" justifyContent="center" alignItems="center">
              <Avatar
                variant="rounded"
                src={
                  selected.photo
                    ? selected.photo : "data:image/png;base64,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"
                }
                sx={{ width: 120, height: 120 }}
              />
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default MapMetaData;
