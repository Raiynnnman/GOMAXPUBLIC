import React, { Component } from 'react';
import { push } from 'connected-react-router';
import { Button } from 'reactstrap'; 
import moment from 'moment';
import { connect } from 'react-redux';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import BootstrapTable from 'react-bootstrap-table-next';
import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {getUserDashboard} from '../../actions/userDashboard';
import Appointment from '../myhealth/Appointment.js';
import AliceCarousel from 'react-alice-carousel';
import { getProcedures } from '../../actions/procedures';
import { createRoom } from '../../actions/createRoom';

class UserDashboard extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            mylocation:null,
            geo: false,
            sent: false
        }
        this.getWithoutPermission = this.getWithoutPermission.bind(this);
        this.setLocation = this.setLocation.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    getWithoutPermission(e,t) { 
        this.state.geo = false;
        this.setState(this.state);
        var params = { future: true }
        this.props.dispatch(getUserDashboard(params));
    } 

    componentDidMount() {
        if ("geolocation" in navigator) {
            this.state.geo = true
            this.setState(this.state);
            navigator.geolocation.getCurrentPosition((position) => {
              this.state.geo = false
              this.setState(this.state);
              var params = {future:true,location:{lat:position.coords.latitude,lon:position.coords.longitude }}
              this.props.dispatch(getUserDashboard(params));
              this.setLocation(position.coords.latitude, position.coords.longitude);
            },this.getWithoutPermission);
        } else {
            this.props.dispatch(getUserDashboard({}))
        }
    }

    onNewChat(e) { 
        var params = {
            to:e.phy_id,
            appt_id:e.schedule_id
        }
        this.props.dispatch(createRoom(params,function(err,args,data) { 
            localStorage.setItem("chatroom",JSON.stringify(data));
            args.props.dispatch(push('/app/main/myhealth/chat'))
            args.state.sent = true;
            args.setState(args.state);
        },this));
    } 

    setLocation(lat,lon) {
        this.state.mylocation={lat:lat,lon:lon}
        this.setState(this.state);
    }

    pay(row) { 
        window.open(row.invoice_pay_url, '_blank', 'noreferrer')
    } 

    getTotal(r) { 
        var c = 0;
        var sum = 0;
        for (c; c < r.length; c++) { 
            sum = sum + (r[c].quantity * r[c].price);
        } 
        return sum.toFixed(2)
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
                items: 2, 
                itemsFit: 'contain'
            },
        };
        return (
        <>
            {(this.props.userDashboard && this.props.userDashboard.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.createRoom && this.props.createRoom.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.state.geo) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <h3>Appointments</h3>
            </Row>
            <Row md="12">
                <>
                <Col md="12">
                {(this.props.userDashboard && this.props.userDashboard.data && this.props.userDashboard.data.appt && this.props.userDashboard.data.appt.length > 0) && (
                    <>
                    {this.props.userDashboard.data.appt.sort((a,b) => (a.created > b.created ? 1:-1)).map((e) => { 
                        return (
                            <Col md={window.innerWidth <= 1024 ? "8" : "6"}>
                                <Appointment onNewChat={() => this.onNewChat(e)} chat={true} data={e}/>
                            </Col>                
                        )
                    })}
                    </>
                )}
                {(this.props.userDashboard && this.props.userDashboard.data && this.props.userDashboard.data.appt && this.props.userDashboard.data.appt.length < 1) && (
                    <div>
                    <h4>No appointments scheduled</h4>
                    </div>
                )}
                </Col>
                </>
            </Row>
            <Row md="12">
                <Col md="12">
                </Col>                
            </Row>
            <Row md="12" style={{marginTop:20}}>
                <h3>Invoices</h3>
            </Row>
            <Row md="12">
                {(this.props.userDashboard && this.props.userDashboard.data && this.props.userDashboard.data.invoices && this.props.userDashboard.data.invoices.length > 0) && (
                <>
                {this.props.userDashboard.data.invoices.map((e) => { 
                    return ( 
                        <Col md={window.innerWidth < 1024 ? "8": "4"}>
                            <Card style={{borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px",height:175}} className="mb-xlg border-1">
                                <CardBody>
                                    <Row md="12">
                                        <Col md="12">
                                            {e.title + " " + e.first_name + " " + e.last_name}
                                        </Col>
                                    </Row>
                                    <Row md="12">
                                        <Col md="12">
                                            {e.subprocedure_name}
                                        </Col>
                                    </Row>
                                    <Row md="12">
                                        <Col md="12">
                                            {moment(e.day + " " + e.time).format('LLL')}
                                        </Col>
                                    </Row>
                                    <Row md="12">
                                        <Col md="12">
                                            ${this.getTotal(e.items)}
                                        </Col>
                                    </Row>
                                    <hr/>
                                    <Row md="12">
                                        <Col md="6">
                                            <Button onClick={() => this.pay(e)} 
                                                style={{marginRight:5,height:35,width:90}} color="primary">Pay</Button>
                                        </Col>
                                        <Col md="3">
                                            {/*<Button onClick={() => this.edit(row)} 
                                                style={{marginRight:5,height:35,width:90}} color="primary">Details</Button>*/}
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    )
                })}
                </>
                )}
                {(this.props.userDashboard && this.props.userDashboard.data && this.props.userDashboard.data.invoices && this.props.userDashboard.data.invoices.length < 1) && (
                    <div>
                    <h4>No invoices to show</h4>
                    </div>
                )}
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        userDashboard: store.userDashboard,
        createRoom: store.createRoom
    }
}

export default connect(mapStateToProps)(UserDashboard);
