import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { Col, Grid } from 'reactstrap';
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
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { FormGroup, Label, Input } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getContext } from '../../actions/context';
import formatPhoneNumber from '../utils/formatPhone';
import PainTable from '../utils/PainTable';
import { getLegalAdmin } from '../../actions/legalAdmin';
import { legalAdminUpdate } from '../../actions/legalAdminUpdate';

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
        this.pageGridsChange = this.pageGridsChange.bind(this);
        this.activeChange = this.activeChange.bind(this);
        this.officeReport = this.officeReport.bind(this);
        this.renderTotalLabel = this.renderTotalLabel.bind(this);
        this.reload = this.reload.bind(this);
        this.toggleSubTab = this.toggleSubTab.bind(this);
        this.onStatusFilter = this.onStatusFilter.bind(this);
        this.onCommissionChange = this.onCommissionChange.bind(this);
        this.save = this.save.bind(this);
        this.delGrid = this.delGrid.bind(this);
        this.addAddress = this.addAddress.bind(this);
        this.nameChange = this.nameChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
        if (p.legalAdmin.data && p.legalAdmin.data.config && 
            p.legalAdmin.data.config.provider_status && 
            this.state.statusSelected === null && this.state.selProvider === null) { 
            var c = 0;
            var t = [];
            for (c = 0; c < p.legalAdmin.data.config.provider_status.length; c++) { 
                if (p.legalAdmin.data.config.provider_status[c].name !== 'INVITED') { continue; }
                t.push(p.legalAdmin.data.config.provider_status[c].id); 
            } 
            this.state.statusSelected = t;
            this.state.filter = t;
            this.setState(this.state);
            this.props.dispatch(getLegalAdmin(
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
        this.props.dispatch(getLegalAdmin({
            limit:this.state.pageSize,
            office_id:i,
            offset:this.state.page
        }));
        this.setState(this.state);
        // this.props.dispatch(getLegalAdmin({page:this.state.page,limit:this.state.pageSize}))
    }

    reload() { 
        this.props.dispatch(getLegalAdmin(
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
            this.props.legalAdmin.data.config.commission_users.filter((g) => g.id === e.value)[0].name
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
        this.props.dispatch(getLegalAdmin(
            {search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state)
    } 

    sortChange(t) { 
        var g = this.props.legalAdmin.data.sort.filter((e) => t.dataField === e.col);
        if (g.length > 0) { 
            g = g[0]
            this.state.sort = g.id
            this.state.direction = g.direction === 'asc' ? 'desc' : 'asc'
            this.props.dispatch(getLegalAdmin(
                {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
            ));
            this.setState(this.state);
        } 
    } 

    pageGridsChange(t) { 
        this.state.pageSize = t
        this.state.page = 0
        this.props.dispatch(getLegalAdmin(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 
    search(e) { 
        this.state.search = e.target.value;
        if (this.state.search.length === 0) { 
            this.state.search = null;
        } 
        this.props.dispatch(getLegalAdmin(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 
    pageChange(e) { 
        this.state.page = e
        this.props.dispatch(getLegalAdmin(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 

    renderTotalLabel(f,t,s) { 
        var numpage = s/t;
        return "Showing page " + (this.state.page+1) + " of " + numpage.toFixed(0);
    } 

    delGrid(e) { 
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
        this.props.dispatch(legalAdminUpdate(g,function(err,args) { 
            args.props.dispatch(
                getLegalAdmin(
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

    addGrid() { 
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
          totalSize: (this.props.legalAdmin && 
                      this.props.legalAdmin.data &&
                      this.props.legalAdmin.data.total) ? this.props.legalAdmin.data.total : 10,
          hideSizePerPage:true,
          //onPageChange:(page,sizePerPage) => this.pageChange(page,sizePerPage)
        };
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
                        <Button onClick={() => this.delGrid(row)} style={{marginRight:5,height:35,width:90}} color="danger">Delete</Button>
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
            {(this.props.legalAdmin && this.props.legalAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.context && this.props.context.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.legalAdminUpdate && this.props.legalAdminUpdate.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.officeReportDownload && this.props.officeReportDownload.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.state.selected === null) && (
            <Grid md="12">
                <Grid item  md="5" style={{zIndex:9995}}>
                  {(this.props.legalAdmin && this.props.legalAdmin.data && 
                    this.props.legalAdmin.data.config &&
                    this.props.legalAdmin.data.config.provider_status && this.state.statusSelected !== null) && (
                      <Select
                          closeMenuOnSelect={true}
                          isSearchable={false}
                          isMulti
                          onChange={this.onStatusFilter}
                          value={this.state.statusSelected.map((g) => { 
                            return (
                                {
                                label:this.props.legalAdmin.data.config.provider_status.filter((f) => f.id === g)[0].name,
                                value:this.props.legalAdmin.data.config.provider_status.filter((f) => f.id === g)[0].id
                                }
                            )
                          })}
                          options={this.props.legalAdmin.data.config.provider_status.map((e) => { 
                            return (
                                { 
                                label: e.name,
                                value: e.id
                                }
                            )
                          })}
                        />
                    )}
                </Grid>                
                <Grid item  md={3}>
                    <Input type="text" id="normal-field" onChange={this.search}
                    placeholder="Search" value={this.state.search}/>
                </Grid>
                <Grid item  md="4">
                    <div class="pull-right">
                        <div style={{justifyContent:'spread-evenly'}}>
                            <Button onClick={() => this.reload()} style={{marginRight:5,height:35}} outline 
                                color="primary"><AutorenewIcon/></Button>
                            <Button onClick={this.officeReport} outline color="primary"><AssessmentIcon/></Button>
                        </div>
                    </div>
                </Grid>
            </Grid>
            )}
            {(this.props && this.props.legalAdmin && this.props.legalAdmin.data && this.props.legalAdmin.data.legalAdmin &&
              this.props.legalAdmin.data.legalAdmin.legal.length > 0 && this.state.selected === null) && ( 
            <>
            <Grid md="12" style={{marginTop:10}}>
                <Grid item  md="12">
                      {/*<BootstrapTable 
                          keyField="id"
                          data={this.props.legalAdmin.data.legalAdmin} 
                          columns={ heads }
                            pagination={ paginationFactory(options) }>
                      </BootstrapTable>*/}
                      <PainTable
                            keyField='id' 
                            data={this.props.legalAdmin.data.legalAdmin.legal} 
                            total={this.props.legalAdmin.data.total}
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
            {(this.props && this.props.legalAdmin && this.props.legalAdmin.data && this.props.legalAdmin.data.legalAdmin &&
              this.props.legalAdmin.data.legalAdmin.legal.length > 0 && this.state.selected !== null) && ( 
                <>
                <Grid md="12">
                    <Grid item  md="12">
                        <Grid md="12">
                            <Grid item  md={4}>
                              <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                  ID
                                </Label>
                                <Grid item  md={8}>
                                  <Input type="text" id="normal-field" readOnly placeholder="ID" value={this.state.selected.id}/>
                                </Grid>
                              </FormGroup>
                            </Grid>
                        </Grid>
                        <Grid md="12">
                            <Grid item  md={4}>
                              <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                  Service Start
                                </Label>
                                <Grid item  md={8}>
                                  <Input type="text" readOnly id="normal-field" value={this.state.selected.service_start_date}/>
                                </Grid>
                              </FormGroup>
                            </Grid>
                        </Grid>
                        <Grid md="12">
                            <Grid item  md={4}>
                              <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                  Name
                                </Label>
                                <Grid item  md={8}>
                                  <Input type="text" id="normal-field" onChange={this.nameChange} placeholder="Name" value={this.state.selected.name}/>
                                </Grid>
                              </FormGroup>
                            </Grid>
                        </Grid>
                        <Grid md="12">
                          <Grid item  md={4}>
                            <FormGroup row>
                              <Label for="normal-field" md={4} className="text-md-right">
                                Office Email
                              </Label>
                              <Grid item  md={8}>
                              <Input type="text" id="normal-field"
                                      onChange={this.emailChange} placeholder="Email" value={this.state.selected.email}/>
                                {this.state.errorMessage &&
                                  <p for="normal-field" md={12} className="text-md-right">
                                      <font style={{color:"red"}}>
                                          {this.state.errorMessage}
                                      </font>
                                  </p>
                                }
                              </Grid>
                            </FormGroup>
                          </Grid>
                        </Grid>
                        <Grid md="12">
                          <Grid item  md={4}>
                            <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                    Sales Owner
                                </Label>
                                <Grid item  md="8" style={{zIndex:9995}}>
                                  {(this.props.legalAdmin && this.props.legalAdmin.data && 
                                    this.props.legalAdmin.data.config &&
                                    this.props.legalAdmin.data.config.provider_status && this.state.statusSelected !== null) && (
                                      <Select
                                          closeMenuOnSelect={true}
                                          isSearchable={false}
                                          onChange={this.onCommissionChange}
                                          value={{label:this.state.selected.commission_name}}
                                          options={this.props.legalAdmin.data.config.commission_users.map((e) => { 
                                            return (
                                                { 
                                                label: e.name,
                                                value: e.id
                                                }
                                            )
                                          })}
                                        />
                                    )}
                                </Grid>                
                            </FormGroup>
                          </Grid>
                        </Grid>
                        <Grid md="12">
                          <Grid item  md={4}>
                            <FormGroup row>
                              <Label for="normal-field" md={4} className="text-md-right">
                                Active
                              </Label>
                              <Grid item  md={8}>
                              <Input type="checkbox" id="normal-field"
                                      onChange={this.activeChange} placeholder="Email" checked={this.state.selected.active}/>
                              </Grid>
                            </FormGroup>
                          </Grid>
                        </Grid>
                        <Grid md="12">
                          <Grid item  md={4}>
                            <FormGroup row>
                              <Label for="normal-field" md={4} className="text-md-right">
                                Provider ID
                              </Label>
                              <Grid item  md={8}>
                                  {(this.state.selected.stripe_cust_id && this.state.selected.stripe_cust_id.includes('cus_'))  && (
                                      <a href={'https://dashboard.stripe.com/customers/' + this.state.selected.stripe_cust_id}
                                        target='_blank'>{this.state.selected.stripe_cust_id}</a>
                                  )}
                                  {(this.state.selected.stripe_cust_id && !this.state.selected.stripe_cust_id.includes('cus_'))  && (
                                      <a href={'https://squareup.com/dashboard/customers/directory/customer/' + this.state.selected.stripe_cust_id}
                                        target='_blank'>{this.state.selected.stripe_cust_id}</a>
                                  )}
                              </Grid>
                            </FormGroup>
                          </Grid>
                        </Grid>
                        <Grid md="12">
                          <Grid item  md={4}>
                            <FormGroup row>
                              <Label for="normal-field" md={4} className="text-md-right">
                                Old Provider ID
                              </Label>
                              <Grid item  md={8}>
                                  <a href={'https://dashboard.stripe.com/customers/' + this.state.selected.stripe_cust_id}
                                    target='_blank'>{this.state.selected.old_stripe_cust_id}</a>
                              </Grid>
                            </FormGroup>
                          </Grid>
                        </Grid>
                    </Grid>                
                </Grid>
                <Grid md="12">
                    <Grid item  md="12">
                        <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.subTab === 'plans' })}
                                    onClick={() => { this.toggleSubTab('plans') }}>
                                    <span>{translate('Plans')}</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.subTab === 'legalAdmin' })}
                                    onClick={() => { this.toggleSubTab('legalAdmin') }}>
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
                        </Nav>
                        <TabContent className='mb-lg' activeTab={this.state.subTab}>
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
                                    <Grid md="12" style={{marginBottom:20,borderBottom:"1px solid black"}}>
                                        <Grid item  md="2">
                                            Plan Start
                                        </Grid>
                                        <Grid item  md="4">
                                            {this.state.selected.plans.start_date}
                                        </Grid>
                                        <Grid item  md="2">
                                            Plan End
                                        </Grid>
                                        <Grid item  md="4">
                                            {this.state.selected.plans.end_date}
                                        </Grid>
                                    </Grid>
                                    <Grid md="12" style={{marginBottom:20}}>
                                        <BootstrapTable 
                                            keyField='id' data={this.state.selected.plans.items} 
                                            cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true })}
                                            columns={planheads}>
                                        </BootstrapTable>
                                    </Grid>
                                </>
                                )}
                            </TabPane>
                            <TabPane tabId="legalAdmin">
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
                                {/*<Button onClick={() => this.addInvoiceGrid({id:"new"})} 
                                    style={{marginRight:5,marginBottom:10,height:35,width:90}} color="primary">Add</Button> */}
                                {(this.state.selected.invoices && this.state.selected.invoices) && (
                                    <BootstrapTable 
                                        keyField='id' data={this.state.selected.invoices} 
                                        columns={invheads}>
                                    </BootstrapTable>
                                )}
                            </TabPane>
                        </TabContent>
                    </Grid>
                </Grid>
                <hr/>
                <Grid md="12">
                    <Grid item  md="6">
                        <Button onClick={this.save} color="primary" disabled={!this.state.selected.name || !this.state.selected.email || 
                          this.state.errorMessage || this.state.phoneMessage}>Save</Button>
                        <Button outline style={{marginLeft:10}} onClick={this.cancel} color="secondary">Cancel</Button>
                    </Grid>
                </Grid>
            </>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        legalAdminUpdate: store.legalAdminUpdate,
        plansList: store.plansList,
        context: store.context,
        legalAdmin: store.legalAdmin
    }
}

export default connect(mapStateToProps)(OfficeList);
