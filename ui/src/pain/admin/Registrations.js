import React, { Component } from 'react';
import moment from 'moment';
import { Badge } from 'reactstrap';
import { Button } from 'reactstrap'; 
import cellEditFactory from 'react-bootstrap-table2-editor';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { FormGroup, Label, InputGroup, Input } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getRegistrations } from '../../actions/registrationsAdminList';
import { getPlansList } from '../../actions/plansList';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';

class Registrations extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            activeTab: "registrations",
            subTab: "plans",
        }
        this.close = this.close.bind(this);
        this.save = this.save.bind(this);
        this.edit = this.edit.bind(this);
        this.addInvoiceRow = this.addInvoiceRow.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
        this.toggleSubTab = this.toggleSubTab.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getRegistrations({}));
        this.props.dispatch(getPlansList({}));
    }
    addInvoiceRow() { 
        this.state.selected.invoice.items.push({
            price:0,
            quantity:1,
            description:''
        })
        this.setState(this.state);
    } 
    save() { 
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
        console.log("p",this.props)
        console.log("s",this.state)
        var fields = [
            {name:'Email',value:'email'},
            {name:'First',value:'first_name'},
            {name:'Last',value:'last_name'},
            {name:'Phone',value:'phone'},
            {name:'Status',value:'status'},
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
                dataField:'Phone',
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
                text:'Description'
            },
            {
                dataField:'price',
                text:'Price',
                align:'right',
                formatter: (cellContent,row) => (
                    <div>
                        ${row.price.toFixed(2)}
                    </div>
                )
            },
            {
                dataField:'quantity',
                align:'center',
                width:50,
                text:'quantity'
            },
            {
                dataField:'total',
                align:'right',
                text:'Total',
                editable:false,
                formatter: (cellContent,row) => (
                    <div>
                        ${(row.price*row.quantity).toFixed(2)}
                    </div>
                )
            },
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
                dataField:'email',
                sort:true,
                text:'Email'
            },
            {
                dataField:'first_name',
                sort:true,
                text:'First'
            },
            {
                dataField:'last_name',
                sort:true,
                text:'Last'
            },
            {
                dataField:'phone',
                sort:true,
                text:'Phone'
            },
            {
                dataField:'reg_type',
                sort:true,
                text:'Type'
            },
            {
                dataField:'verified',
                sort:true,
                text:'Verified',
                formatter: (cellContent,row) => (
                    <div>
                        {(row.verified === 1) && (<Badge color="primary">Verified</Badge>)}
                        {(row.verified === 0) && (<Badge color="danger">Not Verified</Badge>)}
                    </div>
                )
            },
            {
                dataField:'created',
                sort:true,
                text:'Created',
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row['updated']).format('LLL')} 
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
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35,width:90}} color="primary">Edit</Button>
                    </div>
                    </>
                )
            },
        ]
        return (
        <>
            {(this.props.plansList && this.props.plansList.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.registrationAdminList && this.props.registrationAdminList.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'registrations' })}
                                onClick={() => { this.toggleTab('registrations') }}>
                                <span>{translate('Registrations')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                        <TabPane tabId="registrations">
                            {(this.state.selected === null) && (
                            <Row md="12" style={{marginTop:10}}>
                                <Col md="12">
                                    <>
                                    {(this.props.registrationsAdminList && this.props.registrationsAdminList.data && 
                                      this.props.registrationsAdminList.data.registrations && 
                                      this.props.registrationsAdminList.data.registrations.length > 0)&& ( 
                                    <BootstrapTable 
                                        keyField='id' data={this.props.registrationsAdminList.data.registrations} 
                                        columns={regheads} pagination={ paginationFactory()}>
                                    </BootstrapTable>
                                    )}
                                    {(this.props.registrationsAdminList && this.props.registrationsAdminList.data && 
                                      this.props.registrationsAdminList.data.registrations && 
                                      this.props.registrationsAdminList.data.registrations.length < 1)&& ( 
                                      <h3>No registrations yet!</h3>
                                    )}
                                    </>
                                </Col>
                            </Row>
                            )}
                            {(this.state.selected !== null) && (
                            <Row md="12" style={{marginTop:10}}>
                                <Col md="12">
                                    {fields.map((e) => { 
                                        return (
                                            <Row md="12">
                                                <Col md="12">
                                                  <FormGroup row>
                                                    <Label for="normal-field" md={1} className="text-md-right">
                                                      {e.name}:
                                                    </Label>
                                                    <Col md={5}>
                                                      {(e.name !== 'Comments') && (
                                                        <Input type="text" id="normal-field" 
                                                        placeholder={e.name} value={this.state.selected[e.value]}/>
                                                      )} 
                                                      {(e.name === 'Comments') && (
                                                        <Input type="textarea" rows={3} id="normal-field" 
                                                        placeholder={e.name} value={this.state.selected[e.value]}/>
                                                      )} 
                                                    </Col>
                                                  </FormGroup>
                                                </Col>
                                            </Row>
                                        )
                                    })}
                                    <Row md="12">
                                        <Col md="12">
                                            <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                                                <NavItem>
                                                    <NavLink className={classnames({ active: this.state.subTab === 'plans' })}
                                                        onClick={() => { this.toggleSubTab('plans') }}>
                                                        <span>{translate('Plans')}</span>
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink className={classnames({ active: this.state.subTab === 'offices' })}
                                                        onClick={() => { this.toggleSubTab('offices') }}>
                                                        <span>{translate('Offices')}</span>
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink className={classnames({ active: this.state.subTab === 'invoices' })}
                                                        onClick={() => { this.toggleSubTab('invoices') }}>
                                                        <span>{translate('Invoice')}</span>
                                                    </NavLink>
                                                </NavItem>
                                            </Nav>
                                            <TabContent className='mb-lg' activeTab={this.state.subTab}>
                                                <TabPane tabId="plans">
                                                    {(this.state.selected.plans && this.state.selected.plans.items) && (
                                                    <BootstrapTable 
                                                        keyField='id' data={this.state.selected.plans.items} 
                                                        columns={planheads}>
                                                    </BootstrapTable>
                                                    )}
                                                </TabPane>
                                                <TabPane tabId="offices">
                                                    {(this.state.selected.addr && this.state.selected.addr) && (
                                                    <BootstrapTable 
                                                        keyField='id' data={this.state.selected.addr} 
                                                        columns={offheads}>
                                                    </BootstrapTable>
                                                    )}
                                                </TabPane>
                                                <TabPane tabId="invoices">
                                                    <Button onClick={() => this.addInvoiceRow({id:"new"})} 
                                                        style={{marginRight:5,marginBottom:10,height:35,width:90}} color="primary">Add</Button>
                                                    {(this.state.selected.invoice && this.state.selected.invoice.items) && (
                                                        <BootstrapTable 
                                                            keyField='id' data={this.state.selected.invoice.items} 
                                                            cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true })}
                                                            columns={invheads}>
                                                        </BootstrapTable>
                                                    )}
                                                </TabPane>
                                            </TabContent>
                                        </Col>
                                    </Row>
                                    <Row md="12">
                                        <Col md="12">
                                            <Col md="6">
                                                <Button onClick={this.save} color="primary">Save</Button>
                                                <Button outline style={{marginLeft:10}} onClick={this.close} 
                                                    color="secondary">Close</Button>
                                            </Col>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            )}
                        </TabPane>
                    </TabContent>
                </Col>                
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        registrationsAdminList: store.registrationsAdminList,
        plansList: store.plansList
    }
}

export default connect(mapStateToProps)(Registrations);
