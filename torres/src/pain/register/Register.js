import React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { MuiTelInput } from 'mui-tel-input';
import { registerUser } from '../../actions/registerUser';
import Navbar from '../../components/Navbar';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://poundpain.com">
        PoundPain
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#FFA500',
    },
  },
  typography: {
    fontFamily: "'Montserrat', sans-serif",
  },
});

class Register extends React.Component {
  state = {
    value: '',
    userType: '',
  };

  handleChange = (newValue) => {
    this.setState({ value: newValue });
  };

  handleUserTypeChange = (event) => {
    this.setState({ userType: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const creds = {
      phone: this.state.value,
      email: data.get('email'),
      first_name: data.get('first_name'),
      last_name: data.get('last_name'),
      zipcode: data.get('zip_code'),
      userType: this.state.userType,
    };
    this.props.dispatch(registerUser(creds));
    this.props.history.push({
      pathname: '/login',
    });
  };

  render() {
    return (
      <ThemeProvider theme={defaultTheme}>
        <Navbar/>
        <CssBaseline />
        <Box sx={{ height: '100vh', background: 'linear-gradient(to right, #fff7e6, #ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <Grid container justifyContent="center" alignItems="center" sx={{ width: '100%', maxWidth: '768px', padding: 2 }}>
            <Paper
              elevation={12}
              sx={{
                width: '100%',
                padding: { xs: 2, sm: 4, md: 6 },
                borderRadius: '30px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.35)',
                backgroundColor: '#fff',
              }}
            >
              <Typography variant="h6" align="center" gutterBottom>
                Sign up to Pound Pain Tech
              </Typography>
              <Typography variant="body1" align="center" paragraph>
                Please fill out this form, and we'll send you a welcome email so you can verify your email address and sign in.
              </Typography>
              <Box component="form" noValidate onSubmit={this.handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="first_name"
                  label="First Name"
                  name="first_name"
                  autoComplete="first_name"
                  autoFocus
                  sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="last_name"
                  label="Last Name"
                  name="last_name"
                  autoComplete="last_name"
                  sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                />
                <MuiTelInput
                  value={this.state.value}
                  onChange={this.handleChange}
                  required
                  fullWidth
                  margin="normal"
                  defaultCountry="US"
                  sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="zip_code"
                  label="Zip Code"
                  name="zip_code"
                  autoComplete="zip_code"
                  sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                />
                <Select
                  value={this.state.userType}
                  onChange={this.handleUserTypeChange}
                  displayEmpty
                  fullWidth
                  sx={{ marginTop: 2, marginBottom: 2, backgroundColor: '#eee', borderRadius: '8px' }}
                >
                  <MenuItem value="" disabled>
                    Who are you?
                  </MenuItem>
                  <MenuItem value="Legal">Legal</MenuItem>
                  <MenuItem value="Provider">Provider</MenuItem>
                  <MenuItem value="User">User</MenuItem>
                </Select>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ borderRadius: 8, backgroundColor: '#512da8', color: '#fff', padding: '10px 45px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}
                  >
                    Register
                  </Button>
                </Box>
                <Box mt={2}>
                  <Copyright />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Box>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = (state) => ({});

export default withRouter(connect(mapStateToProps)(Register));
