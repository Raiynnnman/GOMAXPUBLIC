import React, { useEffect, useState, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {stripeKey} from '../../stripeConfig.js';
import { useDispatch, useSelector } from "react-redux";
import { CardElement, Elements, useElements, useStripe, } from "@stripe/react-stripe-js";
import { ElementsConsumer } from "@stripe/react-stripe-js";
import { Button, Form, FormGroup, Label, Input, Row, Col, Dropdown, DropdownToggle, DropdownItem, DropdownMenu } from "reactstrap";
import { PaymentElement } from "@stripe/react-stripe-js";
import { saveCard } from "../../actions/saveCard";
import { State, City } from "country-state-city";
import {toast} from "react-toastify";

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

  useEffect(() => {
    if (selectedState) {
      let tempCities = City.getCitiesOfState(
        selectedState.isoCode
      );
      if (tempCities !== undefined) {
        setFetchedCities(tempCities);
        setFilteredCities(tempCities);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  const stateMenuItemClicked = (state) => {
    setState(state.name);
    setSelectedState(state);
    handleChangeState({ target: { value: state.name } });
  };
  const cityMenuItemClicked = (city) => {
    setCity(city.name);
    setSelectedCity(city);
    handleChangeCity({ target: { value: city.name } });
  };

  const stateDropdownFilter = () => {
    return filteredStates.length > 0 ? (
      filteredStates.map((item) => (
        <div key={item}>
          <DropdownItem
            onClick={() => {
              stateMenuItemClicked(item);
            }}
          >
            {item.name}
          </DropdownItem>
        </div>
      ))
    ) : (
      <DropdownItem disabled={true}>No states found</DropdownItem>
    );
  };

  const cityDropdownFilter = () => {
    return filteredCities.length > 0 ? (
      filteredCities.map((item) => (
        <div key={item}>
          <DropdownItem
            onClick={() => {
              cityMenuItemClicked(item);
            } }
          >
            {item.name}
          </DropdownItem>
        </div>
      ))
    ) : (
      <DropdownItem disabled={true}>No city found</DropdownItem>
    );
  }
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
      <Form>
        <Row>
          <FormGroup>
            <CardElement options={cardStyle} elements={elements}/>
          </FormGroup>
        </Row>
        <Row style={{marginTop:10}}>
            <FormGroup>
            <div style={{marginTop:0,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Button color="primary" onClick={(e) => handlePaymentAdd(e,data)}>
                 Register 
                </Button>
            </div>
          </FormGroup>
        </Row>
      </Form>
    </div>
  );
}

export default BillingCreditCardForm;
