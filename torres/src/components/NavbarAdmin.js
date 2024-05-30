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

    const systemItems = [
        {
         n:'Providers',
         v:function(c) { 
            return true;
         },
         a:function() { 
            window.location = '/app/main/admin/providers';
         }
        },
        {
         n:'Invoices',
         v:function(c) { 
            return true;
         },
         a:function() { 
            window.location = '/app/main/admin/invoices';
         }
        },
        {
         n:'Commissions',
         v:function(c) { 
            return true;
         },
         a:function() { 
            window.location = '/app/main/admin/commissions';
         }
        },
        {
         n:'Coupons',
         v:function(c) { 
            return true;
         },
         a:function() { 
            window.location = '/app/main/admin/coupons';
         }
        },
        {
         n:'Plans',
         v:function(c) { 
            return true;
         },
         a:function() { 
            window.location = '/app/main/admin/plans';
         }
        },
        {
         n:'Users',
         v:function(c) { 
            return true;
         },
         a:function() { 
            window.location = '/app/main/admin/users';
         }
        },
    ];
    const profileItems = [
        {n:'Leave Context',
         v:function(c) { 
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
        <div className="col-lg-11 d-none d-lg-block">
            <div className="mainmenu-wrapper">
                <nav>
                    <ul className="main-menu">
                        <li className="active"><a href="/">Home</a></li>
                        <li><a href="/app/main/admin/search">Search</a></li>
                        <li><a href="/app/main/admin/customers">Customers</a></li>
                        <li><a href="/app/main/admin/one-pager">One Pager</a></li>
                        <li><a href="/app/main/admin/referrals">Referrals</a></li>
                        <li><a href="/app/main/admin/map">Map</a></li>
                        <li><a href="/app/main/admin/registrations">Registrations</a></li>
                        <li><a href="/app/main/admin/system">System</a></li>
                    </ul>
                </nav>
                <div style={{marginRight:20}}>
                <DropdownMenu currentUser={currentUser} 
                    title={currentUser.email} items={profileItems} dispatch={dispatch}/>
                </div>
            </div>
        </div>
    )
}

export default NavbarAdmin;
