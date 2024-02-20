import React, { Component } from 'react';
import moment from 'moment';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { Badge } from 'reactstrap';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Button } from 'reactstrap'; 
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import BootstrapTable from 'react-bootstrap-table-next';
import s from '../office/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import Appointment from './Appointment';
import { getConsultants } from '../../actions/consultants';

class ConsultantAppointment extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "consultants",
            selectedDate:'',
            selectedDateForRest:'',
            commentAdd: false,
            selected:null
        }
        this.onDateChange = this.onDateChange.bind(this);
        this.cancel = this.cancel.bind(this);
        this.reload = this.reload.bind(this);
        this.onSelect = this.onSelect.bind(this);
        //this.onSchedulingChange = this.onSchedulingChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        var j = new Date()
        var date = j.toISOString()
        var date2 = j.toDateString()
        date = date.substring(0,10)
        date2 = date2.substring(0,15)
        this.state.selectedDate = date2
        this.state.selectedDateForRest = date;
        this.setState(this.state)
        this.props.dispatch(getConsultants({date:date}))
        setTimeout((e) => { e.reload() }, 600000,this)
    }

    reload(e) { 
        this.props.dispatch(getConsultants({date:this.state.selectedDateForRest}))
        setTimeout((e) => { e.reload() }, 600000,this)
    } 

    onSelect(e) { 
        var c = 0;
        var sel = {}
        for (c = 0; c < this.props.consultants.data.schedule.length;c++) { 
            var t = this.props.consultants.data.schedule[c]
            var m = t.schedule.filter((g) => g.id === e.appt_id);
            if (m.length > 0) { 
                sel = t
                sel['thisschedule'] = m[0]
                break;
            } 
        } 
        if (!sel.thisschedule.appt) { return; }
        this.state.selected = sel;
        this.setState(this.state);
    }
    onDateChange(e) { 
        var j = new Date(e)
        var date = j.toISOString()
        var date2 = j.toDateString()
        date = date.substring(0,10)
        date2 = date2.substring(0,15)
        this.state.selectedDate = date2
        this.state.selectedDateForRest = date;
        this.props.dispatch(getConsultants({date:date}))
        this.setState(this.state);
    } 
    cancel() { 
        this.state.selected = null;
        this.setState(this.state)
        var j = new Date(this.state.selectedDate)
        var date = j.toISOString()
        date = date.substring(0,10)
        //this.props.dispatch(getConsultants({date:date}))
    } 
    getTotal(r) { 
        var c = 0;
        var sum = 0;
        for (c; c< r.length;c++)  { 
            sum = sum + (r[c].quantity * r[c].price);
        } 
        return sum.toFixed(2)
    } 

    render() {
        var invoiceheads = [
            {
                dataField:'id',
                hidden:true,
                style:{width:"10%"},
                text:'Name'
            },
            {
                dataField:'bundle_name',
                style: { width:"30%" },
                text:'Bundle'
            },
            {
                dataField:'id',
                text:'Total',
                style: { width:"10%" },
                align:"right",
                formatter:(cellContent,row) => ( 
                    <>
                    ${this.getTotal(row.items)}
                    </>
                )
            },
            {
                dataField:'updated',
                editable:false,
                style: { width:"20%" },
                align:"center",
                text:'Updated',
                formatter:(cellContent,row) => ( 
                    <div>
                        {moment(row['updated']).format('LLL')} 
                    </div>
                )
            }
        ]
        const invoice_expand = {
            renderer: row => ( 
                <>
                <Row md="12">
                    <Col md="12">
                        <Row md="12">
                            <Col xs="7" md="7"><div class="text-center">Description</div></Col>
                            <Col xs="2" md="2"><div class="text-center">Count</div></Col>
                            <Col xs="3" md="3"><div class="text-center">Price</div></Col>
                        </Row>
                        <hr/>
                        {row.items.map((e) => { 
                            return (
                            <Row md="12">
                                <Col xs="7" md="7">{e.desc}</Col>
                                <Col xs="2" md="2"><div class="text-center">{e.quantity}</div></Col>
                                <Col xs="3" md="3"><div class="pull-right">${e.price.toFixed(2)}</div></Col>
                            </Row>
                            )
                        })}
                    </Col>
                </Row>
                </>
            )
        }
        return (
        <>
            {(this.props.consultants && this.props.consultants.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                <>
                    {(this.props.consultants && this.props.consultants.data && this.state.selected===null) && (
                        <Appointment data={this.props.consultants.data} dateSelected={this.state.selectedDate}
                            onSelected={this.onSelect} onDateChange={this.onDateChange}/>
                    )}
                    {(this.props.consultants && this.props.consultants.data && this.state.selected!==null) && (
                    <>
                        <Row md="12" style={{paddingRight:0}}>
                            <Row md="12" style={{paddingRight:0}}>
                                <Col md="6" style={{paddingRight:0}}>
                                    <Row md="12">
                                        <Col md="6"> 
                                            <h5>Customer</h5>
                                        </Col>
                                    </Row>
                                    <Row md="12">
                                        <Col xs="2" xs="2" md="2">
                                            Date: 
                                        </Col>                
                                        <Col xs="10" xs="10" md="10">
                                            {moment(this.state.selected.thisschedule.day + " "+ this.state.selected.thisschedule.time).format('LLL')}
                                        </Col>                
                                    </Row>
                                    <Row md="12">
                                        <Col xs="3" md="3">
                                            Procedure:
                                        </Col>                
                                        <Col xs="9" md="9">
                                            {this.state.selected.thisschedule.appt.customer.subprocedure.name} 
                                        </Col>                
                                    </Row>
                                    <Row md="12">
                                        <Col xs="2" md="2">
                                            Patient:    
                                        </Col>                
                                        <Col xs="10" md="10">
                                            {
                                             this.state.selected.thisschedule.appt.customer.first_name + " " + 
                                             this.state.selected.thisschedule.appt.customer.last_name
                                            }
                                        </Col>                
                                    </Row>
                                    <Row md="12">
                                        <Col xs="2" md="2">
                                            Email:    
                                        </Col>                
                                        <Col xs="10" md="10">
                                            {
                                             this.state.selected.thisschedule.appt.customer.email 
                                            }
                                        </Col>                
                                    </Row>
                                    <Row md="12">
                                        <Col xs="2" md="2">
                                            Phone:    
                                        </Col>                
                                        <Col xs="10" md="10">
                                            {
                                             this.state.selected.thisschedule.appt.customer.phone
                                            }
                                        </Col>                
                                    </Row>
                                    <Row md="12">
                                        <Col xs="3" md="3">
                                            Physician:    
                                        </Col>                
                                        <Col xs="9" md="9">
                                            {
                                             this.state.selected.thisschedule.appt.physician.title + ' ' + 
                                             this.state.selected.thisschedule.appt.physician.first_name + ' ' + 
                                             this.state.selected.thisschedule.appt.physician.last_name 
                                            }
                                        </Col>                
                                    </Row>
                                    <Row md="12" style={{paddingRight:0}}>
                                        <>
                                        <Col xs="2" md="2">
                                            Address:    
                                        </Col>                
                                        {(this.state.selected.thisschedule.appt.physician.addr && 
                                          this.state.selected.thisschedule.appt.physician.addr.length < 1) && (
                                        <Col xs="10" md="10">
                                            <h5>Address unknown, please contact support</h5>
                                        </Col>                
                                        )}
                                        {(this.state.selected.thisschedule.appt.physician.addr && 
                                          this.state.selected.thisschedule.appt.physician.addr.length > 0) && (
                                        <Col md="8">
                                            <>
                                            {(this.state.selected.thisschedule.appt.physician.addr[0].addr2 !== null &&
                                             this.state.selected.thisschedule.appt.physician.addr[0].addr2.length > 0) && (
                                            <>
                                                {this.state.selected.thisschedule.appt.physician.addr[0].addr1}<br/>
                                                {this.state.selected.thisschedule.appt.physician.addr[0].addr2}<br/>
                                                {this.state.selected.thisschedule.appt.physician.addr[0].city}&nbsp;
                                                {this.state.selected.thisschedule.appt.physician.addr[0].state},
                                                {this.state.selected.thisschedule.appt.physician.addr[0].zipcode}
                                            </>
                                            )}
                                            {(this.state.selected.thisschedule.appt.physician.addr[0].addr2 === null || 
                                             this.state.selected.thisschedule.appt.physician.addr[0].addr2.length < 1) && (
                                            <>
                                                {this.state.selected.thisschedule.appt.physician.addr[0].addr1}<br/>
                                                {this.state.selected.thisschedule.appt.physician.addr[0].city}&nbsp;
                                                {this.state.selected.thisschedule.appt.physician.addr[0].state},&nbsp;
                                                {this.state.selected.thisschedule.appt.physician.addr[0].zipcode}
                                            </>
                                            )}
                                            </>
                                        </Col>                
                                        )}
                                        </>
                                    </Row>
                                </Col>
                                <Col md="6" style={{paddingRight:0}}>
                                    <Row md="12">
                                        <h5>Invoices</h5>
                                    </Row>
                                    {(this.state.selected.thisschedule.appt.physician && 
                                      this.state.selected.thisschedule.appt.physician.invoices && 
                                      this.state.selected.thisschedule.appt.physician.invoices.length > 0) && (
                                    <Col md="12"> 
                                        <BootstrapTable 
                                            keyField='id' data={this.state.selected.thisschedule.appt.physician.invoices} 
                                            expandRow={invoice_expand}
                                            columns={invoiceheads}> 
                                        </BootstrapTable>
                                    </Col>
                                    )}
                                    {(this.state.selected.thisschedule.appt.physician.invoices && 
                                      this.state.selected.thisschedule.appt.physician.invoices && 
                                      this.state.selected.thisschedule.appt.physician.invoices.length < 1) && (
                                    <Col md="12">
                                        <h5>No active Invoices</h5>
                                    </Col>
                                    )}
                                </Col>
                            </Row>
                        </Row>
                        <hr/>
                        <Row md="12" style={{marginTop:10}}>
                            <h5>Notes</h5>
                        </Row>
                        <Row md="12" style={{marginTop:10}}>
                            <>
                            {this.state.selected.thisschedule.appt.physician.comments.sort((a,b) => (a.created > b.created ? -1:1)).map((e) => { 
                                if (e.text === null) { return (<></>) }
                                return (
                                    <Col md="4" key={e.id}>
                                        <Card style={{borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px",
                                            width:300,height:200}} className="mb-xlg border-1">
                                            <CardBody>
                                                <Row md="12">
                                                    <Col xs="6" md="6">
                                                        <font style={{fontSize:"14pt"}}>
                                                            <>
                                                            {(this.props.consultants.data.physicians.filter((g) => g.id === e.user_id).length > 0 &&  
                                                                this.props.consultants.data.physicians.filter((g) => g.id === e.user_id)[0].pain === 1) && (
                                                                <Badge style={{marginRight:10}} color="primary">DHD</Badge>
                                                            )}
                                                            {
                                                            this.props.consultants.data.physicians.filter((g) => g.id === e.user_id).length > 0 ? 
                                                            this.props.consultants.data.physicians.filter((g) => g.id === e.user_id)[0].first_name + " " +
                                                            this.props.consultants.data.physicians.filter((g) => g.id === e.user_id)[0].last_name + " " : "" 
                                                            }
                                                            </>
                                                        </font>
                                                    </Col>
                                                    <Col xs="6" md="6">
                                                        {moment(e.created).format('LLL')}
                                                    </Col>
                                                </Row>
                                                <hr/>
                                                <Row md="12">
                                                    {(!e.edit) && ( 
                                                    <Col md="12">
                                                        <div style={{overflow:"auto",height:100,display: 'flex', justifyContent: 'start'}}>
                                                        {e.text}
                                                        </div>
                                                    </Col>
                                                    )}
                                                </Row>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                )})}
                                </>
                        </Row>
                        <hr/>
                        <Row md="12">
                            {(!this.state.commentAdd) && (
                            <Col md="6">
                                <Button outline style={{marginLeft:10}} onClick={this.cancel} color="secondary">Cancel</Button>
                            </Col>
                            )}
                        </Row>
                    </>
                    )}
                </>
                </Col>                
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        consultants: store.consultants
    }
}

export default connect(mapStateToProps)(ConsultantAppointment);
