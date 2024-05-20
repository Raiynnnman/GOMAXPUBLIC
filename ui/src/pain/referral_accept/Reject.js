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
import {referralResponse} from '../../actions/referralResponse';

class Accept extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id:null,
            accepted:null,
            error_message:null
        };
        this.loginPage = this.loginPage.bind(this);

    }

    componentWillReceiveProps(p) { 
        console.log("p",this.props);
        if (p.match && p.match.params && p.match.params.id && this.state.accepted === null) { 
        } 
    }

    componentDidMount() {
        var tosend = {}
        tosend.token = this.props.match.params.token
        tosend.accept = false;
        this.state.token = this.props.match.params.token;
        this.props.dispatch(referralResponse(tosend,function(err,args) { 
            console.log(err,args);
        },this));
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
                    <Widget style={{backgroundColor:"black"}} className="widget-auth mx-auto" title={<h3 style={{color:'white'}} className="mt-0">Client Accepted!</h3>}>
                        <p className="widget-auth-info" style={{color:'white'}}>
                            Thank you for submitting your response.
                        <br/>
                        </p>
                    </Widget>
                </Container>
            </div>
        );
    }
}

function mapStateToProps(store) {
    return {
        referralResponse: store.referralResponse
    };
}

export default withRouter(connect(mapStateToProps)(Accept));

