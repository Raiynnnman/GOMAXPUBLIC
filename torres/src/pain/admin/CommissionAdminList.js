import React, { Component } from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { connect } from 'react-redux';
import moment from 'moment';
import { push } from 'connected-react-router';
import cx from 'classnames';
import classnames from 'classnames';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getCommissionAdmin } from '../../actions/commissions';
import { getCommissionUserAdmin } from '../../actions/commissionsUser';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'react-toastify';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import 'react-toastify/dist/ReactToastify.css';
import PainTable from '../utils/PainTable';
import TemplateSelect from '../utils/TemplateSelect';
import TemplateSelectEmpty from '../utils/TemplateSelectEmpty';
import TemplateSelectMulti from '../utils/TemplateSelectMulti';
import TemplateTextField from '../utils/TemplateTextField';
import TemplateTextArea from '../utils/TemplateTextArea';
import TemplateCheckbox from '../utils/TemplateCheckbox';
import TemplateButton from '../utils/TemplateButton';
import TemplateButtonIcon from '../utils/TemplateButtonIcon';
import TemplateBadge from '../utils/TemplateBadge';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Navbar from '../../components/Navbar';
import LaunchIcon from '@mui/icons-material/Launch';

class CommissionAdminList extends Component {
    constructor(props) { 
        super(props);
        this.state = {
            selected: null,
            assignPhysician: null,
            page: 0,
            pageSize: 10,
            filter: null,
            periodSelected: null,
            commentAdd:false
        } 
        this.edit = this.edit.bind(this);
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.zipcodeChange = this.zipcodeChange.bind(this);
        this.firstChange = this.firstChange.bind(this);
        this.lastChange = this.lastChange.bind(this);
        this.addr1Change = this.addr1Change.bind(this);
        this.addr2Change = this.addr2Change.bind(this);
        this.commissionReport = this.commissionReport.bind(this);
        this.cityChange = this.cityChange.bind(this);
        this.onPeriodFilter = this.onPeriodFilter.bind(this);
        this.stateChange = this.stateChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.pageGridsChange = this.pageGridsChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
        if (p.commissions.data && p.commissions.data.config && 
            p.commissions.data.config.period && this.state.periodSelected === null) { 
            var c = 0;
            var t = [];
            this.state.periodSelected = []
            this.state.periodSelected.push({
                label:p.commissions.data.config.period[0].label,
                value:p.commissions.data.config.period[0].value
            })
            this.state.filter = [p.commissions.data.config.period[0].value]
            this.setState(this.state);
            this.props.dispatch(getCommissionAdmin(
                {period:this.state.filter,limit:this.state.pageSize,offset:this.state.page}
            ));
        }
    }

    componentDidMount() {
        if (this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes('BusinessDevelopmentRepresentative')) { 
            this.props.dispatch(getCommissionUserAdmin({page:this.state.page,limit:this.state.pageSize}))
        } else if (this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes('AccountExecutive')) { 
            this.props.dispatch(getCommissionUserAdmin({page:this.state.page,limit:this.state.pageSize}))
        } else {  
            this.props.dispatch(getCommissionAdmin({page:this.state.page,limit:this.state.pageSize}))
       }
    }

    commissionReport() { 
        if (this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes('BusinessDevelopmentRepresentative')) { 
            this.props.dispatch(getCommissionUserAdmin(
                {direction:this.state.direction,
                 sort:this.state.sort,
                 search:this.state.search,
                 limit:this.state.pageSize,offset:this.state.page,
                 report:1,
                 period:this.state.filter}
            ));
        } else if (this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes('AccountExecutive')) { 
            this.props.dispatch(getCommissionUserAdmin(
                {direction:this.state.direction,
                 sort:this.state.sort,
                 search:this.state.search,
                 limit:this.state.pageSize,offset:this.state.page,
                 report:1,
                 period:this.state.filter}
            ));
        } else {
            this.props.dispatch(getCommissionAdmin(
                {direction:this.state.direction,
                 sort:this.state.sort,
                 search:this.state.search,
                 limit:this.state.pageSize,offset:this.state.page,
                 report:1,
                 period:this.state.filter}
            ));
        }
    } 

    onPeriodFilter(e,t) { 
        var c = 0;
        var t = [];
        this.state.periodSelected = []
        if (!e) { return; }
        for (c = 0; c < e.length; c++) { 
            t.push(e[c].value); 
            this.state.periodSelected.push(e[c])
        } 
        if (t.length < 1 ) { return; }
        this.state.filter = t;
        if (this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes('BusinessDevelopmentRepresentative')) { 
            this.props.dispatch(getCommissionUserAdmin(
                {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
            ));
        } else if (this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes('AccountExecutive')) { 
            this.props.dispatch(getCommissionUserAdmin(
                {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
            ));
        } else { 
            this.props.dispatch(getCommissionAdmin(
                {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
            ));
        } 
        this.setState(this.state)
    } 

    pageGridsChange(t) { 
        this.state.pageSize = t
        this.state.page = 0
        if (this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes('BusinessDevelopmentRepresentative')) { 
            this.props.dispatch(getCommissionUserAdmin(
                {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
            ));
        } else if (this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes('AccountExecutive')) { 
            this.props.dispatch(getCommissionUserAdmin(
                {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
            ));
        } else { 
            this.props.dispatch(getCommissionAdmin(
                {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
            ));
        }
        this.setState(this.state);
    } 
    pageChange(e) { 
        this.state.page = e
        if (this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes('BusinessDevelopmentRepresentative')) { 
            this.props.dispatch(getCommissionUserAdmin(
                {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
            ));
        } else if (this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes('AccountExecutive')) { 
            this.props.dispatch(getCommissionUserAdmin(
                {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
            ));
        } else { 
            this.props.dispatch(getCommissionAdmin(
                {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
            ));
        }
        this.setState(this.state);
    } 

    addr1Change(e) {
        this.state.selected.addr1 = e.target.value;
        this.setState(this.state);
    }
    addr2Change(e) {
        this.state.selected.addr2 = e.target.value;
        this.setState(this.state);
    }
    cityChange(e) {
        this.state.selected.city = e.target.value;
        this.setState(this.state);
    }
    stateChange(e) {
        this.state.selected.state = e.target.value;
        this.setState(this.state);
    }

    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
    } 
    zipcodeChange(e) { 
        this.state.selected['zipcode'] = e.target.value;
        this.setState(this.state);
    } 
    emailChange(e) { 
        this.state.selected['email'] = e.target.value;
        this.setState(this.state);
    } 

    firstChange(e) { 
        this.state.selected['first_name'] = e.target.value;
        this.setState(this.state);
    } 
    lastChange(e) { 
        this.state.selected['last_name'] = e.target.value;
        this.setState(this.state);
    } 
    phoneChange(e) { 
        this.state.selected['phone'] = e.target.value;
        this.setState(this.state);
    } 

    edit(row) { 
        var r = {}
        if (row.id === 'new') { 
            r = { 
                email:'',
                phone:'',
                addr1:'',
                addr2:'',
                city:'',
                state:'',
                zipcode:'',
                first_name:'',
                last_name:''
            }
        } else { 
            r = row
        } 
        this.state.selected=r
        this.setState(this.state);
    } 
    save() { 
        this.props.onSave(this.state.selected);
        this.state.selected = null;
        this.setState(this.state);
    } 

    render() {
        var heads = [
            {
                dataField:'id',
                hidden:true,
                text:'ID'
            },
            {
                dataField:'name',
                editable: false,
                text:'Name',
            },
            {
                dataField:'office_name',
                editable: false,
                text:'Office',
            },
            {
                dataField:'invoice_id',
                editable: false,
                text:'Invoice ID',
            },
            {
                dataField:'office_id',
                editable: false,
                text:'Office ID',
                formatter:(cellContent,row) => (
                    <div>
                        <a style={{color:'black'}} href={'/app/main/admin/office/' + row.office_id} target='_blank'>{row.office_id}<LaunchIcon/></a>
                    </div>
                )
            },
            {
                dataField:'amount',
                editable: false,
                align:'right',
                text:'Amount',
                formatter:(cellContent,row) => (
                    <div>
                        ${row.amount.toFixed ? row.amount.toFixed(2) : row.amount}
                    </div>
                )
            },
            {
                dataField:'created',
                sort:true,
                editable: false,
                align:'center',
                text:'created',
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row['created']).isValid() ?  
                         moment(row['created']).format('LLL') : moment(row['created2']).format('LLL')}
                    </div>
                )
            },
        ];
        return (
        <>
        <Navbar/>
        <Box style={{margin:20}}>
            {(this.props.commissions && this.props.commissions.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.commissionsUser && this.props.commissionsUser.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.commissionsUser && this.props.commissionsUser.data && 
              this.props.commissionsUser.data.commissions && this.state.selected === null) && ( 
            <>
            <Grid container xs="12">
                <Grid item xs="5" style={{marginBottom:10}}>
                  {(this.props.commissionsUser && this.props.commissionsUser.data && 
                    this.props.commissionsUser.data.config &&
                    this.props.commissionsUser.data.config.period && this.state.periodSelected !== null) && (
                      <TemplateSelectMulti
                          label='Period'
                          onChange={this.onPeriodFilter}
                          value={this.state.periodSelected.map((g) => { 
                            return (
                                {
                                label:this.props.commissionsUser.data.config.period.filter((f) => f.billing_period === g.billing_period)[0].label,
                                value:this.props.commissionsUser.data.config.period.filter((f) => f.billing_period === g.billing_period)[0].value
                                }
                            )
                          })}
                          options={this.props.commissionsUser.data.config.period.map((e) => { 
                            return (
                                { 
                                label: e.label,
                                value: e.value
                                }
                            )
                          })}
                        />
                    )}
                </Grid>
                <Grid item xs="7">
                    <div style={{display:'flex',justifyItems:'end'}}>
                        <div style={{justifyContent:'spread-evenly'}}>
                            <TemplateButtonIcon onClick={this.commissionReport} outline label={<AssessmentIcon/>}/>
                        </div>
                    </div>
                </Grid>
            </Grid>
            <Grid container xs="12">
                <Grid item xs="12">
                    <PainTable
                        keyField='id' 
                        data={this.props.commissionsUser.data.commissions} 
                        total={this.props.commissionsUser.data.total}
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
            {(this.props && this.props.commissions && this.props.commissions.data && 
              this.props.commissions.data.commissions && this.state.selected === null) && ( 
            <>
            <Grid container xs="12">
                <Grid item xs="2" style={{marginBottom:10}}>
                    {/*<TemplateButton onClick={() => this.edit({id:"new"})} 
                        style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                    */}
                </Grid>
            </Grid>
            <Grid container xs="12">
                <Grid item xs="5" style={{marginBottom:10}}>
                  {(this.props.commissions && this.props.commissions.data && 
                    this.props.commissions.data.config &&
                    this.props.commissions.data.config.period && this.state.periodSelected !== null) && (
                      <TemplateSelectMulti
                          closeMenuOnSelect={true}
                          isSearchable={false}
                          isMulti
                          onChange={this.onPeriodFilter}
                          value={this.state.periodSelected.map((g) => { 
                            return (
                                {
                                label:this.props.commissions.data.config.period.filter((f) => f.value === g.value)[0].label,
                                value:this.props.commissions.data.config.period.filter((f) => f.value === g.value)[0].value
                                }
                            )
                          })}
                          options={this.props.commissions.data.config.period.map((e) => { 
                            return (
                                { 
                                label: e.label,
                                value: e.value
                                }
                            )
                          })}
                        />
                    )}
                </Grid>
                <Grid item xs="6"></Grid>
                <Grid item xs="1">
                    <div style={{display:'flex',alignItems:'end',justifyItems:'end'}}>
                        <div style={{justifyContent:'spread-evenly'}}>
                            <TemplateButtonIcon onClick={this.commissionReport} outline label={<AssessmentIcon/>}/>
                        </div>
                    </div>
                </Grid>
            </Grid>
            <Grid container xs="12">
                <Grid item xs="12">
                    <PainTable
                        keyField='id' 
                        data={this.props.commissions.data.commissions} 
                        total={this.props.commissions.data.total}
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
        </Box>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        commissionsUser: store.commissionsUser,
        commissions: store.commissions
    }
}

export default connect(mapStateToProps)(CommissionAdminList);
