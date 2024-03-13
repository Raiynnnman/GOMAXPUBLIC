import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import EditIcon from '@mui/icons-material/Edit';
import Select from 'react-select';
import { push } from 'connected-react-router';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Button } from 'reactstrap'; 
import { Badge } from 'reactstrap';
import { Search } from 'react-bootstrap-table2-toolkit';
import s from './default.module.scss';
import Datetime from 'react-datetime';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getOffices } from '../../actions/offices';
import { getContext } from '../../actions/context';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Form, FormGroup, Label, Input, InputGroup, InputGroupText } from 'reactstrap';

import "react-datetime/css/react-datetime.css";
const { SearchBar } = Search;
class Scheduling extends Component {
    constructor(props) { 
        super(props);
        this.state = {
            selected:null,
            isStartTimePickerOpen: true,
            isEndTimePickerOpen: true,
        }
        this.edit = this.edit.bind(this);
        this.cancel = this.cancel.bind(this);
        this.changeStartTime = this.changeStartTime.bind(this);
        this.changeEndTime = this.changeEndTime.bind(this);
        this.toggleStartTime = this.toggleStartTime.bind(this);
        this.toggleEndTime = this.toggleEndTime.bind(this);
        this.save = this.save.bind(this);
        this.setInterval = this.setInterval.bind(this);
        this.selectPhysician = this.selectPhysician.bind(this);
        this.setDays = this.setDays.bind(this);
        this.setRecurring = this.setRecurring.bind(this);
        this.update = this.update.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    cancel() { 
        this.state.selected=null;
        this.setState(this.state);
    }
    setRecurring() {
        this.state.selected.recurring = this.state.selected.recurring ? 0 : 1;
        this.setState(this.state);
    }
    setDays(e) {
        if (this.state.selected.days.includes(e)) { 
            var t = this.state.selected.days.indexOf(e);
            this.state.selected.days.splice(t,1);
        } else { 
            this.state.selected.days.push(e);
        }
        this.setState(this.state);
    }
    selectPhysician(e) {
        this.state.selected.user_id = e.value;
        this.state.physician = {label:e.label}
        this.setState(this.state);
    }
    setInterval(e) {
        this.state.selected.inter = e.target.value;
        this.setState(this.state);
    }
    save() {
        this.props.onSchedulingChange(this.state.selected);
        setTimeout(() =>{
            this.update();
        },2000)
    }
    update(){
        window.location.reload();
        setTimeout(() =>{
            this.state.selected=null;
            this.setState(this.state);
        },100)

    }
    edit(row) { 
        if (row['id'] === 'new') { 
            this.state.selected = {
                id:'new',
                user_id:0,
                first_name:'',
                last_name:'',
                title:'',
                start_time:'',
                end_time:'',
                inter: '',
                recurring:0,
                days:[]
            }
            this.state.physician = {label:''}
        } else { 
            if (row.title) { 
                this.state.physician = {label:row['title'] + " " + row['first_name'] + " " + row['last_name']}
            } else { 
                this.state.physician = {label:row['first_name'] + " " + row['last_name']}
            } 
            this.state.selected = JSON.parse(JSON.stringify(row))
        } 
        this.setState(this.state);
    } 

    toggleEndTime() { 
        this.state.isEndTimePickerOpen = !this.state.isEndTimePickerOpen
        this.setState(this.state);
    } 
    toggleStartTime() { 
        this.state.isStartTimePickerOpen = !this.state.isStartTimePickerOpen
        this.setState(this.state);
    } 
    changeEndTime(e) { 
        if (e.format) { 
            var t = e.format('HH:mm');
            this.state.selected.end_time = t;
        } else { 
            this.state.selected.start_time = e;
        } 
    } 
    changeStartTime(e) { 
        if (e.format) { 
            var t = e.format('HH:mm');
            this.state.selected.start_time = t;
        } else { 
            this.state.selected.start_time = e;
        } 
    } 

    render() {
        const options = {
          showTotal:true,
          sizePerPage:10,
          hideSizePerPage:true
        };
        var days = {
            0:'Mon',
            1:'Tue',
            2:'Wed',
            3:'Thu',
            4:'Fri',
            5:'Sat',
            6:'Sun'
        }
        var heads = [
            {
                dataField:'id',
                sort:true,
                hidden:true,
                text:'ID'
            },
            {
                dataField:'name',
                sort:true,
                text:'Name',
                formatter: (cellContent,row) => (
                    <font>{ row.title ? row.title + " " + row.first_name + " " + row.last_name : 
                            row.first_name + " " + row.last_name } </font>
                )
            },
            {
                dataField:'start_time',
                sort:true,
                text:'Start'
            },
            {
                dataField:'end_time',
                sort:true,
                text:'End'
            },
            {
                dataField:'days',
                text:'Days',
                formatter: (cellContent,row) => (
                    <>
                    {(row.days) && ( 
                        row.days.map((e) => { 
                            return (
                                <Badge style={{marginRight:5}} color="primary">{days[e]}</Badge>
                            )
                        })
                    )}
                    </>
                )
            },
            {
                dataField:'active',
                width:"50",
                text:'Active',
                formatter: (cellContent,row) => (
                    <div>
                        {(row.active) && (<Badge color="primary">Active</Badge>)}
                        {(!row.active) && (<Badge color="danger">Inactive</Badge>)}
                    </div>
                )
            },
            {
                dataField:'id',
                text:'Actions',
                formatter:(cellContent,row) => ( 
                    <div>
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35}} color="primary"><EditIcon/></Button>
                    </div>
                )
            },
        ];
        if (this.props.data && this.props.data.length > 0 && !this.props.data[0].first_name) { 
            heads = [
                {
                    dataField:'id',
                    sort:true,
                    hidden:true,
                    text:'ID'
                },
                {
                    dataField:'start_time',
                    sort:true,
                    text:'Start'
                },
                {
                    dataField:'end_time',
                    sort:true,
                    text:'End'
                },
                {
                    dataField:'days',
                    text:'Days',
                    formatter: (cellContent,row) => (
                        <>
                        {(row.days) && ( 
                            row.days.map((e) => { 
                                return (
                                    <Badge style={{marginRight:5}} color="primary">{days[e]}</Badge>
                                )
                            })
                        )}
                        </>
                    )
                },
                {
                    dataField:'active',
                    width:"50",
                    text:'Active',
                    formatter: (cellContent,row) => (
                        <div>
                            {(row.active) && (<Badge color="primary">Active</Badge>)}
                            {(!row.active) && (<Badge color="danger">Inactive</Badge>)}
                        </div>
                    )
                },
                {
                    dataField:'id',
                    text:'Actions',
                    formatter:(cellContent,row) => ( 
                        <div>
                            <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35,width:90}} color="primary"><EditIcon/></Button>
                        </div>
                    )
                },
            ];
        } 
        return (
        <>
            {(this.state.selected === null) && (
            <Row md="12">
                <Col md="4" style={{marginBottom:10}}>
                    <Button onClick={() => this.edit({id:"new"})} style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                </Col>
            </Row>
            )}
            {(this.props && this.props.data && this.props.data.length > 0 && this.state.selected === null) && ( 
            <>
            <Row md="12">
                <BootstrapTable 
                    keyField='id' data={this.props.data} 
                    columns={heads} pagination={paginationFactory()}>
                </BootstrapTable>
            </Row>
            </>
            )}
            {(this.props && this.props.data && this.props.data.length < 1 && this.state.selected === null) && ( 
            <>
            <Row md="12">
                <Col md="12">
                    <h5>No schedules configured. Select "Add" to create new schedules.</h5>
                </Col>
            </Row>
            </>
            )}
            {(this.props && this.props.data && this.state.selected !== null) && ( 
            <Row md="12">
                <Col md="12">
                  {(this.props && this.props.assignee && this.props.assignee.length < 1) && (
                  <Row md="12">
                    <Col md="1">
                        Physician:
                    </Col>
                    <Col md="6">
                        <h6>No physicians configured.  Please add physicians first</h6>
                    </Col>
                  </Row>
                  )}
                  {(this.props && this.props.assignee && this.props.assignee.length > 0) && (
                  <Row md="12">
                    <Col md="1">
                        Physician:
                    </Col>
                    <Col md="6">
                        <Select 
                          className="selectCustomization"
                          onChange={this.selectPhysician}
                          value={this.state.physician}
                          options={this.props.assignee.filter((e) => !e.dhd).map((e) => { 
                            return ({
                                label:e.title ? e.title + " " + e.first_name + " " + e.last_name :  e.first_name + " " + e.last_name,
                                value:e.id
                            })
                          })}
                        />
                    </Col>
                  </Row>
                  )}
                  <Row md="12" style={{marginTop:10}}>
                    <Col md="1">
                        Start Time:
                    </Col>
                    <Col md="6">
                      <div className="datepicker" style={{display: 'flex'}}>
                        <Datetime
                          open={this.state.isStartTimePickerOpen} id="timepicker"
                          closeOnSelect={true} closeOnClickOutside={true}
                          timeConstraints={{hours:{min:6,max:20,step:1}}}
                          timeFormat='HH:mm'
                          input={false}
                          value={this.state.selected.start_time}
                          onChange={this.changeStartTime}
                          viewMode="time" dateFormat={false}
                        />
                          <span className="input-group-text" onClick={this.toggleStartTime} >
                            <i className="glyphicon glyphicon-time" /></span>
                      </div>
                    </Col>
                  </Row>
                  <Row md="12" style={{marginTop:10}}>
                    <Col md="1">
                        End Time:
                    </Col>
                    <Col md="6">
                      <div className="datepicker" style={{display: 'flex'}}>
                        <Datetime
                          open={this.state.isEndTimePickerOpen} id="timepicker"
                          value={this.state.selected.end_time}
                          closeOnSelect={true} closeOnClickOutside={true}
                          input={false}
                          timeFormat='HH:mm'
                          timeConstraints={{hours:{min:6,max:20,step:1}}}
                          onChange={this.changeEndTime}
                          viewMode="time" dateFormat={false}
                        />
                          <span className="input-group-text" onClick={this.toggleEndTime} >
                            <i className="glyphicon glyphicon-time" /></span>
                      </div>
                    </Col>
                  </Row>
                  <Row md="12" style={{marginTop:1}}>
                    <Col md="1">
                        Weekdays:
                    </Col>
                    <Col md="11">
                        <Row md="12">
                            <Col md="1">
                              <div onClick={() => this.setDays(0)}>
                                  <Input id="mon" checked={this.state.selected.days.includes(0)} type="checkbox" />{' '}
                                  <Label for="mon"> 
                                    Mon
                                  </Label>
                              </div>
                            </Col>
                            <Col md="1">
                              <div onClick={() => this.setDays(1)}>
                                  <Input id="tue" checked={this.state.selected.days.includes(1)} type="checkbox" />{' '}
                                  <Label for="tue"> 
                                    Tue
                                  </Label>
                              </div>
                            </Col>
                            <Col md="1">
                              <div onClick={() => this.setDays(2)}>
                                  <Input id="wed" checked={this.state.selected.days.includes(2)} type="checkbox" />{' '}
                                  <Label for="wed">
                                    Wed
                                  </Label>
                              </div>
                            </Col>
                            <Col md="1">
                              <div onClick={() => this.setDays(3)}>
                                  <Input id="thu" checked={this.state.selected.days.includes(3)} type="checkbox" />{' '}
                                  <Label for="thu">
                                    Thu
                                  </Label>
                              </div>
                            </Col>
                            <Col md="1">
                              <div onClick={() => this.setDays(4)}>
                                  <Input id="fri" checked={this.state.selected.days.includes(4)}type="checkbox" />{' '}
                                  <Label for="fri">
                                    Fri
                                  </Label>
                              </div>
                            </Col>
                            <Col md="1">
                              <div onClick={() => this.setDays(5)}>
                                  <Input id="sat" checked={this.state.selected.days.includes(5)} type="checkbox" />{' '}
                                  <Label for="sat">
                                    Sat
                                  </Label>
                              </div>
                            </Col>
                            <Col md="1">
                              <div onClick={() => this.setDays(6)}>
                                  <Input id="sun" checked={this.state.selected.days.includes(6)} type="checkbox" />{' '}
                                  <Label for="sun">
                                    Sun
                                  </Label>
                              </div>
                            </Col>
                        </Row>
                    </Col>
                  </Row>
                  {(false) && ( 
                  <Row md="12" style={{marginTop:10}}>
                    <Col md="6">
                        <FormGroup className="checkbox abc-checkbox" check>
                              <Input id="recurring" 
                                 onClick={this.setRecurring}
                                checked={this.state.selected.recurring} type="checkbox" />{' '}
                              <Label for="recurring">
                                Recurring?
                              </Label>
                        </FormGroup>
                    </Col>
                  </Row>
                  )}
                  <Row md="12" style={{marginTop:10}}>
                      <FormGroup row>
                        <Label for="normal-field" md={1} className="text-md-right">
                          Interval:
                        </Label>
                        <Col md={3}>
                          <Input type="text" id="normal-field" 
                            onChange={this.setInterval} value={this.state.selected.inter} 
                            placeholder="Interval in minutes" />
                        </Col>
                      </FormGroup>
                  </Row>
                </Col> 
                <hr/>
                <Col md="6" style={{marginTop:10}}>
                    <Button onClick={() => this.save()} style={{marginRight:5,height:35,width:90}} color="primary">Save</Button>
                    <Button onClick={() => this.cancel()} style={{marginRight:5,height:35,width:90}} outline color="primary">Cancel</Button>
                </Col>
            </Row>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
    }
}

export default connect(mapStateToProps)(Scheduling);
