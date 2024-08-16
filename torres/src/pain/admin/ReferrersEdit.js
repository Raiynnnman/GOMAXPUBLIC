import React, { Component } from 'react';
import LaunchIcon from '@mui/icons-material/Launch';
import SaveIcon from '@mui/icons-material/Save';
import "react-datetime/css/react-datetime.css";
import Datetime from 'react-datetime';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import Office365SSO from '../utils/Office365SSO';
import { registrationAdminUpdate } from '../../actions/registrationAdminUpdate';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteIcon from '@mui/icons-material/Delete';
import TemplateTextArea from '../utils/TemplateTextArea';
import moment from 'moment';
import LocationCard from '../office/LocationCard';
import UserCard from '../office/UserCard';
import { connect } from 'react-redux';
import formatPhoneNumber from '../utils/formatPhone';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PainTable from '../utils/PainTable';
import TemplateSelect from '../utils/TemplateSelect';
import TemplateSelectEmpty from '../utils/TemplateSelectEmpty';
import TemplateSelectMulti from '../utils/TemplateSelectMulti';
import TemplateTextField from '../utils/TemplateTextField';
import TemplateTextFieldPhone from '../utils/TemplateTextFieldPhone';
import TemplateCheckbox from '../utils/TemplateCheckbox';
import TemplateButton from '../utils/TemplateButton';
import TemplateButtonIcon from '../utils/TemplateButtonIcon';
import TemplateBadge from '../utils/TemplateBadge';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import envConfig from '../../envConfig';
import ContactCard from '../office/ContactCard';


const buttonStyle = {
    backgroundColor: '#fa6a0a',
    color: 'white',
    '&:hover': {
        backgroundColor: '#e55d00',
    },
    borderRadius: '10px',
    padding: '8px 16px',
    width: '100%',
    textTransform: 'none',
    marginTop: '12px'
};
const cardStyle = {
    height: '100%',
    marginBottom:12,
    borderRadius:5,
    '&:hover': {
        backgroundColor: '#FFFAF2',
    },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '16px',
    boxSizing: 'border-box'
};

class RegistrationsEdit extends Component {
    constructor(props) { 
        super(props);
        this.updatePhone = this.updatePhone.bind(this);
        this.editUser = this.editUser.bind(this);
        this.addAddress = this.addAddress.bind(this);
        this.editAddress = this.editAddress.bind(this);
        this.addContact = this.addContact.bind(this);
        this.editContact = this.editContact.bind(this);
        this.save = this.save.bind(this);
        this.updateName = this.updateName.bind(this);
        this.updateBusinessName = this.updateBusinessName.bind(this);
        this.updateBASName = this.updateBASName.bind(this);
        this.onCommissionChange = this.onCommissionChange.bind(this);
        this.onSetterChange = this.onSetterChange.bind(this);
        this.updateEmail = this.updateEmail.bind(this);
        this.updateFirst = this.updateFirst.bind(this);
        this.onPresentedStatusChange = this.onPresentedStatusChange.bind(this);
        this.onSourceChange = this.onSourceChange.bind(this);
        this.updateLast = this.updateLast.bind(this);
        this.websiteUpdate = this.websiteUpdate.bind(this);
        this.donotCallChange = this.donotCallChange.bind(this);
        this.dealTrackerChange = this.dealTrackerChange.bind(this);
        this.refundRequestChange  =this.refundRequestChange.bind(this);
        this.setDate  =this.setDate.bind(this);
        this.presentDate  =this.presentDate.bind(this);
        this.ecdDate  =this.ecdDate.bind(this);
        this.setToPresentDate = this.setToPresentDate.bind(this);
        this.changeCloseRequirements  =this.changeCloseRequirements.bind(this);
        this.closeDate = this.closeDate.bind(this);
        this.close = this.close.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.updateDealValue = this.updateDealValue.bind(this);
        this.changePresentationResult = this.changePresentationResult.bind(this);
        this.onActionStatusChange = this.onActionStatusChange.bind(this);
        this.onActionTypeChange = this.onActionTypeChange.bind(this);
        this.onCallStatusChange = this.onCallStatusChange.bind(this);
        this.onAltStatusChange = this.onAltStatusChange.bind(this);
        this.onTypeChange = this.onTypeChange.bind(this);
        this.onLeadStrengthChange = this.onLeadStrengthChange.bind(this);
        this.onPlansChange = this.onPlansChange.bind(this);
        this.addComment = this.addComment.bind(this);
        this.saveComment = this.saveComment.bind(this);
        this.saveContact = this.saveContact.bind(this);
        this.cancelComment = this.cancelComment.bind(this);
        this.onCancelEvent = this.onCancelEvent.bind(this);
        this.onCreateEvent = this.onCreateEvent.bind(this);
        this.comment = this.comment.bind(this);
        this.action = this.action.bind(this);
        this.addAction = this.addAction.bind(this);
        this.editAction = this.editAction.bind(this);
        this.saveAction = this.saveAction.bind(this);
        this.cancelAction = this.cancelAction.bind(this);
        this.onCouponChange = this.onCouponChange.bind(this);
        this.toggleSubTab = this.toggleSubTab.bind(this);
        this.state = { 
            selected: null,
            savedAction:{},
            addContactButton:true,
            statusAltSelected:null,
            actionIdx:null,
            subTab: "comments",
        } 
    } 

    componentDidMount() { 
        this.state.selected = this.props.selected;
        if (envConfig() !== 'prod') { 
            this.state.selected.email = 'dev@poundpain.com';
        } 
        this.setState(this.state);
    } 

    editContact(e,t) { 
        var v = this.state.selected.phones.findIndex((f) => f.id === e.id)
        if (v < 0) { 
            this.state.selected.phones.push(e);
        } else { 
            this.state.selected.phones[v] = e;
        } 
        this.state.addContactButton = true;
        this.setState(this.state)
    } 

    editAddress(e,t) { 
        var v = this.state.selected.addr.findIndex((f) => f.id === e.id)
        if (v < 0) { 
            this.state.selected.addr.push(e);
        } else { 
            this.state.selected.addr[v] = e;
        } 
        this.state.addButton = true;
        this.setState(this.state)
    } 

    saveContact() { 
        this.state.addContactButton = true;
        this.setState(this.state)
    } 

    editAction(e) { 
        var g = this.state.selected.actions.findIndex((f) => f.id === e.id);
        if (g > -1) { 
            this.state.actionIdx = g;
            this.state.selected.actions[g].edit = true;
            this.state.savedAction = JSON.parse(JSON.stringify(this.state.selected.actions[g]));
            this.setState(this.state);
        } 
    }

    addAction() { 
        this.state.selected.actions.unshift({new:true,id:'new', text:''})
        this.state.actionIdx = 0;
        this.setState(this.state);
    }

    saveAction(e) { 
        this.state.selected.actions[this.state.actionIdx].edit=false;
        this.state.actionIdx = null;
        this.setState(this.state);
    }

    cancelAction(e) { 
        this.state.selected.actions[this.state.actionIdx]=JSON.parse(JSON.stringify(this.state.savedAction));
        this.state.selected.actions[this.state.actionIdx].edit=false;
        this.state.actionIdx = null;
        this.state.savedAction = {};
        this.setState(this.state);
    }

    addComment() { 
        this.state.selected.comments.unshift({text:'',edit:true})
        this.setState(this.state);
    }

    saveComment(e) { 
        this.state.selected.comments[0].edit=false;
        this.setState(this.state);
    }

    cancelComment(e) { 
        this.state.selected.comments.shift();
        this.setState(this.state);
    }

    toggleSubTab(e,t) { 
        this.state.subTab = t;
        this.setState(this.state);
    } 

    action(e) { 
        this.state.selected.actions[this.state.actionIdx].action=e.target.value
        this.setState(this.state);
    }

    comment(e) { 
        this.state.selected.comments[0].text=e.target.value
        this.setState(this.state);
    }
    save() { 
        var tosend = { 
            email:this.state.selected.email,
            name: this.state.selected.name,
            do_not_contact: this.state.selected.do_not_contact,
            provider_queue_presented_status_id: this.state.selected.provider_queue_presented_status_id,
            provider_queue_presented_status_id: this.state.selected.provider_queue_presented_status_id,
            set_to_present_date: this.state.selected.set_to_present_date,
            business_name: this.state.selected.business_name,
            doing_business_as_name: this.state.selected.doing_business_as_name,
            provider_queue_source_id: this.state.selected.provider_queue_source_id,
            set_date: this.state.selected.set_date,
            include_on_deal_tracker:this.state.selected.include_on_deal_tracker,
            deal_value:this.state.selected.deal_value,
            presentation_result:this.state.selected.presentation_result,
            refund_requested:this.state.selected.refund_requested,
            present_date:this.state.selected.present_date,
            estimated_close_date:this.state.selected.estimated_close_date,
            closed_date:this.state.selected.closed_date,
            close_requirements:this.state.selected.close_requirements,
            phones:this.state.selected.phones,
            first_name:this.state.selected.first_name,
            office_alternate_status_id:this.state.selected.office_alternate_status_id,
            initial_payment:this.state.selected.initial_payment,
            website:this.state.selected.website,
            last_name:this.state.selected.last_name,
            lead_strength_id:this.state.selected.lead_strength_id,
            coupon_id:this.state.selected.coupon_id,
            call_status_id:this.state.selected.call_status_id,
            actions:this.state.selected.actions,
            commission_user_id:this.state.selected.commission_user_id,
            setter_user_id:this.state.selected.setter_user_id,
            comments:this.state.selected.comments,
            addr:this.state.selected.addr,
            phone: this.state.selected.phone,
            office_id: this.state.selected.office_id,
            office_type_id: this.state.selected.office_type_id,
            pricing_id: this.state.selected.pricing_id,
            referrer_users_status_id: this.state.selected.referrer_users_status_id,
        } 
        if (this.state.selected.invoice && this.state.selected.invoice.id) { 
            tosend.invoice_id = this.state.selected.invoice.id;
            tosend.invoice_items = this.state.selected.invoice.items;
        }
        if (this.state.selected.card) { 
            tosend.card = this.state.selected.card
        }
        this.props.onSave(tosend);
        this.state.selected = null;
        this.setState(this.state);
    } 

    onCreateEvent(e,t) { 
        var v1 = this.props.referrerAdminList.data.config.action_status.filter((g) => "Scheduled" === g.name)
        var v2 = this.props.referrerAdminList.data.config.action_type.filter((g) => "Appointment" === g.name)
        t.action_type_id = v2[0].id;
        t.action_status_id = v1[0].id;
        t.server_response = e.server_response;
        var g = this.state.selected.actions.findIndex((f) => f.id === e.id);
        if (g > -1) { 
            this.state.selected.actions[g] = t;
            this.state.selected.actions[g].edit = false;
            this.setState(this.state);
        } 
        
        this.save();
    } 

    onCancelEvent(e) { 
        this.cancelAction(e);
    } 

    updateFirst(e) { 
        this.state.selected.first_name = e.target.value;
        this.setState(this.state);
    }

    dealTrackerChange(e) { 
        this.state.selected.include_on_deal_tracker = !this.state.selected.include_on_deal_tracker;
        this.setState(this.state);
    } 
    refundRequestChange(e) { 
        this.state.selected.refund_requested = !this.state.selected.refund_requested;
        this.setState(this.state);
    } 
    updateDealValue(e) { 
        this.state.selected.deal_value = e.target.value;
        this.setState(this.state);
    } 
    changePresentationResult(e) { 
        this.state.selected.presentation_result = e.target.value;
        this.setState(this.state);
    } 
    changeCloseRequirements(e) { 
        this.state.selected.close_requirements = e.target.value;
        this.setState(this.state);
    } 

    setDate(e) { 
        this.state.selected.set_date = e
        this.setState(this.state);
    }

    presentDate(e) { 
        this.state.selected.present_date = e
        this.setState(this.state);
    }

    setToPresentDate(e) { 
        this.state.selected.set_to_present_date =  e
        this.setState(this.state);
    }
    ecdDate(e) { 
        this.state.selected.estimated_close_date = e
        this.setState(this.state);
    }
    closeDate(e) { 
        this.state.selected.closed_date = e
        this.setState(this.state);
    } 

    websiteUpdate(e) { 
        this.state.selected.website = e.target.value;
        this.setState(this.state);
    }

    onActionTypeChange(e) { 
        var g = this.props.referrerAdminList.data.config.action_type.filter((g) => e.target.value === g.name)
        if (g.length > 0) { 
            this.state.selected.actions[this.state.actionIdx].action_type_id = g[0].id;
            this.setState(this.state);
        } 
    } 

    onPresentedStatusChange(e) { 
        var g = this.props.referrerAdminList.data.config.presented_status.filter((g) => e.target.value === g.name)
        if (g.length > 0) { 
            this.state.selected.provider_queue_presented_status_id = g[0].id;
            this.setState(this.state);
        } 
    } 

    onSourceChange(e) { 
        var g = this.props.referrerAdminList.data.config.deal_source.filter((g) => e.target.value === g.name)
        if (g.length > 0) { 
            this.state.selected.provider_queue_source_id = g[0].id;
            this.setState(this.state);
        } 
    } 

    onActionStatusChange(e) { 
        var g = this.props.referrerAdminList.data.config.action_status.filter((g) => e.target.value === g.name)
        if (g.length > 0) { 
            this.state.selected.actions[this.state.actionIdx].action_status_id = g[0].id;
            this.setState(this.state);
        } 
    } 

    editUser(e,t) { 
        var v = this.state.selected.users.findIndex((f) => f.id === e.id)
        if (v < 0) { 
            this.state.selected.users.push(e);
        } else { 
            this.state.selected.users[v] = e;
        } 
        this.state.addButton = true;
        this.setState(this.state)
    } 

    onCouponChange(e) { 
        var g = this.props.plansList.data.filter((g) => e.target.value === g.description)
        if (g.length > 0) { 
            g[0].quantity = 1
            this.state.selected.plans = {}
            this.state.selected.plans.items.push(g[0]);
            this.state.selected.coupons_id = g[0].id
            this.setState(this.state);
        } 
    }
    onPlansChange(e) { 
        var g = this.props.plansList.data.filter((g) => e.target.value === g.description)
        if (g.length > 0) { 
            g[0].quantity = 1
            this.state.selected.plans = {}
            this.state.selected.plans.items = [g[0]]
            this.state.selected.pricing_id = g[0].id
            this.setState(this.state);
        } 
    } 
    onLeadStrengthChange(e) { 
        var o = e.target.value;
        var t = this.props.referrerAdminList.data.config.strength.filter((g) => o === g.name);
        if (t.length > 0) { 
            this.state.selected.lead_strength_id = t[0].id;
        } 
        this.setState(this.state);
    } 
    donotCallChange(e,t) { 
        this.state.selected.do_not_contact = this.state.selected.do_not_contact ? 0 : 1; 
        this.setState(this.state);
    }

    onTypeChange(e) { 
        var o = e.target.value;
        var t = this.props.referrerAdminList.data.config.type.filter((g) => o === g.name);
        if (t.length > 0) { 
            this.state.selected.office_type = t[0].name;
            this.state.selected.office_type_id = t[0].id;
        } 
        this.setState(this.state);
    } 
    onAltStatusChange(e) { 
        var o = e.target.value;
        var t = this.props.referrerAdminList.data.config.alternate_status.filter((g) => o === g.name);
        if (t.length > 0) { 
            this.state.selected.office_alternate_status_id = t[0].id;
        } 
        this.setState(this.state);
    } 
    onCallStatusChange(e) { 
        var o = e.target.value;
        var t = this.props.referrerAdminList.data.config.call_status.filter((g) => o === g.name);
        if (t.length > 0) { 
            this.state.selected.call_status_id = t[0].id;
        } 
        this.setState(this.state);
    } 
    onStatusChange(e) { 
        var o = e.target.value;
        var t = this.props.referrerAdminList.data.config.status.filter((g) => o === g.name);
        if (t.length > 0) { 
            this.state.selected.referrer_users_status_id = t[0].id;
        } 
        this.setState(this.state);
    } 

    close() { 
        this.state.selected = null;
        this.props.onCancel();
        this.setState(this.state);
    } 

    onSetterChange(e,t) { 
        this.state.selected.setter_name = e.target.value;
        this.state.selected.setter_user_id = 
            this.props.referrerAdminList.data.config.commission_users.filter((g) => g.name === e.target.value)[0].id
        this.setState(this.state);
    }

    onCommissionChange(e,t) { 
        this.state.selected.commission_name = e.target.value;
        this.state.selected.commission_user_id = 
            this.props.referrerAdminList.data.config.commission_users.filter((g) => g.name === e.target.value)[0].id
        this.setState(this.state);
    }

    addContact() { 
        this.state.addContactButton = false;
        this.state.selected.phones.push({
            id:0,
            phone:'',
            iscell:false,
        })
        this.setState(this.state);
    } 

    addAddress() { 
        this.state.selected.addr.push({
            id:0,
            name:'Practice Name',
            addr1:'',
            city:'',
            state:'',
            zipcode:'',
            phone:''
        })
        this.setState(this.state);
    } 

    updateLast(e) { 
        this.state.selected.last_name = e.target.value;
        this.setState(this.state);
    }
    updateBusinessName(e) { 
        this.state.selected.business_name = e.target.value;
        this.setState(this.state);
    }
    updateBASName(e) { 
        this.state.selected.doing_business_as_name = e.target.value;
        this.setState(this.state);
    }
    updateName(e) { 
        this.state.selected.name = e.target.value;
        this.setState(this.state);
    }
    updatePhone(e) { 
        this.state.selected.phone = e.target.value;
        this.setState(this.state);
    }
    updateEmail(e) { 
        this.state.selected.email = e.target.value;
        this.setState(this.state);
    }
    render() {
        var offheads = [
            {
                dataField:'id',
                sort:true,
                hidden:true,
                text:'ID'
            },
            {
                dataField:'name',
                text:'Name'
            },
            {
                dataField:'phone',
                text:'Phone',
                formatter: (cellContent,row) => (
                    <div>
                       {formatPhoneNumber(row.phone) ? formatPhoneNumber(row.phone) : row.phone} 
                    </div>
                )
            },
            {
                dataField:'addr1',
                text:'Address'
            },
            {
                dataField:'city',
                text:'City'
            },
            {
                dataField:'state',
                text:'state'
            },
            {
                dataField:'zipcode',
                text:'Zipcode'
            },
        ]
        var historyheads = [
            {
                dataField:'id',
                hidden:true,
                text:'ID'
            },
            {
                dataField:'user',
                text:'Changed By'
            },
            {
                dataField:'text',
                align:'left',
                text:'Message'
            },
            {
                dataField:'created',
                align:'center',
                text:'Created',
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row['created']).format('LLL')} 
                    </div>
                )
            },
            
        ]
        var planheads = [
            {
                dataField:'id',
                sort:true,
                hidden:true,
                text:'ID'
            },
            {
                dataField:'description',
                editable:true,
                text:'Description'
            },
            {
                dataField:'quantity',
                align:'center',
                editable:false,
                width:50,
                text:'quantity'
            },
            {
                dataField:'price',
                text:'Price',
                editable:false,
                align:'right',
                formatter: (cellContent,row) => (
                    <div>
                        ${row.price && row.price.toFixed ?  row.price.toFixed(2) : row.price}
                    </div>
                )
            }
            
        ]
        var invheads = [
            {
                dataField:'id',
                sort:true,
                hidden:true,
                text:'ID'
            },
            {
                dataField:'description',
                text:'Description'
            },
            {
                dataField:'price',
                text:'Price',
                align:'right',
                formatter: (cellContent,row) => (
                    <div>
                        {row.price.toFixed ? '$' + row.price.toFixed(2) : row.price}
                    </div>
                )
            },
            {
                dataField:'quantity',
                align:'center',
                text:'quantity'
            },
            {
                dataField:'total',
                text:'Total',
                editable:false,
                align:'right',
                formatter: (cellContent,row) => (
                    <div>
                        ${(row.price*row.quantity).toFixed(2)}
                    </div>
                )
            },
        ]
        return(
        <>
        {(this.state.selected) && ( 
        <>
            <Grid container xs="12" style={{marginTop:10}}>
                <Grid container xs="6"> 
                      {this.state.selected.id && (
                        <Grid item xs={3} style={{margin:10}}>
                            <TemplateTextField readOnly 
                            label="ID" value={this.state.selected.id}/>
                        </Grid>
                      )}
                      {this.state.selected.office_id && (
                        <Grid item xs={3} style={{margin:10}}>
                            <TemplateTextField readOnly 
                            label="Office ID" value={this.state.selected.office_id}/>
                        </Grid>
                      )}
                      <Grid item xs={4} style={{margin:10}}>
                        <TemplateTextField onChange={this.updateEmail}
                        label="Email" value={this.state.selected.email}/>
                      </Grid>
                      <Grid item xs={3} style={{margin:10}}>
                        <TemplateTextField onChange={this.updateFirst}
                        label="First" value={this.state.selected.first_name}/>
                      </Grid>
                      <Grid item xs={3} style={{margin:10}}>
                        <TemplateTextField onChange={this.updateLast}
                            label="Last" value={this.state.selected.last_name}/>
                      </Grid>
                      <Grid item xs={3} style={{margin:10}}>
                         <TemplateTextFieldPhone label='Phone'
                              onChange={this.updatePhone} value={this.state.selected.phone}
                            />
                      </Grid>
                </Grid>
                <Grid container style={{borderLeft:"1px solid black"}} xs="6">
                    <Grid item xs={3} style={{margin:10}}>
                      {(this.props.referrerAdminList && this.props.referrerAdminList.data &&
                        this.props.referrerAdminList.data.config && 
                        this.props.referrerAdminList.data.config.status) && (
                      <TemplateSelect
                          label='Status'
                          onChange={this.onStatusChange}
                          value={{
                            label:
                                this.props.referrerAdminList.data.config.status.filter((g) => 
                                    this.state.selected.referrer_users_status_id === g.id).length > 0 ? 
                                this.props.referrerAdminList.data.config.status.filter((g) => 
                                    this.state.selected.referrer_users_status_id === g.id
                            )[0].name : '',
                          }}
                          options={this.props.referrerAdminList.data.config.status.map((g) => { 
                            return (
                                { 
                                label: g.name,
                                value: g.name
                                }
                            )
                          })}
                        />
                        )}
                    </Grid>
                </Grid>
            </Grid>
            <Grid container xs="12">
                <Grid item xs="12">
                    {this.state.selected.office_type !== 'Referrer' && (
                        <Grid item xs="12">
                            <Tabs style={{marginBottom:20}} value={this.state.subTab} onChange={this.toggleSubTab}>
                                <Tab value='comments' label='Comments'/>
                                <Tab value='history' label='History'/>
                            </Tabs>
                            {(this.state.subTab === 'comments') && (
                            <>
                                <TemplateButtonIcon onClick={() => this.addComment({id:"new"})} label={<AddBoxIcon/>}/>
                                {this.state.selected.comments.sort((a,b) => (a.created > b.created ? -1:1)).map((e) => { 
                                    return (
                                        <Grid item xs="3" key={e.id}>
                                            <Box sx={{mt:3}}>
                                            <Paper elevation={3} sx={cardStyle}>
                                                <Grid container xs="12">
                                                    <Grid item xs="6">
                                                        <font style={{fontSize:"14pt"}}>
                                                            {
                                                            this.state.selected.assignee.filter((g) => g.id === e.user_id).length > 0 ? 
                                                            this.state.selected.assignee.filter((g) => g.id === e.user_id)[0].first_name + " " +
                                                            this.state.selected.assignee.filter((g) => g.id === e.user_id)[0].last_name + " " : ""
                                                            }
                                                        </font>
                                                    </Grid>
                                                    <Grid item xs="6">
                                                        {moment(e.created).format('LLL')}
                                                    </Grid>
                                                </Grid>
                                                <hr/>
                                                <Grid container xs="12">
                                                    {(!e.edit) && ( 
                                                    <Grid item xs="12">
                                                        <div style={{overflow:"auto",height:100,display: 'flex', 
                                                            alignItems: 'left', justifyContent: 'start'}}>
                                                        {e.text}
                                                        </div>
                                                    </Grid>
                                                    )}
                                                    {(e.edit) && ( 
                                                    <Grid item xs="12">
                                                      <Grid item xs={12}>
                                                        <TemplateTextArea rows={5} value={e.text} style={{margin:10}}
                                                            onChange={this.comment} 
                                                        />
                                                      </Grid>
                                                    </Grid>
                                                    )}
                                                </Grid>
                                                <Grid container xs="12" style={{marginTop:10}}>
                                                    {(e.edit) && ( 
                                                    <Grid item xs="12">
                                                        <div style={{display:"flex",justifyContent:"center"}}>
                                                            <div style={{display:"flex",justifyContent:"spread-evenly"}}>
                                                            <TemplateButtonIcon onClick={this.saveComment} label={<SaveIcon/>}/>
                                                            <TemplateButtonIcon outline style={{marginLeft:10}} 
                                                                onClick={this.cancelComment} label={<CancelIcon/>}/>
                                                            </div>
                                                        </div>
                                                    </Grid>
                                                    )}
                                                </Grid>
                                            </Paper>
                                            </Box>
                                        </Grid>
                                    )})}
                                </>
                            )}
                            {(this.state.subTab === 'history') && (
                            <>
                                {(this.state.selected.history && this.state.selected.history.length > 0) && (
                                <>
                                <PainTable 
                                    keyField='id' data={this.state.selected.history} 
                                    columns={historyheads}>
                                </PainTable>
                                </>
                                )}
                            </>
                            )}
                        </Grid>
                    )}
                </Grid>
            </Grid>
            <Grid container xs="12" style={{marginTop:20}}>
                <Grid item xs="12">
                    <Grid item xs="6">
                        <TemplateButton onClick={this.save} disabled={this.state.actionIdx !== null} label="Save"/>
                        <TemplateButton outline style={{marginLeft:10}} onClick={this.close} 
                            color="secondary" label="Close"/>
                    </Grid>
                </Grid>
            </Grid>
        </>
        )}
        </>
        )
    } 
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        referrerAdminList: store.referrerAdminList,
        plansList: store.plansList
    }
}

export default connect(mapStateToProps)(RegistrationsEdit);
