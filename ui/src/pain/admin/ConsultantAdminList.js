import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
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
import s from '../office/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { getConsultantAdmin } from '../../actions/consultantAdmin';
import { consultantAdminUpdate } from '../../actions/consultantAdminUpdate';
import cellEditFactory from 'react-bootstrap-table2-editor';
import PhysicianCard from '../search/PhysicianCard';
import AliceCarousel from 'react-alice-carousel';
import { searchCheckRes } from '../../actions/searchCheckRes';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { SearchBar } = Search;
class ConsultantAdminList extends Component {
    constructor(props) { 
        super(props);
        this.state = {
            selected: null,
            assignPhysician: null,
            commentAdd:false
        } 
        this.edit = this.edit.bind(this);
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.nameChange = this.nameChange.bind(this);
        this.zipcodeChange = this.zipcodeChange.bind(this);
        this.firstChange = this.firstChange.bind(this);
        this.lastChange = this.lastChange.bind(this);
        this.addr1Change = this.addr1Change.bind(this);
        this.addr2Change = this.addr2Change.bind(this);
        this.cityChange = this.cityChange.bind(this);
        this.stateChange = this.stateChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.einChange = this.einChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    addr1Change(e) {
        this.state.selected.addr1 = e.target.value;
        this.setState(this.state);
    }
    addr2Change(e) {
        this.state.selected.addr2 = e.target.value;
        this.setState(this.state);
    }
    cityChange(e) {
        this.state.selected.city = e.target.value;
        this.setState(this.state);
    }
    stateChange(e) {
        this.state.selected.state = e.target.value;
        this.setState(this.state);
    }

    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
        this.setState({ errorMessage: '' });
        this.setState({ phoneMessage: '' });
        this.state.isValid = false;
    } 
    zipcodeChange(e) { 
        this.state.selected['zipcode'] = e.target.value;
        this.setState(this.state);
    } 
    nameChange(e) { 
        this.state.selected['name'] = e.target.value;
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
        let val = e.target.value.replace(/\D/g, "")
        .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        let validPhone = !val[2] ? val[1]: "(" + val[1] + ") " + val[2] + (val[3] ? "-" + val[3] : "");
        this.setState(prevState => ({
          selected: {
            ...prevState.selected,
            phone: validPhone
          } 
        }));
        if (validPhone.length < 14 && validPhone.length > 0) {
            this.setState({ phoneMessage: 'Please add a 10 digit phone number' });
        } else {
            this.setState({ phoneMessage: '' });
        }
    } 

    emailChange(e) { 
        this.state.selected['email'] = e.target.value;
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
    einChange(e) { 
        this.state.selected['ein_number'] = e.target.value;
        this.setState(this.state);
      }

    edit(row) { 
        var r = {}
        if (row.id === 'new') { 
            r = { 
                first_name:'',
                last_name:'',
                email: '',
                phone:'',
                addr1:'',
                addr2:'',
                city:'',
                state:'',
                zipcode:'',
                ein_number: ''
                
            }
        } else { 
            r = JSON.parse(JSON.stringify(row))
        } 
        this.state.selected=r
        this.setState(this.state);
    } 
    save() { 
        this.props.dispatch(consultantAdminUpdate(this.state.selected,function(err,args) { 
            if (err) { 
              toast.error(err.message,
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
              return;
            } 
            args.props.dispatch(getConsultantAdmin({page:0,limit:10000},function(err,args) { 
              toast.success('Successfully saved consultant.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
              args.state.selected = null;
              args.setState(args.state);
            },args))
        },this))
    } 

    render() {
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
                sort:true,
                hidden:true,
                text:'ID'
            },
            {
                dataField:'first_name',
                editable: false,
                text:'Name',
                formatter:(cellContent,row) => (
                    <div>
                        {row.first_name + " " + row.last_name}
                    </div>
                )
            },
            {
                dataField:'email',
                editable: false,
                text:'Email',
            },
            {
                dataField:'phone',
                editable: false,
                text:'Phone',
            },
            {
                dataField:'active',
                editable: false,
                text:'Active',
                formatter: (cellContent,row) => (
                    <div>
                        {(row.active) && (<Badge color="primary">Active</Badge>)}
                        {(!row.active) && (<Badge color="danger">Inactive</Badge>)}
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
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35,width:90}} color="primary">Edit</Button>
                    </div>
                )
            },
        ];
        return (
        <>
            {(this.props.consultantAdmin && this.props.consultantAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.consultantAdmin && this.props.consultantAdmin.data && 
              this.props.consultantAdmin.data.consultants && this.state.selected === null) && ( 
            <>
            <Row md="12">
                <Col md="2" style={{marginBottom:10}}>
                    <Button onClick={() => this.edit({id:"new"})} 
                        style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                </Col>
            </Row>
            <Row md="12">
                <Col md="12">
                    <BootstrapTable 
                        keyField='id' data={this.props.consultantAdmin.data.consultants} 
                        cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true })}
                        columns={heads} pagination={ paginationFactory()}>
                    </BootstrapTable>
                </Col>                
            </Row>
            </>
            )}
            {(this.props && this.props.consultantAdmin && this.props.consultantAdmin.data && 
              this.props.consultantAdmin.data.consultants && this.state.selected !== null) && ( 
            <>
            <Row md="12">
                <Col md="5">
                    <h5>Details</h5>
                </Col>
            </Row>
            <Row md="12">
                <Col md="5">
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              First Name:
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.firstChange} placeholder="First Name" value={this.state.selected.first_name}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Last Name:
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.lastChange} placeholder="Last Name" value={this.state.selected.last_name}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Email:
                            </Label>
                            <Col md={7}>
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
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Phone:
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.phoneChange} placeholder="Phone" value={this.state.selected.phone}/>
                              {this.state.phoneMessage &&
                                <p for="normal-field" md={12} className="text-md-right">
                                    <font style={{color:"red"}}>
                                        {this.state.phoneMessage}
                                    </font>
                                </p>
                              }
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Address1:
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.addr1Change} placeholder="Address 1" value={this.state.selected.addr1}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Address2:
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.addr2Change} placeholder="Address 2" value={this.state.selected.addr2}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              City:
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.cityChange} placeholder="City" value={this.state.selected.city}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              State:
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.stateChange} placeholder="State" value={this.state.selected.state}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Zipcode:
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.zipcodeChange} placeholder="Zip" value={this.state.selected.zipcode}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                            <Col md={12}>
                              <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                  EIN:
                                </Label>
                                <Col md={7}>
                                  <Input type="text" id="normal-field" onChange={this.einChange} placeholder="EIN" value={this.state.selected.ein_number}/>
                                </Col>
                              </FormGroup>
                            </Col>
                        </Row>
                </Col>
            </Row>
            <hr/>
            <Row md="12">
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
        consultantAdmin: store.consultantAdmin
    }
}

export default connect(mapStateToProps)(ConsultantAdminList);
