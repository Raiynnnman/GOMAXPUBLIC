import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import cx from 'classnames';
import classnames from 'classnames';
import Box from '@mui/material/Box';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import LegalDashboard from './LegalDashboard';
import PhysicianDashboard from './PhysicianDashboard';
import ReferrerDashboard from './ReferrerDashboard';
import BDRDashboard from './BDRDashboard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

class Dashboard extends Component {
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
        <Navbar/>
        <Box style={{margin:20}}>
            <Grid container xs="12">
                <>
                {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('Customer')) && (
                    <UserDashboard/>
                )}
                {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('Provider')) && (
                    <PhysicianDashboard/>
                )}
                {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('Admin') &&
                  !this.props.currentUser.context) && (
                    <AdminDashboard/>
                )}
                {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('BusinessDevelopmentRepresentative') &&
                  !this.props.currentUser.context) && (
                    <BDRDashboard/>
                )}
                {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('AccountExecutive') &&
                  !this.props.currentUser.context) && (
                    <BDRDashboard/>
                )}
                {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('Legal')) && (
                    <LegalDashboard/>
                )}
                {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('Referrer')) && (
                    <ReferrerDashboard/>
                )}
                </>
            </Grid>
        </Box>
        <Footer/>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser
    }
}

export default connect(mapStateToProps)(Dashboard);
