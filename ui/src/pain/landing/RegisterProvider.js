import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import SaveIcon from '@mui/icons-material/Save';
import {CardElement,ElementsConsumer,Elements} from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import getVersion from '../../version.js';
import { Container, Alert, Button, FormGroup, Label} from 'reactstrap';
import { withRouter, Link } from 'react-router-dom';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import Widget from '../../components/Widget';
import { registerProvider } from '../../actions/registerProvider';
import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {loadStripe} from '@stripe/stripe-js';
import { setupIntent } from '../../actions/setupIntent';
import {stripeKey} from '../../stripeConfig.js';
import BillingCreditCardForm from './BillingCreditCardForm';

const stripePromise = loadStripe(stripeKey());

class RegisterProvider extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            page:0,
            plan:0,
            selectedAddrId:null,
            card:null,
            first:'',
            last:'',
            phone:'',
            email:'',
            addresses:[],
            intentid:'',
            license:'',
            provtype:0,
            provtypeSel:[
                'Chiropractor'
            ]
        }
        this.nameChange = this.nameChange.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.firstChange = this.firstChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
        this.lastChange = this.lastChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.licenseChange = this.licenseChange.bind(this);
        this.officeNameChange = this.officeNameChange.bind(this);
        this.officeStateChange = this.officeStateChange.bind(this);
        this.officeZipChange = this.officeZipChange.bind(this);
        this.officeCityChange = this.officeCityChange.bind(this);
        this.officePhoneChange = this.officePhoneChange.bind(this);
        this.officeAddr1Change = this.officePhoneChange.bind(this);
        this.provtypeChange = this.provtypeChange.bind(this);
        this.addRow = this.addRow.bind(this);
        this.saveRow = this.saveRow.bind(this);
        this.checkValid = this.checkValid.bind(this);
        this.register = this.register.bind(this);
        this.saveCard= this.saveCard.bind(this);
        this.cancel= this.cancel.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.state.plan = this.props.match.params.id;
        this.props.dispatch(setupIntent()).then((e) =>  { 
            this.state.newcard = {id:0};
            this.setState(this.state);
        })
    }

    checkValid() { 
        /* Implement checks */
        this.state.isValid = true;
        this.setState(this.state);
    } 

    cancel() { 
    } 

    saveCard(e,i) { 
        this.state.card = e.token;
        this.state.intentid = i;
        this.setState(this.state);
    } 
    officeNameChange(e) {
        this.state.addresses[this.state.selectedAddrId].name = e.target.value;
        this.setState(this.state);
    } 
    officeStateChange(e) {
        this.state.addresses[this.state.selectedAddrId].state = e.target.value;
        this.setState(this.state);
    } 
    officeZipChange(e) {
        this.state.addresses[this.state.selectedAddrId].zipcode = e.target.value;
        this.setState(this.state);
    } 
    officeCityChange(e) {
        this.state.addresses[this.state.selectedAddrId].city = e.target.value;
        this.setState(this.state);
    } 
    officePhoneChange(e) {
        this.state.addresses[this.state.selectedAddrId].phone = e.target.value;
        this.setState(this.state);
    } 
    officeAddr1Change(e) {
        this.state.addresses[this.state.selectedAddrId].addr1 = e.target.value;
        this.setState(this.state);
    } 

    register() { 
        var tosend = { 
            email: this.state.email,
            first: this.state.first,
            name: this.state.name,
            phone: this.state.phone,
            plan: this.state.plan,
            cust_id: this.props.setupIntent.data.data.cust_id,
            intentid: this.state.intentid,
            card: this.state.card,
            last: this.state.last,
            license: this.state.license,
            addresses: this.state.addresses
        } 
        console.log("ts",tosend);
        this.props.dispatch(registerProvider(tosend,function(err,args) { 
              toast.success('Successfully saved office.',
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
    saveRow(e) { 
        this.state.selectedAddrId = null
        this.setState(this.state);
    }
    addRow(e) { 
        this.state.selectedAddrId = this.state.addresses.length 
        this.state.addresses.push({
            id: this.state.selectedAddrId,
            name:'My Practice',
            addr1:'',
            phone:'',
            city:'',
            state:'',
            zipcode:''
        })
        this.setState(this.state);
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
        var heads = [
            {
                dataField:'name',
                width:'15%',
                text:'Name'
            },
            {
                dataField:'phone',
                width:'15%',
                text:'Phone'
            },
            {
                dataField:'addr1',
                width:'20%',
                text:'Address'
            },
            {
                dataField:'city',
                width:'15%',
                text:'City'
            },
            {
                dataField:'state',
                width:'5%',
                text:'State'
            },
            {
                dataField:'zipcode',
                width:'10%',
                text:'Zip'
            }
        ]
        return (
        <>
            {(this.props.registerProvider && this.props.registerProvider.isReceiving) && (
                <AppSpinner/>
            )}
            <div className="auth-page">
                <Container>
                    <h5 className="auth-logo">
                        <i className="la la-circle text-primary" />
                        #PAIN
                        <i className="la la-circle text-danger" />
                    </h5>
                    {(this.state.page === 0) && (
                    <Widget className="widget-auth mx-auto" title={<h3 className="mt-0">Register with #PAIN</h3>}>
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
                                Practice Name:
                                <input className="form-control no-border" value={this.state.name} onChange={this.nameChange} required name="name" placeholder="Name" />
                            </div>
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
                                License Number:
                                <input className="form-control no-border" value={this.state.license} onChange={this.licenseChange} required name="license" placeholder="License #" />
                            </div>
                        </form>
                    </Widget>
                    )}
                    {(this.state.page === 1) && (
                    <>
                    <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        Enter your practice addresses below. These will show up when clients search for services in your area.
                    </div>
                    <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <div style={{width:1000}}>
                            <Button onClick={() => this.addRow()} 
                                style={{marginRight:5,height:35,width:90}} color="primary" disabled={this.state.selectedAddrId !== null}>Add</Button>
                                <table style={{width:"100%"}}>
                                    <tr>
                                    {heads.map((e) => { 
                                        return (
                                            <th style={{width:e.width}}>{e.text}</th>
                                        )
                                    })}
                                    </tr>
                                    {this.state.addresses.map((e) => {
                                        return (
                                        <tr>
                                            <td style={{width:100}}>
                                                <input className="form-control no-border" value={e.name} 
                                                    onChange={this.officeNameChange} required name="name" placeholder="Name" />
                                            </td>
                                            <td style={{width:100}}>
                                                <input className="form-control no-border" value={e.phone} 
                                                    onChange={this.officePhoneChange} required phone="phone" placeholder="Phone" />
                                            </td>
                                            <td style={{width:100}}>
                                                <input className="form-control no-border" value={e.addr} 
                                                    onChange={this.officeAddrChange} required addr="addr" placeholder="Addr" />
                                            </td>
                                            <td style={{width:100}}>
                                                <input className="form-control no-border" value={e.city} 
                                                    onChange={this.officeCityChange} required city="city" placeholder="City" />
                                            </td>
                                            <td style={{width:100}}>
                                                <input className="form-control no-border" value={e.state} 
                                                    onChange={this.officeStateChange} required state="state" placeholder="FL" />
                                            </td>
                                            <td style={{width:100}}>
                                                <input className="form-control no-border" value={e.zip} 
                                                    onChange={this.officeZipChange} required zip="zip" placeholder="Zip" />
                                            </td>
                                            {(this.state.selectedAddrId === null) && ( 
                                            <td style={{width:100}}>
                                            </td>
                                            )}
                                            {(this.state.selectedAddrId !== null && this.state.selectedAddrId === e.id) && ( 
                                            <td style={{width:100}}>
                                                <Button onClick={() => this.saveRow()} 
                                                    style={{marginRight:10,height:35}} color="primary"><SaveIcon/></Button>
                                            </td>
                                            )}
                                        </tr>
                                        )
                                    })}
                                </table>
                        </div>
                    </div>
                    </>
                    )}
                    {(this.state.page === 2) && (
                    <>
                    <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        Enter your credit card info. You will not be charged until the first client. 
                    </div>
                    <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <div style={{width:800}}>
                            {(this.props.setupIntent && this.props.setupIntent.data &&
                              this.props.setupIntent.data.data &&
                              this.props.setupIntent.data.data.id) && (
                                <Elements stripe={stripePromise} options={{clientSecret:this.props.setupIntent.data.data.clientSecret}}>
                                    <ElementsConsumer>
                                        {(ctx) => <BillingCreditCardForm onSave={this.saveCard}
                                            onCancel={this.cancel} intentid={this.props.setupIntent.data.data.id} {...ctx} />}
                                    </ElementsConsumer>
                                </Elements>
                            )}
                        </div>
                    </div>
                    </>
                    )}
                    {(this.state.page === 0) && (
                        <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <div style={{border:"1px solid black"}}></div>
                        <Button type="submit" onClick={this.nextPage} color="primary" className="auth-btn mb-3" disabled={
                              !this.state.isValid} size="lg">Next</Button>
                        </div>
                    )}
                    {(this.state.page === 1) && (
                        <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <div style={{border:"1px solid black"}}></div>
                        <Button type="submit" onClick={this.nextPage} color="primary" className="auth-btn mb-3" disabled={
                              !this.state.isValid} size="lg">Next</Button>
                        </div>
                    )}
                    {(this.state.page === 2 && this.state.card !== null) && (
                        <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <div style={{border:"1px solid black"}}></div>
                        <Button type="submit" color="primary" className="auth-btn mb-3" onClick={this.register} disabled={
                              !this.state.isValid} size="sm">{this.props.registerProvider.isReceiving ? 'Saving...' : 'Register'}</Button>
                        </div>
                    )}
                </Container>
                <footer className="auth-footer">
                  {getVersion()} - {new Date().getFullYear()} &copy; <a rel="noopener noreferrer" target="_blank" href="https://www.poundpain.com">#PAIN</a>
                </footer>
            </div>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        registerProvider: store.registerProvider,
        saveCard: store.saveCard,
        setupIntent: store.setupIntent
    }
}

export default connect(mapStateToProps)(RegisterProvider);
