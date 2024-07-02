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
import RegistrationsEdit from './RegistrationsEdit';

class Registrations extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            activeTab: "myregistrations",
            typeSelected:null,
            statusSelected:null,
            Selected:null,
            search:null,
            filter: [],
            filterType: [],
            subTab: "plans",
            mine:true,
            sort:null,
            direction:0,
            pq_id:0,
            page: 0,
            pageSize: 10
        }
        this.search = this.search.bind(this);
        this.close = this.close.bind(this);
        this.onStatusFilter = this.onStatusFilter.bind(this);
        this.onTypeFilter = this.onTypeFilter.bind(this);
        this.save = this.save.bind(this);
        this.reload = this.reload.bind(this);
        this.providerReport = this.providerReport.bind(this);
        this.edit = this.edit.bind(this);
        this.add = this.add.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.sortChange = this.sortChange.bind(this);
        this.pageGridsChange = this.pageGridsChange.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
    } 

    componentWillReceiveProps(p) { 
        if (p.registrationsAdminList.data && p.registrationsAdminList.data.config && 
            p.registrationsAdminList.data.config.status && this.state.statusSelected === null) { 
            var c = 0;
            var t = [];
            for (c = 0; c < p.registrationsAdminList.data.config.status.length; c++) { 
                if (p.registrationsAdminList.data.config.status[c].name === 'INVITED') { continue; }
                if (p.registrationsAdminList.data.config.status[c].name === 'CLOSED_WON') { continue; }
                if (p.registrationsAdminList.data.config.status[c].name === 'APPROVED') { continue; }
                if (p.registrationsAdminList.data.config.status[c].name === 'DO_NOT_CONTACT') { continue; }
                if (p.registrationsAdminList.data.config.status[c].name === 'INACTIVE') { continue; }
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
                this.reload();
            }
            if (!this.props.match.params.id) { 
                this.reload();
            }
        } 
    }
    close() { 
        this.state.selected = null;
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

    componentDidMount() {
        var i = null;
        if (this.props.match.params.id) { 
            i = this.props.match.params.id;
        } 
        this.props.dispatch(getRegistrations({
            status:[0],
            limit:this.state.pageSize,
            pq_id:i,
            offset:this.state.page
        }));
        this.props.dispatch(getPlansList({}));
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
                {mine:this.state.mine,pq_id:this.state.pq_id,limit:this.state.pageSize,offset:this.state.page}
            ));
        } else { 
            this.props.dispatch(getRegistrations(
                {type:this.state.filterType,mine:this.state.mine,sort:this.state.sort,direction:this.state.direction,
                 search:this.state.search,limit:this.state.pageSize,
                offset:this.state.page,status:this.state.filter}
            ));
        } 
    }
    save(tosend) { 
        this.props.dispatch(registrationAdminUpdate(tosend,function(err,args) { 
                args.reload();
                toast.success('Successfully saved registration.', {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
                );
                args.close()
            },this));
    } 
    toggleTab(e,t) { 
        this.state.activeTab = t;
        if (t !== 'myassigned') { this.state.mine = null; }
        if (t === 'myassigned') { this.state.mine = true; }
        this.setState(this.state);
        this.reload();
    } 

    providerReport() { 
        this.props.dispatch(getRegistrationReport(
            {direction:this.state.direction,
             sort:this.state.sort,
             mine:this.state.mine,
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
                dataField:'call_status',
                sort:true,
                text:'Call Status',
                formatter:(cellContent,row) => (
                    <div>
                        {row.call_status && <TemplateBadge label={row.call_status}/>}
                    </div>
                )
            },
            {
                dataField:'commission_name',
                sort:true,
                text:'Assignee',
                formatter:(cellContent,row) => (
                    <div>
                        {row.commission_name && <TemplateBadge label={row.commission_name}/>}
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
                        <TemplateButton 
                            onClick={() => this.edit(row)} style={{marginRight:5,width:30,height:35}} color="primary" label={<EditIcon/>}/>
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
                        <Tabs style={{marginBottom:20}} value={this.state.activeTab} onChange={this.toggleTab}>
                            <Tab value='myregistrations' label='Assigned to Me'/>
                            <Tab value='registrations' label='Registrations'/>
                        </Tabs>
                        {(this.state.activeTab === 'registrations' || this.state.activeTab === 'myregistrations') && ( 
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
                                <RegistrationsEdit selected={this.state.selected} onSave={this.save} onCancel={this.close}/>
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
