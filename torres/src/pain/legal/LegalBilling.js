import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import BootstrapTable from 'react-bootstrap-table-next';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {getLegalBilling} from '../../actions/legalBilling';
import {getLegalBillingDocument} from '../../actions/legalBillingDownloadDoc';

class LegalBilling extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
        this.downloadDocument = this.downloadDocument.bind(this)
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getLegalBilling({page:0,limit:10000}))
    }

    downloadDocument(e) { 
        var params = {
            id: e.id
        }
        this.props.dispatch(getLegalBillingDocument(params))
    } 

    render() {
        var head =  [ 
            {dataField:'id', sort:true, text:'ID', hidden:true},
            {dataField:'description', sort:true, text:'Description', editable:false,hidden:false},
            {
                dataField:'amount', sort:true, text:'Amount', hidden:false,
                formatter:(cellContent,row) => (
                    <div>
                        ${row.price.toFixed(2)}
                    </div>
                )
            },
            {
                dataField:'documents', sort:true, text:'Documents', hidden:false,
                formatter:(cellContent,row) => (
                    <div>
                    {row.documents.map((e) => { 
                        return (
                            <Button onClick={() => this.downloadDocument(e)} color="primary">{e.description}</Button>
                        )
                    })}
                    </div>
                )
            
            },
            {
                dataField:'transfer_date', sort:false, text:'Transfer Date', hidden:false,
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row['transfer_date']).format('LLL')}
                    </div>
                )
            },
        ]
        return (
        <>
            {(this.props.legalBilling && this.props.legalBilling.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                {(this.props.legalBilling && this.props.legalBilling.data  &&
                  this.props.legalBilling.data.length > 0) && (
                <Col md="12">
                    <BootstrapTable 
                        keyField='id' data={this.props.legalBilling.data} 
                        columns={head}> 
                    </BootstrapTable>
                </Col>                
                )}
                {(this.props.legalBilling && this.props.legalBilling.data  &&
                  this.props.legalBilling.data.length < 1) && (
                <Col md="12">
                    <h5>Currently no invoices are available.</h5>
                </Col>
                )}
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        legalBilling: store.legalBilling
    }
}

export default connect(mapStateToProps)(LegalBilling);
