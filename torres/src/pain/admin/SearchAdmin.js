import React, { Component } from 'react';
import { connect } from 'react-redux';
import SavedSearchIcon from '@mui/icons-material/SavedSearch';
import { toast } from 'react-toastify';
import { push } from 'connected-react-router';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { Col, Grid } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import Select from 'react-select';
import { Button } from 'reactstrap'; 
import { Form, FormGroup, Label, Input } from 'reactstrap';
import { InputGroup, InputGroupText } from 'reactstrap';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getProviderSearchAdmin } from '../../actions/providerSearchAdmin';
import { searchConfig } from '../../actions/searchConfig';
import { searchCheckRes } from '../../actions/searchCheckRes';
import { searchRegister } from '../../actions/searchRegister';
import { searchRegisterAdmin } from '../../actions/searchRegisterAdmin';
import makeAnimated from 'react-select/animated';
import PhysicianCard from './PhysicianCard';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import UserRegistration from './UserRegistration';
import Login from '../login';

const animatedComponents = makeAnimated();

class SearchAdmin extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            mylocation:null,
            selected:0,
            geo: false,
            selectedProcedure:0,
            error_message:null,
            selectedProvider:null,
            selectedProviderType:null,
            selectedAppt:null,
            apptBooked:false,
            error:'',
            zipchange:false,
            zipcode:null
        }
        this.searchOffices = this.searchOffices.bind(this);
        this.setProviderType = this.setProviderType.bind(this);
        this.setLocation = this.setLocation.bind(this);
        this.setZip = this.setZip.bind(this);
        this.updateAppt = this.updateAppt.bind(this);
        this.cancel = this.cancel.bind(this);
        this.setProcedure = this.setProcedure.bind(this);
        this.aboutus = this.aboutus.bind(this);
        this.login = this.login.bind(this);
        this.cancel = this.cancel.bind(this);
        this.getWithoutPermission = this.getWithoutPermission.bind(this);
        this.register = this.register.bind(this);
        this.scheduleAppt = this.scheduleAppt.bind(this);
        this.changeZip = this.changeZip.bind(this);
    } 

    componentDidMount() {
        this.state.geo = true;
        this.setState(this.state);
        this.props.dispatch(searchConfig({}))
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
              this.state.geo = false;
              this.setState(this.state);
              var params = {location:{lat:position.coords.latitude,lon:position.coords.longitude }} 
              this.setLocation(position.coords.latitude, position.coords.longitude);
            },this.getWithoutPermission);
        } else {
              this.state.geo = false;
              this.setState(this.state);
        }
    }

    componentWillReceiveProps(p) { 
    }


    changeZip(e) { 
        this.state.zipchange = true;
        this.state.zipcode = e.target.value;
        this.setState(this.state);
        if (this.state.zipcode.length === 5) { 
            this.props.dispatch(getProviderSearchAdmin(
                {type:this.state.selectedProviderType,
                 all:true,
                 zipcode:this.state.zipcode
                }
            ))
        } 
    } 

    updateAppt(e,t) { 
        this.state.apptBooked = true;
        this.state.selectedAppt = e;
        this.state.selectedAppt['schedule'] = t;
        this.setState(this.state);
    } 

    scheduleAppt(p,e) {
        this.state.selectedAppt = p;
        this.setState(this.state);
        var params = {
            id: e.id,
            procedure:e.proc
        } 
        /*this.props.dispatch(searchCheckRes(params,function(err,args,data) { 
            args[0].updateAppt(args[1],args[2])
        },[this,p,e]))*/
    }

    setProviderType(e) { 
        this.state.selectedProviderType = e;
        this.setState(this.state);
        this.props.dispatch(getProviderSearchAdmin(
            {type:this.state.selectedProviderType,
             location:this.state.mylocation
        }))
    } 

    setZip(lat,lon) {
        this.state.mylocation={lat:lat,lon:lon}
        this.setState(this.state);
    }

    cancel() { 
        this.state.selectedAppt = null;
        this.state.selectedProviderType = null;
        this.state.zipcode = null;
        this.state.error_message = null;
        this.setState(this.state);
        this.props.dispatch(getProviderSearchAdmin({}))
    } 

    register(e,d) { 
        var params = e;
        params.office_type_id = this.state.selectedProviderType;
        if (this.state.selectedAppt && this.state.selectedAppt.id) { 
            params.office_id = this.state.selectedAppt.id;
        } 
        this.props.dispatch(searchRegisterAdmin(params,function(err,args) { 
              if (err && err.message) { 
                args.state.error_message = err.message;
                args.setState(args);
                return;
              } 
              args.props.dispatch(getProviderSearchAdmin({}))
              toast.success('Successfully saved user to queue.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
              args.cancel()
            },this));
    } 
    setLocation(lat,lon) {
        this.state.mylocation={lat:lat,lon:lon}
        this.setState(this.state);
    }

    getWithoutPermission(e,t) { 
        this.state.geo = false;
        this.setState(this.state);
    } 

    login() { 
        this.props.dispatch(push('/login'));
    } 

    aboutus() { 
        window.open('https://poundpain.com/about-us', '_blank', 'noreferrer')
    } 

    setProcedure(e) { 
        if (!e.target) { 
            this.state.selectedProcedure = e.value;
        }
        if (this.state.zipcode.length !== 5) { return; }
        this.searchOffices();
    } 

    searchOffices() { 
        this.state.error = '';
        if (this.state.zipcode.length !== 5) { 
            this.state.error = 'Please enter a 5 digit zipcode.';
            this.setState(this.state);
            return; 
        }
        if (this.state.selectedProcedure === 0) { 
            this.state.error = 'Please select a procedure.';
            this.setState(this.state);
            return; 
        }
        var params = { 
            procedure:this.state.selectedProcedure,
            location:this.state.mylocation,
            all:true,
            selected: this.state.selected,
            zipcode: this.state.zipcode
        } 
        this.props.dispatch(getProceduresSearchAdmin(params))
        this.setState(this.state);
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
            1200: {
                items: 2, 
                itemsFit: 'contain'
            },
        };
        const styles = {
          control: base => ({
            ...base,
            width: 325
            })
        }
        return (
        <>
            {(this.props.providerSearchAdmin && this.props.providerSearchAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.searchRegisterAdmin && this.props.searchRegisterAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.searchCheckRes && this.props.searchCheckRes.isReceiving) && (
                <AppSpinner/>
            )}
            {(Login.isAuthenticated()) && ( 
                <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <h5>Use the zipcode box to find providers. Or enter in the form to have a provider automatically provided..</h5>
                </div>
            )}
            {(Login.isAuthenticated() && this.state.selectedProviderType !== null) && ( 
                <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div className="form-group mb-0">
                        <input className="form-control no-border" value={this.state.zipcode} onChange={this.changeZip} required name="zip" placeholder="Zip" />
                    </div>
                </div>
            )}
            {(!Login.isAuthenticated()) && ( 
            <>
            <Grid container xs="12">
                <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'space-evenly'}}>
                        <img src="/painlogo.png" width="200px" height="200px"/>
                        <font style={{textAlign:"center", fontSize:window.innerWidth < 1024 ? 15 : 30}}>POUNDPAIN TECH</font>
                        <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Button color="primary"onClick={this.login}>Login</Button>
                        </div>
                </div>
            </Grid>
            <hr/>
            </>
            )}
            {(this.props.searchConfig && this.props.searchConfig.data && this.props.searchConfig.data.types && 
              this.state.selectedProviderType === null) && ( 
                <Grid container xs="12" style={{marginTop:20}}>
                    {this.props.searchConfig.data.types.map((e) => { 
                        return (
                            <>
                            <Grid item xs="4" onClick={() => this.setProviderType(e.id)} style={{cursor:'pointer'}}>
                                <Card 
                                    style={{borderRadius:"25px 25px 25px 25px",margin:20,width:400,height:300}} className="mb-xlg border-1">
                                    <CardBody>
                                        <Grid container xs="12">
                                            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <font style={{fontSize:'24px'}}>
                                                {e.description}
                                            </font>
                                            </div>
                                        </Grid>
                                    </CardBody>
                                </Card>
                            </Grid>
                            </>
                        )
                    })}
                </Grid>
            )}
            {(this.props.providerSearchAdmin && this.props.providerSearchAdmin.data && 
                this.props.providerSearchAdmin.data && this.props.providerSearchAdmin.data.providers &&
                this.props.providerSearchAdmin.data.providers.length > 0 && 
                this.state.selectedAppt === null) && (
                <Grid container xs="12">
                    {this.props.providerSearchAdmin.data.providers.map((e) => { 
                        return (
                            <Grid item xs="3">
                                <PhysicianCard onScheduleAppt={this.scheduleAppt} provider={e}/>
                            </Grid>
                        )
                    })} 
                </Grid>
            )}
            {(this.state.selectedAppt === null && this.state.selectedProviderType !== null && this.state.zipcode === null) && (
                <Grid container xs="12">
                    <Grid item xs="12">
                        <UserRegistration error_message={this.state.error_message} data={this.state.selectedAppt} onCancel={this.cancel} onRegister={this.register}/>
                    </Grid>
                </Grid>
            )}
            {(this.props.providerSearchAdmin && this.props.providerSearchAdmin.data && 
                this.props.providerSearchAdmin.data && this.props.providerSearchAdmin.data.providers &&
                this.props.providerSearchAdmin.data.providers.length < 1 &&
                this.state.selectedAppt === null) && (
                <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <h4>There are currently no service providers in this area.</h4>
                </div>
            )}
            {(this.state.selectedAppt !== null) && (
                <Grid container xs="12">
                    <Grid item xs="12">
                        <UserRegistration error_message={this.state.error_message} data={this.state.selectedAppt} onCancel={this.cancel} onRegister={this.register}/>
                    </Grid>
                </Grid>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        searchConfig:store.searchConfig,
        providerSearchAdmin: store.providerSearchAdmin,
        searchRegisterAdmin: store.searchRegisterAdmin,
        searchCheckRes: store.searchCheckRes
    }
}

export default connect(mapStateToProps)(SearchAdmin);
