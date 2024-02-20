import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import Widget from '../../../components/Widget';
import translate from '../../utils/translate';
import s from './Analytics.module.scss';
import convertToFormat from '../../utils/convertToFormat';

class TrendHeroWithStats extends Component {
    constructor(props) { 
        super(props);
        this.state = { }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }


    render() {
        return (
        <>
            <div className="pb-xlg h-100">
              <Widget
                className="mb-0 h-100"
                style={{border:"1px solid #e3e3e3",borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}}
                bodyClass="mt-lg"
                title={<h5>{translate(this.props.title)}</h5>}
              >
                  <div style={{marginBottom:10}}> 
                    <div style={{height:30,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <font style={{fontSize: '40px',fontWeight:"bold"}}>
                        {this.props.num1isdollar ? "$" :""}{convertToFormat(this.props.data.num1)}
                      </font>
                    </div>
                  </div>
                  <hr/>
                  <div className="d-flex flex-wrap justify-content-between">
                      <div className={cx('mt')}>
                        <div style={{height:10,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <h6>{this.props.num2isdollar ? "$" :""}{ convertToFormat(this.props.data.num2) }</h6>
                        </div>
                          <p className="text-muted mb-0 me-1">
                              <small>{this.props.num2title}</small>
                          </p>
                      </div>
                      <div className={cx('mt')}>
                        <div style={{height:10,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <h6>{this.props.num3isdollar ? "$" :""}{ convertToFormat(this.props.data.num3)}{this.props.num3ispercent?'%':''}</h6>
                        </div>
                          <p className="text-muted mb-0">
                              <small>{this.props.num3title}</small>
                          </p>
                      </div>
                      <div className={cx('mt')}>
                        <div style={{height:10,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <h6>{convertToFormat(this.props.data.num4)}</h6>
                        </div>
                          <p className="text-muted mb-0 me-1">
                              <small>{this.props.num4title}</small>
                          </p>
                      </div>
                  </div>
              </Widget>
            </div>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
    }
}

export default connect(mapStateToProps)(TrendHeroWithStats);
