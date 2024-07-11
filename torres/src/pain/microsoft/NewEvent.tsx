// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// <NewEventSnippet>
import { useEffect, useState } from 'react';
// import { NavLink as RouterNavLink, Navigate } from 'react-router-dom';
import TemplateWebEditor from '../utils/TemplateWebEditor';

import moment from 'moment';
import { Attendee, Event } from '@microsoft/microsoft-graph-types';
import { Grid, Typography, Paper, Box, TextField, Divider, Button } from '@mui/material';
import Datetime from 'react-datetime';

import { createEvent } from './GraphService';
import { useAppContext } from './AppContext';
import "react-datetime/css/react-datetime.css";

const buttonStyle = {
    backgroundColor: '#fa6a0a',
    color: 'white',
    '&:hover': {
        backgroundColor: '#e55d00',
    },
    borderRadius: '10px',
    padding: '8px 16px',
    width: '100%',
    textTransform: 'none',
    marginTop: '12px'
};

const cardStyle = {
    height: '100%',
    marginBottom:12,
    borderRadius:5,
    '&:hover': {
        backgroundColor: '#FFFAF2',
    },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '16px',
    boxSizing: 'border-box'
};

const NewEvent = ({data,onCreateEvent,onCancelEvent,currentUser,client}) => {
  const app = useAppContext();

  const [subject, setSubject] = useState('');
  const [attendees, setAttendees] = useState(
        currentUser.email + ";" + 
        client.email + ';' + client.commission_email + ';' 
    );
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [startFormatted, setStartFormatted] = useState('');
  const [endFormatted, setEndFormatted] = useState('');
  const [body, setBody] = useState('');
  const [formDisabled, setFormDisabled] = useState(true);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    setFormDisabled(
      subject.length === 0 || 
      startFormatted.length === 0 ||
      endFormatted.length === 0);
  }, [subject, start, end, body]);
  const timeZoneIANA = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const setBodyValue = (e) => { 
    setBody(e);
  } 

  const attendeUpdate = (e) => { 
  } 

  const setStartDate = (e) => { 
    if (!e.format) { return; }
    setStart(e);
    setStartFormatted(e.format('YYYY/MM/DDThh:mm'));
    var t = moment(e);
    setEndDate(t.add(moment.duration(15,'minutes')))
  } 
  const setEndDate = (e) => { 
    if (!e.format) { return; }
    setEnd(e);
    setEndFormatted(e.format('YYYY/MM/DDThh:mm'));
  } 


  const cancel = () => { 

  } 

  const doCreate = async () => {
    const attendeeEmails = attendees.split(';');
    const attendeeArray: Attendee[] = [];

    attendeeEmails.forEach((email) => {
      if (email.length > 0) {
        attendeeArray.push({
          emailAddress: {
            address: email
          }
        });
      }
    });

    const newEvent: Event = {
      subject: subject,
      // Only add if there are attendees
      attendees: attendeeArray.length > 0 ? attendeeArray : undefined,
      // Specify the user's time zone so
      // the start and end are set correctly
      start: {
        dateTime: startFormatted,
        timeZone: timeZoneIANA
      },
      isOnlineMeeting: true,
      end: {
        dateTime: endFormatted,
        timeZone: timeZoneIANA
      },
      // Only add if a body was given
      body: body.length > 0 ? {
        contentType: 'text',
        content: body
      } : undefined
    };

    try {
        console.log("ne",newEvent);
        var r = await createEvent(app.authProvider!, newEvent);
        data['server_response'] = r;
        // setRedirect(true);
        onCreateEvent(data,newEvent);
    } catch (err) {
      console.error(err);
      app.displayError!('Error creating event', JSON.stringify(err));
    }
  };

  if (redirect) {
    // return <Navigate to="/calendar" />
  }
  return (
    <>
        <Box sx={{ mt: 3 }} style={{width:'100%'}}>
            <Paper elevation={3} sx={cardStyle}>
                <Box style={{width:'100%'}}>
                    <Grid container xs={12} style={{marginTop:10}}>
                        <Grid item xs={12}>
                            <h5>New Event</h5>
                        </Grid> 
                    </Grid>
                    <Grid container xs={12} style={{marginTop:10}}>
                        <Grid item xs={12}>
                            <TextField label="Subject" style={{width:"100%"}} value={subject} onChange={(ev) => setSubject(ev.target.value)} />
                        </Grid>
                    </Grid>
                    <Grid container xs={12} style={{marginTop:10}}>
                        <Grid item xs={12}>
                            <TextField label="Attendees" style={{width:"100%"}} value={attendees} onChange={(ev) => setAttendees(ev.target.value)} />
                        </Grid>
                    </Grid>
                    <Grid container xs={12} style={{marginTop:10}}>
                        <Grid item xs={12}>
                            <Datetime onChange={setStartDate} value={start} />
                        </Grid>
                    </Grid>
                    <Grid container xs={12} style={{marginTop:10}}>
                        <Grid item xs={12}>
                            <Datetime onChange={setEndDate} value={end} />
                        </Grid>
                    </Grid>
                    {/*<Grid container xs={12} style={{marginTop:10,height:400}}>
                        <Grid item xs={12}>
                            <TemplateWebEditor
                                onSave={setBodyValue}
                                value={body} />
                        </Grid>
                    </Grid>*/}
                    <Grid container xs={12} style={{marginTop:10}}>
                        <Grid item xs={12}>
                          <Button color="primary"
                            className="me-2"
                            disabled={formDisabled}
                            onClick={() => doCreate()}>Create</Button>
                          <Button color="primary"
                            className="me-2"
                            onClick={() => cancel()}>Cancel</Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    </>
  );
}
// </NewEventSnippet>

export default NewEvent;
