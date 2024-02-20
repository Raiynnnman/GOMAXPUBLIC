import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {getUser} from '../../actions/user';
import cx from 'classnames';
import classnames from 'classnames';

import Calendar from '../dashboard/components/calendar/Calendar';
import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import UserAppointments from './UserAppointments';

class MyHealthInfo extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            geo: false,
            activeTab: "appointments"
        }
        this.toggleTabs = this.toggleTab.bind(this);
        this.setLocation = this.setLocation.bind(this);
        this.getWithoutPermission = this.getWithoutPermission.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    getWithoutPermission(e,t) { 
        this.state.geo = false;
        this.setState(this.state);
        this.props.dispatch(getUser({}));
    } 

    componentDidMount() {
        this.state.geo = true;
        this.setState(this.state)
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
              this.state.geo = false;
              this.setState(this.state)
              var params = {location:{lat:position.coords.latitude,lon:position.coords.longitude }}
              this.props.dispatch(getUser(params));
              this.setLocation(position.coords.latitude, position.coords.longitude);
            },this.getWithoutPermission);
        } else {
            this.props.dispatch(getUser({}))
            this.state.geo = false;
            this.setState(this.state)
        }
    }
    toggleTab(e) { 
        this.state.activeTab = e;
        this.setState(this.state);
    } 

    setLocation(lat,lon) {
        this.state.mylocation={lat:lat,lon:lon}
        this.setState(this.state);
    }

    render() {
        return (
        <>
            {(this.props.user && this.props.user.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.state.geo) && (
                <AppSpinner/>
            )}
            {(this.props.user && this.props.user.data && this.props.user.data.invoices && 
            <Row md="12">
                <Col md="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'appointments' })}
                                onClick={() => { this.toggleTab('appointments') }}>
                                <span>{translate('Appointments')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                        <TabPane tabId="appointments">
                            <UserAppointments/>
                        </TabPane>
                    </TabContent>
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
        user: store.user,
    }
}

export default connect(mapStateToProps)(MyHealthInfo);
