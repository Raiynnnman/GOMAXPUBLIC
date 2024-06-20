import React, { useEffect, useState, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {stripeKey} from '../../stripeConfig.js';
import { useDispatch, useSelector } from "react-redux";
import { Grid } from '@mui/material';
import { CardElement, Elements, useElements, useStripe, } from "@stripe/react-stripe-js";
import { ElementsConsumer } from "@stripe/react-stripe-js";
import { PaymentElement } from "@stripe/react-stripe-js";
import { saveCard } from "../../actions/saveCard";
import {toast} from "react-toastify";
import TemplateButton from '../utils/TemplateButton';

function BillingCreditCardForm({ data, intentid, onCancel, onSave,stripe, onCardChange }) {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [addedCard,setAddedCard] = useState(false);

  const [disableSaveButton, setDisableSaveButton] = useState(true);

  const elements = useElements();
  const appearance = { clientSecret:stripeKey(), theme:'night',labels:'floating' }
  //const elements = stripe.elements({appearance});
  const dispatch = useDispatch();

  const handleCancel = function () {
    onCancel();
  };

  const handlePaymentAdd = async (event,data) => {
    event.preventDefault();
    let tosend = {
      name: data.first + " " + data.last,
      address_phone: data.phone
    };
    const card = elements.getElement(CardElement);
    const result = await stripe.createToken(card, tosend);
    onSave(result,intentid);
    setAddedCard(true);
  };

  const handleChangeCard = async (e,t) => { 
    let tosend = {
      name: data.first + " " + data.last,
      address_phone: data.phone
    };
    if (e.complete) { 
        const card = elements.getElement(CardElement);
        const result = await stripe.createToken(card, tosend);
        onCardChange(e,card,result);
    } 
  };

    /*const cardStyle = {
        style: {
          base: {
            color: "black",
            margin:20,
            backgroundColor:"white",
            fontSize: "20px",
            "::placeholder": {
              color: "black"
            }
          },
          invalid: {
            fontSize: "24px",
            color: "#fa755a",
            backgroundColor:"white",
            iconColor: "white"
          }
        }
      }; */
  const cardStyle = {
        style: {
          base: {
            fontSize: "20px",
          }
        }
  } 

  return (
    <div style={{ margin: 20 }}>
        <Grid container xs={12}>
            <Grid item xs={12}>
                <CardElement onChange={handleChangeCard} options={cardStyle} elements={elements}/>
            </Grid>
        </Grid>
        {/*<Grid container xs="12">
            <div style={{marginTop:0,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <TemplateButton color="primary" onClick={(e) => handlePaymentAdd(e,data)} label='Register'/>
            </div>
        </Grid>*/}
    </div>
  );
}

export default BillingCreditCardForm;
