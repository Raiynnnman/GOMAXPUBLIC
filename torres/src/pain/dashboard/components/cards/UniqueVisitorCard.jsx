import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Grid, Stack, Typography, Box } from '@mui/material';
import AreaChart from '../charts/AreaChart';
import MainCard from './MainCard';

export default function UniqueVisitorCard({ data }) {
    const [slot, setSlot] = useState('week');

    return (
        <>
            <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                    <Typography variant="h5" style={{ color: 'black' }}>  
                        Platform Stats
                    </Typography>
                </Grid>
                <Grid item>
                </Grid>
            </Grid>
            <MainCard content={false} sx={{ mt: 1.5 }}>
                <Box sx={{ pt: 1, pr: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Button
                            size="small"
                            onClick={() => setSlot('month')}
                            style={{
                                color: slot === 'month' ? '#FFA500' : '#FF8C00',  
                                borderColor: slot === 'month' ? '#FFA500' : 'transparent',  
                                backgroundColor: slot === 'month' ? 'transparent' : 'none',  
                            }}
                            variant="outlined" 
                        >
                            Month
                        </Button>
                        <Button
                            size="small"
                            onClick={() => setSlot('week')}
                            style={{
                                color: slot === 'week' ? '#FFA500' : '#FF8C00',  
                                borderColor: slot === 'week' ? '#FFA500' : 'transparent', 
                                backgroundColor: slot === 'week' ? 'transparent' : 'none',  
                            }}
                            variant="outlined"  
                        >
                            Week
                        </Button>
                    </Stack>
                    <AreaChart labels={data.labels} slot={slot} data={data[slot]} />
                </Box>
            </MainCard>
        </>
    );
}

UniqueVisitorCard.propTypes = {
    data: PropTypes.object.isRequired
};
