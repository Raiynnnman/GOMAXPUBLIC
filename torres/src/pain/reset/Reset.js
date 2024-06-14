import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { connect } from 'react-redux';
import { authError, resetPassword } from '../../actions/auth';
import { getVersion } from '../../version';
import translate from '../utils/translate';
import { push } from 'connected-react-router';
import Navbar from '../../components/Navbar';
import TemplateTextFieldPassword from '../utils/TemplateTextFieldPassword';
import TemplateButton from '../utils/TemplateButton';

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

class Reset extends React.Component {

    constructor(props) {
        super(props);

      this.state = {
        password: '',
        disabled: false,
        confirmPassword: ''
      };

        this.doLogin = this.doLogin.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.changeConfirmPassword = this.changeConfirmPassword.bind(this);
        this.checkPassword = this.checkPassword.bind(this);
        this.isPasswordValid = this.isPasswordValid.bind(this);
        this.doReset = this.doReset.bind(this);
    }

  changePassword(event) {
    this.state.disabled = false;
    this.state.password = event.target.value;
    this.setState(this.state);
  }

  changeConfirmPassword(event) {
    this.state.disabled = false;
    this.state.confirmPassword = event.target.value;
    this.setState(this.state);
  }

  checkPassword() {
    if (!this.isPasswordValid()) {
      if (!this.state.password) {
        this.props.dispatch(authError("Password field is empty"));
      } else {
        this.props.dispatch(authError("Passwords are not equal"));
      }
      setTimeout(() => {
        this.props.dispatch(authError());
      }, 3 * 1000)
    }
  }

  isPasswordValid() {
    return this.state.password && this.state.password === this.state.confirmPassword;
  }

  doReset(e) {
    e.preventDefault();

    const params = new URLSearchParams(this.props.location.search);
    const token = this.props.match.params.token;
    
    if (!token) {
      authError("Token Required")
    }

    if (!this.isPasswordValid()) {
      this.checkPassword();
    } else {
      this.state.disabled = true;
      this.props.dispatch(resetPassword(token, this.state.password));
      this.setState(this.state);
    }
  }

  doLogin() { 
      window.location.href = "/login"
  }

    render() {
      return (
      <>
      <ThemeProvider theme={defaultTheme}>
        <Navbar/>
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
                <div style={{marginTop:20}} className="row align-items-center">
                    {this.props.errorMessage && ( 
                        <h4 style={{color:'red'}}>{this.props.errorMessage}</h4>
                    )}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}> 
                        <TemplateTextFieldPassword style={{width:400}} label='Password' helpText='Password' onChange={this.changePassword}/>
                    </div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}> 
                        <TemplateTextFieldPassword style={{marginTop:10,width:400}} label='Verify' helpText='Verify' onChange={this.changeConfirmPassword}/>
                    </div>
                    <div className="row align-items-center">
                        <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}> 
                            <TemplateButton style={{marginTop:10,margin:20}} onClick={this.doReset} label='Reset' disable={false}/>
                        </div>
                    </div>
                </div>
            </Paper>
        </Grid>
        </Box>
      </ThemeProvider>
      </>
      );
    }
}

function mapStateToProps(state) {
  return {
    isFetching: state.auth.isFetching,
    errorMessage: state.auth.errorMessage,
  };
}

export default withRouter(connect(mapStateToProps)(Reset));

