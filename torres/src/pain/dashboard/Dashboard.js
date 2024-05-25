import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import LegalDashboard from './LegalDashboard';
import PhysicianDashboard from './PhysicianDashboard';
import ReferrerDashboard from './ReferrerDashboard';
import BDRDashboard from './BDRDashboard';

class Dashboard extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    render() {
        return (
        <>
            <Row md="12">
                <Col md="12">
                <>
                {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('Customer')) && (
                    <UserDashboard/>
                )}
                {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('Provider')) && (
                    <PhysicianDashboard/>
                )}
                {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('Admin') &&
                  !this.props.currentUser.context) && (
                    <AdminDashboard/>
                )}
                {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('BusinessDevelopmentRepresentative') &&
                  !this.props.currentUser.context) && (
                    <BDRDashboard/>
                )}
                {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('AccountExecutive') &&
                  !this.props.currentUser.context) && (
                    <BDRDashboard/>
                )}
                {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('Legal')) && (
                    <LegalDashboard/>
                )}
                {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('Referrer')) && (
                    <ReferrerDashboard/>
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
        currentUser: store.auth.currentUser,
    }
}

export default connect(mapStateToProps)(Dashboard);
