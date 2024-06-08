import React, { Component } from 'react';
import { connect } from 'react-redux';
import GoogleAutoComplete from '../utils/GoogleAutoComplete';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import AppSpinnerInternal from '../utils/SpinnerInternal';
import googleKey from '../../googleConfig';
import formatPhoneNumber from '../utils/formatPhone';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import TemplateButton from '../utils/TemplateButton';
import TemplateTextFieldPhone from '../utils/TemplateTextFieldPhone';
import TemplateTextField from '../utils/TemplateTextField';
import { Typography, Paper, Box } from '@mui/material';

class LocationCard extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            more: {},
            inMore:0,
            lastMore:0,
            value:'',
            dateSelected:'',
            pickDay: false,
            dateSelectedForRest:'',
            selected:null
        }
        this.save = this.save.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
        this.getDate = this.getDate.bind(this);
        this.changeName = this.changeName.bind(this);
        this.changeAddr1 = this.changeAddr1.bind(this);
        this.changeAddr2 = this.changeAddr2.bind(this);
        this.changePhone = this.changePhone.bind(this);
        this.scheduleAppt = this.scheduleAppt.bind(this);
        this.selectDay = this.selectDay.bind(this);
    } 

    componentWillReceiveProps(np) { 
        if (this.state.selected === null && np.provider && np.provider.about) { 
            this.state.selected = np.provider;
            this.setState(this.state);
        }
        if (this.props.edit && this.state.selected === null) { 
            this.state.selected = this.props.provider;
        } 
    }

    componentDidMount() {
        var j = new Date()
        var date = j.toISOString()
        var date2 = j.toDateString()
        date = date.substring(0,10)
        date2 = date2.substring(0,15)
        this.state.dateSelected = date2
        this.state.dateSelectedForRest = date;
        if (this.props.edit && this.state.selected === null) { 
            this.state.selected = this.props.provider;
        } 
        this.setState(this.state)
    }

    save() { 
    } 
    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
        this.props.onCancel();
    }
    selectDay() { 
        this.state.pickDay = true;
        this.setState(this.state)
    } 
    onSelected(e,t) { 
        //this.props.onSelected(e,t);
        this.state.loaded=true;
        this.setState(this.state)
    } 

    changeName(e) { 
        this.state.selected.name = e.target.value;
        this.setState(this.state);
        this.props.onUpdate(this.state.selected);
    }
    changeAddr1(e,t) { 
        this.state.selected = {...this.state.selected, ...e}
        this.setState(this.state);
        this.props.onUpdate(this.state.selected);
    }
    changeAddr2(e) { 
        this.state.selected.addr2 = e.target.value;
        this.setState(this.state);
        this.props.onUpdate(this.state.selected);
    }
    changePhone(e) { 
        this.state.selected.phone = e.target.value;
        this.setState(this.state);
        this.props.onUpdate(this.state.selected);
    }

    scheduleAppt(e) { 
        this.moreToggle(this.props.provider.phy_id);
        this.props.onScheduleAppt(this.props.provider,e)
    } 

    getDate() { 
        var j = new Date();
        var q = j.toDateString()
        return q.substring(0,10);
    } 

    render() {
        if (this.state.inMore > 0 && !this.props.moreSchedules.isReceiving)  {
            this.state.more[this.props.provider.phy_id] = true;
            this.state.inMore = 0;
            this.setState(this.state)
        } 
        return (
        <>
        {(this.props.provider) && (
            <Box sx={{mt:3}}>
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Grid container xs="12">
                        <Grid item xs="12">
                        <>
                            {(this.props.edit && this.state.selected !== null) && (
                                <div> 
                                <TemplateTextField 
                                    value={this.state.selected.name} onChange={this.changeName} 
                                    label="Name" />
                                </div>
                            )}
                            {(!this.props.edit) && (
                                <div>
                                {this.props.provider.name} 
                                </div>
                            )}
                        </>
                        </Grid>
                    </Grid>
                    <hr/>
                    <Grid container xs="12" style={{marginTop:20}}> 
                        <Grid item xs="12" style={{marginLeft:10}}>
                        <>
                            {(this.props.edit && this.state.selected !== null) && (
                                <div> 
                                <GoogleAutoComplete onChange={this.changeAddr1}/>
                                </div>
                            )}
                            {(!this.props.edit) && (
                                <div>
                                {this.props.provider.addr1 + " " + (this.props.provider.addr2 ? this.props.provider.addr2 : '')}
                                <br/>
                                {    this.props.provider.city + ", " + this.props.provider.state + " " + 
                                    this.props.provider.zipcode
                                }
                                </div>
                            )}
                        </>
                        </Grid> 
                    </Grid>
                    <Grid container xs="12" style={{marginTop:10}}>
                        <Grid item xs="12">
                        <>
                            {(this.props.edit && this.state.selected !== null) && (
                                <div> 
                                <TemplateTextField 
                                    value={this.state.selected.addr2} onChange={this.changeAddr2} 
                                    label="Address 2" />
                                </div>
                            )}
                        </>
                        </Grid>
                    </Grid>
                    <Grid container xs="12" style={{marginTop:20}}>
                        <Grid item xs="12">
                        <>
                            {(this.props.edit && this.state.selected !== null) && (
                                <div> 
                                <TemplateTextFieldPhone 
                                    value={this.state.selected.phone} onChange={this.changePhone} 
                                    label="Phone" />
                                </div>
                            )}
                            {(!this.props.edit) && (
                                <div style={{marginLeft:10}}>
                                {formatPhoneNumber(this.props.provider.phone)} 
                                </div>
                            )}
                        </>
                        </Grid>
                    </Grid>
                    <hr/>
                    <Grid container xs="12"> 
                        <Grid item xs="12">
                        <>
                            {(!this.props.edit) && (
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <TemplateButton color="primary" onClick={() => this.props.onEdit(this.props.provider)} label='Edit'/>
                                </div>
                            )}
                        </>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        moreSchedules: store.moreSchedules
    }
}

export default connect(mapStateToProps)(LocationCard);
