// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// <NewEventSnippet>
import { useEffect, useState } from 'react';
// import { NavLink as RouterNavLink, Navigate } from 'react-router-dom';
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

const NewEvent = ({data,onCreateEvent,onCancelEvent}) => {
  const app = useAppContext();
  console.log("oc",onCreateEvent);

  const [subject, setSubject] = useState('');
  const [attendees, setAttendees] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [startFormatted, setStartFormatted] = useState('');
  const [endFormatted, setEndFormatted] = useState('');
  const [body, setBody] = useState('');
  const [formDisabled, setFormDisabled] = useState(true);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    setFormDisabled(
      subject.length === 0); //||
      //start.length === 0 ||
      //end.length === 0);
  }, [subject, start, end]);
  const timeZoneIANA = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log("tz",timeZoneIANA);

  const attendeUpdate = (e) => { 
    console.log(e.target.value);
  } 
  const setStartDate = (e) => { 
    setStart(e);
    setStartFormatted(e.format('YYYY/MM/DDThh:mm'));
  } 
  const setEndDate = (e) => { 
    setEnd(e);
    setEndFormatted(e.format('YYYY/MM/DDThh:mm'));
  } 

  console.log(new Date().toTimeString().slice(9));
  console.log("s",start,"e",end)

  const cancel = () => { 

  } 

  const doCreate = async () => {
    console.log("starting...");
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
    console.log(start,end)

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
        await createEvent(app.authProvider!, newEvent);
        // setRedirect(true);
        onCreateEvent(data,newEvent);
    } catch (err) {
      console.log("err",err)
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
                    <Grid container xs={12} style={{marginTop:10}}>
                        <Grid item xs={12}>
                            <TextField multiline label="Body" style={{width:"100%"}} minRows={5} value={body} onChange={(ev) => setBody(ev.target.value)} />
                        </Grid>
                    </Grid>
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
    {/*
    <Form>
      <Form.Group>
        <Form.Label>Subject</Form.Label>
        <Form.Control type="text"
          name="subject"
          id="subject"
          className="mb-2"
          value={subject}
          onChange={(ev) => setSubject(ev.target.value)} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Attendees</Form.Label>
        <Form.Control type="text"
          name="attendees"
          id="attendees"
          className="mb-2"
          placeholder="Enter a list of email addresses, separated by a semi-colon"
          value={attendees}
          onChange={(ev) => setAttendees(ev.target.value)} />
      </Form.Group>
      <Grid container className="mb-2">
        <Grid item sx="12">
          <Form.Group>
            <Form.Label>Start</Form.Label>
            <Form.Control type="datetime-local"
              name="start"
              id="start"
              value={start}
              onChange={(ev) => setStart(ev.target.value)} />
          </Form.Group>
        </Grid>
        <Grid item sx="12">
          <Form.Group>
            <Form.Label>End</Form.Label>
            <Form.Control type="datetime-local"
              name="end"
              id="end"
              value={end}
              onChange={(ev) => setEnd(ev.target.value)} />
          </Form.Group>
        </Grid>
      </Grid>
      <Form.Group>
        <Form.Label>Body</Form.Label>
        <Form.Control as="textarea"
          name="body"
          id="body"
          className="mb-3"
          style={{ height: '10em' }}
          value={body}
          onChange={(ev) => setBody(ev.target.value)} />
      </Form.Group>
      <Button color="primary"
        className="me-2"
        disabled={formDisabled}
        onClick={() => doCreate()}>Create</Button>
      <RouterNavLink to="/calendar"
        className="btn btn-secondary"
      >Cancel</RouterNavLink>
    </Form>
    */}
    </>
  );
}
// </NewEventSnippet>

export default NewEvent;
