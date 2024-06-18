import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import Navbar from '../../components/Navbar';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TemplateButton from '../utils/TemplateButton';
import { toast } from 'react-toastify';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {clientList} from '../../actions/officeClients';
import {clientUpdate} from '../../actions/officeClientUpdate';
import CustomerView from './CustomerView';

class Customers extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "office",
            selectedAppt:null,
        }
        this.toggleTab = this.toggleTab.bind(this);
        this.close = this.close.bind(this);
        this.save = this.save.bind(this);
        this.selectAppt = this.selectAppt.bind(this);
    } 

    componentWillReceiveProps(p) { 

    }

    componentDidMount() {
        this.props.dispatch(clientList({}));
    }

    save(e) { 
        this.props.dispatch(clientUpdate(e,function(data,args) { 
            toast.success('Successfully updated status.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
            );
            args.props.dispatch(clientList({}));
            args.cancel()
        },this));
    } 
    close() { 
        this.state.selectedAppt = null;
        this.setState(this.state);
    } 
    selectAppt(e) { 
        this.state.selectedAppt = e;
        this.setState(this.state);
    } 

    toggleTab(e) { 
        this.state.activeTab = e;
    } 

    render() {
        return (
        <>
        <Navbar/>
        <Box style={{margin:20}}>
            {(this.props.officeClient && this.props.officeClient.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.officeClientUpdate && this.props.officeClientUpdate.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.officeClients && this.props.officeClients.data &&
              this.props.officeClients.data.clients && this.state.selectedAppt !== null) && (
                <CustomerView filled={true} config={this.props.officeClients.data.config} 
                    data={this.state.selectedAppt} onCancel={this.close} onRegister={this.save}/>
            )}
            {(this.props.officeClients && this.props.officeClients.data &&
              this.props.officeClients.data.clients && this.state.selectedAppt === null &&
              this.props.officeClients.data.clients.length === 0) && (
                <h4>Waiting for first client</h4>
            )}
            {(this.props.officeClients && this.props.officeClients.data &&
              this.props.officeClients.data.clients && this.state.selectedAppt === null) && (
            <Grid container xs="12">
                {this.props.officeClients.data.clients.map((e) => { 
                    return (
                        <>
                        <Grid item xs="4" onClick={() => this.selectAppt(e)} style={{cursor:'pointer'}}>
                            <Container style={{
                                margin:20,
                                borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}}>
                                <Grid container xs="12">
                                    <Grid item xs="8">
                                        <font style={{fontSize:"14pt",fontWeight:"bold"}}>
                                        {e.office_name}
                                        </font>
                                        <br/>
                                    </Grid>
                                    <Grid item xs="4" class="pull-right">
                                        {e.status}
                                    </Grid>
                                </Grid>
                                <hr/>
                                <Grid container xs="12">
                                    <Grid item xs="12">
                                        <font style={{fontSize:"14pt"}}>
                                        {e.client_first + " " + e.client_last}
                                        </font>
                                        <br/>
                                    </Grid>
                                </Grid>
                                <Grid container xs="12">
                                    <Grid item xs="12">
                                        <font style={{fontSize:"14pt"}}>
                                        {e.email}
                                        </font>
                                    </Grid>
                                </Grid>
                                <Grid container xs="12">
                                    <Grid item xs="8">
                                        <font style={{fontSize:"14pt"}}>
                                        {e.phone}
                                        </font>
                                    </Grid>
                                </Grid>
                                <Grid container xs="12">
                                    <Grid item xs="12">
                                        <div style={{overflow:"auto"}}>
                                            {e.description}
                                        </div>
                                    </Grid>
                                </Grid>
                                <hr/>
                                <Grid container xs="12"> 
                                    <Grid item xs="12">
                                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <TemplateButton onClick={() => this.selectAppt(e)} 
                                                style={{marginBottom:10}} label={translate('View')}/>
                                        </div>
                                    </Grid>
                                </Grid>
                            </Container>
                        </Grid>
                        </>
                    )
                })}
            </Grid>
            )}
        </Box>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        officeClients: store.officeClients,
        officeClientUpdate: store.officeClientUpdate
    }
}

export default connect(mapStateToProps)(Customers);
