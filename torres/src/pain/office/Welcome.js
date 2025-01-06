import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Navbar from '../../components/Navbar';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';

class Onboarding extends Component {
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
        <Box style={{margin:20}}>
            <Grid container xs="12" justifyContent="center" alignItems="center">
                <Grid item xs="6" justifyContent="center" alignItems="center">
                    <h4>You are now part of the Nation’s only digital platform connecting an exclusive network of Providers, attorneys and medical facilities with large population of end users in need.  The digital onboarding process takes from 7-14 days depending on size of your practice and market area.</h4>
                </Grid>
            </Grid>
            <Grid container xs="12" justifyContent="center" alignItems="center">
                <Grid item xs="6" justifyContent="center" alignItems="center">
                    <h4>What you can expect next:</h4>
                </Grid>
            </Grid>
            <Grid container xs="12" justifyContent="center" alignItems="center">
                <Grid item xs="6" justifyContent="center" alignItems="center">
                <ul>
                    <li>Confirmation of all correct important practice information</li>
                    <li>Platform software location optimization</li>
                    <li>Integration with your scheduling platform</li>
                    <li>Test patient scheduling/Referral communication test</li>
                    <li>App/Email/Cell/Whatsapp Notification Test</li>
                    <li>LIVE! Status confirmation</li>
                    <li>First patient (first patient referral may come prior to onboarding completion)</li>
                </ul>
                </Grid>
            </Grid>
        </Box>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser
    }
}

export default connect(mapStateToProps)(Onboarding);
