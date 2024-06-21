import React, { Component } from 'react';
import { connect } from 'react-redux';
import MaskedInput from 'react-maskedinput';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
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
import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {loadStripe} from '@stripe/stripe-js';
import { setupIntent } from '../../actions/setupIntent';
import {stripeKey} from '../../stripeConfig.js';
import BillingCreditCardForm from './BillingCreditCardForm';
import { squareAppKey, squareLocationKey } from '../../squareConfig.js';
import { PaymentForm,CreditCard,ApplePay,GooglePay } from 'react-square-web-payments-sdk';
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
            error_message:null,
            pq_id:null,
            coupon:null,
            setPrice:0,
            calculatedPrice:0,
            coupon_id:null,
            couponRed:"$" + 0.00,
            couponRedValue:0,
            addresses:[],
            showAddresses:[],
            intentid:'',
            selPlan:null,
            license:'',
            provtype:1,
            provtypeSel:[
                'Chiropractor'
            ]
        }
        this.nameChange = this.nameChange.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.selectPlan = this.selectPlan.bind(this);
        this.couponChange = this.couponChange.bind(this);
        this.updateVerified = this.updateVerified.bind(this);
        this.getCoupon = this.getCoupon.bind(this);
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
        this.zipcodeChange = this.zipcodeChange.bind(this);
        this.addRow = this.addRow.bind(this);
        this.saveRow = this.saveRow.bind(this);
        this.checkValid = this.checkValid.bind(this);
        this.register = this.register.bind(this);
        this.saveCard= this.saveCard.bind(this);
        this.calculatePrice = this.calculatePrice.bind(this);
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
            } else { 
                this.state.selPlan = null;
            } 
            this.checkValid()
            
        } 
        if (p.landingData && p.landingData.data && p.landingData.data.pricing && this.state.selPlan === null) { 
            this.state.selPlan = p.landingData.data.pricing.filter((e) => parseInt(this.state.plan) === e.id)
            if (this.state.selPlan.length > 0) { 
                this.state.selPlan = this.state.selPlan[0]
            } else { 
                this.state.selPlan = null;
            } 
            this.setState(this.state);
            if (p.landingData.data.do_billing_charge === 0 && this.state.page === 0 && !this.props.match.path.includes("short")) {
                this.setState({ 
                    selPlan: p.landingData.data.all_plans.find((e) => e.placeholder === 1) || {},
                    page: 0 
                });
            }
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
    zipcodeChange(e) { 
        this.state.zipcode = e.target.value;
        this.setState(this.state);
    } 

    selectPlan(e) { 
        this.state.selPlan = e;
        this.setState(this.state);
    } 

    calculatePrice() { 
        if (this.state.selPlan && this.state.selPlan.upfront_cost && this.state.couponRed.replace) { 
            var t = this.state.selPlan.upfront_cost * this.state.selPlan.duration
            t = parseFloat(t + parseFloat(this.state.couponRedValue))
            this.state.setPrice = t.toFixed(2);
            return "$" + t.toFixed(2);
        } 
        else if (this.state.selPlan && this.state.selPlan.upfront_cost) { 
            var t = this.state.selPlan.upfront_cost * this.state.selPlan.duration
            this.state.setPrice = t.toFixed(2);
            return "$" + (t).toFixed(2);
        }
        else { 
            return "$" + "0.00"
        } 
    } 

    couponChange(e) { 
        this.state.coupon = e.target.value;
        this.setState(this.state);
        this.getCoupon();
        this.calculatePrice();
    } 
    getCoupon() { 
        var t = this.state.selPlan.coupons.filter((e) => this.state.coupon === e.name)
        if (t.length > 0) { 
            t = t[0]
            this.state.coupon_id = t.id
            if (t.perc) { 
                var v = this.state.selPlan.upfront_cost * this.state.selPlan.duration
                v = v*t.perc;
                this.state.couponRed = "($" + v.toFixed(2) + ")";
                this.state.couponRedValue = -v.toFixed(2);
                this.setState(this.state)
            } 
            else if (t.total) { 
                var v = this.state.selPlan.upfront_cost * this.state.selPlan.duration
                v = v - t.total;
                this.state.couponRed = "($" + v.toFixed(2) + ")";
                this.state.couponRedValue = -v.toFixed(2);
                this.setState(this.state)
            } 
            else if (t.reduction) { 
                var v = this.state.selPlan.upfront_cost * this.state.selPlan.duration
                v = t.reduction;
                this.state.couponRed = "($" + v.toFixed(2) + ")";
                this.state.couponRedValue = -v.toFixed(2);
                this.setState(this.state)
            } 
        } 
        else {
            this.state.couponRed = "$" + 0.00;
            this.state.couponRedValue = 0.00
        }
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

    dologin() { 
        window.location = "/#/login";
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
        this.setState(this.state);
        this.register()
        // this.nextPage();
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
            cust_id: this.props.setupIntent.data.data.cust_id,
            intent_id: this.props.setupIntent.data.data.id,
            name: this.state.name,
            phone: this.state.phone,
            plan: this.state.selPlan ? this.state.selPlan.id : null,
            provtype:this.state.provtype,
            card: this.state.card,
            last: this.state.last,
            zipcode:this.state.zipcode,
            addresses: a 
        } 
        if (this.state.coupon_id) { 
            tosend.coupon_id = this.state.coupon_id
        } 
        if (this.state.pq_id !== null) {
            tosend.pq_id = this.state.pq_id
            delete tosend.plan
        } 
        this.props.dispatch(registerProvider(tosend,function(err,args) { 
            if (err !== null) { 
                args.state.error_message = err.message;
                args.setState(args.state);
                /* If we fail, get a new setup intent */
                this.props.dispatch(setupIntent()).then((e) =>  { 
                    this.state.newcard = {id:0};
                    this.setState(this.state);
                })
                return;
            } 
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
        console.log("p",this.props);
        console.log("s",this.state);
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
        console.log("p",this.props);
        return (
        <>
            {(this.props.registerProvider && this.props.registerProvider.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.searchProvider && this.props.searchProvider.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12" style={{backgroundColor:"black"}}>
                <Col md="8"> </Col>
                <Col md="4"> 
                    <div class="pull-right" style={{marginTop:20,marginRight:20}}>
                    <Button onClick={this.dologin} style={{backgroundColor:"#fa6a0a"}}>Login</Button>
                    </div>
                </Col>
            </Row>
            {(!this.props.match.path.includes("short")) && (
            <div style={{backgroundColor:'black',display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <img width="20%" height="20%" src='/painlogo.png'/>
            </div>
            )}
            {(this.props.landingData && this.props.landingData.data && this.props.landingData.data.pricing) && (
            <div style={{height:this.props.match.path.includes("short") ? 620 :'',backgroundColor:"black",display: 'flex', alignItems: 'start', justifyContent: 'center'}}>
                <Row md="12">
                {(this.state.selPlan !== null) && (
                    <>
                    {(this.state.page === 0) && (
                    <Widget className="widget-auth mx-auto" 
                        style={{backgroundColor:"black",color:"white"}} title={<h3 style={{color:"white"}} className="mt-0">Register with POUNDPAIN TECH</h3>}>
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
                            <div style={{marginBottom:10,borderBottom:'1px solid black'}}>
                                Practice Name:
                                <input className="form-control no-border" style={{backgroundColor:'white'}} value={this.state.name} onChange={this.nameChange} required name="name" placeholder="Name" />
                            </div>
                            <div style={{marginBottom:10,borderBottom:'1px solid black'}}>
                                Name:
                                <input className="form-control no-border" style={{backgroundColor:'white'}} value={this.state.first} onChange={this.firstChange} required name="first" placeholder="Name" />
                            </div>
                            <div style={{marginBottom:10,borderBottom:'1px solid black'}}>
                                Email:
                                <input className="form-control no-border" style={{backgroundColor:'white'}} value={this.state.email} onChange={this.emailChange} type="email" required name="email" placeholder="Email" />
                            </div>
                            <div style={{marginBottom:10,borderBottom:'1px solid black'}}>
                                Phone:
                                <input className="form-control no-border" style={{backgroundColor:'white'}} value={this.state.phone} onChange={this.phoneChange} type="phone" required name="phone" placeholder="Phone" />
                                    {/*<MaskedInput style={{backgroundColor:'white',border:'0px solid white'}}
                                      className="form-control" id="mask-phone" mask="(111) 111-1111"
                                      onChange={this.phoneChange} value={this.state.phone}
                                      size="10"
                                    />*/}
                            </div>
                            {/*<div style={{marginBottom:0,borderBottom:'1px solid black'}}>
                                Postal Code:
                                <input className="form-control no-border" style={{backgroundColor:'white'}} value={this.state.zipcode} 
                                    onChange={this.zipcodeChange} placeholder="Postal Code" />
                            </div>*/}
                        </form>
                    </Widget>
                    )}
                    {(this.state.page === 0) && (
                    <>
                        <div style={{marginTop:0,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            {(this.props.landingData.data.do_billing_charge===0) && ( 
                            <>
                            <div style={{border:"1px solid black"}}></div>
                            <Button type="submit" onClick={this.register} style={{backgroundColor:"#fa6a0a",color:"white"}} 
                                disabled={!this.state.isValid} size="lg">Register</Button>
                            </>
                            )}
                            {(this.props.landingData.data.do_billing_charge===1) && ( 
                            <>
                            <div style={{border:"1px solid black"}}></div>
                            <Button type="submit" onClick={this.nextPage} style={{backgroundColor:"#fa6a0a",color:"white"}} 
                                disabled={!this.state.isValid} size="lg">Next</Button>
                            </>
                            )}
                        </div>
                    </>
                    )}
                    {(this.state.page === 1 && this.props.landingData.data.do_billing_charge===0) && (
                    <>
                        <h3>ME</h3>
                    </>
                    )}
                    {(this.state.page === 1 && this.props.landingData.data.do_billing_charge===1) && (
                        <>
                        <div style={{marginTop:20}}>
                            <Row md="12">
                                <Col md="12" sx="3">
                                <Card style={{
                                    margin:0,
                                    borderRadius:"10px",color:"white",backgroundColor:"black"}}> 
                                    <CardBody>
                                        {(this.state.error_message) && (
                                        <Row md="12" style={{marginBottom:10}}>
                                            <Col md="12">
                                            <font style={{color:'red',alignText:'center'}}>{this.state.error_message}</font>
                                            </Col>
                                        </Row>
                                        )}
                                        <Row md="12" style={{marginBottom:10,borderBottom:"1px solid white"}}>
                                            <Col md="7">
                                            <font style={{alignText:'left'}}>Description</font>
                                            </Col>
                                            <Col md="5">
                                            <font class="pull-right" style={{marginRight:40,alignText:'right'}}>Price</font>
                                            </Col>
                                        </Row>
                                        <hr/>
                                        <Row md="12" style={{borderBottom:"1px solid white"}}>
                                            <Col md="7">
                                            <font style={{alignText:'left'}}>{this.state.selPlan.description}</font>
                                            </Col>
                                            <Col md="5">
                                            <font class='pull-right' style={{marginRight:20,alignText:'right'}}>${parseFloat(this.state.selPlan.upfront_cost * this.state.selPlan.duration).toFixed(2)}</font>
                                            </Col>
                                        </Row>
                                        {(this.state.selPlan.coupons.length > 0) && (
                                        <Row md="12" style={{borderBottom:"1px solid white"}}>
                                            <Col md="7">
                                                <input className="form-control no-border" 
                                                    style={{marginLeft:0,paddingLeft:0,backgroundColor:'black',color:"white"}} 
                                                    value={this.state.coupon} 
                                                    onInput={this.couponChange} 
                                                    onChange={this.couponChange} placeholder="Enter Coupon Code" />
                                            </Col>
                                            <Col md="5">
                                                <font class="pull-right" style={{textAlign:"right",marginRight:20}}>{this.state.couponRed}</font>
                                            </Col>
                                        </Row>
                                        )}
                                        <hr/>
                                        <Row md="12" style={{borderBottom:"1px solid white"}}>
                                            <Col md="7">
                                            {(this.state.coupon_id !== null) && (     
                                                <font style={{alignText:'left'}}>Total:</font>
                                            )}
                                            {(this.state.coupon_id === null) && (     
                                                <font style={{marginRight:20,alignText:'left'}}>Total:</font>
                                            )}
                                            </Col>
                                            <Col md="5">
                                                {(this.state.coupon_id !== null) && (     
                                                    <font class='pull-right' style={{marginRight:20,alignText:'left'}}>{this.calculatePrice()}</font>
                                                )}
                                                {(this.state.coupon_id === null) && (     
                                                    <font class='pull-right' style={{marginRight:20,alignText:'left'}}>{this.calculatePrice()}</font>
                                                )}
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </Col>
                            </Row> 
                        </div>
                        <div style={{marginTop:20}}>
                        <Row md="12">
                            <Col md="12">
                                <div style={{color:"white"}}>
                                {(this.props.setupIntent && this.props.setupIntent.data &&
                                  this.props.setupIntent.data.data &&
                                  this.props.setupIntent.data.data.id) && (
                                    <Elements stripe={stripePromise} options={{clientSecret:this.props.setupIntent.data.data.clientSecret}}>
                                        <ElementsConsumer>
                                            {(ctx) => <BillingCreditCardForm onSave={this.saveCard} data={this.state} stripe={stripePromise}
                                                onCancel={this.cancel} intentid={this.props.setupIntent.data.data.id} {...ctx} />}
                                        </ElementsConsumer>
                                    </Elements>
                                )}
                                </div>
                            </Col>
                        </Row>
                        </div>
                    </>
                    )}
                    </>
                )}
                {(this.state.selPlan === null) && (
                    this.props.landingData.data.pricing.filter((g) => g.toshow === 1).map((f) => { 
                        return (
                        <Col md="4">
                            <Card style={{border:"1px solid white",margin:20,backgroundColor:"black",color:"white",borderRadius:"10px"}}> 
                                <CardBody style={{margin:0,padding:0,cursor:"pointer"}}>
                                    <div style={{paddingTop:10,borderRadius:"10px 10px 0px 0px",backgroundColor:"#fa6a0a"}}>
                                        <div style={{backgroundColor:"#fa6a0a",borderRadius:"10px",fontSize:"18px",display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            {f.description}
                                        </div>
                                        <div style={{paddingBottom:10,fontWeight:"bold",
                                            fontSize:'34px',backgroundColor:"#fa6a0a",color:"white",
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            ${f.upfront_cost.toFixed(0)}/Month
                                        </div>
                                    </div>
                                    <div style={{fontSize:"17px", padding:10,borderBottom:"1px solid white",display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        {(f.benefits.length > 0) && (
                                        <>
                                            {f.benefits[1].description}
                                        </>
                                        )}
                                    </div>
                                    <div style={{fontSize:"17px", padding:10,borderBottom:"1px solid white",display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        {(f.benefits.length > 0) && (
                                        <>
                                            {f.benefits[2].description}
                                        </>
                                        )}
                                    </div>
                                    <div>
                                    {f.benefits.slice(3).map((h) => { 
                                        return (
                                        <div style={{fontSize:"17px", padding:10,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <>
                                                {h.description}
                                            </>
                                        </div>
                                        )
                                    })}
                                    </div>
                                    <div style={{borderTop:"1px solid white",margin:0,padding:0,display: 'flex', alignItems: 'center', justifyContent: 'start'}}></div>
                                    <div style={{margin:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <Button onClick={() => this.selectPlan(f)} 
                                            style={{backgroundColor:'#fa6a0a',width:"100%"}}>Subscribe</Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        )
                    })
                )}
                </Row>
                
            </div>
            )}
        {(!this.props.match.path.includes("short")) && (
        <div style={{height:"500px",backgroundColor:"black"}}></div>
        )}
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
