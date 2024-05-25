import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { getInvoiceAdmin } from '../../actions/invoiceAdmin';
import { FormGroup, Label, Input } from 'reactstrap';
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
import { invoiceAdminUpdate } from '../../actions/invoiceAdminUpdate';
import AppSpinner from '../utils/Spinner';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import cellEditFactory from 'react-bootstrap-table2-editor';
import EditIcon from '@mui/icons-material/Edit';
import PhysicianCard from '../search/PhysicianCard';
import AliceCarousel from 'react-alice-carousel';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PainTable from '../utils/PainTable';

const { SearchBar } = Search;
class InvoiceAdminList extends Component {
    constructor(props) { 
        super(props);
        this.state = {
            selected: null,
            assignPhysician: null,
            filter: [],
            page: 0,
            comments:{},
            pageSize: 10,
            statusSelected:null,
            commentAdd:false
        } 
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onInvoiceStatusChange = this.onInvoiceStatusChange.bind(this);
        this.statusChange = this.statusChange.bind(this);
        this.search = this.search.bind(this);
        this.edit = this.edit.bind(this);
        this.addComment = this.addComment.bind(this);
        this.comment = this.comment.bind(this);
        this.sortChange = this.sortChange.bind(this);
        this.pageRowsChange = this.pageRowsChange.bind(this);
        this.sortChange = this.sortChange.bind(this);
        this.showMore = this.showMore.bind(this);
        this.showLess = this.showLess.bind(this);
        this.cancelComment = this.cancelComment.bind(this);
        this.saveComment = this.saveComment.bind(this);
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.reload = this.reload.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.zipcodeChange = this.zipcodeChange.bind(this);
        this.firstChange = this.firstChange.bind(this);
        this.lastChange = this.lastChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
        this.renderTotalLabel = this.renderTotalLabel.bind(this);
        this.pageChange = this.pageChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
        if (p.invoiceAdmin.data && p.invoiceAdmin.data.config && 
            p.invoiceAdmin.data.config.status && this.state.statusSelected === null) { 
            var c = 0;
            var t = [];
            for (c = 0; c < p.invoiceAdmin.data.config.status.length; c++) { 
                if (p.invoiceAdmin.data.config.status[c].name === 'PAID') { continue; }
                if (p.invoiceAdmin.data.config.status[c].name === 'GENERATED') { continue; }
                if (p.invoiceAdmin.data.config.status[c].name === 'IMPORTED') { continue; }
                if (p.invoiceAdmin.data.config.status[c].name === 'VOID') { continue; }
                if (p.invoiceAdmin.data.config.status[c].name === 'APPROVED') { continue; }
                t.push(p.invoiceAdmin.data.config.status[c].id); 
            } 
            this.state.statusSelected = t;
            this.state.filter = t;
            this.setState(this.state);
            this.props.dispatch(getInvoiceAdmin(
                {limit:this.state.pageSize,offset:this.state.page,status:t}
            ));
        } 
    }

    componentDidMount() {
        this.props.dispatch(getInvoiceAdmin({page:this.state.page,limit:this.state.pageSize}))
    }

    showMore(r) { 
        this.state.comments.id = 1;
        this.setState(this.state);
    } 

    showLess(r) { 
        delete this.state.comments.id;
        this.setState(this.state);
    } 

    search(e) { 
        this.state.search = e.target.value;
        if (this.state.search.length === 0) { 
            this.state.search = null;
        } 
        this.props.dispatch(getInvoiceAdmin(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 

    reload() { 
        this.props.dispatch(getInvoiceAdmin(
            {sort:this.state.sort,direction:this.state.direction,
             search:this.state.search,limit:this.state.pageSize,
            offset:this.state.page,status:this.state.filter}
        ));
    }

    sortChange(t) { 
        var g = this.props.invoiceAdmin.data.sort.filter((e) => t.dataField === e.col);
        if (g.length > 0) { 
            g = g[0]
            this.state.sort = g.id
            this.state.direction = g.direction === 'asc' ? 'desc' : 'asc'
            this.props.dispatch(getInvoiceAdmin(
                {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
            ));
            this.setState(this.state);
        } 
    } 

    pageRowsChange(t) { 
        this.state.pageSize = t
        this.state.page = 0
        this.props.dispatch(getInvoiceAdmin(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 
    pageChange(e) { 
        this.state.page = e
        this.props.dispatch(getInvoiceAdmin(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 

    renderTotalLabel(f,t,s) { 
        var numpage = s/t;
        return "Showing page " + (this.props.page+1) + " of " + numpage.toFixed(0);
    } 

    onStatusChange(e) { 
        if (e.length <2 ) { return; }
        var c = 0;
        var t = [];
        for (c = 0; c < e.length; c++) { 
            t.push(e[c].value); 
        } 
        this.state.statusSelected = t;
        this.state.filter = t;
        this.props.dispatch(getInvoiceAdmin(
            {limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state)
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
    titleChange(e) { 
        this.state.selected['title'] = e.target.value;
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

    onInvoiceStatusChange(e) { 
        this.state.selected.invoice_status_id=e.value;
        this.setState(this.state);
    }

    statusChange(e) { 
        var p = { 
            id:e.row,
            invoiceAdmin_status_id:e.value
        } 
        this.props.onStatusUpdate(p)
    }
    comment(e) { 
        this.state.selected.comments[0].text=e.target.value
        this.setState(this.state);
    }

    saveComment(e) { 
        this.state.selected.comments[0].edit=false;
        this.state.commentAdd = false;
        this.setState(this.state);
    }

    cancelComment(e) { 
        this.state.selected.comments.shift();
        this.setState(this.state);
    }

    addComment() { 
        this.state.selected.comments.unshift({text:'',edit:true})
        this.state.commentAdd = true;
        this.setState(this.state);
    }

    edit(row) { 
        var r = {}
        r = row
        this.state.selected=r
        this.setState(this.state);
    } 

    save() { 
        // this.props.onSave(this.state.selected);
        var params = this.state.selected;
        this.props.dispatch(invoiceAdminUpdate(params,function(err,args) { 
            args.props.dispatch(getInvoiceAdmin({
                    direction:args.state.direction,sort:args.state.sort,search:args.state.search,
                    limit:args.state.pageSize,offset:args.state.page,status:args.state.filter
                },function(err,args) { 
                toast.success('Successfully scheduled invoice.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                );
                args.cancel();
            },args))
        },this));
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
          totalSize: (this.props.invoiceAdmin && 
                      this.props.invoiceAdmin.data &&
                      this.props.invoiceAdmin.data.total) ? this.props.invoiceAdmin.data.total : 10,
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
        var itemheads = [
            {
                dataField:'id',
                hidden:true,
                text:'ID'
            },
            {
                dataField:'Code',
                text:'Code'
            },
            {
                dataField:'desc',
                text:'Description'
            },
            {
                dataField:'quantity',
                text:'Quantity',
                align:'center',
            },
            {
                dataField:'price',
                text:'Price',
                align:'right',
                formatter:(cellContent,row) => (
                    <div>
                        ${row.price.toFixed(2)}
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
                dataField:'text',
                text:'Text'
            },
            {
                dataField:'first_name',
                text:'Name',
                formatter:(cellContent,row) => (
                    <div>
                        {row.first_name + " " + row.last_name}
                    </div>
                )
            },
            {
                dataField:'created',
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
                hidden:true,
                text:'ID'
            },
            {
                dataField:'office_name',
                editable: false,
                text:'office name',
            },
            {
                dataField:'number',
                editable: false,
                align:'center',
                text:'Invoice ID',
            },
            {
                dataField:'last_comment',
                editable: false,
                align:'left',
                width:"20%",
                text:'Last Comment',
                formatter:(cellContent,row) => (
                    <div>
                        {(row.last_comment.length > 30 && this.state.comments.id !== undefined) && (
                                <div>
                                    {row.last_comment}
                                    <a class="pull-right" color="primary" outline onClick={() => this.showLess(row)}>Show Less</a> 
                                </div>
                        )}
                        {(row.last_comment.length > 30 && this.state.comments.id === undefined) && (
                                <div>
                                    {row.last_comment.substr(0,30) + "..."}
                                    <a class="pull-right" color="primary" onClick={() => this.showMore(row)}>Show More</a> 
                                </div>
                        )}
                        {(row.last_comment.length < 30) && (
                                <div>{row.last_comment}</div>
                        )}
                    </div>
                )
            },
            {
                dataField:'invoice_status',
                sort:true,
                editable:false,
                align:'center',
                text:'Status',
            },
            {
                dataField:'billing_period',
                sort:true,
                editable:false,
                align:'center',
                text:'Period',
            },
            {
                dataField:'total',
                sort:true,
                align:'right',
                editable:false,
                text:'Amount',
                formatter:(cellContent,row) => (
                    <div>
                        ${row.total}
                    </div>
                )
            },
            {
                dataField:'updated',
                sort:true,
                editable: false,
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
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35}} color="primary"><EditIcon/></Button>
                    </div>
                )
            }
        ];
        if (this.props.invoiceAdmin && this.props.invoiceAdmin.data && 
            this.props.invoiceAdmin.data.sort) { 
            var c = 0; 
            for (c=0;c < heads.length; c++) { 
                var q = heads[c]
                var t = this.props.invoiceAdmin.data.sort.filter((g) => q.dataField === g.col);
                if (t.length > 0) { 
                    t = t[0]
                    heads[c].sort=true;
                    if (t.active) { 
                        heads[c].order = t['direction']
                    } else { 
                        heads[c].order = 'asc'
                    } 
                } else { 
                    heads[c].sort=false;
                } 
            } 
        }  
        return (
        <>
            {(this.props.invoiceAdmin && this.props.invoiceAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.invoiceAdmin && this.props.invoiceAdmin.data && 
              this.props.invoiceAdmin.data.invoices && this.state.selected === null) && ( 
            <>
            <Row md="12">
                {(this.state.statusSelected && this.state.statusSelected.length > 0) && (
                <>
                <Col md="6" style={{marginBottom:10}}>
                      <Select
                          closeMenuOnSelect={true}
                          isSearchable={false}
                          isMulti
                          onChange={this.onStatusChange}
                          value={this.state.statusSelected.map((g) => { 
                            return (
                                {
                                label:this.props.invoiceAdmin.data.config.status.filter((f) => f.id === g)[0].name,
                                value:this.props.invoiceAdmin.data.config.status.filter((f) => f.id === g)[0].id
                                }
                            )
                          })}
                          options={this.props.invoiceAdmin.data.config.status.map((e) => { 
                            return (
                                { 
                                label: e.name,
                                value: e.id
                                }
                            )
                          })}
                        />
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
                </>
                )}
            </Row>
            <Row md="12">
                <Col md="12">
                    {/*<BootstrapTable 
                        keyField='id' 
                        data={this.props.invoiceAdmin.data.invoices} 
                        cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true })}
                        columns={heads} pagination={ paginationFactory(options)}>
                    </BootstrapTable>*/}
                    <PainTable
                        keyField='id' 
                        data={this.props.invoiceAdmin.data.invoices} 
                        total={this.props.invoiceAdmin.data.total}
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
            {(this.props && this.props.invoiceAdmin && this.props.invoiceAdmin.data && 
              this.props.invoiceAdmin.data.invoices && this.state.selected !== null) && ( 
            <>
            <Row md="12">
                <Col md="5">
                    <h5>Details</h5>
                </Col>
                <Col md="7">
                    <h5>Stripe Status</h5>
                </Col>
            </Row>
            <hr/>
            <Row md="12">
                <Col md="5">
                    <Row md="12" style={{marginBottom: 5}}>
                        <Col md="4">
                            ID:
                        </Col>
                        <Col md="7">
                            {this.state.selected.id} 
                        </Col>
                    </Row>
                    <Row md="12" style={{marginBottom: 5}}>
                        <Col md="4">
                            Status
                        </Col>
                        <Col md="7">
                              <Select
                                  closeMenuOnSelect={true}
                                  isSearchable={false}
                                  onChange={this.onInvoiceStatusChange}
                                  value={{label:this.props.invoiceAdmin.data.config.status.filter((e) => e.id === 
                                                this.state.selected.invoice_status_id)[0].name
                                  }}
                                  options={this.props.invoiceAdmin.data.config.status.map((e) => { 
                                    return (
                                        { 
                                        label: e.name,
                                        value: e.id
                                        }
                                    )
                                  })}
                                />
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Email
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" readOnly onChange={this.emailChange} placeholder="Email" value={this.state.selected.email}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              First Name
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" readOnly onChange={this.firstChange} placeholder="First Name" value={this.state.selected.first_name}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Last Name
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" readOnly onChange={this.lastChange} placeholder="Last Name" value={this.state.selected.last_name}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Phone
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" readOnly onChange={this.phoneChange} placeholder="Phone" value={this.state.selected.phone}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Office
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" readOnly onChange={this.phoneChange} placeholder="Office" value={this.state.selected.office_name}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                </Col>
                <Col md="7">
                    <Row md="12">
                        <Col md="12">
                            {(this.state.selected.stripe && this.state.selected.stripe.amount_due) && (
                            <>
                              {Object.entries(this.state.selected.stripe).sort((a,b) => (a[0] > b[0] ? 1:-1)).map((e) => { 
                                var isurl = false; var isdollar = false;
                                var isnull = false;
                                if (e[0].includes('url')) { isurl = true }
                                if (e[0].includes('amount')) { isdollar = true }
                                if (e[0].includes('fee')) { isdollar = true }
                                if (e[1] === null) { isnull = true;  }
                                return (
                                    <Row md="12">
                                        <Col md="3">
                                            {e[0]}
                                        </Col>
                                        <Col md="9">
                                            <>
                                            {(isnull) && (
                                                "N/A"
                                            )}
                                            {(!isnull && isurl) && (
                                                <a href={e[1]} target='_blank'>Link</a>
                                            )}
                                            {(!isnull && !isurl && !isdollar) && (
                                            <>
                                                {e[1]}
                                            </>
                                            )}
                                            {(!isnull && !isurl && isdollar) && (
                                            <>
                                                ${e[1].toFixed(2)}
                                            </>
                                            )}
                                            </>
                                        </Col>
                                    </Row>
                                )
                              })}
                            </>
                            )}
                            {(!this.state.selected.stripe || !this.state.selected.stripe.stripe_invoice_id) && (
                            <Row md="12">
                                <Col md="12"><h5>No status yet</h5></Col>
                            </Row>
                            )}
                        </Col>
                    </Row>
                </Col>
            </Row>
            <hr/>
            <Row md="12" style={{marginTop:10}}>
                <Col md="6">
                    <h5>Items</h5>
                </Col>
                <Col md="6">
                    <h5>History</h5>
                </Col>
            </Row>
            <Row md="12">
                <Col md="6">
                    <BootstrapTable 
                        keyField='id' data={this.state.selected.items} 
                        columns={itemheads}> 
                    </BootstrapTable>
                </Col>
                <Col md="6">
                    <BootstrapTable 
                        keyField='id' data={this.state.selected.history} 
                        columns={historyheads}> 
                    </BootstrapTable>
                </Col>
            </Row>
            <hr/>
            <Row md="12">
                <Col md="4">
                <h5>Comments</h5>
                </Col>
            </Row>
            <Row md="12">
                <Col md="4">
                    <Button onClick={() => this.addComment({id:"new"})} color="primary">Add Comment</Button>
                </Col>
            </Row>
            <Row md="12">
                <>
                {this.state.selected.comments.sort((a,b) => (a.created > b.created ? -1:1)).map((e) => { 
                    return (
                        <Col md="3" key={e.id}>
                            <Card style={{margin:20,width:400,height:200}} className="mb-xlg border-1">
                                <CardBody>
                                    <Row md="12">
                                        <Col md="6">
                                            <font style={{fontSize:"14pt"}}>
                                                {
                                                this.state.selected.assignee.filter((g) => g.id === e.user_id).length > 0 ? 
                                                this.state.selected.assignee.filter((g) => g.id === e.user_id)[0].first_name + " " +
                                                this.state.selected.assignee.filter((g) => g.id === e.user_id)[0].last_name + " " : ""
                                                }
                                            </font>
                                        </Col>
                                        <Col md="6">
                                            {moment(e.created).format('LLL')}
                                        </Col>
                                    </Row>
                                    <hr/>
                                    <Row md="12">
                                        {(!e.edit) && ( 
                                        <Col md="12">
                                            <div style={{overflow:"auto",height:100,display: 'flex', 
                                                alignItems: 'left', justifyContent: 'left'}}>
                                            {e.text}
                                            </div>
                                        </Col>
                                        )}
                                        {(e.edit) && ( 
                                        <Col md="12">
                                            <FormGroup row>
                                              <Col md={12}>
                                                <Input value={e.text} rows="3" 
                                                    onChange={this.comment} type="textarea" 
                                                    name="text" id="default-textarea" />
                                              </Col>
                                            </FormGroup>
                                        </Col>
                                        )}
                                    </Row>
                                    <Row md="12">
                                        {(e.edit) && ( 
                                        <Col md="12">
                                            <Col md="6">
                                                <Button onClick={this.saveComment} color="primary">Save</Button>
                                                <Button outline style={{marginLeft:10}} onClick={this.cancelComment} color="secondary">Cancel</Button>
                                            </Col>
                                        </Col>
                                        )}
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    )})}
                    </>
                </Row>
                <hr/>
                <Row md="12" style={{marginTop:10}}>
                    {(!this.state.commentAdd) && (
                    <Col md="6">
                        <Button onClick={this.save} color="primary">Save</Button>
                        <Button outline style={{marginLeft:10}} onClick={this.cancel} color="secondary">Cancel</Button>
                    </Col>
                    )}
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
        invoiceAdmin: store.invoiceAdmin
    }
}

export default connect(mapStateToProps)(InvoiceAdminList);
