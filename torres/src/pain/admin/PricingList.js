import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Navbar from '../../components/Navbar';

class PricingList extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            activeTab: "pricing",
        }
        this.toggleTab = this.toggleTab.bind(this);
    } 

    toggleTab(e) { 
        this.state.activeTab = e;
        this.setState(this.state);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getPlansList({page:0,limit:10000}))
    }

    render() {
        var planheads = [
            {
                dataField:'id',
                sort:true,
                text:'ID',
                formatter:(cellContent,row) => (
                    <div>
                        <a target='_blank' href={baseURLConfig() + '/register-provider/' + row.id}>{row.id}</a>
                    </div>
                )
            },
            {
                dataField:'description',
                text:'Description'
            },
            {
                dataField:'start_date',
                text:'Start'
            },
            {
                dataField:'end_date',
                text:'End'
            },
            {
                dataField:'duration',
                text:'Duration'
            },
            {
                dataField:'slot',
                text:'Slot'
            },
            {
                dataField:'price',
                text:'Price'
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
            <Grid container xs="12">
                <Grid item xs="12">
                    <PainTable
                        keyField='id' data={this.props.plansList.data} 
                        columns={planheads}/>
                </Grid>                
            </Grid>
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
