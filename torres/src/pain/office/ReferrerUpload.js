import React, { Component } from 'react';
import { Button } from 'reactstrap'; 
import { connect } from 'react-redux';
import { Input } from 'reactstrap';
import { FormGroup, Label, InputGroup } from 'reactstrap';
import SaveIcon from '@mui/icons-material/Save';
import TextareaAutosize from 'react-autosize-textarea';
import MaskedInput from 'react-maskedinput';
import { toast } from 'react-toastify';
import { Col, Grid } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { referrerSave } from '../../actions/referrerUpload';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';

class ReferrerUpload extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "upload",
            tarea:'',
            error_message:null,
            disabled:false,
            clients:[],
            current:{
                'name':'',
                'zipcode':'',
                'description':'',
                'email':'',
                'phone':'',
            },
            uploadFile:null
        }
        this.toggleTab = this.toggleTab.bind(this);
        this.setValue = this.setValue.bind(this);
        this.cancel = this.cancel.bind(this);
        this.valueChange = this.valueChange.bind(this);
        this.addGrid = this.addGrid.bind(this);
        this.save = this.save.bind(this);
        this.onChangeInputFiles = this.onChangeInputFiles.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    setValue(e,t) { 
        this.state.tarea = e.target.value;
        this.setState(this.state)
    } 

    addGrid() { 
        this.state.clients.push(this.state.current);
        this.state.current={
                'name':'',
                'description':'',
                'email':'',
                'phone':'',
                'zipcode':''
            }
        this.setState(this.state);
    } 

    componentDidMount() {
    }

    valueChange(e,g,t) { 
        this.state.current[e.dataField] = g.target.value
        this.setState(this.state);
    } 
    cancel() { 
        this.state.clients = [];
        this.state.uploadFile = null;
        this.state.tarea = '';
        this.state.error_message = null;
        this.state.disabled = false;
        this.setState(this.state);
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
        this.state.uploadFile = {};
        this.state.uploadFile['mime'] = e.target.files[0].type
        Promise.all(Array.from(e.target.files).map(this.readDataAsUrl)).then((g) => { 
            this.state.uploadFile['content'] = g[0]
            this.setState( this.state );
        })
    }

    save() { 
        this.state.disabled = true;
        this.setState(this.state);
        if (this.state.uploadFile !== null ) { 
            this.props.dispatch(referrerSave(this.state.uploadFile,function(err,args) { 
                  if (err && err.message) { 
                    args.state.error_message = err.message;
                    args.setState(args);
                    return;
                  } 
                  toast.success('Successfully saved client.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                  );
                  args.cancel()
                },this));
        } else { 
            this.props.dispatch(referrerSave({client:this.state.tarea},function(err,args) { 
                  if (err && err.message) { 
                    args.state.error_message = err.message;
                    args.setState(args);
                    return;
                  } 
                  toast.success('Successfully saved client.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                  );
                  args.cancel()
                },this));
        }
    } 
    toggleTab(e) { 
        this.state.activeTab = e;
    } 

    render() {
        var heads = [
            {
                dataField:'name',
                width:'15%',
                type:'text',
                text:'Name'
            },
            {
                dataField:'email',
                width:'15%',
                type:'text',
                text:'Email'
            },
            {
                dataField:'phone',
                width:'15%',
                type:'phone',
                text:'Phone'
            },
            {
                dataField:'zipcode',
                width:'15%',
                type:'zipcode',
                text:'Zipcode'
            },
            {
                dataField:'description',
                width:'65%',
                type:'textfield',
                text:'Description'
            },
            {
                dataField:'description',
                width:'15%',
                type:'action',
                text:'Actions'
            },
        ]
        return (
        <>
            {(this.props.referrerUpload && this.props.referrerUpload.isReceiving) && (
                <AppSpinner/>
            )}
            <Grid container xs="12">
                <Grid item xs="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'upload' })}
                                onClick={() => { this.toggleTab('upload') }}>
                                <span>{translate('Upload')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                        <TabPane tabId="upload">
                            {(this.state.error_message) && (
                            <Grid container xs="12" xs="12" style={{marginTop:20}}>
                                <Grid item xs="12">
                                    <font style={{color:'red'}}>{this.state.error_message}</font>       
                                </Grid>
                            </Grid>
                            )}
                            <>
                            {/*
                                <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <h4>Use this <a style={{color:'blue'}} href='/referral_upload.xlsx' target="_blank">template</a> to upload, or details enter below.</h4>
                                </div>
                                <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <InputGroup style={{width:200}} className="fileinput fileinput-new">
                                      <input
                                        onChange={this.onChangeInputFiles}
                                        id="fileupload1"
                                        type="file" name="file" className="display-none"
                                      />
                                    </InputGroup>
                                </div>
                                <hr/>
                            */}
                            <Grid container xs="12" xs="12" style={{marginTop:20}}>
                                <Grid item xs="12">
                                    <TextareaAutosize
                                      rows={5} style={{backgroundColor:'white'}}
                                      placeholder=""
                                      onChange={this.setValue} value={this.state.tarea}
                                      className={`form-control ${s.autogrow} transition-height`}
                                    />
                                </Grid>
                            </Grid>
                            </>
                            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'start'}}>
                                <Button disabled={this.state.disabled} color="primary" onClick={this.save}>Save</Button>
                            </div>
                        </TabPane>
                    </TabContent>
                </Grid>                
            </Grid>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        referrerUpload: store.referrerUpload,
        offices: store.offices
    }
}

export default connect(mapStateToProps)(ReferrerUpload);
