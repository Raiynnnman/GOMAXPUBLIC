import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import config from '../../config';
import { connect } from 'react-redux';
import Container from '@mui/material/Container';
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
            accepted:null,
            error_message:null
        };
        this.loginPage = this.loginPage.bind(this);

    }

    componentWillReceiveProps(p) { 
        if (p.match && p.match.params && p.match.params.id && this.state.accepted === null) { 
        } 
    }

    componentDidMount() {
        var tosend = {}
        tosend.token = this.props.match.params.token
        tosend.accept = false;
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
            <Container>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <img width="20%" height="20%" src='/painlogo.png'/>
                </div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Container maxWidth="sm"> 
                    <p style={{color:'black'}}>
                        Thank you for submitting your response.
                    <br/>
                    </p>
                </Container>
                </div>
            </Container>
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

