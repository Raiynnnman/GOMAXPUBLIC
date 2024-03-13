import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import { push } from 'connected-react-router';
import Select from 'react-select';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Button } from 'reactstrap'; 
import { Badge } from 'reactstrap';
import { Search } from 'react-bootstrap-table2-toolkit';
import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { FormGroup, Label, Input } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getOffices } from '../../actions/offices';
import { getContext } from '../../actions/context';
import { officeSave } from '../../actions/officeSave';

const { SearchBar } = Search;
class OfficeList extends Component {
    constructor(props) { 
        super(props);
        this.getContext = this.getContext.bind(this);
        this.state = { 
            selected: null,
            subTab: "plans",
            page: 0,
            pageSize: 10,
            selectedID: 0
        } 
        this.cancel = this.cancel.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.renderTotalLabel = this.renderTotalLabel.bind(this);
        this.toggleSubTab = this.toggleSubTab.bind(this);
        this.save = this.save.bind(this);
        this.delRow = this.delRow.bind(this);
        this.addAddress = this.addAddress.bind(this);
        this.nameChange = this.nameChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getOffices({page:this.state.page,limit:this.state.pageSize}))
    }

    pageChange(e,t) { 
        if (e === '>') { 
            this.state.page = this.state.page + 1;
        } else { 
            this.state.page = e - 1;
        }
        this.props.dispatch(getOffices(
            {limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 

    renderTotalLabel(f,t,s) { 
        var numpage = s/t;
        return "Showing page " + (this.state.page+1) + " of " + numpage.toFixed(0);
    } 

    delRow(e) { 
        var t = this.state.selected.addr.filter((g) => g.id !== e.id);
        this.state.selected.addr = t;
        this.setState(this.state);
    } 
    toggleSubTab(e) { 
        this.state.subTab = e;
        this.setState(this.state);
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
    getContext(e) { 
        this.props.dispatch(getContext({office:e.id},function(err,args) { 
                localStorage.setItem("context",true);
                window.location.href = '/index.html';
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
            args.props.dispatch(getOffices({page:0,limit:10000},function(err,args) { 
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

    addRow() { 
        this.state.selected.addr.push({
            id:0,phone:'',addr1:'',addr2:'',city:'',state:'',zipcode:''
        })
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
          totalSize: (this.props.offices && 
                      this.props.offices.data &&
                      this.props.offices.data.total) ? this.props.offices.data.total : 10,
          hideSizePerPage:true,
          //onPageChange:(page,sizePerPage) => this.pageChange(page,sizePerPage)
        };
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
                dataField:'active',
                width:"50",
                text:'Active',
                formatter: (cellContent,row) => (
                    <div>
                        {(row.active === 1) && (<Badge color="primary">Active</Badge>)}
                        {(row.active === 0) && (<Badge color="danger">Inactive</Badge>)}
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
                dataField:'id',
                text:'Actions',
                formatter:(cellContent,row) => ( 
                    <div>
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35,width:90}} color="primary">Edit</Button>
                        <Button onClick={() => this.getContext(row)} style={{height:35,width:90}} color="primary">Context</Button>
                    </div>
                )
            },
        ];
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
                        <Button onClick={() => this.delRow(row)} style={{marginRight:5,height:35,width:90}} color="danger">Delete</Button>
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
                hidden:true,
                text:'ID'
            },
            {
                dataField:'status',
                text:'Status'
            },
            {
                dataField:'billing_period',
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
            {(this.props && this.props.offices && this.props.offices.data && this.props.offices.data.offices &&
              this.props.offices.data.offices.length > 0 && this.state.selected === null) && ( 
            <>
            <Row md="12">
                <Col md="12">
                      <BootstrapTable 
                          keyField="id"
                          data={this.props.offices.data.offices} 
                          columns={ heads }
                            pagination={ paginationFactory(options) }>
                      </BootstrapTable>
                </Col>                
            </Row>
            </>
            )}
            {(this.props && this.props.offices && this.props.offices.data && this.props.offices.data.offices &&
              this.props.offices.data.offices.length > 0 && this.state.selected !== null) && ( 
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
                                Office Email
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
                                    <span>{translate('Invoices')}</span>
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent className='mb-lg' activeTab={this.state.subTab}>
                            <TabPane tabId="plans">
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
                                {/*<Button onClick={() => this.addInvoiceRow({id:"new"})} 
                                    style={{marginRight:5,marginBottom:10,height:35,width:90}} color="primary">Add</Button> */}
                                {(this.state.selected.invoices && this.state.selected.invoices) && (
                                    <BootstrapTable 
                                        keyField='id' data={this.state.selected.invoices} 
                                        columns={invheads}>
                                    </BootstrapTable>
                                )}
                            </TabPane>
                        </TabContent>
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
        officeSave: store.officeSave,
        plansList: store.plansList,
        context: store.context,
        offices: store.offices
    }
}

export default connect(mapStateToProps)(OfficeList);
