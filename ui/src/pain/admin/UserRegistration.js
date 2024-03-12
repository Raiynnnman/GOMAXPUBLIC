import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { push } from 'connected-react-router';
import { Button } from 'reactstrap'; 
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { Form, FormGroup, Label, Input, InputGroup, InputGroupText } from 'reactstrap';
import Login from '../login';

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
            <Row md="12" xs="12">
                <Col md="12" xs="12">
                    <div style={{border:"1px solid black",height:150,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <h1>Physician Video Here</h1>
                    </div>
                </Col>
            </Row>
            )}
            <Row md="12" xs="12" style={{marginTop:20,marginLeft:10}}>
                <Col md="12" xs="12">
                <>
                {(!this.props.currentUser) && (
                    <>
                    <div style={{height:300,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <div>
                        <Row md="12" xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md="3" xs="3" className="text-md-right">
                              {translate('Email')}:
                            </Label>
                            <Col md="9" xs="9" style={{marginLeft:0}}>
                              <Input type="text" id="normal-field" 
                                onChange={this.setEmail} value={this.state.register.email} 
                                placeholder="Email" />
                            </Col>
                          </FormGroup>
                        </Row>
                        <Row md="12" xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md="3" xs="3" className="text-md-right">
                              {translate('First')}:
                            </Label>
                            <Col md="9" xs="9" style={{marginLeft:0}}>
                              <Input type="text" id="normal-field" 
                                onChange={this.setFirst} value={this.state.register.first_name} 
                                placeholder="First Name" />
                            </Col>
                          </FormGroup>
                        </Row>
                        <Row md="12" xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md="3" xs="3" className="text-md-right">
                              {translate('Last')}:
                            </Label>
                            <Col md="9" xs="9" style={{marginLeft:0}}>
                              <Input type="text" id="normal-field" 
                                onChange={this.setLast} value={this.state.register.last_name} 
                                placeholder="Last Name" />
                            </Col>
                          </FormGroup>
                        </Row>
                        <Row md="12" xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md="3" xs="3" className="text-md-right">
                              {translate('Phone')}:
                            </Label>
                            <Col md="9" xs="9" style={{marginLeft:0}}>
                              <Input type="text" id="normal-field" 
                                onChange={this.setPhone} value={this.state.register.phone} 
                                placeholder="Phone" />
                            </Col>
                          </FormGroup>
                        </Row>
                        <Row md="12" xs="12">
                            <Col md="12" xs="12">
                            <FormGroup className="checkbox abc-checkbox" check>
                              <div style={{display:"flex",width:"100%"}}>
                              <Input id="consultant" style={{float:"left"}} checked={this.state.register.consultant} type="checkbox" />{' '}
                              <Label onClick={this.setConsultant} for="consultant" check>
                                    {translate('Click to get a complementary consultant for your visit')}
                              </Label>
                              </div>
                            </FormGroup>
                            </Col>
                        </Row>
                        {/*<Row md="12" xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md="3" xs="3" className="text-md-right">
                              Password:
                            </Label>
                            <Col md="9" xs="9" style={{marginLeft:0}}>
                              <Input type="password" id="normal-field" 
                                onChange={this.setPassword} value={this.state.register.password} 
                                placeholder="Password" />
                            </Col>
                          </FormGroup>
                        </Row>
                        <Row md="12" xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md="3" xs="3" className="text-md-right">
                              Verify:
                            </Label>
                            <Col md="9" xs="9" style={{marginLeft:0}}>
                              <Input type="password" id="normal-field" 
                                onChange={this.setVPassword} value={this.state.register.verify} 
                                placeholder="Verify" />
                            </Col>
                          </FormGroup>
                        </Row>*/}
                        <Row md="12" xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={12} className="text-md-right">
                              <font style={{color:"red"}}>
                                  {translate(this.state.errorMessage)} 
                                  <br></br>
                                  {translate(this.state.phoneMessage)}
                              </font>
                            </Label>
                          </FormGroup>
                        </Row>
                        <Row md="12" xs="12">
                            <Col md="12" xs="12">
                                <Button onClick={this.schedule} style={{marginRight:10}} color="primary" 
                                disabled={
                                  !this.state.isValid ||
                                  !this.state.register.first_name || 
                                  !this.state.register.last_name ||
                                  this.state.register.phone.length != 14}>{translate('Schedule Appointment')}</Button>
                                <Button outline onClick={this.cancel} color="primary">{translate('Cancel')}</Button>
                            </Col>
                        </Row>
                    </div>
                    </div>
                    </>
                )}
                {(this.props.currentUser) && (
                    <div style={{marginBottom:10,height:500,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Button onClick={this.schedule} style={{marginRight:10}} color="primary">{translate('Schedule Appointment')}</Button>
                        <Button outline onClick={this.cancel} color="primary">{translate('Cancel')}</Button>
                    </div>
                )}
                </>
                </Col>                
            </Row>
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
