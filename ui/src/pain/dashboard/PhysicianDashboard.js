import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import TrendHeroWithStats from './components/TrendHeroWithStats';

import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {getProviderDashboard} from '../../actions/providerDashboard';

class Template extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getProviderDashboard())
    }

    render() {
        return (
        <>
            {(this.props.offices && this.props.offices.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.providerDashboard && this.props.providerDashboard.data && 
              this.props.providerDashboard.data.customers) && (
                <Row md="12">
                    <Col md="3">
                        <TrendHeroWithStats data={this.props.providerDashboard.data.customers}
                            title="Clients Gained" num2title="Month" num3title="Year" 
                            num4title=""/>
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
        providerDashboard: store.providerDashboard
    }
}

export default connect(mapStateToProps)(Template);
