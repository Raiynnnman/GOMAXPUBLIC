import React, { Component } from 'react';
import { connect } from 'react-redux';
import SavedSearchIcon from '@mui/icons-material/SavedSearch';
import { push } from 'connected-react-router';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import Select from 'react-select';
import { Button } from 'reactstrap'; 
import { Form, FormGroup, Label, Input } from 'reactstrap';
import { InputGroup, InputGroupText } from 'reactstrap';
import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getProcedures } from '../../actions/procedures';
import { getProceduresSearch } from '../../actions/proceduresSearch';
import { searchCheckRes } from '../../actions/searchCheckRes';
import { searchRegister } from '../../actions/searchRegister';
import makeAnimated from 'react-select/animated';
import PhysicianCard from './PhysicianCard';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import UserRegistration from './UserRegistration';
import Login from '../login';

const animatedComponents = makeAnimated();

class Search extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            mylocation:null,
            selected:0,
            geo: false,
            selectedProcedure:0,
            selectedAppt:null,
            apptBooked:false,
            error:'',
            zipchange:false,
            zipcode:''
        }
        this.searchOffices = this.searchOffices.bind(this);
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
        this.register = this.register.bind(this);
        this.scheduleAppt = this.scheduleAppt.bind(this);
        this.changeZip = this.changeZip.bind(this);
    } 

    componentDidMount() {
        this.state.geo = true;
        this.setState(this.state);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
              this.state.geo = false;
              this.setState(this.state);
              var params = {location:{lat:position.coords.latitude,lon:position.coords.longitude }} 
              this.props.dispatch(getProcedures(params))
              this.setLocation(position.coords.latitude, position.coords.longitude);
            },this.getWithoutPermission);
        } else {
              this.state.geo = false;
              this.setState(this.state);
            this.props.dispatch(getProcedures({}))
        }
    }

    componentWillReceiveProps(p) { 
        if (p.procedures && p.procedures.data &&
            p.procedures.data.procedures && 
            this.state.zipcode.length < 1 && !this.state.zipchange) {
            this.state.zipcode = p.procedures.data.zipcode
            this.setState(this.state)
        }
    }

    changeZip(e) { 
        this.state.zipchange = true;
        this.state.zipcode = e.target.value;
        this.setState(this.state);
    } 
    updateAppt(e,t) { 
        this.state.apptBooked = true;
        this.state.selectedAppt = e;
        this.state.selectedAppt['schedule'] = t;
        this.setState(this.state);
    } 
    scheduleAppt(p,e) {
        var params = {
            id: e.id,
            procedure:e.proc
        } 
        if (!e.proc || e.proc === undefined) { 
            params['procedure'] = this.state.selectedProcedure;
        } 
        this.props.dispatch(searchCheckRes(params,function(err,args,data) { 
            args[0].updateAppt(args[1],args[2])
        },[this,p,e]))
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
        params['zipcode'] = this.state.zipcode;
        if (d.schedule) { 
            params.appt_id=d.schedule.id
        } 
        this.props.dispatch(searchRegister(params))
        
    } 
    setLocation(lat,lon) {
        this.state.mylocation={lat:lat,lon:lon}
        this.setState(this.state);
    }

    getWithoutPermission(e,t) { 
        this.state.geo = false;
        this.setState(this.state);
        this.props.dispatch(getProcedures({}))
    } 

    login() { 
        this.props.dispatch(push('/login'));
    } 
    aboutus() { 
        window.open('https://poundpain.com', '_blank', 'noreferrer')
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
        this.props.dispatch(getProceduresSearch(params))
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
        var selections = []
        if (this.props.procedures && this.props.procedures.data && this.props.procedures.data.procedures) { 
            this.props.procedures.data.procedures.map((e) => { 
                e.sub.map((g) => { 
                    selections.push({value:g.id,label:g.name})
                })
            })
        } 
        return (
        <>
            {(this.props.procedures && this.props.procedures.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.proceduresSearch && this.props.proceduresSearch.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.state.geo) && (
                <AppSpinner/>
            )}
            {(this.props.searchCheckRes && this.props.searchCheckRes.isReceiving) && (
                <AppSpinner/>
            )}
            {(Login.isAuthenticated()) && ( 
                <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <h5>Find the best price for the highest quality physicians. Book an appointment in minutes.</h5>
                </div>
            )}
            {(!Login.isAuthenticated()) && ( 
            <>
            <Row md="12">
                <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'space-evenly'}}>
                        <img src="/direct-health-delivery.png" width="133px" height="76px"/>
                        <font style={{textAlign:"center", fontSize:window.innerWidth < 1024 ? 15 : 30}}>Direct Health Delivery</font>
                        <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Button color="primary"onClick={this.login}>Login</Button>
                        </div>
                </div>
            </Row>
            <hr/>
            </>
            )}
            {(!Login.isAuthenticated() && this.state.selectedAppt === null) && ( 
            <Row md="12"> 
                <Col md="12">
                    <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <font style={{textAlign:"center", fontSize:window.innerWidth < 1024 ? 20 : 40,fontWeight:"bold"}}>
                            Save money on common medical procedures
                        </font>
                    </div>
                    <br/>
                    <div style={{height:50,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <font style={{textAlign:"center", fontSize:20}}>
                            Find the best price for the highest quality physicians. Book an appointment in minutes.
                        </font>
                    </div>
                </Col>
            </Row>
            )}
            {(this.props.procedures && this.props.procedures.data && 
              this.props.procedures.data.procedures && this.state.selectedAppt === null) && (
            <Row md="12" style={{marginTop:20}}>
                {(window.innerWidth < 1024) && (
                    <>
                    <div style={{height:50,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <Select
                          styles={styles}
                          closeMenuOnSelect={true}
                          onChange={this.setProcedure}
                          components={animatedComponents}
                          options={selections}
                        />
                    </div>
                    <br/>
                    <div style={{height:50,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <Input style={{marginLeft:10,width:100,height:38}} type="text" id="normal-field" 
                                onChange={this.changeZip} value={this.state.zipcode} placeholder="Zipcode" />
                      <Button color="primary" style={{marginLeft:10}} onClick={this.searchOffices}>
                        <SavedSearchIcon style={{color:"white"}}/>
                      </Button>
                    </div>
                    </>
                )}
                {(window.innerWidth > 1024) && (
                    <>
                    <Col md="12" style={{padding:0,margin:0}}>
                    <div style={{height:50,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <Select
                          styles={styles}
                          closeMenuOnSelect={true}
                          onChange={this.setProcedure}
                          components={animatedComponents}
                          options={selections.sort((a, b) => {
                            const labelA = a.label || "";
                            const labelB = b.label || "";
                            return labelA.localeCompare(labelB);
                          })}
                        />
                      <Input style={{marginLeft:10,width:100,height:38}} type="text" id="normal-field" 
                                onChange={this.changeZip} value={this.state.zipcode} placeholder="Zipcode" />
                      <Button color="primary" style={{marginLeft:10}} onClick={this.searchOffices}>
                        <SavedSearchIcon style={{color:"white"}}/>
                      </Button>
                    </div>
                    </Col>
                    </>
                )}
            </Row>
            )}
            {(this.props.procedures && this.props.procedures.data && 
              this.props.procedures.data.procedures && this.state.selectedAppt === null && 
              this.state.error.length > 0) && (
            <Row md="12" style={{marginTop:20}}>
                <Col md="4"></Col>
                <Col md="4">
                    <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <font style={{color:"red"}}>
                            {this.state.error}
                        </font>
                    </div>
                </Col>
                <Col md="4"></Col>
            </Row>
            )}
            {(this.props.proceduresSearch && this.props.proceduresSearch.data && 
                this.props.proceduresSearch.data && this.props.proceduresSearch.data.physicians &&
                this.props.proceduresSearch.data.physicians.length > 0 && this.state.selectedAppt === null) && (
                <AliceCarousel animationType="fadeout" animationDuration={3} autoWidth={true} innerWidth={10}
                    autoPlay={false} disableDotsControls={true} infinite={false}
                    disableButtonsControls={false} responsive={responsive}
                    disableSlideInfo={false}
                    mouseTracking items={this.props.proceduresSearch.data.physicians.map((e) => { 
                        return (
                            <PhysicianCard procedure={this.state.selectedProcedure} onScheduleAppt={this.scheduleAppt} physician={e}/>
                        )
                    })} />
            )}
            {(this.props.proceduresSearch && this.props.proceduresSearch.data && 
                this.props.proceduresSearch.data && this.props.proceduresSearch.data.physicians &&
                this.props.proceduresSearch.data.physicians.length < 1 && this.state.selectedAppt === null) && (
                <div style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <h4>There are currently no service providers in this area.</h4>
                </div>
            )}
            {(this.state.selectedAppt !== null) && (
                <Row md="12">
                    <Col md="12">
                        <UserRegistration data={this.state.selectedAppt} onCancel={this.cancel} onRegister={this.register}/>
                    </Col>
                </Row>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        procedures: store.procedures,
        proceduresSearch: store.proceduresSearch,
        searchCheckRes: store.searchCheckRes
    }
}

export default connect(mapStateToProps)(Search);
