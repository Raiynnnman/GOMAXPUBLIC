import React, { Component } from 'react';
import { connect } from 'react-redux';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { push } from 'connected-react-router';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';

class UserRegistration extends Component {
    constructor(props) {
        super(props);
        this.state = {
            address: null,
            status_id: 0,
            tarea: '',
            inputs: [
                { l: 'Name', f: 'name', t: 'text', v: '' },
                { l: 'Phone', f: 'phone', t: 'text', v: '' },
                { l: 'Email', f: 'email', t: 'text', v: '' },
                { l: 'DOA', f: 'doa', t: 'text', v: '' },
                { l: 'Address', f: 'addr', t: 'addr_search', v: '' },
                { l: 'Attny', f: 'attorney_name', t: 'addr_search', v: '' },
                { l: 'Language', f: 'language', t: 'addr_search', v: '' },
            ]
        };
    }

    componentDidMount() {
        if (this.props.data && this.props.filled !== undefined && this.props.filled === true) {
            for (let [key, value] of Object.entries(this.props.data)) {
                for (let i = 0; i < this.state.inputs.length; i++) {
                    if (this.state.inputs[i].f === key) {
                        this.state.inputs[i].v = value;
                    }
                    if (key === 'addr') {
                        this.setState({ address: { fulladdr: value } });
                    }
                    if (key === 'status_id') {
                        this.setState({ status_id: value });
                    }
                }
            }
        }
    }

    copyContent = () => {
        this.setState({
            tarea: 'Name: Full Name\nPhone: Phone\nEmail: someone@gmail.com\nDOA:\nAddress: Address\nAttny: Attny\nLanguage: English\n'
        });
    };

    cancel = () => {
        this.props.onCancel();
    };

    setValue = (e) => {
        this.setState({ tarea: e.target.value });
    };

    updateAddress = (e) => {
        const terms = e.value.terms;
        const city = terms[terms.length - 2]?.value || '';
        const state = terms[terms.length - 3]?.value || '';
        this.setState({
            address: {
                places_id: e.value.place_id,
                addr1: e.value.structured_formatting.main_text,
                fulladdr: e.label,
                city,
                state,
                zipcode: 0
            }
        });
    };

    save = () => {
        this.props.onRegister({ value: this.state.tarea });
    };

    markScheduled = () => {
        const status = this.props.config.status.find((g) => g.name === 'SCHEDULED');
        this.props.onRegister({
            id: this.props.data.id,
            status_id: status.id
        });
    };

    markComplete = () => {
        const status = this.props.config.status.find((g) => g.name === 'COMPLETED');
        this.props.onRegister({
            id: this.props.data.id,
            status_id: status.id
        });
    };

    markNoShow = () => {
        const status = this.props.config.status.find((g) => g.name === 'NO_SHOW');
        this.props.onRegister({
            id: this.props.data.id,
            status_id: status.id
        });
    };

    render() {
        const { config, error_message, filled } = this.props;

        return (
            <>
                {this.props.offices?.isReceiving && <AppSpinner />}
                {config && filled !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', mb: 2 }}>
                        <Typography>{translate('Status')}:</Typography>
                        {this.props.data.status !== 'SCHEDULED' && (
                            <Button variant="contained" sx={{ backgroundColor: '#FFA500', color: 'white', mr: 1 }} onClick={this.markScheduled}>
                                {translate('Scheduled')}
                            </Button>
                        )}
                        <Button variant="contained" sx={{ backgroundColor: '#FFA500', color: 'white', mr: 1 }} onClick={this.markComplete}>
                            {translate('Completed')}
                        </Button>
                        <Button variant="contained" sx={{ backgroundColor: '#FFA500', color: 'white' }} onClick={this.markNoShow}>
                            {translate('No Show')}
                        </Button>
                    </Box>
                )}
                {error_message && (
                    <Grid container sx={{ mt: 2 }}>
                        <Grid item xs={12}>
                            <Typography color="error">{error_message}</Typography>
                        </Grid>
                    </Grid>
                )}
                <Grid container sx={{ mt: 2 }}>
                    <Grid item xs={12}>
                        <Box sx={{ color: 'black' }}>
                            <Typography>Name: Full Name</Typography>
                            <Typography>Phone: Phone</Typography>
                            <Typography>Email: Email</Typography>
                            <Typography>DOA: date of accident (5/16/24)</Typography>
                            <Typography>Address: Address</Typography>
                            <Typography>Attny: Attny</Typography>
                            <Typography>Language: English | Spanish</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Button variant="contained" startIcon={<ContentCopyIcon />} sx={{ backgroundColor: '#FFA500', color: 'white' }} onClick={this.copyContent}>
                            Copy
                        </Button>
                    </Grid>
                </Grid>
                <Grid container sx={{ mt: 2 }}>
                    <Grid item xs={12}>
                        <TextField
                            multiline
                            rows={10}
                            variant="outlined"
                            fullWidth
                            onChange={this.setValue}
                            value={this.state.tarea}
                            placeholder=""
                            sx={{ borderColor: '#FFA500', '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#FFA500' } } }}
                        />
                    </Grid>
                </Grid>
                <Grid container sx={{ mt: 2 }}>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button variant="contained" sx={{ backgroundColor: '#FFA500', color: 'white', mr: 1 }} onClick={this.save}>
                            {translate('Save')}
                        </Button>
                        <Button variant="outlined" sx={{ color: '#FFA500', borderColor: '#FFA500' }} onClick={this.cancel}>
                            {translate('Cancel')}
                        </Button>
                    </Grid>
                </Grid>
            </>
        );
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        searchUser: store.searchUser
    };
}

export default connect(mapStateToProps)(UserRegistration);
