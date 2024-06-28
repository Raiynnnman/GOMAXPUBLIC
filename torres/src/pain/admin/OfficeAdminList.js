import React, { Component } from 'react';
import moment from 'moment';
import Box from '@mui/material/Box';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { connect } from 'react-redux';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { push } from 'connected-react-router';
import EditIcon from '@mui/icons-material/Edit';
import LaunchIcon from '@mui/icons-material/Launch';
import cx from 'classnames';
import classnames from 'classnames';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getOffices } from '../../actions/offices';
import { getContext } from '../../actions/context';
import { officeSave } from '../../actions/officeSave';
import { officeReportDownload } from '../../actions/officeReportDownload';
import formatPhoneNumber from '../utils/formatPhone';
import PainTable from '../utils/PainTable';
import TemplateSelect from '../utils/TemplateSelect';
import TemplateSelectEmpty from '../utils/TemplateSelectEmpty';
import TemplateSelectMulti from '../utils/TemplateSelectMulti';
import TemplateTextField from '../utils/TemplateTextField';
import TemplateTextArea from '../utils/TemplateTextArea';
import TemplateCheckbox from '../utils/TemplateCheckbox';
import TemplateButton from '../utils/TemplateButton';
import TemplateBadge from '../utils/TemplateBadge';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Navbar from '../../components/Navbar';
import LocationCard from '../office/LocationCard';
import { useState } from 'react';



class OfficeList extends Component {

    constructor(props) { 
        super(props);
        this.state = {  
            addButton:true,
            selected: null,
            subTab: "plans",
            filter: [],
            comments:[],
            commentAdd:false,
            addrState:{},
            statusSelected:null,
            search:null,
            selProvider:null,
            page: 0,
            pageSize: 10,
            selectedID: 0
        } 
        this.cancel = this.cancel.bind(this);
        this.comment = this.comment.bind(this);
        this.editAddress = this.editAddress.bind(this);
        this.search = this.search.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.priorityChange = this.priorityChange.bind(this);
        this.donotCallChange = this.donotCallChange.bind(this);
        this.sortChange = this.sortChange.bind(this);
        this.showMore = this.showMore.bind(this);
        this.showLess = this.showLess.bind(this);
        this.cancelComment = this.cancelComment.bind(this);
        this.saveComment = this.saveComment.bind(this);
        this.pageGridsChange = this.pageGridsChange.bind(this);
        this.activeChange = this.activeChange.bind(this);
        this.officeReport = this.officeReport.bind(this);
        this.renderTotalLabel = this.renderTotalLabel.bind(this);
        this.reload = this.reload.bind(this);
        this.toggleSubTab = this.toggleSubTab.bind(this);
        this.onStatusFilter = this.onStatusFilter.bind(this);
        this.onCommissionChange = this.onCommissionChange.bind(this);
        this.save = this.save.bind(this);
        this.delGrid = this.delGrid.bind(this);
        this.addAddress = this.addAddress.bind(this);
        this.nameChange = this.nameChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
        if (p.offices.data && p.offices.data.config && 
            p.offices.data.config.provider_status && 
            this.state.statusSelected === null && this.state.selProvider === null) { 
            var c = 0;
            var t = [];
            for (c = 0; c < p.offices.data.config.provider_status.length; c++) { 
                if (p.offices.data.config.provider_status[c].name !== 'INVITED') { continue; }
                t.push(p.offices.data.config.provider_status[c].id); 
            } 
            this.state.statusSelected = t;
            this.state.filter = t;
            this.setState(this.state);
            this.props.dispatch(getOffices(
                {limit:this.state.pageSize,offset:this.state.page,status:t}
            ));
        } 
    }


    componentDidMount() {
        var i = null;
        if (this.props.match && this.props.match.params && this.props.match.params.id) { 
            i = this.props.match.params.id;
        } 
        this.state.selProvider = i;
        this.props.dispatch(getOffices({
            limit:this.state.pageSize,
            office_id:i,
            offset:this.state.page
        }));
        this.setState(this.state);
        // this.props.dispatch(getOffices({page:this.state.page,limit:this.state.pageSize}))
    }

    addComment() { 
        this.state.selected.comments.unshift({text:'',edit:true})
        this.state.commentAdd = true;
        this.setState(this.state);
    }

    saveComment(e) { 
        this.state.selected.comments[0].edit=false;
        this.state.commentAdd = false;
        this.setState(this.state);
    }

    cancelComment(e) { 
        this.state.selected.comments.shift();
        this.setState(this.state);
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

    comment(e) { 
        this.state.selected.comments[0].text=e.target.value
        this.setState(this.state);
    }

    showMore(r) { 
        this.state.comments.id = 1;
        this.setState(this.state);
    } 

    showLess(r) { 
        delete this.state.comments.id;
        this.setState(this.state);
    } 

    reload() { 
        this.props.dispatch(getOffices(
            {sort:this.state.sort,direction:this.state.direction,
             search:this.state.search,limit:this.state.pageSize,
            offset:this.state.page,status:this.state.filter}
        ));
    }

    priorityChange(e,t) { 
        this.state.selected.priority = e.target.value;
        this.setState(this.state);
    }

    donotCallChange(e,t) { 
        this.state.selected.do_not_contact = this.state.selected.do_not_contact ? 0 : 1; 
        this.setState(this.state);
    }

    activeChange(e,t) { 
        this.state.selected.active = this.state.selected.active ? 0 : 1; 
        this.setState(this.state);
    }

    officeReport() { 
        this.props.dispatch(officeReportDownload({report:'office_report'}));
    } 
    onCommissionChange(e,t) { 
        this.state.selected.commission_user_id = e.value;
        this.state.selected.commission_name = 
            this.props.offices.data.config.commission_users.filter((g) => g.id === e.value)[0].name
        this.setState(this.state);
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
        this.props.dispatch(getOffices(
            {search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state)
    } 

    sortChange(t) { 
        var g = this.props.offices.data.sort.filter((e) => t.dataField === e.col);
        if (g.length > 0) { 
            g = g[0]
            this.state.sort = g.id
            this.state.direction = g.direction === 'asc' ? 'desc' : 'asc'
            this.props.dispatch(getOffices(
                {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
            ));
            this.setState(this.state);
        } 
    } 

    pageGridsChange(t) { 
        this.state.pageSize = t
        this.state.page = 0
        this.props.dispatch(getOffices(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 
    search(e) { 
        this.state.search = e.target.value;
        if (this.state.search.length === 0) { 
            this.state.search = null;
        } 
        this.props.dispatch(getOffices(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 
    pageChange(e) { 
        this.state.page = e
        this.props.dispatch(getOffices(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 

    renderTotalLabel(f,t,s) { 
        var numpage = s/t;
        return "Showing page " + (this.state.page+1) + " of " + numpage.toFixed(0);
    } 

    delGrid(e) { 
        var t = this.state.selected.addr.filter((g) => g.id !== e.id);
        this.state.selected.addr = t;
        this.setState(this.state);
    } 
    toggleSubTab(e,t) { 
        this.state.subTab = t;
        this.setState(this.state);
    } 
    addAddress() { 
        this.state.selected.addr.push({
            name:'',
            addr1:'',
            city:'',
            state:'',
            zipcode:'',
            phone:''
        })
        this.state.addButton = false; 
        this.setState(this.state);
    } 
    getContext(e) { 
        this.props.dispatch(getContext({office:e.id},function(err,args) { 
                localStorage.setItem("context",true);
                window.location.href = '/app';
        }))
    } 

    edit(row) { 
        var r = {}
        if (row.id === 'new') { 
            r = { 
                name:'',
                ein_number: '',
                email:'',
                addr: [{ 
                    phone:'',
                    addr1:'',
                    addr2:'',
                    city:'',
                    state:'',
                    zipcode:''
                }]
            }
        } else { 
            r = JSON.parse(JSON.stringify(row));
        } 
        this.state.selected=r
        this.setState(this.state);
    } 
    nameChange(e) { 
        this.state.selected.name = e.target.value;
        this.setState(this.state);
    } 
    emailChange(e) { 
      this.state.selected.email = e.target.value;
      this.setState(this.state);
      //validate email 
      const emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
      this.state.isValid = emailRegex.test(e.target.value);
      if (this.state.isValid || e.target.value === '') {
          this.setState(prevState => ({
              ...prevState.selected,
              email: e.target.value,
              errorMessage: '',
          }));
      } else {
          this.setState({ errorMessage: 'Invalid email format' });
      }
  } 
    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
    } 
    save() { 
        var g = this.state.selected;
        if (g.id === 'new') { 
            delete g['id']
        }
        if (!g.name || !g.email) {  
            toast.error('Please fill all the fields.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
            );
            return;
          }
        this.props.dispatch(officeSave(g,function(err,args) { 
            args.props.dispatch(
                getOffices(
                    {limit:args.state.pageSize,offset:args.state.page,status:args.state.filter},function(err,args) { 
              toast.success('Successfully saved office.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
              args.cancel()
            },args))
        },this));
    } 

    addGrid() { 
        this.state.selected.addr.push({
            id:0,phone:'',addr1:'',addr2:'',city:'',state:'',zipcode:''
        })
        this.setState(this.state);
    } 

    render() {

        var clientheads = [
            {
                dataField:'id',
                text:'ID'
            },
            {
                dataField:'email',
                text:'Email'
            },
            {
                dataField:'first_name',
                text:'Name',
                formatter:(cellContent,row) => (
                    <div>
                        {row['first_name'] + " " + row['last_name']}
                    </div>
                )
            },
            {
                dataField:'phone',
                text:'Phone',
                formatter:(cellContent,row) => (
                    <div>
                        {formatPhoneNumber(row['phone'])}
                    </div>
                )
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
        var cardheads = [
            {
                dataField:'id',
                text:'ID'
            },
            {
                dataField:'brand',
                text:'Brand'
            },
            {
                dataField:'last4',
                text:'last4'
            },
            {
                dataField:'exp_year',
                align:'left',
                text:'Expires',
                formatter:(cellContent,row) => (
                    <div>
                        {row['exp_month'] + "/" + row['exp_year']}
                    </div>
                )
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
        var heads = [
            {
                dataField:'id',
                sort:true,
                text:'ID'
            },
            {
                dataField:'name',
                sort:true,
                text:'Name'
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
                dataField:'active',
                align:'center',
                text:'Active',
                formatter: (cellContent,row) => (
                    <div>
                        {(row.active === 1) && (<TemplateBadge label='Active'/>)}
                        {(row.active === 0) && (<TemplateBadge label='Inactive'/>)}
                    </div>
                )
            },
            {
                dataField:'office_type',
                align:'center',
                text:'Office Type'
            },
            {
                dataField:'last_paid',
                sort:true,
                align:'center',
                text:'Last Payment'
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
            {
                dataField:'id',
                text:'Actions',
                formatter:(cellContent,row) => ( 
                    <div>
                        <TemplateButton onClick={() => this.edit(row)} style={{marginRight:5,width:50,height:35}} label={<EditIcon/>}/>
                        <TemplateButton onClick={() => this.getContext(row)} style={{height:35,width:50}} label={<LaunchIcon/>}/>
                    </div>
                )
            },
        ];
        var potheads = [
            {
                dataField:'id',
                sort:true,
                hidden:true,
                text:'ID'
            },
            {
                dataField:'name',
                sort:true,
                hidden:false,
                text:'name'
            },
            {
                dataField:'addr',
                sort:true,
                hidden:false,
                text:'Address',
                formatter:(cc,r) => (
                    <div>
                        {r.addr1 + " " + r.city + ', ' + r.state}
                    </div>
                )
            },
            {
                dataField:'phone',
                sort:true,
                hidden:false,
                text:'Phone',
            },
            {
                dataField:'website',
                sort:true,
                hidden:false,
                text:'Website',
            },
        ]
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
                text:'Phone'
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
            {
                dataField:'id',
                text:'Actions',
                editable: false,
                formatter:(cellContent,row) => ( 
                    <div>
                        <TemplateButton onClick={() => this.delGrid(row)} style={{marginRight:5,height:35,width:90}} label={<DeleteIcon/>}/>
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
                editable:true,
                width:50,
                text:'quantity'
            },
            {
                dataField:'price',
                text:'Price',
                editable:true,
                align:'right',
                formatter: (cellContent,row) => (
                    <div>
                        ${row.price.toFixed ?  row.price.toFixed(2) : row.price}
                    </div>
                )
            },
            
        ]
        var invheads = [
            {
                dataField:'id',
                sort:true,
                text:'ID'
            },
            {
                dataField:'stripe_invoice_id',
                text:'Link',
                formatter: (cellContent,row) => (
                    <div>
                        <a style={{color:'black'}} href={'https://squareup.com/dashboard/invoices/' + row.stripe_invoice_id}
                            target='_blank'>{row.stripe_invoice_id}</a>
                    </div>
                )
            },
            {
                dataField:'status',
                align:'center',
                text:'Status'
            },
            {
                dataField:'stripe_status',
                align:'center',
                text:'Prov Status'
            },
            {
                dataField:'billing_period',
                'align':'center',
                text:'Period'
            },
            {
                dataField:'total',
                text:'Total',
                align:'right',
                formatter: (cellContent,row) => (
                    <div>
                        {row.total.toFixed ? '$' + row.total.toFixed(2) : row.total}
                    </div>
                )
            }
        ]


        return (
          
        <>
            {(this.props.offices && this.props.offices.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.context && this.props.context.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.officeSave && this.props.officeSave.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.officeReportDownload && this.props.officeReportDownload.isReceiving) && (
                <AppSpinner/>
            )}
            <Navbar/>
            <Box style={{margin:20}}>
            {(this.state.selected === null) && (
            <Grid container xs="12">
                <Grid item xs="5" style={{zIndex:9995,margin:10}}>
                  {(this.props.offices && this.props.offices.data && 
                    this.props.offices.data.config &&
                    this.props.offices.data.config.provider_status && this.state.statusSelected !== null) && (
                      <TemplateSelectMulti
                          closeMenuOnSelect={true}
                          label='Status'
                          onChange={this.onStatusFilter}
                          value={this.state.statusSelected.map((g) => { 
                            return (
                                {
                                label:this.props.offices.data.config.provider_status.filter((f) => f.id === g)[0].name,
                                value:this.props.offices.data.config.provider_status.filter((f) => f.id === g)[0].name
                                }
                            )
                          })}
                          options={this.props.offices.data.config.provider_status.map((e) => { 
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
                    <TemplateTextField type="text" id="normal-field" onChange={this.search}
                    label="Search" value={this.state.search}/>
                </Grid>
                <Grid item xs={3}>
                    <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                        <div style={{justifyContent:'spread-evenly'}}>
                            <TemplateButton onClick={() => this.reload()} style={{width:50}}
                                label={<AutorenewIcon/>}/>
                            <TemplateButton onClick={this.officeReport} style={{width:50,marginLeft:5}} label={<AssessmentIcon/>}/>
                        </div>
                    </div>
                </Grid>
            </Grid>
            )}
            {(this.props && this.props.offices && this.props.offices.data && this.props.offices.data.offices &&
              this.props.offices.data.offices.length > 0 && this.state.selected === null) && ( 
            <>
            <Grid container xs="12" style={{marginTop:10}}>
                <Grid item xs="12">
                      <PainTable
                            keyField='id' 
                            data={this.props.offices.data.offices} 
                            total={this.props.offices.data.total}
                            page={this.state.page}
                            pageSize={this.state.pageSize}
                            onPageChange={this.pageChange}
                            onSort={this.sortChange}
                            onPageGridsPerPageChange={this.pageGridsChange}
                            columns={heads}>
                      </PainTable> 
                </Grid>                
            </Grid>
            </>
            )}
            {(this.props && this.props.offices && this.props.offices.data && this.props.offices.data.offices &&
              this.props.offices.data.offices.length > 0 && this.state.selected !== null) && ( 
                <>
                <Grid container xs="12" style={{margin:10}}>
                    <Grid item xs={1}>
                      <TemplateTextField readOnly label="ID" value={this.state.selected.id}/>
                    </Grid>
                    <Grid item xs={2}>
                      <TemplateTextField readOnly label='Service Start' value={this.state.selected.service_start_date}/>
                    </Grid>
                    <Grid item xs={3}>
                      <TemplateTextField onChange={this.nameChange} label="Name" value={this.state.selected.name}/>
                    </Grid>
                    <Grid item xs={3}>
                      <TemplateTextField 
                              onChange={this.emailChange} label="Email" value={this.state.selected.email}/>
                    </Grid>
                    <Grid item xs={3}>
                      {(this.props.offices && this.props.offices.data && 
                        this.props.offices.data.config &&
                        this.props.offices.data.config.commission_users) && (
                          <TemplateSelect
                              label='Commission Owner'
                              onChange={this.onCommissionChange}
                              value={{label:this.state.selected.commission_name}}
                              options={this.props.offices.data.config.commission_users.map((e) => { 
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
                    <Grid item xs={1}>
                    <TemplateCheckbox 
                          onChange={this.activeChange} label="Active" checked={this.state.selected.active}/>
                    </Grid>
                    <Grid item xs={1}>
                    <TemplateCheckbox 
                        onChange={this.donotCallChange} label="Do not call" checked={this.state.selected.do_not_contact}/>
                    </Grid>
                    <Grid item xs={1}>
                    <TemplateTextField 
                          onChange={this.priorityChange} label="Priority" value={this.state.selected.priority}/>
                    </Grid>
                    {/*<Grid item xs={3} style={{color:'black'}}>
                      {(this.state.selected.stripe_cust_id && this.state.selected.stripe_cust_id.includes('cus_'))  && (
                          <a href={'https://dashboard.stripe.com/customers/' + this.state.selected.stripe_cust_id}
                            target='_blank'>{this.state.selected.stripe_cust_id}</a>
                      )}
                      {(this.state.selected.stripe_cust_id && !this.state.selected.stripe_cust_id.includes('cus_'))  && (
                          <a style={{color:'black'}} href={'https://squareup.com/dashboard/customers/directory/customer/' + this.state.selected.stripe_cust_id}
                            target='_blank'>{this.state.selected.stripe_cust_id}</a>
                      )}
                     </Grid>*/}
                </Grid>
                <Grid container xs="12">
                    <Grid item xs="12">
                        <Tabs style={{marginBottom:30}} value={this.state.subTab} onChange={this.toggleSubTab}>
                            <Tab value='plans' label='Plans'  sx={{ color: 'black' }}/>
                            <Tab value='offices' label='Offices' sx={{ color: 'black' }}/>
                            <Tab value='invoices' label='Invoices' sx={{ color: 'black' }} />
                            <Tab value='potentials' label='Potentials' sx={{ color: 'black' }}/>
                            <Tab value='history' label='History' sx={{ color: 'black' }}/>
                            <Tab value='cards' label='Cards' sx={{ color: 'black' }}/>
                            <Tab value='clients' label='clients' sx={{ color: 'black' }}/>
                            <Tab value='comments' label='Comments' sx={{ color: 'black' }}/>
                            
                        </Tabs>
                        {(this.state.subTab === 'clients') && (
                          <PainTable
                              keyField="id"
                              data={this.state.selected.clients} 
                              columns={ clientheads }/>
                        )}
                        {(this.state.subTab === 'cards') && (
                              <PainTable
                                  keyField="id"
                                  data={this.state.selected.cards} 
                                  columns={ cardheads }/>
                        )}
                        {(this.state.subTab === 'history') && (
                              <PainTable
                                  keyField="id"
                                  data={this.state.selected.history} 
                                  columns={ historyheads }/>
                        )}
                        {(this.state.subTab === 'potentials') && (
                              <PainTable
                                  keyField="id"
                                  data={this.state.selected.potential} 
                                  columns={ potheads }/>
                        )}
                        {(this.state.subTab === 'plans') && (
                        <>
                                {(this.state.selected.plans && this.state.selected.plans.items) && (
                                <>
                                    <Grid container xs="12" style={{marginBottom:20,borderBottom:"1px solid black"}}>
                                        <Grid item xs="2">
                                            Plan Start
                                        </Grid>
                                        <Grid item xs="4">
                                            {this.state.selected.plans.start_date}
                                        </Grid>
                                        <Grid item xs="2">
                                            Plan End
                                        </Grid>
                                        <Grid item xs="4">
                                            {this.state.selected.plans.end_date}
                                        </Grid>
                                    </Grid>
                                    <Grid container xs="12" style={{marginBottom:20}}>
                                        <PainTable
                                            keyField='id' data={this.state.selected.plans.items} 
                                            columns={planheads}/>
                                    </Grid>
                                </>
                                )}
                            </>
                        )}


                        {this.state.subTab === 'offices' && (
                            <>
                                {this.state.addButton && ( 
                                <TemplateButton
                                    style={{ width:50,marginBottom: 10 }}
                                    onClick={this.addAddress}
                                    label={<AddBoxIcon />}
                                />
                                )}
                                <Grid container xs={12}>
                                {this.state.selected.addr && this.state.selected.addr.length > 0 && (
                                    this.state.selected.addr.map((address, index) => (
                                    <>
                                        {!address.deleted && (
                                        <Grid item xs={3} style={{margin:20}}>
                                        <LocationCard onEdit={this.editAddress} key={index} 
                                            provider={address} />
                                        </Grid>
                                        )}
                                    </>
                                    ))
                                )}
                                </Grid>
                            </>
                        )}


                        {(this.state.subTab === 'invoices') && (
                        <>
                                {(this.state.selected.invoices && this.state.selected.invoices.length > 0) && (
                                    <PainTable
                                        keyField='id' data={this.state.selected.invoices} 
                                        columns={invheads}/>
                                )}
                        </>
                        )}
                        {(this.state.subTab === 'comments') && (
                        <>
                                <TemplateButton onClick={() => this.addComment({id:"new"})} label={<AddBoxIcon/>}/>
                                {this.state.selected.comments.sort((a,b) => (a.created > b.created ? -1:1)).map((e) => { 
                                    return (
                                        <Grid item xs="3" key={e.id}>
                                            <Container style={{margin:20,width:400,height:200}} className="mb-xlg border-1">
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
                                                        <TemplateTextArea value={e.text} 
                                                            onChange={this.comment} 
                                                        />
                                                      </Grid>
                                                    </Grid>
                                                    )}
                                                </Grid>
                                                <Grid container xs="12">
                                                    {(e.edit) && ( 
                                                    <Grid item xs="12">
                                                        <Grid item xs="6">
                                                            <TemplateButton onClick={this.saveComment} label='Save'/>
                                                            <TemplateButton outline style={{marginLeft:10}} 
                                                                onClick={this.cancelComment} label='Cancel'/>
                                                        </Grid>
                                                    </Grid>
                                                    )}
                                                </Grid>
                                            </Container>
                                        </Grid>
                                    )})}
                            </>
                            )}
                    </Grid>
                </Grid>
                <hr/>
                <Grid container xs="12" style={{marginTop:20}}>
                    <Grid item xs="6">
                        <TemplateButton onClick={this.save} color="primary" disabled={!this.state.selected.name || !this.state.selected.email || 
                          this.state.errorMessage || this.state.phoneMessage} label='Save'/>
                        <TemplateButton outline style={{marginLeft:10}} onClick={this.cancel} label='Cancel'/>
                    </Grid>
                </Grid>
            </>
            )}
            </Box>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        officeSave: store.officeSave,
        officeReportDownload: store.officeReportDownload,
        plansList: store.plansList,
        context: store.context,
        offices: store.offices
    }
}

export default connect(mapStateToProps)(OfficeList);
