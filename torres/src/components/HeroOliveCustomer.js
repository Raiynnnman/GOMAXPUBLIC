import React, { Component } from "react";
import TemplateButton from '../pain/utils/TemplateButton';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import TemplateTextField from '../pain/utils/TemplateTextField';
import TemplateTextFieldPhone from '../pain/utils/TemplateTextFieldPhone';
import TemplateTextFieldZipcode from '../pain/utils/TemplateTextFieldZipcode';
import TemplateTextArea from '../pain/utils/TemplateTextArea';
import TemplateCheckbox from '../pain/utils/TemplateCheckbox';
import Grid from '@mui/material/Grid';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import {patientRegister} from '../actions/patientRegister';


class HeroOliveCustomer extends Component {
    constructor(props) { 
        super(props);
        this.state = {  
            case_type_options: [
                {value:'Accident',label:"Accident"},
            ],
            accept:false,
            thanks:false,
            case_type:'',
            first_name:'',
            last_name:'',
            phone:'',
            email:'',
            description:''
        }
        this.submit = this.submit.bind(this);
    }
    submit(e,t) { 
        this.props.dispatch(patientRegister(this.state));
        this.state.thanks = true;
        this.setState(this.state);
    }
    agreeChange = (e) => { 
        this.state.accept = !this.state.accept;
        this.setState(this.state);
    } 
    updateType = (e,t) => { 
        console.log("ut",e,e.target.value);
        this.state.case_type = e.target.value; 
        this.setState(this.state);
    } 
    updateValue = (e,t) => { 
        console.log("uv",e,t.target.value);
        this.state[e] = t.target.value; 
        this.setState(this.state);
    } 
    render(){
        console.log("s",this.state);
        return(
            <div className={`header-area-customer ${this.props.horizontal} ${this.props.bgshape}`} id="home" >
                <div className="header-bg"/>
                <div className="container h-100 ">
                    <div className="row">
                        <div className="col-lg-12">
                            <Grid container xs={12} style={{zIndex:555}}>
                                <Grid item xs={12} md={5} style={{margin:20}}>
                                    <div style={{backgroundColor:"rgba(0,0,0,.5)",borderRadius:15}}> 
                                    <>
                                        {(this.state.thanks) && (
                                        <>
                                        <div style={{display:"flex",justifyContent:"center"}}>
                                            <div style={{display:"flex",justifyContent:"space-around",marginTop:10}}>
                                                <font style={{fontSize:20}}>Thank you for contacting us. Someone will be in touch shortly</font>
                                            </div>
                                        </div>
                                        </>
                                        )}
                                        {(!this.state.thanks) && (
                                        <>
                                        <div style={{display:"flex",justifyContent:"center"}}>
                                            <div style={{display:"flex",justifyContent:"space-around",marginTop:10}}>
                                                <TemplateTextField style={{backgroundColor:"white",zIndex:555}} 
                                                    value={this.state.first_name} label="First Name" 
                                                    onChange={(e) => this.updateValue("first_name",e)}/>
                                                <TemplateTextField style={{backgroundColor:"white",zIndex:555}} 
                                                    value={this.state.last_name} label="Last Name" onChange={(e) => this.updateValue("last_name",e)}/>
                                            </div>
                                        </div>
                                        <div style={{display:"flex",justifyContent:"center"}}>
                                            <div style={{display:"flex",justifyContent:"space-around",marginTop:10}}>
                                                <TemplateTextFieldPhone style={{backgroundColor:"white",zIndex:555}} 
                                                    value={this.state.phone} label="Phone" onChange={(e) => this.updateValue("phone",e)}/>
                                                <TemplateTextFieldZipcode style={{backgroundColor:"white",zIndex:555}} 
                                                    value={this.state.zipcode} label="Zip Code" onChange={(e) => this.updateValue("zipcode",e)}/>
                                            </div>
                                        </div>
                                        <div style={{display:"flex",justifyContent:"center", marginTop:10}}>
                                                <TemplateTextField style={{width:"85%",backgroundColor:"white",zIndex:555}} 
                                                    value={this.state.email} label="Email" onChange={(e) => this.updateValue("email",e)}/>
                                        </div>
                                        <div style={{display:"flex",justifyContent:"center",marginTop:10}}>
                                                <Select 
                                                    style={{width:"85%",backgroundColor:"white",zIndex:555}} 
                                                    value={this.state.case_type}
                                                    onChange={this.updateType}>
                                                        {this.state.case_type_options.map((e) => { 
                                                            return (
                                                                <MenuItem key={e.key ? e.key : e.value} value={e.value}>{e.label}</MenuItem>
                                                            )
                                                        })}
                                                </Select>
                                        </div>
                                        <div style={{display:"flex",justifyContent:"center", marginTop:10,marginLeft:30,marginRight:30}}>
                                            <TemplateTextArea rows={5} style={{width:"100%",backgroundColor:"white",zIndex:555}} 
                                                value={this.state.description} label="Briefly describe what happened" onChange={(e) => this.updateValue("description",e)}/>
                                        </div>
                                        <div style={{display:"flex",justifyContent:"center", marginTop:10}}>
                                            <div style={{display:"flex",justifyContent:"center",marginTop:10}}>
                                            <TemplateCheckbox boxColor='white' checkColor='black' style={{margin:10,color:"white"}} checked={this.state.agree} 
                                                onClick={this.agreeChange}
                                            label='By submitting this form, I acknowledge and agree to receive communications from PoundPain Tech via email, SMS, and phone call. I consent to PoundPain Tech contacting me for future updates, promotions, and other information.'/>
                                            </div>
                                        </div>
                                        <div style={{display:"flex",justifyContent:"center", marginTop:10}}>
                                            <div style={{display:"flex",justifyContent:"center",marginTop:10,marginBottom:20}}>
                                                <TemplateButton 
                                                    label="Get Help NOW" onClick={this.submit}/>
                                            </div>
                                        </div>
                                        </>
                                        )}
                                    </>
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
});

export default withRouter(connect(mapStateToProps)(HeroOliveCustomer));








