import React, { Component } from 'react';
import Select from 'react-select';
import TextareaAutosize from 'react-autosize-textarea';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import googleKey from '../../googleConfig';
import { push } from 'connected-react-router';
import { Button } from 'reactstrap'; 
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { Form, FormGroup, Label, Input, InputGroup, InputGroupText } from 'reactstrap';
import Login from '../login';

class UserRegistration extends Component {

/*
    date_of_accident DATE,
    description medium_text,
    hospital int not null default 0,
    ambulance int not null default 0,
    witnesses medium_text,
    rep_law_enforcement varchar(255),
    police_report_num varchar(64),
    citations varchar(255),
    citations_person varchar(255),
    passengers mediumtext,
    def_insurance varchar(255),
    def_claim_num varchar(255),
    def_name varchar(255),
    ins_info varchar(255),
    ins_claim_num varchar(255),
    ins_policy_holder varchar(255),
    case_num varchar(255),
    case_verification_who varchar(255) */

    constructor(props) { 
        super(props);
        this.state = { 
            address:null,
            status_id:0,
            inputs: [ 
                {l:'Email',f:'email',t:'text',v:''},
                {l:'Name',f:'name',t:'text',v:''},
                {l:'Phone',f:'phone',t:'text',v:''},
                {l:'Address',f:'addr',t:'addr_search',v:''},
                {l:'Description of accident',f:'description',t:'textfield',v:''},
                {l:'Hospital',f:'hospital',t:'checkbox',v:0},
                {l:'Ambulance',f:'ambulance',t:'checkbox',v:0},
                {l:'Witnesses',f:'witnesses',t:'textfield',v:''},
                {l:'Reporting Law Enforment Agency',f:'rep_law_enforcement',t:'text',v:''},
                {l:'Police Report #',f:'police_report_num',t:'text',v:''},
                {l:'Citations',f:'citations',t:'text',v:''},
                {l:'Who was cited',f:'citations_person',t:'text',v:''},
                {l:'Pics of damage',f:'pics_of_damage',t:'checkbox',v:0},
                {l:'Passengers in Vehicle',f:'passengers',t:'textfield',v:''},
                {l:'Def Insurance Info',f:'def_insurance',t:'text',v:''},
                {l:'Claim #/Policy #',f:'def_claim_num',t:'text',v:''},
                {l:'Def Name#',f:'def_name',t:'text',v:''},
                {l:'PIP Insurance Info',f:'ins_info',t:'text',v:''},
                {l:'Claim #/Policy #',f:'ins_claim_num',t:'text',v:''},
                {l:'Policy Holder',f:'ins_policy_holder',t:'text',v:''},
                {l:'Case #',f:'case_num',t:'text',v:''},
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
        if (this.props.filled !== undefined) { return; }
        var c = 0;
        for (c = 0; c < this.state.inputs.length;c++) { 
            if (this.state.inputs[c].f === e.f) { 
                if(e.t === 'checkbox') { 
                    this.state.inputs[c].v = this.state.inputs[c].v ? 0 : 1
                } else { 
                    this.state.inputs[c].v = t.target.value;
                }
            } 
        } 
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
        var ts = { 
            address:this.state.address
        } 
        var c = 0;
        for (c=0;c<this.state.inputs.length;c++) { 
            var v = this.state.inputs[c]
            ts[v.f] = v.v
        } 
        this.props.onRegister(ts,this.props.data)
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
                  <Label style={{width:200,marginLeft:20,marginRight:20}} for="normal-field" className="text-md-right">
                    {translate('Status')}:
                  </Label>
                    {(this.props.data.status !== 'SCHEDULED') && (
                        <Button onClick={this.markScheduled} style={{marginRight:10}} color="primary">{translate('Scheduled')}</Button>
                    )}
                    <Button onClick={this.markComplete} style={{marginRight:10}} color="primary">{translate('Completed')}</Button>
                    <Button onClick={this.markNoShow} style={{marginRight:10}} color="danger">{translate('No Show')}</Button>
                </div>
            )}
            {this.state.inputs.map((t) => {
                return (
                <Row md="12" xs="12" style={{marginTop:5}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'spread-evenly'}}>
                          <font style={{width:25}}>{cntr++}.</font>
                          <Label style={{width:200,marginLeft:20,marginRight:20}} for="normal-field" className="text-md-right">
                              {translate(t.l)}:
                          </Label>
                        {t.t === 'text' && (
                          <Input type="text" style={{backgroundColor:'white'}}
                            onChange={(e) => this.setValue(t,e)} 
                                value={this.state.inputs.filter((g) => g.f === t.f)[0].v} 
                            placeholder={t.l} />
                        )}
                        {t.t === 'textfield' && (
                            <TextareaAutosize
                              rows={5} style={{backgroundColor:'white'}}
                              placeholder=""
                              onChange={(e) => this.setValue(t,e)} value={this.state.inputs.filter((g) => g.f === t.f)[0].v} 
                              className={`form-control ${s.autogrow} transition-height`}
                            />
                        )}
                        {t.t === 'checkbox' && (
                            <input type='checkbox'
                              onChange={(e) => this.setValue(t,e)} checked={this.state.inputs.filter((g) => g.f === t.f)[0].v} 
                            />
                        )}
                        {(t.t === 'addr_search') && (
                          <>
                          {this.state.address === null && (
                            <div style={{width:'100%'}}>
                              <GooglePlacesAutocomplete style={{backgroundColor:'white'}}
                                    selectProps={{ value, onChange: this.updateAddress }} apiKey={googleKey()}/>
                            </div>
                          )}
                          {this.state.address !== null && (
                          <Input type="text" style={{backgroundColor:'white'}}
                            value={this.state.address.fulladdr}/>
                          )}
                          </>
                        )}
                    </div>
                </Row>
                )
            })}
            </>
            <Row md="12" xs="12" style={{marginTop:20}}>
                <Col md="12" xs="12">
                <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Button onClick={this.save} style={{marginRight:10}} color="primary">{translate('Save')}</Button>
                    <Button outline onClick={this.cancel} color="primary">{translate('Cancel')}</Button>
                </div>
                </Col>
            </Row>
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
