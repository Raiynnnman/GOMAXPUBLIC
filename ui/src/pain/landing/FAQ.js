import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getOffices } from '../../actions/offices';

class FAQ extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            qs:[
                {
                 q:"Why was DHD created?"
                 ,
                 a:"Healthcare is complex with unpredictable costs and inconsistent quality and access." 
                },
                {
                 q:"How does DHD reduce costs?"
                 ,
                 a:"By directly contracting with provider doctors surgery centers and hospitals DHD removes layers of complexities as it  simplifies how the process and pays them directly on the same day of surgery."
                },
                {
                 q:"How do you assure quality?"
                 ,
                 a:"DHD only engages doctors that are well credentialed as well as being chosen by their healthcare colleagues to operate on their own family members. We call them the Doctors’ Doctors."
                },
                {
                 q:"What is DHD and what does it do?"
                 ,
                 a:"Direct Health Delivery is a healthcare service and payment company that directly connects patients with providers of care with a main focus on surgery. "
                },
                {
                 q:"What surgeries does DHD assist with?"
                 ,
                 a:"All surgical specialties including general, ENT-Head & NECK, Orthopedics, Gynecological, Podiatry, Urology. Also DHd assists with complex procedures like coronary artery catheterization & stents, endoscopy and some cancer treatments."
                },
                {
                 q:"Does DHD help with other services?"
                 ,
                 a:"Yes. For primary care services most patients manage this process well while in specialty care it quickly gets complicated and complex. DHD has helped patients for coronary artery catheterization and stents, dialysis, hemophilia treatment, cancer treatment, alcohol and drug rehabilitation and direct access to generic and specialty pharmaceutical drugs."
                },
                {
                 q:"Where is DHD available?"
                 ,
                 a:"Currently DHD serves clients in California and Texas with a nationally scalable outlook."
                },
                {
                 q:"How are services accessed?"
                 ,
                 a:"Directly by contacting DHD coordinators and patient advocates @ 866-343-4255 or through your employer sponsored health benefits when the plan administrator is connected to the DHD Platform. Alternatively if you wish to pay directly for treatments by personal, HAS or HRA funds."
                },
                {
                 q:"What about Deductibles & copays?"
                 ,
                 a:"Each health benefit plan has its guidelines. In most cases when DHD is used they are reduced or completely waived."
                },
                {
                 q:"Does my employer or I have to wait for renewal to access DHD?"
                 ,
                 a:"No. DHD is designed to be available at any time of the year since we don’t charge for access."
                },
                {
                 q:"Can I use my Doctor/surgeon when DHD is involved?"
                 ,
                 a:"Yes. Most surgeons actually prefer to interact through DHD and he or she is not on the panel they are usually added in 24 hours."
                },
            ]
        }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    render() {
        return (
        <>
            {this.state.qs.map((e) => { 
                return (
                    <>
                    <Row md="12" style={{marginBottom:10}}>
                        <Col md="1"></Col>
                        <Col md="11">
                            <font style={{fontSize:18,fontWeight:"bold"}}>{e.q}</font>
                        </Col>
                    </Row>
                    <Row md="12" style={{marginBottom:10}}>
                        <Col md="2"></Col>
                        <Col md="10">{e.a}</Col>
                    </Row>
                    </>
                )
            })}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
    }
}

export default connect(mapStateToProps)(FAQ);
