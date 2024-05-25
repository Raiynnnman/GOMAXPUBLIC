import React, { Component } from 'react';
import { connect } from 'react-redux';
import SavedSearchIcon from '@mui/icons-material/SavedSearch';
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
import { getProviderSearch } from '../../actions/providerSearch';
import { searchConfig } from '../../actions/searchConfig';
import { searchCheckRes } from '../../actions/searchCheckRes';
import { searchRegister } from '../../actions/searchRegister';
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
            selectedProvider:null,
            selectedAppt:null,
            apptBooked:false,
            error:'',
            zipchange:false,
            zipcode:''
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
            this.props.dispatch(getProviderSearch(
                {type:this.state.selectedProvider,
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
        this.state.selectedProvider = e;
        this.setState(this.state);
        this.props.dispatch(getProviderSearch(
            {type:this.state.selectedProvider,
             location:this.state.mylocation
        }))
    } 

    setZip(lat,lon) {
        this.state.mylocation={lat:lat,lon:lon}
        this.setState(this.state);
    }

    cancel() { 
        this.state.selectedAppt = null;
        this.setState(this.state);
    } 

    register(e,d) { 
        var params = e;
        params.phy_id = d.phy_id;
        params.office_id = d.office_id;
        this.props.dispatch(searchRegister(params,function(err,args) { 
              toast.success('Successfully saved booking.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
              args.cancel()
            }))
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
            'location':this.state.mylocation,
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
            {(this.props.providerSearch && this.props.providerSearch.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.searchRegister && this.props.searchRegister.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.searchCheckRes && this.props.searchCheckRes.isReceiving) && (
                <AppSpinner/>
            )}
            {(Login.isAuthenticated()) && ( 
                <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <h5>Use the zipcode box to find providers. Contact a provider in minutes.</h5>
                </div>
            )}
            {(Login.isAuthenticated() && this.state.selectedProvider !== null) && ( 
                <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div className="form-group mb-0">
                        <input className="form-control no-border" value={this.state.zipcode} onChange={this.changeZip} required name="zip" placeholder="Zip" />
                    </div>
                </div>
            )}
            {(!Login.isAuthenticated()) && ( 
            <>
            <Grid md="12">
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
            {(!Login.isAuthenticated() && this.state.selectedAppt === null) && ( 
            <Grid md="12"> 
                <Grid item  md="12">
                    <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <font style={{textAlign:"center", fontSize:window.innerWidth < 1024 ? 20 : 40,fontWeight:"bold"}}>
                            Save money on common medical procedures
                        </font>
                    </div>
                    <br/>
                    <div style={{height:50,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <font style={{textAlign:"center", fontSize:20}}>
                            Find the best price for the highest quality providers. Contact a provider in seconds.
                        </font>
                    </div>
                    <div style={{height:50,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        {(!Login.isAuthenticated() && this.state.selectedProvider !== null && this.state.geo === false) && ( 
                            <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <div className="form-group mb-0">
                                    <input className="form-control no-border" value={this.state.zipcode} onChange={this.changeZip} required name="zip" placeholder="Zip" />
                                </div>
                            </div>
                        )}
                    </div>
                </Grid>
            </Grid>
            )}
            {(this.props.searchConfig && this.props.searchConfig.data && this.props.searchConfig.data.types && 
              this.state.selectedProvider === null) && ( 
                <div style={{cursor:'pointer',display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {this.props.searchConfig.data.types.map((e) => { 
                        return (
                            <>
                                <Card onClick={() => this.setProviderType(e.id)} 
                                    style={{borderRadius:"25px 25px 25px 25px",margin:20,width:400,height:300}} className="mb-xlg border-1">
                                    <CardBody>
                                        <Grid md="12">
                                            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <font style={{fontSize:'24px'}}>
                                                {e.description}
                                            </font>
                                            </div>
                                        </Grid>
                                    </CardBody>
                                </Card>
                            </>
                        )
                    })}
                </div>
            )}
            {(this.props.providerSearch && this.props.providerSearch.data && 
                this.props.providerSearch.data && this.props.providerSearch.data.providers &&
                this.props.providerSearch.data.providers.length > 0 && this.state.provider !== null &&
                this.state.selectedAppt === null) && (
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'spread-evenly'}}>
                    {this.props.providerSearch.data.providers.map((e) => { 
                        return (
                                <PhysicianCard onScheduleAppt={this.scheduleAppt} provider={e}/>
                        )
                    })} 
                </div>
            )}
            {(this.props.providerSearch && this.props.providerSearch.data && 
                this.props.providerSearch.data && this.props.providerSearch.data.providers &&
                this.props.providerSearch.data.providers.length < 1 && this.state.provider !== null &&
                this.state.selectedAppt === null) && (
                <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <h4>There are currently no service providers in this area.</h4>
                </div>
            )}
            {(this.state.selectedAppt !== null) && (
                <Grid md="12">
                    <Grid item  md="12">
                        <UserRegistration data={this.state.selectedAppt} onCancel={this.cancel} onRegister={this.register}/>
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
        providerSearch: store.providerSearch,
        searchRegister: store.searchRegister,
        searchCheckRes: store.searchCheckRes
    }
}

export default connect(mapStateToProps)(SearchAdmin);
