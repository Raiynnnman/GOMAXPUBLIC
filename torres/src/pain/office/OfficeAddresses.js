import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Box,
    Grid,
    Container,
    Button,
    Paper,
    Typography,
    Divider,
    Snackbar,
    Alert,
    TextField,
} from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AppSpinner from '../utils/Spinner';
import formatPhone from '../utils/formatPhone';
import Navbar from '../../components/Navbar';
import LocationCard from './LocationCard';
import { getOfficeLocations } from '../../actions/officeLocations';
import { officeLocationsSave } from '../../actions/officeLocationsSave';

class OfficeAddresses extends Component {
    state = {
        activeTab: "office",
        selected: null,
        snackbarOpen: false,
        snackbarMessage: '',
        snackbarSeverity: 'success',
        errors: {},
    };

    componentDidMount() {
        this.props.dispatch(getOfficeLocations({ page: 0, limit: 10000 }));
    }

    cancel = () => {
        this.setState({ selected: null, errors: {} });
    }

    onUpdate = (updatedField) => {
        if (updatedField.phone) { 
            if (updatedField.phone.length > 10) { return; }
        } 
        if (updatedField.zipcode) { 
            if (updatedField.zipcode.length > 5) { return; }
        } 
        this.setState((prevState) => ({
            selected: { ...prevState.selected, ...updatedField },
            errors: { ...prevState.errors, ...updatedField }
        }));
    }

    validate = () => {
        const { selected } = this.state;
        const errors = {};

        if (!selected.name) errors.name = 'Name is required';
        if (!selected.addr1) errors.addr1 = 'Address is required';
        if (!selected.city) errors.city = 'City is required';
        if (!selected.state) errors.state = 'State is required';
        if (!selected.zipcode) errors.zipcode = 'Zipcode is required';
        else if (!/^\d{5}$/.test(selected.zipcode)) errors.zipcode = 'Zipcode must be exactly 5 digits';
        if (!selected.phone) errors.phone = 'Phone is required';
        else if (!/^\d{10}$/.test(selected.phone) && !selected.phone.includes('(')) errors.phone = 'Phone must be exactly 10 digits';

        this.setState({ errors });

        return Object.keys(errors).length === 0;
    }

    save = () => {
        if (!this.validate()) {
            this.setState({
                snackbarOpen: true,
                snackbarMessage: 'Please correct the errors in the form.',
                snackbarSeverity: 'error'
            });
            return;
        }

        const { selected } = this.state;
        if (selected.id === 'new') {
            delete selected.id;
        }

        this.props.dispatch(officeLocationsSave(selected, (err, args) => {
            if (err) {
                this.setState({
                    snackbarOpen: true,
                    snackbarMessage: 'Error saving address.',
                    snackbarSeverity: 'error'
                });
                return;
            }
            this.props.dispatch(getOfficeLocations({ page: 0, limit: 10000 }, () => {
                toast.success('Successfully saved address.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                });
                this.cancel();
            }));
        }));
    }

    edit = (e) => {
        if (e.id === 'new') {
            this.setState({
                selected: {
                    name: '',
                    miles: 0,
                    addr1: '',
                    city: '',
                    state: '',
                    zipcode: '',
                    phone: '',
                    rating: 0
                },
                errors: {}
            });
        } else {
            const selectedLocation = this.props.officeLocations.data.locations.find((g) => g.id === e.id);
            this.setState({ selected: selectedLocation, errors: {} });
        }
    }

    handleCloseSnackbar = () => {
        this.setState({ snackbarOpen: false });
    }

    render() {
        const { selected, snackbarOpen, snackbarMessage, snackbarSeverity, errors } = this.state;
        const { officeLocations, officeLocationSave } = this.props;

        return (
            <>
                <Navbar />
                <Container sx={{ mt: 3 }}>
                    <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                        Office Addresses
                    </Typography>
                    {(officeLocations?.isReceiving || officeLocationSave?.isReceiving) && <AppSpinner />}
                    {selected ? (
                        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
                            <Container maxWidth="md">
                                <Paper
                                    elevation={12}
                                    sx={{
                                        width: '100%',
                                        p: { xs: 2, sm: 4, md: 6 },
                                        borderRadius: '30px',
                                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.35)',
                                        backgroundColor: '#fff',
                                    }}
                                >
                                    <Typography variant="h6" align="center" gutterBottom>
                                        {selected.id === 'new' ? 'Add New Office Location' : 'Edit Office Location'}
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                required
                                                label="Name"
                                                name="name"
                                                value={selected.name}
                                                onChange={(e) => this.onUpdate({ name: e.target.value })}
                                                margin="normal"
                                                sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                                error={!!errors.name}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                required
                                                label="Address"
                                                name="addr1"
                                                value={selected.addr1}
                                                onChange={(e) => this.onUpdate({ addr1: e.target.value })}
                                                margin="normal"
                                                sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                                error={!!errors.addr1}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                required
                                                label="City"
                                                name="city"
                                                value={selected.city}
                                                onChange={(e) => this.onUpdate({ city: e.target.value })}
                                                margin="normal"
                                                sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                                error={!!errors.city}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                required
                                                label="State"
                                                name="state"
                                                value={selected.state}
                                                onChange={(e) => this.onUpdate({ state: e.target.value })}
                                                margin="normal"
                                                sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                                error={!!errors.state}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                required
                                                label="Zipcode"
                                                name="zipcode"
                                                value={selected.zipcode}
                                                onChange={(e) => this.onUpdate({ zipcode: e.target.value })}
                                                margin="normal"
                                                sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                                error={!!errors.zipcode}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                required
                                                label="Phone"
                                                name="phone"
                                                value={formatPhone(selected.phone)}
                                                onChange={(e) => this.onUpdate({ phone: e.target.value })}
                                                margin="normal"
                                                sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                                error={!!errors.phone}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Button variant="contained" style={{width:100}} sx={buttonStyle} onClick={this.save}>Save</Button>
                                        <Button variant="outlined" style={{marginLeft:20,width:100}} sx={{ ...buttonStyle, mr: 2 }} onClick={this.cancel}>Close</Button>
                                    </Box>
                                </Paper>
                            </Container>
                        </Box>
                    ) : (
                        <>
                            <Grid container spacing={3} sx={{ justifyContent: 'center', mt: 2 }}>
                                <Grid item>
                                    <Button variant="contained" sx={buttonStyle} startIcon={<AddBoxIcon />} onClick={() => this.edit({ id: 'new' })}>
                                        Add New Location
                                    </Button>
                                </Grid>
                            </Grid>
                            <Grid container spacing={4} sx={{ mt: 2 }}>
                                {officeLocations?.data?.locations?.length > 0 ? (
                                    officeLocations.data.locations.map((e) => (
                                        <Grid item xs={12} sm={6} md={4} key={e.id}>
                                            <Box sx={{ height: '100%' }}>
                                                <LocationCard onEdit={this.edit} provider={e} edit={false} />
                                            </Box>
                                        </Grid>
                                    ))
                                ) : (
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 5 }}>
                                        No office locations available.
                                    </Typography>
                                )}
                            </Grid>
                        </>
                    )}
                </Container>
                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={this.handleCloseSnackbar}>
                    <Alert onClose={this.handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </>
        );
    }
}

const buttonStyle = {
    backgroundColor: '#fa6a0a',
    color: 'white',
    '&:hover': {
        backgroundColor: '#e55d00',
    },
    borderRadius: '10px',
    padding: '8px 16px',
    width: '100%',
    textTransform: 'none',
    mt: 2,
};

const mapStateToProps = (store) => ({
    currentUser: store.auth.currentUser,
    officeLocations: store.officeLocations,
    officeLocationSave: store.officeLocationSave
});

export default connect(mapStateToProps)(OfficeAddresses);
