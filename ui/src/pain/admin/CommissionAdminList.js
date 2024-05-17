import React, { Component } from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { connect } from 'react-redux';
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
import s from '../office/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getCommissionAdmin } from '../../actions/commissions';
import { getCommissionUserAdmin } from '../../actions/commissionsUser';
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
        this.renderTotalLabel = this.renderTotalLabel.bind(this);
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
        this.pageRowsChange = this.pageRowsChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
        if (p.commissionsUser.data && p.commissionsUser.data.config && 
            p.commissionsUser.data.config.period && this.state.periodSelected === null) { 
            var c = 0;
            var t = [];
            this.state.periodSelected = []
            this.state.periodSelected.push({
                label:p.commissionsUser.data.config.period[0].label,
                value:p.commissionsUser.data.config.period[0].value
            })
            this.state.filter = [p.commissionsUser.data.config.period[0].value]
            this.setState(this.state);
            this.props.dispatch(getCommissionUserAdmin(
                {period:this.state.filter,limit:this.state.pageSize,offset:this.state.page}
            ));
        }
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
        if (this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes('BusinessDevelopmentRepresentative')) { 
            this.props.dispatch(getCommissionUserAdmin({page:this.state.page,limit:this.state.pageSize}))
        } else if (this.props.currentUser.entitlements && 
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
        if (e.length <2 ) { return; }
        var c = 0;
        var t = [];
        for (c = 0; c < e.length; c++) { 
            t.push(e[c].value); 
        } 
        this.state.statusSelected = t;
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

    pageRowsChange(t) { 
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

    renderTotalLabel(f,t,s) { 
        var numpage = s/t;
        return "Showing page " + (this.state.page+1) + " of " + numpage.toFixed(0);
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
        const pageButtonRenderer = ({
          page,
          currentPage,
          disabled,
          title,
          onPageChange
        }) => {
          const handleClick = (e) => {
             e.preventDefault();
             this.pageChange(page, currentPage);// api call 
           };    
          return (
            <div>
              {
               <li className="page-item">
                 <a href="#"  onClick={ handleClick } className="page-link">{ page }</a>
               </li>
              }
            </div>
          );
        };
        const options = {
          pageButtonRenderer,
          showTotal:true,
          withFirstAndLast: false,
          alwaysShowAllBtns: false,
          nextPageText:'>',
          sizePerPage:10,
          paginationTotalRenderer: (f,t,z) => this.renderTotalLabel(f,t,z),
          totalSize: (this.props.commissions && 
                      this.props.commissions.data &&
                      this.props.commissions.data.total) ? this.props.commissions.data.total : 10,
          hideSizePerPage:true,
          //onPageChange:(page,sizePerPage) => this.pageChange(page,sizePerPage)
        };
        const responsive = {
            0: { 
                items: 1
            },
            568: { 
                items: 1
            },
            1024: {
                items: 1, 
                itemsFit: 'contain'
            },
        };
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
                        <a style={{color:'black'}} href={'/#/app/main/admin/office/' + row.office_id} target='_blank'>{row.office_id}</a>
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
                dataField:'updated',
                sort:true,
                editable: false,
                align:'center',
                text:'Updated',
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row['updated']).isValid() ?  
                         moment(row['updated']).format('LLL') : moment(row['updated2']).format('LLL')}
                    </div>
                )
            },
        ];
        return (
        <>
            {(this.props.commissions && this.props.commissions.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.commissionsUser && this.props.commissionsUser.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.commissionsUser && this.props.commissionsUser.data && 
              this.props.commissionsUser.data.commissions && this.state.selected === null) && ( 
            <>
            <Row md="12">
                <Col md="2" style={{marginBottom:10}}>
                    {/*<Button onClick={() => this.edit({id:"new"})} 
                        style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                    */}
                </Col>
            </Row>
            <Row md="12">
                <Col md="5" style={{marginBottom:10}}>
                  {(this.props.commissionsUser && this.props.commissionsUser.data && 
                    this.props.commissionsUser.data.config &&
                    this.props.commissionsUser.data.config.period && this.state.periodSelected !== null) && (
                      <Select
                          closeMenuOnSelect={true}
                          isSearchable={false}
                          isMulti
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
                </Col>
                <Col md="7">
                    <div class="pull-right">
                        <div style={{justifyContent:'spread-evenly'}}>
                            <Button onClick={this.commissionReport} outline color="primary"><AssessmentIcon/></Button>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row md="12">
                <Col md="12">
                    <PainTable
                        keyField='id' 
                        data={this.props.commissionsUser.data.commissions} 
                        total={this.props.commissionsUser.data.total}
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
            {(this.props && this.props.commissions && this.props.commissions.data && 
              this.props.commissions.data.commissions && this.state.selected === null) && ( 
            <>
            <Row md="12">
                <Col md="2" style={{marginBottom:10}}>
                    {/*<Button onClick={() => this.edit({id:"new"})} 
                        style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                    */}
                </Col>
            </Row>
            <Row md="12">
                <Col md="5" style={{marginBottom:10}}>
                  {(this.props.commissions && this.props.commissions.data && 
                    this.props.commissions.data.config &&
                    this.props.commissions.data.config.period && this.state.periodSelected !== null) && (
                      <Select
                          closeMenuOnSelect={true}
                          isSearchable={false}
                          isMulti
                          onChange={this.onPeriodFilter}
                          value={this.state.periodSelected.map((g) => { 
                            return (
                                {
                                label:this.props.commissions.data.config.period.filter((f) => f.billing_period === g.billing_period)[0].label,
                                value:this.props.commissions.data.config.period.filter((f) => f.billing_period === g.billing_period)[0].value
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
                </Col>
                <Col md="7">
                    <div class="pull-right">
                        <div style={{justifyContent:'spread-evenly'}}>
                            <Button onClick={this.commissionReport} outline color="primary"><AssessmentIcon/></Button>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row md="12">
                <Col md="12">
                    <PainTable
                        keyField='id' 
                        data={this.props.commissions.data.commissions} 
                        total={this.props.commissions.data.total}
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
