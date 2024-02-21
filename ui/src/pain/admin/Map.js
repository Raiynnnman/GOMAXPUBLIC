import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getOffices } from '../../actions/offices';

class Map extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "office"
        }
        this.toggleTab = this.toggleTab.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getOffices({page:0,limit:10000}))
    }

    toggleTab(e) { 
        this.state.activeTab = e;
    } 

    render() {
        return (
        <>
            {(this.props.offices && this.props.offices.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                </Col>                
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        offices: store.offices
    }
}

export default connect(mapStateToProps)(Map);
