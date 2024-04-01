import React, { Component } from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';
import MaskedInput from 'react-maskedinput';
import moment from 'moment';
import { Badge } from 'reactstrap';
import { Button } from 'reactstrap'; 
import cellEditFactory from 'react-bootstrap-table2-editor';
import EditIcon from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import salesforceURL from '../../salesforceConfig';

import { Type } from 'react-bootstrap-table2-editor';
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
import { registrationAdminUpdate } from '../../actions/registrationAdminUpdate';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import formatPhoneNumber from '../utils/formatPhone';

class Registrations extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            activeTab: "registrations",
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
        this.renderTotalLabel = this.renderTotalLabel.bind(this);
        this.addAddress = this.addAddress.bind(this);
        this.save = this.save.bind(this);
        this.reload = this.reload.bind(this);
        this.edit = this.edit.bind(this);
        this.add = this.add.bind(this);
        this.addInvoiceRow = this.addInvoiceRow.bind(this);
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
        if (p.registrationsAdminList.data && p.registrationsAdminList.data.config && 
            p.registrationsAdminList.data.config.status && this.state.statusSelected === null) { 
            var c = 0;
            var t = [];
            for (c = 0; c < p.registrationsAdminList.data.config.status.length; c++) { 
                if (p.registrationsAdminList.data.config.status[c].name === 'INVITED') { continue; }
                t.push(p.registrationsAdminList.data.config.status[c].id); 
            } 
            this.state.statusSelected = t;
            this.state.filter = t;
            this.setState(this.state);
            this.props.dispatch(getRegistrations(
                {limit:this.state.pageSize,offset:this.state.page,status:t}
            ));
        } 
    }
    pageChange(e,t) { 
        if (e === '>') { 
            this.state.page = this.state.page + 1;
        } else { 
            this.state.page = e - 1;
        }
        this.props.dispatch(getRegistrations(
            {search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
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
        this.props.dispatch(getRegistrations(
            {search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
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
        this.props.dispatch(getRegistrations(
            {search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state)
    } 
    addAddress() { 
        this.state.selected.addr.push({
            id:0,
            name:'',
            addr1:'',
            city:'',
            state:'',
            zipcode:'',
            phone:''
        })
        this.setState(this.state);
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
        this.props.dispatch(getRegistrations({
            limit:this.state.pageSize,
            offset:this.state.page
        }));
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
        this.props.dispatch(getRegistrations(
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
            tosend.invoice_id = this.state.selected.invoice.id,
            tosend.invoice_items = this.state.selected.invoice.items
        }
        if (this.state.selected.card) { 
            tosend.card = this.state.selected.card
        }
        this.props.dispatch(registrationAdminUpdate(tosend,function(err,args) { 
            args.props.dispatch(getRegistrations(
                {search:args.state.search,limit:args.state.pageSize,offset:args.state.page,status:args.state.filter},function(err,args) { 
              toast.success('Successfully saved registration.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
              args.close()
            },args))
        },this));
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
          totalSize: (this.props.registrationsAdminList && 
                      this.props.registrationsAdminList.data &&
                      this.props.registrationsAdminList.data.total) ? this.props.registrationsAdminList.data.total : 10,
          hideSizePerPage:true,
          //onPageChange:(page,sizePerPage) => this.pageChange(page,sizePerPage)
        };
        var fields = [
            {name:'Email',value:'email'},
            {name:'First',value:'first_name'},
            {name:'Last',value:'last_name'},
            {name:'Phone',value:'phone'},
            {name:'Status',value:'status'},
            {name:'GoogleID',value:'places_id'},
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
                text:'Phone',
                formatter: (cellContent,row) => (
                    <div>
                       {formatPhoneNumber(row.phone)} 
                    </div>
                )
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
                editable:true,
                text:'Description'
            },
            {
                dataField:'quantity',
                align:'center',
                editable:false,
                width:50,
                text:'quantity'
            },
            {
                dataField:'price',
                text:'Price',
                editable:false,
                align:'right',
                formatter: (cellContent,row) => (
                    <div>
                        ${row.price.toFixed ?  row.price.toFixed(2) : row.price}
                    </div>
                )
            }
            
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
                dataField:'first_name',
                sort:true,
                text:'Name',
                formatter:(cellContent,row) => (
                    <div>
                        {row.first_name + ' ' + row.last_name}
                    </div>
                )
            },
            {
                dataField:'office_type',
                sort:true,
                text:'Type'
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
                dataField:'sf_id',
                sort:true,
                text:'Links',
                formatter:(cellContent,row) => (
                    <div>
                    {row.sf_id !== null && (
                        <a target="_blank" href={salesforceURL() + 'lightning/r/Lead/' + row.sf_id + '/view'}>
                            <img height={50} width={100}src='/salesforce.jpg'/>
                        </a>
                    )}
                    </div>
                )
            },
            /*{
                dataField:'verified',
                sort:true,
                text:'Verified',
                formatter: (cellContent,row) => (
                    <div>
                        {(row.verified === 1) && (<Badge color="primary">Verified</Badge>)}
                        {(row.verified === 0) && (<Badge color="danger">Not Verified</Badge>)}
                    </div>
                )
            },*/
            {
                dataField:'lead_strength',
                sort:true,
                text:'Strength',
                formatter:(cellContent,row) => (
                    <div>
                        {(row.lead_strength === 'Preferred Provider') && (<Badge color="primary">Preferred Provider</Badge>)}
                        {(row.lead_strength === 'In-Network Provider') && (<Badge color="secondary">In-Network Provider</Badge>)}
                        {(row.lead_strength === 'Potential Provider') && (<Badge color="danger">Potential Provider</Badge>)}
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
                        {(row.status === 'INVITED') && (<Badge color="primary">INVITED</Badge>)}
                        {(row.status === 'APPROVED') && (<Badge color="primary">APPROVED</Badge>)}
                        {(row.status === 'QUEUED') && (<Badge color="secondary">QUEUED</Badge>)}
                        {(row.status === 'WAITING') && (<Badge color="danger">WAITING</Badge>)}
                        {(row.status === 'DENIED') && (<Badge color="danger">DENIED</Badge>)}
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
            {
                dataField:'actions',
                sort:true,
                text:'Actions',
                formatter:(cellContent,row) => (
                    <>
                    <div>
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35}} color="primary"><EditIcon/></Button>
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
            {(this.props.registrationAdminUpdate && this.props.registrationAdminUpdate.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.registrationsAdminList && this.props.registrationsAdminList.isReceiving) && (
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
                            <>
                            <div style={{zIndex:512}}>
                                <Row md="12">
                                    <Col md="1"> 
                                        <Button onClick={this.add} 
                                            color="primary">Add</Button>
                                    </Col>
                                    <Col md="5" style={{zIndex:9995}}>
                                      {(this.props.registrationsAdminList && this.props.registrationsAdminList.data && 
                                        this.props.registrationsAdminList.data.config &&
                                        this.props.registrationsAdminList.data.config.status && this.state.statusSelected !== null) && (
                                          <Select
                                              closeMenuOnSelect={true}
                                              isSearchable={false}
                                              isMulti
                                              onChange={this.onStatusFilter}
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
                                    </Col>                
                                    <Col md={3}>
                                        <Input type="text" id="normal-field" onChange={this.search}
                                        placeholder="Search" value={this.state.search}/>
                                    </Col>
                                    <Col md={3}>
                                        <div class='pull-right'>
                                            <Button onClick={() => this.reload()} style={{marginRight:5,height:35}} outline 
                                                color="primary"><AutorenewIcon/></Button>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <Row md="12" style={{marginTop:10}}>
                                <Col md="12">
                                    <>
                                    {(this.props.registrationsAdminList && this.props.registrationsAdminList.data && 
                                      this.props.registrationsAdminList.data.registrations && 
                                      this.props.registrationsAdminList.data.registrations.length > 0)&& ( 
                                    <BootstrapTable 
                                        keyField='id' data={this.props.registrationsAdminList.data.registrations} 
                                        pagination={paginationFactory(options)}
                                        columns={regheads}>
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
                            </>
                            )}
                            {(this.state.selected !== null) && (
                            <Row md="12" style={{marginTop:10}}>
                                <Col md="12">
                                    <Row md="12">
                                        <Col md="12" style={{zIndex:9999}}>
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
                                              Practice
                                            </Label>
                                            <Col md={5}>
                                                <Input type="text" id="normal-field" onChange={this.updateName}
                                                placeholder="Name" value={this.state.selected.name}/>
                                            </Col>
                                          </FormGroup>
                                          <FormGroup row>
                                            <Label for="normal-field" md={1} className="text-md-right">
                                              Email
                                            </Label>
                                            <Col md={5}>
                                                <Input type="text" id="normal-field" onChange={this.updateEmail}
                                                placeholder="Email" value={this.state.selected.email}/>
                                            </Col>
                                          </FormGroup>
                                          <FormGroup row>
                                            <Label for="normal-field" md={1} className="text-md-right">
                                              First
                                            </Label>
                                            <Col md={5}>
                                                <Input type="text" id="normal-field" onChange={this.updateFirst}
                                                placeholder="First" value={this.state.selected.first_name}/>
                                            </Col>
                                          </FormGroup>
                                          <FormGroup row>
                                            <Label for="normal-field" md={1} className="text-md-right">
                                              Last
                                            </Label>
                                            <Col md={5}>
                                                <Input type="text" id="normal-field" onChange={this.updateLast}
                                                placeholder="Last" value={this.state.selected.last_name}/>
                                            </Col>
                                          </FormGroup>
                                          <FormGroup row>
                                            <Label for="normal-field" md={1} className="text-md-right">
                                              Phone
                                            </Label>
                                            <Col md={5}>
                                                <MaskedInput
                                                  className="form-control" id="mask-phone" mask="(111) 111-1111"
                                                  onChange={this.updatePhone} value={this.state.selected.phone}
                                                  size="10"
                                                />
                                            </Col>
                                          </FormGroup>
                                          {/*<FormGroup row>
                                            <Label for="normal-field" md={1} className="text-md-right">
                                              Initial Payment
                                            </Label>
                                            <Col md={5}>
                                                <Input type="text" id="normal-field" onChange={this.updateInitial}
                                                placeholder='$' value={this.state.selected.initial_payment}/>
                                            </Col>
                                          </FormGroup>*/}
                                          <FormGroup row>
                                            <Label for="normal-field" md={1} className="text-md-right">
                                              Places ID
                                            </Label>
                                            <Col md={5}>
                                                <Input type="text" id="normal-field" readOnly
                                                value={this.state.selected.places_id}/>
                                            </Col>
                                          </FormGroup>
                                          <FormGroup row>
                                            <Label for="normal-field" md={1} className="text-md-right">
                                              Status
                                            </Label>
                                            <Col md={5}>
                                              {(this.props.registrationsAdminList && this.props.registrationsAdminList.data &&
                                                this.props.registrationsAdminList.data.config && 
                                                this.props.registrationsAdminList.data.config.status) && (
                                              <Select
                                                  closeMenuOnSelect={true}
                                                  isSearchable={false}
                                                  onChange={this.onStatusChange}
                                                  value={{
                                                    label:
                                                        this.props.registrationsAdminList.data.config.status.filter((g) => 
                                                            this.state.selected.provider_queue_status_id == g.id
                                                    )[0].name
                                                  }}
                                                  options={this.props.registrationsAdminList.data.config.status.map((g) => { 
                                                    return (
                                                        { 
                                                        label: g.name,
                                                        value: g.id
                                                        }
                                                    )
                                                  })}
                                                />
                                                )}
                                            </Col>
                                          </FormGroup>
                                          <FormGroup row>
                                            <Label for="normal-field" md={1} className="text-md-right">
                                              Strength
                                            </Label>
                                            <Col md={5}>
                                              <Select
                                                  closeMenuOnSelect={true}
                                                  isSearchable={false}
                                                  onChange={this.onLeadStrengthChange}
                                                  value={{
                                                    label:
                                                        (this.state.selected.lead_strength_id) ?  this.props.registrationsAdminList.data.config.strength.filter((g) => 
                                                            this.state.selected.lead_strength_id == g.id
                                                    )[0].name : ''
                                                  }}
                                                  options={this.props.registrationsAdminList.data.config.strength.map((g) => { 
                                                    return (
                                                        { 
                                                        label: g.name,
                                                        value: g.id
                                                        }
                                                    )
                                                  })}
                                                />
                                            </Col>
                                          </FormGroup>
                                        </Col>
                                    </Row>
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
                                                    <Row md="12" style={{marginBottom:20}}>
                                                        <Col md="5">
                                                          <Select
                                                              closeMenuOnSelect={true}
                                                              isSearchable={false}
                                                              onChange={this.onPlansChange}
                                                              value={{
                                                                label:
                                                                    this.props.plansList.data.filter((g) => 
                                                                        this.state.selected.pricing_id === g.id).length > 0 ?
                                                                        this.props.plansList.data.filter((g) => 
                                                                            this.state.selected.pricing_id === g.id)[0].description : ''
                                                              }}
                                                              options={
                                                                    this.props.plansList.data.map((g) => {
                                                                        return ({label:g.description,value:g.id})
                                                                    })
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>
                                                    {(this.state.selected.plans && this.state.selected.plans.items) && (
                                                    <>
                                                    <BootstrapTable 
                                                        keyField='id' data={this.state.selected.plans.items} 
                                                        cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true })}
                                                        columns={planheads}>
                                                    </BootstrapTable>
                                                    </>
                                                    )}
                                                </TabPane>
                                                <TabPane tabId="offices">
                                                    <Button style={{marginBottom:10}} onClick={this.addAddress} 
                                                        color="primary">Add</Button>
                                                    {(this.state.selected.addr && this.state.selected.addr) && (
                                                    <>
                                                    <BootstrapTable 
                                                        cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true })}
                                                        keyField='id' data={this.state.selected.addr} 
                                                        columns={offheads}>
                                                    </BootstrapTable>
                                                    </>
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
        registrationAdminUpdate: store.registrationAdminUpdate,
        plansList: store.plansList
    }
}

export default connect(mapStateToProps)(Registrations);
