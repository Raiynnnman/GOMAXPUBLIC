import React, { Component } from 'react';
import { connect } from 'react-redux';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import cx from 'classnames';
import classnames from 'classnames';
import translate from '../../utils/translate';
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
              <Card
                className="mb-0 h-100"
                style={{margin:10,border:"1px solid #e3e3e3",borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}}
                bodyClass="mt-lg"
              >
                <CardHeader title={<h5>{translate(this.props.title)}</h5>}></CardHeader>
                <hr/>
                <CardContent>
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
                          <h6>{this.props.num2isdollar ? "$" :""}{ this.props.num2pure ? this.props.data.num2 : convertToFormat(this.props.data.num2) }</h6>
                        </div>
                          <p className="text-muted mb-0 me-1">
                              <small>{this.props.num2title}</small>
                          </p>
                      </div>
                      <div className={cx('mt')}>
                        <div style={{height:10,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <h6>{this.props.num3isdollar ? "$" :""}{ this.props.num3pure ? this.props.data.num3 : convertToFormat(this.props.data.num3)}{this.props.num3ispercent?'%':''}</h6>
                        </div>
                          <p className="text-muted mb-0">
                              <small>{this.props.num3title}</small>
                          </p>
                      </div>
                      <div className={cx('mt')}>
                        <div style={{height:10,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <h6>{this.props.num4isdollar ? "$" :""}{this.props.num4pure ? this.props.data.num4 : convertToFormat(this.props.data.num4)}</h6>
                        </div>
                          <p className="text-muted mb-0 me-1">
                              <small>{this.props.num4title}</small>
                          </p>
                      </div>
                  </div>
                </CardContent>
              </Card>
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
