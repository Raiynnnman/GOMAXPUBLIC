import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import cx from 'classnames';
import classnames from 'classnames';
import TrendHeroWithStats from './components/TrendHeroWithStats';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getBDRDashboard } from '../../actions/bdrDashboard';

class BDRDashboard extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getBDRDashboard())
    }

    render() {
        return (
        <>
            {(this.props.offices && this.props.offices.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.bdrDashboard && this.props.bdrDashboard.data && 
              this.props.bdrDashboard.data.commissions) && (
                <Grid container xs="12">
                    <Grid item xs="3">
                        <TrendHeroWithStats data={this.props.bdrDashboard.data.commissions}
                            title="Commissions" 
                                num1isdollar={true} num2title="Paid" num2isdollar={true} 
                                num3title="Sent" num3isdollar={true} num4isdollar={true} 
                                num4title="Void"/>
                    </Grid>
                </Grid>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        bdrDashboard: store.bdrDashboard
    }
}

export default connect(mapStateToProps)(BDRDashboard);
