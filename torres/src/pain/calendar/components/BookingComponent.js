import dayjs from 'dayjs';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import React, { useState, useEffect, useRef } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { Grid, Button, TextField } from '@mui/material';
import { CalendarToday, Phone } from '@mui/icons-material';
import TemplateTextFieldPhone from '../../utils/TemplateTextFieldPhone';
import TemplateTextArea from '../../utils/TemplateTextArea';
import TemplateTextField from '../../utils/TemplateTextField';
import { useDispatch } from 'react-redux';
import { calendarBackendBooking } from '../../../actions/calendarBackendBooking';
// import { createMeeting } from '../../../actions/createMeeting';


export default function BookingComponent() {

    const timeZoneIANA = Intl.DateTimeFormat().resolvedOptions().timeZone;
    function fakeFetch(date, { signal }) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          const daysInMonth = date.daysInMonth();
          var c = 0;
          var daysToHighlight = [] 
          var d = new Date().getDate();
          for (c = 0; c < daysInMonth; c++) { 
                if (c >= d) { 
                    daysToHighlight.push(c);
                } 
          } 
          resolve({ daysToHighlight });
        }, 500);

        signal.onabort = () => {
          clearTimeout(timeout);
          reject(new DOMException('aborted', 'AbortError'));
        };
      });
    }
    const initialValue = dayjs(new Date());
    function ServerDay(props) {
      const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
      const isSelected = !props.outsideCurrentMonth && highlightedDays.indexOf(props.day.date()) >= 0;

      return (
        <Badge key={props.day.toString()} overlap="circular" badgeContent={isSelected ? '' : undefined}>
          <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
        </Badge>
      );
    }
    const dispatch = useDispatch();
    const requestAbortController = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedDays, setHighlightedDays] = useState([]);
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [thanks, setThanks] = useState(false);
    const [description, setDescription] = useState('');
    const [selectedDate, setSelectedDate] = useState(initialValue);
    const [selectedUser, setSelectedUser] = useState({
        name: ' ',
        profileImage: '',
        email: ''
      });
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const fetchHighlightedDays = (date) => {
        const controller = new AbortController();
        fakeFetch(date, { signal: controller.signal })
          .then(({ daysToHighlight }) => {
            setHighlightedDays(daysToHighlight);
            setIsLoading(false);
          })
          .catch((error) => {
            if (error.name !== 'AbortError') {
              throw error;
            }
          });

        requestAbortController.current = controller;
    };
    useEffect(() => {
        fetchHighlightedDays(initialValue);
        return () => requestAbortController.current?.abort();
    }, []);

    const onEmailChange = (e) => { 
        setEmail(e.target.value)
    } 
    const onPhoneChange = (e) => { 
        setPhone(e.target.value)
    } 
    const onDescriptionChange = (e) => { 
        setDescription(e.target.value)
    } 

    const handleMonthChange = (date) => {
        if (requestAbortController.current) {
          requestAbortController.current.abort();
        }

        setIsLoading(true);
        setHighlightedDays([]);
        fetchHighlightedDays(date);
    };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // dispatch(findMeetingTimes(date));
    // Fake fetch available times for the selected date
    setAvailableTimes(['09:00 AM', '9:30 AM', '10:00 AM', '10:30 PM', '11:00 PM', '11:30 PM', '12:00 AM', '12:30 AM', '1:00 AM', '1:30 PM', '2:00 PM', '2:30 PM']);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setShowForm(true);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      email: email,
      phone: phone,
      description: description,
      date: selectedDate,
      timezone:timeZoneIANA,
      tz_offset:new Date(selectedDate).getTimezoneOffset(),
      time: selectedTime,
    };
    // Process the form data (e.g., send to the server)
    dispatch(calendarBackendBooking(data));
    setThanks(true);
  };

  const handleBack = () => {
    setShowForm(false);
  };

    return (
    <>
    <Card sx={{ display: 'flex', flexDirection: 'column', height: 'auto', maxWidth: 600, margin: 'auto', mt: 4, borderRadius: 5, p: 2 }}>
      <CardContent>
        <>
        {(thanks) && (
            <>
                <div style={{display:"flex",justifyContent:"center"}}>
                    <h4>You are scheduled</h4>
                </div>
                <div style={{display:"flex",justifyContent:"center"}}>
                    <Typography>A calendar invitation has been sent to your email address</Typography>
                </div>
            </>
        )}
        {(!thanks) && (
        <>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
              <Grid item>
                <Avatar alt="Profile Image" src={selectedUser.profileImage} sx={{ width: 56, height: 56 }} />
              </Grid>
              <Grid item xs>
                <Typography variant="h6">{selectedUser.name}</Typography>
                <Typography variant="subtitle1">POUND PAIN TECH - Patient Referral Introduction</Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
              <Grid item>
                <CalendarToday />
              </Grid>
              <Grid item>
                <Typography variant="body2">30 min</Typography>
              </Grid>
              <Grid item>
                <Phone />
              </Grid>
              <Grid item>
                <Typography variant="body2">Phone call</Typography>
              </Grid>
            </Grid>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
    Pound Pain Tech stands as a beacon of support for healing within the realm of injury care, proudly boasting its position as the largest injury care community. With a steadfast commitment to alleviating pain and fostering recovery, Pound Pain Tech has seamlessly integrated cutting-edge technology with compassionate care. 

     

    Serving as a comprehensive resource hub, it offers a multitude of services ranging from telemedicine consultations to rehabilitation programs, all designed to cater to the diverse needs of its members. Through collaborative efforts and a network of seasoned professionals, Pound Pain Tech ensures that individuals navigating the challenging landscape of personal injury find solace, guidance, and a pathway toward restored well-being.

     

    As a care connection service, our team is excited to introduce you to our growing community with a hyper-focused intro call. The team will call you at the designated time you schedule! Have a fantastic day ahead.
            </Typography>
            {showForm ? (
              <form onSubmit={handleFormSubmit}>
                <TemplateTextField
                  name="email"
                  label="Email Address"
                  fullWidth
                  onChange={onEmailChange}
                  value={email}
                  required
                  sx={{ mt: 2 }}
                />
                <TemplateTextFieldPhone
                  name="phone"
                  label="Phone Number"
                  value={phone}
                  onChange={onPhoneChange}
                  fullWidth
                  required
                  sx={{ mt: 2 }}
                />
                <TemplateTextArea
                  name="description"
                  rows={4}
                  label="Description"
                  value={description}
                  onChange={onDescriptionChange}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  sx={{ mt: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Submit
                </Button>
              </form>
            ) : (
              <>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={selectedDate}
                    onChange={handleDateChange}
                    loading={isLoading}
                    onMonthChange={handleMonthChange}
                    renderLoading={() => <DayCalendarSkeleton />}
                    slots={{ day: ServerDay }}
                    slotProps={{ day: { highlightedDays } }}
                    sx={{ width: '100%', mt: 2 }}
                  />
                </LocalizationProvider>
                {selectedDate && !showForm && (
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {availableTimes.map((time) => (
                      <Grid item key={time}>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={() => handleTimeSelect(time)}
                        >
                          {time}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
            {showForm && (
            <>
              <Button
                onClick={handleBack}
                variant="contained"
                color="warning"
                sx={{ mt: 2 }}
              >
                Back
              </Button>
                <Typography style={{marginTop:20}}>
By entering your phone number, you consent to receive messages for this event via SMS. Message and data rates may apply. Reply STOP to opt out.
                </Typography>
            </>
            )}
        </>
        )}
        </>
      </CardContent>
    </Card>
    </>
    );
}
