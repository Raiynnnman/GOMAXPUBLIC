import React, { Component } from 'react';
import { connect } from 'react-redux';
import TemplateBadge from '../utils/TemplateBadge';
import AddBoxIcon from '@mui/icons-material/AddBox';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
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
import { getDataScienceResults } from '../../actions/dataScienceResults';
import PainTable from '../utils/PainTable';

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
        this.add = this.add.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
        this.pageGridsChange = this.pageGridsChange.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.run = this.run.bind(this);
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

    pageGridsChange(t) { 
        this.state.pageSize = t
        this.state.page = 0
        this.setState(this.state);
        this.reload();
    } 

    reload() { 
        this.props.dispatch(getDataScienceResults(
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
        console.log("run",e);
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
                text:'ID'
            },
            {
                dataField:'name',
                sort:true,
                align:'center',
                text:'Name',
            },
            {
                dataField:'updated',
                sort:true,
                text:'Updated',
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row['updated']).format('lll')} 
                    </div>
                )
            },
            {
                dataField:'actions',
                text:'Actions',
                formatter:(cellContent,row) => ( 
                    <div>
                        {/*<TemplateButtonIcon onClick={() => this.run(row)} style={{marginRight:5,width:30,height:35}} label={<PlayArrow/>}/>*/}
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
                {(this.props.dataScienceResults && this.props.dataScienceResults.data  &&
                  this.props.dataScienceResults.data.results && this.state.selected === null) && (
                  <PainTable
                        keyField='id' 
                        data={this.props.dataScienceResults.data.results} 
                        total={this.props.dataScienceResults.data.total}
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
        dataScienceResults: store.dataScienceResults,
    }
}

export default connect(mapStateToProps)(Template);
