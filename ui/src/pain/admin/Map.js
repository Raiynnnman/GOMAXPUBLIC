import React, { Component } from 'react';
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

class Map extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "traffic",
            dateSelected:null,
            zipSelected:null
        }
        this.toggleTab = this.toggleTab.bind(this);
        this.onDateChange= this.onDateChange.bind(this)
    } 

    componentWillReceiveProps(p) { 
        var changed = false;
        if (p.trafficData.data && p.trafficData.data.config && p.trafficData.data.config.avail && this.state.dateSelected === null) { 
            this.state.dateSelected = p.trafficData.data.config.avail[0].day
            changed = true;
            this.setState(this.state);
        } 
        if (p.trafficData.data && p.trafficData.data.config && p.trafficData.data.config.avail && this.state.zipSelected === null) { 
            this.state.zipSelected = p.trafficData.data.config.locations[0].zipcode
            this.setState(this.state);
            changed = true;
        } 
        if (changed) { 
            console.log("s",this.state);
            this.props.dispatch(getTraffic({date:this.state.dateSelected,zipcode:this.state.zipSelected}))
        } 
    }

    componentDidMount() {
            this.props.dispatch(getTraffic({}));
    }

    onDateChange(e) { 
        console.log(e)
        this.state.dateSelected = e.label
        this.setState(this.state);
        this.props.dispatch(getTraffic({date:this.state.dateSelected,zipcode:this.state.zipSelected}))
    } 

    onZipChange(e) { 
        console.log(e)
        this.state.zipSelected = e.label
        this.setState(this.state);
        this.props.dispatch(getTraffic({date:this.state.dateSelected,zipcode:this.state.zipSelected}))
    } 

    toggleTab(e) { 
        this.state.activeTab = e;
    } 

    render() {
        console.log("p",this.props);
        console.log("s",this.state);
        return (
        <>
            {(this.props.trafficData && this.props.trafficData.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="4">
                  {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.config &&
                    this.props.trafficData.data.config.avail && this.state.dateSelected !== null) && (
                      <Select
                          closeMenuOnSelect={true}
                          isSearchable={false}
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
                <Col md="4">
                  {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.config &&
                    this.props.trafficData.data.config.avail && this.state.dateSelected !== null) && (
                      <Select
                          closeMenuOnSelect={true}
                          isSearchable={false}
                          onChange={this.onZipChange}
                          value={{
                            label:this.state.zipSelected
                          }}
                          options={this.props.trafficData.data.config.locations.map((e) => { 
                            return (
                                { 
                                label: e.zipcode,
                                value: e.zipcode
                                }
                            )
                          })}
                        />
                    )}
                </Col>                
            </Row>
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
                            <NavLink className={classnames({ active: this.state.activeTab === 'weather' })}
                                onClick={() => { this.toggleTab('weather') }}>
                                <span>{translate('Weather')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                        <TabPane tabId="traffic">
                            <TrafficMap data={this.props.trafficData}/>
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
        trafficData: store.trafficData
    }
}

export default connect(mapStateToProps)(Map);
