import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { FormGroup, Label, Input } from 'reactstrap';
import moment from 'moment';
import Select from 'react-select';
import { push } from 'connected-react-router';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { searchRegister } from '../../actions/searchRegister';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Button } from 'reactstrap'; 
import { Badge } from 'reactstrap';
import { Search } from 'react-bootstrap-table2-toolkit';
import s from '../office/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getContext } from '../../actions/context';
import { getMoreSchedules } from '../../actions/moreSchedules';
import { getLeads } from '../../actions/leads';
import { leadsSave } from '../../actions/leadsSave';
import BootstrapTable from 'react-bootstrap-table-next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CreateIcon from '@mui/icons-material/Create';
import paginationFactory from 'react-bootstrap-table2-paginator';
import cellEditFactory from 'react-bootstrap-table2-editor';
import PhysicianCard from '../search/PhysicianCard';
import AliceCarousel from 'react-alice-carousel';
import { searchCheckRes } from '../../actions/searchCheckRes';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { generateUUID } from '../utils/encryption';

const { SearchBar } = Search;
class LeadsList extends Component {
    constructor(props) { 
        super(props);
        this.state = {
            selected: null,
            assignPhysician: null,
            detailsExpanded: false,
            commentAdd:false,
            commentOriginal:'',
            editComments:[],
            currentEdit: 0
        } 
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.assignChange = this.assignChange.bind(this);
        this.statusChange = this.statusChange.bind(this);
        this.edit = this.edit.bind(this);
        this.addComment = this.addComment.bind(this);
        this.assignPhysician = this.assignPhysician.bind(this);
        this.comment = this.comment.bind(this);
        this.cancelComment = this.cancelComment.bind(this);
        this.editComment = this.editComment.bind(this);
        this.saveComment = this.saveComment.bind(this);
        this.proceduresChange = this.proceduresChange.bind(this);
        this.subProceduresChange = this.subProceduresChange.bind(this);
        this.cancel = this.cancel.bind(this);
        this.handleExpand = this.handleExpand.bind(this);
        this.save = this.save.bind(this);
        this.scheduleAppt = this.scheduleAppt.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.zipcodeChange = this.zipcodeChange.bind(this);
        this.firstChange = this.firstChange.bind(this);
        this.lastChange = this.lastChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
        this.heightChange = this.heightChange.bind(this);
        this.weightChange = this.weightChange.bind(this);
        this.ageChange = this.ageChange.bind(this);
        this.addr1Change = this.addr1Change.bind(this);
        this.addr2Change = this.addr2Change.bind(this);
        this.cityChange = this.cityChange.bind(this);
        this.stateChange = this.stateChange.bind(this);
    }

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    proceduresChange(e) { 
        this.state.selected.procedures_id = e.value;
        this.setState(this.state);
    } 
    subProceduresChange(e) { 
        this.state.selected.subprocedures_id = e.value;
        this.setState(this.state);
    } 
    scheduleAppt(e,t) { 
        var params = {
            id: t.id,
            leads_id: this.state.selected.id,
            procedure:this.state.selected.subprocedures_id
        } 
        this.props.dispatch(searchCheckRes(params, function(err,args) { 
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
                toast.success('Successfully scheduled appt.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                );
        },this));
    } 
    onStatusChange(e) { 
        this.props.onStatusChange(e);
    }
    assignPhysician(e) { 
        this.state.assignPhysician = e
        this.setState(this.state);
    }
    zipcodeChange(e) { 
        this.state.selected['zipcode'] = e.target.value;
        this.setState(this.state);
    } 
    emailChange(e) { 
        this.state.selected['email'] = e.target.value;
        this.setState(this.state);
    } 
    titleChange(e) { 
        this.state.selected['title'] = e.target.value;
        this.setState(this.state);
    } 
    firstChange(e) { 
        this.state.selected['first_name'] = e.target.value;
        this.setState(this.state);
    } 
    lastChange(e) { 
        this.state.selected['last_name'] = e.target.value;
        this.setState(this.state);
    } 
    phoneChange(e) { 
        let val = e.target.value.replace(/\D/g, "")
        .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        let validPhone = !val[2] ? val[1]: "(" + val[1] + ") " + val[2] + (val[3] ? "-" + val[3] : "");
        this.setState(prevState => ({
          selected: {
            ...prevState.selected,
            phone: validPhone
          } 
        }));
        if (validPhone.length < 14 && validPhone.length > 0) {
            this.setState({ errorMessage: 'Please add a 10 digit phone number' });
        } else {
            this.setState({ errorMessage: '' });
        }

        // this.state.selected['phone'] = e.target.value;
        // this.setState(this.state);
    } 

    statusChange(e,t) { 
        var p = { 
            id:t ? t : e.row,
            leads_status_id:e.value
        } 
        this.state.selected.leads_status_id = e.value;
        this.props.onStatusUpdate(p)
    }
    assignChange(e) { 
        var p = { 
            id:this.state.selected.id,
            assignee_id:e.value
        } 
        this.props.onStatusUpdate(p)
        this.state.selected.assignee_id = e.value;
        this.setState(this.state);
    }
    onFilterChange(e) { 
        this.props.onFilterChange(e)
    } 
    comment(e) { 
        var t = this.state.currentEdit; 
        this.state.editComments[t].text=e.target.value
        this.setState(this.state);
    }
    saveComment(e) { 
        if (e.text.length < 1) { 
            toast.error('Comment required.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
            );
            return;
        } 
        var t =  this.state.editComments.findIndex((g) => g.uuid === e.uuid)
        if (t === -1) { return; } 
        this.state.editComments[t].edit=false;
        this.state.currentEdit = 0;
        this.state.commentAdd = false;
        delete this.state.editComments[t].top;
        this.setState(this.state);
    }
    cancelComment(e) { 
        var t =  this.state.editComments.findIndex((g) => g.uuid === e.uuid)
        if (t === -1) { return; } 
        this.state.editComments[t].edit=false;
        if (this.state.editComments[t].top) { 
            this.state.editComments.shift();
        } else { 
            this.state.editComments[t] = this.state.commentOriginal;
            this.state.commentOriginal = '';
        } 
        this.state.currentEdit = 0;
        this.state.commentAdd = false;
        this.setState(this.state);
    }
    editComment(e) { 
        var t =  this.state.editComments.findIndex((g) => g.uuid === e.uuid)
        if (t === -1) { return; } 
        this.state.commentOriginal = JSON.parse(JSON.stringify(this.state.editComments[t]));
        this.state.currentEdit = t;
        this.state.editComments[t].edit=true;
        this.state.commentAdd = true;
        this.setState(this.state);
    }
    addComment() { 
        this.state.editComments.unshift(
            {
             uuid: generateUUID(),
             text:'',
             edit:true,
             isnew:true,top:true,
            }
        )
        this.state.commentAdd = true;
        this.state.currentEdit = 0;
        this.setState(this.state);
    }
    handleExpand() { 
        this.state.detailsExpanded = !this.state.detailsExpanded;
        this.setState(this.state);
    } 
    heightChange(e,t) { 
        this.state.selected.details.height = e.target.value;
        this.setState(this.state)
    } 
    weightChange(e) { 
        this.state.selected.details.weight = e.target.value;
        this.setState(this.state)
    }
    ageChange(e) { 
        this.state.selected.details.age = e.target.value;
        this.setState(this.state)
    }
    addr1Change(e) { 
        this.state.selected.details.addr.addr1 = e.target.value;
        this.setState(this.state)
    }
    addr2Change(e) { 
        this.state.selected.details.addr.addr2 = e.target.value;
        this.setState(this.state)
    }
    cityChange(e) { 
        this.state.selected.details.addr.city = e.target.value;
        this.setState(this.state)
    }
    stateChange(e) { 
        this.state.selected.details.addr.state = e.target.value;
        this.setState(this.state)
    }
    commentVer() { 
        return "comment-1-read-";
    } 
    edit(row) { 
        var r = {}
        if (row.id === 'new') { 
            r = { 
                leads_status_id:1,
                assignee_id:1,
                email:'',
                phone:'',
                comments:[],
                first_name:'',
                last_name:''
            }
            this.state.editComments = []; 
        } else { 
            r = row
            this.state.editComments = JSON.parse(JSON.stringify(row.comments)); 
            localStorage.setItem(this.commentVer() + r['id'],r.latest_comment)
        } 
        this.state.selected=r
        this.setState(this.state);
    } 
    cancel() {
        window.location.reload();
        setTimeout(() => {
            localStorage.setItem(this.commentVer() + this.state.selected.id,new Date())
            this.state.editComments = [];
            this.state.selected = null;
            this.setState(this.state);
        },3000);
    } 
    save() { 
        localStorage.setItem(this.commentVer() + this.state.selected.id,new Date())
        this.state.selected.comments = this.state.editComments;
        this.props.dispatch(
            leadsSave(this.state.selected,function(err,args) { 
                var t = {
                    status:args.props.statusSelected.value,filter:args.props.filterSelected.value,page:0,limit:10000
                }
                args.props.dispatch(getLeads(t,function(err,args) { 
                    toast.success('Successfully saved item.',
                        {
                            position:"top-right",
                            autoClose:3000,
                            hideProgressBar:true
                        }
                    );
                    args.state.editComments = []
                    args.state.selected = null;
                    args.setState(args.state);
                },args))
            },this)
        )
    } 

    render() {
        const responsive = {
            0: { 
                items: 1
            },
            568: { 
                items: 1
            },
            1024: {
                items: 1, 
                itemsFit: 'contain'
            },
        };
        var heads = [
            {
                dataField:'id',
                sort:true,
                hidden:true,
                text:'ID'
            },
            {
                dataField:'leads_status',
                editable: false,
                sort:true,
                text:'Status',
                formatter:(cellContent,row) => ( 
                    <>
                    {row.leads_status}&nbsp;
                    {(this.props.countNew[row.id] > 0) && (
                        <>
                        <Badge style={{verticalAlign:"super",fontSize:"smaller"}} color="danger">{this.props.countNew[row.id]} comment</Badge>
                        </>
                    )}
                    </>
                )
                
            },
            {
                dataField:'assignee_id',
                sort:true,
                editable: false,
                text:'Assignee',
                formatter:(cellContent,row) => (
                    <div>
                        {
                        this.props.leads.data.config.assignee.filter((e) => e.id === row.assignee_id).length > 0 ? 
                        this.props.leads.data.config.assignee.filter((e) => e.id === row.assignee_id)[0].first_name + " " +
                        this.props.leads.data.config.assignee.filter((e) => e.id === row.assignee_id)[0].last_name + " " 
                        : "System"
                        }
                    </div>
                )
            },
            {
                dataField:'email',
                editable: false,
                text:'Email',
            },
            {
                dataField:'first_name',
                editable: false,
                text:'name',
                formatter:(cellContent,row) => (
                    <>
                    {row.first_name + ' ' + row.last_name}
                    </>
                )
            },
            {
                dataField:'id2',
                sort:true,
                align:"center",
                editable: false,
                text:'Procedure',
                formatter:(cellContent,row) => (
                    <>
                    {
                        this.props.leads.data.config.subprocedures.filter((e) => e.id === row.subprocedures_id).length > 0 ? 
                            this.props.leads.data.config.subprocedures.filter((e) => e.id === row.subprocedures_id)[0].name : 
                            this.props.leads.data.config.procedures.filter((e) => e.id === row.procedures_id).length > 0 ? 
                                this.props.leads.data.config.procedures.filter((e) => e.id === row.procedures_id)[0].name : 
                                row.description
                    } 
                    </>
                )
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
                dataField:'created',
                sort:true,
                editable: false,
                text:'Contacted',
                formatter:(cellContent,row) => (
                    <div>
                        {row['comments'].length > 0 ? 
                            moment(row['comments'].sort((a,b) => (a.created > b.created ? 1:-1))[0]['created']).format('LLL') : "N/A"}
                    </div>
                )
            },
            {
                dataField:'id3',
                text:'Actions',
                editable: false,
                formatter:(cellContent,row) => ( 
                    <>
                    <div>
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35,width:90}} color="primary">Edit</Button>
                    </div>
                    </>
                )
            },
        ];
        return (
        <>
            {(this.props.leads && this.props.leads.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.leads && this.props.leads.data && 
              this.props.leads.data.leads && this.state.selected === null) && ( 
            <>
            <Row md="12">
                <Col md="3" style={{marginBottom:10}}>
                      <Input type="text" id="normal-field" onChange={this.props.onSearchChange} placeholder="Search" value={this.props.search}/>
                </Col>
                <Col md="3" style={{marginBottom:10}}>
                      <Select
                          closeMenuOnSelect={true}
                          isSearchable={false}
                          onChange={this.onStatusChange}
                          value={this.props.statusSelected}
                          options={this.props.leads.data.config.status.map((e) => {
                            return (
                                {label:e.name,value:e.id}
                            )
                          })}
                        />
                </Col>
                <Col md="3" style={{marginBottom:10}}>
                      <Select
                          closeMenuOnSelect={true}
                          isSearchable={false}
                          onChange={this.onFilterChange}
                          value={this.props.filterSelected}
                          options={this.props.filters}
                        />
                </Col>
            </Row>
            <Row md="12">
                <Col md="12">
                    <BootstrapTable 
                        keyField='id' data={this.props.data} 
                        cellEdit={ cellEditFactory({ 
                            mode: 'click',
                            blurToSave:true }
                        )}
                        columns={heads} pagination={ paginationFactory()}>
                    </BootstrapTable>
                </Col>                
            </Row>
            </>
            )}
            {(this.props && this.props.leads && this.props.leads.data && 
              this.props.leads.data.leads && this.state.selected !== null) && ( 
            <>
            <Row md="12">
                <Col md="5">
                    <h5>Details</h5>
                </Col>
                <Col md="7">
                    <h5>Associate a Physician to this client</h5>
                </Col>
            </Row>
            <Row md="12">
                <Col md="5">
                    <Row md="12" style={{marginBottom:5}}>
                        <Col md="4">
                            Status:
                        </Col>
                        <Col md="7">
                            <Select 
                              onChange={v => this.statusChange(v,this.state.selected.id)}
                              closeMenuOnSelect={true}
                              isSearchable={false}
                              options={this.props.leads.data.config.status.filter((k) => k.id !== 0).map((e) => { 
                                return (
                                    {
                                    value:e.id,
                                    label:e.name
                                    }
                                )
                              })}
                              value={{
                                label: this.props.leads.data.config.status.filter((e) => e.id === this.state.selected.leads_status_id).length > 0 ? 
                                    this.props.leads.data.config.status.filter((e) => e.id === this.state.selected.leads_status_id)[0].name  : ""
                              }}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row md="12">
                <Col md="5">
                    <Row md="12" style={{marginBottom:5}}>
                        <Col md="4">
                            Assignee:
                        </Col>
                        <Col md="7">
                            <Select 
                              onChange={this.assignChange}
                              closeMenuOnSelect={true}
                              isSearchable={false}
                              options={this.props.leads.data.config.assignee.map((e) => { 
                                return (
                                    {
                                    value:e.id,
                                    label:e.first_name + " " + e.last_name
                                    }
                                )
                              })}
                              value={{
                                label: this.props.leads.data.config.assignee.filter((e) => e.id === this.state.selected.assignee_id).length > 0 ? 
                                    this.props.leads.data.config.assignee.filter((e) => e.id === this.state.selected.assignee_id)[0].first_name + " " +
                                    this.props.leads.data.config.assignee.filter((e) => e.id === this.state.selected.assignee_id)[0].last_name : ""
                              }}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row md="12">
                <Col md="5">
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Email:
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.emailChange} placeholder="Email" value={this.state.selected.email}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              First Name:
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.firstChange} placeholder="First Name" value={this.state.selected.first_name}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Last Name:
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.lastChange} placeholder="Last Name" value={this.state.selected.last_name}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Phone
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.phoneChange} placeholder="Phone" value={this.state.selected.phone}/>
                              {this.state.errorMessage &&
                                <p for="normal-field" md={12} className="text-md-right">
                                    <font style={{color:"red"}}>
                                        {this.state.errorMessage}
                                    </font>
                                </p>
                              }
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Zipcode
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.zipcodeChange} placeholder="Zip" value={this.state.selected.zipcode}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Imported description:
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" readOnly placeholder="Nothing imported" value={this.state.selected.description}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="4">
                            Procedure:
                        </Col>
                        <Col md="7">
                        <Select 
                          onChange={this.proceduresChange}
                          closeMenuOnSelect={true}
                          isSearchable={false}
                          options={this.props.leads.data.config.procedures.map((e) => { 
                            return (
                                {
                                value:e.id,
                                label:e.name
                                }
                            )
                          })}
                          value={{
                            
                            label: this.props.leads.data.config.procedures.filter((e) => e.id === this.state.selected.procedures_id).length > 0 ? 
                                this.props.leads.data.config.procedures.filter((e) => e.id === this.state.selected.procedures_id)[0].name : ""
                          }}
                        />
                        </Col>
                    </Row>
                    <Row md="12" style={{marginTop:10}}>
                        <Col md="4">
                            Sub Procedure:
                        </Col>
                        <Col md="7">
                        <Select 
                          onChange={this.subProceduresChange}
                          closeMenuOnSelect={true}
                          isSearchable={false}
                          options={this.props.leads.data.config.subprocedures.filter((e) => e.procedures_id === this.state.selected.procedures_id).map((e) => { 
                            return (
                                {
                                value:e.id,
                                label:e.name
                                }
                            )
                          })}
                          value={{
                            label: this.props.leads.data.config.subprocedures.filter(
                                    (e) => e.id === this.state.selected.subprocedures_id
                                ).length > 0 ? this.props.leads.data.config.subprocedures.filter(
                                    (e) => e.id === this.state.selected.subprocedures_id
                                )[0].name : ""
                          }}
                        />
                        </Col>
                    </Row>
                    <Row md="12" style={{marginTop:10}}>
                        <>
                        {(this.state.selected.pricing.great !== null && this.state.selected.pricing.great !== 0) && (
                        <>
                        <Col md="4">
                            NCH Range:
                        </Col>
                        <Col md="7">
                            ${this.state.selected.pricing.expensive} - ${this.state.selected.pricing.fair} - ${this.state.selected.pricing.great}
                        </Col>
                        </>
                        )}
                        {(this.state.selected.pricing.great === null || this.state.selected.pricing.great === 0) && (
                        <Col md="6">
                            <div>
                                No pricing information available (or is $0)
                            </div>
                        </Col>
                        )}
                        </>
                    </Row>
                    <Row md="12" style={{marginTop:10}}>
                        <Col md="4">
                            Patient Details:
                        </Col>
                        <Col md="8">
                            <Row md="12">
                                {(this.state.detailsExpanded) && (
                                    <div onClick={this.handleExpand}><ExpandLessIcon/></div>
                                )}
                                {(!this.state.detailsExpanded) && (
                                    <div onClick={this.handleExpand}><ExpandMoreIcon/></div>
                                )}
                            </Row>
                            <Row md="12">
                                {(this.state.detailsExpanded) && (
                                    <Card style={{borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}}
                                        className="mb-xlg border-1">
                                        <CardBody>
                                            <Row md="12">
                                                <Col md="12">
                                                  <FormGroup row>
                                                    <Label for="normal-field" md={4} className="text-md-right">
                                                      Height (ft-in):
                                                    </Label>
                                                    <Col md={7}>
                                                        <Input type="text" id="normal-field" onChange={this.heightChange} maxLength="7"
                                                                placeholder="Height" value={this.state.selected.details.height} />       
                                                    </Col>
                                                  </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row md="12">
                                                <Col md="12">
                                                  <FormGroup row>
                                                    <Label for="normal-field" md={4} className="text-md-right">
                                                      Weight (lb):
                                                    </Label>
                                                    <Col md={7}>
                                                      <Input type="text" id="normal-field" onChange={this.weightChange} maxLength="3"
                                                        placeholder="Weight" value={this.state.selected.details.weight}/>
                                                    </Col>
                                                  </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row md="12">
                                                <Col md="12">
                                                  <FormGroup row>
                                                    <Label for="normal-field" md={4} className="text-md-right">
                                                      Age:
                                                    </Label>
                                                    <Col md={7}>
                                                      <Input type="text" id="normal-field" onChange={this.ageChange} maxLength="3"
                                                        placeholder="Age" value={this.state.selected.details.age}/>
                                                    </Col>
                                                  </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row md="12">
                                                <Col md="12">
                                                  <FormGroup row>
                                                    <Label for="normal-field" md={4} className="text-md-right">
                                                      Address:
                                                    </Label>
                                                    <Col md={7}>
                                                      <Input type="text" id="normal-field" onChange={this.addr1Change} 
                                                        placeholder="Address1" value={this.state.selected.details.addr.addr1}/>
                                                    </Col>
                                                  </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row md="12">
                                                <Col md="12">
                                                  <FormGroup row>
                                                    <Label for="normal-field" md={4} className="text-md-right">
                                                    </Label>
                                                    <Col md={7}>
                                                      <Input type="text" id="normal-field" onChange={this.addr2Change} 
                                                        placeholder="Address2" value={this.state.selected.details.addr.addr2}/>
                                                    </Col>
                                                  </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row md="12">
                                                <Col md="12">
                                                  <FormGroup row>
                                                    <Label for="normal-field" md={4} className="text-md-right">
                                                        City
                                                    </Label>
                                                    <Col md={7}>
                                                      <Input type="text" id="normal-field" onChange={this.cityChange} 
                                                        placeholder="City" value={this.state.selected.details.addr.city}/>
                                                    </Col>
                                                  </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row md="12">
                                                <Col md="12">
                                                  <FormGroup row>
                                                    <Label for="normal-field" md={4} className="text-md-right">
                                                        State
                                                    </Label>
                                                    <Col md={7}>
                                                      <Input type="text" id="normal-field" onChange={this.stateChange} 
                                                        placeholder="State" value={this.state.selected.details.addr.state}/>
                                                    </Col>
                                                  </FormGroup>
                                                </Col>
                                            </Row>
                                        </CardBody>
                                    </Card>
                                )}
                            </Row>
                        </Col>
                    </Row>
                </Col>
                <Col md="7">
                    <Row md="12">
                        <Col md="12">
                        {(this.state.selected && this.state.selected.physicians && 
                          this.state.selected.physicians.physicians && this.state.selected.physicians.physicians.length > 0) && ( 
                            <AliceCarousel animationType="fadeout" animationDuration={3}
                                autoPlay={false} disableDotsControls={true} infinite={false}
                                disableButtonsControls={false} responsive={responsive}
                                disableSlideInfo={false}
                                mouseTracking items={this.state.selected.physicians.physicians.map((e) => { 
                                        return (
                                            <PhysicianCard onScheduleAppt={this.scheduleAppt} physician={e}/>
                                        )
                                    })} />
                        )}
                        {(this.state.selected && this.state.selected.physicians && 
                          this.state.selected.physicians.physicians && this.state.selected.physicians.physicians.length < 1) && ( 
                            <h2>No physicians found in this area</h2>
                        )}
                        </Col>
                    </Row>
                </Col>
            </Row>
            <hr/>
            <Row md="12">
                <Col md="4">
                    <Button disabled={this.state.commentAdd} onClick={() => this.addComment({id:"new"})} color="primary">Add Comment</Button>
                </Col>
            </Row>
            <Row md="12">
                <>
                {this.state.editComments.sort((a,b) => (a.created > b.created ? -1:1)).map((e) => { 
                    return (
                        <Col md="3" key={e.id}>
                            <Card style={{
                                    borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px",
                                    margin:20,width:400,height:200}} className="mb-xlg border-1">
                                <CardBody>
                                    <Row md="12">
                                        <Col md="1">
                                        {(!this.state.commentAdd) && (
                                            <div onClick={() => this.editComment(e)} style={{cursor:"pointer"}}><CreateIcon/></div>
                                        )}
                                        </Col>
                                        <Col md="5">
                                            <font style={{fontSize:"12pt"}}>
                                                {
                                                this.props.leads.data.config.assignee.filter((g) => g.id === e.user_id).length > 0 ? 
                                                this.props.leads.data.config.assignee.filter((g) => g.id === e.user_id)[0].first_name + " " +
                                                this.props.leads.data.config.assignee.filter((g) => g.id === e.user_id)[0].last_name + " " : 
                                                this.props.currentUser.first_name + " " + this.props.currentUser.last_name 
                                                }
                                            </font>
                                        </Col>
                                        <Col md="5">
                                            <font style={{fontSize:"8pt"}}>
                                                {moment(e.created).format('LLL')}
                                            </font>
                                        </Col>
                                    </Row>
                                    <hr/>
                                    <Row md="12">
                                        {(!e.edit) && ( 
                                        <Col md="12">
                                            <div style={{overflow:"auto",height:100,display: 'flex', 
                                                justifyContent: 'start'}}>
                                            {e.text}
                                            </div>
                                        </Col>
                                        )}
                                        {(e.edit) && ( 
                                        <Col md="12">
                                            <FormGroup row>
                                              <Col md={12}>
                                                <Input value={e.text} rows="3" style={{resize:"none"}}
                                                    onChange={this.comment} type="textarea" 
                                                    name="text" id="default-textarea" />
                                              </Col>
                                            </FormGroup>
                                        </Col>
                                        )}
                                    </Row>
                                    <Row md="12">
                                        {(e.edit) && ( 
                                        <Col md="12">
                                            <Col md="6">
                                                <Button onClick={() => this.saveComment(e)} color="primary">Save</Button>
                                                <Button outline style={{marginLeft:10}} onClick={() => this.cancelComment(e)} 
                                                    color="secondary">Cancel</Button>
                                            </Col>
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
                        <Button onClick={this.save} color="primary" disabled={this.state.errorMessage}>Save</Button>
                        <Button outline style={{marginLeft:10}} onClick={this.cancel} color="secondary">Cancel</Button>
                    </Col>
                    )}
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
        leads: store.leads
    }
}

export default connect(mapStateToProps)(LeadsList);
