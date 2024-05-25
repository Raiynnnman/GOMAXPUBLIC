import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import cx from 'classnames';
import classnames from 'classnames';
import TrendHeroWithStats from './components/TrendHeroWithStats';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {getReferrerDashboard} from '../../actions/referrerDashboard';

class Template extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getReferrerDashboard())
    }

    render() {
        return (
        <>
            {(this.props.referrerDashboard && this.props.referrerDashboard.data && 
              this.props.referrerDashboard.data.clients) && (
                <Grid md="12">
                    <Grid item  md="3">
                        <TrendHeroWithStats data={this.props.referrerDashboard.data.clients}
                            title="Clients Uploaded" num2title="Month" num3title="Year" 
                            num4title="Converted"/> 
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
        referrerDashboard: store.referrerDashboard
    }
}

export default connect(mapStateToProps)(Template);
