import React, { Component } from 'react';
import { connect } from 'react-redux';
import MaskedInput from 'react-maskedinput';
import Select from 'react-select';
import { Input } from 'reactstrap';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
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
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {loadStripe} from '@stripe/stripe-js';
import { setupIntent } from '../../actions/setupIntent';
import {stripeKey} from '../../stripeConfig.js';
import BillingCreditCardForm from './BillingCreditCardForm';
import { squareAppKey, squareLocationKey } from '../../squareConfig.js';
import { PaymentForm,CreditCard } from 'react-square-web-payments-sdk';
import {searchProvider} from '../../actions/searchProvider';
import { getLandingData } from '../../actions/landingData';
import googleKey from '../../googleConfig';
import formatPhoneNumber from '../utils/formatPhone';

const stripePromise = loadStripe(stripeKey());

class RegisterProvider extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            page:0,
            plan:0,
            selectedAddrId:null,
            card:null,
            currentName:'',
            currentPhone:'',
            first:'',
            last:'',
            phone:'',
            email:'',
            pq_id:null,
            addresses:[],
            showAddresses:[],
            intentid:'',
            selPlan:null,
            license:'',
            provtype:2
        }
        this.nameChange = this.nameChange.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.updateVerified = this.updateVerified.bind(this);
        this.firstChange = this.firstChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
        this.lastChange = this.lastChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
        this.licenseChange = this.licenseChange.bind(this);
        this.search = this.search.bind(this);
        this.officeNameChange = this.officeNameChange.bind(this);
        this.officeStateChange = this.officeStateChange.bind(this);
        this.officeZipChange = this.officeZipChange.bind(this);
        this.officeCityChange = this.officeCityChange.bind(this);
        this.officePhoneChange = this.officePhoneChange.bind(this);
        this.officeAddr1Change = this.officeAddr1Change.bind(this);
        this.provtypeChange = this.provtypeChange.bind(this);
        this.addRow = this.addRow.bind(this);
        this.saveRow = this.saveRow.bind(this);
        this.checkValid = this.checkValid.bind(this);
        this.register = this.register.bind(this);
        this.saveCard= this.saveCard.bind(this);
        this.cancel= this.cancel.bind(this);
        this.cardChange = this.cardChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
        if (p.landingData && p.landingData.data && p.landingData.data.pq && this.state.pq_id !== null
            && this.state.phone.length < 1) { 
            this.state.phone = formatPhoneNumber(p.landingData.data.pq.phone);
            this.state.first = p.landingData.data.pq.first_name + " " + p.landingData.data.pq.last_name;
            this.state.name = p.landingData.data.pq.name;
            this.state.email = p.landingData.data.pq.email;
            this.state.showAddresses = p.landingData.data.pq.addr;
            this.setState(this.state);
            this.state.selPlan = p.landingData.data.pricing.filter((e) => parseInt(p.landingData.data.pq.plan) === e.id)
            if (this.state.selPlan.length > 0) { 
                this.state.selPlan = this.state.selPlan[0]
            } 
            this.checkValid()
            
        } 
        if (p.landingData && p.landingData.data && p.landingData.data.pricing && this.state.selPlan === null) { 
            this.state.selPlan = p.landingData.data.pricing.filter((e) => parseInt(this.state.plan) === e.id)
            if (this.state.selPlan.length > 0) { 
                this.state.selPlan = this.state.selPlan[0]
            } 
            if (this.state.plan === undefined) { 
                this.state.selPlan = p.landingData.data.pricing[0]
            } 
            this.setState(this.state);
        } 
        var relList = false;
        if (p.searchProvider.data && p.searchProvider.data.potentials && this.state.page === 1 && this.state.pq_id === null) {  
            var g = p.searchProvider.data.potentials.map((e) => { 
                return (e.id)
            }) 
            var h = this.state.showAddresses.map((e) => { 
                return (e.id)
            }) 
            g.sort((a, b) => (a > b ? -1 : 1));
            h.sort((a, b) => (a > b ? -1 : 1));
            if (JSON.stringify(g) !== JSON.stringify(h)) { 
                this.state.showAddresses = p.searchProvider.data.potentials
                this.setState(this.state);
            } 
        } 
    }


    componentDidMount() {
        this.state.plan = this.props.match.params.id;
        if (this.props.match.params.pq_id) { 
            this.state.pq_id = this.props.match.params.pq_id;
        } 
        this.props.dispatch(getLandingData({type:this.state.provtype,pq_id:this.state.pq_id}));
    }

    checkValid() { 
        /* Implement checks */
        this.state.isValid = true;
        this.setState(this.state);
    } 

    updateAddress(e,t,v) { 
        var t = e.value.terms
        var c = t[t.length-2].value ? t[t.length-2].value : ''
        var s = t[t.length-3].value ? t[t.length-3].value : ''
        this.state.showAddresses.push({
            verified: 1,
            places_id:e.value.place_id,
            addr1:e.value.structured_formatting.main_text,
            fulladdr:e.label,
            name: this.state.currentName,
            phone: this.state.currentPhone,
            city:c,
            state:s,
            zipcode:0
        })
        this.state.currentName = ''
        this.state.currentPhone = ''
        this.setState(this.state);
        this.addRow()
    } 

    updateVerified(e) { 
        var c = 0;
        var i = -1;
        for (c=0;c<this.state.showAddresses.length;c++) { 
            if (this.state.showAddresses[c].id === e) { 
                i = c;
            } 
        } 
        if (i !== -1) { 
            this.state.showAddresses[i].verified = 
                this.state.showAddresses[i].verified ? 0 : 1
            this.setState(this.state)
        }
    } 

    cancel() { 
    } 

    cardChange(e,t,i) { 
    } 

    search() { 
        if (this.state.pq_id !== null) { return; }
        var ts = { 
            n:this.state.name,
            p:this.state.phone,
            e:this.state.email
        } 
        this.props.dispatch(searchProvider(ts));
    } 

    saveCard(e,i) { 
        this.state.card = e;
        this.state.intentid = i;
        this.nextPage();
        this.setState(this.state);
    } 
    officeNameChange(e) {
        this.state.currentName = e.target.value;
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
        let val = e.target.value.replace(/\D/g, "")
        .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        let validPhone = !val[2] ? val[1]: "(" + val[1] + ") " + val[2] + (val[3] ? "-" + val[3] : "");
        this.state.currentPhone = validPhone;
        this.setState(this.state);
        if (validPhone.length < 14 && validPhone.length > 0) {
            this.setState({ phoneMessage: 'Please add a 10 digit phone number' });
        } else {
            this.setState({ phoneMessage: '' });
        }
    } 
    officeAddr1Change(e) {
        this.state.addresses[this.state.selectedAddrId].addr1 = e.target.value;
        this.setState(this.state);
    } 

    register() { 
        var a = this.state.showAddresses.filter((e) => e.verified === 1)
        var tosend = { 
            email: this.state.email,
            first: this.state.first,
            name: this.state.name,
            phone: this.state.phone,
            plan: this.state.selPlan.id,
            provtype:this.state.provtype,
            card: this.state.card,
            last: this.state.last,
            addresses: a 
        } 
        if (this.state.pq_id !== null) { 
            tosend.pq_id = this.state.pq_id
            delete tosend.plan
        } 
        this.props.dispatch(registerProvider(tosend,function(err,args) { 
            window.location = "/#/welcome";
        },this));
    } 

    nextPage() { 
        this.state.page += 1;
        this.setState(this.state);
        this.checkValid();
        this.search();
    }

    phoneChange(e) { 
        //this.state.phone = e.target.value;
        let val = e.target.value.replace(/\D/g, "")
        .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        let validPhone = !val[2] ? val[1]: "(" + val[1] + ") " + val[2] + (val[3] ? "-" + val[3] : "");
        this.state.phone = validPhone;
        this.setState(this.state);
        if (validPhone.length < 14 && validPhone.length > 0) {
            this.setState({ phoneMessage: 'Please add a 10 digit phone number' });
        } else {
            this.setState({ phoneMessage: '' });
        }
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
            name:'',
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
                width:'5%',
                text:''
            },
            {
                dataField:'name',
                width:'25%',
                text:'Name'
            },
            {
                dataField:'phone',
                width:'25%',
                text:'Phone'
            },
            {
                dataField:'addr1',
                width:'65%',
                text:'Address'
            },
        ]
        var value = '';
        return (
        <>
            {(this.props.registerProvider && this.props.registerProvider.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.searchProvider && this.props.searchProvider.isReceiving) && (
                <AppSpinner/>
            )}
            <div className="auth-page">
                <Container>
                    <h5 className="auth-logo">
                        <i className="la la-circle text-primary" />
                        POUNDPAIN TECH
                        <i className="la la-circle text-danger" />
                    </h5>
                    {(this.state.page === 0) && (
                    <Widget className="widget-auth mx-auto" title={<h3 className="mt-0">Register with POUNDPAIN TECH</h3>}>
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
                            <div className="form-group mb-1" style={{borderBottom:'1px solid black'}}>
                                Practice Name:
                                <input className="form-control no-border" style={{backgroundColor:'white'}} value={this.state.name} onChange={this.nameChange} required name="name" placeholder="Name" />
                            </div>
                            <div className="form-group mb-1" style={{borderBottom:'1px solid black'}}>
                                Name:
                                <input className="form-control no-border" style={{backgroundColor:'white'}} value={this.state.first} onChange={this.firstChange} required name="first" placeholder="Name" />
                            </div>
                            <div className="form-group mb-1" style={{borderBottom:'1px solid black'}}>
                                Email:
                                <input className="form-control no-border" style={{backgroundColor:'white'}} value={this.state.email} onChange={this.emailChange} type="email" required name="email" placeholder="Email" />
                            </div>
                            <div className="form-group mb-1" style={{borderBottom:'1px solid black'}}>
                                Phone:
                                <input className="form-control no-border" style={{backgroundColor:'white'}} value={this.state.phone} onChange={this.phoneChange} type="phone" required name="phone" placeholder="Phone" />
                                    {/*<MaskedInput style={{backgroundColor:'white',border:'0px solid white'}}
                                      className="form-control" id="mask-phone" mask="(111) 111-1111"
                                      onChange={this.phoneChange} value={this.state.phone}
                                      size="10"
                                    />*/}
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
                        There are preloaded addresses, select your addresses or enter a new one.
                    </div>
                    <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <div style={{width:1000}}>
                                <table style={{width:"100%"}}>
                                    <tr style={{borderBottom:'1px solid black'}}>
                                    {heads.map((e) => { 
                                        return (
                                            <th style={{width:e.width}}>{e.text}</th>
                                        )
                                    })}
                                    </tr>
                                    <tr style={{borderBottom:'1px solid black'}}>
                                        <td></td>
                                        <td style={{width:200}}>
                                            <input className="form-control no-border" style={{backgroundColor:'white'}} value={this.state.currentName} 
                                                onChange={this.officeNameChange} required name="name" placeholder="Name" />
                                        </td>
                                        <td style={{width:200}}>
                                            <input className="form-control no-border" style={{backgroundColor:'white'}} value={this.state.currentPhone} 
                                                onChange={this.officePhoneChange} required name="phone" placeholder="Phone" />
                                            {/*<MaskedInput style={{backgroundColor:'white',border:'0px solid white'}}
                                              className="form-control" id="mask-phone" mask="(111) 111-1111"
                                              onChange={this.officePhoneChange} value={this.state.currentPhone}
                                              size="10"
                                            />*/}
                                        </td>
                                        <td style={{width:400}}>
                                            <GooglePlacesAutocomplete 
                                                selectProps={{ value, onChange: this.updateAddress }} apiKey={googleKey()}/>
                                        </td>
                                        {(this.state.selectedAddrId === null) && ( 
                                        <td style={{width:100}}>
                                        </td>
                                        )}
                                    </tr>
                                    {this.state.showAddresses.map((e) => {
                                        return (
                                        <tr style={{borderBottom:'1px solid black'}}>
                                            <td style={{width:20}}>
                                                <Input type="checkbox" id="normal-field"
                                                  onChange={() => this.updateVerified(e.id)} checked={e.verified}/>
                                            </td>
                                            <td style={{width:100}}>
                                                <input className="form-control no-border" style={{backgroundColor:'white'}} value={e.name} 
                                                    onChange={this.officeNameChange} required name="name" placeholder="Name" />
                                            </td>
                                            <td style={{width:100}}>
                                                <input className="form-control no-border" style={{backgroundColor:'white'}} value={e.phone} 
                                                    onChange={this.officePhoneChange} required phone="phone" placeholder="Phone" />
                                            </td>
                                            <td style={{width:400}}>
                                                <input className="form-control no-border" style={{backgroundColor:'white'}} value={e.addr1 + ' ' + e.city + ', ' + e.state}/>
                                            </td>
                                            {(this.state.selectedAddrId === null) && ( 
                                            <td style={{width:100}}>
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
                    {(this.state.selPlan && this.state.selPlan.trial === 0 && this.state.page === 2) && (
                    <>
                    <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        Enter your credit card information. 
                    </div>
                    <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <div style={{width:400}}>
                                <PaymentForm style={{display:'grid',justifyContent:'center',alignContent:'center'}}
                                    applicationId={squareAppKey()}
                                    locationId={squareLocationKey()}
                                    cardTokenizeResponseReceived={(token,verifiedBuyer) => { 
                                            this.saveCard({token:token});
                                    }}>
                                    <>
                                        <CreditCard>Save</CreditCard>
                                    </>
                                </PaymentForm>
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
                    {(this.state.selPlan && this.state.selPlan.trial === 1 && this.state.page === 2) && (
                        <>
                        <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <font>Thank you! Click register below to finish the registration process</font>
                        </div>
                        <br/>
                        <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <div style={{border:"1px solid black"}}></div>
                            <Button type="submit" style={{marginTop:20}} color="primary" className="auth-btn mb-3" onClick={this.register} disabled={
                                  !this.state.isValid} size="sm">{this.props.registerProvider.isReceiving ? 'Saving...' : 'Register'}</Button>
                        </div>
                        </>
                    )}
                    {(this.state.selPlan && this.state.selPlan.trial === 0 && this.state.page === 3 && this.state.card !== null) && (
                        <>
                        <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <font>Thank you! Click register below to finish the registration process</font>
                        </div>
                        <br/>
                        <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <div style={{border:"1px solid black"}}></div>
                            <Button type="submit" style={{marginTop:20}} color="primary" className="auth-btn mb-3" onClick={this.register} disabled={
                                  !this.state.isValid} size="sm">{this.props.registerProvider.isReceiving ? 'Saving...' : 'Register'}</Button>
                        </div>
                        </>
                    )}
                </Container>
                <footer className="auth-footer">
                  {getVersion()} - {new Date().getFullYear()} &copy; <a rel="noopener noreferrer" target="_blank" href="https://www.poundpain.com">POUNDPAIN TECH</a>
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
        searchProvider: store.searchProvider,
        landingData: store.landingData,
        setupIntent: store.setupIntent
    }
}

export default connect(mapStateToProps)(RegisterProvider);
