import React from 'react';
import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import MainCard from './MainCard';  

const iconSX = { fontSize: '0.75rem', color: 'inherit', marginLeft: 0, marginRight: 0 };

function AnalyticEcommerce({ color = 'primary', title, count, percentage, isLoss, extra }) {
    return (
        <MainCard 
            contentSX={{ p: 2.25 }}  
            sx={{
                transition: '0.3s',
                border: '1px solid #d3d3d3', // Added thin border here
                borderRadius: '4px', // Optional: adds rounded corners
                '&:hover': {
                    boxShadow: '0px 0px 15px 2px rgba(255, 165, 0, 0.7)'  
                }
            }}
        >
            <Stack spacing={0.5}>
                <Typography variant="h6" color="text.secondary">
                    {title}
                </Typography>
                <Grid container alignItems="center">
                    <Grid item>
                        <Typography variant="h4" color="inherit">
                            {count}
                        </Typography>
                    </Grid>
                    {percentage !== undefined && (
                        <Grid item>
                            <Chip
                                variant="outlined"
                                icon={isLoss ? <ArrowDownward style={iconSX} /> : <ArrowUpward style={iconSX} />}
                                label={`${percentage}%`}
                                sx={{
                                    ml: 1.25,
                                    pl: 1,
                                    border: isLoss ? '2px solid blue' : '2px solid orange',
                                    color: isLoss ? 'blue' : 'orange',
                                    backgroundColor: isLoss ? 'rgba(173, 216, 230, 0.3)' : 'rgba(255, 165, 0, 0.2)'
                                }}
                                size="small"
                            />
                        </Grid>
                    )}
                </Grid>
            </Stack> 
        </MainCard>
    );
}

AnalyticEcommerce.propTypes = {
    color: PropTypes.string,
    title: PropTypes.string.isRequired,
    count: PropTypes.string.isRequired,
    percentage: PropTypes.number,
    isLoss: PropTypes.bool,
    extra: PropTypes.string.isRequired
};

export default AnalyticEcommerce;
