import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { Col, Grid } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { FormGroup, Label, Input, InputGroup } from 'reactstrap';
import moment from 'moment/moment'
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {getUser} from '../../actions/user';
import {userDocumentsUpdate} from '../../actions/userDocumentsUpdate';
import Appointment from './Appointment.js';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { toast } from 'react-toastify';
import MyHealthConsent from './MyHealthConsent';
import 'react-toastify/dist/ReactToastify.css';

class MyHealthDocuments extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            geo: false,
            form: {
            },
            consent:true,
            inputFiles: [],
            authorized: false,
            selected: null
        }
        this.setLocation = this.setLocation.bind(this);
        this.onChangeInputFiles = this.onChangeInputFiles.bind(this);
        this.onDocumentUpload = this.onDocumentUpload.bind(this);
        this.cancel = this.cancel.bind(this);
        this.authorize = this.authorize.bind(this);
        this.addGrid = this.addGrid.bind(this);
        this.addDocument = this.addDocument.bind(this);
        this.save = this.save.bind(this);
        this.onConsent = this.onConsent.bind(this);
        this.getWithoutPermission = this.getWithoutPermission.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.updateItemCheckbox = this.updateItemCheckbox.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    getWithoutPermission(e,t) { 
        this.state.geo = false;
        this.setState(this.state);
        this.props.dispatch(getUser({}));
    } 

    componentDidMount() {
        this.state.geo = true;
        this.setState(this.state)
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
              this.state.geo = false;
              this.setState(this.state)
              var params = {location:{lat:position.coords.latitude,lon:position.coords.longitude }}
              this.props.dispatch(getUser(params));
              this.setLocation(position.coords.latitude, position.coords.longitude);
            },this.getWithoutPermission);
        } else {
            this.props.dispatch(getUser({}))
            this.state.geo = false;
            this.setState(this.state)
        }
    }

    authorize() { 
      this.state.selected.authorized = !this.state.selected.authorized;
      var params = { 
        office_id: this.state.selected.id,
        authorized: 1
      } 
      //this.props.dispatch(userDocumentsUpdate(params)) 
    } 

    readDataAsUrl = (file) => { 
        return new Promise ((resolve,reject) => { 
            var reader = new FileReader();
            reader.content = null;
            reader.onload = function(e,s) { 
                resolve(e.target.result)
            } 
            reader.readAsDataURL(file)
            
        })
    }

    onChangeInputFiles(e) {
        const files = [];
        let i = 0;
        this.state.selected.documents[0]['mime'] = e.target.files[0].type
        Promise.all(Array.from(e.target.files).map(this.readDataAsUrl)).then((g) => { 
            this.state.selected.documents[0]['content'] = g[0]
            this.setState( this.state );
        })
    }

    save(p) { 
        // SET this.state.form.medical_condition = 
        var params = { 
            office_id:this.state.selected.office_id,
            documents:this.state.selected.documents,
            form: this.state.form /* TODO */
        } 
        if(p) { params = p; }
        this.props.dispatch(userDocumentsUpdate(params,function(err,args) { 
            if (err && err.response.status >= 500) { 
                  toast.error('Something has gone wrong.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                  )
                  return;
            } 
            args.props.dispatch(getUser({},function(err,args) { 
                  this.state.selected = null;
                  this.state.consent = false;
                  this.setState(this.state);  
                  toast.success('Successfully saved form.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                  );
            }),args)
        },this))
    }
    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
    
    } 
    addGrid() { 
        this.state.selected.documents.push({
            id:0,description:'',upload:'', email: ''
        })
        this.setState(this.state);
    } 

    setLocation(lat,lon) {
        this.state.mylocation={lat:lat,lon:lon}
        this.setState(this.state);
    }
    onConsent(e) { 
        this.state.consent = true;
        this.state.selected = e
        var office_id = e.id
        var docs = this.props.user.data.documents.filter((g) => g.office_id === office_id)
        this.state.selected['documents'] = docs
        this.setState(this.state);
    }
    onDocumentUpload(e) { 
        this.state.selected = e
        var office_id = e.id
        var docs = this.props.user.data.documents.filter((g) => g.office_id === office_id)
        this.state.selected['documents'] = docs
        this.setState(this.state);
    } 

    addDocument(e,t) { 
    } 

    updateItemCheckbox(e) { 
        if (e.target.value === 'on') { 
            this.state.form[e.target.name] = false;
        } else { 
            this.state.form[e.target.name] = true;
        } 
    } 

    updateItem(e) { 
        this.state.form[e.target.name] = e.target.value;
    } 

    render() {
        var heads = [ 
            {dataField:'id', sort:true, text:'ID', hidden:true},
            {
                dataField:'description', sort:true, text:'Description',
                style:{width:"50%"}
            },
            {
                dataField:'created', sort:true, text:'Created',    
                editable:false,
                style:{width:"10%"},
                formatter:(cellContent,row) => ( 
                    <div>
                    {row.created ? moment(row.created).format('LLL') :''}
                    </div>
                )
            },
            {
                dataField:'id',
                text:'Actions',
                style:{width:"20%"},
                formatter:(cellContent,row) => ( 
                    <InputGroup className="fileinput fileinput-new">
                      <input
                        onChange={this.onChangeInputFiles}
                        id="fileupload1"
                        type="file" name="file" className="display-none"
                      />
                    </InputGroup>
                )
            },
        ] 
        return (
        <>
            {(this.props.user && this.props.user.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.state.geo) && (
                <AppSpinner/>
            )}
            <Grid md="12">
                {(this.props.user && this.props.user.data && this.props.user.data.appt && 
                  this.props.user.data.appt.length < 1 && this.state.selected === null) && (
                    <h2>No appointments scheduled</h2>
                )}
            </Grid>
            <Grid md="12">
                {(this.props.user && this.props.user.data && this.props.user.data.appt && 
                  this.props.user.data.appt.length > 0 && this.state.selected === null) && (
                    <>
                    {this.props.user.data.appt.sort((a,b) => (a.created > b.created ? -1:1)).map((e) => {
                        return (
                            <Grid item  md={window.innerWidth <= 1024 ? "8" : "6"}>
                            <Appointment onDocumentUpload={this.onDocumentUpload} consent={true} 
                                onConsent={this.onConsent}
                                documents={true} chat={false} data={e}/>
                            </Grid>
                        )
                    })}
                    </>
                )}
                {(this.props.user && this.props.user.data && this.props.user.data.appt && 
                  this.props.user.data.appt.length > 0 && this.state.selected !== null &&
                  this.state.consent) && (
                    <>
                    <MyHealthConsent data={this.state.selected} onCancel={this.cancel} onSave={this.save}/>
                    </>
                )}
                {(this.props.user && this.props.user.data && this.props.user.data.appt && 
                  this.props.user.data.appt.length > 0 && this.state.selected !== null &&
                  !this.state.consent) && (
                <>
                    <Grid md="12">
                        <Grid item  md="3">
                            <Button onClick={() => this.addGrid()} style={{marginBottom:10,height:35,width:90}} color="primary">Add</Button>
                        </Grid>
                    </Grid>
                    <Grid md="12">
                        <Grid item  md="8">
                            <BootstrapTable 
                                keyField='id' data={this.state.selected.documents} 
                                cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true }) }
                                columns={heads}> 
                            </BootstrapTable>
                        </Grid>
                    </Grid>
                    <hr/>
                    <Grid md="12">
                        <Grid item  md="6">
                            <Button onClick={this.save} color="primary">Save</Button>
                            <Button outline style={{marginLeft:10}} onClick={this.cancel} color="secondary">Cancel</Button>
                        </Grid>
                    </Grid>
                </>
                )}
            </Grid>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        user: store.user
    }
}

export default connect(mapStateToProps)(MyHealthDocuments);
