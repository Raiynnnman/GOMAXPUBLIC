import React, { Component } from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Datetime from 'react-datetime';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { connect } from 'react-redux';
import { getPlansList } from '../../actions/plansList';
import moment from 'moment';
import { push } from 'connected-react-router';
import { searchRegister } from '../../actions/searchRegister';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getCouponAdmin } from '../../actions/coupons';
import { couponSave } from '../../actions/couponSave';
import EditIcon from '@mui/icons-material/Edit';
import { searchCheckRes } from '../../actions/searchCheckRes';
import { toast } from 'react-toastify';
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

class CouponAdminList extends Component {
    constructor(props) { 
        super(props);
        this.state = {
            selected: null,
            page: 0,
            pageSize: 10,
            filter: null
        } 
        this.edit = this.edit.bind(this);
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.planChange = this.planChange.bind(this);
        this.reductionChange = this.reductionChange.bind(this);
        this.totalChange = this.totalChange.bind(this);
        this.activeChange = this.activeChange.bind(this);
        this.startChange = this.startChange.bind(this);
        this.endChange = this.endChange.bind(this);
        this.nameChange = this.nameChange.bind(this);
        this.percChange = this.percChange.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.pageGridsChange = this.pageGridsChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
        if (p.coupons.data && p.coupons.data.config && 
            p.coupons.data.config.period && this.state.periodSelected === null) { 
            var c = 0;
            var t = [];
            this.state.periodSelected = []
            this.state.periodSelected.push({
                label:p.coupons.data.config.period[0].label,
                value:p.coupons.data.config.period[0].value
            })
            this.state.filter = [p.coupons.data.config.period[0].value]
            this.setState(this.state);
            this.props.dispatch(getCouponAdmin(
                {period:this.state.filter,limit:this.state.pageSize,offset:this.state.page}
            ));
        }
    }

    labelSelect(e) { 
        const g = e.description + " - " + e.office_type + " - " + "($" + e.upfront_cost + ")";
        return g;
    } 
    componentDidMount() {
        this.props.dispatch(getCouponAdmin({page:this.state.page,limit:this.state.pageSize}))
        this.props.dispatch(getPlansList({}));
    }

    commissionReport() { 
        this.props.dispatch(getCouponAdmin(
            {direction:this.state.direction,
             sort:this.state.sort,
             search:this.state.search,
             limit:this.state.pageSize,offset:this.state.page,
             report:1,
             period:this.state.filter}
        ));
    } 

    onPeriodFilter(e,t) { 
        if (e.length <2 ) { return; }
        var c = 0;
        var t = [];
        for (c = 0; c < e.length; c++) { 
            t.push(e[c].value); 
        } 
        this.state.statusSelected = t;
        this.state.filter = t;
        this.props.dispatch(getCouponAdmin(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
        ));
        this.setState(this.state)
    } 

    pageGridsChange(t) { 
        this.state.pageSize = t
        this.state.page = 0
        this.props.dispatch(getCouponAdmin(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
        ));
        this.setState(this.state);
    } 
    pageChange(e) { 
        this.state.page = e
        this.props.dispatch(getCouponAdmin(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
        ));
        this.setState(this.state);
    } 

    nameChange(e) {
        this.state.selected.name = e.target.value;
        this.setState(this.state);
    }
    endChange(e) {
        this.state.selected.end_date = e
        this.setState(this.state);
    }
    startChange(e) {
        this.state.selected.start_date = e
        this.setState(this.state);
    }
    reductionChange(e) {
        this.state.selected.reduction = e.target.value;
        if (this.state.selected.reduction.length < 1) { 
            this.state.selected.reduction = null;
        } 
        this.setState(this.state);
    }
    percChange(e) {
        this.state.selected.perc = e.target.value;
        if (this.state.selected.perc.length < 1) { 
            this.state.selected.perc = null;
        } 
        this.setState(this.state);
    }

    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
    } 
    totalChange(e) { 
        this.state.selected.total = e.target.value;
        if (this.state.selected.total.length < 1) { 
            this.state.selected.total = null;
        } 
        this.setState(this.state);
    } 
    planChange(e,t) { 
        var v1 = this.props.plansList.data.filter((f) => e.target.value === this.labelSelect(f))
        this.state.selected.pricing_data_id = v1[0].id;
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
                name:'',
                active:true,
                start_date:'',
                end_date:'',
                total:null,
                perc:null,
                reduction:null,
            }
        } else { 
            r = row
        } 
        this.state.selected=r
        this.setState(this.state);
    } 
    activeChange(e,t) { 
        this.state.selected.active = this.state.selected.active ? 0 : 1; 
        this.setState(this.state);
    }
    save() { 
        var tosend = this.state.selected
        if (tosend.total) { 
            if (tosend.total.replace) { 
                tosend.total = parseFloat(tosend.total.replace("$",""));
            } 
        }
        if (tosend.perc) { 
            if (tosend.perc.replace) { 
                tosend.perc = parseFloat(tosend.perc.replace("%",""));
            }
            if (tosend.perc > 0) { tosend.perc = tosend.perc / 100 }
        }
        if (tosend.reduction) { 
            if (tosend.reduction.replace) { 
                tosend.reduction = parseFloat(tosend.reduction.replace("$",""));
            }
        } 
        this.props.dispatch(couponSave(tosend,function(err,args) { 
            args.props.dispatch(
                getCouponAdmin(
                    {limit:args.state.pageSize,offset:args.state.page,status:args.state.filter},function(err,args) { 
              toast.success('Successfully saved coupon.',
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
                dataField:'description',
                editable: false,
                text:'Plan',
                formatter: (cellContent,row) => (
                    <div>
                        {row.description + " (" + row.duration + " months)"}
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
                dataField:'full_price',
                editable: false,
                align:'right',
                text:'Full Price',
                formatter:(cellContent,row) => (
                    <div>
                        ${row.full_price.toFixed(2)} 
                    </div>
                )
            },
            {
                dataField:'total',
                editable: false,
                align:'right',
                text:'Total',
                formatter:(cellContent,row) => (
                    <div>
                        {row.total ? row.total.toFixed ? '$' + row.total.toFixed(2) : "$" + row.total : '-'}
                    </div>
                )
            },
            {
                dataField:'perc',
                editable: false,
                align:'right',
                text:'Percentage',
                formatter:(cellContent,row) => (
                    <div>
                        {row.perc ? row.perc * 100 + "%": "-"}
                    </div>
                )
            },
            {
                dataField:'reduction',
                editable: false,
                align:'right',
                text:'Reduction',
                formatter:(cellContent,row) => (
                    <div>
                        {row.reduction ? row.reduction.toFixed ? "$" + row.reduction.toFixed(2) : row.reduction : "-"}
                    </div>
                )
            },
            {
                dataField:'end_date',
                sort:true,
                editable: false,
                align:'center',
                text:'Ends',
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row['end_date']).isValid() ?  
                         moment(row['end_date']).format('lll') : row['end_date']}
                    </div>
                )
            },
            {
                dataField:'id',
                text:'Actions',
                editable: false,
                formatter:(cellContent,row) => ( 
                    <div>
                        <TemplateButtonIcon onClick={() => this.edit(row)} style={{marginRight:5,height:35}} label={<EditIcon/>}/>
                    </div>
                )
            }
        ];
        return (
        <>
        <Navbar/>
        <Box style={{margin:10}}>
            {(this.props.coupons && this.props.coupons.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.coupons && this.props.coupons.data && 
              this.props.coupons.data.coupons && this.state.selected === null) && ( 
            <>
            
            <Grid container xs="12">
                <Grid item xs="2" style={{marginBottom:10}}>
                    <Grid item xs="1">
                        <TemplateButtonIcon onClick={() => this.edit({id:"new"})} style={{width:50}}
                            label={<AddBoxIcon/>}/>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container xs="12">
                <Grid item xs="12">
                    <PainTable
                        keyField='id' 
                        data={this.props.coupons.data.coupons} 
                        total={this.props.coupons.data.total}
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
            {(this.props && this.props.coupons && this.props.coupons.data && 
              this.props.coupons.data.coupons && this.state.selected !== null) && ( 
              <>
                <Grid container xs="12" style={{marginTop:10}}>
                      {this.state.selected.id && (
                        <Grid item xs={1} style={{margin:10}}>
                            <TemplateTextField type="text" id="normal-field" readOnly 
                            label="ID" value={this.state.selected.id}/>
                        </Grid>
                      )}
                          <Grid item xs={8} style={{margin:10}}>
                          <TemplateCheckbox type="checkbox" id="normal-field"
                                  onChange={this.activeChange} label="Active" checked={this.state.selected.active}/>
                          </Grid>
                        <Grid item xs={5} style={{margin:10}}>
                            <TemplateTextField type="text" id="normal-field" onChange={this.nameChange}
                            label="Name" value={this.state.selected.name}/>
                        </Grid>
                        <Grid item xs="5" style={{zIndex:9995}} style={{margin:10}}>
                          {(this.props.plansList && this.props.plansList.data && 
                            this.props.plansList.data) && (
                              <TemplateSelect
                                  label='Plan'
                                  onChange={this.planChange}
                                  value={{
                                    label:
                                        this.props.plansList.data.filter((e) => this.state.selected.pricing_data_id === e.id).length > 0 ? 
                                            this.labelSelect(this.props.plansList.data.filter((e) => this.state.selected.pricing_data_id === e.id)[0]) 
                                            : ''
                                    }}
                                  options={this.props.plansList.data.map((e) => { 
                                    return (
                                        { 
                                        label: this.labelSelect(e),
                                        value: this.labelSelect(e)
                                        }
                                    )
                                  })}
                                />
                            )}
                        </Grid>                
                        <Grid item xs={5} style={{margin:10}}>
                            <TemplateTextField
                              label='Total ($)'
                              disabled={this.state.selected.reduction !== null || this.state.selected.perc !== null}
                              onChange={this.totalChange} value={this.state.selected.total ? "" + this.state.selected.total : ""}
                              size="10"
                            />
                        </Grid>
                        <Grid item xs={5} style={{margin:10}}>
                            <TemplateTextField
                              disabled={this.state.selected.total !== null || this.state.selected.reduction !== null}
                              label='Percentage (/100)'
                              onChange={this.percChange} value={
                                this.state.selected.perc ? "" + this.state.selected.perc : ""}
                              size="10"
                            />
                        </Grid>
                        <Grid item xs={5} style={{margin:10}}>
                            <TemplateTextField
                              label='Reduction (-$)'
                              disabled={this.state.selected.perc !== null || this.state.selected.total !== null}
                              onChange={this.reductionChange} value={
                                this.state.selected.reduction ? "" + this.state.selected.reduction : "" 
                                }
                              size="10"
                            />
                        </Grid>
                        <Grid item xs={5} style={{margin:10}}>
                            <Datetime inputProps = {{placeholder:'Start Date'}} timeFormat={false} 
                                onChange={this.startChange} value={this.state.selected.start_date} />
                        </Grid>
                        <Grid item xs={5} style={{margin:10}}>
                            <Datetime inputProps = {{placeholder:'End Date'}} timeFormat={false} 
                                onChange={this.endChange} value={this.state.selected.end_date} />
                        </Grid>
                </Grid>
                <hr/>
                <Grid container xs="12">
                    <Grid item xs="12">
                        <Grid item xs="6">
                            <TemplateButton onClick={this.save} label='Save'/>
                            <TemplateButton outline style={{marginLeft:10}} onClick={this.cancel} 
                                label='Close'/>
                        </Grid>
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
        coupons: store.coupons,
        plansList: store.plansList
    }
}

export default connect(mapStateToProps)(CouponAdminList);
