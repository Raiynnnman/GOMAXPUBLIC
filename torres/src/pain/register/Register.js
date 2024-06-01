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
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import favicon from '../../assets/images/logo/favicon.png';
import { MuiTelInput } from 'mui-tel-input';
import { registerUser } from '../../actions/registerUser';
import logo from '../../assets/images/logo/logo.png';
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
});

class Register extends React.Component {
  state = {
    value: '',
  };

  handleChange = (newValue) => {
    this.setState({ value: newValue });
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
    };
    console.log(creds);
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
        <Grid
          container
          alignItems="center"
          justifyContent='right'
          sx={{
            height: '100vh',
            backgroundImage: `url(${logo})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain, cover',
          }}
        >
          <Grid item xs={12} sm={8} md={6} marginRight={-40} >
            <Paper
              elevation={12}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 10,
                borderRadius: 10,
                width:600
              }}
            >
              <Avatar src={favicon} sx={{ m: 2, width: 100, height: 100 }} />
              <Typography variant="h6" gutterBottom>
                Sign up to Pound Pain Tech
              </Typography>
              <Typography variant="body1" paragraph>
                Please fill out this form, and we'll send you a welcome email so you can verify your email address
                and sign in.
              </Typography>
              <Box component="form" noValidate onSubmit={this.handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="first_name"
                  label="First Name"
                  name="first_name"
                  autoComplete="first_name"
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="last_name"
                  label="Last Name"
                  name="last_name"
                  autoComplete="last_name"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                />
                <MuiTelInput
                  value={this.state.value}
                  onChange={this.handleChange}
                  required
                  fullWidth
                  margin="normal"
                  defaultCountry="US"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="zip_code"
                  label="Zip Code"
                  name="zip_code"
                  autoComplete="zip_code"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3 }}
                >
                  Register
                </Button>
                <Box mt={2}>
                  <Copyright />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = (state) => ({});

export default withRouter(connect(mapStateToProps)(Register));
