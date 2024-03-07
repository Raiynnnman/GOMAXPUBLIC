import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { push } from 'connected-react-router';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Button } from 'reactstrap'; 
import { Badge } from 'reactstrap';
import { Search } from 'react-bootstrap-table2-toolkit';
import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { FormGroup, Label, Input } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getContext } from '../../actions/context';
import { corporationAdminSave } from '../../actions/corporationAdminSave';
import { getAdminCorporations } from '../../actions/corporationAdmin';

const { SearchBar } = Search;
class CorporationList extends Component {
    constructor(props) { 
        super(props);
        this.getContext = this.getContext.bind(this);
        this.state = { 
            selected: null,
            selectedID: 0
        } 
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.nameChange = this.nameChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    getContext(e) { 
        this.props.dispatch(getContext({office:e.id},function(err,args) { 
                localStorage.setItem("context",true);
                window.location.href = '/index.html';
        }))
    } 

    edit(row) { 
        this.state.selected = JSON.parse(JSON.stringify(row));
        this.setState(this.state);
    } 
    nameChange(e) { 
        this.state.selected['name'] = e.target.value;
        this.setState(this.state);
    } 
    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
    } 
    save() { 
        var g = this.state.selected;
        if (g.id === 'new') { 
            delete g['id']
        }
        this.props.dispatch(corporationAdminSave(g,function(err,args) { 
            args.props.dispatch(getAdminCorporations({page:0,limit:10000},function(err,args) { 
              toast.success('Successfully saved corporation.',
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

    addRow() { 
        this.state.selected.addr.push({
            id:0,phone:'',addr1:'',addr2:'',city:'',state:'',zipcode:''
        })
        this.setState(this.state);
    } 

    render() {
        const options = {
          showTotal:true,
          sizePerPage:10,
          hideSizePerPage:true
        };
        var heads = [
            {
                dataField:'id',
                sort:true,
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
                dataField:'id',
                text:'Actions',
                formatter:(cellContent,row) => ( 
                    <div>
                        <Button onClick={() => this.edit(row)} style={{marginRight:5,height:35,width:90}} color="primary">Edit</Button>
                        <Button onClick={() => this.getContext(row)} style={{height:35,width:90}} color="primary">Context</Button>
                    </div>
                )
            },
        ];
        var addrheads = [ 
                {dataField:'id', sort:true, text:'ID', hidden:true, style:{height:50}},
                {dataField:'phone', sort:true, text:'Phone'},
                {dataField:'addr1', sort:true, text:'Address1'},
                {dataField:'addr2', sort:true, text:'Address2'},
                {dataField:'city', sort:true, text:'City'},
                {dataField:'state', sort:true, text:'State'},
                {dataField:'zipcode', sort:true, text:'Zip'}
        ] 
        return (
        <>
            {(this.props.corporationAdmin && this.props.corporationAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.context && this.props.context.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.officeSave && this.props.officeSave.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.corporationAdmin && this.props.corporationAdmin.data && this.props.corporationAdmin.data.length > 0 &&
              this.state.selected === null) && ( 
            <>
            <Row md="12">
                <Col md="4" style={{marginBottom:10}}>
                    <Button onClick={() => this.edit({id:"new",addr:[]})} style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                </Col>
            </Row>
            <Row md="12">
                <Col md="12">
                    <BootstrapTable 
                        keyField='id' data={this.props.corporationAdmin.data} 
                        columns={heads} pagination={ paginationFactory(options)}>
                    </BootstrapTable>
                </Col>                
            </Row>
            </>
            )}
            {(this.props && this.props.corporationAdmin && this.props.corporationAdmin.data && this.props.corporationAdmin.data.length > 0 &&
              this.state.selected !== null) && ( 
                <>
                <Row md="12">
                    <Col md="12">
                        <Row md="12">
                            <Col md="5">
                              <FormGroup row>
                                <Label for="normal-field" md={4} className="text-md-right">
                                  Name
                                </Label>
                                <Col md={7}>
                                  <Input type="text" id="normal-field" onChange={this.nameChange} placeholder="Name" value={this.state.selected.name}/>
                                </Col>
                              </FormGroup>
                            </Col>
                        </Row>
                        <Row md="12">
                            <Col md="10">
                                <h5>Addresses</h5>
                                {(this.state.selected && this.state.selected.addr && this.state.selected.addr.length < 1) && (
                                    <Button onClick={() => this.addRow()} style={{marginBottom:10,height:35,width:90}} color="primary">Add</Button>
                                )}
                                {(this.state.selected && this.state.selected.addr && this.state.selected.addr.length > 0) && (
                                <BootstrapTable 
                                    keyField='id' data={this.state.selected.addr} 
                                    cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true }) }
                                    columns={addrheads} >
                                </BootstrapTable>
                                )}
                                {(this.state.selected && this.state.selected.addr && this.state.selected.addr.length < 1) && (
                                    <h5>No addresses registered</h5>
                                )}
                            </Col>
                            <Col md="1"></Col>
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
        officeSave: store.officeSave,
        context: store.context,
        corporationAdmin: store.corporationAdmin
    }
}

export default connect(mapStateToProps)(CorporationList);
