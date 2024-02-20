import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import config from '../../config';
import { connect } from 'react-redux';
import { Container, Alert, Button } from 'reactstrap';
import Widget from '../../components/Widget';
import { loginUser, receiveToken, doInit } from '../../actions/auth';
import jwt from "jsonwebtoken";
import microsoft from '../../images/microsoft.png';
import getVersion from '../../version.js';
import { push } from 'connected-react-router';
import translate from '../utils/translate';

class Welcome extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
        this.loginPage = this.loginPage.bind(this);

    }

    componentDidMount() {
    }

    loginPage() { 
        this.props.dispatch(push('/login'));
    } 

    render() {
        return (
            <div className="auth-page">
                <Container>
                    <h5 className="auth-logo">
                        <i className="la la-circle text-primary" />
                        Direct Health Delivery
                        <i className="la la-circle text-danger" />
                    </h5>
                    <Widget className="widget-auth mx-auto" title={<h3 className="mt-0">Welcome to DirectHealth Delivery</h3>}>
                        <p className="widget-auth-info">
                            Welcome to Direct Health Delivery! You will receive an email with details on how to login and get started. 
                        <br/><Button color="primary" style={{marginTop:20}} onClick={this.loginPage}>Login</Button>
                        </p>
                    </Widget>
                </Container>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
    };
}

export default withRouter(connect(mapStateToProps)(Welcome));

