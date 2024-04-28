import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Badge } from 'reactstrap';
import { Button } from 'reactstrap'; 

import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {getOfficeLocations} from '../../actions/officeLocations';
import LocationCard from './LocationCard';

class OfficeAddresses extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "office",
            selected:null,
        }
        this.toggleTab = this.toggleTab.bind(this);
        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getOfficeLocations({page:0,limit:10000}))
    }

    toggleTab(e) { 
        this.state.activeTab = e;
    } 

    cancel(e) { 
        this.state.selected = null;
        this.setState(this.state)
    } 

    save() { 
    } 

    edit(e) { 
        if (e.id === 'new') { 
            this.state.selected = { 
                name:'',
                miles:0,
                addr:{addr1:'',city:'',state:'',zipcode:'',phone:''},
                rating:0
            } 
        } else { 
            t = this.props.officeLocations.data.locations.filter((g) => g.id === e.id)
            this.state.selected = t[0] 
        } 
        this.setState(this.state)
    } 

    render() {
        console.log("p",this.props)
        return (
        <>
            {(this.props.officeLocations && this.props.officeLocations.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.state.selected !== null) && (
            <>
            <Row md="12">
                <Col md="4">
                    <LocationCard provider={this.state.selected} onCancel={this.cancel} onSave={this.onSave} edit={true}/>
                </Col>
            </Row>
            <hr/>
            <Row md="12">
                <Col md="12">
                    <Col md="6">
                        <Button onClick={this.save} color="primary">Save</Button>
                        <Button outline style={{marginLeft:10}} onClick={this.close} 
                            color="secondary">Close</Button>
                    </Col>
                </Col>
            </Row>
            </>
            )}
            {(this.state.selected === null) && (
            <>
            <Row md="12">
                <Col md="1">
                    <Button onClick={() => this.edit({id:'new'})} style={{width:50}}
                        color="primary"><AddBoxIcon/></Button>
                </Col>
            </Row>
            <Row md="12">
                {(this.props.officeLocations && this.props.officeLocations.data &&
                  this.props.officeLocations.data.locations && 
                  this.props.officeLocations.data.locations.length > 0) && (
                  <>
                    {this.props.officeLocations.data.locations.map((e) => {
                        return (
                        <Col md="4">
                            <LocationCard provider={e} edit={false}/>
                        </Col>
                        )
                    })}
                  </>
                )}
            </Row>
            </>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        officeLocations: store.officeLocations
    }
}

export default connect(mapStateToProps)(OfficeAddresses);
