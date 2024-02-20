import React, { Component } from 'react';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { FormGroup, Label, Input } from 'reactstrap';
import { Button } from 'reactstrap';
import Select from 'react-select';
import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import cellEditFactory from 'react-bootstrap-table2-editor';

class BundleEdit extends Component {
    constructor(props) { 
        super(props);
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
        this.state.selected=this.props.data;
        this.setState(this.state);
    }
    nameChange(e) { 
        this.state.selected['bundle_name'] = e.target.value;
        this.setState(this.state);
    } 
    cancel() { 
        this.props.onCancel()
    } 
    save() { 
        var g = this.state.selected;
        if (g.id === 'new') { 
            delete g['id']
        }
        this.props.onSave(g);
        this.cancel()
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
                toast.error(err.message,
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                );
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

    render() {
        var heads = [ 
                {dataField:'id', sort:true, text:'ID'},
                {
                    dataField:'assigned', sort:true, text:'Assigned',editable:false,
                    formatter:(cellContent,row) => (
                        <div>
                            {
                            this.props.data.physicians.filter((e) => e.id === row.assigned).length > 0 ? 
                            this.props.data.physicians.filter((e) => e.id === row.assigned)[0].first_name + " " +
                            this.props.data.physicians.filter((e) => e.id === row.assigned)[0].last_name + " " : "Assign"
                            }
                        </div>
                    ),
                    editorRenderer:(editorProps, value, row, column, rowIndex, columnIndex) => (
                        <div>
                            <Select 
                              onChange={this.assignChange}
                              isSearchable={false}
                              options={this.props.data.physicians.map((e) => { 
                                return (
                                    {
                                    value:e.id,
                                    row:row.id,
                                    label:e.first_name + " " + e.last_name
                                    }
                                )
                              value={
                                label: this.props.data.physicians.filter((e) => e.id === row.id)[0].first_name + " " +
                                    this.props.data.physicians.filter((e) => e.id === row.id)[0].last_name 
                              }
                              })}
                            />
                        </div>
                    )
                },
                {
                    dataField:'code', sort:true, text:'Code',editable:false,
                },
                {
                    dataField:'desc', sort:true, text:'Description',editable:false,
                },
                {
                    dataField:'price', sort:true, text:'Price',editable:false,
                    align:'right',
                    formatter:(cellContent,row) => (
                        <>
                        ${row.price.toFixed(2)}
                        </>
                    )
                },
                {
                    dataField:'market', sort:true, text:'Market',
                    editable: false,
                    align:'right',
                    formatter:(cellContent,row) => (
                        <>
                        ${parseFloat(row.market).toFixed(2)}
                        </>
                    )
                }
        ] 
        return (
        <>
            {(this.props.bundleAdmin && this.props.bundleAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.state.selected !== null) && (
            <Row md="12">
                <Col md="12">
                    <Row md="12">
                        <Col md="5">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              CM/PCS 
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.cmChange} placeholder="CM/PCS" value={this.state.selected.code} readOnly className='bg-white'/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="5">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Name
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.nameChange} placeholder="Name" value={this.state.selected.bundle_name} readOnly className='bg-white'/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="5">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              DHD Markup
                            </Label>
                            <Col md={7}>
                              <Input type="text" id="normal-field" onChange={this.nameChange} placeholder="" value={this.state.selected.pain_markup + "%"} readOnly className='bg-white'/>
                            </Col>
                          </FormGroup>
                        </Col>
                    </Row>
                    <Row md="12">
                        <Col md="10">
                            <h5>Items</h5>
                            <BootstrapTable 
                                keyField='id' data={this.state.selected.items} 
                                cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true }) }
                                columns={heads} pagination={ paginationFactory()}>
                            </BootstrapTable>
                        </Col>
                        <Col md="1"></Col>
                    </Row>
                </Col>                
            </Row>
            )}
            <hr/>
            <Row md="12">
                <Col md="6">
                    <Button onClick={this.save} color="primary">Save</Button>
                    <Button outline style={{marginLeft:10}} onClick={this.cancel} color="secondary">Cancel</Button>
                </Col>
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
    }
}

export default connect(mapStateToProps)(BundleEdit);
