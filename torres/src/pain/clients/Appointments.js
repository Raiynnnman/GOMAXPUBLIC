import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Grid,
  IconButton,
  Drawer,
  Button
} from '@mui/material';
import { withRouter } from 'react-router-dom';
import Add from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';
import Navbar from '../../components/Navbar';
import AppSpinner from '../utils/Spinner';
import { getAppointments } from '../../actions/appointments';
import ChatUser from '../chatUser/ChatUser';

const spinnerContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
};

class Appointments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null,
      openDrawer: false,
      selectedAppointment: null,
      error: false,
    };
  }

  componentDidMount() {
    const { match, dispatch } = this.props;
    if (match.params && match.params.id) {
      this.setState({ selected: match.params.id });
      dispatch(getAppointments({ uuid: null, id: match.params.id }));
    } else {
      dispatch(getAppointments({}));
    }
  }

  handleChatClick = (appointment) => {
    this.setState({ openDrawer: true, selectedAppointment: appointment });
  };

  handleDrawerClose = () => {
    this.setState({ openDrawer: false, selectedAppointment: null });
  };

  render() {
    const { appointments } = this.props;
    const { openDrawer, selectedAppointment } = this.state;
    if (appointments.isReceiving) {
      return (
        <div style={spinnerContainerStyle}>
          <AppSpinner />
        </div>
      );
    }

    const appointmentsData = appointments?.appt ?? [];
    const upcomingAppointments = appointmentsData.filter(appt => new Date(appt.date) >= new Date());

    return (
      <>
        <Navbar />
        <Container sx={{ mt: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            Appointments
          </Typography>
          {appointmentsData.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Physician</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Chat</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointmentsData.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.profile[0].first_name}{" "}{appointment.profile[0].last_name}</TableCell>
                      <TableCell>{appointment.office_name}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => this.handleChatClick(appointment)}
                        >
                          <ChatIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography mt={2} align="center" color="text.secondary">
              No appointments available.
            </Typography>
          )}
          <Box mt={4}>
            <Typography sx={{ mb: 2 }} variant="h4" component="h2" fontWeight="bold" gutterBottom>
              Upcoming Appointments
            </Typography>
            <Grid container spacing={2}>
              {upcomingAppointments.map((appointment) => (
                <Grid item xs={12} sm={6} md={4} key={appointment.id}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2,
                      transition: 'transform 0.3s, background-color 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        backgroundColor: 'orange',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                      },
                    }}
                  >
                    <Typography variant="h6" component="div">
                      {appointment.date}
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      {appointment.time || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      {appointment.physician}
                    </Typography>
                    <Typography variant="body2">
                      {appointment.office_name}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
        <Drawer
          anchor="right"
          open={openDrawer}
          onClose={this.handleDrawerClose}
        >
          <Box
            sx={{
              width: 1000,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {selectedAppointment && (
              <Box sx={{ width: 1000, height: 1000, overflow: 'auto' }}>
                <ChatUser appt={selectedAppointment.appt_id} />
              </Box>
            )}
          </Box>
        </Drawer>
      </>
    );
  }
}

Appointments.defaultProps = {
  appointments: { appt: [], isReceiving: false },
};

function mapStateToProps(store) {
  return {
    currentUser: store.auth.currentUser,
    appointments: store.appointments.data,
  };
}

export default withRouter(connect(mapStateToProps)(Appointments));
