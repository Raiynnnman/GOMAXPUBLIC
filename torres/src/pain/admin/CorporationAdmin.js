import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getAdminCorporations } from '../../actions/corporationAdmin';
import CorporationAdminList from './CorporationAdminList';

class Corporation extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "corporations"
        }
        this.toggleTabs = this.toggleTab.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getAdminCorporations({page:0,limit:10000}))
    }

    toggleTab(e) { 
        this.state.activeTab = e;
        this.setState(this.state);
    } 

    render() {
        return (
        <>
            {(this.props.corporationAdmin && this.props.corporationAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'corporations' })}
                                onClick={() => { this.toggleTab('corporations') }}>
                                <span>{translate('Corporations')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                        <TabPane tabId="corporations">
                            <CorporationAdminList/>
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
        corporationss: store.corporationss,
    }
}

export default connect(mapStateToProps)(Corporation);
