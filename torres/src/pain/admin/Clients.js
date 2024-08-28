import React, { Component } from 'react';
import { toast } from 'react-toastify';
import Grid from '@mui/material/Grid';
import GoogleAutoComplete from '../utils/GoogleAutoComplete';
import Box from '@mui/material/Box';
import moment from 'moment';
import EditIcon from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import salesforceURL from '../../salesforceConfig';

import { connect } from 'react-redux';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getReferrers } from '../../actions/referrerAdminList';
import { referralAdminUpdate } from '../../actions/referralAdminUpdate';
import formatPhoneNumber from '../utils/formatPhone';
import PainTable from '../utils/PainTable';
import TemplateSelect from '../utils/TemplateSelect';
import TemplateBadge from '../utils/TemplateBadge';
import TemplateButton from '../utils/TemplateButton';
import TemplateSelectMulti from '../utils/TemplateSelectMulti';
import TemplateTextField from '../utils/TemplateTextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Navbar from '../../components/Navbar';
import ClientsEdit from './ClientsEdit';

const timeZoneIANA = Intl.DateTimeFormat().resolvedOptions().timeZone;

class Clients extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            activeTab: "clients",
            activeOnly: false,
            statusSelected:null,
            search:null,
            filter: [],
            subTab: "plans",
            page: 0,
            pageSize: 10
        }
        this.close = this.close.bind(this);
        this.search = this.search.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onLeadStrengthChange = this.onLeadStrengthChange.bind(this);
        this.onPlansChange = this.onPlansChange.bind(this);
        this.onStatusFilter = this.onStatusFilter.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.sortChange = this.sortChange.bind(this);
        this.pageGridsChange = this.pageGridsChange.bind(this);
        this.save = this.save.bind(this);
        this.reload = this.reload.bind(this);
        this.edit = this.edit.bind(this);
        this.add = this.add.bind(this);
        this.pageChange = this.pageChange.bind(this);
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
        if (p.referrerAdminList.data && p.referrerAdminList.data.config && 
            p.referrerAdminList.data.config.status && this.state.statusSelected === null) { 
            var c = 0;
            var t = [];
            var t1 = [];
            for (c = 0; c < p.referrerAdminList.data.config.status.length; c++) { 
                if (p.referrerAdminList.data.config.status[c].name === 'COMPLETED') { continue; }
                if (p.referrerAdminList.data.config.status[c].name === 'SCHEDULED') { continue; }
                if (p.referrerAdminList.data.config.status[c].name === 'ACCEPTED') { continue; }
                if (p.referrerAdminList.data.config.status[c].name.includes('NOT_QUALI')) { continue; }
                t.push(p.referrerAdminList.data.config.status[c]); 
                t1.push(p.referrerAdminList.data.config.status[c].id); 
                
            } 
            this.state.statusSelected = t;
            this.state.filter = t1;
            this.setState(this.state);
            this.reload();
        } 
    }

    pageChange(e) { 
        this.state.page = e
        this.setState(this.state);
        this.reload()
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
        this.setState(this.state);
        this.reload()
    } 

    pageGridsChange(t) { 
        this.state.pageSize = t
        this.state.page = 0
        this.setState(this.state);
        this.reload()
    } 

    sortChange(t) { 
        var g = this.props.offices.data.sort.filter((e) => t.dataField === e.col);
        if (g.length > 0) { 
            g = g[0]
            this.state.sort = g.id
            this.state.direction = g.direction === 'asc' ? 'desc' : 'asc'
            this.setState(this.state);
            this.reload()
        } 
    } 
    onStatusFilter(e,t) { 
        if (e.length < 1) { return; }
        var c = 0;
        var t = [];
        var t1 = [];
        for (c = 0; c < e.length; c++) { 
            t.push(e[c]); 
            var v = this.props.referrerAdminList.data.config.status.filter((f) => f.name === e[c].value)
            t1.push(v[0].id);
        } 
        this.state.statusSelected = t;
        this.state.filter = t1;
        this.setState(this.state)
        this.reload()
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
        this.reload();
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
        this.props.dispatch(getReferrers(
            {active_only:this.state.activeOnly,
             timezone:timeZoneIANA,
             search:this.state.search,
             limit:this.state.pageSize,
             offset:this.state.page,status:this.state.filter}
        ));
    }
    save(e) { 
        var tosend = e;
        this.props.dispatch(referralAdminUpdate(tosend,function(err,args) { 
              args.reload()
              toast.success('Successfully saved referral.', {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
              args.close()
            },this)
        )
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
        this.state.selected.lead_strength_id = e.value;
        this.setState(this.state);
    } 
    onStatusChange(e) { 
        this.state.selected.provider_queue_status_id = e.value;
        this.setState(this.state);
    } 
    close() { 
        this.state.selected = null;
        this.setState(this.state);
    } 
    toggleSubTab(e) { 
        this.state.subTab = e;
        this.setState(this.state);
    } 
    toggleTab(e,t) { 
        if (t === 'active_clients') { 
            this.state.activeOnly = true;
        } else { 
            this.state.activeOnly = false;
        } 
        this.state.activeTab = t;
        this.setState(this.state);
    } 

    edit(r) { 
        this.state.selected = JSON.parse(JSON.stringify(r));
        this.setState(this.state);
    } 

    render() {
        var regheads = [
            {
                dataField:'id',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                hidden:true,
                text:'ID'
            },
            {
                dataField:'name',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                formatter: (content,row) => (
                    <div>{row.last_name + ", " + row.first_name}</div>
                ),
                text:'Name'
            },
            {
                dataField:'date_of_accident',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'DOI'
            },
            {
                dataField:'date_of_birth',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'DOB'
            },
            {
                dataField:'phone',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'phone'
            },
            {
                dataField:'city',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'City'
            },
            {
                dataField:'state',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'State'
            },
            {
                dataField:'zipcode',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'Zipcode'
            },
            {
                dataField:'email',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'Email'
            },
            {
                dataField:'status',
                align:'center',
                text:'Status',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                formatter:(cellContent,row) => (
                    <div>
                        <TemplateBadge label={row.status}/>
                    </div>
                )
            },
            {
                dataField:'office_name',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'Chiro'
            },
            {
                dataField:'office_name1',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'Attny'
            },
            {
                dataField:'referrer_name',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'Source'
            },
        ]
        console.log("p",this.props);
        console.log("s",this.state);
        return (
        <>
            {(this.props.referralAdminUpdate && this.props.referralAdminUpdate.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.referrerAdminList && this.props.referrerAdminList.isReceiving) && (
                <AppSpinner/>
            )}
            <Box style={{margin:0}}>
            <Grid container xs="12" style={{marginTop:0}}>
                <Grid item xs="12">
                    <>
                        {(this.state.selected !== null) && (
                            <ClientsEdit selected={this.state.selected} onSave={this.save} onCancel={this.close}/>
                        )}
                        {(this.state.selected === null) && (
                        <>
                        <div style={{marginTop:0}}>
                            <Grid container xs="12">
                                <Grid item xs="6" style={{zIndex:9995,margin:10}}>
                                  {(this.props.referrerAdminList && this.props.referrerAdminList.data && 
                                    this.props.referrerAdminList.data.config &&
                                    this.props.referrerAdminList.data.config.status && this.state.statusSelected !== null) && (
                                      <TemplateSelectMulti
                                          label="Status"
                                          onChange={this.onStatusFilter}
                                          value={this.state.statusSelected.map((g) => { 
                                            return (
                                                {
                                                 label: g.label ? g.label : g.name, 
                                                 value: g.label ? g.label : g.name 
                                                }
                                            )
                                          })}
                                          options={this.props.referrerAdminList.data.config.status.map((e) => { 
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
                                <Grid item xs={3} style={{margin:10}}>
                                    <TemplateTextField onChange={this.search}
                                    label="Search" value={this.state.search}/>
                                </Grid>
                                <Grid item xs={2}>
                                    <div>
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{justifyContent:'spread-evenly'}}>
                                                <TemplateButton onClick={() => this.reload()} style={{marginRight:5,width:50}} outline 
                                                    label={<AutorenewIcon/>}/>
                                            </div>
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                        <Grid container xs="12" style={{marginTop:10}}>
                            <Grid item xs="12" style={{overflow:"auto"}}>
                                <>
                                {(this.props.referrerAdminList && this.props.referrerAdminList.data && 
                                  this.props.referrerAdminList.data.data && 
                                  this.props.referrerAdminList.data.data.length > 0)&& ( 
                                <>
                                    <PainTable
                                            keyField='id' 
                                            data={this.props.referrerAdminList.data.data} 
                                            total={this.props.referrerAdminList.data.total}
                                            page={this.state.page}
                                            pageSize={this.state.pageSize}
                                            onPageChange={this.pageChange}
                                            onSort={this.sortChange}
                                            onPageGridsPerPageChange={this.pageGridsChange}
                                            columns={regheads}>
                                    </PainTable> 
                                </>
                                )}
                                {(this.props.referrerAdminList && this.props.referrerAdminList.data && 
                                  this.props.referrerAdminList.data.data && 
                                  this.props.referrerAdminList.data.data.length < 1)&& ( 
                                  <h3>No clients yet!</h3>
                                )}
                                </>
                            </Grid>
                        </Grid>
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
        currentUser: store.auth.currentUser,
        referrerAdminList: store.referrerAdminList,
        referralAdminUpdate: store.referralAdminUpdate,
        plansList: store.plansList
    }
}

export default connect(mapStateToProps)(Clients);
