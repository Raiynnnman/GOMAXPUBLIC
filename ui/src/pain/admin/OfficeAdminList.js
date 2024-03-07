import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { push } from 'connected-react-router';
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
            selectedID: 0
        } 
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.nameChange = this.nameChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
        this.addr1Change = this.addr1Change.bind(this);
        this.addr2Change = this.addr2Change.bind(this);
        this.cityChange = this.cityChange.bind(this);
        this.stateChange = this.stateChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
        this.markupChange = this.markupChange.bind(this);
        this.zipcodeChange = this.zipcodeChange.bind(this);
        this.einChange = this.einChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
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
                pain_markup:1.25,
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
    phoneChange(e) { 
        let val = e.target.value.replace(/\D/g, "")
        .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        let validPhone = !val[2] ? val[1]: "(" + val[1] + ") " + val[2] + (val[3] ? "-" + val[3] : "");
        this.setState(prevState => {
          const updatedAddr = [...prevState.selected.addr];
          updatedAddr[0] = {
            ...updatedAddr[0],
            phone: validPhone
          };
      
          return {
            selected: {
              ...prevState.selected,
              addr: updatedAddr
            }
          };
        });
        if (validPhone.length < 14 && validPhone.length > 0) {
            this.setState({ phoneMessage: 'Please add a 10 digit phone number' });
        } else {
            this.setState({ phoneMessage: '' });
        }
    } 
    addr1Change(e) {
        this.state.selected.addr[0].addr1 = e.target.value;
        this.setState(this.state);
    }
    addr2Change(e) {
        this.state.selected.addr[0].addr2 = e.target.value;
        this.setState(this.state);
    }
    cityChange(e) {
        this.state.selected.addr[0].city = e.target.value;
        this.setState(this.state);
    }
    stateChange(e) {
        this.state.selected.addr[0].state = e.target.value;
        this.setState(this.state);
    }
    markupChange(e) { 
        var g = parseInt(e.target.value);
        this.state.selected.pain_markup = g;
        this.setState(this.state);
    } 
    zipcodeChange(e) { 
        this.state.selected.addr[0].zipcode = e.target.value;
        this.setState(this.state);
    } 
    einChange(e) { 
      this.state.selected.ein_number = e.target.value;
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
        if (g.pain_markup < 1) { 
            toast.error('Markup must be greater than 1.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
            );
            return;
        }
        if (!g.name || !g.email || !g.ein_number || !g.addr[0].addr1 || !g.addr[0].city || 
          !g.addr[0].phone || !g.addr[0].state || !g.addr[0].zipcode || !g.pain_markup){
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
                        <Button onClick={() => this.getContext(row)} style={{height:35,width:90}} color="primary">Context</Button>
                    </div>
                )
            },
        ];
        var addrheads = [ 
                {dataField:'id', sort:true, text:'ID', hidden:true},
                {dataField:'phone', sort:true, text:'Phone'},
                {dataField:'addr1', sort:true, text:'Address1'},
                {dataField:'addr2', sort:true, text:'Address2'},
                {dataField:'city', sort:true, text:'City'},
                {dataField:'state', sort:true, text:'State'},
                {dataField:'zipcode', sort:true, text:'Zip'}
        ] 
        const options = {
          showTotal:true,
          sizePerPage:10,
          hideSizePerPage:true
        };
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
            {(this.props && this.props.offices && this.props.offices.data && this.props.offices.data.length > 0 &&
              this.state.selected === null) && ( 
            <>
            <Row md="12">
                <Col md="4" style={{marginBottom:10}}>
                    <Button onClick={() => this.edit({id:"new",addr:[]})} style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                </Col>
            </Row>
            <Row md="12">
                <Col md="12">
                    <BootstrapTable 
                        keyField='id' data={this.props.offices.data} 
                        columns={heads} pagination={ paginationFactory(options)}>
                    </BootstrapTable>
                </Col>                
            </Row>
            </>
            )}
            {(this.props && this.props.offices && this.props.offices.data && this.props.offices.data.length > 0 &&
              this.state.selected !== null) && ( 
                <>
                <Row md="12">
                    <Col md="12">
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
                                  DHD Markup
                                </Label>
                                <Col md={8}>
                                  <Input type="text" id="normal-field" onChange={this.markupChange} placeholder="1.25" value={this.state.selected.pain_markup}/>
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
                                  <Input type="text" id="normal-field" onChange={this.phoneChange} placeholder="Phone" value={this.state.selected.addr[0].phone}/>
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
                                  Address 1
                                </Label>
                                <Col md={8}>
                                  <Input type="text" id="normal-field" onChange={this.addr1Change} placeholder="Address 1" value={this.state.selected.addr[0].addr1}/>
                                </Col>
                              </FormGroup>
                            </Col>
                        </Row>
                        <Row md="12">
                            <Col md={4}>
                              <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                  Address 2
                                </Label>
                                <Col md={8}>
                                  <Input type="text" id="normal-field" onChange={this.addr2Change} placeholder="Address 2" value={this.state.selected.addr[0].addr2}/>
                                </Col>
                              </FormGroup>
                            </Col>
                        </Row>
                        <Row md="12">
                            <Col md={4}>
                              <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                  City
                                </Label>
                                <Col md={8}>
                                  <Input type="text" id="normal-field" onChange={this.cityChange} placeholder="City" value={this.state.selected.addr[0].city}/>
                                </Col>
                              </FormGroup>
                            </Col>
                        </Row>
                        <Row md="12">
                            <Col md={4}>
                              <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                  State
                                </Label>
                                <Col md={8}>
                                  <Input type="text" id="normal-field" onChange={this.stateChange} placeholder="State" value={this.state.selected.addr[0].state}/>
                                </Col>
                              </FormGroup>
                            </Col>
                        </Row>
                        <Row md="12">
                            <Col md={4}>
                              <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                  Zip Code
                                </Label>
                                <Col md={8}>
                                  <Input type="text" id="normal-field" onChange={this.zipcodeChange} placeholder="Zip Code" value={this.state.selected.addr[0].zipcode}/>
                                </Col>
                              </FormGroup>
                            </Col>
                        </Row>
                        <Row md="12">
                            <Col md={4}>
                              <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                  EIN
                                </Label>
                                <Col md={8}>
                                  <Input type="text" id="normal-field" onChange={this.einChange} placeholder="EIN" value={this.state.selected.ein_number}/>
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
                          !this.state.selected.ein_number || !this.state.selected.addr[0].addr1 || !this.state.selected.addr[0].city || 
                          !this.state.selected.addr[0].phone || !this.state.selected.addr[0].state || !this.state.selected.addr[0].zipcode || 
                          !this.state.selected.pain_markup || this.state.errorMessage || this.state.phoneMessage}>Save</Button>
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
        context: store.context,
        offices: store.offices
    }
}

export default connect(mapStateToProps)(OfficeList);
