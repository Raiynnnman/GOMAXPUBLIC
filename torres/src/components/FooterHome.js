import React, { Component } from "react";
import {contactus} from '../actions/contactus';
import { connect } from 'react-redux';
import {subscribe} from '../actions/subscribe';
import TemplateCheckbox from '../pain/utils/TemplateCheckbox';
import getVersion from '../version';
import TemplateButton from '../pain/utils/TemplateButton';
import TemplateTextArea from '../pain/utils/TemplateTextArea';
import TemplateTextField from '../pain/utils/TemplateTextField';
class FooterHome extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            contactus:{
                name:'',
                email:'',
                phone:'',
                agree:false,
                sms:false,
                message:''
            },
            contact_us_sent:false,
            subscribe_sent:false,
            maillist:'',
        } 
        this.agreeChange = this.agreeChange.bind(this);
        this.smsChange = this.smsChange.bind(this);
        this.contactus = this.contactus.bind(this);
        this.mailinglist = this.mailinglist.bind(this);
        this.nameChange = this.nameChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
        this.messageChange = this.messageChange.bind(this);
        this.subscribeChange = this.subscribeChange.bind(this);
    }
    agreeChange(e) { 
        this.state.contactus.agree = e.target.value;
        this.setState(this.state);
    } 
    smsChange(e) { 
        this.state.contactus.sms = e.target.value;
        this.setState(this.state);
    } 
    nameChange(e) { 
        this.state.contactus.name = e.target.value;
        this.setState(this.state);
    } 
    emailChange(e) {  
        this.state.contactus.email = e.target.value;
        this.setState(this.state);
    } 
    phoneChange(e) {  
        this.state.contactus.phone = e.target.value;
        this.setState(this.state);
    } 
    messageChange(e) {  
        this.state.contactus.message = e.target.value;
        this.setState(this.state);
    } 
    subscribeChange(e) {  
        this.state.maillist = e.target.value;
        this.setState(this.state);
    } 

    contactus() { 

        this.props.dispatch(contactus(this.state.contactus,function(err,args) { 
            args.state.contact_us_sent = true;
            args.setState(args.state);
        },this));

    } 

    mailinglist() { 

        this.props.dispatch(subscribe({email:this.state.maillist},function(err,args) { 
            args.state.subscribe_sent = true;
            args.setState(args.state);
        },this));

    } 
    
    render(){
        return(
            <div>
                <div className={`footer-area ${this.props.horizontal}`} id="support">
                    <div className="footer-bg"/>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="section-title text-center mb--40">
                                    <h2 className="text-white">GET <span style={{color:'#fa6a0a'}}>IN TOUCH</span></h2>
                                    <img className="image-1" src={require('../assets/images/app/title-icon-3.png')} alt="App Landing"/>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-5 col-xl-4 offset-xl-1">
                                <div className="contact-inner">
                                <>
                                    {(this.state.contact_us_sent) && ( 
                                    <h3 className="title">Inquiry Sent!</h3>
                                    )}
                                    {(!this.state.contact_us_sent) && ( 
                                    <>
                                    <h3 className="title">Say Hello!</h3>
                                    <form className="contact-form" action="/">
                                            <TemplateTextField style={{backgroundColor:"white"}} label="Name" onChange={this.nameChange}/>
                                            <TemplateTextField style={{backgroundColor:'white'}} label="Email" onChange={this.emailChange}/>
                                            <TemplateTextField style={{backgroundColor:'white'}} label="Phone" onChange={this.phoneChange}/>
                                            <TemplateTextArea rows={5} style={{backgroundColor:'white'}} label="Message" onChange={this.messageChange}/>
                                            <hr/>
                                            <TemplateCheckbox boxColor='white' checkColor='black' style={{color:"white"}} checked={this.state.contactus.agree} 
                                                onClick={this.agreeChange}
                                            label='By submitting this form, I acknowledge and agree to receive communications from PoundPain Tech via email, SMS, and phone call. I consent to PoundPain Tech contacting me for future updates, promotions, and other information.'/>
                                            <hr/>
                                            <TemplateCheckbox boxColor='white' checkColor='black' style={{color:"white"}} checked={this.state.contactus.sms} 
                                                onClick={this.smsChange}
                                                label='I consent to receive SMS from PoundPain Reply STOP to opt-out; Reply HELP; Message and data rates apply; Messaging frequency may vary'/>
                                            <a style={{marginLeft:90,color:"white"}} href="https://www.poundpain.com/privacy_policy.html">Privacy Policy</a>
                                            <TemplateButton
                                                disabled={!this.state.contactus.agree}
                                                style={{marginTop:10,color:"white",width:'100%',backgroundColor:'black'}} onClick={this.contactus} 
                                                label='Contact Us'/>
                                    </form>
                                    </>
                                    )}
                                </>
                                </div>
                            </div>
                            <div className="col-lg-5 offset-lg-2 col-xl-4 offset-xl-2 mt_md--40 mt_sm--40">
                                <div className="contact-inner">
                                    <h3 className="title">Contact Us</h3>
                                    <div className="conatct-info">
                                        <div className="single-contact-info">
                                            <div className="contact-icon">
                                                <i className="zmdi zmdi-phone"></i>
                                            </div>
                                            <div className="contact-text">
                                                <span>(407) 305-7241<br />(407) 305-7241
                                                </span>
                                            </div>
                                        </div>
                                        <div className="single-contact-info">
                                            <div className="contact-icon">
                                                <i className="zmdi zmdi-globe-alt"></i>
                                            </div>
                                            <div className="contact-text">
                                                <span>mailto:info@poundpain.com<br />
                                                    https://poundpain.com/
                                                </span>
                                            </div>
                                        </div>
                                        <div className="single-contact-info">
                                            <div className="contact-icon">
                                                <i className="zmdi zmdi-view-headline"></i>
                                            </div>
                                            <div className="contact-text">
                                                <a href="/terms_of_service.html" style={{color:"white"}} rel="noreferrer" target='_blank'>Terms and Conditions</a>
                                            </div>
                                        </div>
                                        <div className="single-contact-info">
                                            <div className="contact-icon">
                                                <i className="zmdi zmdi-view-toc"></i>
                                            </div>
                                            <div className="contact-text">
                                                <a href="/privacy_policy.html" style={{color:"white"}} rel="noreferrer" target='_blank'>Privacy Policy</a>
                                            </div>
                                        </div>
                                        <div className="single-contact-info">
                                            <div className="contact-icon">
                                                <i className="zmdi zmdi-pin"></i>
                                            </div>
                                            <div className="contact-text">
                                                <span>121 S Orange Ave. Suite. 1220<br /> Orlando, FL 32801</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-8 offset-lg-2 col-xl-6 offset-xl-3">
                                <div className="newsletter text-center">
                                    <h3 className="text-white title">SUBSCRIBE FOR OUR NEWSLETTER</h3>
                                    <form action="/" method="post" id="newsletter">
                                        <div className="newsletter-content" style={{display:'flex',justifyContent:'space-around'}}>
                                            <TemplateTextField style={{backgroundColor:'white',width:"100%"}} onChange={this.subscribeChange} name="email" 
                                                label="Enter your Email address" />
                                            <TemplateButton 
                                                disabled={this.state.maillist.length < 1}
                                                style={{color:"white",backgroundColor:'black'}}
                                                onClick={this.mailinglist}
                                                label='Subscribe'/>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-8 offset-lg-2 col-xl-4 offset-xl-4">
                                <div className="footer-links text-center">
                                    <a href="https://www.facebook.com/poundpainusa" rel="noreferrer" target='_blank'><i className="zmdi zmdi-facebook"></i></a>
                                    <a href="https://www.instagram.com/poundpain/" rel="noreferrer" target='_blank'><i className="zmdi zmdi-instagram"></i></a>
                                </div>
                                <div className="footer-text text-center">
                                    <span>Copyright © {new Date().getFullYear()} <a href="https://www.poundpain.com">POUNDPAIN TECH - {getVersion()}</a></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tap-top">
                    <div>
                        <i className="zmdi zmdi-long-arrow-up"></i>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(store) {
    return {
        contactus: store.contactus,
        subscribe: store.subscribe
    }
}

export default connect(mapStateToProps)(FooterHome);






