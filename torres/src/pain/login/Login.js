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
            <div className="container">
                <div className="row align-items-center">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}> 
                        <TemplateTextField label='Email' helpText='Email' onChange={this.changeEmail}/>
                    </div>
                </div>
                <div className="row align-items-center">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}> 
                        <TemplateTextField label='Password' helpText='Password' onChange={this.changePassword}/>
                    </div>
                </div>
                <div className="row align-items-center">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}> 
                        <TemplateButton onClick={this.doLogin} label='Login' disable={false}/>
                    </div>
                </div>
            </div>
        </>
        )
    } 
    /*render2() {
        return (
            <div className="auth-page">
                <Container>
                    <h5 className="auth-logo">
                        <i className="la la-circle text-primary" />
                        POUNDPAIN TECH
                        <i className="la la-circle text-danger" />
                    </h5>
                    <Widget className="widget-auth mx-auto" title={<h3 className="mt-0">Login to POUNDPAIN TECH</h3>}>
                        <p className="widget-auth-info">
                            Use your email to sign in.
                        </p>
                        <form className="mt" onSubmit={this.doLogin}>
                            {
                                this.props.errorMessage && (
                                    <Alert className="alert-sm" color="danger">
                                        {this.props.errorMessage}
                                    </Alert>
                                )
                            }
                            <div className="form-group">
                                <input className="form-control no-border" value={this.state.email} onChange={this.changeEmail} type="email" required name="email" placeholder="Email" />
                            </div>
                            <p for="normal-field" md={12} className="text-md-right">
                                <font style={{color:"red"}}>
                                    {this.state.errorMessage}
                                </font>
                            </p>
                            <div className="form-group mb-0">
                                <input className="form-control no-border" value={this.state.password} onChange={this.changePassword} type="password" required name="password" placeholder="Password" />
                            </div>
                            <Link className="d-block text-right mb-3 mt-1 fs-sm" style={{color:"black"}} to="forgot">Forgot password?</Link>
                            <Button type="submit" color="primary" className="auth-btn mb-3" disabled={
                                  !this.state.isValid} size="sm">{this.props.isFetching ? 'Loading...' : 'Login'}</Button>
                        </form>
                        <p className="widget-auth-info">
                            Don't have an account? Sign up now!
                        </p>
                        <Link className="d-block text-center" style={{color:"black"}} to="register">Create an Account</Link>
                    </Widget>
                </Container>
                <footer className="auth-footer">
                  {getVersion()} - {new Date().getFullYear()} &copy; <a rel="noopener noreferrer" target="_blank" href="https://www.poundpain.com">POUNDPAIN TECH</a>
                </footer>
            </div>
        ); 
    }
    */
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

