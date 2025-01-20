import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Navbar from '../../components/Navbar';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Activate from	'./Activate';
import DesignatedContacts from './DesignatedContacts';
import Hours from './Hours';
import Insurance from './Insurance';
import Introduction from './Introduction';
import Notes from './Notes';
import PatientServices from './PatientServices';
import Providers from './Providers';
import PracticeInfo from './PracticeInfo';
import Preferences from './Preferences';
import Welcome from './Welcome';
import {profileSave} from '../../actions/profileSave';
import {profileList} from '../../actions/profileList';

const steps = [
    {
        id:0,
        label: "Introduction"
    },
    {
        id:1,
        label: "Welcome to MaXpain"
    },
    {
        id:2,
        label: "Your Practice"
    },
    {
        id:3,
        label: "Onboarding Notes"
    },
    {
        id:4,
        label: "Activate"
    },
];

class Onboarding extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            active_step: 0,
            profile:{}
        }
        this.handleNext = this.handleNext.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.onSave = this.onSave.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(profileList({}));
    }

    onSave(r,t) { 
        console.log("save",r,t.target.value);
        this.state.profile[r] = t.target.value;
        this.setState(this.state)
    } 

    handleNext() {
        console.log("prof",this.state.profile);
        if (this.state.profile) { 
            this.props.dispatch(profileSave(this.state.profile));
        } 
        this.state.active_step += 1;
        this.setState(this.state)
    };

    handleBack() {
        this.state.active_step -= 1;
        this.setState(this.state)
    };

    handleReset() {
        this.state.active_step = 0;
        this.setState(this.state)
    };


    render() {
        console.log("s",this.state);
        return (
        <>
        <Navbar/>
        <Box style={{margin:20}}>
            <Grid container xs="12" justifyContent="center" alignItems="center">
                <Grid sx="12" style={{marginTop:20}}>
                <>
                    {this.state.active_step === 0 && (
                        <Welcome profile={this.state.profile} onSave={this.onSave}/>
                    )}
                    {this.state.active_step === 1 && (
                        <PracticeInfo profile={this.state.profile} onSave={this.onSave}/>
                    )}
                    {this.state.active_step === 2 && (
                        <Preferences profile={this.state.profile} onSave={this.onSave}/>
                    )}
                    {this.state.active_step === 3 && (
                        <Notes profile={this.state.profile} onSave={this.onSave}/>
                    )}
                    {this.state.active_step === 4 && (
                        <Activate profile={this.state.profile} onSave={this.onSave}/>
                    )}
                </>
                </Grid>
            </Grid>
            {(this.state.active_step < 1) && (
            <Grid container xs="12" justifyContent="center" alignItems="center">
                <Grid sx="12">
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={this.handleNext}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Continue
                      </Button>
                      <Button
                        onClick={this.handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </Grid>
            </Grid>
            )}
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
