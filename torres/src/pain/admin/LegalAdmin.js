import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Grid } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import LegalAdminList from './LegalAdminList';
import { getPlansList } from '../../actions/plansList';

class Office extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "office"
        }
        this.toggleTabs = this.toggleTab.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getPlansList({}));
    }

    toggleTab(e) { 
        this.state.activeTab = e;
        this.setState(this.state);
    } 

    render() {
        return (
        <>
            {(this.props.offices && this.props.offices.isReceiving) && (
                <AppSpinner/>
            )}
            <Grid container xs="12">
                <Grid item xs="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'office' })}
                                onClick={() => { this.toggleTab('office') }}>
                                <span>{translate('Providers')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                        <TabPane tabId="office">
                            <LegalAdminList match={this.props.match}/>
                        </TabPane>
                    </TabContent>
                </Grid>                
            </Grid>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        offices: store.offices,
    }
}

export default connect(mapStateToProps)(Office);
