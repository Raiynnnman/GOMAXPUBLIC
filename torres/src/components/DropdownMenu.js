import React, { useState, Component, useEffect } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import { SxProps } from '@mui/system';

function DropdownMenu({onChange,items,title,currentUser}) {
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

  const styles: SxProps = {
    position: 'absolute',
    top: 28,
    right: 0,
    left: 0,
    border: '1px solid',
    p: 1,
    zIndex:9999,
    bgcolor: '#2d3e50',
  };

  return (
    <div onMouseEnter={handleClick} style={{marginLeft:10}}>
        <ClickAwayListener onClickAway={handleClickAway}>
          <Box sx={{ position: 'relative',background:'#2d3e50'}}>
            <div style={{cursor:"pointer",color:"white",fontSize:16,fontWeight:400}}>
              {title}
            </div>
            {open ? (
              <Box sx={styles}>
                {items.map((e) => { 
                    if (e.v(currentUser)) { 
                        return(
                            <MenuItem style={{background:'#2d3e50',color:'white'}} 
                            onClick={() => handleAction(e.a)} id={e.n}>
                                {e.n}
                            </MenuItem>
                        )
                    }
                })} 
              </Box>
            ) : null}
          </Box>
        </ClickAwayListener>
    </div>
  );
}

export default DropdownMenu;
