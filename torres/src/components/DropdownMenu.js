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

  const handleAction = () => {
    console.log("action");
  }

  const handleClickAway = () => {
    console.log("omg");
    setOpen(false);
  };

  const styles: SxProps = {
    position: 'absolute',
    top: 28,
    right: 0,
    left: 0,
    zIndex: 1,
    border: '1px solid',
    p: 1,
    bgcolor: 'background.paper',
  };

  return (
    <div onMouseEnter={handleClick}>
        <ClickAwayListener onClickAway={handleClickAway}>
          <Box sx={{ position: 'relative' }}>
            <div style={{cursor:"pointer",color:"white"}}>
              {title}
            </div>
            {open ? (
              <Box sx={styles}>
                {items.map((e) => { 
                    if (e.v(currentUser)) { 
                        return(
                            <MenuItem onClick={() => handleAction(e.a)} id={e.n}>{e.n}</MenuItem>
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
