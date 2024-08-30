import React, { Component } from 'react';
import { connect } from 'react-redux';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Navbar from '../../components/Navbar';
import Registrations from './Registrations';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import OfficeAdminList from './OfficeAdminList';
import Clients from './Clients';
import UserAdminList from './UserAdminList';
import MyStuff from './MyStuff';


class CRMMain extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab:"mydashboard",
            selected: null
        }
        this.toggleTab = this.toggleTab.bind(this);
    }

    componentDidMount() {
        /*var i = localStorage.getItem("reg_tab_sel"); 
        if (i && i !== 'undefined') { 
            this.state.activeTab = i;
            this.toggleTab(null,i);
        } */
        //this.setState(this.state);
    }

    edit(r) { 
        this.state.selected = JSON.parse(JSON.stringify(r));
        this.setState(this.state);
    } 

    toggleTab(e,t) { 
        this.state.activeTab = t;
        this.setState(this.state);
    } 

    render() { 
        return (
        <>
            <Navbar/>
            <Box style={{margin:20}}>
                <Grid container xs="12" style={{margin:0}}>
                    <Grid item xs="12">
                    <>
                        <Box sx={{width:'100%'}}>
                            <Tabs style={{marginBottom:0}} value={this.state.activeTab} onChange={this.toggleTab}>
                                <Tab value='mydashboard' label='My Dashboard'/>
                                <Tab value='subscribers' label='Subscribers'/>
                                <Tab value='contacts' label='Contacts'/>
                                <Tab value='clients' label='Clients'/>
                                {(this.props.currentUser && this.props.currentUser.entitlements && 
                                this.props.currentUser.entitlements.includes('Admin'))   && ( 
                                <Tab value='endusers' label='End Users'/>
                                )}
                                {(this.props.currentUser && this.props.currentUser.entitlements && 
                                this.props.currentUser.entitlements.includes('Admin'))   && ( 
                                    <Tab value='dealtracker' label='Deal Tracker'/>
                                )}
                            </Tabs>
                            {(this.state.activeTab === 'endusers')  && ( 
                                <UserAdminList/>
                            )}
                            {(this.state.activeTab === 'contacts')  && ( 
                                <Registrations mine={false}/>
                            )}
                            {(this.state.activeTab === 'subscribers')  && ( 
                                <OfficeAdminList/>
                            )}
                            {(this.state.activeTab === 'clients')  && ( 
                                <Clients mine={false}/>
                            )}
                            {(this.state.activeTab === 'mydashboard') && ( 
                            <>
                                <div style={{display:"none"}}><Registrations/></div>
                                <MyStuff/>
                            </>
                            )}
                            {(this.props.currentUser && this.props.currentUser.entitlements && 
                            this.props.currentUser.entitlements.includes('Admin') && this.state.activeTab === 'dealtracker')  && ( 
                                <Registrations dealTrackerOnly={true}/>
                            )}
                        </Box>
                    </>
                    </Grid>
                </Grid>
            </Box>
        </>
        )
    } 
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        registrationsAdminList: store.registrationsAdminList,
    }
}

export default connect(mapStateToProps)(CRMMain);
