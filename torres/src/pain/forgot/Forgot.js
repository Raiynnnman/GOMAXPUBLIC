import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { sendPasswordResetEmail } from '../../actions/auth';
import { getVersion } from '../../version';
import Navbar from '../../components/Navbar';
import TemplateTextField from '../utils/TemplateTextField';
import TemplateButton from '../utils/TemplateButton';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

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

class Forgot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      errorMessage: '',
    };

    this.changeEmail = this.changeEmail.bind(this);
    this.doSendResetEmail = this.doSendResetEmail.bind(this);
  }

  changeEmail(event) {
    const email = event.target.value;
    const emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    const isValid = emailRegex.test(email);

    this.setState({
      email,
      errorMessage: isValid ? '' : 'Invalid email format',
    });
  }

  doSendResetEmail(e) {
    e.preventDefault();
    if (this.state.errorMessage === '') {
      this.props.dispatch(sendPasswordResetEmail(this.state.email));
      window.location = '/login';
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
                <Grid item xs={12}>
                  <Typography variant="h6" align="center" gutterBottom>
                    Reset Password
                  </Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box component="form" noValidate onSubmit={this.doSendResetEmail} sx={{ mt: 1, width: '100%' }}>
                    <TemplateTextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email"
                      name="email"
                      autoComplete="email"
                      onChange={this.changeEmail}
                      sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                    />
                    {this.state.errorMessage && (
                      <Typography variant="body2" color="error" align="center">
                        {this.state.errorMessage}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{ borderRadius: 8, backgroundColor: '#FF5733', color: '#fff', padding: '10px 45px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}
                      >
                        Reset
                      </Button>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Remember your password? <Link to="/login">Login</Link>
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Box>
      </ThemeProvider>
    );
  }
}

Forgot.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  isFetching: state.auth.isFetching,
  errorMessage: state.auth.errorMessage,
});

export default withRouter(connect(mapStateToProps)(Forgot));
