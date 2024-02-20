import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import s from '../office/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getLeads } from '../../actions/leads';
import { leadsSave } from '../../actions/leadsSave';
import { leadsStatus } from '../../actions/leadsStatus';
import LeadsList from './LeadsList';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class Leads extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            filters:[
                {label:'My Leads',value:1},
                {label:'All Leads',value:0}
            ],
            search:'',
            filterSelected:{label:'My Leads',value:1},
            statusSelected:{label:'OPEN',value:1},
            tableData:[]
        }
        this.onFilterChange = this.onFilterChange.bind(this);
        this.reload = this.reload.bind(this);
        this.onSearchChange = this.onSearchChange.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onStatusUpdate = this.onStatusUpdate.bind(this);
        this.onSave = this.onSave.bind(this);
    } 

    componentWillReceiveProps(p) { 
        if (p.leads && p.leads.data && p.leads.data.leads) { 
            this.state.tableData = p.leads.data.leads;
            this.setState(this.state)
        } 
    }

    onStatusUpdate(e) { 
        this.props.dispatch(leadsStatus(e)).then(() => { 
            this.props.dispatch(getLeads({
                status:this.state.statusSelected.value,filter:this.state.filterSelected.value,page:0,limit:10000}
            ))
        })
    } 

    onSearchChange(e) { 
        this.state.search = e.target.value;
        this.setState(this.state);
    } 

    onSave(e) { 
    } 

    onStatusChange(e) { 
        this.props.dispatch(getLeads({status:e.value,filter:this.state.filterSelected.value,page:0,limit:10000}))
        this.state.statusSelected = e
        this.setState(this.state)
    }
    onFilterChange(e) { 
        this.props.dispatch(getLeads({status:this.state.statusSelected.value,filter:e.value,page:0,limit:10000}))
        this.state.filterSelected = e
        this.setState(this.state)
    } 

    componentDidMount() {
        this.props.dispatch(getLeads({
            status:this.state.statusSelected.value,
            filter:this.state.filterSelected.value,page:0,limit:10000}))
        setTimeout((e) => { e.reload() }, 900000,this)
    }
    reload(e) { 
        this.props.dispatch(getLeads({
            status:this.state.statusSelected.value,
            filter:this.state.filterSelected.value,page:0,limit:10000}))
        setTimeout((e) => { e.reload() }, 900000,this)
    } 

    render() {
        var countNew = {}
        var c = 0;
        for (c;c<this.state.tableData.length;c++) { 
            var t = this.state.tableData[c]
            var l = localStorage.getItem("comment-1-read-" + t['id'])
            if (l === null || l.length < 1) { 
               countNew[t.id] = t.comments.length 
            } else { 
                var j = t.comments.filter((e) => moment(e.created).isAfter(l));
                var q = j.filter((e) => e.user_id !== undefined);
                countNew[t.id] = q.length
            } 
        } 
        var filterData = []
        if (this.state.search.length > 0) { 
            var email = this.state.tableData.filter((e) => e.email.toLowerCase().includes(this.state.search.toLowerCase()))
            var fname = this.state.tableData.filter((e) => e.first_name.toLowerCase().includes(this.state.search.toLowerCase()))
            var lname = this.state.tableData.filter((e) => e.last_name.toLowerCase().includes(this.state.search.toLowerCase()))
            var merge = [...email, ...fname, ...lname ]
            var c = 0;
            for (c; c < merge.length; c++) { 
                var t = merge[c];
                var m = filterData.filter((e) => e.id === t.id)
                if (m.length < 1) { 
                    filterData.push(t);
                } 
            } 
        } else { 
            if (this.state.tableData) { 
                filterData = this.state.tableData;
            } 
        } 
        return (
        <>
            {(this.props.leads && this.props.leads.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.leadsSave && this.props.leadsSave.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                    <LeadsList filters={this.state.filters} data={filterData} filterSelected={this.state.filterSelected} 
                        statusSelected={this.state.statusSelected} onStatusChange={this.onStatusChange}
                        onSearchChange={this.onSearchChange} search={this.state.search} countNew={countNew}
                        onFilterChange={this.onFilterChange} onSave={this.onSave} onStatusUpdate={this.onStatusUpdate}/>
                </Col>                
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        leads: store.leads,
        leadsSave: store.leadsSave
    }
}

export default connect(mapStateToProps)(Leads);
