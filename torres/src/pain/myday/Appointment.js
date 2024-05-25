import React, { Component, useEffect  } from 'react';
import { connect } from 'react-redux';
import { Col, Grid } from 'reactstrap';
import moment from 'moment';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import { Button, UncontrolledPopover, PopoverBody} from 'reactstrap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import cx from 'classnames';
import classnames from 'classnames';
import Calendar from 'react-calendar';
import { Chrono } from "react-chrono";
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { Form, FormGroup, Label, Input, InputGroup, InputGroupText } from 'reactstrap';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VerifiedIcon from '@mui/icons-material/Verified';
import SavingsIcon from '@mui/icons-material/Savings';
import { getMoreSchedules } from '../../actions/moreSchedules';
import { getOfficePatients } from '../../actions/mydayGetOfficePatients';
import { getProcedures } from '../../actions/procedures';
import { saveCustomAppt } from '../../actions/mydayCustomAppt';
import 'react-calendar/dist/Calendar.css';
const animatedComponents = makeAnimated();
class Appointment extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            dateSelected:'',
            dateLoaded:'',
            showAllTimes:true,
            loaded: false,
            updated:false,
            items:[],
            physician:'',
            procedure:'',
            subprocedure:'',
            patient: '',
            patients: []
        }
        this.onSelected = this.onSelected.bind(this);
        this.toggleAllTimes = this.toggleAllTimes.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
        this.selectPhysician = this.selectPhysician.bind(this);
        this.changeProcedure = this.changeProcedure.bind(this);
        this.changeSubProcedure = this.changeSubProcedure.bind(this);
        this.changePatient = this.changePatient.bind(this);
        this.getSchedule = this.getSchedule.bind(this);
        this.scheduleAppt = this.scheduleAppt.bind(this);
        this.clearInputs = this.clearInputs.bind(this);
    } 

    componentWillReceiveProps(p) { 
        this.state.dateSelected = p.dateSelected
        this.state.patients = p.patients
        this.setState(this.state)
    }

    componentDidMount() {
        this.props.dispatch(getOfficePatients());
        this.props.dispatch(getProcedures());
        this.state.dateSelected = this.props.dateSelected;
        this.state.patients = this.props.mydayGetOfficePatients.data;
        this.setState(this.state)
    }

    selectPhysician(e) {
        if (e.id !== this.state.physician.id){
            this.state.procedure = '';
            this.state.subprocedure = '';
            this.state.subproceduresList = [];
        }
        const { value } = e;
        const selectedPhysicianObj = this.props.phy.data.physicians.find(
          (physician) => physician.id === value
        );
        const phyProcedures = this.props.phy.data.procedures
          .filter((procedure) => {
            const procedureIds = selectedPhysicianObj.procs.map(
              (proc) => proc.procedure
            );
            return procedureIds.includes(procedure.id);
          })
          .map((procedure) => ({
            value: procedure.id,
            label: procedure.name,
            id: procedure.id
          }));
        this.setState({
          physician: e,
          phyProcedures
        });
    }

    changeProcedure(e) { 
        this.getSchedule(this.state.physician);  
        var subproceduresList = [];
        this.props.procedures.data.procedures.forEach((subprocedure) => {
            if (subprocedure.name === e.label) {
                subprocedure.sub.forEach((g) => {
                    subproceduresList.push({ value: g.id, label: g.name, id: g.id });
                });
            }
        });
        this.state.procedure = e;
        this.state.subproceduresList = subproceduresList;
        this.setState(this.state); 
    } 

    changeSubProcedure(e) {
        this.state.subprocedure = e;
        this.setState(this.state);
    }

    changePatient(e) {            
        this.state.patient = e;
        this.setState(this.state);
    }

    getSchedule(phy){
        const sDate = this.state.dateSelected;
        const dateObj = new Date(sDate);
        const formattedDate = dateObj.toISOString().substring(0,10);
        var params = {
            date: formattedDate,
            id: phy.id
        }
        this.props.dispatch(getMoreSchedules(params));
    }

    clearInputs(){
        this.state.physician = '';
        this.state.procedure = '';
        this.state.subprocedure = '';
        this.state.patient = '';
        this.state.subproceduresList = [];
        this.state.phyProcedures = [];
        this.setState(this.state);
    }

    scheduleAppt(appt) { 
        var params = {
            appt_id: appt.id,
            phy:this.state.physician.id,
            patient:this.state.patient.id,
            subprocedure:this.state.subprocedure.id
        } 
        this.props.dispatch(saveCustomAppt(params, (err,args) => { 
            if (err) { 
                toast.error(err.message,
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                );
                return;
            }
            toast.success('Successfully scheduled appointment.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true,
                    onClose: () => {
                        const e = new Date();
                        this.onDateChange(e);
                      }
                });
        },this));
        this.clearInputs();
    } 

    removeAppointment(day,number,time,id) { 
    }

    toggleAllTimes() { 
        this.state.showAllTimes = !this.state.showAllTimes;
        this.state.updated = false;
        this.setState(this.state)
    } 


    onDateChange(e) {
        var j = new Date(e);
        var q = j.toDateString()
        this.state.dateSelected = q.substring(0,15);
        this.props.onDateChange(e)
        this.clearInputs();
        this.setState(this.state)
    } 

    onSelected(e,t) { 
        this.props.onSelected(e,t);
        this.state.loaded=true;
        this.setState(this.state)
    } 

    render() {
        if (!this.props.data.schedule) { return (<></>) }
        var chrono_content = [];
        if (this.state.dateSelected !== this.state.dateLoaded) { 
            this.state.items = []
            if (this.props.data.schedule.length < 1 || this.props.data.schedule[0].schedule.length < 1) { 
                this.state.dateLoaded = this.state.dateSelected;
                this.setState(this.state);
                return (<></>)
            }
            var d1 = '';
            if (this.props.data.schedule[0].schedule.day) { 
                d1 = this.props.data.schedule[0].schedule.day
            } else { 
                d1 = this.props.data.schedule[0].schedule[0].day
            } 
            var d2 = this.state.dateSelected
            var gg = new Date(d1 + "T00:00");
            var q = gg.toDateString()
            d1 = q.substring(0,15);
            if (d1 !== d2) { return(<></>); }
            this.state.dateLoaded = d1
            this.state.dateSelected = d2
            var c = 0;
            for (c = 0; c < this.props.data.schedule.length;c++) { 
                var t = this.props.data.schedule[c]
                var bg = "white";
                var d = 0
                for (d = 0; d < t.schedule.length; d++) { 
                    var q = t.schedule[d];
                    if (!this.state.showAllTimes) { 
                        var g = moment().startOf('day');
                        var s = q.time.split(':')
                        g = g.add('hours',parseInt(s[0]))
                        g = g.add('minutes',parseInt(s[1]))
                        var o = moment()
                        //if (g.isBefore(o)) { continue; }
                    } 
                    var i = {
                        title:q.time,
                        appt_id: q.id
                    }
                    if (q.appt && q.appt.customer && q.appt.customer.email) { 
                        i['cardTitle'] = "Appointment: " + q.appt.customer.first_name + " " + q.appt.customer.last_name;
                        i['status'] = q.appt.physician.status
                        i['cardDetailedText'] = q.appt.physician.title + " " + q.appt.physician.first_name + " " + 
                            q.appt.physician.last_name + " appointment with " + q.appt.customer.first_name + " " + 
                            q.appt.customer.last_name + " for " + q.appt.customer.subprocedure.name;
                    } else { 
                        continue
                        //i['cardTitle'] = "Open: " + t.first_name + " " + t.last_name;
                        //i['cardDetailedText'] = "Open booking"
                    }  
                    this.state.items.push(i);
                }
            } 
            this.state.updated = true;
            this.setState(this.state);
        }
        const styles = {
            control: base => ({
              ...base,
              width: 325
              })
        }
        return (
        <>
            <Grid md="12">
                <Grid item  md="4"></Grid>
                <Grid item  md="6">
                    <div style={{height:10,display: 'flex', alignItems: 'center', justifyContent: 'center',textAlign:"left"}}>
                        <h5>{this.state.dateSelected}</h5>
                    </div>
                </Grid>
            </Grid>
            <hr/>
            <Grid md="12" style={{marginTop:10}}>
                <Grid item  md="4">
                    <Grid md="12">
                        <Grid item  md="12">
                        <Calendar
                          value={this.state.dateSelected}
                          initialDay={new Date()}
                          onChange={this.onDateChange}
                        />
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="9">
                        {(this.props.data && this.props.data.upcoming && this.props.data.upcoming.length < 1) && (
                            <Grid md="12" style={{marginTop:10}}>
                                <Grid item  md="12">
                                    <h5>No future appointments scheduled.</h5>
                                </Grid>
                            </Grid>
                        )}
                        {(this.props.data && this.props.data.upcoming && this.props.data.upcoming.length > 0) && (
                            <div>
                                {this.props.data.upcoming.map((e) => { 
                                    return (
                                    <Grid md="12" style={{marginTop:10}}>
                                        <Grid item  md="12">
                                            <Card style={{height:100}} className="mb-xlg border-1">
                                                <CardBody>
                                                    <Grid md="12">
                                                        <Grid item  md="12">
                                                            <h5>Upcoming Appointment</h5>
                                                        </Grid>
                                                    </Grid>
                                                    <Grid md="12">
                                                        <Grid item  md="12">
                                                            {e.first_name + " " + e.last_name} - {e.phone}
                                                        </Grid>
                                                    </Grid>
                                                    <Grid md="12">
                                                        <Grid item  md="12">
                                                            <h6>{e.schedule[0].day} @ {e.schedule[0].time}</h6>
                                                        </Grid>
                                                    </Grid>
                                                </CardBody>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                    )
                                })}
                            </div>
                        )}
                        {(this.props.currentUser.entitlements.includes("Physician")) && (
                            <div>
                                <Button id={'schedule'} color="primary" style={{ marginTop: '10px' }}>Schedule</Button>
                                <UncontrolledPopover style={{ width: 375, height: '100%', backgroundColor: "white", border: "1px solid black" }} 
                                    placement="right" 
                                    target={'schedule'}
                                    trigger="legacy"
                                    >
                                        <PopoverBody>
                                            <Grid style={{'marginBottom': '5px'}}>
                                                <Grid item  md={4}>
                                                    Physician:
                                                </Grid>
                                                <Grid item  md={10}>
                                                    <Select 
                                                        onChange={this.selectPhysician}
                                                        styles={styles} 
                                                        value={this.state.physician}
                                                        closeMenuOnSelect={true} 
                                                        components={animatedComponents}
                                                        options={this.props.phy.data.physicians && this.props.phy.data.physicians.map((phy) => { 
                                                            return ({
                                                                label: phy.first_name + " " + phy.last_name,
                                                                value: phy.id,
                                                                id:phy.id
                                                            })
                                                          })}
                                                    />
                                                </Grid>
                                            </Grid>          
                                            <Grid style={{'marginBottom': '5px'}}>
                                                <Grid item  md={4}>
                                                    Procedures:
                                                </Grid>
                                                <Grid item  md={10}>
                                                    <Select 
                                                        onChange={this.changeProcedure}
                                                        styles={styles} 
                                                        closeMenuOnSelect={true} 
                                                        components={animatedComponents} 
                                                        options={this.state.phyProcedures}
                                                        value={this.state.procedure}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid style={{'marginBottom': '5px'}}>
                                                <Grid item  md={6}>
                                                    Sub Procedures:
                                                </Grid>
                                                <Grid item  md={10}>
                                                    <Select 
                                                        onChange={this.changeSubProcedure}
                                                        styles={styles} 
                                                        closeMenuOnSelect={true} 
                                                        components={animatedComponents} 
                                                        value={this.state.subprocedure}
                                                        options={this.state.subproceduresList}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid style={{'marginBottom': '5px'}}>
                                                <Grid item  md={4}>
                                                    Patient:
                                                </Grid>
                                                <Grid item  md={10}>
                                                    <Select 
                                                        onChange={this.changePatient}
                                                        styles={styles} 
                                                        closeMenuOnSelect={true} 
                                                        components={animatedComponents} 
                                                        value={this.state.patient}
                                                        options={this.state.patients && Array.isArray(this.state.patients) && this.state.patients.map((pat) => {
                                                              return {
                                                                label: pat.first_name + " " + pat.last_name,
                                                                value: pat.id,
                                                                id: pat.id
                                                              };
                                                            })
                                                        }
                                                        
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid>
                                                <div>
                                                    {this.state.physician &&
                                                    this.state.procedure &&
                                                    this.state.subprocedure &&
                                                    this.state.patient &&
                                                    this.props.moreSchedules.data &&
                                                    this.props.moreSchedules.data.schedule &&
                                                    (this.props.moreSchedules.data.schedule.length === 0 ? (
                                                        <p style={{'textAlign':'center','marginTop':'15px'}}>No appointments available</p>
                                                    ) : (
                                                        this.props.moreSchedules.data.schedule.map((sch) => (
                                                        <Button
                                                            style={{ margin: 5, width: 100 }}
                                                            color="primary"
                                                            onClick={() => this.scheduleAppt(sch)}
                                                        >
                                                            {sch.time}
                                                        </Button>
                                                        ))
                                                    ))
                                                    }
                                                </div>
                                            </Grid>
                                        </PopoverBody>
                                </UncontrolledPopover>
                            </div>
                        )}
                        </Grid>
                    </Grid>
                </Grid>                
                <Grid item  md="6">
                    {(this.state.items && this.state.items.length > 0) && (
                        <>
                        <Chrono activeItemIndex={this.state.items.length+1} 
                            onItemSelected={this.onSelected} scrollable cardHeight={100} 
                            hideControls={true}
                            items={this.state.items} mode='VERTICAL_ALTERNATING'>
                            {this.state.items.map((e) => { 
                                return (
                                    <>
                                    {(e.status === 'TRANSFER_COMPLETED') && (
                                        <div class="pull-right"><SavingsIcon style={{color:"green"}}/><font style={{color:"green"}}> Transfer Completed</font></div>
                                    )}
                                    {(e.status === 'APPOINTMENT_COMPLETED') && (
                                        <div class="pull-right"><VerifiedIcon style={{color:"green"}}/><font style={{color:"green"}}> Appointment Completed</font></div>
                                    )}
                                    {(e.status === 'REGISTERED') && (
                                        <div class="pull-right"><i style={{color:"red"}} class="fi flaticon-alarm-clock"> Bundle Needed</i></div>
                                    )}
                                    {(e.status === 'INVOICE_GENERATED') && (
                                        <div class="pull-right"><i style={{color:"green"}} class="fa fa-bank"> Invoice Generated</i></div>
                                    )}
                                    {(e.status === 'INVOICE_APPROVED') && (
                                        <div class="pull-right"><ThumbUpIcon style={{color:"green"}}/><font style={{color:"green"}}> Approved</font></div>
                                    )}
                                    {(e.status === 'INVOICE_SENT') && (
                                        <div class="pull-right"><i style={{color:"green"}} class="fa fa-paper-plane"> Invoice Sent</i></div>
                                    )}
                                    {(e.status === 'PAYMENT_SUCCESS') && (
                                        <div class="pull-right"><i style={{color:"green"}} class="fi flaticon-locked"> Invoice Paid</i></div>
                                    )}
                                    {e.cardDetailedText}
                                    </>
                                )
                            })}
                        </Chrono>
                        </>
                    )}
                    {(this.state.items && this.state.items.length < 1) && (
                        <div 
                            style={{height:100,display: 'flex', alignItems: 'center', justifyContent: 'center',textAlign:"center"}}>
                            <h4>No appointments scheduled for this time</h4>
                        </div>
                    )}
                </Grid>                
            </Grid>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        moreSchedules:store.moreSchedules,
        mydayGetOfficePatients:store.mydayGetOfficePatients ? store.mydayGetOfficePatients:{patients:[]},
        phy: store.phy,
        phySave: store.phySave,
        procedures:store.procedures
    }
}

export default connect(mapStateToProps)(Appointment);
