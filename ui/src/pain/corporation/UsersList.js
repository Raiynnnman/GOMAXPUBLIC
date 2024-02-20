import React, { Component } from 'react';
import { FormGroup, Label, Input, InputGroup } from 'reactstrap';
import Select from 'react-select';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { bundleSave } from '../../actions/bundleSave';
import { push } from 'connected-react-router';
import { Nav, NavItem, NavLink } from 'reactstrap';
import cellEditFactory from 'react-bootstrap-table2-editor';
import DownloadIcon from '@mui/icons-material/Download';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Button } from 'reactstrap'; 
import { Badge } from 'reactstrap';
import { Search } from 'react-bootstrap-table2-toolkit';
import s from '../office/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getUsers } from '../../actions/corporationUsers';
import { corporationUsersSave } from '../../actions/corporationUsersSave';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { SearchBar } = Search;
class UsersList extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            upload: null,
            uploadResponse: null,
            selectedID: 0
        } 
        this.cancel = this.cancel.bind(this);
        this.uploadCancel = this.uploadCancel.bind(this);
        this.save = this.save.bind(this);
        this.permChange = this.permChange.bind(this);
        this.firstNameChange = this.firstNameChange.bind(this);
        this.onChangeInputFiles = this.onChangeInputFiles.bind(this);
        this.onFinishImport = this.onFinishImport.bind(this);
        this.upload= this.upload.bind(this);
        this.lastNameChange = this.lastNameChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }
    uploadCancel() { 
        this.state.upload = null;
        this.setState(this.state);
    } 

    permChange(e) { 
        var id = e.id;
        var perms = []
        if (this.state.selected.entitlements.includes(id)){
            this.state.selected.entitlements = 
                this.state.selected.entitlements.filter((e) => e.id !== id)
        } else { 
            this.state.selected.entitlements.push(e.id)
        } 
        this.setState(this.state);
    } 
    edit(row) { 
        this.state.selected = JSON.parse(JSON.stringify(row));
        this.setState(this.state);
    } 

    lastNameChange(e) { 
        this.state.selected['last_name'] = e.target.value;
        this.setState(this.state);
    } 
    firstNameChange(e) { 
        this.state.selected['first_name'] = e.target.value;
        this.setState(this.state);
    } 
    emailChange(e) { 
        this.state.selected['email'] = e.target.value;
        this.setState(this.state);
        //validate email 
        const emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
        this.state.isValid = emailRegex.test(e.target.value);
        if (this.state.isValid) {
            this.setState(prevState => ({
                ...prevState.selected,
                email: e.target.value,
                errorMessage: '',
            }));
        } else {
            this.setState({ errorMessage: 'Invalid email format' });
        }
    } 
    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
        this.setState({ errorMessage: '' });
        this.state.isValid = false;
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

    upload() { 
        this.state.upload  = { documents:[{mime:'',content:''}] }
        this.state.uploadResponse = null;
        this.setState( this.state );
    } 
    onChangeInputFiles(e) {
        const files = [];
        let i = 0;
        this.state.upload.documents[0]['mime'] = e.target.files[0].type
        Promise.all(Array.from(e.target.files).map(this.readDataAsUrl)).then((g) => { 
            this.state.upload.documents[0]['content'] = g[0]
            this.setState( this.state );
        })
    }
    onFinishImport() { 
        this.props.dispatch(getUsers({page:0,limit:10000},function(err,args) { 
            toast.success('Successfully saved item.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
            );
            args.cancel()
            args.uploadCancel()
        },this));
    } 
    save() { 
        var g = this.state.selected;
        if (this.state.upload !== null) { 
            g = {}
            g.upload = this.state.upload.documents[0];
            g.id = 'new';
        } 
        if (g.id === 'new' || g.id < 1) { 
            delete g['id']
        }
        this.props.dispatch(corporationUsersSave(g,function(err,args,data) { 
            if (err) { 
                args.state.uploadResponse = [err];
                args.setState(args.state)
            } else { 
                args.state.uploadResponse = data.message;
                args.setState(args.state)
            } 
        },this));
    } 

    downloadTemplate() { 
        window.open('/user_import_template.csv','_blank');
    } 

    render() {
        var response_heads = [
            {
                dataField:'row',
                sort:true,
                text:'Row'
            },
            {
                dataField:'success',
                sort:true,
                text:'Name',
                formatter: (cellContent,row) => (
                    <div>
                        {row.success && (<Badge color="primary">Success</Badge>)}
                        {!row.success && (<Badge color="danger">Failed</Badge>)}
                    </div>
                )
            },
            {
                dataField:'message',
                sort:true,
                text:'Message',
                formatter: (cellContent,row) => (
                    <div>
                        {row.data && (row.message + " " + row.data)}
                        {!row.data && (row.message)}
                    </div>
                )
                
            },
        ];
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
                    <div>
                        {row.first_name + " " + row.last_name}
                    </div>
                )
            },
            {
                dataField:'email',
                sort:true,
                text:'Email'
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
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35,width:90}} color="primary">Edit</Button>
                    </div>
                )
            },
        ];
        return (
        <>
            {(this.props.corporationUsers && this.props.corporationUsers.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.corporationUsersSave && this.props.corporationUsersSave.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.corporationUsers && this.props.corporationUsers.data && this.props.corporationUsers.data.users &&
              this.state.selected === null && this.state.upload !== null) && ( 
            <>
            {(this.state.uploadResponse === null) && (
            <Row md="12">
                <Col md="12">
                    <InputGroup className="fileinput fileinput-new">
                      <input
                        onChange={this.onChangeInputFiles}
                        style={{display:'block'}}
                        id="fileupload1"
                        type="file" name="file" className="display-none"
                      />
                    </InputGroup>
                </Col>
            </Row>
            )}
            {(this.state.uploadResponse !== null) && ( 
            <Row md="12">
                <Col md="12">
                    <BootstrapTable 
                        keyField='id' data={this.state.uploadResponse} 
                        columns={response_heads} pagination={ paginationFactory()}>
                    </BootstrapTable>
                </Col>
            </Row>
            )}
            <hr/>
            {(this.state.uploadResponse === null) && ( 
            <Row md="12" style={{marginTop:10}}>
                <Col md="12">
                    <Button onClick={this.save} color="primary">Save</Button>
                    <Button outline style={{marginLeft:10}} onClick={this.uploadCancel} color="secondary">Cancel</Button>
                </Col>
            </Row>
            )}
            {(this.state.uploadResponse !== null) && ( 
            <Row md="12" style={{marginTop:10}}>
                <Col md="12">
                    <Button onClick={this.onFinishImport} color="primary">Finish</Button>
                </Col>
            </Row>
            )}
            </>
            )}
            {(this.props && this.props.corporationUsers && this.props.corporationUsers.data && this.props.corporationUsers.data.users &&
              this.state.selected === null && this.state.upload === null) && ( 
            <>
            <Row md="12">
                <Col md="4" style={{marginBottom:10}}>
                    <Button onClick={() => this.edit({id:"new",entitlements:[]})} style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                    <Button onClick={this.upload} style={{marginRight:5,height:35,width:90}} color="primary">Upload</Button>
                    <Button onClick={this.downloadTemplate} style={{marginRight:5,height:35,width:90}} color="primary"><DownloadIcon/></Button>
                </Col>
            </Row>
            <Row md="12">
                <Col md="12">
                    <BootstrapTable 
                        keyField='id' data={this.props.corporationUsers.data.users} 
                        columns={heads} pagination={ paginationFactory()}>
                    </BootstrapTable>
                </Col>                
            </Row>
            </>
            )}
            {(this.props && this.props.corporationUsers && this.props.corporationUsers.data && this.props.corporationUsers.data.users &&
              this.state.selected !== null && this.state.upload === null) && ( 
            <>
            <Row md="12">
                <Col md="12">
                    <Row md="12">
                        <Col md="5">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              First Name
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.firstNameChange} placeholder="Name" value={this.state.selected.first_name}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="5">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Last Name
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.lastNameChange} placeholder="Name" value={this.state.selected.last_name}/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="5">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Email
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" readOnly={this.state.selected.id !== 'new'} 
                                    onChange={this.emailChange} placeholder="Name" value={this.state.selected.email}/>
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
                        <Col md="5">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Permissions
                            </Label>
                            <Col md={7}>
                              <>
                              {this.props.corporationUsers.data.entitlements.map((e) => {
                                return (
                                     <div style={{marginRight:5}}>
                                      <Input onChange={() => this.permChange(e)} id="checkbox2" type="checkbox" 
                                            checked={this.state.selected.entitlements.includes(e.id)}
                                      />{' '}
                                      <Label for="checkbox2" check>
                                        {e.name}
                                      </Label>
                                     </div>
                                )
                              })}
                              </>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                </Col>                
            </Row>
            <hr/>
            <Row md="12">
                <Col md="6">
                    <Button onClick={this.save} color="primary">Save</Button>
                    <Button outline style={{marginLeft:10}} onClick={this.cancel} color="secondary">Cancel</Button>
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
        corporationUsers: store.corporationUsers,
        corporationUsersSave: store.corporationUsersSave
    }
}

export default connect(mapStateToProps)(UsersList);
