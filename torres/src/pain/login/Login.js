import React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { registerUser } from '../../actions/registerUser';
import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';
import { loginUser, receiveToken, doInit } from '../../actions/auth';

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

class Login extends React.Component {
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
      email: data.get('email'),
      password: data.get('password'),
    };
    this.props.dispatch(loginUser(creds));
    this.props.history.push({
      pathname: '/login',
    });
  };

  componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);
    const token = params.get('token');
    if (token) {
      this.props.dispatch(receiveToken(token));
      this.props.dispatch(doInit());
    }
  }

  render() {
    return (
      <ThemeProvider theme={defaultTheme}>
        <Navbar />
        <CssBaseline />
        <Box sx={{ height: '50vh', background: 'linear-gradient(to right, #fff7e6, #ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
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
              <Grid container spacing={2}>
                <Grid item xs={12} md={6} sx={{ borderRight: { md: '1px solid #eee' }, pr: { xs: 0, md: 2 } }}>
                  <Box component="form" noValidate onSubmit={this.handleSubmit} sx={{ mt: 1 }}>
                    {this.props.errorMessage && ( 
                        <h4 style={{color:'red'}}>{this.props.errorMessage}</h4>
                    )}
                    <Typography variant="h6" align="center" gutterBottom>
                      Login
                    </Typography>
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
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="password"
                      label="Password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{ borderRadius: 8, backgroundColor: '#FF5733', color: '#fff', padding: '10px 45px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}
                      >
                        Login
                      </Button>
                    </Box>
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Forgot password? <Link to="/forgot">Reset here</Link>
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: { xs: 4, md: 0 } }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" align="center" gutterBottom>
                      Create an Account
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ borderRadius: 8, backgroundColor: '#FF5733', color: '#fff', padding: '10px 45px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}
                      onClick={() => this.props.history.push('/register')}
                    >
                      Sign Up
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Box>
      </ThemeProvider>
    );
  }
}

function mapStateToProps(state) {
    return {
        isFetching: state.auth.isFetching,
        isAuthenticated: state.auth.isAuthenticated,
        errorMessage: state.auth.errorMessage,
        auth: state.auth
    };
}

export default withRouter(connect(mapStateToProps)(Login));
