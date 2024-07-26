import React, { Component } from 'react';
import { Container, Typography, Drawer, Grid, Box, Tabs, Tab } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import InputIcon from '@mui/icons-material/Input';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EditIcon from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import AppSpinner from '../utils/Spinner';
import { getRegistrations } from '../../actions/registrationsAdminList';
import { getPlansList } from '../../actions/plansList';
import { registrationAdminUpdate } from '../../actions/registrationAdminUpdate';
import TemplateSelectMulti from '../utils/TemplateSelectMulti';
import TemplateTextField from '../utils/TemplateTextField';
import TemplateButtonIcon from '../utils/TemplateButtonIcon';
import PainTable from '../utils/PainTable';
import TemplateBadge from '../utils/TemplateBadge';
import TemplateButton from '../utils/TemplateButton';

class Tickets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: null,
            activeTab: 'tickets',
            typeSelected: null,
            transition: false,
            statusSelected: null,
            search: null,
            altFilter: [],
            filterName: null,
            statusAltSelected: null,
            filter: [],
            saveSearches: [],
            filterType: [],
            mine: true,
            massSel: [],
            userSelected: null,
            userFilter: [],
            massUpdateValue: {},
            sort: null,
            drawerOpen: false,
            direction: 0,
            pq_id: 0,
            page: 0,
            pageSize: 10,
            data: Array.from({ length: 10 }, (_, id) => ({
                id,
                ticketNumber: `Ticket-${id}`,
                description: `Description for Ticket-${id}`,
                status: 'Open',
                assignedTo: `User-${id % 10}`,
            })),
            total: 100,
            searchname: '',
        };
    //     this.search = this.search.bind(this);
    //     this.updateFilter = this.updateFilter.bind(this);
    //     this.onMassUpdateValue = this.onMassUpdateValue.bind(this);
    //     this.toggleDrawer = this.toggleDrawer.bind(this);
    //     this.transition = this.transition.bind(this);
    //     this.cancelMass = this.cancelMass.bind(this);
    //     this.saveMass = this.saveMass.bind(this);
    //     this.close = this.close.bind(this);
    //     this.onAltStatusFilter = this.onAltStatusFilter.bind(this);
    //     this.onStatusFilter = this.onStatusFilter.bind(this);
    //     this.onMassChange = this.onMassChange.bind(this);
    //     this.onTypeFilter = this.onTypeFilter.bind(this);
    //     this.onUserFilter = this.onUserFilter.bind(this);
    //     this.save = this.save.bind(this);
    //     this.reload = this.reload.bind(this);
    //     this.providerReport = this.providerReport.bind(this);
    //     this.dncReport = this.dncReport.bind(this);
    //     this.edit = this.edit.bind(this);
    //     this.add = this.add.bind(this);
    //     this.pageChange = this.pageChange.bind(this);
    //     this.sortChange = this.sortChange.bind(this);
    //     this.loadSavedSearch = this.loadSavedSearch.bind(this);
    //     this.saveSearchValue = this.saveSearchValue.bind(this);
    //     this.saveSearchName = this.saveSearchName.bind(this);
    //     this.pageGridsChange = this.pageGridsChange.bind(this);
    //     this.toggleTab = this.toggleTab.bind(this);
    // }
 
  }
    render() {
        const { page, pageSize, data, total, transition, massSel } = this.state;
        const regheads = [
        {
        dataField:'Title',
        sort:true,
        hidden:true,
        text:'Title'
        },
        {
        dataField:'Assigned To',
        sort:true,
        text:'Assigned To'
        },
        {
        dataField:'Ticket Priority',
        sort:true,
        text:'Ticket Priority'
        },
        {
        dataField:'Ticket Status',
        sort:true,
        align:'center',
        text:'Ticket Status',
        formatter:(cellContent,row) => (
        <div>
        {row.status && (<TemplateBadge label={row.status}/>)}
        </div>
        )
        },
        {
        dataField:'Ticket Type',
        sort:true,
        align:'center',
        text:'Ticket Type'
        },
        {
        dataField:'Created Date',
        sort:true,
        align:'center',
        text:'Created Date',
        formatter:(cellContent,row) => (
        <div>
        {row.created}
        </div>
        )
        },
        {
        dataField:'Actions',
        sort:true,
        text:'Actions',
        formatter:(cellContent,row) => (
        <>
        <div>
        <TemplateButton 
        onClick={() => this.edit(row)} style={{marginRight:5,width:30,height:35}} color="primary" label={<EditIcon/>}/>
        </div>
        </>
        )
        },
        ];
        return (
            <>
                <Box style={{ margin: 20 }}>
                    <Drawer anchor="right" open={this.state.drawerOpen} onClose={this.toggleDrawer}>
                        <Box sx={{ width: 400 }} role="presentation">
                            {/* Add filter components here */}
                        </Box>
                    </Drawer>
                    <Container>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                {transition && (
                                    <Box>
                                        <Typography variant="h6">Transition Items</Typography>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={2}>
                                                <Typography variant="subtitle1">Assignee</Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <TemplateSelectMulti
                                                    label="Assignee"
                                                    onChange={(e) => this.onMassUpdateValue('commission_user_id', e)}
                                                    value={this.state.massUpdateValue['commission_user_id']}
                                                    options={this.props.registrationsAdminList.data.config.commission_users.map((e) => ({
                                                        label: e.name,
                                                        value: e.name,
                                                        id: e.id,
                                                    }))}
                                                />
                                            </Grid>
                                            <Grid item xs={2}>
                                                <TemplateButtonIcon
                                                    onClick={this.saveMass}
                                                    label={<SaveIcon />}
                                                />
                                            </Grid>
                                            <Grid item xs={2}>
                                                <TemplateButtonIcon
                                                    onClick={this.cancelMass}
                                                    label={<CancelIcon />}
                                                />
                                            </Grid>
                                        </Grid>
                                        <PainTable
                                            keyField='id'
                                            selectAll={false}
                                            data={massSel}
                                            total={massSel.length}
                                            page={0}
                                            pageSize={massSel.length}
                                            columns={regheads}
                                            onPageChange={this.pageChange}
                                            onMassChange={this.onMassChange}
                                            onSort={this.sortChange}
                                            onPageGridsPerPageChange={this.pageGridsChange}
                                        />
                                    </Box>
                                )}
                                {!transition && (
                                    <Box>
                                        <PainTable
                                            keyField='id'
                                            selectAll={true}
                                            data={data}
                                            total={total}
                                            page={page}
                                            pageSize={pageSize}
                                            onPageChange={this.pageChange}
                                            onMassChange={this.onMassChange}
                                            onSort={this.sortChange}
                                            onPageGridsPerPageChange={this.pageGridsChange}
                                            columns={regheads}
                                            headerBackgroundColor="orange"
                                            headerColor="white"
                                        />
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            </>
        );
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        registrationsAdminList: store.registrationsAdminList,
        plansList: store.plansList,
        registrationAdminUpdate: store.registrationAdminUpdate,
    };
}

export default connect(mapStateToProps)(Tickets);
