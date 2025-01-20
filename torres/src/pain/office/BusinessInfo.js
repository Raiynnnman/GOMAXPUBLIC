import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import TemplateTextField from '../utils/TemplateTextField';
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
            <Grid container xs="12">
                <Grid item xs="12">
                    <TemplateTextField label="Practice Name / DBA" onChange={(r) => this.onChange("name",r)}/>
                </Grid>                
                <Grid item xs="12">
                    <TemplateTextField label="Corporate Name" onChange={(r) => this.onChange("business_name",r)}/>
                </Grid>                
                <Grid item xs="12">
                    <TemplateTextField label="Location Name" onChange={(r) => this.onChange("location_name",r)}/>
                </Grid>                
                <Grid item xs="12">
                    <TemplateTextField label="Address" onChange={(r) => this.onChange("address",r)}/>
                </Grid>                
                <Grid item xs="12">
                    <TemplateTextField label="Phone" onChange={(r) => this.onChange("Phone",r)}/>
                </Grid>                
                <Grid item xs="12">
                    <TemplateTextField label="Fax" onChange={(r) => this.onChange("Fax",r)}/>
                </Grid>                
                <Grid item xs="12">
                    <TemplateTextField label="Email" onChange={(r) => this.onChange("Email",r)}/>
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
