import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Grid } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import Scheduling from '../utils/Scheduling';
import { getLegals } from '../../actions/legal';
import { saveLegalSchedule } from '../../actions/legalSchedSave';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class LegalSettings extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "offices",
        }
        this.toggleTabs = this.toggleTab.bind(this);
        this.onSchedulingChange = this.onSchedulingChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getLegals({}))
    }

    toggleTab(e) { 
        this.state.activeTab = e;
        this.setState(this.state)
    } 
    onSchedulingChange(e) { 
        var params = {
            recurring: e.recurring,
            start_time: e.start_time,
            end_time: e.end_time,
            days:e.days,
            inter:e.inter,
            id:e.id
        }
        if (params.id === 'new') { 
            delete params.id;
        } 
        this.props.dispatch(saveLegalSchedule(params)).then(() => { 
              toast.success('Successfully scheduled appointment.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
        });
    }

    render() {
        return (
        <>
            {(this.props.consultants && this.props.consultants.isReceiving) && (
                <AppSpinner/>
            )}
            <Grid md="12">
                <Grid item  md="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'offices' })}
                                onClick={() => { this.toggleTab('offices') }}>
                                <span>{translate('Offices')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                            <TabPane tabId="offices">
                            {(this.props.consultants && this.props.consultants.data && this.props.consultants.data.config) && (
                                <Scheduling 
                                    data={this.props.consultants.data.config.schedule} onSchedulingChange={this.onSchedulingChange}/>
                            )}
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
        consultants: store.consultants
    }
}

export default connect(mapStateToProps)(LegalSettings);
