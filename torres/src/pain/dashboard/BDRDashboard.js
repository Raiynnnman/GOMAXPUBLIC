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
import { getBDRDashboard } from '../../actions/bdrDashboard';

class BDRDashboard extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getBDRDashboard())
    }

    render() {
        return (
        <>
            {(this.props.offices && this.props.offices.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.bdrDashboard && this.props.bdrDashboard.data && 
              this.props.bdrDashboard.data.commissions) && (
                <Row md="12">
                    <Col md="3">
                        <TrendHeroWithStats data={this.props.bdrDashboard.data.commissions}
                            title="Commissions" 
                                num1isdollar={true} num2title="Paid" num2isdollar={true} 
                                num3title="Sent" num3isdollar={true} num4isdollar={true} 
                                num4title="Void"/>
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
        bdrDashboard: store.bdrDashboard
    }
}

export default connect(mapStateToProps)(BDRDashboard);
