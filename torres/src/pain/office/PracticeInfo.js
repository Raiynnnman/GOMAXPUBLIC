import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Navbar from '../../components/Navbar';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import TemplateTextField from '../utils/TemplateTextField';

class PracticeInfo extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
        this.onChange = this.onChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    onChange(r,t) { 
        this.props.onSave(r,t);
    }


    render() {
        return (
        <>
        <Box style={{margin:20}}>
            <Grid container xs="12">
                <Grid item xs="12">
                    <TemplateTextField label="Practice Name / DBA" onChange={(r) => this.onChange("name",r)}/>
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

export default connect(mapStateToProps)(PracticeInfo);
