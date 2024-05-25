import React, { Component } from 'react';
import { Badge } from 'reactstrap';
import { connect } from 'react-redux';
import { Col, Grid } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { FormGroup, Label, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from 'reactstrap';
import {getUser} from '../../actions/user';
import cellEditFactory from 'react-bootstrap-table2-editor';
import BootstrapTable from 'react-bootstrap-table-next';
import { TabContent, TabPane } from 'reactstrap';
import moment from 'moment';
import { setupIntent } from '../../actions/setupIntent';
import cx from 'classnames';
import classnames from 'classnames';
import {CardElement,ElementsConsumer,Elements} from '@stripe/react-stripe-js';
import BillingCreditCardForm from './BillingCreditCardForm';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {loadStripe} from '@stripe/stripe-js';
import {stripeKey} from '../../stripeConfig.js';
import {userDefaultCard} from '../../actions/userDefaultCard';

const stripePromise = loadStripe(stripeKey());

class UserCards extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            newcard:null,
            cardState:{},
            activeTab: "appointments"
        }
        this.saveCard = this.saveCard.bind(this);
        this.setDefault = this.setDefault.bind(this);
        this.cancel = this.cancel.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }
    cancel() {
        this.state.newcard = null;
        this.setState(this.state);
    }
    setDefault(e) { 
        var params = {
            id:e.id,
            is_default: e.is_default ? 0 : 1
        }
        this.state.cardState[e.id] = params.is_default;
        this.setState(this.state)
        this.props.dispatch(userDefaultCard(params)).then(() => {
              toast.success('Successfully updated card.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
        })
    } 
    saveCard() {
        this.state.newcard = null;
        var params = {
            location:{
                lat:this.props.mylocation.lat,
                lon:this.props.mylocation.lon
            }
        }
        this.props.dispatch(getUser(params));
        this.setState(this.state);
    }

    addCard() { 
        this.props.dispatch(setupIntent()).then((e) =>  { 
            this.state.newcard = {id:0};
            this.setState(this.state);
        })
    } 

    render() {
        var card_head =  [ 
            {dataField:'id', sort:true, text:'ID', hidden:true},
            {dataField:'last4', editable:false, sort:true, text:'Last4', hidden:false},
            {dataField:'exp_month', editable:false, sort:true, text:'Exp Month', hidden:false},
            {dataField:'exp_year', editable:false, sort:true, text:'Exp Year', hidden:false},
            {
                dataField:'is_default', sort:false, text:'Default Card', hidden:false,
                editorRenderer:(editorProps, value, row, column, rowIndex, columnIndex) => (
                    <div>
                        <FormGroup className="checkbox abc-checkbox" check>
                          <Input id="checkbox1" onClick={() => this.setDefault(row)} checked={row.is_default} type="checkbox" />{' '}
                          <Label for="checkbox1" check>
                            Make Default
                          </Label>
                        </FormGroup>
                    </div>
                ),
                formatter:(cellContent,row) => (
                    <>
                    <div>
                        {(this.state.cardState[row.id] !== undefined && this.state.cardState[row.id] === 1) && (
                            <Badge color="primary">Default</Badge>
                        )}
                        {(this.state.cardState[row.id] !== undefined && this.state.cardState[row.id] === 0) && (
                            <Badge color="secondary">Not Default</Badge>
                        )}
                        {(this.state.cardState[row.id] === undefined && row.is_default === 1) && (<Badge color="primary">Default</Badge>)}
                        {(this.state.cardState[row.id] === undefined && row.is_default === 0) && (<Badge color="secondary">Not Default</Badge>)}
                    </div>
                    </>
                )
            },
        ]
        return (
        <>
            {(this.props.setupIntent && this.props.setupIntent.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.saveCard && this.props.saveCard.isReceiving) && (
                <AppSpinner/>
            )}
            <Grid md="12" style={{marginTop:50}}>
                <Grid item  md="5">
                    <h5>Cards</h5>
                </Grid>                
            </Grid>
            {(this.state.newcard === null) && (
            <Grid md="12">
                <Grid item  md="12">
                    <Button onClick={() => this.addCard()} style={{marginBottom:10,height:35,width:90}} color="primary">Add</Button>
                </Grid>                
            </Grid>
            )}
            {(this.props.user.data.cards.length < 1 && this.state.newcard === null) && (
            <Grid md="12">
                <Grid item  md="5">
                    <h4 style={{height:100}}>No cards to show</h4>
                </Grid>                
            </Grid>
            )}
            {(this.props.user.data.cards.length > 0 && this.state.newcard === null) && (
            <Grid md="12">
                <Grid item  md="5">
                    <BootstrapTable 
                        keyField='id' data={this.props.user.data.cards} 
                        cellEdit={ cellEditFactory({ mode: 'click',blurToSave:true }) }
                        columns={card_head}> 
                    </BootstrapTable>
                </Grid>                
            </Grid>
            )}
            {(this.props.user && this.props.user.data && this.props.user.data.invoices &&
              this.state.newcard !== null) && (
            <>
            <Grid md="12">
                <Grid item  md="6">
                {(this.props.setupIntent && this.props.setupIntent.data &&
                  this.props.setupIntent.data.data &&
                  this.props.setupIntent.data.data.id) && (
                    <Elements stripe={stripePromise} options={{clientSecret:this.props.setupIntent.data.data.clientSecret}}>
                        <ElementsConsumer>
                            {(ctx) => <BillingCreditCardForm onSave={this.saveCard}
                                onCancel={this.cancel} intentid={this.props.setupIntent.data.data.id} {...ctx} />}
                        </ElementsConsumer>
                    </Elements>
                )}
                </Grid>
            </Grid>
            </>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        user: store.user,
        saveCard: store.saveCard,
        setupIntent: store.setupIntent
    }
}

export default connect(mapStateToProps)(UserCards);
