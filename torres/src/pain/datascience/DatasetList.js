import React, { Component } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { connect } from 'react-redux';
import TemplateBadge from '../utils/TemplateBadge';
import AddBoxIcon from '@mui/icons-material/AddBox';
import TemplateButton from '../utils/TemplateButton';
import moment from 'moment';
import TemplateButtonIcon from '../utils/TemplateButtonIcon';
import Container from '@mui/material/Container';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { getDataScienceDataset } from '../../actions/dataScienceDataset';
import { getDataScienceDatasetRun } from '../../actions/dataScienceDatasetRun';
import PainTable from '../utils/PainTable';
import DatasetEdit from './DatasetEdit';

class Template extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "jobs",
            selected: null,
            page: 0,
            pageSize: 10,
        }
        this.toggleTab = this.toggleTab.bind(this);
        this.edit = this.edit.bind(this);
        this.add = this.add.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
        this.pageGridsChange = this.pageGridsChange.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.reload = this.reload.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.reload();
    }

    toggleTab(e, t) {
        this.state.activeTab = t;
        this.setState(this.state);
    }

    pageChange(e) { 
        this.state.page = e
        this.setState(this.state);
        this.reload();
    } 
    run(e) { 
        console.log("run",e);
    } 

    pageGridsChange(t) { 
        this.state.pageSize = t
        this.state.page = 0
        this.setState(this.state);
        this.reload();
    } 

    reload() { 
        this.props.dispatch(getDataScienceDataset(
            {sort:this.state.sort,direction:this.state.direction,
             limit:this.state.pageSize, offset:this.state.page}
        ));
        setTimeout((e) => { e.reload() }, 600000, this)
    }

    save() { 
    } 
    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
    } 
    add(e) { 
        this.state.selected = {tables:[]}
        this.setState(this.state);
    } 
    run(e) { 
        this.props.dispatch(getDataScienceDatasetRun({id:e.id}));
    } 
    edit(e) { 
        this.state.selected = e;
        this.setState(this.state);
    } 

    render() {
        console.log("p",this.props);
        var heads = [
            {
                dataField:'id',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'ID'
            },
            {
                dataField:'name',
                sort:true,
                align:'center',
                text:'Name',
                onClick: (content,row) => (
                    this.edit(content)
                )
            },
            {
                dataField:'updated',
                sort:true,
                text:'Updated',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row['updated']).format('LLL')} 
                    </div>
                )
            },
            {
                dataField:'actions',
                text:'Actions',
                formatter:(cellContent,row) => ( 
                    <div>
                        <TemplateButtonIcon onClick={() => this.run(row)} style={{marginRight:5,width:30,height:35}} label={<PlayArrowIcon/>}/>
                    </div>
                )
            },
        ];
        console.log("p",this.props);
        return (
        <>
        <Box style={{margin:20}}>
            <Grid container xs="12">
                <Grid item xs={10}></Grid>
                <Grid item xs={2}>
                    <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                        {(!this.state.selected) && (
                        <div style={{justifyContent:'space-around'}}>
                            <TemplateButtonIcon onClick={this.add} style={{width:50}}
                                label={<AddBoxIcon/>}/>
                            <TemplateButtonIcon onClick={() => this.reload()} style={{width:35}}
                                label={<AutorenewIcon/>}/>
                        </div>
                        )}
                    </div>
                </Grid>
            </Grid>
            <Grid container xs="12" style={{marginTop:20}}>
                <Grid item xs="12">
                <>
                {(this.props.dataScienceDataset && this.props.dataScienceDataset.data && this.state.selected !== null) && (
                <>
                    <Grid container xs="12" style={{marginTop:20}}>
                        <Grid item xs="12">
                            <DatasetEdit onSave={this.save} onCancel={this.cancel} selected={this.state.selected}/>
                        </Grid>
                    </Grid>
                </>
                )}
                {(this.props.dataScienceDataset && this.props.dataScienceDataset.data  &&
                  this.props.dataScienceDataset.data.dataset && this.state.selected === null) && (
                  <PainTable
                        keyField='id' 
                        data={this.props.dataScienceDataset.data.dataset} 
                        total={this.props.dataScienceDataset.data.total}
                        page={this.state.page}
                        pageSize={this.state.pageSize}
                        onPageChange={this.pageChange}
                        onSort={this.sortChange}
                        onPageGridsPerPageChange={this.pageGridsChange}
                        columns={heads}>
                  </PainTable> 
                )}
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
        dataScienceDataset: store.dataScienceDataset,
        dataScienceMetadata: store.dataScienceMetadata
    }
}

export default connect(mapStateToProps)(Template);
