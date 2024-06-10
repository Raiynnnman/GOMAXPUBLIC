import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Grid } from 'reactstrap';
import EditIcon from '@mui/icons-material/Edit';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
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
import AppSpinner from '../utils/Spinner';
import { getOffices } from '../../actions/officeInvoices';
import { getContext } from '../../actions/context';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import cellEditFactory from 'react-bootstrap-table2-editor';
import PhysicianCard from '../search/PhysicianCard';
import AliceCarousel from 'react-alice-carousel';
import { searchCheckRes } from '../../actions/searchCheckRes';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { SearchBar } = Search;
class InvoiceAdminList extends Component {
    constructor(props) { 
        super(props);
        this.state = {
            selected: null,
            assignPhysician: null,
            commentAdd:false
        } 
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.statusChange = this.statusChange.bind(this);
        this.edit = this.edit.bind(this);
        this.addComment = this.addComment.bind(this);
        this.comment = this.comment.bind(this);
        this.cancelComment = this.cancelComment.bind(this);
        this.saveComment = this.saveComment.bind(this);
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.zipcodeChange = this.zipcodeChange.bind(this);
        this.firstChange = this.firstChange.bind(this);
        this.lastChange = this.lastChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    onStatusChange(e) { 
        this.props.onStatusChange(e);
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

    statusChange(e) { 
        var p = { 
            id:e.row,
            officeInvoices_status_id:e.value
        } 
        this.props.onStatusUpdate(p)
    }
    onFilterChange(e) { 
        this.props.onFilterChange(e)
    } 
    comment(e) { 
        this.state.selected.comments[0].text=e.target.value
        this.setState(this.state);
    }
    saveComment(e) { 
        this.state.selected.comments[0].edit=false;
        this.state.commentAdd = false;
        this.setState(this.state);
        this.props.onSave(this.state.selected);
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
        this.props.onSave(this.state.selected);
        this.state.selected = null;
        this.setState(this.state);
    } 

    render() {
        const options = {
          showTotal:true,
          sizePerPage:10,
          hideSizePerPage:true
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
                dataField:'number',
                editable: false,
                text:'Invoice ID',
            },
            {
                dataField:'invoice_status',
                sort:true,
                editable:false,
                text:'Status',
                editorRenderer:(editorProps, value, row, column, rowIndex, columnIndex) => (
                    <div>
                        <Select 
                          onChange={this.statusChange}
                          isSearchable={false}
                          options={this.props.officeInvoices.data.config.status
                            .filter((e) => e.id !== 1)
                            .map((e) => { 
                            return (
                                {
                                value:e.id,
                                row:row.id,
                                label:e.name
                                }
                            )
                          })}
                          value={
                            label: this.props.officeInvoices.data.config.status.filter((e) => e.id === row.id)[0].name 
                          }
                        />
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
                        {moment(row['updated']).format('LLL')}
                    </div>
                )
            },
            /*{
                dataField:'id',
                text:'Actions',
                editable: false,
                formatter:(cellContent,row) => ( 
                    <div>
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35}} color="primary"><EditIcon/></Button>
                    </div>
                )
            }*/,
        ];
        return (
        <>
            {(this.props.officeInvoices && this.props.officeInvoices.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.officeInvoices && this.props.officeInvoices.data && 
              this.props.officeInvoices.data.invoices && this.state.selected === null) && ( 
            <>
            <Grid container xs="12">
                <Grid item xs="12">
                    <BootstrapTable 
                        keyField='id' data={this.props.officeInvoices.data.invoices.filter((e) => e.invoice_status !== "CREATED")} 
                        cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true })}
                        columns={heads} pagination={ paginationFactory(options)}>
                    </BootstrapTable>
                </Grid>                
            </Grid>
            </>
            )}
            {(this.props && this.props.officeInvoices && this.props.officeInvoices.data && 
              this.props.officeInvoices.data.invoices && this.state.selected !== null) && ( 
            <>
            <Grid container xs="12">
                <Grid item xs="5">
                    <h5>Details</h5>
                </Grid>
                <Grid item xs="7">
                    <h5>Stripe Status</h5>
                </Grid>
            </Grid>
            <Grid container xs="12">
                <Grid item xs="5">
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Email
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" onChange={this.emailChange} placeholder="Email" value={this.state.selected.email}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              First Name
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" onChange={this.firstChange} placeholder="First Name" value={this.state.selected.first_name}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Last Name
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" onChange={this.lastChange} placeholder="Last Name" value={this.state.selected.last_name}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Phone
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" onChange={this.phoneChange} placeholder="Phone" value={this.state.selected.phone}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Zipcode
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" onChange={this.zipcodeChange} placeholder="Zip" value={this.state.selected.zipcode}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Imported description:
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" readOnly placeholder="Nothing imported" value={this.state.selected.description}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs="7">
                    <Grid container xs="12">
                        <Grid item xs="12">
                            stripe invoice status here
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <hr/>
            <Grid container xs="12">
                <>
                {this.state.selected.comments.sort((a,b) => (a.created > b.created ? -1:1)).map((e) => { 
                    return (
                        <Grid item xs="3" key={e.id}>
                            <Card style={{margin:20,width:400,height:200}} className="mb-xlg border-1">
                                <CardBody>
                                    <Grid container xs="12">
                                        <Grid item xs="6">
                                            <font style={{fontSize:"14pt"}}>
                                                {
                                                this.props.officeInvoices.data.config.assignee.filter((g) => g.id === e.user_id).length > 0 ? 
                                                this.props.officeInvoices.data.config.assignee.filter((g) => g.id === e.user_id)[0].first_name + " " +
                                                this.props.officeInvoices.data.config.assignee.filter((g) => g.id === e.user_id)[0].last_name + " " : ""
                                                }
                                            </font>
                                        </Grid>
                                        <Grid item xs="6">
                                            {moment(e.created).format('LLL')}
                                        </Grid>
                                    </Grid>
                                    <hr/>
                                    <Grid container xs="12">
                                        {(!e.edit) && ( 
                                        <Grid item xs="12">
                                            <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            {e.text}
                                            </div>
                                        </Grid>
                                        )}
                                        {(e.edit) && ( 
                                        <Grid item xs="12">
                                            <FormGroup row>
                                              <Grid item xs={12}>
                                                <Input value={e.text} rows="3" 
                                                    onChange={this.comment} type="textarea" 
                                                    name="text" id="default-textarea" />
                                              </Grid>
                                            </FormGroup>
                                        </Grid>
                                        )}
                                    </Grid>
                                    <Grid container xs="12">
                                        {(e.edit) && ( 
                                        <Grid item xs="12">
                                            <Grid item xs="6">
                                                <Button onClick={this.saveComment} color="primary">Save</Button>
                                                <Button outline style={{marginLeft:10}} onClick={this.cancelComment} color="secondary">Cancel</Button>
                                            </Grid>
                                        </Grid>
                                        )}
                                    </Grid>
                                </CardBody>
                            </Card>
                        </Grid>
                    )})}
                    </>
                </Grid>
                <hr/>
                <Grid container xs="12">
                    {(!this.state.commentAdd) && (
                    <Grid item xs="6">
                        <Button onClick={this.save} color="primary">Save</Button>
                        <Button outline style={{marginLeft:10}} onClick={this.cancel} color="secondary">Cancel</Button>
                    </Grid>
                    )}
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
        officeInvoices: store.officeInvoices
    }
}

export default connect(mapStateToProps)(InvoiceAdminList);
