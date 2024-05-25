import React, { Component } from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AddBoxIcon from '@mui/icons-material/AddBox';
import MaskedInput from 'react-maskedinput';
import { connect } from 'react-redux';
import { getPlansList } from '../../actions/plansList';
import { Col, Row } from 'reactstrap';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { FormGroup, Label, Input } from 'reactstrap';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import moment from 'moment';
import Select from 'react-select';
import { push } from 'connected-react-router';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { searchRegister } from '../../actions/searchRegister';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Button } from 'reactstrap'; 
import { Badge } from 'reactstrap';
import { Search } from 'react-bootstrap-table2-toolkit';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getCouponAdmin } from '../../actions/coupons';
import { couponSave } from '../../actions/couponSave';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import cellEditFactory from 'react-bootstrap-table2-editor';
import EditIcon from '@mui/icons-material/Edit';
import PhysicianCard from '../search/PhysicianCard';
import AliceCarousel from 'react-alice-carousel';
import { searchCheckRes } from '../../actions/searchCheckRes';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PainTable from '../utils/PainTable';

const { SearchBar } = Search;
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
        this.pageChange = this.pageChange.bind(this);
        this.planChange = this.planChange.bind(this);
        this.reductionChange = this.reductionChange.bind(this);
        this.totalChange = this.totalChange.bind(this);
        this.activeChange = this.activeChange.bind(this);
        this.startChange = this.startChange.bind(this);
        this.endChange = this.endChange.bind(this);
        this.nameChange = this.nameChange.bind(this);
        this.percChange = this.percChange.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.pageRowsChange = this.pageRowsChange.bind(this);
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
        this.props.dispatch(getRegistrations(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
        ));
        this.setState(this.state)
    } 

    pageRowsChange(t) { 
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
        this.state.selected.end_date = e.target.value;
        this.setState(this.state);
    }
    startChange(e) {
        this.state.selected.start_date = e.target.value;
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
    planChange(e) { 
        this.state.selected.pricing_data_id = e.value;
        this.setState(this.state);
    } 
    pageChange(e,t) { 
        if (e === '>') { 
            this.state.page = this.state.page + 1;
        } else { 
            this.state.page = e - 1;
        }
        this.props.dispatch(getCouponAdmin(
            {limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
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
            tosend.total = parseFloat(tosend.total.replace("$",""));
        }
        if (tosend.perc) { 
            tosend.perc = parseFloat(tosend.perc.replace("%",""));
            if (tosend.perc > 0) { tosend.perc = tosend.perc / 100 }
        }
        if (tosend.reduction) { 
            tosend.reduction = parseFloat(tosend.reduction.replace("$",""));
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
                dataField:'active',
                align:'center',
                text:'Active',
                formatter: (cellContent,row) => (
                    <div>
                        {(row.active === 1) && (<Badge color="primary">Active</Badge>)}
                        {(row.active === 0) && (<Badge color="danger">Inactive</Badge>)}
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
                        {row.total ? row.total.toFixed ? '$' + row.total.toFixed(2) : "$" + row.total : 'N/A'}
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
                        {row.perc ? row.perc * 100 + "%": "N/A"}
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
                        {row.reduction ? row.reduction.toFixed ? "$" + row.reduction.toFixed(2) : row.reduction : "N/A"}
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
                         moment(row['end_date']).format('LLL') : moment(row['end_date']).format('LLL')}
                    </div>
                )
            },
            {
                dataField:'id',
                text:'Actions',
                editable: false,
                formatter:(cellContent,row) => ( 
                    <div>
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35}} color="primary"><EditIcon/></Button>
                    </div>
                )
            }
        ];
        return (
        <>
            {(this.props.coupons && this.props.coupons.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.coupons && this.props.coupons.data && 
              this.props.coupons.data.coupons && this.state.selected === null) && ( 
            <>
            <Row md="12">
                <Col md="2" style={{marginBottom:10}}>
                    <Col md="1">
                        <Button onClick={() => this.edit({id:"new"})} style={{width:50}}
                            color="primary"><AddBoxIcon/></Button>
                    </Col>
                </Col>
            </Row>
            <Row md="12">
                <Col md="12">
                    <PainTable
                        keyField='id' 
                        data={this.props.coupons.data.coupons} 
                        total={this.props.coupons.data.total}
                        page={this.state.page}
                        pageSize={this.state.pageSize}
                        onPageChange={this.pageChange}
                        onSort={this.sortChange}
                        onPageRowsPerPageChange={this.pageRowsChange}
                        columns={heads}>
                    </PainTable> 
                </Col>                
            </Row>
            </>
            )}
            {(this.props && this.props.coupons && this.props.coupons.data && 
              this.props.coupons.data.coupons && this.state.selected !== null) && ( 
              <>
                <Row md="12" style={{marginTop:10}}>
                    <Col md="12">
                          {this.state.selected.id && (<FormGroup row>
                            <Label for="normal-field" md={1} className="text-md-right">
                              ID 
                            </Label>
                            <Col md={5}>
                                <Input type="text" id="normal-field" readOnly 
                                placeholder="ID" value={this.state.selected.id}/>
                            </Col>
                          </FormGroup>
                          )}
                          <FormGroup row>
                              <Label for="normal-field" md={1} className="text-md-right">
                                Active
                              </Label>
                              <Col md={8}>
                              <Input type="checkbox" id="normal-field"
                                      onChange={this.activeChange} placeholder="Email" checked={this.state.selected.active}/>
                              </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label for="normal-field" md={1} className="text-md-right">
                              Name 
                            </Label>
                            <Col md={5}>
                                <Input type="text" id="normal-field" onChange={this.nameChange}
                                placeholder="Name" value={this.state.selected.name}/>
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label for="normal-field" md={1} className="text-md-right">
                                Plan
                            </Label>
                            <Col md="5" style={{zIndex:9995}}>
                              {(this.props.plansList && this.props.plansList.data && 
                                this.props.plansList.data) && (
                                  <Select
                                      closeMenuOnSelect={true}
                                      isSearchable={false}
                                      onChange={this.planChange}
                                      value={{
                                        label:
                                            this.props.plansList.data.filter((e) => this.state.selected.pricing_data_id === e.id).length > 0 ? 
                                                this.props.plansList.data.filter((e) => this.state.selected.pricing_data_id === e.id)[0].description + 
                                                " ($" + this.props.plansList.data.filter((e) => this.state.selected.pricing_data_id === e.id)[0].upfront_cost + ")"
                                                : ''
                                        }}
                                      options={this.props.plansList.data.map((e) => { 
                                        return (
                                            { 
                                            label: e.description + " ($" + e.upfront_cost + ")",
                                            value: e.id
                                            }
                                        )
                                      })}
                                    />
                                )}
                            </Col>                
                          </FormGroup>
                          <FormGroup row>
                            <Label for="normal-field" md={1} className="text-md-right">
                              Total
                            </Label>
                            <Col md={5}>
                                <MaskedInput
                                  className="form-control" id="mask-phone" mask="$1111"
                                  disabled={this.state.selected.perc !== null || this.state.selected.reduction !== null}
                                  placeholderChar=' '
                                  onChange={this.totalChange} value={this.state.selected.total ? "" + this.state.selected.total : ""}
                                  size="10"
                                />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label for="normal-field" md={1} className="text-md-right">
                              Percentage
                            </Label>
                            <Col md={5}>
                                <MaskedInput
                                  className="form-control" id="mask-perc" mask="11%"
                                  disabled={this.state.selected.total !== null || this.state.selected.reduction !== null}
                                  placeholderChar=' '
                                  onChange={this.percChange} value={
                                    this.state.selected.perc ? "" + this.state.selected.perc * 100 : ""}
                                  size="10"
                                />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label for="normal-field" md={1} className="text-md-right">
                              Reduction
                            </Label>
                            <Col md={5}>
                                <MaskedInput
                                  className="form-control" id="mask-reduction" mask="$1111"
                                  disabled={this.state.selected.perc !== null || this.state.selected.total !== null}
                                  placeholderChar=' '
                                  onChange={this.reductionChange} value={
                                    this.state.selected.reduction ? "" + this.state.selected.reduction : "" 
                                    }
                                  size="10"
                                />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label for="normal-field" md={1} className="text-md-right">
                              Start Date
                            </Label>
                            <Col md={5}>
                                <MaskedInput
                                  className="form-control" id="mask-phone" mask="1111-11-11"
                                  placeholderChar=' '
                                  onChange={this.startChange} value={this.state.selected.start_date}
                                  size="10"
                                />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label for="normal-field" md={1} className="text-md-right">
                              End Date
                            </Label>
                            <Col md={5}>
                                <MaskedInput
                                  placeholderChar=' '
                                  className="form-control" id="mask-phone" mask="1111-11-11"
                                  onChange={this.endChange} value={this.state.selected.end_date}
                                  size="10"
                                />
                            </Col>
                          </FormGroup>
                    </Col>
                </Row>
                <hr/>
                <Row md="12">
                    <Col md="12">
                        <Col md="6">
                            <Button onClick={this.save} color="primary">Save</Button>
                            <Button outline style={{marginLeft:10}} onClick={this.cancel} 
                                color="secondary">Close</Button>
                        </Col>
                    </Col>
                </Row>
                </>
            )}
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
