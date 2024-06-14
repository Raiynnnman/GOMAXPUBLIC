import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import classnames from 'classnames';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import Reset from '../reset/Reset';
import { registerVerify } from '../../actions/registerVerify';

class ThankYou extends Component {
    constructor(props) { 
        super(props);
        this.state = { }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        if (this.props.match && this.props.match.params && this.props.match.params.token) { 
            this.props.dispatch(registerVerify({token:this.props.match.params.token}));
        } 
    }


    render() {
        return (
        <>
            <Reset/>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser
    }
}

export default connect(mapStateToProps)(ThankYou);
