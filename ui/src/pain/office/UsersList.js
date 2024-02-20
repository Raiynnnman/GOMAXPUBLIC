import React, { Component } from 'react';
import { FormGroup, Label, Input } from 'reactstrap';
import Select from 'react-select';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { bundleSave } from '../../actions/bundleSave';
import { push } from 'connected-react-router';
import { Nav, NavItem, NavLink } from 'reactstrap';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Button } from 'reactstrap'; 
import { Badge } from 'reactstrap';
import { Search } from 'react-bootstrap-table2-toolkit';
import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getOfficeUsers } from '../../actions/officeUsers';
import { officeUsersSave } from '../../actions/officeUsersSave';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { SearchBar } = Search;
class UsersList extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            selectedID: 0
        } 
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.permChange = this.permChange.bind(this);
        this.firstNameChange = this.firstNameChange.bind(this);
        this.lastNameChange = this.lastNameChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    permChange(g) { 
        var id = g.id;
        var perms = []
        if (this.state.selected.entitlements.includes(id)){
            var t = this.state.selected.entitlements.filter((e) => e !== id)
            this.state.selected.entitlements = t
        } else { 
            this.state.selected.entitlements.push(g.id)
        } 
        this.setState(this.state);
    } 
    edit(row) { 
        this.state.selected = JSON.parse(JSON.stringify(row));
        this.setState(this.state);
    } 

    lastNameChange(e) { 
        this.state.selected['last_name'] = e.target.value;
        this.setState(this.state);
    } 
    firstNameChange(e) { 
        this.state.selected['first_name'] = e.target.value;
        this.setState(this.state);
    } 
    emailChange(e) { 
        this.state.selected['email'] = e.target.value;
        this.setState(this.state);
        //validate email 
        const emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
        this.state.isValid = emailRegex.test(e.target.value);
        if (this.state.isValid) {
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
        this.setState({ errorMessage: '' });
        this.state.isValid = false;
    } 
    save() { 
        var g = this.state.selected;
        if (g.id === 'new' || g.id < 1) { 
            delete g['id']
        }
        this.props.dispatch(officeUsersSave(g,function(err,args) { 
            args.props.dispatch(getOfficeUsers(args.state.selected,function(err,args) { 
                toast.success('Successfully saved item.',
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

    render() {
        var heads = [
            {
                dataField:'id',
                sort:true,
                hidden:true,
                text:'ID'
            },
            {
                dataField:'name',
                sort:true,
                text:'Name',
                formatter: (cellContent,row) => (
                    <div>
                        {row.first_name + " " + row.last_name}
                    </div>
                )
            },
            {
                dataField:'email',
                sort:true,
                text:'Email'
            },
            {
                dataField:'active',
                width:"50",
                text:'Active',
                formatter: (cellContent,row) => (
                    <div>
                        {(row.active) && (<Badge color="primary">Active</Badge>)}
                        {(!row.active) && (<Badge color="danger">Inactive</Badge>)}
                    </div>
                )
            },
            {
                dataField:'id',
                text:'Actions',
                formatter:(cellContent,row) => ( 
                    <div>
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35,width:90}} color="primary">Edit</Button>
                    </div>
                )
            },
        ];
        return (
        <>
            {(this.props.officeUsers && this.props.officeUsers.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.officeUsersSave && this.props.officeUsersSave.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.officeUsers && this.props.officeUsers.data && this.props.officeUsers.data.users &&
              this.state.selected === null) && ( 
            <>
            <Row md="12">
                <Col md="4" style={{marginBottom:10}}>
                    <Button onClick={() => this.edit({id:"new",entitlements:[]})} style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                </Col>
            </Row>
            <Row md="12">
                <Col md="12">
                    <BootstrapTable 
                        keyField='id' data={this.props.officeUsers.data.users} 
                        columns={heads} pagination={ paginationFactory()}>
                    </BootstrapTable>
                </Col>                
            </Row>
            </>
            )}
            {(this.props && this.props.officeUsers && this.props.officeUsers.data && this.props.officeUsers.data.users &&
              this.state.selected !== null) && ( 
            <>
            <Row md="12">
                <Col md="12">
                    <Row md="12">
                        <Col md="5">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              First Name
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.firstNameChange} placeholder="First Name" value={this.state.selected.first_name}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="5">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Last Name
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.lastNameChange} placeholder="Last Name" value={this.state.selected.last_name}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="5">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Email
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" readOnly={this.state.selected.id !== 'new'} 
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
                        <Col md="5">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Permissions
                            </Label>
                            <Col md={7}>
                              <>
                              {this.props.officeUsers.data.entitlements.map((e) => {
                                return (
                                     <div style={{marginRight:5}}>
                                      <Input onChange={() => this.permChange(e)} id="checkbox2" type="checkbox" 
                                            checked={this.state.selected.entitlements.includes(e.id)}
                                      />{' '}
                                      <Label for="checkbox2" check>
                                        {e.name}
                                      </Label>
                                     </div>
                                )
                              })}
                              </>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                </Col>                
            </Row>
            <hr/>
            <Row md="12">
                <Col md="6">
                    <Button onClick={this.save} color="primary">Save</Button>
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
        officeUsers: store.officeUsers,
        officeUsersSave: store.officeUsersSave
    }
}

export default connect(mapStateToProps)(UsersList);
