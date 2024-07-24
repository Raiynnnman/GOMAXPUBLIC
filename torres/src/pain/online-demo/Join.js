import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { TextField, Grid, Paper, Typography, Button } from '@mui/material';
import config from '../../config';
import Container from '@mui/material/Container';

import { connect } from 'react-redux';
import jwt from "jsonwebtoken";
import getVersion from '../../version.js';
import { push } from 'connected-react-router';
import translate from '../utils/translate';
import {getDemoStart} from '../../actions/demoStart';
import Navbar from '../../components/Navbar';
import InvestorMap from '../investor/InvestorMap';

class Join extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id:null,
            delay:60000, // 1m
            error_message:null,
            success:false,
            response_received:false
        };
        this.loginPage = this.loginPage.bind(this);
        this.reload = this.reload.bind(this);

    }

    componentWillReceiveProps(p) { 
        if (p.demoStart && p.demoStart.data &&
            p.demoStart.data.success === false && 
            p.demoStart.data.message && this.state.error_message === null) { 
            this.state.error_message = p.demoStart.data.message;
            this.state.response_received = true;
            this.setState(this.state);
        } 
    }

    componentDidMount() {
        var tosend = {}
        tosend.token = this.props.match.params.token
        tosend.accept = true;
        this.state.token = this.props.match.params.token;
        this.setState(this.state);
        this.reload()
    }

    reload() { 
        var tosend = {}
        tosend.token = this.props.match.params.token
        this.props.dispatch(getDemoStart(
            tosend,
            function(err,args,data) { 
                console.log("args",err,args,data);
                args.state.response_received = true;
                if (err) { 
                    args.state.message = err.message;
                    args.state.success = err.success;
                } else { 
                    args.state.message = null;
                    args.state.success = data.success;
                } 
                args.setState(args.state)
            },
        this));
        setTimeout((e) => { e.reload() }, this.state.delay, this)
    } 

    loginPage() { 
        this.props.dispatch(push('/login'));
    } 

    render() {
        console.log("p",this.props);
        console.log("s",this.state);
        return (
        <>
            <Navbar/>
            <div>
                {(this.state.response_received) && (
                <>
                    {(this.state.error_message === null && this.state.success===true) && (
                    <>
                        <InvestorMap hideNav={true} anonymous={true}/>
                    </>
                    )}
                    {(this.state.error_message !== null) && (
                    <>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <img width="20%" height="20%" src='/painlogo.png' alt='logo'/>
                    </div>
                    <p className="widget-auth-info" style={{color:'black'}}>
                        <Typography variant="h5">{translate(this.state.error_message)}</Typography>
                    <br/>
                    </p>
                    </>
                    )}
                </>
                )}
            </div>
        </>
        );
    }
}

function mapStateToProps(store) {
    return {
        demoStart: store.demoStart
    };
}

export default withRouter(connect(mapStateToProps)(Join));

