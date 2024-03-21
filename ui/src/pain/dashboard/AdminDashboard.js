import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import Widget from '../../components/Widget';

import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getAdminDashboard } from '../../actions/adminDashboard';
import TrendHeroWithStats from './components/TrendHeroWithStats';
import MainChart from './components/charts/MainChart';

class AdminDashboard extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getAdminDashboard())
    }

    render() {
        return (
        <>
            {(this.props.adminDashboard && this.props.adminDashboard.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.adminDashboard && this.props.adminDashboard.data && this.props.adminDashboard.data.visits) && (
            <>
            <Row md="12">
                <>
                <Col md="3">
                    <TrendHeroWithStats data={this.props.adminDashboard.data.visits}
                        title="Visits Today" num2title="Logins Today" num3title="Conversion" num3ispercent={true}
                        num4title="Appointments"/>
                </Col>
                <Col md="3">
                    <TrendHeroWithStats data={this.props.adminDashboard.data.revenue_month}
                        title="PAIN Revenue this month" num1isdollar={true} 
                        num2title="Providers" num2isdollar={true} num3title="Clients" num3ispercent={false}
                        num4title="Bookings"/>
                </Col>
                </>
                <Col md="3">
                    <TrendHeroWithStats data={this.props.adminDashboard.data.lead_status}
                        title="Network Information" num1isdollar={false} num2title="Preferred" num2isdollar={false} 
                            num3title="In-Network" num3isdollar={false} num4title="Potential"/>
                </Col>
                <Col md="3">
                    <TrendHeroWithStats data={this.props.adminDashboard.data.traffic}
                        title="Traffic Stats" num1isdollar={false} num2title="Today" num2isdollar={false} 
                            num3title="Month" num3isdollar={false} num4title="Year"/>
                </Col>
            </Row>
            </>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        adminDashboard: store.adminDashboard
    }
}

export default connect(mapStateToProps)(AdminDashboard);
