import React, { Component } from 'react';
import Widget from '../../components/Widget';
import { Container, Alert, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';

class ThankYou extends Component {
    constructor(props) { 
        super(props);
        this.state = { }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }


    render() {
        return (
            <div className="auth-page">
                <Container>
                    <h5 className="auth-logo">
                        <i className="la la-circle text-primary" />
                        POUNDPAIN TECH
                        <i className="la la-circle text-danger" />
                    </h5>
                    <Widget className="widget-auth mx-auto" title={<h3 className="mt-0">Welcome to POUNDPAIN TECH</h3>}>
                        <p className="widget-auth-info">
                            Thank you for registering with POUNDPAIN TECH! We will be in contact soon. 
                        </p>
                        <p className="widget-auth-info">
                            Click <a href='/#/landing'>Here</a> to exit.
                        </p>
                    </Widget>
                </Container>
            </div>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser
    }
}

export default connect(mapStateToProps)(ThankYou);
