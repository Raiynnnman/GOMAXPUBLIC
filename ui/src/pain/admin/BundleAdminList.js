import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { push } from 'connected-react-router';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import { FormGroup, Label, InputGroup, Input } from 'reactstrap';
import DownloadIcon from '@mui/icons-material/Download';
import cx from 'classnames';
import classnames from 'classnames';
import { Button } from 'reactstrap'; 
import { Badge } from 'reactstrap';
import { Search } from 'react-bootstrap-table2-toolkit';
import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getBundleAdmin } from '../../actions/bundleAdmin';
import { bundleAdminUpdate } from '../../actions/bundleAdminUpdate';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import BundleAdminEdit from './BundleAdminEdit';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { SearchBar } = Search;
class BundleList extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            upload: null,
            uploadResponse: null,
        } 
        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
        this.upload = this.upload.bind(this);
        this.onChangeInputFiles = this.onChangeInputFiles.bind(this);
        this.onFinishImport = this.onFinishImport.bind(this);
        this.uploadCancel = this.uploadCancel.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getBundleAdmin({page:0,limit:10000}))
    }

    uploadCancel() { 
        this.state.upload = null;
        this.state.uploadResponse = null;
        this.setState(this.state);
    } 

    upload() { 
        this.state.upload  = { documents:[{mime:'',content:''}] }
        this.state.uploadResponse = null;
        this.setState( this.state );
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
        this.state.upload.documents[0]['mime'] = e.target.files[0].type;
        Promise.all(Array.from(e.target.files).map(this.readDataAsUrl)).then((g) => { 
            this.state.upload.documents[0]['content'] = g[0]
            this.setState( this.state );
        })
    }

    onFinishImport() { 
        this.props.dispatch(getBundleAdmin({page:0,limit:10000},function(err,args) { 
            args.cancel()
            args.uploadCancel()
        },this));
    } 

    save() { 
        var g = this.state.selected
        if (this.state.upload !== null) { 
            if (g === null) { 
                g = {}
            }
            g.upload = this.state.upload.documents[0];
        } 
        this.props.dispatch(bundleAdminUpdate(g,function(err,args) { 
            if (err) { 
                if (Array.isArray(err.message)) { 
                    args.state.uploadResponse = err.message;
                } else { 
                    args.state.uploadResponse = [{row:0,message:err.message}];
                } 
                args.setState(args.state)
                /*toast.error(err.message,
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                );*/
                return;
            } 
            args.props.dispatch(getBundleAdmin({page:0,limit:10000},function() { 
                toast.success('Successfully saved item.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                );
                args.uploadCancel();
            },args))
        },this));
    }
    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
    }
    edit(row) { 
        this.state.selected = JSON.parse(JSON.stringify(row));
        this.setState(this.state);
    } 

    render() {
        var heads = [
            {
                dataField:'id',
                sort:true,
                text:'ID'
            },
            {
                dataField:'bundle_name',
                sort:true,
                text:'Name'
            },
            {
                dataField:'office_name',
                sort:true,
                text:'Office Name'
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
        return (
        <>
            {(this.props.bundleAdmin && this.props.bundleAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.bundleAdminUpdate && this.props.bundleAdminUpdate.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.bundleAdmin && this.props.bundleAdmin.data && this.props.bundleAdmin.data &&
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
            {(this.props && this.props.bundleAdmin && this.props.bundleAdmin.data && 
              this.props.bundleAdmin.data.length > 0 && this.state.selected===null && this.state.upload===null) && ( 
            <>
            <Row md="12">
                <Col md="12">
                    <Button onClick={this.upload} style={{marginRight:5,height:35,width:90}} color="primary">Upload</Button>
                    <Button onClick={this.downloadTemplate} style={{marginRight:5,height:35,width:90}} color="primary"><DownloadIcon/></Button>
                </Col>                
            </Row>
            <Row md="12" style={{marginTop:10}}>
                <Col md="12">
                    <BootstrapTable 
                        keyField='id' data={this.props.bundleAdmin.data} 
                        columns={heads} pagination={ paginationFactory()}>
                    </BootstrapTable>
                </Col>                
            </Row>
            </>
            )}
            {(this.props && this.props.bundleAdmin && this.props.bundleAdmin.data && 
              this.props.bundleAdmin.data.length > 0 && this.state.selected!==null && this.state.upload===null) && ( 
            <>
                <BundleAdminEdit onSave={this.save} onCancel={this.cancel} data={this.state.selected}/>
            </>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        bundleAdmin: store.bundleAdmin,
        bundleAdminUpdate: store.bundleAdminUpdate
    }
}

export default connect(mapStateToProps)(BundleList);
