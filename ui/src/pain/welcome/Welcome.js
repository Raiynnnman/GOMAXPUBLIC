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
            <div style={{backgroundColor:"black",color:"white"}} className="auth-page">
                <Container>
                    <div style={{backgroundColor:'black',display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <img width="20%" height="20%" src='/painlogo.png'/>
                    </div>
                    <Widget style={{backgroundColor:"black"}} className="widget-auth mx-auto" title={<h3 style={{color:'white'}} className="mt-0">Welcome to POUNDPAIN TECH</h3>}>
                        <p className="widget-auth-info" style={{color:'white'}}>
                            Welcome to POUNDPAIN TECH! You will receive an email with details on how to login and get started. 
                        <br/>
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

