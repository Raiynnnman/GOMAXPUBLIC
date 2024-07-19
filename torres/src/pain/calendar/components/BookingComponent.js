import dayjs from 'dayjs';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { Grid, Button, TextField } from '@mui/material';
import { CalendarToday, Phone } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { findMeetingTimes } from '../../../actions/findMeetingTimes';
import { createMeeting } from '../../../actions/createMeeting';
import React, { useState, useEffect, useRef } from 'react';

function getRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function fakeFetch(date, { signal }) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const daysInMonth = date.daysInMonth();
      const daysToHighlight = [1, 2, 3].map(() => getRandomNumber(1, daysInMonth));
      resolve({ daysToHighlight });
    }, 500);

    signal.onabort = () => {
      clearTimeout(timeout);
      reject(new DOMException('aborted', 'AbortError'));
    };
  });
}

const initialValue = dayjs('2022-04-17');

function ServerDay(props) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
  const isSelected = !props.outsideCurrentMonth && highlightedDays.indexOf(props.day.date()) >= 0;

  return (
    <Badge key={props.day.toString()} overlap="circular" badgeContent={isSelected ? '🌚' : undefined}>
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
}

export default function BookingComponent() {
  const dispatch = useDispatch();
  const requestAbortController = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState([1, 2, 15]);
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
      email: formData.get('email'),
      phone: formData.get('phone'),
      description: formData.get('description'),
      date: selectedDate,
      time: selectedTime,
    };
    // Process the form data (e.g., send to the server)
    console.log(data);
    // dispatch(createMeeting(data));
  };

  const handleUserChange = (e) => {
    const user = e.detail[0];
    if (user) {
      setSelectedUser({
        name: user.displayName,
        profileImage: user.personImage || 'profile-image-url.jpg',
        email: user.userPrincipalName
      });
    }
  };

  const handleBack = () => {
    setShowForm(false);
  };

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: 'auto', maxWidth: 600, margin: 'auto', mt: 4, borderRadius: 5, p: 2 }}>
      <CardContent>
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
          Pound Pain Tech stands as a beacon of support for healing within the realm of injury care, proudly boasting its position as the largest injury care community. With a steadfast commitment to alleviating pain and facilitating recovery, Pound Pain Tech...
        </Typography>
        {showForm ? (
          <form onSubmit={handleFormSubmit}>
            <TextField
              name="email"
              label="Email Address"
              fullWidth
              required
              sx={{ mt: 2 }}
            />
            <TextField
              name="phone"
              label="Phone Number"
              fullWidth
              required
              sx={{ mt: 2 }}
            />
            <TextField
              name="description"
              label="Description"
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
          <Button
            onClick={handleBack}
            variant="contained"
            color="warning"
            sx={{ mt: 2 }}
          >
            Back
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
