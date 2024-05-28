import React from 'react';
import Box from '@mui/material/Box';
import FilledInput from '@mui/material/FilledInput';
import HeroOlive from '../../components/HeroOlive';
import { withRouter, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { connect } from 'react-redux';
import { loginUser, receiveToken, doInit } from '../../actions/auth';
import jwt from "jsonwebtoken";
// import microsoft from '../../images/microsoft.png';
import getVersion from '../../version.js';
import { push } from 'connected-react-router';
import translate from '../utils/translate';
import TemplateTextField from '../utils/TemplateTextField';
import TemplateTextFieldPassword from '../utils/TemplateTextFieldPassword';
import TemplateButton from '../utils/TemplateButton';

class Login extends React.Component {

    static isAuthenticated() {
      const token = localStorage.getItem('token');
      //if (!config.isBackend && token) return true;
      if (token) return true;
      if (!token) return;
      const date = new Date().getTime() / 1000;
      const data = jwt.decode(token);
      if (!data) return;
      return date < data.exp;
    }

    constructor(props) {
        super(props);

        this.state = {
          email: '',
          password: ''
          
        };

        this.doLogin = this.doLogin.bind(this);
        this.googleLogin = this.googleLogin.bind(this);
        this.microsoftLogin = this.microsoftLogin.bind(this);
        this.changeEmail = this.changeEmail.bind(this);
        this.changePassword = this.changePassword.bind(this);
    }

    changeEmail(event,t) {
        this.setState({ email: event.target.value });
        const emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
        this.state.isValid = emailRegex.test(event.target.value);
        if (this.state.isValid) {
            this.setState(prevState => ({
                ...prevState.register,
                email: event.target.value,
                errorMessage: '',
            }));
        } else {
            this.setState({ errorMessage: 'Invalid email format' });
        }
    }

    changePassword(event) {
        this.setState({ password: event.target.value });
    }

    doLogin(e) {
        console.log("login");
        e.preventDefault();
        this.props.dispatch(loginUser({ email: this.state.email, password: this.state.password }));
    }

    googleLogin() {
        this.props.dispatch(loginUser({social: "google"}));
    }

    microsoftLogin() {
        this.props.dispatch(loginUser({social: "microsoft"}));
    }

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
        <>
            <Navbar/>
            <div className="container" style={{marginTop:20}}>
                    <div className="row align-items-center">
                        <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}> 
                            <TemplateTextField width="300px" label='Email' helpText='Email' onChange={this.changeEmail}/>
                        </div>
                    </div>
                    <div className="row align-items-center">
                        <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}> 
                            <TemplateTextFieldPassword width="300px" label='Password' helpText='Password' onChange={this.changePassword}/>
                        </div>
                    </div>
                    <div className="row align-items-center">
                        <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}> 
                            <TemplateButton style={{marginTop:20}} onClick={this.doLogin} label='Login' disable={false}/>
                            <TemplateButton style={{marginLeft:20,marginTop:20}} onClick={this.register} label='Sign Up' disable={false}/>
                        </div>
                    </div>
            </div>
        </>
        )
    } 
}

function mapStateToProps(state) {
    return {
        // isFetching: state.auth.isFetching,
        // isAuthenticated: state.auth.isAuthenticated,
        // errorMessage: state.auth.errorMessage,
        auth: state.auth
    };
}

export default withRouter(connect(mapStateToProps)(Login));

