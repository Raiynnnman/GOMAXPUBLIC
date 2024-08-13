import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Chip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DataGrid } from '@mui/x-data-grid';
import { connect, useSelector, useDispatch } from 'react-redux';
import AppSpinner from '../utils/Spinner';
import { fetchTicketsAction } from '../../actions/ticketsUpsert';
import TicketsUpsert from './TicketsUpsert';
import Navbar from '../../components/Navbar';
import CreateTicketModal from './CreateTicket';

const Tickets = (props) => {
    const dispatch = useDispatch();
    const [state, setState] = useState({
        selected: null,
        currentUser: [],
        activeTab: 'tickets',
        transition: false,
        search: null,
        createTicket: false,
        openCreateTicket: false,
        filter: [],
        drawerOpen: false,
        comments: [],
        page: 0,
        pageSize: 10,
        ticketsData: [],
        total: 0,
        loading: false,
        openModal: false,
        currentTicket: null,
    });

    const currentUser = useSelector((state) => state.auth.currentUser);
    const tickets = useSelector((state) => state.ticketsReducer.list);

    useEffect(() => {
        if (currentUser) {
            setState((prevState) => ({ ...prevState, currentUser: currentUser }));
            dispatch(fetchTicketsAction(currentUser, state.page, state.pageSize));
        }
    }, [currentUser, dispatch, state.page, state.pageSize]);

    useEffect(() => {
        if (tickets) {
            setState((prevState) => ({
                ...prevState,
                ticketsData: tickets.tickets,
                comments: tickets.comments,
                total: tickets.total,
                loading: false,
            }));
        }
    }, [tickets]);

    const handleEdit = (ticket) => {
        setState((prevState) => ({ ...prevState, openModal: true, currentTicket: ticket }));
    };

    const handleCreate = () => {
        setState((prevState) => ({ ...prevState, createTicket: true, openCreateTicket: true }));
    };

    const handleCloseModal = () => {
        setState((prevState) => ({ ...prevState, openModal: false, currentTicket: null }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open':
                return 'success';
            case 'In Progress':
                return 'info';
            case 'Closed':
                return 'success';
            case 'Review':
                return 'error';
            default:
                return 'default';
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'Low':
                return 'success'; 
            case 'Medium':
                return 'warning';  
            case 'High':
                return 'error';   
            case 'Critical':
                return 'error';   
            default:
                return 'default';
        }
    };

    const { page, pageSize, ticketsData, total, loading, openModal, currentTicket, comments } = state;
    console.log("this is the currentTicket", currentTicket,comments)

    const columns = [
        { field: 'id', headerName: 'Ticket ID', flex: 1 },
        { field: 'name', headerName: 'Ticket Name', flex: 2 },
        { field: 'description', headerName: 'Description', flex: 3 },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={getStatusColor(params.value)}
                    variant="outlined"
                />
            ),
        },
        {
            field: 'urgency_level',
            headerName: 'Urgency',
            flex: 1,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={getUrgencyColor(params.value)}
                    variant="outlined"
                />
            ),
        },
        { field: 'assignee_id', headerName: 'Assigned To', flex: 2 },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            renderCell: (params) => (
                <Button
                    sx={{ width: 0 }}
                    onClick={() => handleEdit(params.row)}
                    startIcon={<VisibilityIcon   />}
                    color="warning"
                    variant="contained"
                >
                </Button>
            ),
        },
    ];

    return (
        <>
            <Navbar />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 16px', mt: 4 }}>
                <Typography variant="h2">
                    Tickets
                </Typography>
                <CreateTicketModal
                    variant="contained"
                    color="warning"
                    onClick={handleCreate}
                    sx={{ marginRight: '10px' }}
                    opened={state.openCreateTicket}
                />
            </Box>
            <Container sx={{ mt: 4 }}>
                {loading ? (
                    <AppSpinner />
                ) : (
                    <Box sx={{ width: '100%', height: 600 }}>
                        <DataGrid
                            rows={ticketsData}
                            columns={columns}
                            pagination
                            pageSize={pageSize}
                            rowCount={total}
                            paginationMode="server"
                            onPageChange={(newPage) => setState((prevState) => ({ ...prevState, page: newPage }))}
                            onPageSizeChange={(newPageSize) => setState((prevState) => ({ ...prevState, pageSize: newPageSize }))}
                            loading={loading}
                            autoHeight
                            rowsPerPageOptions={[10, 25, 50]}
                        />
                    </Box>
                )}
            </Container>
            {currentTicket && (
                <TicketsUpsert
                    open={openModal}
                    onClose={handleCloseModal}
                    ticket={currentTicket}
                    comments={comments}
                />
            )}
        </>
    );
};

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        tickets: store.ticketsReducer.list,
    };
}

export default connect(mapStateToProps)(Tickets);
