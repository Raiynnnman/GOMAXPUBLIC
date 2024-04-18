import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { Col, Row } from 'reactstrap';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import { push } from 'connected-react-router';
import Select from 'react-select';
import cellEditFactory from 'react-bootstrap-table2-editor';
import EditIcon from '@mui/icons-material/Edit';
import LaunchIcon from '@mui/icons-material/Launch';
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
import { officeReportDownload } from '../../actions/officeReportDownload';
import formatPhoneNumber from '../utils/formatPhone';
import PainTable from '../utils/PainTable';

const { SearchBar } = Search;
class OfficeList extends Component {
    constructor(props) { 
        super(props);
        this.getContext = this.getContext.bind(this);
        this.state = { 
            selected: null,
            subTab: "plans",
            filter: [],
            statusSelected:null,
            search:null,
            selProvider:null,
            page: 0,
            pageSize: 10,
            selectedID: 0
        } 
        this.cancel = this.cancel.bind(this);
        this.search = this.search.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.sortChange = this.sortChange.bind(this);
        this.pageRowsChange = this.pageRowsChange.bind(this);
        this.activeChange = this.activeChange.bind(this);
        this.officeReport = this.officeReport.bind(this);
        this.renderTotalLabel = this.renderTotalLabel.bind(this);
        this.reload = this.reload.bind(this);
        this.toggleSubTab = this.toggleSubTab.bind(this);
        this.onStatusFilter = this.onStatusFilter.bind(this);
        this.onCommissionChange = this.onCommissionChange.bind(this);
        this.save = this.save.bind(this);
        this.delRow = this.delRow.bind(this);
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

    reload() { 
        this.props.dispatch(getOffices(
            {sort:this.state.sort,direction:this.state.direction,
             search:this.state.search,limit:this.state.pageSize,
            offset:this.state.page,status:this.state.filter}
        ));
    }

    activeChange(e,t) { 
        this.state.selected.active = this.state.selected.active ? 0 : 1; 
        this.setState(this.state);
    }
    officeReport() { 
        this.props.dispatch(officeReportDownload({report:'office_report'}));
    } 
    onCommissionChange(e,t) { 
        this.state.commission_user_id = e.value;
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

    pageRowsChange(t) { 
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
                dataField:'next_invoice',
                sort:true,
                align:'center',
                text:'Next Inv'
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
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35}} color="primary"><EditIcon/></Button>
                        <Button onClick={() => this.getContext(row)} style={{height:35}} color="primary"><LaunchIcon/></Button>
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
                dataField:'stripe_invoice_id',
                text:'ID',
                formatter: (cellContent,row) => (
                    <div>
                        <a href={'https://dashboard.stripe.com/invoices/' + row.stripe_invoice_id} 
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
            {(this.state.selected === null) && (
            <Row md="12">
                <Col md="5" style={{zIndex:9995}}>
                  {(this.props.offices && this.props.offices.data && 
                    this.props.offices.data.config &&
                    this.props.offices.data.config.provider_status && this.state.statusSelected !== null) && (
                      <Select
                          closeMenuOnSelect={true}
                          isSearchable={false}
                          isMulti
                          onChange={this.onStatusFilter}
                          value={this.state.statusSelected.map((g) => { 
                            return (
                                {
                                label:this.props.offices.data.config.provider_status.filter((f) => f.id === g)[0].name,
                                value:this.props.offices.data.config.provider_status.filter((f) => f.id === g)[0].id
                                }
                            )
                          })}
                          options={this.props.offices.data.config.provider_status.map((e) => { 
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
                <Col md="4">
                    <div class="pull-right">
                        <div style={{justifyContent:'spread-evenly'}}>
                            <Button onClick={() => this.reload()} style={{marginRight:5,height:35}} outline 
                                color="primary"><AutorenewIcon/></Button>
                            <Button onClick={this.officeReport} outline color="primary"><AssessmentIcon/></Button>
                        </div>
                    </div>
                </Col>
            </Row>
            )}
            {(this.props && this.props.offices && this.props.offices.data && this.props.offices.data.offices &&
              this.props.offices.data.offices.length > 0 && this.state.selected === null) && ( 
            <>
            <Row md="12" style={{marginTop:10}}>
                <Col md="12">
                      {/*<BootstrapTable 
                          keyField="id"
                          data={this.props.offices.data.offices} 
                          columns={ heads }
                            pagination={ paginationFactory(options) }>
                      </BootstrapTable>*/}
                      <PainTable
                            keyField='id' 
                            data={this.props.offices.data.offices} 
                            total={this.props.offices.data.total}
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
                                  Service Start
                                </Label>
                                <Col md={8}>
                                  <Input type="text" readOnly id="normal-field" value={this.state.selected.service_start_date}/>
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
                        <Row md="12">
                          <Col md={4}>
                            <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                    Sales Owner
                                </Label>
                                <Col md="8" style={{zIndex:9995}}>
                                  {(this.props.offices && this.props.offices.data && 
                                    this.props.offices.data.config &&
                                    this.props.offices.data.config.provider_status && this.state.statusSelected !== null) && (
                                      <Select
                                          closeMenuOnSelect={true}
                                          isSearchable={false}
                                          onChange={this.onCommissionChange}
                                          value={{label:this.state.selected.commission_name}}
                                          options={this.props.offices.data.config.commission_users.map((e) => { 
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
                                Active
                              </Label>
                              <Col md={8}>
                              <Input type="checkbox" id="normal-field"
                                      onChange={this.activeChange} placeholder="Email" checked={this.state.selected.active}/>
                              </Col>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row md="12">
                          <Col md={4}>
                            <FormGroup row>
                              <Label for="normal-field" md={4} className="text-md-right">
                                Provider ID
                              </Label>
                              <Col md={8}>
                                  {(this.state.selected.stripe_cust_id && this.state.selected.stripe_cust_id.includes('cus_'))  && (
                                      <a href={'https://dashboard.stripe.com/customers/' + this.state.selected.stripe_cust_id}
                                        target='_blank'>{this.state.selected.stripe_cust_id}</a>
                                  )}
                                  {(this.state.selected.stripe_cust_id && !this.state.selected.stripe_cust_id.includes('cus_'))  && (
                                      <a href={'https://squareup.com/dashboard/customers/directory/customer/' + this.state.selected.stripe_cust_id}
                                        target='_blank'>{this.state.selected.stripe_cust_id}</a>
                                  )}
                              </Col>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row md="12">
                          <Col md={4}>
                            <FormGroup row>
                              <Label for="normal-field" md={4} className="text-md-right">
                                Old Provider ID
                              </Label>
                              <Col md={8}>
                                  <a href={'https://dashboard.stripe.com/customers/' + this.state.selected.stripe_cust_id}
                                    target='_blank'>{this.state.selected.old_stripe_cust_id}</a>
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
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.subTab === 'potentials' })}
                                    onClick={() => { this.toggleSubTab('potentials') }}>
                                    <span>{translate('Potentials')}</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.subTab === 'history' })}
                                    onClick={() => { this.toggleSubTab('history') }}>
                                    <span>{translate('History')}</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.subTab === 'cards' })}
                                    onClick={() => { this.toggleSubTab('cards') }}>
                                    <span>{translate('Cards')}</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.subTab === 'clients' })}
                                    onClick={() => { this.toggleSubTab('clients') }}>
                                    <span>{translate('Clients')}</span>
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent className='mb-lg' activeTab={this.state.subTab}>
                            <TabPane tabId="clients">
                              <BootstrapTable 
                                  keyField="id"
                                  data={this.state.selected.clients} 
                                  columns={ clientheads }>
                              </BootstrapTable>
                            </TabPane>
                            <TabPane tabId="cards">
                              <BootstrapTable 
                                  keyField="id"
                                  data={this.state.selected.cards} 
                                  columns={ cardheads }>
                              </BootstrapTable>
                            </TabPane>
                            <TabPane tabId="history">
                              <BootstrapTable 
                                  keyField="id"
                                  data={this.state.selected.history} 
                                  columns={ historyheads }>
                              </BootstrapTable>
                            </TabPane>
                            <TabPane tabId="potentials">
                              <BootstrapTable 
                                  keyField="id"
                                  data={this.state.selected.potential} 
                                  columns={ potheads }>
                              </BootstrapTable>
                            </TabPane>
                            <TabPane tabId="plans">
                                {(this.state.selected.plans && this.state.selected.plans.items) && (
                                <>
                                    <Row md="12" style={{marginBottom:20,borderBottom:"1px solid black"}}>
                                        <Col md="2">
                                            Plan Start
                                        </Col>
                                        <Col md="4">
                                            {this.state.selected.plans.start_date}
                                        </Col>
                                        <Col md="2">
                                            Plan End
                                        </Col>
                                        <Col md="4">
                                            {this.state.selected.plans.end_date}
                                        </Col>
                                    </Row>
                                    <Row md="12" style={{marginBottom:20}}>
                                        <BootstrapTable 
                                            keyField='id' data={this.state.selected.plans.items} 
                                            cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true })}
                                            columns={planheads}>
                                        </BootstrapTable>
                                    </Row>
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
        officeReportDownload: store.officeReportDownload,
        plansList: store.plansList,
        context: store.context,
        offices: store.offices
    }
}

export default connect(mapStateToProps)(OfficeList);
