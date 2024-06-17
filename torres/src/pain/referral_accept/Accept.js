import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import config from '../../config';
import Container from '@mui/material/Container';

import { connect } from 'react-redux';
import jwt from "jsonwebtoken";
import getVersion from '../../version.js';
import { push } from 'connected-react-router';
import translate from '../utils/translate';
import {referralResponse} from '../../actions/referralResponse';
import Navbar from '../../components/Navbar';

class Accept extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id:null,
            error_message:null,
            accepted:null,
            response_received:false
        };
        this.loginPage = this.loginPage.bind(this);

    }

    componentWillReceiveProps(p) { 
        if (p.referralResponse && p.referralResponse.data &&
            p.referralResponse.data.success === false && 
            p.referralResponse.data.message && this.state.error_message === null) { 
            this.state.error_message = p.referralResponse.data.message;
            this.state.response_received = true;
            this.setState(this.state);
        } 
    }

    componentDidMount() {
        var tosend = {}
        tosend.token = this.props.match.params.token
        tosend.accept = true;
        this.state.token = this.props.match.params.token;
        this.props.dispatch(referralResponse(tosend,function(err,args) { 
        },this));
    }

    loginPage() { 
        this.props.dispatch(push('/login'));
    } 

    render() {
        return (
        <>
            <Navbar/>
            <div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <img width="20%" height="20%" src='/painlogo.png' alt='logo'/>
                </div>
                {(this.state.response_received) && (
                <>
                <Container maxWidth="sm">
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        {(this.state.error_message === null) && (
                        <p className="widget-auth-info" style={{color:'black'}}>
                            Client accepted. Click <a onClick={this.loginPage} style={{color:"blue"}} href="/login" to see details>HERE</a> to see details
                        <br/>
                        </p>
                        )}
                        {(this.state.error_message !== null) && (
                        <>
                        <p className="widget-auth-info" style={{color:'black'}}>
                            {translate(this.state.error_message)}
                        <br/>
                        </p>
                        </>
                        )}
                    </div>
                </Container>
                </>
                )}
            </div>
        </>
        );
    }
}

function mapStateToProps(store) {
    return {
        referralResponse: store.referralResponse
    };
}

export default withRouter(connect(mapStateToProps)(Accept));

