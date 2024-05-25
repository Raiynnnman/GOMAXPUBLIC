import React, { Component } from 'react';
import { FormGroup, Label, Input } from 'reactstrap';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import Select from 'react-select';

import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getTraffic } from '../../actions/trafficGet';
import TrafficMap from './TrafficMap';
import HeatMap from './HeatMap';

class Map extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "traffic",
            dateSelected:null,
            categories:null,
            zipSelected:null
        }
        this.toggleTab = this.toggleTab.bind(this);
        this.onDateChange= this.onDateChange.bind(this);
        this.onZipChange= this.onZipChange.bind(this);
        this.onCategoryChange = this.onCategoryChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
        var changed = false;
        if (p.trafficData.data && p.trafficData.data.config && p.trafficData.data.config.avail && this.state.dateSelected === null) { 
            this.state.dateSelected = p.trafficData.data.config.avail[0].day
            changed = true;
            this.setState(this.state);
        } 
        /*if (p.trafficData.data && p.trafficData.data.config && p.trafficData.data.config.avail && this.state.zipSelected === null) { 
            this.state.zipSelected = p.trafficData.data.config.locations[0].zipcode
            this.setState(this.state);
            changed = true;
        } */
        if (p.trafficData.data && p.trafficData.data.config && p.trafficData.data.config.avail && this.state.categories === null) { 
            var c = 0;
            this.state.categories = [];
            for (c = 0; c < p.trafficData.data.config.categories.length; c++) { 
                if (p.trafficData.data.config.categories[c].name === 'Accident') { continue; }
                if (p.trafficData.data.config.categories[c].name === 'Potential Providers') { continue; }
                this.state.categories.push(p.trafficData.data.config.categories[c]);
            } 
            this.setState(this.state);
            changed = true;
        } 
        if (changed) { 
            var t = [];
            var c = 0;
            for (c = 0; c < this.state.categories.length;c++) { 
                t.push(this.state.categories[c].id);
            } 
            this.props.dispatch(
                getTraffic(
                    {
                        date:this.state.dateSelected,
                        categories:t,
                        zipcode:this.state.zipSelected
                    }
                )
            )
        } 
    }

    componentDidMount() {
        this.props.dispatch(getTraffic({}));
    }

    onCategoryChange(e,t) { 
        var torem = 0;
        if (t.action && t.action === 'remove-value') { 
            torem = t.removedValue.id;
            var k = this.state.categories.filter((g) => g.id !== torem);
            this.state.categories = k;
            this.setState(this.state);
        } 
        if (t.action && t.action === 'select-option') { 
            torem = t.option.value;
            var k = this.props.trafficData.data.config.categories.filter((g) => g.id === torem);
            this.state.categories.push(k[0]);
            this.setState(this.state);
        } 
        if (this.state.categories.length < 1) { return; }
        var d = [];
        var c = 0;
        for (c = 0; c < this.state.categories.length;c++) { 
            d.push(this.state.categories[c].id);
        } 
        this.props.dispatch(getTraffic({categories:d,date:this.state.dateSelected,zipcode:this.state.zipSelected}))
    } 

    onDateChange(e) { 
        var t = [];
        var c = 0;
        for (c = 0; c < this.state.categories.length;c++) { 
            t.push(this.state.categories[c].id);
        } 
        this.state.dateSelected = e.label
        this.setState(this.state);
        this.props.dispatch(getTraffic({categories:t,date:this.state.dateSelected,zipcode:this.state.zipSelected}))
    } 

    onZipChange(e) { 
        var t = [];
        var c = 0;
        for (c = 0; c < this.state.categories.length;c++) { 
            t.push(this.state.categories[c].id);
        } 
        if (e.target.value) { 
            this.state.zipSelected = e.target.value;
            if (e.target.value.length === 5) { 
                this.props.dispatch(getTraffic({categories:t,date:this.state.dateSelected,zipcode:this.state.zipSelected}))
            }
            this.setState(this.state);
        } else { 
            this.state.zipSelected = e.label
            this.setState(this.state);
            this.props.dispatch(getTraffic({categories:t,date:this.state.dateSelected,zipcode:this.state.zipSelected}))
        } 
    } 

    toggleTab(e) { 
        this.state.activeTab = e;
        this.setState(this.state);
    } 

    render() {
        return (
        <>
            {(this.props.trafficData && this.props.trafficData.isReceiving) && (
                <AppSpinner/>
            )}
            <div style={{zIndex:512}}>
                <Row md="12">
                    <Col md="2" style={{zIndex:9995}}>
                      {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.config &&
                        this.props.trafficData.data.config.avail && this.state.dateSelected !== null) && (
                          <Select
                              styles={{ menuPortal: base => ({ ...base, zIndex: 9995 }) }}
                              closeMenuOnSelect={true}
                              isSearchable={true}
                              onChange={this.onDateChange}
                              value={{
                                label:this.state.dateSelected
                              }}
                              options={this.props.trafficData.data.config.avail.map((e) => { 
                                return (
                                    { 
                                    label: e.day,
                                    value: e.id
                                    }
                                )
                              })}
                            />
                        )}
                    </Col>                
                    <Col md="1" style={{zIndex:9995}}>
                      {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.config &&
                        this.props.trafficData.data.config.avail && this.state.dateSelected !== null) && (
                          <Input type="text" id="normal-field" 
                            onChange={this.onZipChange} placeholder="" value={this.state.zipSelected}/>
                        )}
                    </Col>                
                    <Col md="7" style={{zIndex:9995}}>
                      {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.config &&
                        this.props.trafficData.data.config.avail && this.state.dateSelected !== null) && (
                          <Select
                              closeMenuOnSelect={true}
                              isSearchable={false}
                              isMulti
                              onChange={this.onCategoryChange}
                              value={this.state.categories.map((g) => { 
                                return (
                                    {
                                    label:g.name,
                                    id:g.id
                                    }
                                )
                              })}
                              options={this.props.trafficData.data.config.categories.map((e) => { 
                                return (
                                    { 
                                    label: e.name,
                                    value: e.id
                                    }
                                )
                              })}
                            />
                        )}
                    </Col>                
                </Row>
            </div>
            <Row md="12" style={{marginTop:20}}>
                <Col md="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'traffic' })}
                                onClick={() => { this.toggleTab('traffic') }}>
                                <span>{translate('Traffic')}</span>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'heatmap' })}
                                onClick={() => { this.toggleTab('heatmap') }}>
                                <span>{translate('HeatMap')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.center) && (
                        <>
                        <TabContent style={{height:"1000px"}} className='mb-lg' activeTab={this.state.activeTab}>
                            <TabPane tabId="traffic">
                                <TrafficMap data={this.props.trafficData} centerPoint={this.props.trafficData.data.center}/>
                            </TabPane>
                            <TabPane tabId="heatmap">
                                <HeatMap data={this.props.trafficData} centerPoint={this.props.trafficData.data.center}/>
                            </TabPane>
                        </TabContent>
                        </>
                    )}
                </Col>                
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        trafficData: store.trafficData
    }
}

export default connect(mapStateToProps)(Map);
