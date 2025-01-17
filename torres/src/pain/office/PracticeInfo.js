import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Navbar from '../../components/Navbar';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import TemplateTextField from '../utils/TemplateTextField';
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
import BusinessInfo from './BusinessInfo';
import Preferences from './Preferences';
import Welcome from './Welcome';
import {profileSave} from '../../actions/profileSave';
import {profileList} from '../../actions/profileList';


const steps = [
    {
        id:0,
        label: "Business Info"
    },
    {
        id:1,
        label: "Hours"
    },
    {
        id:2,
        label: "Providers"
    },
    {
        id:3,
        label: "Contacts"
    },
    {
        id:4,
        label: "Preferences"
    },
    {
        id:5,
        label: "Insurance"
    },
]

class PracticeInfo extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            active_step: 0,
            selected: null
        }
        this.onChange = this.onChange.bind(this);
        this.editLocation = this.editLocation.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handleBack = this.handleBack.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    editLocation(r)  {
        if (!r) { 
            this.state.selected = {}
        } 
        this.setState(this.state);
    }

    onChange(r,t) { 
        this.props.onSave(r,t);
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


    render() {
        console.log("p",this.props);
        console.log("s",this.state);
        return (
        <>
        <Box style={{margin:20}}>
        <>
            {(this.props.profileList && this.props.profileList.data && this.state.selected === null) && (
            <>
            <Grid container xs="12">
                <Grid item xs="11">
                <h1>Existing locations here</h1>
                {(this.props.profileList.data.map((e) => {
                    return (
                    <Grid item xs="3">
                        me
                    </Grid>
                    )
                }))}
                </Grid>
                <Grid item xs="1" style={{borderLeft:"1px solid black"}}>
                      <Button
                        variant="contained"
                        onClick={() => this.editLocation()}
                        sx={{ width:300, mt: 1 }}
                      >
                        Add 
                      </Button>
            
                </Grid>
            </Grid>
            </>
            )}
            {(this.state.selected !== null) && (
            <>
            <Grid container xs="12">
                <Grid item xs="12">
                  <Stepper activeStep={this.state.active_step} >
                    {steps.map((step, index) => (
                      <Step key={step.id}>
                        <StepLabel>
                            {step.label}
                        </StepLabel>
                        <StepContent>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </Grid>                
            </Grid>                
            <Grid container xs="12">
                <Grid item xs="12">
                    {this.state.active_step === 0 && (
                        <BusinessInfo profile={this.state.profile} onSave={this.onSave}/>
                    )}
                    {this.state.active_step === 1 && (
                        <Hours profile={this.state.profile} onSave={this.onSave}/>
                    )}
                    {this.state.active_step === 2 && (
                        <Providers profile={this.state.profile} onSave={this.onSave}/>
                    )}
                    {this.state.active_step === 3 && (
                        <DesignatedContacts profile={this.state.profile} onSave={this.onSave}/>
                    )}
                    {this.state.active_step === 4 && (
                        <PatientServices profile={this.state.profile} onSave={this.onSave}/>
                    )}
                    {this.state.active_step === 5 && (
                        <Insurance profile={this.state.profile} onSave={this.onSave}/>
                    )}
                </Grid>                
            </Grid>                
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
            </>
            )}
        </>
        </Box>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        profileSave: store.profileSave,
        profileList: store.profileList,
    }
}

export default connect(mapStateToProps)(PracticeInfo);
