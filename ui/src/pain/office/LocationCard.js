import React, { Component } from 'react';
import { connect } from 'react-redux';
import GoogleAutoComplete from '../utils/GoogleAutoComplete';
import formatPhoneNumber from '../utils/formatPhone';
import { Grid, Typography, Paper, Box, TextField, Divider, Button } from '@mui/material';

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
    marginTop: '12px'
};

const cardStyle = {
    height: '100%',
    marginBottom:12,
    borderRadius:5,
    '&:hover': {
        backgroundColor: '#FFFAF2',
    },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '16px',
    boxSizing: 'border-box'
};

class LocationCard extends Component {
    state = {
        selected: null
    };
    componentWillReceiveProps(nextProps) {
        if (this.state.selected === null && nextProps.provider && nextProps.provider.about) {
            this.setState({ selected: nextProps.provider });
        }
        if (this.props.edit && this.state.selected === null) {
            this.setState({ selected: this.props.provider });
        }
      }

    componentDidMount() {
        const j = new Date();
        const date = j.toISOString().substring(0, 10);
        const date2 = j.toDateString().substring(0, 15);
        this.setState({
            dateSelected: date2,
            dateSelectedForRest: date
        });
        if (this.props.edit && this.state.selected === null) {
            this.setState({ selected: this.props.provider });
        }
        
    }

    save = () => { }

    cancel = () => {
        this.setState({ selected: null });
        this.props.onCancel();
    }

    changeName = (e) => {
        this.setState({
            selected: { ...this.state.selected, name: e.target.value }
        });
        this.props.onUpdate(this.state.selected);
    }

    changeAddr1 = (e) => {
        this.setState({
            selected: { ...this.state.selected, addr1: e.target.value }
        });
        this.props.onUpdate(this.state.selected);
    }

    changeAddr2 = (e) => {
        this.setState({
            selected: { ...this.state.selected, addr2: e.target.value }
        });
        this.props.onUpdate(this.state.selected);
    }

    changePhone = (e) => {
        this.setState({
            selected: { ...this.state.selected, phone: e.target.value }
        });
        this.props.onUpdate(this.state.selected);
    }

    render() {
        console.log(this.state, "her!!")
        return (
            <>
                {this.props.provider && (
                    <Box sx={{ mt: 3 }}>
                        <Paper elevation={3} sx={cardStyle}>
                            <Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        {this.props.edit && this.state.selected ? (
                                            <TextField
                                                fullWidth
                                                value={this.state.selected.name}
                                                onChange={this.changeName}
                                                label="Name"
                                            />
                                        ) : (
                                            <Typography variant="h6">{this.props.provider.name}</Typography>
                                        )}
                                    </Grid>
                                </Grid>
                                <Divider sx={{ my: 2 }} />
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        {this.props.edit && this.state.selected ? (
                                            <GoogleAutoComplete onChange={this.changeAddr1} />
                                        ) : (
                                            <Typography>
                                                {`${this.props.provider.addr1} ${this.props.provider.addr2 || ''}`}<br />
                                                {`${this.props.provider.city}, ${this.props.provider.state} ${this.props.provider.zipcode}`}
                                            </Typography>
                                        )}
                                    </Grid>
                                    {this.props.edit && this.state.selected && (
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                value={this.state.selected.addr2}
                                                onChange={this.changeAddr2}
                                                label="Address 2"
                                            />
                                        </Grid>
                                    )}
                                </Grid>
                                <Divider sx={{ my: 2 }} />
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        {this.props.edit && this.state.selected ? (
                                            <TextField
                                                fullWidth
                                                value={this.state.selected.phone}
                                                onChange={this.changePhone}
                                                label="Phone"
                                            />
                                        ) : (
                                            <Typography>{formatPhoneNumber(this.props.provider.phone)}</Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                {!this.props.edit && (
                                    <Button variant="contained" sx={buttonStyle} onClick={() => this.props.onEdit(this.props.provider)}>
                                        Edit
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    </Box>
                )}
            </>
        );
    }
}

const mapStateToProps = (store) => ({
    currentUser: store.auth.currentUser,
    moreSchedules: store.moreSchedules,
});

export default connect(mapStateToProps)(LocationCard);
