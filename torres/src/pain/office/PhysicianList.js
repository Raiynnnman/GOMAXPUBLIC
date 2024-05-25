import React, { Component } from 'react';
import { connect } from 'react-redux';
import EditIcon from '@mui/icons-material/Edit';
import { phySave } from '../../actions/phySave';
import { FormGroup, Label, Input } from 'reactstrap';
import { Col, Grid } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Button } from 'reactstrap'; 
import { Badge } from 'reactstrap';
import Select from 'react-select';
import { Search } from 'react-bootstrap-table2-toolkit';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getPhysicians } from '../../actions/phy';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PhysicianCard from './PhysicianCard';

const { SearchBar } = Search;
class PhysicianList extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            selectedID: 0
        } 
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.edit = this.edit.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.titleChange = this.titleChange.bind(this);
        this.firstChange = this.firstChange.bind(this);
        this.lastChange = this.lastChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    edit(row) { 
        this.state.selected = JSON.parse(JSON.stringify(row));
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
    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
        this.setState({ errorMessage: '' });
        this.setState({ phoneMessage: '' });
        this.state.isValid = false;
    } 
    save() { 
        var g = this.state.selected;
        if (g.id === 'new') { 
            delete g['id']
        }
        this.props.dispatch(phySave(g,function(err,args) { 
            args.props.dispatch(getPhysicians({page:0,limit:10000},function(err,args) { 
                args.state.selected = null;
                args.setState(args.state);
                toast.success('Successfully saved item.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                );
            },args))
        },this));
    } 

    addGrid() { 
        this.state.selected.addr.push({
            id:0,phone:'',first_name:'',last_name:'',title:'',email:''
        })
        this.setState(this.state);
    } 

    render() {
        const options = {
          showTotal:true,
          sizePerPage:10,
          hideSizePerPage:true
        };
        var heads = [
            {
                dataField:'email',
                sort:true,
                text:'Email'
            },
            {
                dataField:'title',
                sort:true,
                text:'Title'
            },
            {
                dataField:'first_name',
                sort:true,
                text:'First'
            },
            {
                dataField:'last_name',
                sort:true,
                text:'Last'
            },
            {
                dataField:'phone',
                sort:true,
                text:'Phone'
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
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35}} color="primary"><EditIcon/></Button>
                    </div>
                )
            },
        ];
        return (
        <>
            {(this.props.phySave && this.props.phySave.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.phy && this.props.phy.data && this.props.phy.data.physicians &&
              this.state.selected === null) && ( 
            <>
            <Grid md="12">
                <Grid item  md="4" style={{marginBottom:10}}>
                    <Button onClick={() => this.edit({id:"new",procs:[]})} style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                </Grid>
            </Grid>
            <Grid md="12">
            <>
                {this.props.phy.data.physicians.map((e) => {         
                    return (
                    <Grid item  md="3">
                    <PhysicianCard onEdit={this.edit} provider={e}/>
                    </Grid>
                    )
                })}
            </>
            </Grid>
            </>
            )}
            {(this.props && this.props.phy && this.props.phy.data && 
              this.state.selected !== null) && ( 
            <>
            <Grid md="12">
                <Grid item  md="4">
                    <h5>Information</h5>
                </Grid>
            </Grid>
            <hr/>
            <Grid md="12">
                <Grid item  md="4">
                    <Grid md="12">
                        <Grid item  md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Email
                            </Label>
                            <Grid item  md={7}>
                              <Input type="text" id="normal-field" onChange={this.emailChange} placeholder="Email" value={this.state.selected.email}/>
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
                        <Grid item  md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Title 
                            </Label>
                            <Grid item  md={7}>
                              <Input type="text" id="normal-field" onChange={this.titleChange} placeholder="Title" value={this.state.selected.title}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              First
                            </Label>
                            <Grid item  md={7}>
                              <Input type="text" id="normal-field" onChange={this.firstChange} placeholder="First Name" value={this.state.selected.first_name}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Last
                            </Label>
                            <Grid item  md={7}>
                              <Input type="text" id="normal-field" onChange={this.lastChange} placeholder="Last Name" value={this.state.selected.last_name}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                                Phone                              
                            </Label>
                            <Grid item  md={7}>
                              <Input type="text" id="normal-field" onChange={this.phoneChange} placeholder="Phone" value={this.state.selected.phone}/>
                              {this.state.phoneMessage &&
                                <p for="normal-field" md={12} className="text-md-right">
                                    <font style={{color:"red"}}>
                                        {this.state.phoneMessage}
                                    </font>
                                </p>
                              }
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <hr/>
            <Grid md="12">
                <Grid item  md="6">
                    <Button onClick={this.save} color="primary" disabled={this.state.errorMessage || this.state.phoneMessage || this.state.selected.procs === '' ||
                        !this.state.selected.title || !this.state.selected.first_name || !this.state.selected.last_name || !this.state.selected.phone }>Save</Button>
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
        phy: store.phy,
        phySave: store.phySave,
    }
}

export default connect(mapStateToProps)(PhysicianList);
