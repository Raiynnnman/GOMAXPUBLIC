import React, { Component } from 'react';
import { push } from 'connected-react-router';
import moment from 'moment';
import DownloadIcon from '@mui/icons-material/Download';
import { Badge } from 'reactstrap';
import { connect } from 'react-redux';
import { Col, Grid } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getMyDay } from '../../actions/myday';
import { saveMyDaySchedule } from '../../actions/mydaySchedSave';
import { mydayApptSave } from '../../actions/mydayApptSave';
import { getOfficeBillingDocument } from '../../actions/officeBillingDownloadDoc'; 
import { mydayApproveInvoice } from '../../actions/mydayApproveInvoice';
import Appointment from './Appointment';
import Scheduling from '../utils/Scheduling';
import Select from 'react-select';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { Button } from 'reactstrap'; 
import { FormGroup, Label, Input, InputGroup } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createRoom,clearRoom } from '../../actions/createRoom';
import { mydayReceiptSave } from '../../actions/mydayReceiptSave';
import { cmSearch } from '../../actions/cmSearch';
import { getOfficePatients } from '../../actions/mydayGetOfficePatients';
import { getPhysicians } from '../../actions/phy';

class MyDay extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "myday",
            selectedDate:'',
            isApproved: false,
            selectedDateForRest:'',
            approvedInvoices:[],
            addReceipt:false,
            currentReceipt: {},
            sent: false,
            commentAdd: false,
            selected:null
        }
        this.toggleTabs = this.toggleTab.bind(this);
        this.addReceiptGrid = this.addReceiptGrid.bind(this);
        this.saveReceipt = this.saveReceipt.bind(this);
        this.cancelReceipt = this.cancelReceipt.bind(this);
        this.cmSearch = this.cmSearch.bind(this);
        this.onCMChange = this.onCMChange.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onNewChat = this.onNewChat.bind(this);
        this.onBundleChange = this.onBundleChange.bind(this);
        this.save = this.save.bind(this);
        this.approveInvoice = this.approveInvoice.bind(this);
        this.saveComment = this.saveComment.bind(this);
        this.cancel = this.cancel.bind(this);
        this.cancelComment = this.cancelComment.bind(this);
        this.comment = this.comment.bind(this);
        this.reload = this.reload.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onDownload = this.onDownload.bind(this);
        this.onAddComment = this.onAddComment.bind(this);
        this.onSchedulingChange = this.onSchedulingChange.bind(this);
        this.onChangeInputFiles = this.onChangeInputFiles.bind(this);
    } 
    
    componentDidMount() {
        var j = new Date()
        var date = j.toISOString()
        var date2 = j.toDateString()
        date = date.substring(0,10)
        date2 = date2.substring(0,15)
        this.state.selectedDate = date2
        this.state.selectedDateForRest = date;
        this.setState(this.state)
        this.props.dispatch(getMyDay({date:date}))
        setTimeout((e) => { e.reload() }, 300000,this)
        this.props.dispatch(getOfficePatients());
        this.props.dispatch(getPhysicians({page:0,limit:10000}))
    }
    addReceiptGrid() { 
        this.state.currentReceipt = {};
        this.state.addReceipt = true;
        this.setState(this.state);
    } 
    reload(e) { 
        this.props.dispatch(getMyDay({date:this.state.selectedDateForRest}))
        setTimeout((e) => { e.reload() }, 300000,this)
    } 

    componentWillReceiveProps(p) { 
        if (p.createRoom && p.createRoom.data && p.createRoom.data.success && !this.state.sent) { 
            this.props.dispatch(push('/app/main/office/chat'))
            this.props.dispatch(clearRoom());
            this.setState(this.state);
        } 
    }
    onDownload(e) { 
        var params = {
            id: e.id
        }
        this.props.dispatch(getOfficeBillingDocument(params))
    }
    approveInvoice(r) { 
        var params = {
            invoice_id:r['id']
        } 
        if (r.isApproved) { return; }
        this.props.dispatch(mydayApproveInvoice(params,function(err,args) {
              //this.state.selected = null;
              //this.setState(this.state);
              var j = new Date(args.state.selectedDate)
              var date = j.toISOString()
              date = date.substring(0,10)
              args.state.approvedInvoices.push(r['id']);
              args.props.dispatch(getMyDay({date:date},function(err,args) { 
                  var t = args.state.selected.thisschedule.appt.physician.invoices.invoices[0];
                  args.state.selected.thisschedule.appt.physician.invoices.invoices.splice(0);
                  t['id'] = 'appr' + t['id'];
                  t['isApproved'] = true;
                  t.invoice_status="APPROVED";
                  args.state.selected.thisschedule.appt.physician.invoices.invoices.push(t);
                  args.state.isApproved = true;
                  args.setState(args.state);
                  toast.success('Successfully approved invoice.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    })
                },args))
        },this))
    } 
    save(e) { 
        var params = {
            id:this.state.selected.thisschedule.id,
            bundles:this.state.selected.thisschedule.appt.physician.bundles,
            comments: this.state.selected.thisschedule.appt.physician.comments,
            status:this.state.selected.thisschedule.appt.customer.status_id
        } 
        params.bundles=params.bundles.filter((g) => g.id > 0);
        if (this.state.selected.icd_cm_id) { 
            params['icd_cm_id'] = this.state.selected.icd_cm_id;
        } 
        this.props.dispatch(mydayApptSave(params,function(err,args) { 
            var j = new Date(args.state.selectedDate)
            var date = j.toISOString()
            date = date.substring(0,10)
            args.props.dispatch(getMyDay({date:date},function(err,args) { 
                args.state.selected = null;
                args.setState(args.state)
                toast.success('Successfully saved appointment.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                }
              );
            },args))
        },this));
    } 
    cmSearch(e) { 
        this.state.selected.icd_cm_label = e.target.value;
        var val = e.target.value;
        if (val.length < 3) { return; }
        this.props.dispatch(cmSearch({s:val}))
        this.setState(this.state);
    } 
    onCMChange(e) { 
        this.state.selected.icd_cm_id = e.value;
        if (!this.state.selected.thisschedule.icd_code.code) { 
            this.state.selected.thisschedule.icd_code = {code:''}
        } 
        this.state.selected.thisschedule.icd_code.code = e.label;
        this.setState(this.state);
    }
    onStatusChange(e) { 

        var t = this.props.myday.data.appt_status.filter((g) => g.id === e.value)
        if (t.length < 1) { return; }
        if (t[0].user_assignable !== 1) { 
            toast.warning('Not assignable to the current appointment.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
            )
            return
        } 
        this.state.selected.thisschedule.appt.customer.status_id = e.value
        this.setState(this.state)
    } 
    cancelComment() { 
        this.state.selected.thisschedule.appt.physician.comments.shift();
        this.state.commentAdd = false;
        this.setState(this.state)
    }
    saveComment() { 
        this.state.selected.thisschedule.appt.physician.comments[0].edit = false;
        this.state.commentAdd = false;
        this.setState(this.state)
    } 
    onBundleChange(e,t) { 
        var bun = []
        var c = 0;
        if (e === null) { e = [] }
        var ototal = 0;
        var ctotal = 0;
        for (c; c < e.length;c++) { 
            var bu = this.props.myday.data.bundles.find((g) => g.id === e[c].value)
            bun.push({id:e[c].value,name:e[c].label,items:bu.items})
            ototal += bu.items.reduce((a,b) => a+b.price,ototal)
            ctotal += bu.items.reduce((a,b) => a+b.client_price,ctotal)
        } 
        bun.push({id:0,name:'Total',items:[{quantity:1,price:ototal,client_price:ctotal}]})
        this.state.selected.thisschedule.appt.physician.bundles = bun;
        this.setState(this.state)
    }
    onAddComment() { 
        this.state.selected.thisschedule.appt.physician.comments.unshift({'text':'',edit:true});
        this.state.commentAdd = true;
        this.setState(this.state)
    } 
    comment(e) { 
        this.state.selected.thisschedule.appt.physician.comments[0].text = e.target.value 
        this.setState(this.state)
    }
    cancel() { 
        this.state.selected = null;
        this.setState(this.state)
        var j = new Date(this.state.selectedDate)
        var date = j.toISOString()
        date = date.substring(0,10)
        //this.props.dispatch(getMyDay({date:date}))
    } 

    onSchedulingChange(e,callback) { 
        var params = {
            user_id: e.user_id,
            recurring: e.recurring,
            start_time: e.start_time,
            end_time: e.end_time,
            days:e.days,
            inter:e.inter,
            id:e.id
        }
        if (params.id === 'new') { 
            delete params.id;
        } 
        this.props.dispatch(saveMyDaySchedule(params,function(err,args) { 
            if (err) { 
                  toast.error(err.message,
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    })
                return
            } 
            args.props.dispatch(getMyDay({date:args.state.selectedDateRest},function(err,args) { 
                  toast.success('Successfully saved item.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    })
            },args));
        },this)) 
    }
    onSelect(e) { 
        this.state.isApproved = false;
        var c = 0;
        var sel = {}
        for (c = 0; c < this.props.myday.data.schedule.length;c++) { 
            var t = this.props.myday.data.schedule[c]
            var m = t.schedule.filter((g) => g.id === e.appt_id);
            if (m.length > 0) { 
                sel = t
                sel['thisschedule'] = m[0]
                break;
            } 
        } 
        if (!sel.thisschedule) { return; }
        if (!sel.thisschedule.appt) { return; }
        var ototal = 0;
        var ctotal = 0;
        if (sel.thisschedule.appt.physician.bundles.length > 0) {
            var c = 0;
            for (c;c < sel.thisschedule.appt.physician.bundles.length;c++) { 
                var bu = sel.thisschedule.appt.physician.bundles[c];
                ototal += bu.items.reduce((a,b) => a+b.price,ototal)
                ctotal += bu.items.reduce((a,b) => a+b.client_price,ctotal)
            } 
        } 
        sel.thisschedule.appt.physician.bundles.push({id:0,name:'Total',items:[{quantity:1,price:ototal,client_price:ctotal}]})
        this.state.selected = sel;
        this.setState(this.state);
    }
    onDateChange(e) { 
        var j = new Date(e)
        var date = j.toISOString()
        var date2 = j.toDateString()
        date = date.substring(0,10)
        date2 = date2.substring(0,15)
        this.state.selectedDate = date2
        this.props.dispatch(getMyDay({date:date}))
    } 

    toggleTab(e) { 
        this.state.activeTab = e;
        this.setState(this.state)
    } 

    getTotalPhy(r) { 
        var c = 0;
        var sum = 0;
        if (!r) { return sum.toFixed(2); } 
        for (c; c< r.length;c++)  { 
            sum = sum + (r[c].quantity * r[c].price);
        } 
        return sum.toFixed(2)
    }
    getTotal(r) { 
        var c = 0;
        var sum = 0;
        if (!r) { return sum.toFixed(2); } 
        for (c; c< r.length;c++)  { 
            sum = sum + (r[c].quantity * r[c].client_price);
        } 
        return sum.toFixed(2)
    } 
    onNewChat() { 
        var params = {
            appt_id:this.state.selected.thisschedule.id,
            to:this.state.selected.thisschedule.appt.customer.id
        }
        this.props.dispatch(createRoom(params));
        this.state.sent = false;
        this.setState(this.state);
    } 
    readDataAsUrl = (file) => { 
        return new Promise ((resolve,reject) => { 
            var reader = new FileReader();
            reader.content = null;
            reader.onload = function(e,s) { 
                resolve(e.target.result)
            } 
            reader.readAsDataURL(file)
            
        })
    }
    cancelReceipt() { 
        this.state.addReceipt = false
        this.setState(this.state)
    } 
    saveReceipt() { 
        var params = { 
            mime: this.state.currentReceipt.mime,
            appt_id: this.state.selected.thisschedule.id,
            content: this.state.currentReceipt.content
        } 
        this.props.dispatch(mydayReceiptSave(params,function(err,args) { 
            if (err) { 
                toast.error('Failed to save. Reason: ' + err.message,
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    })
                return;
            } 
            args.state.selected.thisschedule.appt.physician.invoices.documents.push({
                id:'new',description:'Receipt'
            })
            toast.success('Successfully saved receipt.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }       
            )
            args.state.currentReceipt = {};
            args.state.addReceipt = {};
            args.cancelReceipt()
            args.setState(this.state);
        },this))
    } 
    onChangeInputFiles(e) {
        const files = [];
        let i = 0;
        this.state.currentReceipt.mime = e.target.files[0].type
        Promise.all(Array.from(e.target.files).map(this.readDataAsUrl)).then((g) => { 
            this.state.currentReceipt.content = g[0]
            this.setState( this.state );
        })
    }

    render() {
        const styles = {
            control: (css) => ({
              ...css,
              width: 300,
            }),
            menu: ({ width, ...css }) => ({
              ...css,
              width: 600,
            }),
            // Add padding to account for width of Indicators Container plus padding
            option: (css) => ({ ...css, paddingRight: 36 + 8 })
        };
        var bundleheads = [
            {
                dataField:'id',
                hidden:true,
                style:{width:"10%"},
                text:'id'
            },
            {
                dataField:'name',
                style: { width:"30%" },
                text:'Bundle',
                formatter:(cellContent,row) => (
                    <>
                    {(row.name === 'Total') && (
                        <div className='pull-right'>
                        <font style={{fontWeight:"bold"}}>{row.name}</font>
                        </div>
                    )}
                    {(row.name !== 'Total') && (
                    <>
                        {row.name}
                    </>
                    )}
                    </>
                )
            },
            {
                dataField:'tot',
                text:'SubTotal',
                style: { width:"10%" },
                align:"right",
                formatter:(cellContent,row) => ( 
                    <>
                    {(row.name === 'Total') && (
                        <div className='pull-right'>
                        <font style={{fontWeight:"bold"}}>${this.getTotalPhy(row.items)}</font>
                        </div>
                    )}
                    {(row.name !== 'Total') && (
                    <>
                    ${this.getTotalPhy(row.items)}
                    </>
                    )}
                    </>
                )
            },
            {
                dataField:'ctot',
                text:'Client Total',
                style: { width:"10%" },
                align:"right",
                formatter:(cellContent,row) => ( 
                    <>
                    {(row.name === 'Total') && (
                        <div className='pull-right'>
                        <font style={{fontWeight:"bold"}}>${this.getTotal(row.items)}</font>
                        </div>
                    )}
                    {(row.name !== 'Total') && (
                        <>
                        ${this.getTotal(row.items)}
                        </>
                    )}
                    </>
                )
            },
            /*{
                dataField:'act',
                text:'Actions',
                style: { width:"10%" },
                formatter:(cellContent,row) => ( 
                    <div>
                        {(!this.state.approvedInvoices.includes(row['id']) && row.invoice_status === 'CREATED' && 
                          !this.state.isApproved) && (
                            <Button onClick={() => this.approveInvoice(row)} style={{marginRight:5,height:35,width:90}} 
                                color="primary">Approve</Button>
                        )}
                    </div>
                )
            },*/
        ]
        var invoiceheads = [
            {
                dataField:'id',
                style:{width:"10%"},
                text:'id'
            },
            {
                dataField:'invoice_status',
                style: { width:"30%" },
                text:'Status'
            },
            {
                dataField:'tot',
                text:'Total',
                style: { width:"10%" },
                align:"right",
                formatter:(cellContent,row) => ( 
                    <>
                    ${row.patient_total.toFixed(2)}
                    </>
                )
            },
            {
                dataField:'updated',
                editable:false,
                style: { width:"20%" },
                align:"center",
                text:'Updated',
                formatter:(cellContent,row) => ( 
                    <div>
                        {moment(row['updated']).format('LLL')} 
                    </div>
                )
            },
            {
                dataField:'act',
                text:'Actions',
                style: { width:"10%" },
                formatter:(cellContent,row) => ( 
                    <div>
                        {(!this.state.approvedInvoices.includes(row['id']) && row.invoice_status === 'CREATED' && 
                          !this.state.isApproved) && (
                            <Button onClick={() => this.approveInvoice(row)} style={{marginRight:5,height:35,width:90}} 
                                color="primary">Approve</Button>
                        )}
                    </div>
                )
            },
        ]
        var heads = [
            {
                dataField:'id',
                hidden:true,
                text:'Name'
            },
            {
                dataField:'name',
                editable:false,
                align:"left",
                style: { width:"40%" },
                text:'Name'
            },
            {
                dataField:'price',
                editable:true,
                align:"right",
                style: { width:"20%" },
                text:'Price',
                formatter:(cellContent,row) => ( 
                    <div>
                        ${row.price.toFixed(2)}
                    </div>
                )
            },
            {
                dataField:'act',
                text:'Actions',
                style: { width:"10%" },
                formatter:(cellContent,row) => ( 
                    <div>
                        <Button onClick={() => this.deleteBundle(row)} style={{marginRight:5,height:35,width:90}} color="primary">Delete</Button>
                    </div>
                )
            },
        ]
        const invoice_expand = {
            renderer: row => ( 
                <Grid container xs="12">
                    <Grid item xs="12">
                        <table style={{width:"100%"}}>
                            <tr>
                            <th ><div class="text-center">Code</div></th>
                            <th ><div class="text-center">Description</div></th>
                            <th ><div class="text-center">Quantity</div></th>
                            <th ><div class="text-center">Cost</div></th>
                            <th ><div class="text-center">Price</div></th>
                            </tr>
                        {row.items.map((e) => { 
                            return (
                            <tr>
                                <td >{e.code}</td>
                                <td >{e.desc}</td>
                                <td ><div class="text-center">{e.quantity}</div></td>
                                <td ><div class="pull-right">${e.phy_total.toFixed(2)}</div></td>
                                <td ><div class="pull-right">${e.price.toFixed(2)}</div></td>
                            </tr>
                            )
                        })}
                        </table>
                    </Grid>
                </Grid>
            )
        }
        return (
        <>
            {(this.props.myday && this.props.myday.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.officeBillingDownloadDoc && this.props.officeBillingDownloadDoc.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.createRoom && this.props.createRoom.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.mydayReceiptSave && this.props.mydayReceiptSave.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.mydaySchedSave && this.props.mydaySchedSave.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.mydayApptSave && this.props.mydayApptSave.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.mydayApproveInvoice && this.props.mydayApproveInvoice.isReceiving) && (
                <AppSpinner/>
            )}
            <Grid container xs="12">
                <Grid item xs="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'myday' })}
                                onClick={() => { this.toggleTab('myday') }}>
                                <span>{translate('My Day')}</span>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'scheduling' })}
                                onClick={() => { this.toggleTab('scheduling') }}>
                                <span>{translate('Scheduling')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                        <TabPane tabId="myday">
                            {(this.props.myday && this.props.myday.data && this.state.selected===null) && (
                                <Appointment data={this.props.myday.data} dateSelected={this.state.selectedDate} patients={this.props.mydayGetOfficePatients.data}
                                    onSelected={this.onSelect} onDateChange={this.onDateChange}/>
                            )}
                            {(this.props.myday && this.props.myday.data && this.state.selected!==null) && (
                                <>
            
                                <Grid container xs="12">
                                    <Grid item xs="4">
                                        <h5>Customer</h5>
                                    </Grid>
                                    <Grid item xs="8">
                                        {(this.state.selected.thisschedule.appt.physician.invoices && 
                                          this.state.selected.thisschedule.appt.physician.invoices.invoices && 
                                          this.state.selected.thisschedule.appt.physician.invoices.invoices.length < 1) && (
                                        <h4>Bundles</h4>
                                        )}
                                        {(this.state.selected.thisschedule.appt.physician.invoices && 
                                          this.state.selected.thisschedule.appt.physician.invoices.invoices && 
                                          this.state.selected.thisschedule.appt.physician.invoices.invoices.length > 0) && (
                                        <h4>Invoice</h4>
                                        )}
                                    </Grid>
                                </Grid>
                                <hr/>
                                <Grid container xs="12">
                                    <Grid item xs="4">
                                        <Grid container xs="12">
                                            <Grid item xs="4">
                                                ID: 
                                            </Grid>                
                                            <Grid item xs="8">
                                                {this.state.selected.thisschedule.id}
                                            </Grid>                
                                        </Grid>
                                        <Grid container xs="12">
                                            <Grid item xs="4">
                                                Date and Time: 
                                            </Grid>                
                                            <Grid item xs="8">
                                                {this.state.selected.thisschedule.day} @ {this.state.selected.thisschedule.time}
                                            </Grid>                
                                        </Grid>
                                        <Grid container xs="12">
                                            <Grid item xs="4">
                                                Procedure:
                                            </Grid>                
                                            <Grid item xs="8">
                                                {this.state.selected.thisschedule.appt.customer.subprocedure.name} 
                                            </Grid>                
                                        </Grid>
                                        <Grid container xs="12">
                                            <Grid item xs="4">
                                                Customer:    
                                            </Grid>                
                                            <Grid item xs="8">
                                                {
                                                 this.state.selected.thisschedule.appt.customer.first_name + " " + 
                                                 this.state.selected.thisschedule.appt.customer.last_name
                                                }
                                            </Grid>                
                                        </Grid>
                                        <Grid container xs="12">
                                            <Grid item xs="4">
                                                Email:    
                                            </Grid>                
                                            <Grid item xs="8">
                                                {
                                                 this.state.selected.thisschedule.appt.customer.email 
                                                }
                                            </Grid>                
                                        </Grid>
                                        <Grid container xs="12">
                                            <Grid item xs="4">
                                                Phone:    
                                            </Grid>                
                                            <Grid item xs="8">
                                                {
                                                 this.state.selected.thisschedule.appt.customer.phone
                                                }
                                            </Grid>                
                                        </Grid>
                                        <Grid container xs="12">
                                            <Grid item xs="4">
                                                Chat:
                                            </Grid>                
                                            <Grid item xs="8">
                                                <Button onClick={this.onNewChat} color="primary">Chat with Patient</Button>
                                            </Grid>                
                                        </Grid>
                                        <Grid container xs="12" style={{marginTop:5}}>
                                            <Grid item xs="4">
                                                Status:
                                            </Grid>                
                                            <Grid item xs="8">
                                              <Select
                                                  closeMenuOnSelect={true}
                                                  isSearchable={false}
                                                  onChange={this.onStatusChange}
                                                  value={{label:this.props.myday.data.appt_status.filter((e) => e.id === 
                                                                this.state.selected.thisschedule.appt.customer.status_id)[0].name
                                                  }}
                                                  options={this.props.myday.data.appt_status.map((e) => { 
                                                    return (
                                                        { 
                                                        label: e.name,
                                                        value: e.id
                                                        }
                                                    )
                                                  })}
                                                />
                                                {
                                                }
                                            </Grid>                
                                        </Grid>
                                        <Grid container xs="12" style={{marginTop:5}}>
                                            <Grid item xs="4">
                                                ICD-10-CM:
                                            </Grid>                
                                            <Grid item xs="8">
                                                <div style={{display:"flex",alignItems:'center',justifyContent:'start'}}>
                                              <Select
                                                  closeMenuOnSelect={true}
                                                  styles={styles}
                                                  isSearchable={true}
                                                  onChange={this.onCMChange}
                                                  onKeyDown={this.cmSearch}
                                                  value={{
                                                    label:this.state.selected.thisschedule.icd_code.code
                                                  }}
                                                  options={this.props.cmSearch.data.map((e) => { 
                                                    return (
                                                        { 
                                                        label: e.code + " - " + e.description,
                                                        value: e.code
                                                        }
                                                    )
                                                  })}
                                                />
                                                {(this.props.cmSearch.isReceiving) && ( 
                                                    <Button className="button-spinny button-spinny-loading" 
                                                        style={{marginLeft:10,height:40,width:50}} color="primary"><i class="fa fa-spinner fa-spin"></i></Button>
                                                )}
                                                </div>
                                            </Grid>                
                                        </Grid>
                                    </Grid>
                                    <Grid item xs="8">
                                        <Grid container xs="12">
                                            {(this.state.selected.thisschedule.appt.physician.invoices && 
                                              this.state.selected.thisschedule.appt.physician.invoices.invoices && 
                                              this.state.selected.thisschedule.appt.physician.invoices.invoices.length < 1) && (
                                            <Grid item xs="12">
                                              <Select
                                                  closeMenuOnSelect={true}
                                                  isSearchable={true}
                                                  isMulti
                                                  onChange={this.onBundleChange}
                                                  value={this.state.selected.thisschedule.appt.physician.bundles.filter((g) => g.id > 0).map((g) => { 
                                                    return (
                                                        { 
                                                        label: this.props.myday.data.bundles.filter((k) => k.id === g.id).length > 0 ? 
                                                            this.props.myday.data.bundles.filter((k) => k.id === g.id)[0].name : "Error: " + g.procedure,
                                                        id: g.id,
                                                        value: g.id
                                                        }
                                                    )
                                                  })}
                                                  options={this.props.myday.data.bundles.map((e) => { 
                                                    return (
                                                        { 
                                                        label: e.name,
                                                        value: e.id
                                                        }
                                                    )
                                                  })}
                                                />
                                            </Grid>
                                            )}
                                            {(this.state.selected.thisschedule.appt.physician.invoices && 
                                              this.state.selected.thisschedule.appt.physician.invoices.invoices && 
                                              this.state.selected.thisschedule.appt.physician.invoices.invoices.length > 0) && (
                                            <Grid item xs="12">
                                                <BootstrapTable 
                                                    keyField='id' data={
                                                        this.state.selected.thisschedule.appt.physician.invoices.invoices
                                                    } 
                                                    expandGrid={invoice_expand}
                                                    columns={invoiceheads}> 
                                                </BootstrapTable>
                                            </Grid>
                                            )}
                                        </Grid>
                                        {(this.state.selected.thisschedule.appt.physician.invoices && 
                                          this.state.selected.thisschedule.appt.physician.invoices.invoices && 
                                          this.state.selected.thisschedule.appt.physician.invoices.invoices.length < 1) && (
                                        <Grid container xs="12" style={{marginTop:10}}>
                                            <Grid item xs="12">
                                                <BootstrapTable 
                                                    keyField='id' data={
                                                        this.state.selected.thisschedule.appt.physician.bundles
                                                    } 
                                                    expandGrid={invoice_expand}
                                                    columns={bundleheads}> 
                                                </BootstrapTable>
                                            </Grid>
                                        </Grid>
                                        )}
                                        {(this.state.selected.thisschedule.appt.physician.status === 'APPOINTMENT_COMPLETED') && (
                                            <>
                                            <h5>Receipt</h5>
                                            {(!this.state.addReceipt) && ( 
                                            <Button onClick={this.addReceiptGrid} style={{marginBottom:10,height:35}} color="primary">Add Receipt</Button>
                                            )}
                                            {(this.state.addReceipt) && ( 
                                                <InputGroup className="fileinput fileinput-new">
                                                  <input
                                                    onChange={this.onChangeInputFiles}
                                                    id="fileupload1"
                                                    style={{display:"block"}}
                                                    type="file" name="file" className="display-none"
                                                  />
                                                </InputGroup>
                                            )}
                                            {(this.state.addReceipt) && ( 
                                                <Button onClick={this.saveReceipt} 
                                                    disabled={!this.state.currentReceipt.content}
                                                    style={{marginTop:10,marginBottom:10,height:35}} color="primary">Save</Button>
                                            )}
                                            </>
                                        )}
                                        {(this.state.selected.thisschedule.appt.physician.invoices&& 
                                          this.state.selected.thisschedule.appt.physician.invoices.documents && 
                                          this.state.selected.thisschedule.appt.physician.invoices.documents.length > 0) && (
                                        <>
                                        <Grid container xs="12" style={{marginTop:10}}>
                                            <Grid item xs="12">
                                                <h5>Documents</h5>
                                            </Grid>
                                        </Grid>
                                        <Grid container xs="12" style={{marginTop:10}}>
                                            {this.state.selected.thisschedule.appt.physician.invoices.documents.map((e) => {
                                                return (
                                                    <Grid item xs="2">
                                                    <Button outline style={{marginTop:5}} color="primary" 
                                                        onClick={() => this.onDownload(e)}>{e.description} <DownloadIcon/></Button>
                                                    </Grid>
                                                )
                                            })}
                                        </Grid>
                                        </>
                                        )}
                                    </Grid>
                                </Grid>
                                <hr/>
                                <Grid container xs="12" style={{marginBottom:10}}>
                                    {(this.state.selected.thisschedule.appt.physician.invoices && this.state.selected.thisschedule.appt.physician.invoices.length >0) && (
                                    <>
                                    <Grid container xs="12">
                                        <h4>Invoices</h4>
                                    </Grid>
                                    <Grid container xs="12">
                                        <Grid item xs="6">
                                            <BootstrapTable 
                                                keyField='id' data={this.state.selected.thisschedule.appt.physician.invoices} 
                                                cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true })}
                                                columns={invoiceheads}> 
                                            </BootstrapTable>
                                        </Grid>
                                    </Grid>
                                    </>
                                    )}
                                </Grid>
                                <Grid container xs="12" style={{marginBottom:10}}>
                                    <Grid container xs="12">
                                    <h4>Notes</h4>
                                    </Grid>
                                    <Grid container xs="12">
                                        <Grid item xs="4">
                                            <Button onClick={this.onAddComment} color="primary">Add Notes</Button>
                                        </Grid>
                                    </Grid>
                                    <Grid container xs="12" style={{marginTop:10}}>
                                        <>
                                        {this.state.selected.thisschedule.appt.physician.comments.sort((a,b) => (a.created > b.created ? -1:1)).map((e) => { 
                                            if (e.text === null) { return (<></>) }
                                            return (
                                                <Grid item xs="4" key={e.id}>
                                                    <Card style={{borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px",
                                                        width:400,height:200}} className="mb-xlg border-1">
                                                        <CardBody>
                                                            <Grid container xs="12">
                                                                <Grid item xs="6">
                                                                    <font style={{fontSize:"14pt"}}>
                                                                        <>
                                                                        {(this.props.myday.data.physicians.filter((g) => g.id === e.user_id).length > 0 &&  
                                                                            this.props.myday.data.physicians.filter((g) => g.id === e.user_id)[0].dhd === 1) && (
                                                                            <Badge style={{marginRight:10}} color="primary">POUNDPAIN TECH</Badge>
                                                                        )}
                                                                        {
                                                                        this.props.myday.data.physicians.filter((g) => g.id === e.user_id).length > 0 ? 
                                                                        this.props.myday.data.physicians.filter((g) => g.id === e.user_id)[0].first_name + " " +
                                                                        this.props.myday.data.physicians.filter((g) => g.id === e.user_id)[0].last_name + " " : "" 
                                                                        }
                                                                        </>
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
                                                                    <div style={{overflow:"auto",height:100,display: 'flex', alignItems: 'start', justifyContent: 'start'}}>
                                                                    {e.text}
                                                                    </div>
                                                                </Grid>
                                                                )}
                                                                {(e.edit) && ( 
                                                                <Grid item xs="12">
                                                                    <FormGroup row>
                                                                      <Grid item xs={12}>
                                                                        <Input value={e.text} rows="3" 
                                                                            onChange={this.comment} type="textarea" 
                                                                            name="text" id="default-textarea" />
                                                                      </Grid>
                                                                    </FormGroup>
                                                                </Grid>
                                                                )}
                                                            </Grid>
                                                            <Grid container xs="12">
                                                                {(e.edit) && ( 
                                                                <Grid item xs="12">
                                                                    <Grid item xs="6">
                                                                        <Button onClick={this.saveComment} color="primary">Save</Button>
                                                                        <Button outline style={{marginLeft:10}} onClick={this.cancelComment} color="secondary">Cancel</Button>
                                                                    </Grid>
                                                                </Grid>
                                                                )}
                                                            </Grid>
                                                        </CardBody>
                                                    </Card>
                                                </Grid>
                                            )})}
                                            </>
                                    </Grid>
                                    <hr/>
                                    <Grid container xs="12">
                                        {(!this.state.commentAdd) && (
                                        <Grid item xs="6">
                                            <Button onClick={this.save} color="primary">Save</Button>
                                            <Button outline style={{marginLeft:10}} onClick={this.cancel} color="secondary">Cancel</Button>
                                        </Grid>
                                        )}
                                    </Grid>
                                </Grid>
                            </>
                            )}
                        </TabPane>
                        <TabPane tabId="scheduling">
                            <Scheduling assignee={this.props.myday.data.physicians} 
                                data={this.props.myday.data.config} onSchedulingChange={this.onSchedulingChange}/>
                        </TabPane>
                    </TabContent>
                </Grid>                
            </Grid>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        myday: store.myday,
        mydaySchedSave: store.mydaySchedSave,
        mydayApproveInvoice: store.mydayApproveInvoice,
        mydayApptSave: store.mydayApptSave,
        mydayReceiptSave: store.mydayReceiptSave,
        cmSearch: store.cmSearch ? store.cmSearch : {data:[]},
        createRoom: store.createRoom,
        officeBillingDownloadDoc: store.officeBillingDownloadDoc,
        getPhysicians: store.getPhysicians,
        mydayGetOfficePatients:store.mydayGetOfficePatients ? store.mydayGetOfficePatients:{patients:[]},
    }
}

export default connect(mapStateToProps)(MyDay);
