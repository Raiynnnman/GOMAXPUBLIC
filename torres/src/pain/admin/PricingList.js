import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Datetime from 'react-datetime';
import Container from '@mui/material/Container';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getPlansList } from '../../actions/plansList';
import baseURLConfig from '../../baseURLConfig';
import PainTable from '../utils/PainTable';
import TemplateSelect from '../utils/TemplateSelect';
import TemplateSelectEmpty from '../utils/TemplateSelectEmpty';
import TemplateSelectMulti from '../utils/TemplateSelectMulti';
import TemplateTextField from '../utils/TemplateTextField';
import TemplateTextArea from '../utils/TemplateTextArea';
import TemplateCheckbox from '../utils/TemplateCheckbox';
import TemplateButton from '../utils/TemplateButton';
import TemplateBadge from '../utils/TemplateBadge';
import {plansListUpdate} from '../../actions/plansListUpdate';
import { toast } from 'react-toastify';
import TemplateButtonIcon from '../utils/TemplateButtonIcon';
import AddBoxIcon from '@mui/icons-material/AddBox';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Navbar from '../../components/Navbar';

class PricingList extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            page: 0,
            pageSize: 10,
            activeTab: "pricing",
        }
        this.toggleTab = this.toggleTab.bind(this);
        this.save = this.save.bind(this);
        this.close = this.close.bind(this);
        this.reload = this.reload.bind(this);
        this.add = this.add.bind(this);
        this.startDate =this.startDate.bind(this);
        this.endDate =this.endDate.bind(this);
        this.edit = this.edit.bind(this);
        this.pageGridsChange = this.pageGridsChange.bind(this);
        this.descriptionChange = this.descriptionChange.bind(this);
        this.slotChange = this.slotChange.bind(this);
        this.priceChange = this.priceChange.bind(this);
        this.upfrontChange = this.upfrontChange.bind(this);
        this.durationChange = this.durationChange.bind(this);
    } 

    toggleTab(e) { 
        this.state.activeTab = e;
        this.setState(this.state);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getPlansList({
            limit:this.state.pageSize,
            offset:this.state.page
        }))
    }

    save() { 
        this.state.selected.end_date = this.state.selected.end_date.format("YYYYMMDD");
        this.state.selected.start_date = this.state.selected.start_date.format("YYYYMMDD");
        this.props.dispatch(plansListUpdate(this.state.selected,function(err,args) { 
                toast.success('Successfully saved plan.', {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                });
                args.close()
                args.reload()
            },this));
    } 

    close() { 
        this.state.selected = null;
        this.setState(this.state);
    } 

    descriptionChange(e) { 
        this.state.selected.description = e.target.value;
        this.setState(this.state);
    } 

    slotChange(e) { 
        this.state.selected.slot = e.target.value;
        this.setState(this.state);
    } 

    priceChange(e) { 
        this.state.selected.price = e.target.value;
        this.setState(this.state);
    } 

    upfrontChange(e) { 
        this.state.selected.upfront_cost = e.target.value;
        this.setState(this.state);
    } 

    durationChange(e) { 
        this.state.selected.duration = e.target.value;
        this.setState(this.state);
    } 

    endDate(e) { 
        this.state.selected.end_date = e
        this.setState(this.state);
    }

    startDate(e) { 
        this.state.selected.start_date = e
        this.setState(this.state);
    }

    pageGridsChange(t) { 
        this.state.pageSize = t
        this.state.page = 0
        this.setState(this.state);
        this.reload()
    } 

    reload() { 
        this.props.dispatch(getPlansList(
            {limit:this.state.pageSize,offset:this.state.page}
        ));
    }

    add() { 
        this.state.selected = {
            description: ''
        }
        this.setState(this.state);
    }
    edit(r) { 
        this.state.selected = JSON.parse(JSON.stringify(r));
        this.setState(this.state);
    } 

    render() {
        var planheads = [
            {
                dataField:'id',
                text:'ID',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                formatter:(cellContent,row) => (
                    <div>
                        <a target='_blank' style={{color:"black"}} href={baseURLConfig() + '/register-provider/' + row.id}>{row.id}</a>
                    </div>
                )
            },
            {
                dataField:'description',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'Description'
            },
            {
                dataField:'start_date',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'Start'
            },
            {
                dataField:'end_date',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'End'
            },
            {
                dataField:'duration',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'Duration'
            },
            {
                dataField:'slot',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'Slot'
            },
            {
                dataField:'upfront_cost',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'Upfront'
            }
        ]
        return (
        <>
        <Navbar/>
        <Box style={{margin:20}}>
            {(this.props.plansList && this.props.plansList.isReceiving) && (
                <AppSpinner/>
            )}
          {(this.props.plansList && this.props.plansList.data && 
            this.props.plansList.data.length > 0 &&
            this.props.plansList.data.length > 0) && (
            <>
            <Grid container xs="12">
                {!this.state.selected && ( 
                <TemplateButtonIcon
                    style={{ width:50,marginBottom: 10 }}
                    onClick={this.add}
                    label={<AddBoxIcon />}
                />
                )}
            </Grid>
            <Grid container xs="12">
                {(!this.state.selected) && ( 
                <Grid item xs="12">
                    <PainTable
                        keyField='id' data={this.props.plansList.data} 
                        page={this.state.page}
                        pageSize={this.state.pageSize}
                        onPageChange={this.pageChange}
                        onPageGridsPerPageChange={this.pageGridsChange}
                        columns={planheads}/>
                </Grid>                
                )}
                {(this.state.selected) && ( 
                <>
                <Grid item xs="3" style={{margin:20}}>
                    <TemplateTextField label="ID" readOnly value={this.state.selected.id}/>
                </Grid>                
                <Grid item xs="3" style={{margin:20}}>
                    <TemplateTextField onChange={this.descriptionChange} label="Description" value={this.state.selected.description}/>
                </Grid>                
                <Grid item xs={3} style={{margin:20}}>
                    <div style={{display:"flex",justifyContent:"space-evenly"}}>
                        <font>Start Date</font>
                        <Datetime inputProps = {{placeholder:'Start Date'}} timeFormat={false} 
                            onChange={this.startDate} value={this.state.selected.start_date} />
                    </div>
                </Grid>
                <Grid item xs={3} style={{margin:20}}>
                    <div style={{display:"flex",justifyContent:"space-evenly"}}>
                        <font>End Date</font>
                        <Datetime inputProps = {{placeholder:'End Date'}} timeFormat={false} 
                            onChange={this.endDate} value={this.state.selected.end_date} />
                    </div>
                </Grid>
                <Grid item xs="3" style={{margin:20}}>
                    <TemplateTextField onChange={this.durationChange} label="Duration" value={this.state.selected.duration}/>
                </Grid>                
                <Grid item xs="3" style={{margin:20}}>
                    <TemplateTextField onChange={this.slotChange} label="Slot" value={this.state.selected.slot}/>
                </Grid>                
                <Grid item xs="3" style={{margin:20}}>
                    <TemplateTextField onChange={this.priceChange} label="Price" value={this.state.selected.price}/>
                </Grid>                
                <Grid item xs="3" style={{margin:20}}>
                    <TemplateTextField onChange={this.upfrontChange} label="Upfront" value={this.state.selected.upfront_cost}/>
                </Grid>                
                </>
                )}
            </Grid>
            {(this.state.selected) && ( 
            <Grid container xs="12" style={{marginTop:20}}>
                <Grid item xs="12">
                    <Grid item xs="6">
                        <TemplateButton onClick={this.save} label="Save"/>
                        <TemplateButton outline style={{marginLeft:10}} onClick={this.close} 
                            color="secondary" label="Close"/>
                    </Grid>
                </Grid>
            </Grid>
            )}
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
        plansList: store.plansList
    }
}

export default connect(mapStateToProps)(PricingList);
