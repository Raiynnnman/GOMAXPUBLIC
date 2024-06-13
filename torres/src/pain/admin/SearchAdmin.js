import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Box, Grid, Typography, TextField, Paper, CircularProgress, Card, CardContent } from '@mui/material';
import Navbar from '../../components/Navbar';
import { push } from 'connected-react-router';
import { toast } from 'react-toastify';
import AppSpinner from '../utils/Spinner';
import { getProviderSearchAdmin } from '../../actions/providerSearchAdmin';
import { searchConfig } from '../../actions/searchConfig';
import { searchCheckRes } from '../../actions/searchCheckRes';
import { searchRegisterAdmin } from '../../actions/searchRegisterAdmin';
import UserRegistration from './UserRegistration';
import PhysicianCard from '../search/PhysicianCard';

class SearchAdmin extends Component {
    state = {
        mylocation: null,
        selected: 0,
        geo: false,
        selectedProcedure: 0,
        error_message: null,
        selectedProvider: null,
        selectedProviderType: null,
        selectedAppt: null,
        apptBooked: false,
        error: '',
        zipchange: false,
        zipcode: ''
    };

    componentDidMount() {
        this.setState({ geo: true });
        this.props.dispatch(searchConfig({}));
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.setLocation(position.coords.latitude, position.coords.longitude);
                },
                this.getWithoutPermission
            );
        } else {
            this.setState({ geo: false });
        }
    }

    changeZip = (e) => {
        const zipcode = e.target.value;
        this.setState({ zipchange: true, zipcode });
        if (zipcode.length === 5) {
            this.props.dispatch(getProviderSearchAdmin({
                type: this.state.selectedProviderType,
                all: true,
                zipcode
            }));
        }
    };

    updateAppt = (e, t) => {
        this.setState({ apptBooked: true, selectedAppt: { ...e, schedule: t } });
    };

    scheduleAppt = (p, e) => {
        this.setState({ selectedAppt: p });
    };

    setProviderType = (e) => {
        this.setState({ selectedProviderType: e });
        this.props.dispatch(getProviderSearchAdmin({
            type: e,
            location: this.state.mylocation
        }));
    };

    setZip = (lat, lon) => {
        this.setState({ mylocation: { lat, lon } });
    };

    cancel = () => {
        this.setState({
            selectedAppt: null,
            selectedProviderType: null,
            zipcode: null,
            error_message: null
        });
        this.props.dispatch(getProviderSearchAdmin({}));
    };

    register = (e, d) => {
        const params = { ...e, office_type_id: this.state.selectedProviderType };
        if (this.state.selectedAppt && this.state.selectedAppt.id) {
            params.office_id = this.state.selectedAppt.id;
        }
        this.props.dispatch(searchRegisterAdmin(params, (err, args) => {
            if (err && err.message) {
                this.setState({ error_message: err.message });
                return;
            }
            this.props.dispatch(getProviderSearchAdmin({}));
            toast.success('Successfully saved user to queue.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true
            });
            this.cancel();
        }));
    };

    setLocation = (lat, lon) => {
        this.setState({ mylocation: { lat, lon } });
    };

    getWithoutPermission = () => {
        this.setState({ geo: false });
    };

    login = () => {
        this.props.dispatch(push('/login'));
    };

    aboutus = () => {
        window.open('https://poundpain.com/about-us', '_blank', 'noreferrer');
    };

    setProcedure = (e) => {
        this.setState({ selectedProcedure: e.target ? e.target.value : e.value }, this.searchOffices);
    };

    searchOffices = () => {
        const { zipcode, selectedProcedure, mylocation, selected } = this.state;
        if (zipcode.length !== 5) {
            this.setState({ error: 'Please enter a 5 digit zipcode.' });
            return;
        }
        if (selectedProcedure === 0) {
            this.setState({ error: 'Please select a procedure.' });
            return;
        }
        this.props.dispatch(getProviderSearchAdmin({
            procedure: selectedProcedure,
            location: mylocation,
            all: true,
            selected,
            zipcode
        }));
    };

    render() {
        const { providerSearchAdmin, searchConfig } = this.props;
        const { selectedAppt, selectedProviderType, zipcode, error_message } = this.state;

        return (
            <>
                <Navbar />
                <Box sx={{ margin: 12 }}>
                    {(providerSearchAdmin?.isReceiving || this.props.searchRegisterAdmin?.isReceiving || this.props.searchCheckRes?.isReceiving) && (
                        <AppSpinner />
                    )}
                    {selectedProviderType && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <TextField
                                label="Zip"
                                value={zipcode}
                                onChange={this.changeZip}
                                required
                                sx={{ width: '300px' }}
                            />
                        </Box>
                    )}
                    {searchConfig?.data?.types && !selectedProviderType && (
                        <Grid container spacing={2} justifyContent="center" my={3}>
                            {searchConfig.data.types.map((type) => (
                                <Grid item xs={12} sm={6} md={4} key={type.id} onClick={() => this.setProviderType(type.id)} sx={{ cursor: 'pointer' }}>
                                    <Paper
                                        sx={{
                                            p: 4,
                                            textAlign: 'center',
                                            borderRadius: 5,
                                            transition: '0.3s',
                                            ':hover': {
                                                boxShadow: '0 8px 16px rgba(255, 165, 0, 0.6)',
                                            },
                                            height: '350px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.25rem',
                                            fontWeight: 'bold',
                                            bgcolor: 'white',
                                        }}
                                    >
                                        <Typography variant="h6">{type.description}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                    {providerSearchAdmin?.data?.providers && providerSearchAdmin.data.providers.length > 0 && !selectedAppt && (
                        <Grid container spacing={2}>
                            {providerSearchAdmin.data.providers.map((provider) => (
                                <Grid item xs={12} sm={6} md={4} key={provider.id}>
                                    <PhysicianCard onScheduleAppt={this.scheduleAppt} provider={provider} />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                    {providerSearchAdmin?.data?.providers?.length < 1 && selectedProviderType && !selectedAppt && (
                        <Box textAlign="center" my={3}>
                            <Typography variant="h6">There are currently no service providers in this area.</Typography>
                        </Box>
                    )}
                    {(selectedAppt === null && providerSearchAdmin?.data?.providers && providerSearchAdmin.data.providers.length < 1 && selectedProviderType !== null && !zipcode) && (
                        <Grid container>
                            <Grid item xs={12}>
                                <UserRegistration error_message={error_message} data={selectedAppt} onCancel={this.cancel} onRegister={this.register} />
                            </Grid>
                        </Grid>
                    )}
                    {selectedAppt && (
                        <Grid container justifyContent="center">
                            <Grid item xs={12} md={8}>
                                <UserRegistration error_message={error_message} data={selectedAppt} onCancel={this.cancel} onRegister={this.register} />
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </>
        );
    }
}

const mapStateToProps = (store) => ({
    currentUser: store.auth.currentUser,
    searchConfig: store.searchConfig,
    providerSearchAdmin: store.providerSearchAdmin,
    searchRegisterAdmin: store.searchRegisterAdmin,
    searchCheckRes: store.searchCheckRes
});

export default connect(mapStateToProps)(SearchAdmin);
