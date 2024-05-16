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
import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import AppSpinnerInternal from '../utils/SpinnerInternal';
import { getMoreSchedules } from '../../actions/moreSchedules';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { isValidDate } from '../utils/validationUtils';
import formatPhoneNumber from '../utils/formatPhone';

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
        if (this.state.selected === null && np.provider && np.provider.about) { 
            this.state.selected = np.provider;
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
            id: this.props.provider.phy_id
        }
        this.state.lastMore = this.props.provider.phy_id;
        this.props.dispatch(getMoreSchedules(params));
        this.state.more[this.props.provider.phy_id] = false;
        this.state.inMore = this.props.provider.phy_id;
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
        this.props.onScheduleAppt(this.props.provider,e)
    } 

    getDate() { 
        var j = new Date();
        var q = j.toDateString()
        return q.substring(0,10);
    } 

    render() {
        if (this.state.inMore > 0 && !this.props.moreSchedules.isReceiving)  {
            this.state.more[this.props.provider.phy_id] = true;
            this.state.inMore = 0;
            this.setState(this.state)
        } 
        return (
        <>
        {(this.props.provider) && (
            <Card style={{
                margin:20,height:410,
                borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}} className="mb-xlg border-1">
                <CardBody>
                    <Row md="12">
                        <Col md="12">
                            <font style={{fontSize:"12pt",fontWeight:"bold"}}>
                            {this.props.provider.office_name} 
                            </font>
                            <br/>
                            <font style={{fontSize:"12pt",fontWeight:"bold"}}>
                            {this.props.provider.profile.title ? this.props.provider.profile.title + " ": ''} 
                            {this.props.provider.profile.first_name + " " + 
                                this.props.provider.profile.last_name}
                            </font>
                            <br/>
                            {(this.props.provider.rating === 5) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.provider.rating >= 4) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.provider.rating >= 3 && this.props.provider.rating < 4) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.provider.rating >= 2 && this.props.provider.rating < 3) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.provider.rating >= 1 && this.props.provider.rating < 2) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.provider.rating >= 0 && this.props.provider.rating < 1) && (
                            <>
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {this.props.provider.rating.toFixed(1)}
                        </Col>
                        <Col md="2"></Col>
                        <Col md="4" class="pull-right">
                        </Col>
                    </Row>
                    <hr/>
                    <div style={{height:130,marginBottom:10,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <>
                        {(this.props.provider.headshot) && (<img style={{width:140,height:130,objectFit:"fill"}} src={this.props.provider.headshot}/>)}
                        {(!this.props.provider.headshot) && (<img style={{width:140,height:130,objectFit:"fill"}} src="/headshot.png"/>)}
                    </>
                    </div>
                    <Row md="12"> <Col md="12">{this.props.provider.miles.toFixed(2)} miles</Col> </Row>
                    <Row md="12"> <Col md="12">
                            {this.props.provider.addr.addr1}
                        </Col> 
                    </Row>
                    <Row md="12">
                        <Col md="12">
                            {this.props.provider.addr.city ? this.props.provider.addr.city : ''},&nbsp;
                            {this.props.provider.addr.state? this.props.provider.addr.state:''}&nbsp;
                            {this.props.provider.addr.zipcode ? this.props.provider.addr.zipcode : ''}
                        </Col> 
                    </Row>
                    <Row md="12">
                        <Col md="12">
                            {formatPhoneNumber(this.props.provider.profile.phone)}
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
                            <div style={{height:30,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <Button color="primary" onClick={this.scheduleAppt}>Book</Button>
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
