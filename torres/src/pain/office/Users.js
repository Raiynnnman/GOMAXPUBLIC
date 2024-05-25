import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getOfficeUsers } from '../../actions/officeUsers';
import UsersList from './UsersList';

class Users extends Component {

    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "bundle"
        }
        this.toggleTabs = this.toggleTab.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getOfficeUsers({page:0,limit:10000}))
    }

    toggleTab(e) { 
        this.state.activeTab = e;
    } 

    render() {
        return (
        <>
            {(this.props.officeUsers && this.props.officeUsers.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'bundle' })}
                                onClick={() => { this.toggleTab('bundle') }}>
                                <span>{translate('Users')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                        <TabPane tabId="bundle">
                            <UsersList/>
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
        officeUsers: store.officeUsers
    }
}

export default connect(mapStateToProps)(Users);
