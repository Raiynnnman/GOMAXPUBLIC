import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { Badge,Button } from 'reactstrap';
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import AppSpinnerInternal from '../utils/SpinnerInternal';
import { getMoreSchedules } from '../../actions/moreSchedules';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { isValidDate } from '../utils/validationUtils.js';

class PhysicianCard extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            more: {},
            inMore:0,
            lastMore:0,
            dateSelected:'',
            pickDay: false,
            dateSelectedForRest:'',
            selected:null
        }
        this.onDateChange = this.onDateChange.bind(this);
        this.getDate = this.getDate.bind(this);
        this.scheduleAppt = this.scheduleAppt.bind(this);
        this.selectDay = this.selectDay.bind(this);
        this.moreToggle = this.moreToggle.bind(this);
    } 

    componentWillReceiveProps(np) { 
        if (this.state.selected === null && np.physician && np.physician.about) { 
            this.state.selected = np.physician;
            this.setState(this.state);
        }
    }

    componentDidMount() {
        var j = new Date()
        var date = j.toISOString()
        var date2 = j.toDateString()
        date = date.substring(0,10)
        date2 = date2.substring(0,15)
        this.state.dateSelected = date2
        this.state.dateSelectedForRest = date;
        this.setState(this.state)
        var params = {
            date: this.state.dateSelectedForRest,
            id: this.props.physician.phy_id
        }
        this.props.dispatch(getMoreSchedules(params));
    }

    selectDay() { 
        this.state.pickDay = true;
        this.setState(this.state)
    } 
    onSelected(e,t) { 
        //this.props.onSelected(e,t);
        this.state.loaded=true;
        this.setState(this.state)
    } 

    onDateChange(e) {
        var j = new Date(e);
        if (!isValidDate(j)) { 
            j = new Date();
        } 
        var date = j.toISOString()
        var date2 = j.toDateString()
        date = date.substring(0,10)
        date2 = date2.substring(0,15)
        this.state.pickDay = false;
        this.state.dateSelected = date2
        this.state.dateSelectedForRest = date;
        var params = {
            date: this.state.dateSelectedForRest,
            id: this.props.physician.phy_id
        }
        this.state.lastMore = this.props.physician.phy_id;
        this.props.dispatch(getMoreSchedules(params));
        this.state.more[this.props.physician.phy_id] = false;
        this.state.inMore = this.props.physician.phy_id;
        this.setState(this.state)
    } 

    moreToggle(e) { 
        for (const[key,value] of Object.entries(this.state.more)) { 
            var k = parseInt(key)
            if (k === e) { continue; }
            this.state.more[k] = false;
        } 
        if (this.state.lastMore !== e) { 
            this.onDateChange(this.state.dateSelectedForRest + " 00:00:00")
        } 
        this.state.more[e] = !this.state.more[e];
        this.setState(this.state);
    } 

    scheduleAppt(e) { 
        this.moreToggle(this.props.physician.phy_id);
        this.props.onScheduleAppt(this.props.physician,e)
    } 

    getDate() { 
        var j = new Date();
        var q = j.toDateString()
        return q.substring(0,10);
    } 

    render() {
        if (this.state.inMore > 0 && !this.props.moreSchedules.isReceiving)  {
            this.state.more[this.props.physician.phy_id] = true;
            this.state.inMore = 0;
            this.setState(this.state)
        } 
        return (
        <>
        {(this.props.physician && this.props.physician.schedule) && (
            <Card style={{
                margin:20,width:250,height:375,
                borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}} className="mb-xlg border-1">
                <CardBody>
                    <Row md="12">
                        <Col md="12">
                            <font style={{fontSize:"14pt",fontWeight:"bold"}}>
                            {this.props.physician.title + " " + this.props.physician.first_name + " " + this.props.physician.last_name}
                            </font>
                            <br/>
                            {(this.props.physician.rating === 5) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.physician.rating >= 4) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.physician.rating >= 3 && this.props.physician.rating < 4) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.physician.rating >= 2 && this.props.physician.rating < 3) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.physician.rating >= 1 && this.props.physician.rating < 2) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.physician.rating >= 0 && this.props.physician.rating < 1) && (
                            <>
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {this.props.physician.rating.toFixed(1)}
                        </Col>
                        <Col md="2"></Col>
                        <Col md="4" class="pull-right">
                        </Col>
                    </Row>
                    <hr/>
                    <div style={{height:130,marginBottom:10,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <>
                        {(this.props.physician.headshot) && (<img style={{width:140,height:130,objectFit:"fill"}} src={this.props.physician.headshot}/>)}
                        {(!this.props.physician.headshot) && (<img style={{width:140,height:130,objectFit:"fill"}} src="/headshot.png"/>)}
                    </>
                    </div>
                    <Row md="12"> <Col md="12">{this.props.physician.miles.toFixed(2)} miles</Col> </Row>
                    <Row md="12"> <Col md="12">{this.props.physician.addr[0][0].addr1}</Col> </Row>
                    <Row md="12"> <Col md="12">{this.props.physician.addr[0][0].addr2}</Col> </Row>
                    <Row md="12">
                        <Col md="12">{this.props.physician.addr[0][0].city},{this.props.physician.addr[0][0].state} {this.props.physician.addr[0][0].zipcode}
                        </Col> 
                    </Row>
                    {(false) && ( <Row md="12"> 
                        <Col md="4">
                            <Button color="secondary">See Reviews</Button>
                        </Col>
                        <Col md="4">
                            <Button color="secondary">See Video</Button>
                        </Col>
                    </Row>
                    )}
                    <hr/>
                    <Row md="12">
                        <Col md="12">
                        <div style={{marginTop:10,height:10,display: 'flex', alignItems: 'center', justifyContent: 'space-evenly',textAlign:"center"}}>
                        {(false && this.props.physician && this.props.physician.scheduled && this.props.physician.scheduled.slice) &&
                        this.props.physician.schedule.slice(0,4).map((g) => { 
                            return (
                                <Button onClick={() => this.scheduleAppt(g)} color="primary">{g.time}</Button>
                            )
                        })}
                        <Button id={"more-schedule-" + this.props.physician.phy_id} color="primary">Schedule</Button>
                        <Popover style={{width:375,height:330,backgroundColor:"white"}} placement="top" 
                            isOpen={this.state.more[this.props.physician.phy_id]} target={"more-schedule-" + this.props.physician.phy_id} toggle={() => this.moreToggle(this.props.physician.phy_id)}>
                            <PopoverBody> 
                                <Card style={{border:"1px solid #e3e3e3",width:375,height:330,backgroundColor:"white"}}>
                                    <font style={{height:30,display: 'flex',  fontSize:"14pt",fontWeight:"bold",
                                        alignItems: 'center', justifyContent: 'center',textAlign:"center"}}>
                                            {this.state.dateSelected}
                                    </font>
                                    <hr style={{marginTop:5,marginBottom:5}}/>
                                    {(this.props.moreSchedules && this.props.moreSchedules.isReceiving) && (
                                        <div style={{border:"1px solid black",height:300,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <div style={{marginLeft:0}}>
                                                <AppSpinnerInternal/>
                                            </div>
                                        </div>
                                    )}
                                    {(this.props.moreSchedules && !this.props.moreSchedules.isReceiving) && (
                                    <>
                                    {(this.state.pickDay) && (
                                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <Calendar
                                                  value={this.state.dateSelected}
                                                  initialDay={new Date()}
                                                  onChange={this.onDateChange}
                                                />
                                            </div>
                                    )}
                                    {(!this.state.pickDay) && (
                                    <>
                                        {(this.props.moreSchedules.data && this.props.moreSchedules.data.schedule && 
                                          this.props.moreSchedules.data.schedule.length < 1) && (
                                            <>
                                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            No appointments available.
                                            </div>
                                            <Button style={{margin:5}} onClick={this.selectDay} 
                                                color="primary" outline>Select Day</Button>
                                            </>
                                        )}
                                        {(this.props.moreSchedules.data && this.props.moreSchedules.data.schedule && 
                                          this.state.inMore === 0 && 
                                          this.props.moreSchedules.data.schedule.length > 0) && (
                                            <>
                                            <Button style={{margin:5}} onClick={this.selectDay} 
                                                color="primary" outline>Select Day</Button>
                                            <div> 
                                            <div style={{marginLeft:20}}>
                                            {this.props.moreSchedules.data.schedule.map((g) => { 
                                                return (
                                                    <Button style={{margin:5,width:100}} onClick={() => this.scheduleAppt(g)} 
                                                        color="primary">{g.time}</Button>
                                                )
                                            })}
                                            </div>
                                            </div>
                                            </>
                                        )}
                                    </>
                                    )}
                                    </>
                                    )}
                                </Card>
                            </PopoverBody>
                        </Popover>
                        </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        moreSchedules: store.moreSchedules
    }
}

export default connect(mapStateToProps)(PhysicianCard);
