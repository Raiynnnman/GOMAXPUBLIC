import React, { useEffect, useState, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { CardElement, Elements, useElements, useStripe, } from "@stripe/react-stripe-js";
import { ElementsConsumer } from "@stripe/react-stripe-js";
import { Button, Form, FormGroup, Label, Input, Grid, Col, Dropdown, DropdownToggle, DropdownItem, DropdownMenu } from "reactstrap";
import { PaymentElement } from "@stripe/react-stripe-js";
import { saveCard } from "../../actions/saveCard";
import { State, City } from "country-state-city";
import {toast} from "react-toastify";

function BillingCreditCardForm({ intentid, onCancel, onSave }) {

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
  const dispatch = useDispatch();
  const stripe = useStripe();

  const handleCancel = function () {
    onCancel();
  };

  const handlePaymentAdd = async (event) => {
    event.preventDefault();
    let data = {
      name: name,
      address_line1: address1,
      address_line2: address2,
      address_city: city,
      address_state: state,
      address_phone: phone,
      address_zip: zip,
    };
    const card = elements.getElement(CardElement);
    const result = await stripe.createToken(card, data);
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

  return (
    <div style={{ margin: 20 }}>
      <Form>
        <Grid>
          <Grid item xs={6}>
            <FormGroup>
              <Label for="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                type="text"
                value={name}
                onChange={handleChangeName}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={6}>
            <FormGroup>
              <Label for="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(212) 555-1234"
                type="text"
                value={phone}
                onChange={handleChangePhone}
              />
            </FormGroup>
          </Grid>
        </Grid>
        <FormGroup>
          <Label for="address1">Address</Label>
          <Input
            id="address1"
            name="address1"
            placeholder="1234 Main St"
            value={address1}
            onChange={handleChangeAddress1}
          />
        </FormGroup>
        <FormGroup>
          <Label for="address2">Address 2</Label>
          <Input
            id="address2"
            name="address2"
            placeholder="Apartment, studio, or floor"
            value={address2}
            onChange={handleChangeAddress2}
          />
        </FormGroup>
        <Grid>
          <Grid item xs={6}>
            <FormGroup>
              <Label for="city">City</Label>
              <Dropdown
                toggle={() => setCityIsOpen(!cityIsOpen)}
                isOpen={cityIsOpen}
              >
                <DropdownToggle data-toggle="dropdown" tag="span">
                  <Input
                    id="city"
                    name="city"
                    value={city}
                    onChange={handleChangeCity}
                  />
                </DropdownToggle>
                <DropdownMenu style={{ maxHeight: 300, overflowY: "scroll" }}>
                  {fetchedCities ? (
                    cityDropdownFilter()
                  ) : (
                    <DropdownItem disabled={true}>
                      Select a state to see suggestions
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </FormGroup>
          </Grid>
          <Grid item xs={4}>
            <FormGroup>
              <Label for="state">State</Label>
              <Dropdown
                toggle={() => setStateIsOpen(!stateIsOpen)}
                isOpen={stateIsOpen}
              >
                <DropdownToggle data-toggle="dropdown" tag="span">
                  <Input
                    id="state"
                    name="state"
                    value={state}
                    onChange={handleChangeState}
                  />
                </DropdownToggle>
                <DropdownMenu style={{ maxHeight: 300, overflowY: "scroll" }}>
                  {fetchedStates ? (
                    stateDropdownFilter()
                  ) : (
                    <DropdownItem disabled={true}>
                      Select a country to see suggestions
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </FormGroup>
          </Grid>
          <Grid item xs={2}>
            <FormGroup>
              <Label for="zip">Zip</Label>
              <Input
                id="zip"
                name="zip"
                value={zip}
                onChange={handleChangeZip}
              />
            </FormGroup>
          </Grid>
        </Grid>
        <Grid>
          <FormGroup>
            <CardElement elements={elements}/>
          </FormGroup>
        </Grid>
        <Grid style={{marginTop:10}}>
            {!addedCard && ( 
                <FormGroup>
                <Button color="primary" onClick={handlePaymentAdd} disabled={disableSaveButton} >
                  Save
                </Button>
              </FormGroup>
            )}
        </Grid>
      </Form>
    </div>
  );
}

export default BillingCreditCardForm;
