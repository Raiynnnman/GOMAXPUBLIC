import React, { useState, Component, useEffect } from 'react';
import Button from '@mui/material/Button';
import { Grid } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import { SxProps } from '@mui/system';

function NotificationsMenu({onChange,items,title,currentUser}) {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    if (!open) { 
        setOpen(true);
    }
  };

  const handleAction = (e) => {
    e();
  }

  const handleClickAway = () => {
    setOpen(false);
  };

  return (
    <div onMouseEnter={handleClick} style={{marginLeft:10}}>
        <ClickAwayListener onClickAway={handleClickAway}>
          <Box sx={{ position: 'relative',backgroundColor:'black'}}>
            <div style={{cursor:"pointer",color:"white",fontWeight:'bold',fontSize:12}}>
                <Badge badgeContent={items.length} color="warning">
                  <NotificationsActiveIcon/>
                </Badge>
            </div>
            {open ? (
              <Box sx={{ position: 'absolute', top: 28, width:400,
                        right: 0, left: -100, border: '1px solid', p: 1, zIndex:9999,
                        bgcolor: 'black' }}>
                {items.map((e) => { 
                    return ( 
                        <div style={{display:"flex", justifyContent:"start", textTransform:"none", margin:5,color:"white",borderBottom:"1px solid grey" }}>
                            <Grid container xs={12}>
                                <Grid item xs={9}>
                                    <font style={{fontSize:12}}>
                                        {e.message}
                                    </font>
                                </Grid>
                                <Grid item xs={3}>
                                    <div style={{display:"flex",justifyContent:"flex-end"}}>
                                        <font style={{textTransform:"none", fontSize:9,fontStyle:"italic"}}>
                                            {e.timer ? e.timer :0} minutes ago
                                        </font>
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                    )
                })} 
              </Box>
            ) : null}
          </Box>
        </ClickAwayListener>
    </div>
  );
}

export default NotificationsMenu;
