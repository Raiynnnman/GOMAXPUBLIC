import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { Box, Grid, Typography, TextField, Paper, CircularProgress } from '@mui/material';
import Navbar from '../../components/Navbar';
import { push } from 'connected-react-router';
import PhysicianCard from './PhysicianCard';
import UserRegistration from './UserRegistration';
import { getProviderSearch } from '../../actions/providerSearch';
import { searchConfig } from '../../actions/searchConfig';
import { searchCheckRes } from '../../actions/searchCheckRes';
import { searchRegister } from '../../actions/searchRegister';

class SearchAdmin extends Component {
    state = {
        mylocation: null,
        selected: 0,
        geo: false,
        selectedProcedure: 0,
        selectedProvider: null,
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
            navigator.geolocation.getCurrentPosition((position) => {
                this.setLocation(position.coords.latitude, position.coords.longitude);
            }, this.getWithoutPermission);
        } else {
            this.setState({ geo: false });
        }
    }

    changeZip = (e) => {
        const zipcode = e.target.value;
        this.setState({ zipchange: true, zipcode });
        if (zipcode.length === 5) {
            this.props.dispatch(getProviderSearch({ type: this.state.selectedProvider, zipcode }));
        }
    };

    updateAppt = (e, t) => {
        this.setState({ apptBooked: true, selectedAppt: { ...e, schedule: t } });
    };

    scheduleAppt = (provider, e) => {
        this.setState({ selectedAppt: provider });
        const params = { id: e.id, procedure: e.proc };
    };

    setProviderType = (e) => {
        this.setState({ selectedProvider: e });
        this.props.dispatch(getProviderSearch({ type: e, location: this.state.mylocation }));
    };

    setZip = (lat, lon) => {
        this.setState({ mylocation: { lat, lon } });
    };

    cancel = () => {
        this.setState({ selectedAppt: null });
    };

    register = (e, d) => {
        const params = { ...e, phy_id: d.phy_id, office_id: d.office_id };
        this.props.dispatch(searchRegister(params, () => {
            toast.success('Successfully saved booking.', { position: "top-right", autoClose: 3000, hideProgressBar: true });
            this.cancel();
        }));
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
        this.props.dispatch(getProviderSearch({ procedure: selectedProcedure, location: mylocation, selected, zipcode }));
    };

    render() {
        const { providerSearch, searchConfig } = this.props;
        const { selectedAppt, selectedProvider, zipcode, geo, error } = this.state;

        return (
            <>
                <Navbar />
                <Box sx={{ margin: 12}}>
                    {(providerSearch?.isReceiving || this.props.searchRegister?.isReceiving || this.props.searchCheckRes?.isReceiving) && (
                        <CircularProgress />
                    )}
                    {!selectedAppt && (
                        <Grid container justifyContent="center" alignItems="center">
                            <Grid item xs={12} textAlign="center" my={3}>
                                <Typography variant="h5">
                                    Find high-quality providers. Contact a provider in seconds.
                                </Typography>
                            </Grid>
                            {selectedProvider && (
                                <Grid item xs={12} textAlign="center" my={3}>
                                    <TextField
                                        label="Zip"
                                        value={zipcode}
                                        onChange={this.changeZip}
                                        required
                                    />
                                </Grid>
                            )}
                        </Grid>
                    )}
                    {searchConfig?.data?.types && !selectedProvider && (
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
                                                color: 'white',
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
                    {providerSearch?.data?.providers && providerSearch.data.providers.length > 0 && selectedProvider && !selectedAppt && (
                        <Grid container spacing={2}>
                            {providerSearch.data.providers.map((provider) => (
                                <Grid item xs={12} sm={6} md={4} key={provider.id}>
                                    <PhysicianCard onScheduleAppt={this.scheduleAppt} provider={provider} />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                    {providerSearch?.data?.providers?.length < 1 && selectedProvider && !selectedAppt && (
                        <Box textAlign="center" my={3}>
                            <Typography variant="h6">There are currently no service providers in this area.</Typography>
                        </Box>
                    )}
                    {selectedAppt && (
                        <Grid container justifyContent="center">
                            <Grid item xs={12} md={8}>
                                <UserRegistration data={selectedAppt} onCancel={this.cancel} onRegister={this.register} />
                            </Grid>
                        </Grid>
                    )}
                    {error && (
                        <Box textAlign="center" my={3}>
                            <Typography variant="h6" color="error">{error}</Typography>
                        </Box>
                    )}
                </Box>
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    currentUser: state.auth.currentUser,
    searchConfig: state.searchConfig,
    providerSearch: state.providerSearch,
    searchRegister: state.searchRegister,
    searchCheckRes: state.searchCheckRes
});

export default connect(mapStateToProps)(SearchAdmin);
