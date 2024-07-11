import React, { useState, Component, useEffect } from 'react';
import moment from 'moment';
import googleKey from '../../googleConfig';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { Providers } from "@microsoft/mgt-element";
import { Login, Agenda, useIsSignedIn, Planner } from '@microsoft/mgt-react';
import crmSSOConfig from '../../crmSSOConfig';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TemplateButton from '../utils/TemplateButton';
import {addMinutes, compareAsc, format, getMinutes, setSeconds} from 'date-fns';
import Calendar from '../microsoft/Calendar';
import Welcome from '../microsoft/Welcome';
import NewEvent from '../microsoft/NewEvent';
import ProvideAppContext from '../microsoft/AppContext';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { msalConfig } from './authConfig';

const msalInstance = new PublicClientApplication(msalConfig);

function Office365SSO({onChange,showWelcome,showCalendar,showNewEvent,onCancelEvent,onCreateEvent,data,currentUser,client}) {

    return (
    <>
        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
        <>
            <MsalProvider instance={msalInstance}>
                <ProvideAppContext>
                    {showWelcome && (<Welcome/>)}
                    {showCalendar && (<Calendar/>)}
                    {showNewEvent && (<NewEvent onCreateEvent={onCreateEvent} currentUser={currentUser} 
                        onCancelEvent={onCancelEvent} client={client} data={data}/>)}
                </ProvideAppContext>
            </MsalProvider>
        </>
        </div>
    </>
    )
}

export default Office365SSO;
