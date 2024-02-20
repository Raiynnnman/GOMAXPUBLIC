import React, { Component } from 'react';
import { Button } from 'reactstrap'; 
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { FormGroup, Label, InputGroup, Input } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { cptSearch } from '../../actions/cptSearch';
import { cmSearch } from '../../actions/cmSearch';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';

class CPTLookup extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "cpt",
            cpt_value: '',
            cm_value: '',
        }
        this.toggleTab = this.toggleTab.bind(this);
        this.cptsearch = this.cptsearch.bind(this);
        this.cmsearch = this.cmsearch.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    cmsearch(e) { 
        this.state.cm_value = e.target.value;
        var val = e.target.value;
        this.setState(this.state);
        if (val.length < 3) { return; }
        this.props.dispatch(cmSearch({s:val,limit:false}))
    } 

    cptsearch(e) { 
        this.state.cpt_value = e.target.value;
        var val = e.target.value;
        this.setState(this.state);
        if (val.length < 3) { return; }
        this.props.dispatch(cptSearch({s:val,limit:false}))
    } 

    toggleTab(e) { 
        this.state.activeTab = e;
        this.setState(this.state);
    } 

    render() {
        var cptheads = [
            {
                dataField:'id',
                sort:true,
                hidden:true,
                text:'ID'
            },
            {
                dataField:'code',
                sort:true,
                text:'CODE'
            },
            {
                dataField:'description',
                sort:true,
                text:'Description'
            },
        ]
        return (
        <>
            <Row md="12">
                <Col md="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'cpt' })}
                                onClick={() => { this.toggleTab('cpt') }}>
                                <span>{translate('CPT')}</span>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'cm' })}
                                onClick={() => { this.toggleTab('cm') }}>
                                <span>{translate('CM/PCS')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                        <TabPane tabId="cm">
                            <Row md="12">
                                <div style={{display:"flex",alignItems:'center',justifyContent:'start'}}>
                                    <Col md="5">
                                        <Input style={{backgroundColor:"white"}} type="text" id="normal-field" name="desc"
                                            onChange={this.cmsearch} placeholder="Enter search" value={this.state.cm_value}/>
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
                            </Row>
                            <Row md="12" style={{marginTop:10}}>
                                <Col md="12">
                                    <BootstrapTable 
                                        keyField='id' data={this.props.cmSearch.data} 
                                        columns={cptheads} pagination={ paginationFactory()}>
                                    </BootstrapTable>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tabId="cpt">
                            <Row md="12">
                                <div style={{display:"flex",alignItems:'center',justifyContent:'start'}}>
                                    <Col md="5">
                                        <Input style={{backgroundColor:"white"}} type="text" id="normal-field" name="desc"
                                            onChange={this.cptsearch} placeholder="Enter search" value={this.state.cpt_value}/>
                                    </Col>
                                    {(!this.props.cptSearch.isReceiving) && ( 
                                        <Button outline className="button-spinny button-spinny-loading" 
                                            style={{marginLeft:10,height:40,width:50}} color="primary"></Button>
                                    )}
                                    {(this.props.cptSearch.isReceiving) && ( 
                                        <Button className="button-spinny button-spinny-loading" 
                                            style={{marginLeft:10,height:40,width:50}} color="primary"><i class="fa fa-spinner fa-spin"></i></Button>
                                    )}
                                </div>
                            </Row>
                            <Row md="12" style={{marginTop:10}}>
                                <Col md="12">
                                    <BootstrapTable 
                                        keyField='id' data={this.props.cptSearch.data} 
                                        columns={cptheads} pagination={ paginationFactory()}>
                                    </BootstrapTable>
                                </Col>
                            </Row>
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
        cptSearch: store.cptSearch ? store.cptSearch : {data:[]},
        cmSearch: store.cmSearch ? store.cmSearch : {data:[]},
    }
}

export default connect(mapStateToProps)(CPTLookup);
