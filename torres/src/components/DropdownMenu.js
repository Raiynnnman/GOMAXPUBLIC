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

  console.log("i1",items);
  console.log("i2",title);
  return (
    <div onMouseEnter={handleClick} style={{marginLeft:10}}>
        <ClickAwayListener onClickAway={handleClickAway}>
          <Box sx={{ position: 'relative',backgroundColor:'black'}}>
            {(currentUser) && (
                <div style={{cursor:"pointer",color:"white",fontWeight:'bold',fontSize:12}}>
                  {title}{currentUser.context && currentUser.contextValue ? " - " + currentUser.contextValue.name:'' }
                </div>
            )}
            {open ? (
              <Box sx={{ position: 'absolute', top: 28, width:180,
                        right: 0, left: -100, border: '1px solid', p: 1, zIndex:9999,
                        bgcolor: 'black' }}>
                {items.map((e) => { 
                    if (e.v(currentUser)) { 
                        return(
                            <MenuItem style={{fontWeight:'bold',background:'black',color:'white'}} 
                            onClick={() => handleAction(e.a)} id={e.n}>
                                {e.n}
                            </MenuItem>
                        )
                    } else { 
                        return (<></>)
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
