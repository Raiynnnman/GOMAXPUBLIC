import React, { Component } from 'react';
import { connect } from 'react-redux';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import googleKey from '../../googleConfig';
import { push } from 'connected-react-router';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import TemplateButton from '../utils/TemplateButton';
import TemplateTextArea from '../utils/TemplateTextArea';

class UserRegistration extends Component {

    constructor(props) { 
        super(props);
        this.state = { 
            address:null,
            status_id:0,
            inputs: [ 
                {l:'Name',f:'name',t:'text',v:''},
                {l:'Phone',f:'phone',t:'text',v:''},
                {l:'Email',f:'email',t:'text',v:''},
                {l:'DOA',f:'doa',t:'text',v:''},
                {l:'Address',f:'addr',t:'addr_search',v:''},
                {l:'Attny',f:'attorney_name',t:'addr_search',v:''},
                {l:'Language',f:'language',t:'addr_search',v:''},
              ]
        }
        this.markComplete = this.markComplete.bind(this);
        this.markScheduled = this.markScheduled.bind(this);
        this.markNoShow = this.markNoShow.bind(this);
        this.cancel = this.cancel.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.setValue = this.setValue.bind(this);
        this.save = this.save.bind(this);
        this.setVPassword = this.setVPassword.bind(this);
        this.setPassword = this.setPassword.bind(this);
        this.setPhone = this.setPhone.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
        this.setConsultant = this.setConsultant.bind(this);
        this.setEmail= this.setEmail.bind(this);
        this.setFirst = this.setFirst.bind(this);
        this.setLast = this.setLast.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        if (this.props.data && this.props.filled !== undefined && this.props.filled === true) { 
            for (let [key, value] of Object.entries(this.props.data)) { 
                var c = 0;
                for (c = 0; c < this.state.inputs.length; c++) { 
                    if (this.state.inputs[c].f === key) { 
                        this.state.inputs[c].v = value;
                    } 
                    if (key === 'addr') { 
                        this.state.address = {};
                        this.state.address.fulladdr = value;
                    } 
                    if (key === 'status_id') { 
                        this.state.status_id = value;
                    } 
                } 
            }
            this.setState(this.state);
        } 
    }

    cancel() { 
        this.props.onCancel()
    } 

    setValue(e,t) { 
        this.state.tarea = e.target.value;
        this.setState(this.state)
    } 

    updateAddress(e,t,v) { 
        var t = e.value.terms
        var c = t[t.length-2].value ? t[t.length-2].value : ''
        var s = t[t.length-3].value ? t[t.length-3].value : ''
        this.state.address = {
            places_id:e.value.place_id,
            addr1:e.value.structured_formatting.main_text,
            fulladdr:e.label,
            name: this.state.currentName,
            phone: this.state.currentPhone,
            city:c,
            state:s,
            zipcode:0
        }
        this.setState(this.state);
    }

    save() { 
        this.props.onRegister({'value': this.state.tarea})
    } 
    onSearch() { 
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
    markScheduled() { 
        var t = this.props.config.status.filter((g) => g.name === 'SCHEDULED')
        this.props.onRegister({
            id:this.props.data.id,
            status_id: t[0].id
        })
    } 
    markComplete() { 
        var t = this.props.config.status.filter((g) => g.name === 'COMPLETED')
        this.props.onRegister({
            id:this.props.data.id,
            status_id: t[0].id
        })
    } 
    markNoShow() { 
        var t = this.props.config.status.filter((g) => g.name === 'NO_SHOW')
        this.props.onRegister({
            id:this.props.data.id,
            status_id: t[0].id
        })
    } 

    render() {
        var value = '';
        var cntr = 1;
        return (
        <>
            {(this.props.offices && this.props.offices.isReceiving) && (
                <AppSpinner/>
            )}
            <>
            {(this.props.config && this.props.filled !== undefined) && (
                <div style={{marginBottom:20,display: 'flex', alignItems: 'center', justifyContent: 'spread-evenly'}}>
                  <font style={{width:25}}></font>
                    {translate('Status')}:
                    {(this.props.data.status !== 'SCHEDULED') && (
                        <TemplateButton onClick={this.markScheduled} style={{marginRight:10}} color="primary">{translate('Scheduled')}</TemplateButton>
                    )}
                    <TemplateButton onClick={this.markComplete} style={{marginRight:10}} color="primary">{translate('Completed')}</TemplateButton>
                    <TemplateButton onClick={this.markNoShow} style={{marginRight:10}} color="danger">{translate('No Show')}</TemplateButton>
                </div>
            )}
            </>
            {(this.props.error_message) && (
            <Grid container xs="12" xs="12" style={{marginTop:20}}>
                <Grid item xs="12">
                    <font style={{color:'red'}}>{this.props.error_message}</font>       
                </Grid>
            </Grid>
            )}
                <Grid container xs="12" xs="12" style={{margin:20}}>
                    <Grid item xs="2">
                        <Box>
                        Name: Full Name
                        <br/>
                        Phone: Phone
                        <br/>
                        Email: Email
                        <br/>
                        DOA: date of accident (5/16/24)
                        <br/>
                        Address: Address
                        <br/>
                        Attny: Attny
                        <br/>
                        Language: English | Spanish
                        </Box>
                    </Grid>
                </Grid>
            <Grid container xs="12" xs="12" style={{margin:20}}>
                <Grid item xs="12">
                    <TemplateTextArea
                      rows={10} style={{width:500}}
                      placeholder=""
                      onChange={this.setValue} value={this.state.tarea}
                    />
                </Grid>
            </Grid>
            <Grid container xs="12" xs="12" style={{marginTop:20}}>
                <Grid item xs="12" xs="12">
                <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <TemplateButton onClick={this.save} style={{marginRight:10}} label="Save" color="primary">{translate('Save')}</TemplateButton>
                    <TemplateButton outline onClick={this.cancel} label="Cancel" color="primary">{translate('Cancel')}</TemplateButton>
                </div>
                </Grid>
            </Grid>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        searchUser: store.searchUser
    }
}

export default connect(mapStateToProps)(UserRegistration);
