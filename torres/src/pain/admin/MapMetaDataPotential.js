import React from 'react';
import { Grid, Box, Typography, Avatar, Badge } from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LaunchIcon from '@mui/icons-material/Launch'
import { Rating } from '@mui/material';
import formatPhoneNumber from '../utils/formatPhone';
import { styled } from '@mui/material/styles';
 
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 420,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));

const MapMetaDataPreferred = ({ selected }) => {

    return (
    <>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <Typography variant="h6" fontWeight="500" gutterBottom>
              {selected.name}&nbsp;
            </Typography>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
                <Typography variant="h6" fontWeight="500" gutterBottom>
                    {selected.alternate_status_name ? selected.alternate_status_name : "N/A"}
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
            <a style={{color:"black"}} target="_blank" href={"/app/main/admin/registrations/" + selected.id}>
                <Typography variant="body2" color="textSecondary" mt={1}>
                {"ID: " + selected.id} <LaunchIcon style={{fontSize:20}}/> 
                </Typography>
            </a>
          </Typography>
        </Box>

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
        <Typography variant="body2" color="textSecondary" mt={1}>
          Summary: {selected.account_summary}
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
          {selected.addr1} 
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
