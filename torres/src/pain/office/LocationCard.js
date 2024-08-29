import React, { Component } from 'react';
import { connect } from 'react-redux';
import GoogleAutoComplete from '../utils/GoogleAutoComplete';
import DeleteIcon from '@mui/icons-material/Delete';
import formatPhoneNumber from '../utils/formatPhone';
import { Grid, Typography, Paper, Box, TextField, Divider, Button } from '@mui/material';
import TemplateTextField from '../utils/TemplateTextField';

const inputStyle = {
    input: {
        '&::placeholder': {
          color:'red',
          fontStyle: 'italic',
        },
      },
};

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
        selected: null,
        edit:false
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
        this.setState({selected:this.props.provider,edit:true})
    } 

    delCard = () => { 
        this.state.selected = this.props.provider
        this.state.selected.deleted = true
        this.props.onEdit(this.state.selected);
        this.setState({selected:null,edit:false})
    } 

    saveCard = () => { 
        this.props.onEdit(this.state.selected);
        this.setState({selected:null,edit:false})
    } 

    cancel = () => {
        this.setState({selected:null,edit:false})
        this.props.onCancel();
    }

    changeName = (e) => {
        this.setState({
            selected: { ...this.state.selected, name: e.target.value }
        });
    }

    changeAddr1 = (e) => {
        this.setState({
            selected: { ...this.state.selected, ...e }
        });
    }

    changeAddr2 = (e) => {
        this.setState({
            selected: { ...this.state.selected, addr2: e.target.value }
        });
    }

    changePhone = (e) => {
        var g = e.target.value;
        if (g.length > 10 && !g.includes('(')) { return; } 
        if (g.length > 14 && g.includes('(')) { return; } 
        const phone = formatPhoneNumber(g);
        this.setState({
            selected: { ...this.state.selected, phone: phone }
        });
    }

    render() {
        return (
            <>
                {this.props.provider && (
                    <Box sx={{ mt: 3 }}>
                        <Paper elevation={3} sx={cardStyle}>
                            <Box>
                                <Grid container spacing={1}>
                                    <Grid item xs={10}>
                                        {this.state.edit && this.state.selected ? (
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
                                    {(!this.props.no_del) && (
                                    <Grid item xs={1}>
                                        {!this.state.edit && (
                                        <Button variant="contained" sx={buttonStyle} style={{marginTop:0,marginRight:20}} 
                                                onClick={this.delCard} >
                                            <DeleteIcon/>
                                        </Button>
                                        )}
                                    </Grid>
                                    )}
                                </Grid>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} style={{marginTop:10}}>
                                        {this.state.edit && this.state.selected ? (
                                            <div style={{zIndex:999}}>
                                            <GoogleAutoComplete initVal={this.state.selected.addr1} onChange={this.changeAddr1} />
                                            </div>
                                        ) : (
                                        <>
                                            <Typography>
                                                {this.props.provider.addr1 || '' } {this.props.provider.addr2 || ''}<br />
                                                {this.props.provider.city || ''} {this.props.provider.state || ''} {this.props.provider.zipcode || ''}
                                            </Typography>
                                        </>
                                        )}
                                    </Grid>
                                    {this.state.edit && this.state.selected && (
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
                                {(!this.props.no_phone) && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} style={{marginTop:10}}>
                                        {this.state.edit && this.state.selected ? (
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
                                )}
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
    moreSchedules: store.moreSchedules,
});

export default connect(mapStateToProps)(LocationCard);
