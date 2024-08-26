import React, { Component } from 'react';
import Grid from '@mui/material/Grid';
import { toast } from 'react-toastify';
import { Container, Typography, Box, Button, Chip } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { DataGrid } from '@mui/x-data-grid';
import { connect, useSelector, useDispatch } from 'react-redux';
import AppSpinner from '../utils/Spinner';
import { fetchTicketsAction } from '../../actions/ticketsUpsert';
import { getSupport } from '../../actions/support';
import { supportSave } from '../../actions/supportSave';
import TicketsUpsert from './TicketsUpsert';
import Navbar from '../../components/Navbar';
import CreateTicketModal from './CreateTicket';
import PainTable from '../utils/PainTable';
import TemplateSelect from '../utils/TemplateSelect';
import TemplateSelectEmpty from '../utils/TemplateSelectEmpty';
import TemplateSelectMulti from '../utils/TemplateSelectMulti';
import TemplateTextField from '../utils/TemplateTextField';
import TemplateCheckbox from '../utils/TemplateCheckbox';
import TemplateButton from '../utils/TemplateButton';
import TicketsEdit from './TicketsEdit';
import TemplateButtonIcon from '../utils/TemplateButtonIcon';
import TemplateBadge from '../utils/TemplateBadge';

class Tickets extends Component {
    constructor(props) { 
        super(props);
        this.state = {
            selected: null,
            currentUser: [],
            activeTab: 'alltickets',
            transition: false,
            search: null,
            createTicket: false,
            openCreateTicket: false,
            filter: [],
            mine:false,
            drawerOpen: false,
            comments: [],
            page: 0,
            pageSize: 10,
            ticketsData: [],
            total: 0,
            loading: false,
            openModal: false,
            currentTicket: null,
        };
        this.pageChange = this.pageChange.bind(this);
        this.edit = this.edit.bind(this);
        this.add = this.add.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
        this.pageGridsChange = this.pageGridsChange.bind(this);
    }
    componentDidMount() {
        this.reload();
    }

    toggleTab(e,t) { 
        this.state.activeTab = t;
        if (t !== 'alltickets') { this.state.mine = null; }
        if (t === 'mytickets') { this.state.mine = true; }
        localStorage.setItem("sup_tab_sel",t);
        this.setState(this.state);
        this.reload();
    } 

    reload() { 
        this.props.dispatch(getSupport({
            page:this.state.page,
            pageSize: this.state.pageSize
        }))
    } 

    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
    } 

    save(tosend) { 
        this.props.dispatch(supportSave(tosend,function(err,args) { 
                args.reload();
                toast.success('Successfully saved registration.', {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
                );
                args.close()
            },this));
    } 
    pageGridsChange(t) { 
        this.state.pageSize = t
        this.state.page = 0
        this.setState(this.state);
        this.reload()
    }

    pageChange(e) { 
        this.state.page = e
        this.setState(this.state);
        this.reload()
    } 

    add() { 
        this.state.selected = {
            email:'',
            first_name:'',
            initial_payment:0,
            last_name:'',
            phone: '',
            name: '',
            office_id: 0,
            invoice_items:[]
        }
    } 

    getStatusColor(status) {
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

    edit(r) { 
        this.state.selected = JSON.parse(JSON.stringify(r));
        this.setState(this.state);
    } 

    getUrgencyColor(urgency) {
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

    render() { 
        console.log("p",this.props)
        const columns = [
            { dataField: 'ticket_id', text: 'Ticket ID', 
                onClick: (content,row) => (
                    this.edit(content)
                ),
            },
            { dataField: 'first_anme', text: 'Contact', 
              formatter: (content,row) => (
                <div>{row.last_name} + ", " + {row.first_name}</div>
              ),
              onClick: (content,row) => (
                this.edit(content)
              ),
            },
            { dataField: 'ticket_name', text: 'Summary', 
                onClick: (content,row) => (
                    this.edit(content)
                ),
            },
            {
                dataField: 'status',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text: 'Status',
                flex: 1,
                formatter: (cellContent,row) => (
                    <Chip
                        label={row.value}
                        color={this.getStatusColor(row.value)}
                        variant="outlined"
                    />
                ),
            },
            {
                dataField: 'urgency_level',
                text: 'Urgency',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                formatter: (cellContent,row) => (
                    <Chip
                        label={row.value}
                        color={this.getUrgencyColor(row.value)}
                        variant="outlined"
                    />
                ),
            },
            { dataField: 'assignee_id', text: 'Assigned', 
                onClick: (content,row) => (
                    this.edit(content)
                ),
            },
            {
                dataField: 'actions',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text: 'Actions',
                formatter: (cellContent,row) => (
                    <Button
                        sx={{ width: 0 }}
                        onClick={() => this.edit(row)}
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
            {(this.props.support && this.props.support.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.supportSave && this.props.supportSave.isReceiving) && (
                <AppSpinner/>
            )}
            <Navbar />
            <Box style={{ margin: 20 }}>
                {(this.props.support && this.props.support.data && this.props.support.data.data) && (
                <>
                    {(this.state.selected !== null) && (
                    <>
                        <CreateTicketModal
                            variant="contained"
                            color="warning"
                            onClick={this.handleCreate}
                            sx={{ marginRight: '10px' }}
                            opened={this.state.openCreateTicket}
                        />
                    </>
                    )}
                    {(this.state.selected === null) && (
                    <>
                    <Tabs style={{marginBottom:20}} value={this.state.activeTab} onChange={this.toggleTab}>
                        <Tab value='mytickets' label='My Tickets'/>
                        <Tab value='alltickets' label='All Tickets'/>
                    </Tabs>
                    {(this.state.activeTab === 'mytickets' || this.state.activeTab === 'alltickets')  && ( 
                    <>
                        <Grid container xs="12" style={{marginTop:10}}>
                            <Grid item xs={.5} style={{margin:10}}>
                                <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                    <TemplateButtonIcon onClick={this.add} style={{width:50}}
                                        label={<AddBoxIcon/>}/>
                                </div>
                            </Grid>
                        </Grid>
                        <Grid container xs="12" style={{marginTop:10}}>
                        <>
                            {this.state.selected !== null && (
                                <TicketsEdit selected={this.state.selected} onSave={this.save} onCancel={this.cancel}/>
                            )}
                            {this.state.selected === null && (
                            <Grid item xs={12} style={{margin:10}}>
                                <PainTable
                                    data={this.props.support.data.data}
                                    total={this.props.support.data.total}
                                    page={this.state.page}
                                    pageSize={this.state.pageSize}
                                    onPageChange={this.pageChange}
                                    onPageGridsPerPageChange={this.pageGridsChange} 
                                    columns={columns}
                                />
                            </Grid>
                            )}
                        </>
                        </Grid>
                    </>
                   )}
                    </>
                    )}
                </>
                )}
            </Box>
        </>
        );
    }
};

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        tickets: store.ticketsReducer.list,
        support: store.support,
        supportSave: store.supportSave
    };
}

export default connect(mapStateToProps)(Tickets);
