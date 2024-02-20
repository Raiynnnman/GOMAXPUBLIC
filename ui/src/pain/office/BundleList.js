import React, { Component } from 'react';
import { FormGroup, Label, InputGroup, Input } from 'reactstrap';
import DownloadIcon from '@mui/icons-material/Download';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Select from 'react-select';
import uuid from 'uuid/v4';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { push } from 'connected-react-router';
import { Nav, NavItem, NavLink } from 'reactstrap';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Button } from 'reactstrap'; 
import { Badge } from 'reactstrap';
import { Search } from 'react-bootstrap-table2-toolkit';
import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getBundles } from '../../actions/bundles';
import { cptSearch } from '../../actions/cptSearch';
import { cmSearch } from '../../actions/cmSearch';
import { bundleSave } from '../../actions/bundleSave';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
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
            bundleName: '',
            selectedID: 0
        } 
        this.upload= this.upload.bind(this);
        this.tableValueChange= this.tableValueChange.bind(this);
        this.onChangeInputFiles = this.onChangeInputFiles.bind(this);
        this.onFinishImport = this.onFinishImport.bind(this);
        this.uploadCancel = this.uploadCancel.bind(this);
        this.editRow = this.editRow.bind(this);
        this.delRow = this.delRow.bind(this);
        this.saveRow = this.saveRow.bind(this);
        this.cancel = this.cancel.bind(this);
        this.search = this.search.bind(this);
        this.cptsearch = this.cptsearch.bind(this);
        this.save = this.save.bind(this);
        this.nameChange = this.nameChange.bind(this);
        this.codeChange = this.codeChange.bind(this);
        this.assignChange = this.assignChange.bind(this);
        this.officeChange = this.officeChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    onFinishImport() { 
        this.props.dispatch(getBundles({page:0,limit:10000},function(err,args) { 
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

    componentDidMount() {
    }

    saveRow(e) { 
        this.state.selected.items.push(this.state.currentRow)
    } 

    cancelRow() { 
        this.state.selectedID = 0;
        this.setState(this.state);
    } 

    edit(row) { 
        this.state.selected = JSON.parse(JSON.stringify(row))
        this.setState(this.state);
    } 

    editRow(i) { 
        this.state.selectedID = i;
        this.setState(this.state);
    } 

    delRow(i) { 
        var t = this.state.selected.items.findIndex((g) => g.id === i)
        this.state.selected.items.splice(t,1);
        this.setState(this.state);
    } 

    addRow() { 
        var t = uuid()
        this.state.selected.items.push({
            id:t, isnew:true, code:'',desc:'',
            price:0,quantity:1,total:0,assigned:0
        })
        this.editRow(t);
        this.state.selectedID = t;
        this.setState(this.state);
    } 
    tableValueChange(e) { 
        var g = this.state.selectedID
        var t = this.state.selected.items.findIndex((g) => g.id === this.state.selectedID)
        this.state.selected.items[t][e.target.name] = e.target.value;
        this.setState(this.state);
    } 

    uploadCancel() { 
        this.state.upload = null;
        this.setState(this.state);
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

    officeChange(e,t) { 
        var i = this.state.selected.items.findIndex((g) => g.id === e.row)
        var u = e.value;
        this.state.selected.items[i].office_id=u;
        this.setState(this.state);
    }
    assignChange(e,t) { 
        var i = this.state.selected.items.findIndex((g) => g.id === e.row)
        var u = e.value;
        this.state.selected.items[i].assigned=u;
        this.setState(this.state);
    }
    cptsearch(e) { 
        this.state.selected.bundleName = e.target.value;
        var val = e.target.value;
        if (val.length < 3) { return; }
        this.props.dispatch(cptSearch({s:val}))
    } 
    search(e) { 
        this.state.selected.bundleName = e.target.value;
        var val = e.target.value;
        if (val.length < 3) { return; }
        this.props.dispatch(cmSearch({s:val}))
    } 
    codeChange(e) { 
        var t = this.state.selected.items.findIndex((g) => g.id === this.state.selectedID)
        this.state.selected.items[t].code = e.value;
    }
    nameChange(e) { 
        this.state.selected.bundleName = e.label;
        this.state.selected['name'] = e.label;
        this.state.selected['cpt_id'] = e.value;
        this.setState(this.state);
    } 
    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
    } 
    save() { 
        var g = this.state.selected;
        if (g.id === 'new' || g.id < 1) { 
            delete g['id']
        }
        if (this.state.upload !== null) { 
            g = {}
            g.upload = this.state.upload.documents[0];
            g.id = 'new';
        } 
        this.props.dispatch(bundleSave(g,function(err,args) { 
            if (err) { 
                toast.error(translate(err.message),
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                );
                return;
            } 
            args.props.dispatch(getBundles(args.state.selected,function(err,args) { 
                toast.success('Successfully saved item.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                );
                args.cancel()
            },args))
        },this));
    } 

    downloadTemplate() { 
        window.open('/bundle_import_template.csv','_blank');
    } 


    render() {
        const styles = {
            control: (css) => ({
              ...css,
              width: 310,
            }),
            menu: ({ width, ...css }) => ({
              ...css,
              width: 600,
            }),
            // Add padding to account for width of Indicators Container plus padding
            option: (css) => ({ ...css, paddingRight: 36 + 8 })
        };
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
                text:'Name'
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
                dataField:'act',
                text:'Actions',
                formatter:(cellContent,row) => ( 
                    <div>
                        <Button onClick={() => this.edit(row)} style={{margin:5}} color="primary"><EditIcon/></Button>
                    </div>
                )
            },
        ];
        return (
        <>
            {(this.props.bundles && this.props.bundles.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.bundleSave && this.props.bundleSave.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.bundles && this.props.bundles.data && this.props.bundles.data.bundles &&
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
            {(this.props && this.props.bundles && this.props.bundles.data && this.props.bundles.data.bundles &&
              this.state.selected === null && this.state.upload === null) && ( 
            <>
            <Row md="12">
                <Col md="4" style={{marginBottom:10}}>
                    <>
                    <Button onClick={() => this.edit({id:"new",items:[]})} style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                    {(false) && ( 
                    <>
                    <Button onClick={this.upload} style={{marginRight:5,height:35,width:90}} color="primary">Upload</Button>
                    <Button onClick={this.downloadTemplate} style={{marginRight:5,height:35,width:90}} color="primary"><DownloadIcon/></Button>
                    </>
                    )}
                    </>
                </Col>
            </Row>
            <Row md="12">
                <Col md="12">
                    <BootstrapTable 
                        keyField='id' data={this.props.bundles.data.bundles} 
                        columns={heads} pagination={ paginationFactory()}>
                    </BootstrapTable>
                </Col>                
            </Row>
            </>
            )}
            {(this.props && this.props.bundles && this.props.bundles.data && this.props.bundles.data.bundles &&
              this.state.selected !== null && this.state.upload === null) && ( 
            <>
            <Row md="12">
                <Col md="12">
                    <Row md="12">
                        <Col md="8">
                          <FormGroup row>
                            <div style={{display:"flex",alignItems:'center',justifyContent:'center'}}>
                                <Label for="normal-field" md={1} className="text-md-right">
                                  Name:
                                </Label>
                                <Col md={10}>
                                    <Select 
                                      onChange={this.nameChange}
                                      onKeyDown={this.search}
                                      options={this.props.cmSearch.data.map((e) => { 
                                                return (
                                                    {
                                                    value:e.id,
                                                    label:e.code + " - " + e.description
                                                    }
                                                )
                                          })}
                                      value={{
                                            label: this.state.selected.bundleName
                                      }}
                                       />
                                </Col>
                                {(!this.props.cmSearch.isReceiving) && ( 
                                    <Button outline className="button-spinny button-spinny-loading" 
                                        style={{marginLeft:10,height:40,width:50}} color="primary"></Button>
                                )}
                                {(this.props.cmSearch.isReceiving) && ( 
                                    <Button className="button-spinny button-spinny-loading" 
                                        style={{marginLeft:10,height:40,width:50}} color="primary"><i class="fa fa-spinner fa-spin"></i></Button>
                                )}
                            </div>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="12">
                            <h6>Items</h6>
                            <hr/>
                            <Button onClick={() => this.addRow()} style={{marginBottom:10,height:35,width:90}} color="primary">Add</Button>
                            <table style={{width:"100%"}}>
                                <thead>
                                <tr style={{backgroundColor:"#d6dee5",border:"1px solid black"}}>
                                    <th style={{borderRight:"1px solid black"}}>Code</th>
                                    <th style={{borderRight:"1px solid black"}}>Description</th>
                                    <th style={{borderRight:"1px solid black"}}>Price</th>
                                    <th style={{borderRight:"1px solid black"}}>Quantity</th>
                                    <th style={{borderRight:"1px solid black"}}>Assigned</th>
                                    {(false) && (<th style={{borderRight:"1px solid black"}}>Office</th>)}
                                <th style={{borderRight:"1px solid black"}}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                        {this.state.selected.items.map((e) => { 
                            return (
                                <tr style={{border:"1px solid black"}}>
                                    <td style={{width:"20%",borderRight:"1px solid black"}}>
                                        {(this.state.selectedID === e.id) && (
                                        <div style={{display:"flex",alignItems:'center',justifyContent:'start'}}>
                                                <Select 
                                                  styles={styles}
                                                  onChange={this.codeChange}
                                                  onKeyDown={this.cptsearch}
                                                  options={this.props.cptSearch.data.map((e) => { 
                                                            return (
                                                                {
                                                                value:e.id,
                                                                label:e.code + " - " + e.description
                                                                }
                                                            )
                                                      })}
                                                  value={{
                                                        label: this.state.selected.bundleName
                                                  }}
                                                   />
                                            {(this.props.cptSearch.isReceiving) && ( 
                                                <Button className="button-spinny button-spinny-loading" 
                                                    style={{marginLeft:10,height:40,width:50}} color="primary"><i class="fa fa-spinner fa-spin"></i></Button>
                                            )}
                                            </div>
                                        )}
                                        {(this.state.selectedID !== e.id) && (
                                            <>
                                            {e.code}
                                            </>
                                        )}
                                    </td>
                                    <td style={{width:"20%",borderRight:"1px solid black"}}>
                                        {(this.state.selectedID === e.id) && (
                                        <>
                                            <Input style={{backgroundColor:"white"}} type="text" id="normal-field" name="desc"
                                                onChange={this.tableValueChange} placeholder="Description" value={e.desc}/>
                                        </>
                                        )}
                                        {(this.state.selectedID !== e.id) && (
                                        <>
                                            {e.desc}
                                        </>
                                        )}
                                    </td>
                                    <td style={{width:"10%",borderRight:"1px solid black",textAlign:"right"}}>
                                        <>
                                        {(this.state.selectedID === e.id) && (
                                        <>
                                            <Input style={{backgroundColor:"white"}} type="text" id="normal-field" name="price"
                                                onChange={this.tableValueChange} placeholder="Description" value={e.price}/>
                                        </>
                                        )}
                                        {(this.state.selectedID !== e.id) && (
                                        <>
                                        ${e.price.toFixed(2)}
                                        </>
                                        )}
                                        </>
                                    </td>
                                    <td style={{width:"10%",borderRight:"1px solid black",textAlign:"center"}}>
                                        <>
                                        {(this.state.selectedID === e.id) && (
                                        <>
                                            <Input style={{backgroundColor:"white"}} type="text" id="normal-field" name="quantity"
                                                onChange={this.tableValueChange} placeholder="Description" value={e.quantity}/>
                                        </>
                                        )}
                                        {(this.state.selectedID !== e.id) && (
                                        <>
                                        {e.quantity}
                                        </>
                                        )}
                                        </>
                                    </td>
                                    <td style={{width:"20%",borderRight:"1px solid black"}}>
                                        <>
                                        {(this.state.selectedID === e.id) && (
                                        <>
                                            <Select 
                                              className="selectCustomization"
                                              onChange={this.assignChange}
                                              options={this.props.bundles.data.users.physicians.map((e) => { 
                                                return (
                                                    {
                                                    value:e.id,
                                                    label:e.first_name + " " + e.last_name
                                                    }
                                                )
                                              value={
                                                label: this.props.bundles.data.users.physicians.filter((e) => e.id === row.assigned)[0].first_name + " " +
                                                    this.props.bundles.data.users.physicians.filter((e) => e.id === row.assigned)[0].last_name 
                                              }
                                              })}
                                            />
                                        </>
                                        )}
                                        {(this.state.selectedID !== e.id) && (
                                        <>
                                            {this.props.bundles.data.users.physicians.filter((g) => g.id === e.assigned)[0].first_name + " " +
                                                this.props.bundles.data.users.physicians.filter((g) => g.id === e.assigned)[0].last_name}
                                        </>
                                        )}
                                        </>
                                    </td>
                                    {(false) && (<td style={{width:"30%",borderRight:"1px solid black"}}>
                                        <>
                                        {(this.state.selectedID === e.id) && (
                                        <>
                                        </>
                                        )}
                                        {(this.state.selectedID !== e.id) && (
                                        <>
                                            {e.office}
                                        </>
                                        )}
                                        </>
                                    </td>
                                    )}
                                    <td style={{width:"20%",borderRight:"1px solid black"}}>
                                        <>
                                        {(this.state.selectedID === 0) && (
                                        <>
                                            <Button style={{margin:5}} onClick={() => this.editRow(e.id)} color="primary"><EditIcon/></Button>
                                            <Button style={{margin:5}} onClick={() => this.delRow(e.id)} color="primary"><DeleteIcon/></Button>
                                        </>
                                        )}
                                        {(this.state.selectedID === e.id) && (
                                        <>
                                            <Button style={{margin:5}} onClick={() => this.saveRow(e.id)} color="primary"><SaveIcon/></Button>
                                            <Button style={{margin:5}} onClick={() => this.cancelRow(e.id)} outline color="primary"><CancelIcon/></Button>
                                            </>
                                            )}
                                            </>
                                        </td>
                                    </tr>
                                )
                            })}
                                </tbody>
                            </table>
                        </Col>
                    </Row>
                </Col>                
            </Row>
            <hr/>
            <Row md="12">
                <Col md="6">
                    {(this.state.selectedID === 0) && (
                    <>
                        <Button onClick={this.save} color="primary">Save</Button>
                        <Button outline style={{marginLeft:10}} onClick={this.cancel} color="secondary">Cancel</Button>
                    </>
                    )}
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
        bundleSave: store.bundleSave,
        cptSearch: store.cptSearch ? store.cptSearch : {data:[]},
        cmSearch: store.cmSearch ? store.cmSearch : {data:[]},
        bundles: store.bundles
    }
}

export default connect(mapStateToProps)(BundleList);
