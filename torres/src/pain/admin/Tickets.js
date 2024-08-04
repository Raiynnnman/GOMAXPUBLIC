import React, { Component, useEffect } from 'react';
import { Container, Typography, Drawer, Grid, Box, Button, Chip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { connect } from 'react-redux';
import AppSpinner from '../utils/Spinner';
import { fetchTicketsAction } from '../../actions/ticketsUpsert';
import PainTable from '../utils/PainTable';
import TicketsUpsert from './TicketsUpsert';
import Navbar from '../../components/Navbar';

class Tickets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: null,
            currentUser: [],
            activeTab: 'tickets',
            transition: false,
            search: null,
            filter: [],
            drawerOpen: false,
            comments:[],
            page: 0,
            pageSize: 10,
            ticketsData: [],
            total: 0,
            loading: false,
            openModal: false,
            currentTicket: null,
        };
    }
    componentDidMount() {
      const { currentUser } = this.props;
      if (!currentUser) {
          return;
      }
      this.setState({ currentUser: currentUser }, () => {
          this.props.dispatch(fetchTicketsAction(currentUser));
      });
  }
    
    componentWillUnmount() {
      this.setState({ticketsData: [], comments: [],total: 0});
    }
    
    handleEdit = (ticket) => {
        this.setState({ openModal: true, currentTicket: ticket });
    };

    handleCloseModal = () => {
        this.setState({ openModal: false, currentTicket: null });
    };

    getStatusColor = (status) => {
        switch (status) {
            case 'Open':
                return 'success';
            case 'In Progress':
                return 'info';
            case 'Closed':
                return 'success';
            case 'Overdue':
                return 'error';
            default:
                return 'default';
        }
    };

    getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 1:
                return 'green';
            case 'Medium':
                return 'warning';
            case 'Critical':
                return 'error';
            default:
                return 'default';
        }
    };

    render() {
        const { page, pageSize, ticketsData, total, loading, openModal, currentTicket, comments,currentUser} = this.state;
        const regheads = [
            {
                dataField: 'id',
                sort: true,
                text: 'Ticket ID'
            },
            {
              dataField: 'name',
              sort: true,
              text: 'Ticket Name'
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
                    <Chip 
                        label={row.status} 
                        color={this.getStatusColor(row.status)}
                        variant="outlined"
                    />
                )
            },
            {
                dataField: 'urgency',
                sort: true,
                align: 'center',
                text: 'Urgency',
                formatter: (cellContent, row) => (
                    <Chip 
                        label={row.urgency} 
                        color={this.getUrgencyColor(row.urgency)}
                        variant="outlined"
                    />
                )
            },
            {
                dataField: 'assignee_id',
                sort: true,
                text: 'Assigned To'
            },
            {
                dataField: 'actions',
                sort: false,
                text: 'Actions',
                formatter: (cellContent, row) => (
                    <Button 
                        onClick={() => this.handleEdit(row)} 
                        startIcon={<VisibilityIcon />} 
                        color="primary" 
                        variant="contained"
                    >
                        View Ticket
                    </Button>
                )
            }
        ];
        return (
            <>
            <Navbar/>
                <Box sx={{ marginRight: 80 }}>
                    <Container>
                    <Typography sx={{mt:4}}variant="h2">
                      Tickets
                    </Typography>
                        <Grid container spacing={5}>
                            <Grid item xs={12}>
                                {loading ? (
                                    <AppSpinner />
                                ) : (
                                    <Box sx={{ width: 1600, mt: 10 }}> 
                                        <PainTable
                                            keyField='id'
                                            selectAll={true}
                                            data={ticketsData}
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
                        comments={comments}
                    />
                )}
            </>
        );
    }
}

function mapStateToProps(store) {
  return {
      currentUser: store.auth.currentUser,
      tickets: store.ticketsReducer.list,
  }
};

export default connect(mapStateToProps)(Tickets);
 
