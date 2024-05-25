import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getOfficeInvoices } from '../../actions/officeInvoices';
import OfficeInvoicesList from './OfficeInvoicesList';

class Template extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            filters:[ ],
            filterSelected:{},
        }
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onStatusUpdate = this.onStatusUpdate.bind(this);
    } 

    componentWillReceiveProps(p) { 
        if (this.state.filters.length < 1 && p.officeInvoices && p.officeInvoices.data && 
            p.officeInvoices.data.config && p.officeInvoices.data.config.status) { 
            this.state.filterSelected = {
                label:p.officeInvoices.data.config.status[0].name,
                id:p.officeInvoices.data.config.status[0].id
            }
            this.state.filters = p.officeInvoices.data.config.status
            .filter((e) => e.id !== 1 && e.eid !== 2)
            .map((e) => { 
                return (
                    {label:e.name,value:e.id}
                )
            })
        }
    }
    onStatusUpdate(e) { 
        /*this.props.dispatch(officeInvoicesStatus(e)).then(() => { 
            this.props.dispatch(getOfficeInvoices({
                filter:this.state.filterSelected.value,page:0,limit:10000}
            ))
        })*/
    } 
    onFilterChange(e) { 
        this.props.dispatch(getOfficeInvoices({filter:e.value,page:0,limit:10000}))
        this.state.filterSelected = e
        this.setState(this.state)
    } 

    componentDidMount() {
        this.props.dispatch(getOfficeInvoices({page:0,limit:10000}))
    }

    render() {
        return (
        <>
            {(this.props.officeInvoices && this.props.officeInvoices.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                    <OfficeInvoicesList filters={this.state.filters} filterSelected={this.state.filterSelected} 
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
        officeInvoices: store.officeInvoices
    }
}

export default connect(mapStateToProps)(Template);
