import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { push } from 'connected-react-router';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Button } from 'reactstrap'; 
import { Badge } from 'reactstrap';
import { Search } from 'react-bootstrap-table2-toolkit';
import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getTransfers } from '../../actions/transfers';
//import { transfersUpdate } from '../../actions/transfersUpdate';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
//import TransferAdminEdit from './TransferAdminEdit';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { SearchBar } = Search;
class TransferList extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null
        } 
        this.edit = this.edit.bind(this);
        this.cancel = this.cancel.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getTransfers({page:0,limit:10000}))
    }

   cancel() { 
        this.state.selected = null;
        this.setState(this.state);
    }
    edit(row) { 
        this.state.selected = JSON.parse(JSON.stringify(row));
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
                dataField:'id',
                sort:true,
                text:'Payee',
                formatter:(cellContent,row) => (
                    <div>
                        {row.first_name + " " + row.last_name}
                    </div>
                )
            },
            {
                dataField:'office_name',
                sort:true,
                text:'Office Name'
            },
            {
                dataField:'invoices_id',
                sort:true,
                text:'Invoice',
                align:"center",
                formatter:(cellContent,row) => (
                    <div>{row.invoices_id}</div>
                )
            },
            {
                dataField:'amount',
                sort:true,
                text:'Amount',
                align:'right',
                formatter:(cellContent,row) => (
                    <div>${row.amount.toFixed(2)}</div>
                )
            },
            {
                dataField:'created',
                sort:true,
                text:'Created',
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row['updated']).format('LLL')}
                    </div>
                )
            },
        ];
        return (
        <>
            {(this.props.transfers && this.props.transfers.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.transfers && this.props.transfers.data && 
              this.props.transfers.data.transfers &&
              this.props.transfers.data.transfers.length > 0 && this.state.selected===null) && ( 
            <>
            <Row md="12">
                <Col md="12">
                    <BootstrapTable 
                        keyField='id' data={this.props.transfers.data.transfers} 
                        columns={heads} pagination={ paginationFactory()}>
                    </BootstrapTable>
                </Col>                
            </Row>
            </>
            )}
            {(this.props && this.props.transfers && this.props.transfers.data && 
              this.props.transfers.data.transfers &&
              this.props.transfers.data.transfers.length < 1 && this.state.selected===null) && ( 
            <>
            <Row md="12">
                <Col md="12">
                    <h5>No Transfers registered</h5>
                </Col>                
            </Row>
            </>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        transfers: store.transfers
    }
}

export default connect(mapStateToProps)(TransferList);
