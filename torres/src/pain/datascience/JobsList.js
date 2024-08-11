import React, { Component } from 'react';
import { connect } from 'react-redux';
import TemplateBadge from '../utils/TemplateBadge';
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
import { getDataScienceJobs } from '../../actions/dataScienceJobs';
import PainTable from '../utils/PainTable';

class Template extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "jobs",
            page: 0,
            pageSize: 10,
        }
        this.toggleTab = this.toggleTab.bind(this);
        this.pageGridsChange = this.pageGridsChange.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.reload = this.reload.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
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

    pageGridsChange(t) { 
        this.state.pageSize = t
        this.state.page = 0
        this.setState(this.state);
        this.reload();
    } 

    reload() { 
        this.props.dispatch(getDataScienceJobs(
            {sort:this.state.sort,direction:this.state.direction,
             limit:this.state.pageSize, offset:this.state.page}
        ));
        setTimeout((e) => { e.reload() }, 300000, this)
    }

    edit(e) { 
    } 

    render() {
        var heads = [
            {
                dataField:'job_id',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'ID',
                formatter:(cellContent,row) => (
                    <div>
                        {row.job_id.substring(0,10)}
                    </div>
                )
            },
            {
                dataField:'class_name',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                text:'Class',
                formatter:(cellContent,row) => (
                    <div>
                        {row.class_name ? row.class_name : 'N/A'}
                    </div>
                )
            },
            {
                dataField:'value',
                sort:true,
                align:'center',
                text:'Status',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                formatter:(cellContent,row) => (
                    <div>
                        {(row.status === 'COMPLETE') && (<TemplateBadge label={row['status']}/>)}
                        {(row.status === 'STARTED') && (<TemplateBadge label={row['status']}/>)}
                        {(row.status === 'RUNNING') && (<TemplateBadge label={row['status']}/>)}
                        {(row.status === 'ERROR') && (<TemplateBadge label={row['status']}/>)}
                        {(row.status === 'QUEUED') && (<TemplateBadge label={row['status']}/>)}
                    </div>
                )
            },
            {
                dataField:'errors',
                align:'center',
                text:'Status',
                onClick: (content,row) => (
                    this.edit(content)
                ),
                formatter:(cellContent,row) => (
                    <div>
                        {(row.errors.length > 0) && (<TemplateBadge label='ERROR'/>)}
                        {(row.errors.length === 0) && (<TemplateBadge label='Success'/>)}
                    </div>
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
                        {/*<TemplateButtonIcon onClick={() => this.edit(row)} style={{marginRight:5,width:30,height:35}} label={<EditIcon/>}/>*/}
                    </div>
                )
            },
        ];
        return (
        <>
        <Box style={{margin:20}}>
            <Grid container xs="12">
                <Grid item xs={10}></Grid>
                <Grid item xs={2}>
                    <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                        <div style={{justifyContent:'spread-evenly'}}>
                            <TemplateButtonIcon onClick={() => this.reload()} style={{width:35}}
                                label={<AutorenewIcon/>}/>
                        </div>
                    </div>
                </Grid>
            </Grid>
            <Grid container xs="12" style={{marginTop:20}}>
                <Grid item xs="12">
                <>
                {(this.props.dataScienceJobs && this.props.dataScienceJobs.data && this.props.dataScienceJobs.data.jobs && this.props.dataScienceJobs.data.jobs.length > 0) && (
                  <PainTable
                        keyField='id' 
                        data={this.props.dataScienceJobs.data.jobs} 
                        total={this.props.dataScienceJobs.data.total}
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
        dataScienceJobs: store.dataScienceJobs
    }
}

export default connect(mapStateToProps)(Template);
