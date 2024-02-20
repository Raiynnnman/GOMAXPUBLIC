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
import s from '../office/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {getConsultantBilling} from '../../actions/consultantBilling';
import {getConsultantBillingDocument} from '../../actions/consultantBillingDownloadDoc';

class ConsultantBilling extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
        this.downloadDocument = this.downloadDocument.bind(this)
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getConsultantBilling({page:0,limit:10000}))
    }

    downloadDocument(e) { 
        var params = {
            id: e.id
        }
        this.props.dispatch(getConsultantBillingDocument(params))
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
            {(this.props.consultantBilling && this.props.consultantBilling.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                {(this.props.consultantBilling && this.props.consultantBilling.data  &&
                  this.props.consultantBilling.data.length > 0) && (
                <Col md="12">
                    <BootstrapTable 
                        keyField='id' data={this.props.consultantBilling.data} 
                        columns={head}> 
                    </BootstrapTable>
                </Col>                
                )}
                {(this.props.consultantBilling && this.props.consultantBilling.data  &&
                  this.props.consultantBilling.data.length < 1) && (
                <Col md="12">
                    <h5>Currently no receipts are available.</h5>
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
        consultantBilling: store.consultantBilling
    }
}

export default connect(mapStateToProps)(ConsultantBilling);
