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
import { registerProvider } from '../../actions/registerProvider';
import {siteType} from '../../siteType';

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
    addresses: [{ address: '', city: '', state: '', zipcode: '' }],
  };

  handleChange = (newValue) => {
    this.setState({ value: newValue });
  };

  handleUserTypeChange = (event) => {
      const userType = event.target.value;
      this.setState({ userType });
  
      if (userType.toLowerCase() === 'provider') {
        this.props.history.push('/register-provider');
      }
    };

  handleInputChange = (event, index) => {
    const { name, value } = event.target;
    const addresses = [...this.state.addresses];
    addresses[index][name] = value;
    this.setState({ addresses });
  };

  handleAddAddress = () => {
    this.setState({
      addresses: [...this.state.addresses, { address: '', city: '', state: '', zipcode: '' }]
    });
  };

  handleDeleteAddress = (index) => {
    const addresses = [...this.state.addresses];
    addresses.splice(index, 1);
    this.setState({ addresses });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const creds = {
      phone: this.state.value,
      email: data.get('email'),
      first_name: data.get('first_name'),
      last_name: data.get('last_name'),
      zipcode: data.get('zipcode'),
      userType: this.state.userType
    };

    const name = {
      name: creds.first_name + " " + creds.last_name
    };

    const addresses = this.state.addresses.map((address, index) => {
      return { [`addr${index + 1}`]: address };
    });

    const addressObj = addresses.reduce((acc, curr) => {
        const key = Object.keys(curr)[0];
        acc[key] = curr[key];
        return acc;
    }, {});

    switch (creds.userType.toLowerCase()) {
      case 'user':
        this.props.dispatch(registerUser(creds));
        break;
      case 'provider':
        const providerCreds = {
          phone: this.state.value,
          email: data.get('email'),
          name: name.name,
          // addresses: addressObj, // Dont include address object
        };
        this.props.dispatch(registerProvider(providerCreds));
        break;
      case 'legal':
        break;
      default:
        console.error("Invalid user type");
    }

    this.setState({ value: '', userType: '', addresses: [{ address: '', city: '', state: '', zipcode: '' }] });
    event.currentTarget.reset();
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
                maxHeight: '80vh',
                overflowY: 'auto',
                '::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar in WebKit-based browsers
                msOverflowStyle: 'none', // IE and Edge
                scrollbarWidth: 'none', // Firefox
              }}
            >
              <Typography variant="h6" align="center" gutterBottom>
                Sign up to POUNDPAIN TECH
              </Typography>
              <Typography variant="body1" align="center" paragraph>
                Please fill out this form, and we'll send you a welcome email so you can verify your email address and sign in.
              </Typography>
              
              <Box component="form" noValidate onSubmit={this.handleSubmit} sx={{ mt: 1 }}>
              <Select
                  value={this.state.userType}
                  onChange={this.handleUserTypeChange}
                  displayEmpty
                  fullWidth
                  autoFocus
                  sx={{ marginTop: 2, marginBottom: 2, backgroundColor: '#eee', borderRadius: '8px' }}
                >
                  <MenuItem value="" disabled>
                    Provider or Customer?
                  </MenuItem>
                  <MenuItem value="provider">Provider</MenuItem>
                  <MenuItem value="legal">Legal</MenuItem>
                  <MenuItem value="user">Customer</MenuItem>
                </Select>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="first_name"
                  label="First Name"
                  name="first_name"
                  autoComplete="first_name"
                   
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
               
                {this.state.userType.toLowerCase() === 'provider' && (
                  <>
                    <Typography variant="h6" align="center" >
                      Provider Address
                    </Typography>
                    {this.state.addresses.map((address, index) => (
                      <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1, position: 'relative' }}>
                        <TextField
                          margin="normal"
                          fullWidth
                          id={`address-${index}`}
                          label={`Address ${index + 1}`}
                          name="address"
                          value={address.address}
                          onChange={(e) => this.handleInputChange(e, index)}
                          sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                        />
                        <TextField
                          margin="normal"
                          fullWidth
                          id={`city-${index}`}
                          label="City"
                          name="city"
                          value={address.city}
                          onChange={(e) => this.handleInputChange(e, index)}
                          sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                        />
                        <TextField
                          margin="normal"
                          fullWidth
                          id={`state-${index}`}
                          label="State"
                          name="state"
                          value={address.state}
                          onChange={(e) => this.handleInputChange(e, index)}
                          sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                        />  
                        <TextField
                          margin="normal"
                          fullWidth
                          id={`zipcode-${index}`}
                          label="Zip Code"
                          name="zipcode"
                          autoComplete="zipcode"
                          value={address.zipcode}
                          onChange={(e) => this.handleInputChange(e, index)}
                          sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                        />
                        <Button
                          type="button"
                          variant="contained"
                          color="error"
                          onClick={() => this.handleDeleteAddress(index)}
                          sx={{
                            mt: 2,
                            borderRadius: 8,
                            backgroundColor: '#FF5733',
                            color: '#fff',
                            padding: '5px 20px',
                            fontWeight: 600,
                            letterSpacing: '1px',
                            '&:hover': {
                              backgroundColor: '#C70039',
                            },
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    ))}
                    <Button
                      type="button"
                      variant="contained"
                      color="primary"
                      onClick={this.handleAddAddress}
                      sx={{
                        mt: 2,
                        borderRadius: 8,
                        backgroundColor: '#FF5733',
                        color: '#fff',
                        padding: '10px 20px',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        '&:hover': {
                          backgroundColor: '#C70039',
                        },
                      }}
                    >
                      Add Address
                    </Button>
                  </>
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    borderRadius: 8,
                    backgroundColor: '#FF5733',
                    color: '#fff',
                    padding: '10px 20px',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    '&:hover': {
                      backgroundColor: '#C70039',
                    },
                  }}
                >
                  Sign Up
                </Button>
                <Grid container justifyContent="center">
                  <Grid item>
                    <Link href="/login" variant="body2">
                      {"Already have an account? Sign In"}
                    </Link>
                  </Grid>
                </Grid>
                <Copyright sx={{ mt: 5 }} />
              </Box>
            </Paper>
          </Grid>
        </Box>
      </ThemeProvider>
    );
  }
}

export default withRouter(connect()(Register));
