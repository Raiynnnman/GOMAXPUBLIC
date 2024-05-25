import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getOfficeAssociations } from '../../actions/officeAssociation';
import OfficeAssociationList from './OfficeAssociationList';

class OfficeAssociation extends Component {

    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "assoc"
        }
        this.toggleTabs = this.toggleTab.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getOfficeAssociations({page:0,limit:10000}))
    }

    toggleTab(e) { 
        this.state.activeTab = e;
    } 

    render() {
        return (
        <>
            {(this.props.officeAssociation && this.props.officeAssociation.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'assoc' })}
                                onClick={() => { this.toggleTab('assoc') }}>
                                <span>{translate('Associations')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                        <TabPane tabId="assoc">
                            <OfficeAssociationList/>
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
        officeAssociation: store.officeAssociation
    }
}

export default connect(mapStateToProps)(OfficeAssociation);
