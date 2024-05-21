import React, { Component } from 'react';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { toast } from 'react-toastify';
import Widget from '../../components/Widget';
import { Container, Alert, Button } from 'reactstrap';
import getVersion from '../../version.js';
import { connect } from 'react-redux';
import { getLandingData } from '../../actions/landingData';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { registerUser } from '../../actions/registerUser';

class Register extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            page:0,
            plan:0,
            first:'',
            last:'',
            phone:'',
            email:'',
            provtype:null,
            provtypeId:0,
        }
        this.setSignupType = this.setSignupType.bind(this);
        this.nameChange = this.nameChange.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.firstChange = this.firstChange.bind(this);
        this.zipChange = this.zipChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
        this.lastChange = this.lastChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.provtypeChange = this.provtypeChange.bind(this);
        this.checkValid = this.checkValid.bind(this);
        this.register = this.register.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getLandingData({}));
    }

    checkValid() { 
        /* Implement checks */
        this.state.isValid = true;
        this.setState(this.state);
    } 

    cancel() { 
    } 

    setSignupType(e) { 
        this.state.provtypeId = e;
        this.setState(this.state);
        var t = this.props.landingData.data.roles.filter((g) => g.id === e)
        if (t.length < 1) { return; }
        this.state.provtype = t[0].name
        if (this.state.provtype === 'Chiropractor') { 
            window.location = "https://www.poundpain.com/book-online"
        } 
    } 

    register() { 
        var tosend = { 
            email: this.state.email,
            first: this.state.first,
            zipcode: this.state.zipcode,
            name: this.state.name,
            phone: this.state.phone,
            last: this.state.last
        } 
        this.props.dispatch(registerUser(tosend,function(err,args) { 
              toast.success('Successfully registered.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
            window.location = "/#/welcome";
        },this));
    } 

    nextPage() { 
        this.state.page += 1;
        this.setState(this.state);
        this.checkValid();
    }

    zipChange(e) { 
        this.state.zipcode = e.target.value;
        this.setState(this.state);
        this.checkValid();
    }
    phoneChange(e) { 
        this.state.phone = e.target.value;
        this.setState(this.state);
        this.checkValid();
    }

    nameChange(e) { 
        this.state.name = e.target.value;
        this.setState(this.state);
        this.checkValid();
    }

    licenseChange(e) { 
        this.state.license = e.target.value;
        this.setState(this.state);
        this.checkValid();

    }

    emailChange(e) { 

        this.state.email = e.target.value;
        this.setState(this.state);
        this.checkValid();
    }
    provtypeChange(e) { 

    } 
    firstChange(e) { 
        this.state.first = e.target.value;
        this.setState(this.state);
        this.checkValid();
    }
    lastChange(e) { 
        this.state.last = e.target.value;
        this.setState(this.state);
        this.checkValid();
    } 


    render() {
        return (
        <>
            {(this.props.registerUser && this.props.registerUser.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.state.provtype === null && this.props.landingData && 
              this.props.landingData.data && this.props.landingData.data.roles) && (
                <Row md="12">
                    {this.props.landingData.data.roles.map((e) => {
                        return (
                            <>
                            <Col md="4" onClick={() => this.setSignupType(e.id)} style={{cursor:'pointer'}}>
                                <Card 
                                    style={{borderRadius:"25px 25px 25px 25px",margin:20,width:400,height:300}} className="mb-xlg border-1">
                                    <CardBody>
                                        <Row md="12">
                                            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <font style={{fontSize:'24px'}}>
                                                {e.signup_description}
                                            </font>
                                            </div>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </Col>
                            </>
                        )
                    })}
                </Row>
            )}
            {(this.state.provtype === 'Customer') && (
            <div className="auth-page">
                <Container>
                    <h5 className="auth-logo">
                        <i className="la la-circle text-primary" />
                        POUND PAIN TECH
                        <i className="la la-circle text-danger" />
                    </h5>
                    <Widget className="widget-auth mx-auto" title={<h3 className="mt-0">Register with POUND PAIN TECH</h3>}>
                        <p className="widget-auth-info">
                            Please enter the information below to register
                        </p>
                        <form className="mt" onSubmit={this.doLogin}>
                            {
                                this.props.errorMessage && (
                                    <Alert className="alert-sm" color="danger">
                                        {this.props.errorMessage}
                                    </Alert>
                                )
                            }
                            <p for="normal-field" md={12} className="text-md-right">
                                <font style={{color:"red"}}>
                                    {this.state.errorMessage}
                                </font>
                            </p>
                            <div className="form-group mb-0">
                                First Name:
                                <input className="form-control no-border" value={this.state.first} onChange={this.firstChange} required name="first" placeholder="First Name" />
                            </div>
                            <div className="form-group mb-0">
                                Last Name:
                                <input className="form-control no-border" value={this.state.last} onChange={this.lastChange} type="last" required name="last" placeholder="Last Name" />
                            </div>
                            <div className="form-group">
                                Email:
                                <input className="form-control no-border" value={this.state.email} onChange={this.emailChange} type="email" required name="email" placeholder="Email" />
                            </div>
                            <div className="form-group mb-0">
                                Phone:
                                <input className="form-control no-border" value={this.state.phone} onChange={this.phoneChange} required name="phone" placeholder="Phone" />
                            </div>
                            <div className="form-group mb-0">
                                Zip Code:
                                <input className="form-control no-border" value={this.state.zipcode} 
                                    onChange={this.zipChange} required name="zipcode" placeholder="Zipcode"/>
                            </div>
                            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <div style={{border:"1px solid black"}}></div>
                                <Button color="primary" className="auth-btn mb-3" onClick={this.register} disabled={
                                      !this.state.isValid} size="sm">{this.props.registerUser.isReceiving ? 'Saving...' : 'Register'}</Button>
                            </div>
                        </form>
                    </Widget>
                </Container>
            </div>
                )}
                <footer className="auth-footer">
                  {getVersion()} - {new Date().getFullYear()} &copy; <a rel="noopener noreferrer" target="_blank" href="https://www.poundpain.com">POUND PAIN TECH</a>
                </footer>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        registerUser: store.registerUser,
        landingData: store.landingData
    }
}

export default connect(mapStateToProps)(Register);
