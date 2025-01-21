import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Navbar from '../../components/Navbar';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {contactus} from '../../actions/contactus';
import {subscribe} from '../../actions/subscribe';
import TemplateCheckbox from '../utils/TemplateCheckbox';
import getVersion from '../../version';
import TemplateButton from '../utils/TemplateButton';
import TemplateTextArea from '../utils/TemplateTextArea';
import TemplateTextField from '../utils/TemplateTextField';

class ContactUs extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            contactus:{
                name:'',
                email:'',
                phone: '',
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
        this.nameChange = this.nameChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
        this.messageChange = this.messageChange.bind(this);
        this.subscribeChange = this.subscribeChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
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


    render() {
        return (
        <>
        <Navbar/>
        <Box style={{margin:20}}>
        <Grid container sx="12" justifyContent="center" alignItems="center">
            <Grid item sx="12">
            <>
                {(this.state.contact_us_sent) && ( 
                <h3 className="title">Inquiry Sent!</h3>
                )}
                {(!this.state.contact_us_sent) && ( 
                <>
                <form className="contact-form" action="/">
                        <h3 className="title">Contact Us</h3>
                        <TemplateTextField style={{backgroundColor:"white"}} label="Name" onChange={this.nameChange}/><br/>
                        <TemplateTextField style={{backgroundColor:'white'}} label="Email" onChange={this.emailChange}/>
                        <TemplateTextField style={{backgroundColor:'white'}} label="Phone" onChange={this.phoneChange}/>
                        <TemplateTextArea rows={5} style={{backgroundColor:'white'}} label="Message" onChange={this.messageChange}/>
                        <hr/>
                        <Grid container xs="12">
                            <Grid item xs="1">
                                <input id="t1" type="checkbox" onClick={this.smsChange}/> 
                            </Grid>
                            <Grid item xs="11">
                            <label for="t1">
By checking this box, you agree to receive text messages from Pound Pain related conversational purposes. You may reply "STOP" to opt out anytime. Reply to HELP for assistance. Message and date rates may apply. Message frequency may vary
                            For more information, please refer to our <a style={{color:"black"}} href="/privacy_policy.html">Privacy Policy</a> (https://www.poundpain.com/privacy_policy.html) 
                            </label>
                            </Grid>
                        </Grid>
                        <TemplateButton
                            disabled={!this.state.contactus.sms}
                            style={{marginTop:10,color:"white",width:'100%',backgroundColor:'black'}} onClick={this.contactus} 
                            label='Contact Us'/>
                </form>
                </>
                )}
            </>
            </Grid>
        </Grid>
        </Box>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser
    }
}

export default connect(mapStateToProps)(ContactUs);
