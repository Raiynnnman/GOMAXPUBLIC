import React, { useState, Component, useEffect } from 'react';
import moment from 'moment';
import googleKey from '../../googleConfig';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { Providers } from "@microsoft/mgt-element";
import { Msal2Provider } from "@microsoft/mgt-msal2-provider";
import { Login, Agenda, useIsSignedIn, Planner } from '@microsoft/mgt-react';
import crmSSOConfig from '../../crmSSOConfig';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TemplateButton from '../utils/TemplateButton';
import {addMinutes, compareAsc, format, getMinutes, setSeconds} from 'date-fns';
import Calendar from '../microsoft/Calendar';
import Welcome from '../microsoft/Welcome';


Providers.globalProvider = new Msal2Provider({
  clientId: crmSSOConfig(),
  scopes: ['tasks.ReadWrite','tasks.read',
           'mail.ReadWrite','mail.read', 
           'calendars.readwrite','calendars.read', 
           'user.read', 'openid', 'profile', 'people.read', 'user.readbasic.all']
});

const GRAPH_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

function Office365SSO({onChange}) {

    const formatTime = (dateTime: Date): string => {
      return format(dateTime, 'h:mm a');
    };

    const formatDate = (dateTime: Date): string => {
      return format(dateTime, 'MMM d, yyyy');
    };

    const [ isSignedIn ] = useIsSignedIn();

    /*async function createEvent() { 
        var emails = ['paul@poundpain.com'];
        var s = new Date.now();
        var s1 = moment(s).add(30, 'm').toDate();
        var e = moment(s1).add(30, 'm').toDate();
        var newEvent: MicrosoftGraph.Event = { 
            subject:'Testme',
            content:'OMMGGGGG',
            attendees:[],
            start: { 
                dateTime:format(s1, GRAPH_DATETIME_FORMAT)
            }, 
            end: { 
                dateTime:format(e, GRAPH_DATETIME_FORMAT)
            } 
        } 
        var c = 0;
        for (c=0;c<emails.length;c++) { 
            var email = emails[c];
            newEvent.attendees.push({ emailAddress: {address: email} });
        } 
        await GraphManager.createEvent(newEvent);
    } */

    return (
    <>
        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
        <>
            {!isSignedIn && <Login />}
            {isSignedIn && (
            <>
                {/*<Welcome/>*/}
                <Agenda groupByDay />
                <Planner/>
            </>
            )}
        </>
        </div>
    </>
    )
}

export default Office365SSO;
