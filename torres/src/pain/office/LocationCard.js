import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import Calendar from 'react-calendar';
import GoogleAutoComplete from '../utils/GoogleAutoComplete';
import 'react-calendar/dist/Calendar.css';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { Badge,Button } from 'reactstrap';
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import AppSpinnerInternal from '../utils/SpinnerInternal';
import { getMoreSchedules } from '../../actions/moreSchedules';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import googleKey from '../../googleConfig';
import { isValidDate } from '../utils/validationUtils';
import formatPhoneNumber from '../utils/formatPhone';

class LocationCard extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            more: {},
            inMore:0,
            lastMore:0,
            value:'',
            dateSelected:'',
            pickDay: false,
            dateSelectedForRest:'',
            selected:null
        }
        this.onDateChange = this.onDateChange.bind(this);
        this.save = this.save.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
        this.getDate = this.getDate.bind(this);
        this.changeValue = this.changeValue.bind(this);
        this.scheduleAppt = this.scheduleAppt.bind(this);
        this.selectDay = this.selectDay.bind(this);
        this.moreToggle = this.moreToggle.bind(this);
    } 

    componentWillReceiveProps(np) { 
        if (this.state.selected === null && np.provider && np.provider.about) { 
            this.state.selected = np.provider;
            this.setState(this.state);
        }
        if (this.props.edit && this.state.selected === null) { 
            this.state.selected = this.props.provider;
        } 
    }

    componentDidMount() {
        var j = new Date()
        var date = j.toISOString()
        var date2 = j.toDateString()
        date = date.substring(0,10)
        date2 = date2.substring(0,15)
        this.state.dateSelected = date2
        this.state.dateSelectedForRest = date;
        if (this.props.edit && this.state.selected === null) { 
            this.state.selected = this.props.provider;
        } 
        this.setState(this.state)
    }

    save() { 
    } 
    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
        this.props.onCancel();
    }
    selectDay() { 
        this.state.pickDay = true;
        this.setState(this.state)
    } 
    onSelected(e,t) { 
        //this.props.onSelected(e,t);
        this.state.loaded=true;
        this.setState(this.state)
    } 

    changeValue(e,t) { 
        if (t.target && t.target.value) { 
            this.state.selected[e] = t.target.value;
        } else { 
            this.state.selected = {...this.state.selected, ...t};
        } 
        if (e === 'phone') { 
            let val = t.target.value.replace(/\D/g, "")
            .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            let validPhone = !val[2] ? val[1]: "(" + val[1] + ") " + val[2] + (val[3] ? "-" + val[3] : "");
            this.state.selected.phone = validPhone;
            this.setState(this.state);
        } 
        this.props.onUpdate(this.state.selected);
        this.setState(this.state);
    } 

    onDateChange(e) {
        var j = new Date(e);
        if (!isValidDate(j)) { 
            j = new Date();
        } 
        var date = j.toISOString()
        var date2 = j.toDateString()
        date = date.substring(0,10)
        date2 = date2.substring(0,15)
        this.state.pickDay = false;
        this.state.dateSelected = date2
        this.state.dateSelectedForRest = date;
        var params = {
            date: this.state.dateSelectedForRest,
            id: this.props.provider.phy_id
        }
        this.state.lastMore = this.props.provider.phy_id;
        this.props.dispatch(getMoreSchedules(params));
        this.state.more[this.props.provider.phy_id] = false;
        this.state.inMore = this.props.provider.phy_id;
        this.setState(this.state)
    } 

    moreToggle(e) { 
        for (const[key,value] of Object.entries(this.state.more)) { 
            var k = parseInt(key)
            if (k === e) { continue; }
            this.state.more[k] = false;
        } 
        if (this.state.lastMore !== e) { 
            this.onDateChange(this.state.dateSelectedForRest + " 00:00:00")
        } 
        this.state.more[e] = !this.state.more[e];
        this.setState(this.state);
    } 

    scheduleAppt(e) { 
        this.moreToggle(this.props.provider.phy_id);
        this.props.onScheduleAppt(this.props.provider,e)
    } 

    getDate() { 
        var j = new Date();
        var q = j.toDateString()
        return q.substring(0,10);
    } 

    render() {
        if (this.state.inMore > 0 && !this.props.moreSchedules.isReceiving)  {
            this.state.more[this.props.provider.phy_id] = true;
            this.state.inMore = 0;
            this.setState(this.state)
        } 
        return (
        <>
        {(this.props.provider) && (
            <Card style={{
                margin:20,
                borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}} className="mb-xlg border-1">
                <CardBody>
                    <Row md="12">
                        <Col md="12">
                        <>
                            {(this.props.edit && this.state.selected !== null) && (
                                <div> 
                                <input className="form-control no-border" style={{border:'1px solid black',backgroundColor:'white'}} 
                                    value={this.state.selected.name} onChange={(e) => this.changeValue('name',e)} 
                                    required name="name" placeholder="Name" />
                                </div>
                            )}
                            {(!this.props.edit) && (
                                <div>
                                {this.props.provider.name} 
                                </div>
                            )}
                        </>
                        </Col>
                    </Row>
                    <hr/>
                    <Row md="12" style={{marginTop:20}}> 
                        <Col md="12">
                        <>
                            {(this.props.edit && this.state.selected !== null) && (
                                <div> 
                                <GoogleAutoComplete onChange={this.changeValue}/>
                                </div>
                            )}
                            {(!this.props.edit) && (
                                <div>
                                {this.props.provider.addr1 + " " + (this.props.provider.addr2 ? this.props.provider.addr2 : '')}
                                <br/>
                                {    this.props.provider.city + ", " + this.props.provider.state + " " + 
                                    this.props.provider.zipcode
                                }
                                </div>
                            )}
                        </>
                        </Col> 
                    </Row>
                    <Row md="12" style={{marginTop:10}}>
                        <Col md="12">
                        <>
                            {(this.props.edit && this.state.selected !== null) && (
                                <div> 
                                <input className="form-control no-border" style={{border:'1px solid black',backgroundColor:'white'}} 
                                    value={this.state.selected.addr2} onChange={(e) => this.changeValue('addr2',e)} 
                                    required placeholder="Address 2" />
                                </div>
                            )}
                            {(!this.props.edit) && (
                                <div>
                                {this.props.provider.addr2} 
                                </div>
                            )}
                        </>
                        </Col>
                    </Row>
                    <Row md="12" style={{marginTop:20}}>
                        <Col md="12">
                        <>
                            {(this.props.edit && this.state.selected !== null) && (
                                <div> 
                                <input className="form-control no-border" style={{border:'1px solid black',backgroundColor:'white'}} 
                                    value={this.state.selected.phone} onChange={(e) => this.changeValue('phone',e)} 
                                    required name="phone" placeholder="Phone" />
                                </div>
                            )}
                            {(!this.props.edit) && (
                                <div>
                                {formatPhoneNumber(this.props.provider.phone)} 
                                </div>
                            )}
                        </>
                        </Col>
                    </Row>
                    <hr/>
                    <Row md="12"> 
                        <Col md="12">
                        <>
                            {(!this.props.edit) && (
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <Button color="primary" onClick={() => this.props.onEdit(this.props.provider)}>Edit</Button>
                                </div>
                            )}
                        </>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        moreSchedules: store.moreSchedules
    }
}

export default connect(mapStateToProps)(LocationCard);
