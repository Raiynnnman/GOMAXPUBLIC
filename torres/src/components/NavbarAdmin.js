import React, { useState, Component, useEffect } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import DropdownMenu from './DropdownMenu';
import { logoutUser } from '../actions/auth';
import { delContext } from '../actions/delContext';

function NavbarAdmin({onChange,currentUser,dispatch}) {

    const [value,onValueChange] = useState('');

    const profileItems = [
        {n:'Leave Context',
         v:function(c) { 
            console.log("val",c.context);
            return (c.context ? true : false)
         },
         a:function() { 
            this.props.dispatch(delContext({},function(err,args) { 
                localStorage.removeItem("context");
                window.location.href = '/index.html';
            }));
         },
         u:'/'},
        {n:'Logout',
         a:function(t) { 
            dispatch(logoutUser());
         },
         v:function(c) { 
            return true;
         },
         u:'/'},
    ]

    useEffect(() => { 
    },[]);
    
    return (
        <div className="col-lg-8 d-none d-lg-block">
            <div className="mainmenu-wrapper">
                <nav>
                    <ul className="main-menu">
                        <li className="active"><a href="/">Home</a></li>
                        <li>
                            <DropdownMenu currentUser={currentUser} 
                                title={currentUser.email} items={profileItems} dispatch={dispatch}/>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}

export default NavbarAdmin;
