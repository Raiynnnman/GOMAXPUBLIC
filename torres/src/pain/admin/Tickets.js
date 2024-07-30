import React, { Component } from 'react';
import { Container, Typography, Drawer, Grid, Box, Button } from '@mui/material';
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
import Navbar from '../../components/Navbar';
import Office365SSO from '../utils/Office365SSO';
import TicketsUpsert from './TicketsUpsert';

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
            openModal: false,
            currentTicket: null,
        };
    }

    handleEdit = (ticket) => {
        this.setState({ openModal: true, currentTicket: ticket });
    };

    handleCloseModal = () => {
        this.setState({ openModal: false, currentTicket: null });
    };

    render() {
        const { page, pageSize, data, total, transition, massSel, openModal, currentTicket } = this.state;
        const regheads = [
            {
                dataField: 'ticketNumber',
                sort: true,
                text: 'Ticket Number'
            },
            {
                dataField: 'description',
                sort: true,
                text: 'Description'
            },
            {
                dataField: 'status',
                sort: true,
                align: 'center',
                text: 'Status',
                formatter: (cellContent, row) => (
                    <div>
                        {row.status && (<TemplateBadge label={row.status} />)}
                    </div>
                )
            },
            {
                dataField: 'assignedTo',
                sort: true,
                text: 'Assigned To'
            },
            {
                dataField: 'actions',
                sort: false,
                text: 'Actions',
                formatter: (cellContent, row) => (
                    <>
                        <Button 
                            onClick={() => this.handleEdit(row)} 
                            style={{ marginRight: 5, width: 30, height: 35 }} 
                            color="warning" 
                            variant="contained"
                        >
                          <Typography variant="caption"></Typography>
                         </Button>
                    </>
                )
            }
        ];

        return (
            <>
                <Box sx={{marginRight:80}}>
                    <Office365SSO showWelcome={true} />
                     <Drawer anchor="right" open={this.state.drawerOpen} onClose={this.toggleDrawer}>
                        <Box sx={{ width: 400 }} role="presentation">
                            {/* Add filter components here */}
                        </Box>
                    </Drawer>
                    <Container>
                        <Grid container spacing={5}>
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
                                    <Box sx={{width:1600,mt:10}}> 
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
                                            headerColor="white"
                                        />
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
                {currentTicket && (
                    <TicketsUpsert
                        open={openModal}
                        onClose={this.handleCloseModal}
                        ticket={currentTicket}
                    />
                )}
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
