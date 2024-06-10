import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import cx from 'classnames';
import classnames from 'classnames';
import translate from '../utils/translate';
import TemplateButton from '../utils/TemplateButton';
import AppSpinner from '../utils/Spinner';
import Login from '../login';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import TemplateTextField from '../utils/TemplateTextField';

class UserRegistration extends Component {

    constructor(props) { 
        super(props);
        this.state = { 
            register:{
              email: '',
              first_name: '',
              last_name: '',
              phone: '',
            }
        }
        this.cancel = this.cancel.bind(this);
        this.schedule = this.schedule.bind(this);
        this.setVPassword = this.setVPassword.bind(this);
        this.setPassword = this.setPassword.bind(this);
        this.setPhone = this.setPhone.bind(this);
        this.setConsultant = this.setConsultant.bind(this);
        this.setEmail= this.setEmail.bind(this);
        this.setFirst = this.setFirst.bind(this);
        this.setLast = this.setLast.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }
    cancel() { 
        this.props.onCancel()
    } 
    schedule() { 
        if (Login.isAuthenticated()) { 
            this.props.onRegister(this.props.currentUser,this.props.data)
        } else { 
            this.props.onRegister(this.state.register,this.props.data)
        } 
        this.props.dispatch(push('/welcome'));
    } 
    setVPassword(e) {
        this.state.register.verify = e.target.value;
        this.setState(this.state)
    }
    setConsultant(e) { 
        this.state.register.consultant = this.state.register.consultant ? 0 : 1
        this.setState(this.state)
    }
    setPhone(e) { 
        let val = e.target.value.replace(/\D/g, "")
        .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        let validPhone = !val[2] ? val[1]: "(" + val[1] + ") " + val[2] + (val[3] ? "-" + val[3] : "");
        this.setState(prevState => ({
          register: {
            ...prevState.register,
            phone: validPhone
          }
        }));
        if (validPhone.length < 14 && validPhone.length > 0) {
          this.setState({ phoneMessage: 'Please add a 10 digit phone number' });
      } else {
          this.setState({ phoneMessage: '' });
      }
    }
    setPassword(e) { 
        this.state.register.password = e.target.value;
        this.setState(this.state)
    }
    setEmail(e) {
        this.state.register.email = e.target.value;
        this.setState(this.state)
        //validate email 
        const emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
        this.state.isValid = emailRegex.test(this.state.register.email);
        if (this.state.isValid) {
          this.setState(prevState => ({
            register: {
              ...prevState.register,
              email: this.state.register.email
            },
            errorMessage: '',
          }));
        } else {
          this.setState({ errorMessage: 'Invalid email format' });
        }
    }
    setFirst(e) {
        this.state.register.first_name = e.target.value;
        this.setState(this.state)
    }
    setLast(e) { 
        this.state.register.last_name = e.target.value;
        this.setState(this.state)
    }

    render() {
        return (
        <>
            {(this.props.offices && this.props.offices.isReceiving) && (
                <AppSpinner/>
            )}
            {(false) && ( 
            <Grid container  xs="12">
                <Grid item  xs="12">
                    <div style={{border:"1px solid black",height:150,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <h1>Physician Video Here</h1>
                    </div>
                </Grid>
            </Grid>
            )}
            <Grid container xs="12" style={{marginTop:20,marginLeft:10}}>
                <Grid item xs="12">
                <>
                {(!this.props.currentUser) && (
                    <>
                    <div style={{height:300,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <div>
                        <Grid container  xs="12">
                            <Grid item xs="12" style={{marginLeft:0}}>
                              <TemplateTextField style={{width:"100%"}}
                                onChange={this.setEmail} value={this.state.register.email} 
                                label="Email" />
                            </Grid>
                        </Grid>
                        <Grid container xs="12">
                            <Grid item xs="12" style={{marginLeft:0}}>
                              <TemplateTextField type="text" id="normal-field" style={{width:"100%"}}
                                onChange={this.setFirst} value={this.state.register.first_name} 
                                label="First Name" />
                            </Grid>
                        </Grid>
                        <Grid container xs="12">
                            <Grid item xs="12" style={{marginLeft:0}}>
                              <TemplateTextField type="text" id="normal-field" style={{width:"100%"}}
                                onChange={this.setLast} value={this.state.register.last_name} 
                                label="Last Name" />
                            </Grid>
                        </Grid>
                        <Grid container xs="12">
                            <Grid item xs="12" style={{marginLeft:0}}>
                              <TemplateTextField type="text" id="normal-field" style={{width:"100%"}}
                                onChange={this.setPhone} value={this.state.register.phone} 
                                label="Phone" />
                            </Grid>
                        </Grid>
                        <Grid container xs="12">
                            <Grid item xs="12" >
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <TemplateButton onClick={this.schedule} style={{marginRight:10}}  
                                disabled={
                                  !this.state.isValid ||
                                  !this.state.register.first_name || 
                                  !this.state.register.last_name ||
                                  this.state.register.phone.length !== 14} label={translate('Contact')}/>
                                <TemplateButton outline onClick={this.cancel} label={translate('Cancel')}/>
                            </div>
                            </Grid>
                        </Grid>
                    </div>
                    </div>
                    </>
                )}
                </>
                </Grid>                
            </Grid>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser
    }
}

export default connect(mapStateToProps)(UserRegistration);
