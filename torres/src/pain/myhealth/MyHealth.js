import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Grid } from 'reactstrap';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import Calendar from '../dashboard/components/calendar/Calendar';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import MyHealthInfo from './MyHealthInfo';

class MyHealth extends Component {
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
            {(this.props.offices && this.props.offices.isReceiving) && (
                <AppSpinner/>
            )}
            <Grid md="12">
                <Grid item  md="12">
                    <MyHealthInfo/>
                </Grid>
            </Grid>
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

export default connect(mapStateToProps)(MyHealth);
