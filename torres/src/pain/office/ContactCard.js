import React, { Component } from 'react';
import { connect } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import formatPhoneNumber from '../utils/formatPhone';
import { Grid, Typography, Paper, Box, TextField, Divider, Button, FormControlLabel, Checkbox } from '@mui/material';
import TemplateTextFieldPhone from '../utils/TemplateTextFieldPhone';
import TemplateTextField from '../utils/TemplateTextField';

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
    borderRadius: 5,
    '&:hover': {
        backgroundColor: '#FFFAF2',
    },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '16px',
    boxSizing: 'border-box'
};

class ContactCard extends Component {
    state = {
        selected: null,
        edit: false,
        showPhone: true
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
        if (!this.props.provider.id) {
            this.editCard();
        }
    }

    editCard = () => {
        this.setState({ selected: this.props.provider, edit: true })
    }

    delCard = () => {
        this.state.selected = this.props.provider
        this.state.selected.deleted = true
        this.props.onEdit(this.state.selected);
        this.setState({ selected: null, edit: false })
    }

    saveCard = () => {
        this.props.onEdit(this.state.selected);
        this.setState({ selected: null, edit: false })
    }

    cancel = () => {
        this.setState({ selected: null, edit: false })
        this.props.onCancel();
    }

    changeDescription = (e) => {
        this.setState({
            selected: { ...this.state.selected, description: e.target.value }
        });
    }

    changePhone = (e) => {
        this.setState({
            selected: { ...this.state.selected, phone: e.target.value }
        });
    }

    toggleIsCell= () => {
        this.setState((prevState) => ({
            selected: { ...this.state.selected, iscell: !this.state.selected.iscell }
        
        }));
    }

    render() {
        return (
            
            <>
                {this.props.provider && (
                    <Box sx={{ mt: 3 }}>
                        <Paper elevation={3} sx={cardStyle}>
                            <Box>
                                <Grid container xs={12} spacing={1}>
                                    <Grid item xs={10}>
                                        {this.state.edit && this.state.selected ? (
                                            <TemplateTextField
                                                value={this.state.selected.description}
                                                onChange={this.changeDescription}
                                                label="Description"
                                            />
                                        ) : (
                                            <Typography variant="h6">{this.props.provider.description ? this.props.provider.description : ''}</Typography>
                                        )}
                                    </Grid>
                                    {!this.state.edit && (
                                        <Grid item xs={1}>
                                            <Button variant="contained" sx={buttonStyle} style={{ marginTop: 0, marginRight: 20 }}
                                                    onClick={this.delCard} >
                                                <DeleteIcon />
                                            </Button>
                                        </Grid>
                                    )}
                                </Grid>
                                <Divider sx={{ mt: 0 }} />
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        {this.state.edit && this.state.selected ? (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={this.state.selected.iscell}
                                                        onChange={this.toggleIsCell}
                                                        name="showPhone"
                                                        color="primary"
                                                    />
                                                }
                                                label="Is Cell"
                                            />
                                        ) : (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        readOnly
                                                        checked={this.props.provider.iscell}
                                                        name="showPhone"
                                                        color="primary"
                                                    />
                                                }
                                                label="Is Cell"
                                            />
                                        )}
                                    </Grid>
                                    {this.state.showPhone && (
                                        <Grid item xs={10}>
                                            {this.state.edit && this.state.selected ? (
                                                <TemplateTextFieldPhone
                                                    value={this.state.selected.phone}
                                                    onChange={this.changePhone}
                                                    label="Phone"
                                                />
                                            ) : (
                                                <Typography>{formatPhoneNumber(this.props.provider.phone)}</Typography>
                                            )}
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                {!this.state.edit && (
                                    <Button variant="contained" sx={buttonStyle} onClick={this.editCard}>
                                        Edit
                                    </Button>
                                )}
                                {this.state.edit && (
                                    <Button variant="contained" sx={buttonStyle} onClick={this.saveCard}>
                                        Done
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
});

export default connect(mapStateToProps)(ContactCard);
