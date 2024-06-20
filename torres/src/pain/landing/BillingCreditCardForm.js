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

function BillingCreditCardForm({ data, intentid, onCancel, onSave,stripe }) {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [addedCard,setAddedCard] = useState(false);

  const [disableSaveButton, setDisableSaveButton] = useState(true);

  const [fetchedStates, setFetchedStates] = useState();
  const [fetchedCities, setFetchedCities] = useState();
  const [filteredStates, setFilteredStates] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  const [selectedState, setSelectedState] = useState();
  const [selectedCity, setSelectedCity] = useState();

  const [cityIsOpen, setCityIsOpen] = useState(false);
  const [stateIsOpen, setStateIsOpen] = useState(false);

  const elements = useElements();
  const appearance = { clientSecret:stripeKey(), theme:'night',labels:'floating' }
  //const elements = stripe.elements({appearance});
  const dispatch = useDispatch();

  const handleCancel = function () {
    onCancel();
  };

  const handlePaymentAdd = async (event,data) => {
    console.log(event,data);
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

  const handleChangeName = (event) => {
    setName(event.target.value);
  };
  const handleChangePhone = (event) => {
    setPhone(event.target.value);
  };
  const handleChangeAddress1 = (event) => {
    setAddress1(event.target.value);
  };
  const handleChangeAddress2 = (event) => {
    setAddress2(event.target.value);
  };
  const handleChangeCity = (event) => {
    if (fetchedCities) {
      let foundCity = fetchedCities.find(
          (city) => city === event.target.value
      );
      if (foundCity !== undefined) {
        setSelectedCity(foundCity);
      }
      setFilteredCities(
        fetchedCities.filter((city) => city.name.includes(event.target.value))
      );
    }
    setCity(event.target.value);
  };
  const handleChangeState = (event) => {
    if (fetchedStates) {
      let foundState = fetchedStates.find(
        (state) => state === event.target.value
      );
      if (foundState !== undefined) {
        setSelectedState(foundState);
      }
      setFilteredStates(
        fetchedStates.filter((stateName) =>
          stateName.name.includes(event.target.value)
        )
      );
    }
    setState(event.target.value);
  };
  const handleChangeZip = (event) => {
    setZip(event.target.value);
  };

  useEffect(() => {
    setDisableSaveButton(
      name.length <= 0 ||
        // Don't know if phone is required, if it is, uncomment.
        //   phone.length <= 0 ||
        address1.length <= 0 ||
        city.length <= 0 ||
        state.length <= 0 ||
        zip.length <= 0 
    );
  }, [name, address1, city, state, zip]);

    const cardStyle = {
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
      };

  return (
    <div style={{ margin: 20 }}>
        <Grid container xs="12">
            <CardElement options={cardStyle} elements={elements}/>
        </Grid>
        <Grid container xs="12">
            <div style={{marginTop:0,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <TemplateButton color="primary" onClick={(e) => handlePaymentAdd(e,data)} label='Register'/>
            </div>
        </Grid>
    </div>
  );
}

export default BillingCreditCardForm;
