import React, { Component } from 'react';
import { FormGroup, Label, Input } from 'reactstrap';
import Select from 'react-select';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { bundleSave } from '../../actions/bundleSave';
import { push } from 'connected-react-router';
import { Nav, NavItem, NavLink } from 'reactstrap';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Button } from 'reactstrap'; 
import { Badge } from 'reactstrap';
import { Search } from 'react-bootstrap-table2-toolkit';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getOfficeAssociations } from '../../actions/officeAssociation';
import { officeAssociationUpdate } from '../../actions/officeAssociationUpdate';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';

const { SearchBar } = Search;
class OfficeAssociationList extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            selectedID: 0
        } 
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.nameChange = this.nameChange.bind(this);
        this.assignChange = this.assignChange.bind(this);
        this.officeChange = this.officeChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    edit(row) { 
        this.state.selected = JSON.parse(JSON.stringify(row));
        this.setState(this.state);
    } 

    officeChange(e,t) { 
        this.state.selected.office_id = e.value;
        this.setState(this.state);
    }
    assignChange(e,t) { 
        var i = this.state.selected.items.findIndex((g) => g.id === e.row)
        var u = e.value;
        this.state.selected.items[i].assigned=u;
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
        if (g.id === 'new' || g.id < 1) { 
            delete g['id']
        }
        this.props.dispatch(officeAssociationUpdate(g,function(err,args) { 
            args.props.dispatch(getOfficeAssociations(args.state.selected,function() { 
                args.cancel()
                toast.success('Successfully saved item.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                );
            },this))
        },this));
    } 

    addRow() { 
        this.state.selected.items.push({
            id:"new",
            office_id:0
        })
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
                dataField:'name',
                sort:true,
                text:'Name'
            },
            
        ];
        return (
        <>
            {(this.props.officeAssociation && this.props.officeAssociation.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.officeAssociationUpdate && this.props.officeAssociationUpdate.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.officeAssociation && this.props.officeAssociation.data &&
              this.props.officeAssociation.data.assigned && this.state.selected === null) && ( 
            <>
            <Row md="12">
                <Col md="4" style={{marginBottom:10}}>
                    <Button onClick={() => this.edit({id:"new",office_id:0})} style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                </Col>
            </Row>
            <Row md="12">
                <Col md="12">
                    <BootstrapTable 
                        keyField='id' data={this.props.officeAssociation.data.assigned} 
                        columns={heads} pagination={ paginationFactory()}>
                    </BootstrapTable>
                </Col>                
            </Row>
            </>
            )}
            {(this.props && this.props.officeAssociation && this.props.officeAssociation.data && 
              this.props.officeAssociation.data.assigned && this.state.selected !== null) && ( 
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
                        <Col md="5">
                            <h5>Pick office</h5>
                            <Select 
                              onChange={this.officeChange}
                              closeMenuOnSelect={true}
                              isSearchable={true}
                              options={this.props.officeAssociation.data.offices.map((e) => { 
                                return (
                                    {
                                    value:e.id,
                                    label:e.name
                                    }
                                )
                              })}
                              value={{
                                label: this.props.officeAssociation.data.offices.filter((g) => g.id === this.state.selected.office_id).length > 0 ? 
                                    this.props.officeAssociation.data.offices.filter((g) => g.id === this.state.selected.office_id)[0].name  : ""
                              }}
                            />
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
        officeAssociationUpdate: store.officeAssociationUpdate,
        officeAssociation: store.officeAssociation
    }
}

export default connect(mapStateToProps)(OfficeAssociationList);
