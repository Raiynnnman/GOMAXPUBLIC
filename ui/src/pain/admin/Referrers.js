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
import { getReferrers } from '../../actions/referrerAdminList';
// import { referralAdminUpdate } from '../../actions/referralAdminUpdate';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import formatPhoneNumber from '../utils/formatPhone';

class Referrers extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            activeTab: "referrer",
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
        this.save = this.save.bind(this);
        this.reload = this.reload.bind(this);
        this.edit = this.edit.bind(this);
        this.add = this.add.bind(this);
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
        if (p.referrerAdminList.data && p.referrerAdminList.data.config && 
            p.referrerAdminList.data.config.status && this.state.statusSelected === null) { 
            var c = 0;
            var t = [];
            for (c = 0; c < p.referrerAdminList.data.config.status.length; c++) { 
                if (p.referrerAdminList.data.config.status[c].name === 'SCHEDULED') { continue; }
                if (p.referrerAdminList.data.config.status[c].name === 'RESCHEDULED') { continue; }
                t.push(p.referrerAdminList.data.config.status[c].id); 
            } 
            this.state.statusSelected = t;
            this.state.filter = t;
            this.setState(this.state);
            this.props.dispatch(getReferrers(
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
        this.props.dispatch(getReferrers(
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
        this.props.dispatch(getReferrers(
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
        this.props.dispatch(getReferrers(
            {search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state)
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
        this.props.dispatch(getReferrers({
            limit:this.state.pageSize,
            offset:this.state.page
        }));
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
        this.props.dispatch(getReferrers(
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
        this.props.dispatch(referralAdminUpdate(tosend,function(err,args) { 
            args.props.dispatch(getReferrers(
                {search:args.state.search,limit:args.state.pageSize,offset:args.state.page,status:args.state.filter},function(err,args) { 
              toast.success('Successfully saved referral.',
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
          totalSize: (this.props.referrerAdminList && 
                      this.props.referrerAdminList.data &&
                      this.props.referrerAdminList.data.total) ? this.props.referrerAdminList.data.total : 10,
          hideSizePerPage:true,
          //onPageChange:(page,sizePerPage) => this.pageChange(page,sizePerPage)
        };
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
                dataField:'referrer_name',
                sort:true,
                text:'Ref Name'
            },
            {
                dataField:'office_name',
                sort:true,
                text:'Off Name'
            },
            {
                dataField:'status',
                sort:true,
                align:'center',
                text:'Status',
                formatter:(cellContent,row) => (
                    <div>
                        {(row.status === 'QUEUED') && (<Badge color="secondary">QUEUED</Badge>)}
                        {(row.status === 'REJECTED') && (<Badge color="danger">REJECTED</Badge>)}
                        {(row.status === 'ACCEPTED') && (<Badge color="primary">ACCEPTED</Badge>)}
                        {(row.status === 'CONTACTED') && (<Badge color="primary">CONTACTED</Badge>)}
                        {(row.status === 'FOLLOWUP') && (<Badge color="primary">FOLLOWUP</Badge>)}
                        {(row.status === 'SCHEDULED') && (<Badge color="primary">SCHEDULED</Badge>)}
                        {(row.status === 'COMPLETED') && (<Badge color="primary">COMPLETED</Badge>)}
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
        ]
        return (
        <>
            {(this.props.referralAdminUpdate && this.props.referralAdminUpdate.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.referrerAdminList && this.props.referrerAdminList.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'referrer' })}
                                onClick={() => { this.toggleTab('referrer') }}>
                                <span>{translate('Referrers')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                        <TabPane tabId="referrer">
                            {(this.state.selected === null) && (
                            <>
                            <div style={{zIndex:512}}>
                                <Row md="12">
                                    <Col md="6" style={{zIndex:9995}}>
                                      {(this.props.referrerAdminList && this.props.referrerAdminList.data && 
                                        this.props.referrerAdminList.data.config &&
                                        this.props.referrerAdminList.data.config.status && this.state.statusSelected !== null) && (
                                          <Select
                                              closeMenuOnSelect={true}
                                              isSearchable={false}
                                              isMulti
                                              onChange={this.onStatusFilter}
                                              value={this.state.statusSelected.map((g) => { 
                                                return (
                                                    {
                                                    label:this.props.referrerAdminList.data.config.status.filter((f) => f.id === g)[0].name,
                                                    value:this.props.referrerAdminList.data.config.status.filter((f) => f.id === g)[0].id
                                                    }
                                                )
                                              })}
                                              options={this.props.referrerAdminList.data.config.status.map((e) => { 
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
                                    {(this.props.referrerAdminList && this.props.referrerAdminList.data && 
                                      this.props.referrerAdminList.data.data && 
                                      this.props.referrerAdminList.data.data.length > 0)&& ( 
                                    <BootstrapTable 
                                        keyField='id' data={this.props.referrerAdminList.data.data} 
                                        pagination={paginationFactory(options)}
                                        columns={regheads}>
                                    </BootstrapTable>
                                    )}
                                    {(this.props.referrerAdminList && this.props.referrerAdminList.data && 
                                      this.props.referrerAdminList.data.data && 
                                      this.props.referrerAdminList.data.data.length < 1)&& ( 
                                      <h3>No referrer yet!</h3>
                                    )}
                                    </>
                                </Col>
                            </Row>
                            </>
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
        referrerAdminList: store.referrerAdminList,
        referralAdminUpdate: store.referralAdminUpdate,
        plansList: store.plansList
    }
}

export default connect(mapStateToProps)(Referrers);
