import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Navbar from '../../components/Navbar';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getAppointments }  from '../../actions/appointments';


class Template extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected:null
        }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        console.log("p",this.props);
        if (this.props.match.params && this.props.match.params.id) { 
            this.state.selected = this.props.match.params.id;
            this.setState(this.state);
            this.props.dispatch(getAppointments({id: this.state.selected}));
        } else { 
            this.props.dispatch(getAppointments({}));
        } 
    }


    render() {
        console.log("p",this.props);
        return (
        <>
        <Navbar/>
        <Box style={{margin:20}}>
            <Grid container xs="12">
                {(this.state.selected === null) && (
                    <h1>entries here</h1>
                )}
                {(this.state.selected !== null) && (
                    <h1>apptinfohere</h1>
                )}
            </Grid>
        </Box>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        appointments: store.appointments
    }
}

export default connect(mapStateToProps)(Template);
