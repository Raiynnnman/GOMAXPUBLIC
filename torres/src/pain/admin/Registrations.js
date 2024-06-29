import React, { Component } from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AssessmentIcon from '@mui/icons-material/Assessment';
import moment from 'moment';
import EditIcon from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import salesforceURL from '../../salesforceConfig';
import squareLocationKey from '../../squareConfig';
import { connect } from 'react-redux';
import cx from 'classnames';
import classnames from 'classnames';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getRegistrations } from '../../actions/registrationsAdminList';
import { getRegistrationReport } from '../../actions/registrationReport';
import { getPlansList } from '../../actions/plansList';
import { registrationAdminUpdate } from '../../actions/registrationAdminUpdate';
import formatPhoneNumber from '../utils/formatPhone';
import PainTable from '../utils/PainTable';
import TemplateSelect from '../utils/TemplateSelect';
import TemplateSelectEmpty from '../utils/TemplateSelectEmpty';
import TemplateSelectMulti from '../utils/TemplateSelectMulti';
import TemplateTextField from '../utils/TemplateTextField';
import TemplateCheckbox from '../utils/TemplateCheckbox';
import TemplateButton from '../utils/TemplateButton';
import TemplateBadge from '../utils/TemplateBadge';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Navbar from '../../components/Navbar';

class Registrations extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            activeTab: "registrations",
            typeSelected:null,
            statusSelected:null,
            Selected:null,
            search:null,
            filter: [],
            filterType: [],
            subTab: "plans",
            sort:null,
            direction:0,
            pq_id:0,
            page: 0,
            pageSize: 10
        }
        this.close = this.close.bind(this);
        this.search = this.search.bind(this);
        this.donotCallChange = this.donotCallChange.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onTypeChange = this.onTypeChange.bind(this);
        this.onLeadStrengthChange = this.onLeadStrengthChange.bind(this);
        this.onPlansChange = this.onPlansChange.bind(this);
        this.onCouponChange = this.onCouponChange.bind(this);
        this.onStatusFilter = this.onStatusFilter.bind(this);
        this.onTypeFilter = this.onTypeFilter.bind(this);
        this.renderTotalLabel = this.renderTotalLabel.bind(this);
        this.addAddress = this.addAddress.bind(this);
        this.save = this.save.bind(this);
        this.reload = this.reload.bind(this);
        this.providerReport = this.providerReport.bind(this);
        this.edit = this.edit.bind(this);
        this.add = this.add.bind(this);
        this.onCommissionChange = this.onCommissionChange.bind(this);
        this.addInvoiceGrid = this.addInvoiceGrid.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.sortChange = this.sortChange.bind(this);
        this.pageGridsChange = this.pageGridsChange.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
        this.toggleSubTab = this.toggleSubTab.bind(this);
        this.updatePhone = this.updatePhone.bind(this);
        this.updateName = this.updateName.bind(this);
        this.updateEmail = this.updateEmail.bind(this);
        this.updateFirst = this.updateFirst.bind(this);
        this.updateInitial = this.updateInitial.bind(this);
        this.updateLast = this.updateLast.bind(this);
    } 

    componentWillReceiveProps(p) { 
        if (p.registrationsAdminList.data && p.registrationsAdminList.data.config && 
            p.registrationsAdminList.data.config.status && this.state.statusSelected === null) { 
            var c = 0;
            var t = [];
            for (c = 0; c < p.registrationsAdminList.data.config.status.length; c++) { 
                if (p.registrationsAdminList.data.config.status[c].name === 'INVITED') { continue; }
                if (p.registrationsAdminList.data.config.status[c].name === 'DENIED') { continue; }
                t.push(p.registrationsAdminList.data.config.status[c].id); 
            } 
            this.state.statusSelected = t;
            this.state.filter = t;
            var v = [];
            c = 0;
            for (c = 0; c < p.registrationsAdminList.data.config.type.length; c++) { 
                v.push(p.registrationsAdminList.data.config.type[c].id); 
            } 
            this.state.typeSelected = v;
            this.state.filterType = v;
            this.setState(this.state);
            if (this.props.match.params.id) { 
                this.props.dispatch(getRegistrations(
                    {pq_id:this.props.match.params.id,limit:this.state.pageSize,offset:this.state.page}
                ));
            }
            if (!this.props.match.params.id) { 
                this.props.dispatch(getRegistrations(
                    {type:v,limit:this.state.pageSize,offset:this.state.page,status:t}
                ));
            }
        } 
    }

    donotCallChange(e,t) { 
        this.state.selected.do_not_contact = this.state.selected.do_not_contact ? 0 : 1; 
        this.setState(this.state);
    }

    sortChange(t) { 
        var g = this.props.registrationsAdminList.data.sort.filter((e) => t.dataField === e.col);
        if (g.length > 0) { 
            g = g[0]
            this.state.sort = g.id
            this.state.direction = g.direction === 'asc' ? 'desc' : 'asc'
            this.props.dispatch(getRegistrations(
                {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
            ));
            this.setState(this.state);
        } 
    } 

    pageGridsChange(t) { 
        this.state.pageSize = t
        this.state.page = 0
        this.props.dispatch(getRegistrations(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 
    pageChange(e) { 
        this.state.page = e
        this.props.dispatch(getRegistrations(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 

    renderTotalLabel(f,t,s) { 
        var numpage = s/t;
        return "Showing page " + (this.state.page+1) + " of " + numpage.toFixed(0);
    } 

    updateFirst(e) { 
        this.state.selected.first_name = e.target.value;
        this.setState(this.state);
    }

    search(e) { 
        this.state.search = e.target.value;
        if (this.state.search.length === 0) { 
            this.state.search = null;
        } 
        this.props.dispatch(getRegistrations(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 
    onCommissionChange(e,t) { 
        this.state.selected.commission_name = e.target.value;
        this.state.selected.commission_user_id = 
            this.props.registrationsAdminList.data.config.commission_users.filter((g) => g.name === e.target.value)[0].id
        this.setState(this.state);
    }


    onTypeFilter(e,t) { 
        if (e.length < 1 ) { return; }
        var c = 0;
        var t = [];
        for (c = 0; c < e.length; c++) { 
            t.push(e[c].value); 
        } 
        this.state.typeSelected = t;
        this.state.filterType = t;
        this.props.dispatch(getRegistrations(
            {type:this.state.filterType,
             direction:this.state.direction,
             sort:this.state.sort,
             search:this.state.search,
             limit:this.state.pageSize,offset:this.state.page,
             status:this.state.filter}
        ));
        this.setState(this.state)
    } 

    onStatusFilter(e,t) { 
        if (e.length < 1 ) { return; }
        var c = 0;
        var t = [];
        for (c = 0; c < e.length; c++) { 
            t.push(e[c].value); 
        } 
        this.state.statusSelected = t;
        this.state.filter = t;
        this.props.dispatch(getRegistrations(
            {type:this.state.filterType,
            direction:this.state.direction,
            sort:this.state.sort,
            search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state)
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
    updateInitial(e) { 
        this.state.selected.initial_payment = e.target.value;
        this.setState(this.state);
    }
    updateLast(e) { 
        this.state.selected.last_name = e.target.value;
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

    componentDidMount() {
        var i = null;
        if (this.props.match.params.id) { 
            i = this.props.match.params.id;
        } 
        this.props.dispatch(getRegistrations({
            limit:this.state.pageSize,
            pq_id:i,
            offset:this.state.page
        }));
        this.props.dispatch(getPlansList({}));
    }

    addInvoiceGrid() { 
        this.state.selected.invoice.items.push({
            price:0,
            quantity:1,
            description:''
        })
        this.setState(this.state);
    } 
    add() { 
        this.state.selected = {
            email:'',
            first_name:'',
            initial_payment:0,
            last_name:'',
            phone: '',
            name: '',
            office_id: 0,
            addr:[],
            provider_queue_status_id: 1,
            invoice_id:0,
            pricing_id:0,
            invoice_items:[]
        }
        this.state.selected.plans = {}
        this.state.selected.plans.items = [{
            id:0,description:'',price:0,quantity:1,total:0
        }]
        this.setState(this.state);
    } 
    reload() { 
        if (this.state.pq_id) { 
            this.props.dispatch(getRegistrations(
                {pq_id:this.state.pq_id,limit:this.state.pageSize,offset:this.state.page}
            ));
        } else { 
            this.props.dispatch(getRegistrations(
                {type:this.state.filterType,sort:this.state.sort,direction:this.state.direction,
                 search:this.state.search,limit:this.state.pageSize,
                offset:this.state.page,status:this.state.filter}
            ));
        } 
    }
    save() { 
        var tosend = { 
            email:this.state.selected.email,
            name: this.state.selected.name,
            do_not_contact: this.state.selected.do_not_contact,
            first_name:this.state.selected.first_name,
            initial_payment:this.state.selected.initial_payment,
            last_name:this.state.selected.last_name,
            lead_strength_id:this.state.selected.lead_strength_id,
            coupon_id:this.state.selected.coupon_id,
            commission_user_id:this.state.selected.commission_user_id,
            addr:this.state.selected.addr,
            phone: this.state.selected.phone,
            office_id: this.state.selected.office_id,
            office_type_id: this.state.selected.office_type_id,
            pricing_id: this.state.selected.pricing_id,
            status: this.state.selected.provider_queue_status_id,
        } 
        if (this.state.selected.invoice && this.state.selected.invoice.id) { 
            tosend.invoice_id = this.state.selected.invoice.id;
            tosend.invoice_items = this.state.selected.invoice.items;
        }
        if (this.state.selected.card) { 
            tosend.card = this.state.selected.card
        }
        this.props.dispatch(registrationAdminUpdate(tosend,function(err,args) { 
            args.props.dispatch(getRegistrations(
                {pq_id:args.state.pq_id,type:args.state.filterType,sort:args.state.sort,direction:args.state.direction,search:args.state.search,limit:args.state.pageSize,offset:args.state.page,status:args.state.filter},function(err,args) { 
              toast.success('Successfully saved registration.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
              args.close()
            },args))
        },this));
    } 
    onCouponChange(e) { 
        this.state.selected.coupon_id = e.value;
        this.setState(this.state);
    }
    onPlansChange(e) { 
        this.state.selected.pricing_id = e.value;
        var t = this.props.plansList.data.filter((g) => this.state.selected.pricing_id === g.id)
        t[0].quantity = 1
        this.state.selected.plans = {}
        this.state.selected.plans.items = [t[0]]
        this.state.selected.pricing_id = t[0].id
        this.setState(this.state);
    } 
    onLeadStrengthChange(e) { 
        var o = e.target.value;
        var t = this.props.registrationsAdminList.data.config.strength.filter((g) => o === g.name);
        if (t.length > 0) { 
            this.state.selected.lead_strength_id = t[0].id;
        } 
        this.setState(this.state);
    } 
    onTypeChange(e) { 
        var o = e.target.value;
        var t = this.props.registrationsAdminList.data.config.type.filter((g) => o === g.name);
        if (t.length > 0) { 
            this.state.selected.office_type = t[0].name;
            this.state.selected.office_type_id = t[0].id;
        } 
        this.setState(this.state);
    } 
    onStatusChange(e) { 
        var o = e.target.value;
        var t = this.props.registrationsAdminList.data.config.status.filter((g) => o === g.name);
        if (t.length > 0) { 
            this.state.selected.provider_queue_status_id = t[0].id;
        } 
        this.setState(this.state);
    } 
    close() { 
        this.state.selected = null;
        this.setState(this.state);
    } 
    toggleSubTab(e,t) { 
        this.state.subTab = t;
        this.setState(this.state);
    } 
    toggleTab(e,t) { 
        this.state.activeTab = t;
        this.setState(this.state);
    } 

    providerReport() { 
        this.props.dispatch(getRegistrationReport(
            {direction:this.state.direction,
             sort:this.state.sort,
             search:this.state.search,
             limit:100000,offset:0,
             report:1,
             period:this.state.filter}
        ));
    } 

    edit(r) { 
        this.state.selected = JSON.parse(JSON.stringify(r));
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
        var regheads = [
            {
                dataField:'id',
                sort:true,
                hidden:true,
                text:'ID'
            },
            {
                dataField:'name',
                sort:true,
                text:'Name'
            },
            {
                dataField:'email',
                sort:true,
                text:'Email'
            },
            {
                dataField:'phone',
                sort:true,
                text:'Phone',
                formatter: (cellContent,row) => (
                    <div>
                       {formatPhoneNumber(row.phone)} 
                    </div>
                )
            },
            {
                dataField:'office_type',
                sort:true,
                align:'center',
                text:'Office Type',
                formatter:(cellContent,row) => (
                    <div>
                        {row.office_type}
                    </div>
                )
            },
            {
                dataField:'lead_strength',
                sort:true,
                text:'Strength',
                formatter:(cellContent,row) => (
                    <div>
                        {(row.lead_strength === 'Preferred Provider') && (<TemplateBadge label='Preferred Provider'/>)}
                        {(row.lead_strength === 'In-Network Provider') && (<TemplateBadge label='In-Network Provider'/>)}
                        {(row.lead_strength === 'Potential Provider') && (<TemplateBadge label='Potential Provider'/>)}
                        {(row.lead_strength === 'Pending Provider') && (<TemplateBadge label='Pending Provider'/>)}
                    </div>
                )
            },
            {
                dataField:'status',
                sort:true,
                align:'center',
                text:'Status',
                formatter:(cellContent,row) => (
                    <div>
                        {(row.status === 'INVITED') && (<TemplateBadge label='INVITED'/>)}
                        {(row.status === 'APPROVED') && (<TemplateBadge label='APPROVED'/>)}
                        {(row.status === 'QUEUED') && (<TemplateBadge label='QUEUED'/>)}
                        {(row.status === 'WAITING') && (<TemplateBadge label='WAITING'/>)}
                        {(row.status === 'DENIED') && (<TemplateBadge label='DENIED'/>)}
                    </div>
                )
            },
            {
                dataField:'actions',
                sort:true,
                text:'Actions',
                formatter:(cellContent,row) => (
                    <>
                    <div>
                        <TemplateButton onClick={() => this.edit(row)} style={{marginRight:5,height:35}} color="primary" label={<EditIcon/>}/>
                    </div>
                    </>
                )
            },
        ]
        if (this.props.registrationsAdminList && this.props.registrationsAdminList.data && 
            this.props.registrationsAdminList.data.sort) { 
            var c = 0; 
            for (c=0;c < regheads.length; c++) { 
                var q = regheads[c]
                var t = this.props.registrationsAdminList.data.sort.filter((g) => q.dataField === g.col);
                if (t.length > 0) { 
                    t = t[0]
                    regheads[c].sort=true;
                    if (t.active) { 
                        regheads[c].order = t['direction']
                    } else { 
                        regheads[c].order = 'asc'
                    } 
                } else { 
                    regheads[c].sort=false;
                } 
            } 
        }  
        return (
        <>
            {(this.props.plansList && this.props.plansList.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.registrationAdminUpdate && this.props.registrationAdminUpdate.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.registrationReport && this.props.registrationReport.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.registrationsAdminList && this.props.registrationsAdminList.isReceiving) && (
                <AppSpinner/>
            )}
            <Navbar/>
            <Box style={{margin:20}}>
            <Grid container xs="12" style={{margin:10}}>
            <>
                <Grid item xs="12">
                <>
                    <Box sx={{width:'100%'}}>
                    <>
                        <Tabs value={this.state.activeTab} onChange={this.toggleTab}>
                            <Tab value='registrations' label='Registrations'/>
                        </Tabs>
                        {(this.state.activeTab === 'registrations') && ( 
                        <>
                            {(this.state.selected === null) && (
                            <>
                            <Grid container xs="12" style={{marginTop:10}}>
                                <Grid item xs={.5} style={{margin:10}}>
                                    <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <TemplateButton onClick={this.add} style={{width:50}}
                                            label={<AddBoxIcon/>}/>
                                    </div>
                                </Grid>
                                <Grid item xs="3" style={{margin:10}}>
                                    {(this.props.registrationsAdminList && this.props.registrationsAdminList.data && 
                                    this.props.registrationsAdminList.data.config &&
                                    this.props.registrationsAdminList.data.config.status && this.state.statusSelected !== null) && (
                                      <TemplateSelectMulti
                                          onChange={this.onStatusFilter}
                                          label="Status"
                                          value={this.state.statusSelected.map((g) => { 
                                            return (
                                                {
                                                label:this.props.registrationsAdminList.data.config.status.filter((f) => f.id === g)[0].name,
                                                value:this.props.registrationsAdminList.data.config.status.filter((f) => f.id === g)[0].id
                                                }
                                            )
                                          })}
                                          options={this.props.registrationsAdminList.data.config.status.map((e) => { 
                                            return (
                                                { 
                                                label: e.name,
                                                value: e.id
                                                }
                                            )
                                          })}
                                        />
                                    )}
                                </Grid>
                                <Grid item xs="3" style={{margin:10}}>
                                    {(this.props.registrationsAdminList && this.props.registrationsAdminList.data && 
                                    this.props.registrationsAdminList.data.config &&
                                    this.props.registrationsAdminList.data.config.type && this.state.statusSelected !== null) && (
                                      <TemplateSelectMulti
                                          onChange={this.onTypeFilter}
                                          label="Type"
                                          value={this.state.typeSelected.map((g) => { 
                                            return (
                                                {
                                                label:this.props.registrationsAdminList.data.config.type.filter((f) => f.id === g)[0].name,
                                                value:this.props.registrationsAdminList.data.config.type.filter((f) => f.id === g)[0].id
                                                }
                                            )
                                          })}
                                          options={this.props.registrationsAdminList.data.config.type.map((e) => { 
                                            return (
                                                { 
                                                label: e.name,
                                                value: e.id
                                                }
                                            )
                                          })}
                                        />
                                    )}
                                </Grid>
                                <Grid item xs={2} style={{margin:10}}>
                                    <TemplateTextField type="text" id="normal-field" onChange={this.search}
                                    label="Search" value={this.state.search}/>
                                </Grid>
                                <Grid item xs={2} style={{margin:10}}>
                                    <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <div style={{display:'flex',justifyContent:"spread-evenly"}}>
                                            <TemplateButton onClick={this.providerReport} style={{width:50}} label={<AssessmentIcon/>}/>
                                            <TemplateButton onClick={() => this.reload()} style={{marginLeft:5,width:50}} 
                                                label={<AutorenewIcon/>}/>
                                        </div>
                                    </div>
                                </Grid>
                                <Grid item xs="12">
                                    <>
                                    {(this.props.registrationsAdminList && this.props.registrationsAdminList.data && 
                                      this.props.registrationsAdminList.data.registrations && 
                                      this.props.registrationsAdminList.data.registrations.length > 0)&& ( 
                                        <PainTable
                                            keyField='id' 
                                            data={this.props.registrationsAdminList.data.registrations} 
                                            total={this.props.registrationsAdminList.data.total}
                                            page={this.state.page}
                                            pageSize={this.state.pageSize}
                                            onPageChange={this.pageChange}
                                            onSort={this.sortChange}
                                            onPageGridsPerPageChange={this.pageGridsChange}
                                            columns={regheads}>
                                        </PainTable> 
                                    )}
                                    {(this.props.registrationsAdminList && this.props.registrationsAdminList.data && 
                                      this.props.registrationsAdminList.data.registrations && 
                                      this.props.registrationsAdminList.data.registrations.length < 1)&& ( 
                                      <h3>No registrations yet!</h3>
                                    )}
                                    </>
                                </Grid>
                             </Grid> 
                            </>
                            )}
                            {(this.state.selected !== null ) && (
                            <>
                                <Grid container xs="12" style={{marginTop:10}}>
                                      {this.state.selected.id && (
                                        <Grid item xs={1}>
                                            <TemplateTextField readOnly 
                                            label="ID" value={this.state.selected.id}/>
                                        </Grid>
                                      )}
                                      {this.state.selected.office_id && (
                                        <Grid item xs={1}>
                                            <TemplateTextField readOnly 
                                            label="Office ID" value={this.state.selected.office_id}/>
                                        </Grid>
                                      )}
                                      <Grid item xs={1}>
                                      <TemplateCheckbox label='Do Not Call'
                                              onChange={this.donotCallChange} 
                                                checked={this.state.selected.do_not_contact}/>
                                      </Grid>
                                      <Grid item xs={3}>
                                        <TemplateTextField onChange={this.updateName}
                                        label="Office Name" value={this.state.selected.name}/>
                                      </Grid>
                                </Grid>
                                <Grid container xs="12" style={{marginTop:10}}>
                                      <Grid item xs={3}>
                                        <TemplateTextField onChange={this.updateEmail}
                                        label="Email" value={this.state.selected.email}/>
                                      </Grid>
                                      <Grid item xs={3}>
                                        <TemplateTextField onChange={this.updateFirst}
                                        label="First" value={this.state.selected.first_name}/>
                                      </Grid>
                                        <Grid item xs={3}>
                                            <TemplateTextField onChange={this.updateLast}
                                            label="Last" value={this.state.selected.last_name}/>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <TemplateTextField label='Phone'
                                              onChange={this.updatePhone} value={this.state.selected.phone}
                                            />
                                        </Grid>
                                    </Grid>
                                <Grid container xs="12" style={{marginTop:10}}>
                                        <Grid item xs="2">
                                          {(this.props.registrationsAdminList && this.props.registrationsAdminList.data && 
                                            this.props.registrationsAdminList.data.config &&
                                            this.props.registrationsAdminList.data.config.status && this.state.statusSelected !== null) && (
                                              <TemplateSelect
                                                  label='Commission User'
                                                  onChange={this.onCommissionChange}
                                                  value={{label:this.state.selected.commission_name,value:this.state.selected.commission_user_id}}
                                                  options={this.props.registrationsAdminList.data.config.commission_users.map((e) => { 
                                                    return (
                                                        { 
                                                        label: e.name,
                                                        value: e.name
                                                        }
                                                    )
                                                  })}
                                                />
                                            )}
                                        </Grid>                
                                        <Grid item xs={3}>
                                          {(this.props.registrationsAdminList && this.props.registrationsAdminList.data &&
                                            this.props.registrationsAdminList.data.config && 
                                            this.props.registrationsAdminList.data.config.status) && (
                                          <TemplateSelect
                                              label='Type'
                                              onChange={this.onTypeChange}
                                              value={{
                                                label:
                                                    this.props.registrationsAdminList.data.config.type.filter((g) =>
                                                        this.state.selected.office_type_id === g.id).length > 0 ? 
                                                    this.props.registrationsAdminList.data.config.type.filter((g) => 
                                                        this.state.selected.office_type_id === g.id
                                                )[0].name : '',
                                                value:
                                                    this.props.registrationsAdminList.data.config.type.filter((g) =>
                                                        this.state.selected.office_type_id === g.id).length > 0 ? 
                                                    this.props.registrationsAdminList.data.config.type.filter((g) => 
                                                        this.state.selected.office_type_id === g.id
                                                )[0].value : ''
                                              }}
                                              options={this.props.registrationsAdminList.data.config.type.map((g) => { 
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
                                        <Grid item xs={3}>
                                          {(this.props.registrationsAdminList && this.props.registrationsAdminList.data &&
                                            this.props.registrationsAdminList.data.config && 
                                            this.props.registrationsAdminList.data.config.status) && (
                                          <TemplateSelect
                                              label='Status'
                                              onChange={this.onStatusChange}
                                              value={{
                                                label:
                                                    this.props.registrationsAdminList.data.config.status.filter((g) => 
                                                        this.state.selected.provider_queue_status_id === g.id).length > 0 ? 
                                                    this.props.registrationsAdminList.data.config.status.filter((g) => 
                                                        this.state.selected.provider_queue_status_id === g.id
                                                )[0].name : '',
                                              }}
                                              options={this.props.registrationsAdminList.data.config.status.map((g) => { 
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
                                        <Grid item xs={3}>
                                          <TemplateSelect
                                              label='Lead Strength'
                                              onChange={this.onLeadStrengthChange}
                                              value={{
                                                label:
                                                    (this.state.selected.lead_strength_id) ?  this.props.registrationsAdminList.data.config.strength.filter((g) => 
                                                        this.state.selected.lead_strength_id === g.id
                                                )[0].name : ''
                                              }}
                                              options={this.props.registrationsAdminList.data.config.strength.map((g) => { 
                                                return (
                                                    { 
                                                    label: g.name,
                                                    value: g.name
                                                    }
                                                )
                                              })}
                                            />
                                        </Grid>
                                    <Grid container xs="12">
                                        <>
                                        {this.state.selected.office_type !== 'Referrer' && (
                                            <Grid item xs="12">
                                                <Tabs value={this.state.subTab} onChange={this.toggleSubTab}>
                                                    <Tab value='plans' label='Plans'/>
                                                    <Tab value='offices' label='Offices'/>
                                                    <Tab value='invoice' label='Invoice'/>
                                                    <Tab value='history' label='History'/>
                                                </Tabs>
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
                                                {(this.state.subTab === 'offices') && (
                                                <>
                                                    <TemplateButton style={{marginBottom:10}} onClick={this.addAddress} 
                                                        color="primary" label='Add'/>
                                                    {(this.state.selected.addr && this.state.selected.addr.length > 0) && (
                                                    <>
                                                    <PainTable 
                                                        keyField='id' data={this.state.selected.addr} 
                                                        columns={offheads}>
                                                    </PainTable>
                                                    </>
                                                    )}
                                                </>
                                                )}
                                                {(this.state.subTab === 'invoice') && (
                                                <>
                                                    {(this.state.selected.invoice && this.state.selected.invoice.items) && (
                                                        <PainTable 
                                                            keyField='id' data={this.state.selected.invoice.items} 
                                                            columns={invheads}>
                                                        </PainTable>
                                                    )}
                                                </>
                                                )}
                                                {(this.state.subTab === 'plans') && (
                                                <>
                                                    <Grid container xs="12" style={{marginBottom:20}}>
                                                        <Grid item xs="5">
                                                          <TemplateSelect
                                                              onChange={this.onPlansChange}
                                                              style={{margin:20}}
                                                              value={{
                                                                label:
                                                                    this.props.plansList.data.filter((g) => 
                                                                        this.state.selected.pricing_id === g.id).length > 0 ?
                                                                        this.props.plansList.data.filter((g) => 
                                                                            this.state.selected.pricing_id === g.id)[0].description : ''
                                                              }}
                                                              options={
                                                                    this.props.plansList.data.map((g) => {
                                                                        return ({label:g.description,value:g.description})
                                                                    })
                                                                }
                                                            />
                                                        </Grid>
                                                        <Grid item xs="5">
                                                          <TemplateSelect
                                                              onChange={this.onCouponChange}
                                                              style={{margin:20}}
                                                              value={{
                                                                label:
                                                                    this.props.registrationsAdminList.data.config.coupons.filter((g) => 
                                                                        this.state.selected.coupon_id === g.id).length > 0 ?
                                                                        this.props.registrationsAdminList.data.config.coupons.filter((g) => 
                                                                            this.state.selected.coupon_id === g.id)[0].name : ''
                                                              }}
                                                              options={
                                                                    this.props.registrationsAdminList.data.config.coupons.map((g) => {
                                                                        return ({label:g.name,value:g.name})
                                                                    })
                                                                }
                                                            />
                                                            </Grid>
                                                        </Grid>
                                                        {(this.state.selected.plans && this.state.selected.plans.items) && (
                                                        <>
                                                        <PainTable 
                                                            keyField='id' data={this.state.selected.plans.items} 
                                                            columns={planheads}>
                                                        </PainTable>
                                                        </>
                                                        )}
                                                    </>
                                                    )}
                                            </Grid>
                                        )}
                                        </>
                                    </Grid>
                                </Grid>
                                <Grid container xs="12" style={{marginTop:20}}>
                                    <Grid item xs="12">
                                        <Grid item xs="6">
                                            <TemplateButton onClick={this.save} color="primary" label="Save"/>
                                            <TemplateButton outline style={{marginLeft:10}} onClick={this.close} 
                                                color="secondary" label="Close"/>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </>
                            )}
                        </>
                        )}
                    </>
                    </Box>
                </>
                </Grid>                
            </>
            </Grid>
        </Box>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        registrationsAdminList: store.registrationsAdminList,
        registrationReport: store.registrationReport,
        registrationAdminUpdate: store.registrationAdminUpdate,
        plansList: store.plansList
    }
}

export default connect(mapStateToProps)(Registrations);
