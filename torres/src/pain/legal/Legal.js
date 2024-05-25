import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getLegals } from '../../actions/legal';

class Legal extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getLegals())
    }

    render() {
        return (
        <>
            {(this.props.consultants && this.props.consultants.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                    <h1>CONSU</h1>
                </Col>                
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
    }
}

export default connect(mapStateToProps)(Legal);
