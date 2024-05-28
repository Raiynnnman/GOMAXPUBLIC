import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import config from '../../config';
import { connect } from 'react-redux';
import { loginUser, receiveToken, doInit } from '../../actions/auth';
import jwt from "jsonwebtoken";
import getVersion from '../../version.js';
import Container from '@mui/material/Container';
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
            <div>
                <Container maxWidth="sm">
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <img width="20%" height="20%" src='/painlogo.png'/>
                    </div>
                    <p style={{textAlign:'center'}}>
                        Welcome to POUNDPAIN TECH! You will receive an email with details on how to login and get started. 
                    </p>
                    <br/>
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

