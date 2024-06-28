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
        addButton:true,
        selected: null,
        addr:null,
        snackbarOpen: false,
        snackbarMessage: '',
        snackbarSeverity: 'success',
        errors: {},
    };

    componentWillReceiveProps(p) { 
        if (p.officeLocations && p.officeLocations.data &&
            p.officeLocations.data.locations && this.state.selected === null) { 
            this.state.selected = {}
            this.state.selected.addr = p.officeLocations.data.locations;
            this.setState(this.state);
        } 
    } 
    componentDidMount() {
        this.props.dispatch(getOfficeLocations({ page: 0, limit: 10000 }));
    }

    cancel = () => { }

    onUpdate = (updatedField) => {
        if (updatedField.phone) { 
            if (updatedField.phone.length > 10) { return; }
        } 
        if (updatedField.zipcode) { 
            if (updatedField.zipcode.length > 5) { return; }
        } 
        this.setState((prevState) => ({
            selected: { ...prevState.selected, ...updatedField }
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

        const { selected } = this.state;

        this.props.dispatch(officeLocationsSave(selected, (err, args) => {
            if (err) {
                this.setState({
                    snackbarOpen: true,
                    snackbarMessage: 'Error saving address.',
                    snackbarSeverity: 'error'
                });
                return;
            }
            //this.setState({selected:null});
            this.props.dispatch(getOfficeLocations({ page: 0, limit: 10000 }, (err,args) => {
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
        const selectedLocation = this.props.officeLocations.data.locations.find((g) => g.id === e.id);
        var v = this.state.selected.addr.findIndex((f) => f.id === e.id)
        if (v < 0) { 
            this.state.selected.addr.push(e);
        } else { 
            this.state.selected.addr[v] = e;
        } 
        this.state.addButton = true;
        this.save();
        this.setState(this.state);
    }

    addAddress = () => { 
        this.state.selected.addr.push({});
        this.setState(this.state);
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
                <Box style={{margin:20}}>
                <Grid container spacing={3} sx={{ justifyContent: 'center', mt: 2 }}>
                    <Grid item>
                        <Button variant="contained" sx={buttonStyle} startIcon={<AddBoxIcon />} onClick={this.addAddress}>
                            Add New Location
                        </Button>
                    </Grid>
                </Grid>
                <Grid container spacing={4} sx={{ mt: 2 }}>
                    {this.state.selected && this.state.selected.addr && this.state.selected.addr.length > 0 ? (
                        this.state.selected.addr.map((e) => (
                            <>
                            {!e.deleted && ( 
                            <Grid item xs={12} sm={6} md={4} key={e.id}>
                                <Box sx={{ height: '100%' }}>
                                    <LocationCard onEdit={this.edit} provider={e}/>
                                </Box>
                            </Grid>
                            )}
                            </>
                        ))
                    ) : (
                        <Typography variant="h6" color="textSecondary" sx={{ mt: 5 }}>
                            No office locations available.
                        </Typography>
                    )}
                </Grid>
                </Box>
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
