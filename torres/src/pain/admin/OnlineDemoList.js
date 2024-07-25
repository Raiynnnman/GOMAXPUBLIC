import React, { Component } from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Typography from '@mui/material/Typography';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { connect } from 'react-redux';
import { getPlansList } from '../../actions/plansList';
import moment from 'moment';
import { push } from 'connected-react-router';
import { searchRegister } from '../../actions/searchRegister';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getDemoList } from '../../actions/onlineDemo';
import { onlineDemoSave } from '../../actions/onlineDemoSave';
import EditIcon from '@mui/icons-material/Edit';
import { searchCheckRes } from '../../actions/searchCheckRes';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PainTable from '../utils/PainTable';
import Datetime from 'react-datetime';
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
import "react-datetime/css/react-datetime.css";
import "./OnlineDemo.css";

const timeZoneIANA = Intl.DateTimeFormat().resolvedOptions().timeZone;
class OnlineDemoList extends Component {
    constructor(props) { 
        super(props);
        this.state = {
            selected: null,
            page: 0,
            pageSize: 10,
            filter: null
        } 
        this.edit = this.edit.bind(this);
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.setStartDate = this.setStartDate.bind(this);
        this.setEndDate = this.setEndDate.bind(this);
        this.descChange = this.descChange.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.pageGridsChange = this.pageGridsChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
        if (p.onlineDemo.data && p.onlineDemo.data.config && 
            p.onlineDemo.data.config.period && this.state.periodSelected === null) { 
            var c = 0;
            var t = [];
            this.state.periodSelected = []
            this.state.periodSelected.push({
                label:p.onlineDemo.data.config.period[0].label,
                value:p.onlineDemo.data.config.period[0].value
            })
            this.state.filter = [p.onlineDemo.data.config.period[0].value]
            this.setState(this.state);
            this.props.dispatch(getDemoList(
                {period:this.state.filter,limit:this.state.pageSize,offset:this.state.page}
            ));
        }
    }

    componentDidMount() {
        this.props.dispatch(getDemoList({page:this.state.page,limit:this.state.pageSize}))
    }

    pageGridsChange(t) { 
        this.state.pageSize = t
        this.state.page = 0
        this.props.dispatch(getDemoList(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
        ));
        this.setState(this.state);
    } 

    pageChange(e) { 
        this.state.page = e
        this.props.dispatch(getDemoList(
            {direction:this.state.direction,sort:this.state.sort,search:this.state.search,limit:this.state.pageSize,offset:this.state.page,period:this.state.filter}
        ));
        this.setState(this.state);
    } 

    nameChange(e) {
        this.state.selected.name = e.target.value;
        this.setState(this.state);
    }
    endChange(e) {
        this.state.selected.end_date = e.target.value;
        this.setState(this.state);
    }
    startChange(e) {
        this.state.selected.start_date = e.target.value;
        this.setState(this.state);
    }
    reductionChange(e) {
        this.state.selected.reduction = e.target.value;
        if (this.state.selected.reduction.length < 1) { 
            this.state.selected.reduction = null;
        } 
        this.setState(this.state);
    }
    percChange(e) {
        this.state.selected.perc = e.target.value;
        if (this.state.selected.perc.length < 1) { 
            this.state.selected.perc = null;
        } 
        this.setState(this.state);
    }

    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
    } 
    totalChange(e) { 
        this.state.selected.total = e.target.value;
        if (this.state.selected.total.length < 1) { 
            this.state.selected.total = null;
        } 
        this.setState(this.state);
    } 
    descChange(e) { 
        this.state.selected.description = e.target.value;
        this.setState(this.state);
    } 
    planChange(e) { 
        this.state.selected.pricing_data_id = e.value;
        this.setState(this.state);
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
                name:'',
                start_date:'',
                end_date:'',
            }
        } else { 
            r = row
        } 
        this.state.selected=r
        this.setState(this.state);
    } 
    activeChange(e,t) { 
        this.state.selected.active = this.state.selected.active ? 0 : 1; 
        this.setState(this.state);
    }
    setStartDate(e) { 
        if (!e.format) { return; }
        this.state.selected.start_date = e
        var t = moment(e);
        this.setEndDate(t.add(moment.duration(30,'minutes')))
        this.setState(this.state);
    } 
    setEndDate(e) { 
        if (!e.format) { return; }
        this.state.selected.end_date = e
        this.setState(this.state);
    } 
    save() { 
        var tosend = this.state.selected
        console.log("tosend")
        var t = moment(tosend.start_date);
        tosend.start_date = t.format('YYYY-MM-DDTHH:mm')
        t = moment(tosend.end_date);
        tosend.end_date = t.format('YYYY-MM-DDTHH:mm')
        tosend.timezone = timeZoneIANA;
        if (tosend.id === "new") { delete tosend.id; } 
        this.props.dispatch(onlineDemoSave(tosend,function(err,args) { 
            args.props.dispatch(
                getDemoList(
                    {limit:args.state.pageSize,offset:args.state.page,status:args.state.filter},function(err,args) { 
              toast.success('Successfully saved coupon.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
              args.cancel()
            },args))
        },this));
    } 

    render() {
        console.log("s",this.state);
        var heads = [
            {
                dataField:'id',
                text:'ID'
            },
            {
                dataField:'description',
                text:'Description',
                formatter:(cellContent,row) => (
                    <div>
                        <a style={{color:"black"}} href={row.url} target="_blank">{row.description}</a>
                    </div>
                )
            },
            {
                dataField:'meeting_id',
                text:'Meeting ID',
                formatter:(cellContent,row) => (
                    <div>
                        <a style={{color:"black"}} href={row.url} target="_blank">{row.meeting_id}</a>
                    </div>
                )
            },
            {
                dataField:'url',
                text:'URL',
                formatter:(cellContent,row) => (
                    <div>
                        <a style={{color:"black"}} href={row.url} target="_blank">URL</a>
                    </div>
                )
            },
            {
                dataField:'start_date',
                text:'Start',
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row.start_date).subtract(4,"hour").format("LLL") + " EDT"}
                    </div>
                )
            },
            {
                dataField:'end_date',
                text:'End',
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row.end_date).subtract(4,'hour').format("LLL") + " EDT"}
                    </div>
                )
            },
            {
                dataField:'id',
                text:'Actions',
                editable: false,
                formatter:(cellContent,row) => ( 
                    <div>
                        <TemplateButtonIcon onClick={() => this.edit(row)} style={{marginRight:5,height:35}} label={<EditIcon/>}/>
                    </div>
                )
            }
        ];
        return (
        <>
        <Navbar/>
        <Box style={{margin:20,height:800}}>
            {(this.props.onlineDemo && this.props.onlineDemo.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.onlineDemoSave && this.props.onlineDemoSave.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.onlineDemo && this.props.onlineDemo.data && 
              this.props.onlineDemo.data.data && this.state.selected === null) && ( 
            <>
            
            <Grid container xs="12">
                <Grid item xs="2" style={{marginBottom:10}}>
                    <Grid item xs="1">
                        <TemplateButtonIcon onClick={() => this.edit({id:"new"})} style={{width:50}}
                            label={<AddBoxIcon/>}/>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container xs="12">
                <Grid item xs="12">
                    <PainTable
                        keyField='id' 
                        data={this.props.onlineDemo.data.data} 
                        total={this.props.onlineDemo.data.total}
                        page={this.state.page}
                        pageSize={this.state.pageSize}
                        onPageChange={this.pageChange}
                        onSort={this.sortChange}
                        onPageGridsPerPageChange={this.pageGridsChange}
                        columns={heads}>
                    </PainTable> 
                </Grid>                
            </Grid>
            </>
            )}
            {(this.props && this.props.onlineDemo && this.props.onlineDemo.data && 
              this.props.onlineDemo.data.data && this.state.selected !== null) && ( 
              <>
                <Grid container xs="12" style={{marginTop:20}}>
                    <Grid container xs="12">
                        <Grid item xs={12}>
                            <Typography variant="h6">All times are your current timezone {timeZoneIANA}.<br/> 
                                EDT  : {moment().utc().utcOffset(-4).format("LLL")}<br/>
                                Local: {moment().format("LLL")}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container xs="12" style={{marginTop:20}}>
                        <Grid item xs={12}>
                            <TemplateTextField type="text" id="normal-field" readOnly 
                            label="ID" value={this.state.selected.id}/>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        {this.state.selected.id && (
                        <Grid item xs={12}>
                            <TemplateTextField type="text" id="normal-field" readOnly 
                            label="ID" value={this.state.selected.id}/>
                        </Grid>
                        )}
                    </Grid>
                    <Grid container xs="12" style={{marginTop:20}}>
                        <Grid item xs={8}>
                            <TemplateTextField type="text" id="normal-field" readOnly 
                            label="UUID" value={this.state.selected.uuid ? this.state.selected.uuid : "Set By System"}/>
                        </Grid>
                    </Grid>
                    <Grid container xs="12" style={{marginTop:20}}>
                        <Grid item xs={8}>
                            <TemplateTextField type="text" id="normal-field" readOnly 
                            label="URL" value={this.state.selected.url ? this.state.selected.url : "Set By System"}/>
                        </Grid>
                    </Grid>
                    <Grid container xs="12" style={{marginTop:20}}>
                        <Grid item xs={8}>
                            <TemplateTextField type="text" id="normal-field" onChange={this.descChange}
                            label="Description" value={this.state.selected.description}/>
                        </Grid>
                    </Grid>
                    <Grid container xs="12" style={{marginTop:20}}>
                        <Grid item xs={5}>
                            <Datetime onChange={this.setStartDate} value={this.state.selected.start_date} />
                        </Grid>
                    </Grid>
                    <Grid container xs="12" style={{marginTop:20}}>
                        <Grid item xs={5}>
                            <Datetime onChange={this.setEndDate} value={this.state.selected.end_date} />
                        </Grid>
                    </Grid>
                </Grid>
                <hr/>
                <Grid container xs="12" style={{marginTop:20}}>
                    <Grid item xs="12">
                        <Grid item xs="6">
                            <TemplateButton onClick={this.save} label='Save'/>
                            <TemplateButton outline style={{marginLeft:10}} onClick={this.cancel} 
                                label='Close'/>
                        </Grid>
                    </Grid>
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
        onlineDemo: store.onlineDemo,
        onlineDemoSave: store.onlineDemoSave
    }
}

export default connect(mapStateToProps)(OnlineDemoList);
