import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getPhysicians } from '../../actions/phy';
import PhysicianList from './PhysicianList';

class Physician extends Component {

    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "phy"
        }
        this.toggleTabs = this.toggleTab.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getPhysicians({page:0,limit:10000}))
    }

    toggleTab(e) { 
        this.state.activeTab = e;
    } 

    render() {
        return (
        <>
            {(this.props.phy && this.props.phy.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'phy' })}
                                onClick={() => { this.toggleTab('phy') }}>
                                <span>{translate('Physicians')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                        <TabPane tabId="phy">
                            <PhysicianList/>
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
        phy: store.phy
    }
}

export default connect(mapStateToProps)(Physician);
