import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import cellEditFactory from 'react-bootstrap-table2-editor';
import moment from 'moment';
import { Button } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import s from './default.module.scss';
import translate from '../utils/translate';
import BootstrapTable from 'react-bootstrap-table-next';
import AppSpinner from '../utils/Spinner';

class UserInvoices extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            newcard:null,
            selected:null
        }
        this.pay = this.pay.bind(this);
        this.edit = this.edit.bind(this);
        this.cancel= this.cancel.bind(this);
        this.receipt = this.receipt.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    cancel() {
        this.state.selected = null;
        this.setState(this.state);
    }
    pay(row) { 
        window.open(row.invoice_pay_url, '_blank', 'noreferrer')
    } 
    receipt(row) { 
        window.open(row.invoice_pdf_url, '_blank', 'noreferrer')
    } 

    edit(row) { 
        this.state.selected = JSON.parse(JSON.stringify(row));
        this.setState(row)
    } 
    getTotal(r) { 
        var c = 0;
        var sum = 0;
        sum = sum + (r.quantity * r.price);
        return sum.toFixed(2)
    } 

    render() {
        var invoice_head = [
            {
                dataField:'id',
                hidden:true,
                text:'ID'
            },
            {
                dataField:'office_name',
                editable: false,
                text:'office name',
            },
            {
                dataField:'id',
                editable: false,
                text:'Procedure',
                formatter:(cellContent,row) => (
                    <div>
                        {row.subprocedure_name}: {row.day}@{row.time} for {row.first_name} {row.last_name}
                    </div>
                )
                
            },
            {
                dataField:'number',
                editable: false,
                text:'Invoice ID',
            },
            {
                dataField:'invoice_status',
                sort:true,
                text:'Status'
            },
            {
                dataField:'updated',
                sort:true,
                editable: false,
                text:'Updated',
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row['updated']).format('LLL')}
                    </div>
                )
            },
            {
                dataField:'id',
                text:'Actions',
                editable: false,
                formatter:(cellContent,row) => ( 
                    <div>
                        {(row.invoice_status === 'SENT') && (
                            <Button onClick={() => this.pay(row)} 
                                style={{marginRight:5,height:35,width:90}} color="primary">
                                Pay
                            </Button>
                        )}
                        {(row.invoice_status === 'PAID') && (
                            <Button onClick={() => this.pay(row)} 
                                style={{marginRight:5,height:35,width:90}} color="primary">
                                Receipt
                            </Button>
                        )}
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35,width:90}} color="primary">Details</Button>
                    </div>
                )
            },
        ] 
        var invoicedetailhead = [
            {
                dataField:'id',
                hidden:true,
                text:'ID'
            },
            {
                dataField:'code',
                text:'Code'
            },
            {
                dataField:'desc',
                text:'Description'
            },
            {
                dataField:'price',
                align:'right',
                text:'Price',
                formatter:(cellContent,row) => ( 
                    <div>
                        ${row.price.toFixed(2)}
                    </div>
                )
            },
            {
                dataField:'quantity',
                text:'Quantity'
            },
            {
                dataField:'id',
                text:'Total',
                formatter:(cellContent,row) => ( 
                    <>
                    ${this.getTotal(row)}
                    </>
                )
            },
        ]
        return (
        <>
            <Row md="12">
                <Col md="12">
                    <h5>Invoices</h5>
                </Col>                
            </Row>
            {(this.props.user.data.invoices.length > 0 && this.state.selected === null) && (
            <Row md="12">
                <Col md="12">
                    <BootstrapTable 
                        keyField='id' data={this.props.user.data.invoices} 
                        cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true }) }
                        columns={invoice_head}> 
                    </BootstrapTable>
                </Col>                
            </Row>
            )}
            {(this.props.user.data.invoices.length < 1 && this.state.selected === null) && (
            <Row md="12">
                <Col md="12">
                    <h4 style={{height:100}}>No invoices to show</h4>
                </Col>                
            </Row>
            )}
            {(this.props.user.data.invoices.length > 0 && this.state.selected !== null) && (
            <>
            <Row md="12">
                <Col md="3">
                    Invoice ID:
                </Col>                
                <Col md="5">
                    {this.state.selected.number}
                </Col>                
            </Row>
            <Row md="12">
                <Col md="3">
                    Office:
                </Col>                
                <Col md="5">
                    {this.state.selected.office_name}
                </Col>                
            </Row>
            <Row md="12">
                <Col md="3">
                    Physician:
                </Col>                
                <Col md="5">
                    {this.state.selected.title + " " + this.state.selected.first_name + " " + this.state.selected.last_name}
                </Col>                
            </Row>
            <Row md="12">
                <Col md="3">
                    Date:
                </Col>                
                <Col md="5">
                    {moment(this.state.selected.day + " " + this.state.selected.time).format("LLL")}
                </Col>                
            </Row>
            <Row md="12">
                <Col md="6">
                    <BootstrapTable 
                        keyField='id' data={this.state.selected.items} 
                        columns={invoicedetailhead}> 
                    </BootstrapTable>
                </Col>                
            </Row>
            <hr/>
            <Row md="12">
                <Col md="4">
                <Button outline onClick={this.cancel}>
                  Back
                </Button>
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
        user: store.user,
    }
}

export default connect(mapStateToProps)(UserInvoices);
