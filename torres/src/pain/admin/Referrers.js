import React, { Component } from 'react';
import { toast } from 'react-toastify';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import moment from 'moment';
import EditIcon from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import salesforceURL from '../../salesforceConfig';

import { connect } from 'react-redux';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getReferrers } from '../../actions/referrerAdminList';
//import { referralAdminUpdate } from '../../actions/referralAdminUpdate';
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

class Referrers extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            activeTab: "referrer",
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
        this.renderTotalLabel = this.renderTotalLabel.bind(this);
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
            for (c = 0; c < p.referrerAdminList.data.config.status.length; c++) { 
                if (p.referrerAdminList.data.config.status[c].name === 'COMPLETED') { continue; }
                t.push(p.referrerAdminList.data.config.status[c].id); 
            } 
            this.state.statusSelected = t;
            this.state.filter = t;
            this.setState(this.state);
            this.props.dispatch(getReferrers(
                {limit:this.state.pageSize,offset:this.state.page,status:t}
            ));
        } 
    }

    pageChange(e) { 
        this.state.page = e
        this.props.dispatch(getReferrers(
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
        this.props.dispatch(getReferrers(
            {search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 

    pageGridsChange(t) { 
        this.state.pageSize = t
        this.state.page = 0
        this.props.dispatch(getReferrers(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 

    sortChange(t) { 
        var g = this.props.offices.data.sort.filter((e) => t.dataField === e.col);
        if (g.length > 0) { 
            g = g[0]
            this.state.sort = g.id
            this.state.direction = g.direction === 'asc' ? 'desc' : 'asc'
            this.props.dispatch(getReferrers(
                {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
            ));
            this.setState(this.state);
        } 
    } 
    onStatusFilter(e,t) { 
        if (e.length <2 ) { return; }
        var c = 0;
        var t = [];
        for (c = 0; c < e.length; c++) { 
            t.push(e[c].value); 
        } 
        this.state.statusSelected = t;
        this.state.filter = t;
        this.props.dispatch(getReferrers(
            {search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state)
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
        this.props.dispatch(getReferrers({
            limit:this.state.pageSize,
            offset:this.state.page
        }));
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
            {search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
    }
    save() { 
        var tosend = { 
            email:this.state.selected.email,
            name: this.state.selected.name,
            first_name:this.state.selected.first_name,
            initial_payment:this.state.selected.initial_payment,
            last_name:this.state.selected.last_name,
            lead_strength_id:this.state.selected.lead_strength_id,
            addr:this.state.selected.addr,
            phone: this.state.selected.phone,
            office_id: this.state.selected.office_id,
            pricing_id: this.state.selected.pricing_id,
            status: this.state.selected.provider_queue_status_id,
        } 
        if (this.state.selected.invoice && this.state.selected.invoice.id) { 
            tosend.invoice_id = this.state.selected.invoice.id
            tosend.invoice_items = this.state.selected.invoice.items
        }
        if (this.state.selected.card) { 
            tosend.card = this.state.selected.card
        }
        /*this.props.dispatch(referralAdminUpdate(tosend,function(err,args) { 
            args.props.dispatch(getReferrers(
                {search:args.state.search,limit:args.state.pageSize,offset:args.state.page,status:args.state.filter},function(err,args) { 
              toast.success('Successfully saved referral.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
              args.close()
            },args))
        },this));*/
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
    toggleTab(e) { 
        this.state.activeTab = e;
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
                dataField:'referrer_name',
                sort:true,
                text:'Ref Name'
            },
            {
                dataField:'office_name',
                sort:true,
                text:'Off Name'
            },
            {
                dataField:'time',
                sort:true,
                align:'center',
                text:'Minutes',
                formatter: (cellContent,row) => (
                    <div>
                        {row.time + " min"}
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
                        {(row.status === 'QUEUED') && (<TemplateBadge label='QUEUED'/>)}
                        {(row.status === 'REJECTED') && (<TemplateBadge label='REJECTED'/>)}
                        {(row.status === 'ACCEPTED') && (<TemplateBadge label='ACCEPTED'/>)}
                        {(row.status === 'CONTACTED') && (<TemplateBadge label='CONTACTED'/>)}
                        {(row.status === 'FOLLOWUP') && (<TemplateBadge label='FOLLOWUP'/>)}
                        {(row.status === 'SCHEDULED') && (<TemplateBadge label='SCHEDULED'/>)}
                        {(row.status === 'COMPLETED') && (<TemplateBadge label='COMPLETED'/>)}
                    </div>
                )
            },
            {
                dataField:'updated',
                sort:true,
                text:'Updated',
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row['updated']).format('LLL')} 
                    </div>
                )
            },
        ]
        return (
        <>
            {(this.props.referralAdminUpdate && this.props.referralAdminUpdate.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.referrerAdminList && this.props.referrerAdminList.isReceiving) && (
                <AppSpinner/>
            )}
            <Navbar/>
            <Box style={{margin:20}}>
            <Grid container xs="12" style={{marginTop:20}}>
                <Grid item xs="12">
                    <Tabs value={this.state.activeTab} onChange={this.toggleTab}>
                        <Tab value='referrer' label='Referrals'/>
                    </Tabs>
                    {(this.state.activeTab === 'referrer') && (
                    <>
                            {(this.state.selected === null) && (
                            <>
                            <div style={{marginTop:20}}>
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
                                                    label:this.props.referrerAdminList.data.config.status.filter((f) => f.id === g)[0].name,
                                                    value:this.props.referrerAdminList.data.config.status.filter((f) => f.id === g)[0].name
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
                                <Grid item xs="12">
                                    <>
                                    {(this.props.referrerAdminList && this.props.referrerAdminList.data && 
                                      this.props.referrerAdminList.data.data && 
                                      this.props.referrerAdminList.data.data.length > 0)&& ( 
                                    <>
                                        {/*<BootstrapTable 
                                            keyField='id' data={this.props.referrerAdminList.data.data} 
                                            pagination={paginationFactory(options)}
                                            columns={regheads}>
                                        </BootstrapTable>
                                        */}
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
                                      <h3>No referrer yet!</h3>
                                    )}
                                    </>
                                </Grid>
                            </Grid>
                            </>
                            )}
                        </>
                    )}
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

export default connect(mapStateToProps)(Referrers);
