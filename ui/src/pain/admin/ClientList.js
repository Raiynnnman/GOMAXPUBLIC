import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { FormGroup, Label, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { Button } from 'reactstrap'; 
import { Badge } from 'reactstrap';
import moment from 'moment';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import PainTable from '../utils/PainTable';
import { getCustomers } from '../../actions/customers';
import { customersSave } from '../../actions/customersSave';

class ClientList extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            page: 0,
            selected:null,
            pageSize: 10,
            activeTab: "clients"
        }
        this.toggleTab = this.toggleTab.bind(this);
        this.edit = this.edit.bind(this);
        this.reload = this.reload.bind(this);
        this.cancel = this.cancel.bind(this);
        this.nameChange = this.nameChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
        this.save = this.save.bind(this);
        this.pageRowsChange = this.pageRowsChange.bind(this);
        this.pageChange = this.pageChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getCustomers(
            {limit:this.state.pageSize,offset:this.state.page}
        ));
        setTimeout((e) => { e.reload() }, 300000,this)
    }

    toggleTab(e) { 
        this.state.activeTab = e;
    } 

    cancel() { 
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
    nameChange(e) { 
        this.state.selected.name = e.target.value;
        this.setState(this.state);
    } 
    statusChange(e) { 
        this.state.selected.status_id= e.value;
        this.setState(this.state);
    } 
    phoneChange(e) { 
        this.state.selected.phone= e.target.value;
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
        this.props.dispatch(customersSave(g,function(err,args) { 
            args.props.dispatch(
                getCustomers(
                    {limit:args.state.pageSize,offset:args.state.page,status:args.state.filter},function(err,args) { 
              toast.success('Successfully saved client.',
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

    reload() { 
        this.props.dispatch(getCustomers(
            {sort:this.state.sort,direction:this.state.direction,
             search:this.state.search,limit:this.state.pageSize,
            offset:this.state.page,status:this.state.filter}
        ));
        setTimeout((e) => { e.reload() }, 300000,this)
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

    render() {
        console.log("p",this.props);
        var heads = [
            {
                dataField:'id',
                hidden:true,
                text:'ID'
            },
            {
                dataField:'queue_time',
                width:'15%',
                type:'text',
                text:'Time',
                formatter:(cellContent,row) => (
                    <div>
                        {row.queue_time + " minutes"}
                    </div>
                )
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
                dataField:'status',
                editable: false,
                text:'Status',
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
            {
                dataField:'id',
                text:'Actions',
                editable: false,
                formatter:(cellContent,row) => ( 
                    <div>
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35,width:90}} color="primary">Edit</Button>
                    </div>
                )
            },
        ];
        return (
        <>
            {(this.props.offices && this.props.offices.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.customers && this.props.customers.data && 
              this.props.customers.data.customers && this.state.selected === null) && ( 
            <>
            <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                <NavItem>
                    <NavLink className={classnames({ active: this.state.activeTab === 'clients' })}
                        onClick={() => { this.toggleTab('clients') }}>
                        <span>{translate('Clients')}</span>
                    </NavLink>
                </NavItem>
            </Nav>
            <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                <TabPane tabId="clients">
                    <Row md="12">
                        <Col md="8"></Col>
                        <Col md="4">
                            <div class="pull-right">
                                <div style={{justifyContent:'spread-evenly'}}>
                                    <Button onClick={() => this.reload()} style={{marginRight:5,height:35}} outline 
                                        color="primary"><AutorenewIcon/></Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row md="12" style={{marginTop:10}}>
                        <Col md="12">
                            <PainTable
                                keyField='id' 
                                data={this.props.customers.data.customers} 
                                total={this.props.customers.data.total}
                                page={this.state.page}
                                pageSize={this.state.pageSize}
                                onPageChange={this.pageChange}
                                onSort={this.sortChange}
                                onPageRowsPerPageChange={this.pageRowsChange}
                                columns={heads}>
                            </PainTable> 
                        </Col>                
                    </Row>
                </TabPane>
            </TabContent>
            </>
            )}
            {(this.props && this.props.customers && this.props.customers.data && 
              this.props.customers.data.customers && this.state.selected !== null) && ( 
            <>
                <Row md="12">
                    <Col md="12">
                        <Row md="12">
                            <Col md={4}>
                              <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                  ID
                                </Label>
                                <Col md={8}>
                                  <Input type="text" id="normal-field" readOnly placeholder="ID" value={this.state.selected.id}/>
                                </Col>
                              </FormGroup>
                            </Col>
                        </Row>
                        <Row md="12">
                            <Col md={4}>
                              <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                  Name
                                </Label>
                                <Col md={8}>
                                  <Input type="text" id="normal-field" onChange={this.nameChange} placeholder="Name" value={this.state.selected.name}/>
                                </Col>
                              </FormGroup>
                            </Col>
                        </Row>
                        <Row md="12">
                          <Col md={4}>
                            <FormGroup row>
                              <Label for="normal-field" md={4} className="text-md-right">
                                Email
                              </Label>
                              <Col md={8}>
                              <Input type="text" id="normal-field"
                                      onChange={this.emailChange} placeholder="Email" value={this.state.selected.email}/>
                                {this.state.errorMessage &&
                                  <p for="normal-field" md={12} className="text-md-right">
                                      <font style={{color:"red"}}>
                                          {this.state.errorMessage}
                                      </font>
                                  </p>
                                }
                              </Col>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row md="12">
                          <Col md={4}>
                            <FormGroup row>
                              <Label for="normal-field" md={4} className="text-md-right">
                                Phone
                              </Label>
                              <Col md={8}>
                              <Input type="text" id="normal-field"
                                      onChange={this.phoneChange} placeholder="Phone" value={this.state.selected.phone}/>
                                {this.state.errorMessage &&
                                  <p for="normal-field" md={12} className="text-md-right">
                                      <font style={{color:"red"}}>
                                          {this.state.errorMessage}
                                      </font>
                                  </p>
                                }
                              </Col>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row md="12">
                          <Col md={4}>
                            <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                    Status
                                </Label>
                                <Col md="8" style={{zIndex:9995}}>
                                  {(this.props.customers && this.props.customers.data && 
                                    this.props.customers.data.config &&
                                    this.props.customers.data.config.status) && (
                                      <Select
                                          closeMenuOnSelect={true}
                                          isSearchable={false}
                                          onChange={this.statusChange}
                                          value={{label:this.state.selected.status}}
                                          options={this.props.customers.data.config.status.map((e) => { 
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
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row md="12">
                          <Col md={4}>
                            <FormGroup row>
                              <Label for="normal-field" md={4} className="text-md-right">
                                Office
                              </Label>
                              <Col md={8}>
                                  <Input type="text" id="normal-field" readOnly value={this.state.selected.office_name}/>
                              </Col>
                            </FormGroup>
                          </Col>
                        </Row>
                    </Col>                
                </Row>
                <hr/>
                <Row md="12">
                    <Col md="6">
                        <Button onClick={this.save} color="primary" disabled={!this.state.selected.name || !this.state.selected.email || 
                          this.state.errorMessage || this.state.phoneMessage}>Save</Button>
                        <Button outline style={{marginLeft:10}} onClick={this.cancel} color="secondary">Cancel</Button>
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
        customers:store.customers
    }
}

export default connect(mapStateToProps)(ClientList);
