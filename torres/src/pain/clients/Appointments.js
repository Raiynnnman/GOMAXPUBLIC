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
  Modal,
  Button
} from '@mui/material';
import { withRouter } from 'react-router-dom';
import Add from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';
import Navbar from '../../components/Navbar';
import AppSpinner from '../utils/Spinner';
import { createAppointment } from '../../actions/appointments';

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
      openModal: false,
      formValues: {
        customerId:'',
        dateOfAccident: '',
        description: '',
        hospital: '',
        ambulance: '',
        witnesses: '',
        repLawEnforcement: '',
        policeReportNum: '',
        citations: '',
        citationsPerson: '',
        passengers: '',
        defInsurance: '',
        defClaimNum: '',
        defName: '',
        insInfo: '',
        insClaimNum: '',
        insPolicyHolder: '',
        caseNum: '',
        picsOfDamage: '',
        clientIntakeStatusId: '',
        attnyName: '',
        officeTypeId: '',
      },
      error: false,
    };
  }

  componentDidMount() {
    const { match, dispatch } = this.props;
    if (match.params && match.params.id) {
      this.setState({ selected: match.params.id });
      // dispatch(fetchAppointments({ uuid: null, id: match.params.id }));
    } else {
      // dispatch(fetchAppointments({}));
    }
    console.log(this.state);
  }

  handleOpenModal = () => {
    this.setState({ openModal: true });
  };
  
  handleCloseModal = () => {
    this.setState({ openModal: false, error: false });
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      formValues: {
        ...prevState.formValues,
        [name]: value,
      },
    }));
  };

  handleProviderSelect = (provider, currentUserId) => {
    this.setState((prevState) => ({
      formValues: {
        ...prevState.formValues,
        userId: provider.id,
        customerId: currentUserId,
      },
      openModal: false,
    }));
  };

  handleCreateAppointment = (formValues) => {
    const { currentUser, dispatch } = this.props;
    // console.log("Look",this.props)
    // this.props.dispatch(loginUser({ email: this.state.email, password: this.state.password }));
    console.log('Creating appointment with values:', formValues); // Add this line to log form values
    
        createAppointment(formValues, (err) => {
            if (!err) {
                console.log('Appointment created successfully');  
                this.handleCloseModal();
            } else {
                console.error('Failed to create appointment:', err);
            }
        });
    };

  handleChatClick = (appointment) => {
    const { history } = this.props;
    history.push({
      pathname: `/app/main/client/chat`,
      state: { appointment }
    });
  };

  render() {
    const { openModal, formValues, error } = this.state;
    const { appointments } = this.props;

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
          {/* <Box mb={2} display="flex" justifyContent="space-between">
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={this.handleOpenModal}
            >
              Create Appointment
            </Button>
          </Box>
          <Modal open={openModal} onClose={this.handleCloseModal}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 600,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: '16px',
              }}
            >
              <Typography id="create-appointment-title" variant="h6" component="h2">
                Create Appointment
              </Typography>
              <Typography id="create-appointment-description" sx={{ mt: 2 }}>
                Fill in the details to create an appointment.
              </Typography>
              <StepForm
                formValues={formValues}
                handleChange={this.handleInputChange}
                handleSubmit={() => this.handleCreateAppointment(formValues)}
              />
            </Box>
          </Modal> */}
          {appointmentsData.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Physician</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Chat</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointmentsData.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.date}</TableCell>
                      <TableCell>{appointment.time || 'N/A'}</TableCell>
                      <TableCell>{appointment.physician}</TableCell>
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
            <Typography sx={{mb:2}} variant="h4" component="h2" fontWeight="bold" gutterBottom>
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
      </>
    );
  }
}

Appointments.defaultProps = {
  appointments: { appt: [], isReceiving: false },
};

const mapDispatchToProps = {
  createAppointment,
};

function mapStateToProps(store) {
  return {
    currentUser: store.auth.currentUser,
    appointments: store.appointments.data,
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Appointments));
