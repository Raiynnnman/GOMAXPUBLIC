import React, { Component } from 'react';
import MaskedInput from 'react-maskedinput';
import Datetime from 'react-datetime';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import TextareaAutosize from 'react-autosize-textarea';
import { Col, Grid } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { FormGroup, Label, Input, InputGroup } from 'reactstrap';
import moment from 'moment/moment'
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {userDocumentsUpdate} from '../../actions/userDocumentsUpdate';
import Appointment from './Appointment.js';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class MyHealthDocuments extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            geo: false,
            form: {
            },
            inputFiles: [],
            selected: null
        }
        this.setLocation = this.setLocation.bind(this);
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.isSaveDisabled = this.isSaveDisabled.bind(this);
        this.authorize = this.authorize.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.updateItemCheckbox = this.updateItemCheckbox.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.state.geo = true;
        this.state.selected = this.props.data;
        this.setState(this.state)
    }

    authorize() { 
      this.state.form.authorized = !this.form.form.authorized;
      var params = { 
        office_id: this.state.selected.id,
        authorized: 1
      } 
      this.setState(this.state)
      //this.props.dispatch(userDocumentsUpdate(params)) 
    } 

    save() { 
        for (let [key, value] of Object.entries(this.state.form)) { 
            if(this.state.form[key]) { 
                this.state.form[key] = 1
            }
            if(!this.state.form[key]) { 
                this.state.form[key] = 0
            }
        }
        var params = { 
            office_id:this.state.selected.office_id,
            documents:this.state.selected.documents,
            form: this.state.form /* TODO */
        } 
        this.props.onSave(params)
    }
    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
        this.props.onCancel(); 
    } 
    addGrid() { 
        this.state.selected.documents.push({
            id:0,description:'',upload:'', email: ''
        })
        this.setState(this.state);
    } 

    setLocation(lat,lon) {
        this.state.mylocation={lat:lat,lon:lon}
        this.setState(this.state);
    }
    onDocumentUpload(e) { 
        this.state.selected = e
        var office_id = e.id
        var docs = this.props.user.data.documents.filter((g) => g.office_id === office_id)
        this.state.selected['documents'] = docs
        this.setState(this.state);
    } 

    addDocument(e,t) { 
    } 

    updateItemCheckbox(e) { 
        var g = e.target.name.indexOf("_");
        var k = e.target.name;
        k = k.slice(0,g);
        for (let [key, value] of Object.entries(this.state.form)) { 
           if (key === e.target.name) { continue; }
           if (!(typeof value === "boolean")) { continue; }
           if (key.includes(k)) { 
                if(this.state.form[key]) { 
                    this.state.form[key] = false
                }
           }
        }
        this.state.form[e.target.name] = !this.state.form[e.target.name] 
        this.setState(this.state);
    } 
    isSaveDisabled() { 
        var cats = []
        for (let [key, value] of Object.entries(this.state.form)) { 
            var g = key.indexOf("_");
            var k = key;
            k = k.slice(0,g);
            if (!cats.includes(k)) { 
                cats.push(k);
            }
        }
        if (!this.state.form.authorized) { return true; } 
        if (!this.state.form.user_patient_name) { return true; } 
        if (!this.state.form.user_dob) { return true; } 
        if (!this.state.form.user_ssn) { return true; } 
        if (!this.state.form.sensitive_signature_patient) { return true; }
        if (!this.state.form.sensitive_signature_patient_date) { return true; }
        if (!this.state.form.acknowledge_signature) { return true; }
        if (!this.state.form.acknowledge_date) { return true; }
        if (!cats.includes('authorization')) { return true; }
        if (!cats.includes('disclosure')) { return true; }
        if (!cats.includes('purpose')) { return true; }
        if (!cats.includes('termination')) { return true; }
        return false;
    } 
    updateItem(e,t) { 
        if (t) { 
            if (t._isAMomentObject) { 
                this.state.form[e] = moment(t).format('YYYY-MM-DD');
            } else { 
                this.state.form[e] = t;
            }
        } else { 
            this.state.form[e.target.name] = e.target.value;
        }
        this.setState(this.state);
    } 
    isValidDate(current) { 
        var yesterday = moment().subtract( 1, 'day' );
        return current.isAfter( yesterday );
    } 

    render() {
        return (
        <>
            <Grid md="12">
                {(this.props.user && this.props.user.data && this.props.user.data.appt && 
                  this.props.user.data.appt.length > 0 && this.state.selected !== null) && (
                    <>
                    <Grid md="12">
                        <Grid item  md="1">
                            Office:
                        </Grid>
                        <Grid item  md="6">
                            {this.state.selected.name}
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="1">
                            Physician:
                        </Grid>
                        <Grid item  md="6">
                            {this.state.selected.title + " " + this.state.selected.first_name + " " + this.state.selected.last_name}
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="12">
                            <font style={{height:30,display:"flex",fontSize:40,alignItems: 'center', justifyContent: 'center',
                                fontWeight:"bold",fontSize:16}}>
                            HIPAA AUTHORIZATION FOR USE OR DISCLOSURE OF HEALTH INFORMATION
                            </font>
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="12">
                            Date: {moment().format('LLL')}
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="12">
                            <div style={{display:"flex"}} >
                                <div>
                                I.	
                                </div>
                                <div style={{marginLeft:10,justifyContent: 'start'}}>
                                <font style={{fontWeight:"bold"}}>THE PATIENT.</font>&nbsp; 
                                    This form is for use when such authorization is required and complies with the Health Insurance Portability and Accountability Act of 1996 (HIPAA) Privacy Standards. 
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:10}}>
                        <Grid item  md="1"></Grid>
                        <Grid item  md="8">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Patient's Name
                            </Label>
                            <Grid item  md={7}>
                              <Input type="text" name="user_patient_name" id="normal-field" 
                                onChange={this.updateItem} placeholder="Name" value={this.state.form.patient_name}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="8">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                                Date of Birth:  
                            </Label>
                            <Grid item  md={7}>
                                <MaskedInput name="user_dob" value={this.state.form.user_dob} 
                                    onChange={this.updateItem}
                                    className="form-control" id="mask-date" mask="1111/11/11" />
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="8">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                                Social Security Number:  
                            </Label>
                            <Grid item  md={7}>
                                <MaskedInput name="user_ssn" value={this.state.form.user_ssn} 
                                    onChange={this.updateItem}
                                    className="form-control" id="mask-date" mask="111-11-1111" />
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="12">
                            <div style={{display:"flex"}} >
                                <div >
                                II.	
                                </div>
                                <div style={{marginLeft:10,flex:1,display: 'flex', justifyContent: 'start'}}>
                                <font style={{fontWeight:"bold"}}>AUTHORIZATION.</font>&nbsp;
                                I authorize {this.state.selected.name} ("Authorized Party") to use or disclose the following: (check one)
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                              <Input name="authorization_all_medical" checked={this.state.form.authorization_all_medical} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '}
                            <Label for="normal-field" style={{marginLeft:5}} className="text-md-right">
                                - All of my medical-related information
                            </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                              <Input name="authorization_only_related" checked={this.state.form.authorization_only_related} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '}
                            <Label for="normal-field" style={{marginLeft:5}} className="text-md-right">
                                - My medical information ONLY related to: {this.state.selected.proc}
                            </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                              <Input name="authorization_medical_date" checked={this.state.form.authorization_medical_date} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '} 
                            <Label for="normal-field" style={{marginLeft:5}} className="text-md-right">
                                - My medical-related information from: 
                                <Grid md="12">
                                    {(this.state.selected.authorization_medical_date) && (
                                    <div className="datepicker" style={{display: 'flex'}}>
                                        <Datetime
                                          name="authorization_medical_date_start"
                                          isValidDate={this.validDate}
                                          closeOnSelect={true}
                                          onChange={date => this.updateItem('authorization_medical_date_start',date)}
                                          id="datepicker"
                                          value={this.state.form.authorization_medical_date_start}
                                          viewMode="days" timeFormat={false}
                                        />
                                      &nbsp; To &nbsp;
                                        <Datetime
                                          id="datepicker"
                                          isValidDate={this.validDate}
                                          closeOnSelect={true}
                                          value={this.state.form.my_medical_date_end}
                                          onChange={date => this.updateItem('authorization_medical_date_end',date)}
                                          name="authorization_medical_date_end"
                                          viewMode="days" timeFormat={false}
                                        />
                                    </div>
                                   )}
                                </Grid>
                            </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                                  <Input name="authorization_other" checked={this.state.form.authorization_other} 
                                        onClick={this.updateItemCheckbox}  type="checkbox" />{' '} 
                                <Label for="normal-field" md="6" style={{marginLeft:5}} className="text-md-right">
                                - Other: 
                                    <Grid md="12">
                                    {(this.state.form.authorization_other) && ( 
                                      <FormGroup row>
                                        <Grid item  md={9}>
                                          <TextareaAutosize
                                              rows={3} 
                                              placeholder="Other"
                                              onChange={this.updateItem}
                                              name="authorization_other_value"
                                              value={this.state.form.authorization_other_value}
                                              className={`form-control ${s.autogrow} transition-height`}
                                          />
                                        </Grid>
                                      </FormGroup>
                                    )}
                                    </Grid>
                                </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="12">
                            <div style={{display:"flex"}} >
                                <div>
                                III.	
                                </div>
                                <div style={{marginLeft:10,flex:1,display: 'flex', justifyContent: 'start'}}>
                                <font style={{fontWeight:"bold"}}>DISCLOSURE.</font>&nbsp; 
                                The Authorized Party has my authorization to disclose Medical Records to: (check one)
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                              <Input name="disclosure_any_authorized_party" checked={this.state.form.disclosure_any_authorized_party} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '}
                            <Label for="normal-field" style={{marginLeft:5}} className="text-md-right">
                                - Any party that is approved by the Authorized Party.
                            </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                                <Input name="disclosure_only_authorized_party" checked={this.state.form.disclosure_only_authorized_party} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '}
                                <Label for="normal-field" style={{marginLeft:5}} className="text-md-right">
                                    - ONLY the following party:
                                    {(this.state.form.disclosure_only_authorized_party) && ( 
                                    <>
                                    <Grid md="12" style={{marginTop:5}}>
                                      <FormGroup row>
                                        <Label for="normal-field" md={4} className="text-md-right">
                                            Name:
                                        </Label>
                                        <Grid item  md={7}>
                                          <Input type="text" name="disclosure_only_authorized_name" id="normal-field" 
                                            onChange={this.updateItem} placeholder="Name" 
                                            value={this.state.form.disclosure_only_authorized_name}/>
                                        </Grid>
                                      </FormGroup>
                                    </Grid>
                                    <Grid md="12">
                                      <FormGroup row>
                                        <Label for="normal-field" md={4} className="text-md-right">
                                            Address:
                                        </Label>
                                        <Grid item  md={7}>
                                          <TextareaAutosize
                                              name="disclosure_only_authorized_address"
                                              rows={3} id="elastic-textarea"
                                              placeholder="Address"
                                              value={this.state.form.disclosure_only_authorized_address}
                                              className={`form-control ${s.autogrow} transition-height`}
                                          />
                                        </Grid>
                                      </FormGroup>
                                    </Grid>
                                    <Grid md="12">
                                      <FormGroup row>
                                        <Label for="normal-field" md={4} className="text-md-right">
                                            Phone:
                                        </Label>
                                        <Grid item  md={7}>
                                          <Input type="text" name="disclosure_only_authorized_phone" id="normal-field" 
                                            onChange={this.updateItem} placeholder="Phone" 
                                            value={this.state.form.disclosure_only_authorized_phone}/>
                                        </Grid>
                                      </FormGroup>
                                    </Grid>
                                    <Grid md="12">
                                      <FormGroup row>
                                        <Label for="normal-field" md={4} className="text-md-right">
                                            Fax:
                                        </Label>
                                        <Grid item  md={7}>
                                          <Input type="text" name="disclosure_only_authorized_fax" id="normal-field" 
                                            onChange={this.updateItem} placeholder="Fax" 
                                            value={this.state.form.disclosure_only_authorized_fax}/>
                                        </Grid>
                                      </FormGroup>
                                    </Grid>
                                    <Grid md="12">
                                      <FormGroup row>
                                        <Label for="normal-field" md={4} className="text-md-right">
                                            Email:
                                        </Label>
                                        <Grid item  md={7}>
                                          <Input type="text" name="disclosure_only_authorized_email" id="normal-field" 
                                            onChange={this.updateItem} placeholder="Email" 
                                            value={this.state.form.disclosure_only_authorized_email}/>
                                        </Grid>
                                      </FormGroup>
                                    </Grid>
                                    </>
                                    )}
                                </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="12">
                            <div style={{display:"flex"}} >
                                <div >
                                IV.	
                                </div>
                                <div style={{marginLeft:10,flex:1,display: 'flex', justifyContent: 'start'}}>
                                <font style={{fontWeight:"bold"}}>PURPOSE.</font>&nbsp;
                                The reason for this authorization is: (check one)
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                              <Input name="purpose_general_purpose" checked={this.state.form.purpose_general_purpose} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '} 
                            <Label for="normal-field" style={{marginLeft:5}} className="text-md-right">
                                - General Purpose. At my request (general).
                            </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                              <Input name="purpose_to_receive_payment" checked={this.state.form.purpose_to_receive_payment} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '} 
                            <Label for="normal-field" style={{marginLeft:5}} className="text-md-right">
                                - To Receive Payment. To allow the Authorized Party to communicate with me for marketing purposes when they receive payment from a third party.
                            </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                              <Input name="purpose_to_sell_medical" checked={this.state.form.purpose_to_sell_medical} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '} 
                            <Label for="normal-field" style={{marginLeft:5}} className="text-md-right">
                                - To Sell Medical Records. To allow the Authorized Party to sell my Medical Records. I understand that the Authorized Party will receive compensation for the disclosure of my Medical Records and will stop any future sales if I revoke this authorization.
                            </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                              <Input name="purpose_other" checked={this.state.form.purpose_other} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '} 
                            <Label for="normal-field" md={8} style={{marginLeft:5}} className="text-md-right">
                                - Other: 
                                    <Grid md="12">
                                    {(this.state.form.purpose_other) && ( 
                                      <FormGroup row>
                                        <Grid item  md={7}>
                                          <TextareaAutosize
                                              rows={3} id="elastic-textarea"
                                              placeholder="Other"
                                              name="purpose_other_value"
                                              onChange={this.updateItemCheckbox}
                                              value={this.state.form.purpose_other_value}
                                              className={`form-control ${s.autogrow} transition-height`}
                                          />
                                        </Grid>
                                      </FormGroup>
                                    )}
                                    </Grid>
                            </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="12">
                            <div style={{display:"flex"}} >
                                <div >
                                V.	
                                </div>
                                <div style={{marginLeft:10,flex:1,display: 'flex', justifyContent: 'start'}}>
                                <font style={{fontWeight:"bold"}}>TERMINATION.</font>&nbsp;
                                This authorization will terminate: (check one)
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                              <Input name="termination_written_rev" checked={this.state.form.termination_written_rev} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '} 
                            <Label for="normal-field" style={{marginLeft:5}} className="text-md-right">
                                - Upon sending a written revocation to the Authorization Party.
                            </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                              <Input name="termination_on_date" checked={this.state.form.termination_on_date} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '} 
                            <Label for="normal-field" style={{marginLeft:5}} className="text-md-right">
                                - On the following date: 
                                    {(this.state.form.termination_on_date) && (
                                    <Datetime
                                      name="termination_on_date_value"
                                      isValidDate={this.validDate}
                                      closeOnSelect={true}
                                      onChange={date => this.updateItem('termination_on_date_value',date)}
                                      id="datepicker"
                                      value={this.state.form.termination_on_date_value}
                                      viewMode="days" timeFormat={false}
                                    />
                                    )}
                            </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                              <Input name="termination_other" checked={this.state.form.termination_other} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '} 
                            <Label for="normal-field" md={8} style={{marginLeft:5}} className="text-md-right">
                                - Other: 
                                    <Grid md="12">
                                    {(this.state.form.termination_other) && (
                                      <FormGroup row>
                                        <Grid item  md={7}>
                                          <TextareaAutosize
                                              rows={3} id="elastic-textarea"
                                              placeholder="Other"
                                              onChange={this.updateItem}
                                              name="termination_other_value"
                                              value={this.state.form.purpose_other_value}
                                              className={`form-control ${s.autogrow} transition-height`}
                                          />
                                        </Grid>
                                      </FormGroup>
                                    )}
                                    </Grid>
                            </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="12">
                            <div style={{display:"flex"}} >
                                <div >
                                VI.	
                                </div>
                                <div style={{marginLeft:10,flex:1,display: 'flex', justifyContent: 'start'}}>
                                <font style={{fontWeight:"bold"}}>ACKNOWLEDGMENT OF RIGHTS.</font>&nbsp;
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="12" style={{marginBottom:10}}>
                            I understand that I have the right to revoke this authorization, in writing and at any time, except where uses or disclosures have already been made based upon my original permission. I might not be able to revoke this authorization if its purpose was to obtain insurance.
                        </Grid>
                        <Grid item  md="12" style={{marginBottom:10}}>
                            I understand that uses and disclosures already made based upon my original permission cannot be taken back. 
                        </Grid>
                        <Grid item  md="12" style={{marginBottom:10}}>
                            I understand that it is possible that Medical Records and information used or disclosed with my permission may be re-disclosed by a recipient and no longer protected by the HIPAA Privacy Standards. 
                        </Grid>
                        <Grid item  md="12" style={{marginBottom:10}}>
                            I understand that treatment by any party may not be conditioned upon my signing of this authorization (unless treatment is sought only to create Medical Records for a third party or to take part in a research study) and that I may have the right to refuse to sign this authorization.
                        </Grid>
                        <Grid item  md="12" style={{marginBottom:10}}>
                            I will receive a copy of this authorization after I have signed it. A copy of this authorization is as valid as the original.
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="8">
                          <FormGroup row>
                            <Label for="normal-field" md={2} className="text-md-right">
                                Signature:  
                            </Label>
                            <Grid item  md={7}>
                              <Input type="text" name="acknowledge_signature" id="normal-field" 
                                onChange={this.updateItem} placeholder="Name" value={this.state.form.acknowledge_signature}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="8">
                          <FormGroup row>
                            <Label for="normal-field" md={2} className="text-md-right">
                                Date:  
                            </Label>
                            <Grid item  md={7}>
                                <Datetime
                                  name="acknowledge_date"
                                  isValidDate={this.validDate}
                                  closeOnSelect={true}
                                  onChange={date => this.updateItem('acknowledge_date',date)}
                                  id="datepicker"
                                  value={this.state.form.acknowledge_date}
                                  viewMode="days" timeFormat={false}
                                />
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="12">
                            <font style={{height:30,display:"flex",fontSize:40,alignItems: 'center', justifyContent: 'center',
                                fontWeight:"bold",fontSize:16}}>
                            (IF THE PATIENT IS UNABLE TO SIGN, USE THE SIGNATURE AREA BELOW)
                            </font>
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="12">
                            The patient is unable to sign due to: (check one)
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="1"></Grid>
                        <Grid item  md="6">
                            <div style={{display:"flex"}} >
                              <Input name="patient_unable_minor" checked={this.state.form.patient_unable_minor} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '} 
                              <Label for="checkbox1" check>
                                &nbsp; - Being a minor. Patient is considered a minor under state law.
                                {(this.state.form.patient_unable_minor) && ( 
                                  <Input type="text" name="patient_unable_age" id="normal-field" 
                                    onChange={this.updateItem} placeholder="Age" 
                                    value={this.state.form.patient_unable_age}/>
                                )}
                              </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="1"></Grid>
                        <Grid item  md="6">
                            <div style={{display:"flex"}} >
                              <Input name="patient_unable_incapacitated_condition" 
                                    checked={this.state.form.patient_unable_incapacitated_condition} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '}
                              <Label for="checkbox1" check>
                                &nbsp; - Being Incapacitated. Patient is incapacitated due to:
                                {(this.state.form.patient_unable_incapacitated_condition) && (
                                  <Input type="text" name="patient_unable_incapacitated_condition_value" id="normal-field" 
                                    onChange={this.updateItem} placeholder="Condition" 
                                    value={this.state.form.patient_unable_incapacitated_condition_value}/>
                                )}
                              </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="1"></Grid>
                        <Grid item  md="6">
                            <div style={{display:"flex"}} >
                              <Input name="patient_unable_incapacitated_other" 
                                    checked={this.state.form.patient_unable_incapacitated_other} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '}
                              <Label for="checkbox1" check>
                               &nbsp; - Other:
                                    {(this.state.form.patient_unable_incapacitated_other) && (
                                      <TextareaAutosize
                                          rows={3} 
                                          placeholder="Other"
                                          onChange={this.updateItem}
                                          name="patient_unable_incapacitated_other_value"
                                          value={this.state.form.patient_unable_incapacitated_other_value}
                                          className={`form-control ${s.autogrow} transition-height`}
                                      />
                                    )}
                              </Label>
                            </div>
                        </Grid>
                    </Grid>
                    {(this.state.form.patient_unable_incapacitated_other || 
                      this.state.form.patient_unable_incapacitated_condition ||
                      this.state.form.patient_unable_minor) && (
                    <Grid md="12">
                        <Grid item  md="11">
                          <FormGroup row>
                            <Label for="normal-field" md={3} className="text-md-right">
                                Representative Signature:  
                            </Label>
                            <Grid item  md={8}>
                                <div style={{display:"flex"}} >
                                  <Input type="text" name="patient_unable_signature" id="normal-field" 
                                    onChange={this.updateItem} placeholder="Name" value={this.state.form.patient_unable_signature}/>
                                    <Datetime
                                      name="patient_unable_date"
                                      isValidDate={this.validDate}
                                      closeOnSelect={true}
                                      onChange={date => this.updateItem('patient_unable_date',date)}
                                      id="datepicker"
                                      value={this.state.form.termination_on_date_value}
                                      viewMode="days" timeFormat={false}
                                    />
                                    <Input type="text" name="patient_unable_relation" id="normal-field" 
                                        onChange={this.updateItem} placeholder="RelationShip" value={this.state.form.patient_unable_relation}/>
                                </div>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    )}
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="12">
                            <div style={{display:"flex"}} >
                              <Input name="authorized" checked={this.state.form.authorized} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '}
                              <Label for="checkbox1" check>
                                I authorize {this.state.selected.name} to use my medical information for this purpose
                              </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="12">
                            <font style={{height:30,display:"flex",fontSize:40,alignItems: 'center', justifyContent: 'center',
                                fontWeight:"bold",fontSize:16}}>
                            ADDITIONAL CONSENT FOR CERTAIN CONDITIONS
                            </font>
                        </Grid>
                    </Grid>
                    <Grid md="12" style={{marginTop:5}}>
                        <Grid item  md="12">
                            <div style={{display:"flex"}} >
                                <div>
                                I.	
                                </div>
                                <div style={{marginLeft:10,justifyContent: 'start'}}>
                                <font style={{fontWeight:"bold"}}>SENSITIVE INFORMATION.</font>&nbsp; 
                                    This medical record may contain information about physical or sexual abuse, alcoholism, drug abuse, sexually transmitted diseases, abortion, or mental health treatment. Separate consent must be given before this information can be released.
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                              <Input name="sensitive_consent" checked={this.state.form.sensitive_consent} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '} 
                            <Label for="normal-field" style={{marginLeft:5}} className="text-md-right">
                                - I consent to have the above information released.
                            </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="1"></Grid>
                        <Grid item  md="11">
                            <div style={{display:"flex"}} >
                              <Input name="sensitive_do_not_consent" checked={this.state.form.sensitive_do_not_consent} 
                                    onClick={this.updateItemCheckbox}  type="checkbox" />{' '} 
                            <Label for="normal-field" style={{marginLeft:5}} className="text-md-right">
                                - I do not consent to have the above information released.
                            </Label>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="8">
                          <FormGroup row>
                            <Label for="normal-field" md={2} className="text-md-right">
                                Signature:  
                            </Label>
                            <Grid item  md={7}>
                                <div style={{display:"flex"}} >
                                  <Input type="text" name="sensitive_signature_patient" id="normal-field" style={{marginRight:5}}
                                    onChange={this.updateItem} placeholder="Name" value={this.state.form.sensitive_signature_patient}/>
                                    <Datetime
                                      name="sensitive_signature_patient_date"
                                      isValidDate={this.validDate}
                                      closeOnSelect={true}
                                      onChange={date => this.updateItem('sensitive_signature_patient_date',date)}
                                      id="datepicker"
                                      value={this.state.form.sensitive_signature_patient_date}
                                      viewMode="days" timeFormat={false}
                                    />
                                </div>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    </>
                )}
            </Grid>
            <hr/>
            <Grid md="12">
                <Grid item  md="6">
                    {(this.isSaveDisabled()) && (<Button disabled={true} color="primary">Save</Button>)}
                    {(!this.isSaveDisabled()) && (<Button onClick={this.save} color="primary">Save</Button>)}
                    <Button outline style={{marginLeft:10}} onClick={this.props.onCancel} color="secondary">Cancel</Button>
                </Grid>
            </Grid>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        user: store.user
    }
}

export default connect(mapStateToProps)(MyHealthDocuments);
