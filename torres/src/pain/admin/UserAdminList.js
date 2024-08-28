import React, { Component } from 'react';
import LaunchIcon from '@mui/icons-material/Launch';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { connect } from 'react-redux';
import moment from 'moment';
import { push } from 'connected-react-router';
import cx from 'classnames';
import classnames from 'classnames';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getContext } from '../../actions/context';
import { getUserAdmin } from '../../actions/userAdmin';
import EditIcon from '@mui/icons-material/Edit';
import { searchCheckRes } from '../../actions/searchCheckRes';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PainTable from '../utils/PainTable';
import TemplateSelect from '../utils/TemplateSelect';
import TemplateSelectEmpty from '../utils/TemplateSelectEmpty';
import TemplateSelectMulti from '../utils/TemplateSelectMulti';
import TemplateTextField from '../utils/TemplateTextField';
import TemplateTextArea from '../utils/TemplateTextArea';
import TemplateCheckbox from '../utils/TemplateCheckbox';
import TemplateButton from '../utils/TemplateButton';
import TemplateButtonIcon from '../utils/TemplateButtonIcon';
import TemplateBadge from '../utils/TemplateBadge';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Navbar from '../../components/Navbar';

class UserAdminList extends Component {
    constructor(props) { 
        super(props);
        this.state = {
            selected: null,
            assignPhysician: null,
            page: 0,
            pageSize: 10,
            commentAdd:false
        } 
        this.getContext = this.getContext.bind(this);
        this.edit = this.edit.bind(this);
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.renderTotalLabel = this.renderTotalLabel.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.zipcodeChange = this.zipcodeChange.bind(this);
        this.firstChange = this.firstChange.bind(this);
        this.lastChange = this.lastChange.bind(this);
        this.addr1Change = this.addr1Change.bind(this);
        this.addr2Change = this.addr2Change.bind(this);
        this.cityChange = this.cityChange.bind(this);
        this.stateChange = this.stateChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getUserAdmin({page:this.state.page,limit:this.state.pageSize}))
    }

    addr1Change(e) {
        this.state.selected.addr1 = e.target.value;
        this.setState(this.state);
    }
    addr2Change(e) {
        this.state.selected.addr2 = e.target.value;
        this.setState(this.state);
    }
    cityChange(e) {
        this.state.selected.city = e.target.value;
        this.setState(this.state);
    }
    stateChange(e) {
        this.state.selected.state = e.target.value;
        this.setState(this.state);
    }

    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
    } 
    zipcodeChange(e) { 
        this.state.selected['zipcode'] = e.target.value;
        this.setState(this.state);
    } 
    emailChange(e) { 
        this.state.selected['email'] = e.target.value;
        this.setState(this.state);
    } 
    getContext(e) { 
        this.props.dispatch(getContext({office:e.office_id},function(err,args) { 
                localStorage.setItem("context",true);
                window.location.href = '/app';
        }))
    } 
    pageChange(e,t) { 
        if (e === '>') { 
            this.state.page = this.state.page + 1;
        } else { 
            this.state.page = e - 1;
        }
        this.props.dispatch(getUserAdmin(
            {limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 

    renderTotalLabel(f,t,s) { 
        var numpage = s/t;
        return "Showing page " + (this.state.page+1) + " of " + numpage.toFixed(0);
    } 
    firstChange(e) { 
        this.state.selected['first_name'] = e.target.value;
        this.setState(this.state);
    } 
    lastChange(e) { 
        this.state.selected['last_name'] = e.target.value;
        this.setState(this.state);
    } 
    phoneChange(e) { 
        this.state.selected['phone'] = e.target.value;
        this.setState(this.state);
    } 

    edit(row) { 
        var r = {}
        if (row.id === 'new') { 
            r = { 
                email:'',
                phone:'',
                addr1:'',
                addr2:'',
                city:'',
                state:'',
                zipcode:'',
                first_name:'',
                last_name:''
            }
        } else { 
            r = row
        } 
        this.state.selected=r
        this.setState(this.state);
    } 
    save() { 
        this.props.onSave(this.state.selected);
        this.state.selected = null;
        this.setState(this.state);
    } 

    render() {
        var heads = [
            {
                dataField:'id',
                sort:true,
                hidden:true,
                text:'ID'
            },
            {
                dataField:'first_name',
                editable: false,
                text:'Name',
                formatter:(cellContent,row) => (
                    <div>
                        {row.first_name + " " + row.last_name}
                    </div>
                )
            },
            {
                dataField:'email',
                editable: false,
                text:'Email',
            },
            {
                dataField:'phone',
                editable: false,
                text:'Phone',
            },
            {
                dataField:'active',
                editable: false,
                text:'Active',
                formatter: (cellContent,row) => (
                    <div>
                        {(row.active === 1) && (<TemplateBadge label="Active"/>)}
                        {(row.active === 0) && (<TemplateBadge label="Inactive"/>)}
                    </div>
                )
            },
            {
                dataField:'updated',
                sort:true,
                editable: false,
                text:'Updated',
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row['updated']).isValid() ?  
                         moment(row['updated']).format('lll') : moment(row['updated2']).format('lll')}
                    </div>
                )
            },
            {
                dataField:'id',
                text:'Actions',
                formatter:(cellContent,row) => ( 
                    <div>
                        {/*<TemplateButton onClick={() => this.edit(row)} style={{marginRight:5,height:35}} label={<EditIcon/>}/>*/}
                        <TemplateButtonIcon onClick={() => this.getContext(row)} style={{height:35}} label={<LaunchIcon/>}/>
                    </div>
                )
            },
        ];
        return (
        <>
        <Box style={{margin:0}}>
            {(this.props.userAdmin && this.props.userAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.userAdmin && this.props.userAdmin.data && 
              this.props.userAdmin.data.users && this.state.selected === null) && ( 
            <>
            <Grid container xs="12">
                <Grid item xs="2" style={{marginBottom:10}}>
                    {/*<TemplateButtonIcon onClick={() => this.edit({id:"new"})} 
                        style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                    */}
                </Grid>
            </Grid>
            <Grid container xs="12">
                <Grid item xs="12">
                      <PainTable
                          keyField="id"
                          data={ this.props.userAdmin.data.users }
                          columns={ heads }
                          />
                </Grid>                
            </Grid>
            </>
            )}
            {(this.props && this.props.userAdmin && this.props.userAdmin.data && 
              this.props.userAdmin.data.users && this.state.selected !== null) && ( 
            <>
            <Grid container xs="12">
                <Grid item xs="5">
                    <h5>Details</h5>
                </Grid>
            </Grid>
            <Grid container xs="12">
                <Grid item xs="5">
                    <Grid container xs="12">
                        <Grid item xs="12">
                            <Grid item xs={7}>
                              <TemplateTextField type="text" id="normal-field" onChange={this.emailChange} label="Email" value={this.state.selected.email}/>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                            <Grid item xs={7}>
                              <TemplateTextField type="text" id="normal-field" onChange={this.firstChange} label="First Name" value={this.state.selected.first_name}/>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                            <Grid item xs={7}>
                              <TemplateTextField type="text" id="normal-field" onChange={this.lastChange} label="Last Name" value={this.state.selected.last_name}/>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                            <Grid item xs={7}>
                              <TemplateTextField type="text" id="normal-field" onChange={this.phoneChange} label="Phone" value={this.state.selected.phone}/>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                            <Grid item xs={7}>
                              <TemplateTextField type="text" id="normal-field" onChange={this.addr1Change} label="Address 1" value={this.state.selected.addr1}/>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                            <Grid item xs={7}>
                              <TemplateTextField type="text" id="normal-field" onChange={this.addr2Change} label="Address 1" value={this.state.selected.addr2}/>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                            <Grid item xs={7}>
                              <TemplateTextField type="text" id="normal-field" onChange={this.cityChange} label="Address 1" value={this.state.selected.city}/>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                            <Grid item xs={7}>
                              <TemplateTextField type="text" id="normal-field" onChange={this.stateChange} label="Address 1" value={this.state.selected.state}/>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                            <Grid item xs={7}>
                              <TemplateTextField type="text" id="normal-field" onChange={this.zipcodeChange} label="Zip" value={this.state.selected.zipcode}/>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <hr/>
            <Grid container xs="12">
                {(!this.state.commentAdd) && (
                <Grid item xs="6">
                    <TemplateButton onClick={this.save} label='Save'/>
                    <TemplateButton outline style={{marginLeft:10}} onClick={this.cancel} label='Cancel'/>
                </Grid>
                )}
            </Grid>
            </>
            )}
        </Box>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        userAdmin: store.userAdmin
    }
}

export default connect(mapStateToProps)(UserAdminList);
