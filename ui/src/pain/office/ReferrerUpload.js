import React, { Component } from 'react';
import { Button } from 'reactstrap'; 
import { connect } from 'react-redux';
import { Input } from 'reactstrap';
import { FormGroup, Label, InputGroup } from 'reactstrap';
import SaveIcon from '@mui/icons-material/Save';
import TextareaAutosize from 'react-autosize-textarea';
import MaskedInput from 'react-maskedinput';
import { toast } from 'react-toastify';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { referrerSave } from '../../actions/referrerUpload';

import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';

class ReferrerUpload extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "upload",
            clients:[],
            current:{
                'name':'',
                'zipcode':'',
                'description':'',
                'email':'',
                'phone':'',
                'zipcode':''
            },
            uploadFile:null
        }
        this.toggleTab = this.toggleTab.bind(this);
        this.cancel = this.cancel.bind(this);
        this.valueChange = this.valueChange.bind(this);
        this.addRow = this.addRow.bind(this);
        this.save = this.save.bind(this);
        this.onChangeInputFiles = this.onChangeInputFiles.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    addRow() { 
        this.state.clients.push(this.state.current);
        this.state.current={
                'name':'',
                'zipcode':'',
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
        if (this.state.uploadFile !== null ) { 
            this.props.dispatch(referrerSave(this.state.uploadFile,function(err,args) { 
                  toast.success('Successfully saved clients.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                  );
                  args.cancel()
                },this));
        } else { 
            this.props.dispatch(referrerSave({clients:this.state.clients},function(err,args) { 
                  toast.success('Successfully saved clients.',
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
            <Row md="12">
                <Col md="12">
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
                            <>
                            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'start'}}>
                                <Button color="primary" onClick={this.save}>Save</Button>
                            </div>
                            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <h4>Use this <a href='/referral_upload.xlsx' target="_blank">template</a> to upload, or details enter below.</h4>
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
                            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <div style={{width:1500}}>
                                    <table style={{width:"100%"}}>
                                        <tr style={{borderBottom:'1px solid black'}}>
                                        {heads.map((e) => { 
                                            return (
                                                <th style={{width:e.width}}>{e.text}</th>
                                            )
                                        })}
                                        </tr>
                                        <tr style={{borderBottom:'1px solid black'}}>
                                        {heads.map((e) => { 
                                            if (e.type === 'text') { 
                                                return (
                                                    <td style={{width:e.width}}>
                                                        <input className="form-control no-border" style={{backgroundColor:'white'}} 
                                                            value={this.state.current[e.dataField]} 
                                                            onChange={(g) => this.valueChange(e,g)} required name="name" placeholder={e.text} />
                                                    </td>
                                                )
                                            }
                                            if (e.type === 'zipcode') { 
                                                return (
                                                    <td style={{width:e.width}}>
                                                        <MaskedInput style={{backgroundColor:'white',border:'0px solid white'}}
                                                          className="form-control" mask="11111"
                                                          onChange={(g) => this.valueChange(e,g)} 
                                                          value={this.state.current[e.dataField]} 
                                                          size="10"
                                                        />
                                                    </td>
                                                )
                                            }
                                            if (e.type === 'phone') { 
                                                return (
                                                    <td style={{width:e.width}}>
                                                        <MaskedInput style={{backgroundColor:'white',border:'0px solid white'}}
                                                          className="form-control" id="mask-phone" mask="(111) 111-1111"
                                                          onChange={(g) => this.valueChange(e,g)} 
                                                          value={this.state.current[e.dataField]} 
                                                          size="10"
                                                        />
                                                    </td>
                                                )
                                            }
                                            if (e.type === 'action') {
                                                return (
                                                    <td style={{width:e.width}}>
                                                    <Button color="primary" onClick={this.addRow}><SaveIcon/></Button>
                                                    </td>
                                                )
                                            }
                                            if (e.type === 'textfield') {
                                                return (
                                                    <td style={{width:e.width}}>
                                                    <TextareaAutosize
                                                      rows={2} style={{backgroundColor:'white'}}
                                                      placeholder=""
                                                      onChange={(g) => this.valueChange(e,g)} 
                                                      value={this.state.current[e.dataField]} 
                                                      className={`form-control ${s.autogrow} transition-height`}
                                                    />
                                                    </td>
                                                )
                                            }
                                        })}
                                        </tr>
                                        {this.state.clients.map((e) => {
                                            return (
                                            <tr style={{borderBottom:'1px solid black'}}>
                                                {heads.map((g) => { 
                                                    return (
                                                    <>
                                                    {g.type === 'text' && (
                                                        <td style={{width:g.width}}>
                                                            <input className="form-control no-border" style={{backgroundColor:'white'}} value={e[g['dataField']]} 
                                                               placeholder="" />
                                                        </td>
                                                    )}
                                                    {g.type === 'zipcode' && (
                                                        <td style={{width:g.width}}>
                                                            <input className="form-control no-border" style={{backgroundColor:'white'}} value={e[g['dataField']]} 
                                                               placeholder="" />
                                                        </td>
                                                    )}
                                                    {g.type === 'phone' && (
                                                        <td style={{width:g.width}}>
                                                            <input className="form-control no-border" style={{backgroundColor:'white'}} value={e[g['dataField']]} 
                                                               placeholder="" />
                                                        </td>
                                                    )}
                                                    {g.type === 'textfield' && (
                                                        <td style={{width:g.width}}>
                                                            <TextareaAutosize
                                                              rows={2} style={{backgroundColor:'white'}}
                                                              placeholder=""
                                                              value={e[g['dataField']]} 
                                                              className={`form-control ${s.autogrow} transition-height`}
                                                            />
                                                        </td>
                                                    )}
                                                    </>
                                                )})}
                                            </tr>
                                            )
                                        })}
                                    </table>
                                </div>
                            </div>
                            </>
                        </TabPane>
                    </TabContent>
                </Col>                
            </Row>
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
