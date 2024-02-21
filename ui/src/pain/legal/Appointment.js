import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import moment from 'moment';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import Calendar from 'react-calendar';
import { Chrono } from "react-chrono";
import s from '../office/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { Form, FormGroup, Label, Input, InputGroup, InputGroupText } from 'reactstrap';

import 'react-calendar/dist/Calendar.css';

class Appointment extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            dateSelected:'',
            dateLoaded:'',
            showAllTimes:true,
            loaded: false,
            updated:false,
            items:[]
        }
        this.onSelected = this.onSelected.bind(this);
        this.toggleAllTimes = this.toggleAllTimes.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
        this.state.dateSelected = p.dateSelected
        this.setState(this.state)
    }

    componentDidMount() {
        this.state.dateSelected = this.props.dateSelected
        this.setState(this.state)
    }

    addAppointment(day,number,time,id) { 
    }

    removeAppointment(day,number,time,id) { 
    }

    toggleAllTimes() { 
        this.state.showAllTimes = !this.state.showAllTimes;
        this.state.updated = false;
        this.setState(this.state)
    } 

    onDateChange(e,t) {
        var j = new Date(e);
        var q = j.toDateString()
        this.state.dateSelected = q.substring(0,15);
        this.props.onDateChange(e)
        this.setState(this.state)
    } 

    onSelected(e,t) { 
        this.props.onSelected(e,t);
        this.state.loaded=true;
        this.setState(this.state)
    } 

    render() {
        if (!this.props.data.schedule) { return (<></>) }
        if (this.state.dateSelected !== this.state.dateLoaded) { 
            this.state.items = []
            if (this.props.data.schedule.length < 1 || this.props.data.schedule[0].schedule.length < 1) { 
                this.state.dateLoaded = this.state.dateSelected;
                this.setState(this.state);
                return (<></>)
            }
            var d1 = '';
            if (this.props.data.schedule[0].schedule.day) { 
                d1 = this.props.data.schedule[0].schedule.day
            } else { 
                d1 = this.props.data.schedule[0].schedule[0].day
            } 
            var d2 = this.state.dateSelected
            var gg = new Date(d1 + "T00:00");
            var q = gg.toDateString()
            d1 = q.substring(0,15);
            if (d1 !== d2) { return(<></>); }
            this.state.dateLoaded = d1
            this.state.dateSelected = d2
            var c = 0;
            for (c = 0; c < this.props.data.schedule.length;c++) { 
                var t = this.props.data.schedule[c]
                var bg = "white";
                var d = 0
                for (d = 0; d < t.schedule.length; d++) { 
                    var q = t.schedule[d];
                    if (!this.state.showAllTimes) { 
                        var g = moment().startOf('day');
                        var s = q.time.split(':')
                        g = g.add('hours',parseInt(s[0]))
                        g = g.add('minutes',parseInt(s[1]))
                        var o = moment()
                        //if (g.isBefore(o)) { continue; }
                    } 
                    var i = {
                        title:q.time,
                        appt_id: q.id
                    }
                    if (q.appt && q.appt.customer && q.appt.customer.email) { 
                        i['cardTitle'] = "Appointment: " + q.appt.customer.first_name + " " + q.appt.customer.last_name;
                        i['cardDetailedText'] = q.appt.physician.title + " " + q.appt.physician.first_name + " " + 
                            q.appt.physician.last_name + " appointment with " + q.appt.customer.first_name + " " + q.appt.customer.last_name;
                    } else { 
                        continue
                        //i['cardTitle'] = "Open: " + t.first_name + " " + t.last_name;
                        //i['cardDetailedText'] = "Open booking"
                    }  
                    this.state.items.push(i);
                }
            } 
            this.state.updated = true;
            this.setState(this.state);
        }
        return (
        <>
            <Row md="12">
                <Col md="4"></Col>
                <Col md="6">
                    <div style={{height:10,display: 'flex', alignItems: 'center', justifyContent: 'center',textAlign:"left"}}>
                        <h5>{this.state.dateSelected}</h5>
                    </div>
                </Col>
            </Row>
            <hr/>
            <Row md="12" style={{marginTop:10}}>
                <Col md="4">
                        <Calendar
                          value={this.state.dateSelected}
                          initialDay={new Date()}
                          onChange={this.onDateChange}
                        />
                </Col>                
                <Col md="6">
                    {(this.state.items && this.state.items.length > 0) && (
                        <>
                        <Chrono activeItemIndex={this.state.items.length+1} 
                            onItemSelected={this.onSelected} scrollable cardHeight={100} 
                            hideControls={true}
                            items={this.state.items} mode='VERTICAL_ALTERNATING'/>
                        </>
                    )}
                    {(this.state.items && this.state.items.length < 1) && (
                        <div 
                            style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center',textAlign:"center"}}>
                            <h4>No appointments scheduled for this time</h4>
                        </div>
                    )}
                </Col>                
            </Row>
            <Row md="12">
                <Col md="4">
                    <>
                    {(this.props.data && this.props.data.upcoming && this.props.data.upcoming.length > 0) && (
                        <div>
                            {this.props.data.upcoming.map((e) => { 
                                return (
                                <Row md="12" style={{marginTop:10}}>
                                    <Col md="12">
                                        <Card style={{height:100}} className="mb-xlg border-1">
                                            <CardBody>
                                                <Row md="12">
                                                    <Col md="12">
                                                        <h5>Upcoming Appointment</h5>
                                                    </Col>
                                                </Row>
                                                <Row md="12">
                                                    <Col md="12">
                                                        <h6>{e.schedule[0].day} @ {e.schedule[0].time}</h6>
                                                    </Col>
                                                </Row>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                                )
                            })}
                        </div>
                    )}
                    </>
                </Col>
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser
    }
}

export default connect(mapStateToProps)(Appointment);
