import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import getVersion from '../../version.js';
import { Container, Alert, Button, FormGroup, Label} from 'reactstrap';
import { withRouter, Link } from 'react-router-dom';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import Widget from '../../components/Widget';
import { registerProvider } from '../../actions/registerProvider';
import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';

class RegisterProvider extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            page:0,
            plan:0,
            first:'',
            last:'',
            email:'',
            addresses:[],
            license:'',
            provtype:0,
            provtypeSel:[
                'Chiropractor'
            ]
        }
        this.nameChange = this.nameChange.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.firstChange = this.firstChange.bind(this);
        this.lastChange = this.lastChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.licenseChange = this.licenseChange.bind(this);
        this.provtypeChange = this.provtypeChange.bind(this);
        this.addRow = this.addRow.bind(this);
        this.checkValid = this.checkValid.bind(this);
        this.register = this.register.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        console.log("p",this.props);
        this.state.plan = this.props.match.params.id;
    }

    checkValid() { 
        /* Implement checks */
        this.state.isValid = true;
        this.setState(this.state);
    } 

    register() { 
        console.log("save",this.state);
        var tosend = { 
            email: this.state.email,
            first: this.state.first,
            name: this.state.name,
            plan: this.state.plan,
            last: this.state.last,
            license: this.state.license,
            addresses: this.state.addresses
        } 
        this.props.dispatch(registerProvider(tosend,function(err,args) { 
              toast.success('Successfully saved office.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
            window.location = "/#/welcome";
        },this));
    } 

    nextPage() { 
        this.state.page += 1;
        this.setState(this.state);
        this.checkValid();
    }

    nameChange(e) { 
        this.state.name = e.target.value;
        this.setState(this.state);
        this.checkValid();
    }

    licenseChange(e) { 
        this.state.license = e.target.value;
        this.setState(this.state);
        this.checkValid();

    }

    emailChange(e) { 

        this.state.email = e.target.value;
        this.setState(this.state);
        this.checkValid();
    }
    provtypeChange(e) { 

    } 
    addRow(e) { 
        this.state.addresses.push({
            name:'My Practice',
            addr1:'',
            phone:'',
            city:'',
            state:'',
            zipcode:''
        })
        this.setState(this.state);
    }
    firstChange(e) { 
        this.state.first = e.target.value;
        this.setState(this.state);
        this.checkValid();
    }
    lastChange(e) { 
        this.state.last = e.target.value;
        this.setState(this.state);
        this.checkValid();
    } 


    render() {
        console.log("s",this.state);
        var heads = [
            {
                dataField:'id',
                hidden:true,
                text:'Name'
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
                text:'State'
            },
            {
                dataField:'zipcode',
                text:'Zip'
            }
        ]
        return (
        <>
            {(this.props.registerProvider && this.props.registerProvider.isReceiving) && (
                <AppSpinner/>
            )}
            <div className="auth-page">
                <Container>
                    <h5 className="auth-logo">
                        <i className="la la-circle text-primary" />
                        #PAIN
                        <i className="la la-circle text-danger" />
                    </h5>
                    {(this.state.page === 0) && (
                    <Widget className="widget-auth mx-auto" title={<h3 className="mt-0">Register with #PAIN</h3>}>
                        <p className="widget-auth-info">
                            Please enter the information below to register
                        </p>
                        <form className="mt" onSubmit={this.doLogin}>
                            {
                                this.props.errorMessage && (
                                    <Alert className="alert-sm" color="danger">
                                        {this.props.errorMessage}
                                    </Alert>
                                )
                            }
                            <div className="form-group mb-0">
                                Practice Name:
                                <input className="form-control no-border" value={this.state.name} onChange={this.nameChange} required name="name" placeholder="Name" />
                            </div>
                            <div className="form-group mb-0">
                                First Name:
                                <input className="form-control no-border" value={this.state.first} onChange={this.firstChange} required name="first" placeholder="First Name" />
                            </div>
                            <div className="form-group mb-0">
                                Last Name:
                                <input className="form-control no-border" value={this.state.last} onChange={this.lastChange} type="last" required name="last" placeholder="Last Name" />
                            </div>
                            <div className="form-group">
                                Email:
                                <input className="form-control no-border" value={this.state.email} onChange={this.emailChange} type="email" required name="email" placeholder="Email" />
                            </div>
                            <p for="normal-field" md={12} className="text-md-right">
                                <font style={{color:"red"}}>
                                    {this.state.errorMessage}
                                </font>
                            </p>
                            <div className="form-group mb-0">
                                License Number:
                                <input className="form-control no-border" value={this.state.license} onChange={this.licenseChange} required name="license" placeholder="License #" />
                            </div>
                        </form>
                    </Widget>
                    )}
                    {(this.state.page === 1) && (
                    <>
                    <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        Enter your practice addresses below. These will show up when clients search for services in your area.
                    </div>
                    <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <div style={{width:800}}>
                            <Button onClick={() => this.addRow()} 
                                style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                            <BootstrapTable 
                                keyField='id' data={this.state.addresses} 
                                cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true })}
                                columns={heads}>
                            </BootstrapTable>
                        </div>
                    </div>
                    </>
                    )}
                    {(this.state.page === 0) && (
                        <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Button type="submit" onClick={this.nextPage} color="primary" className="auth-btn mb-3" disabled={
                              !this.state.isValid} size="lg">Next</Button>
                        </div>
                    )}
                    {(this.state.page === 1) && (
                        <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Button type="submit" color="primary" className="auth-btn mb-3" onClick={this.register} disabled={
                              !this.state.isValid} size="sm">{this.props.registerProvider.isReceiving ? 'Saving...' : 'Register'}</Button>
                        </div>
                    )}
                </Container>
                <footer className="auth-footer">
                  {getVersion()} - {new Date().getFullYear()} &copy; <a rel="noopener noreferrer" target="_blank" href="https://www.poundpain.com">#PAIN</a>
                </footer>
            </div>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        registerProvider: store.registerProvider
    }
}

export default connect(mapStateToProps)(RegisterProvider);
