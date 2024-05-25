import React, { useEffect, useState, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { CardElement, Elements, useElements, useStripe, } from "@stripe/react-stripe-js";
import { ElementsConsumer } from "@stripe/react-stripe-js";
import { Button, Form, FormGroup, Label, Input, Grid, Col, Dropdown, DropdownToggle, DropdownItem, DropdownMenu } from "reactstrap";
import { PaymentElement } from "@stripe/react-stripe-js";
import { saveCard } from "../../actions/saveCard";
import { Country, State, City } from "country-state-city";
import {toast} from "react-toastify";

function BillingCreditCardForm({ intentid, onCancel, onSave }) {
  const countryRef = useRef(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");

  const [disableSaveButton, setDisableSaveButton] = useState(true);

  const [fetchedCountries, setFetchedCountries] = useState(
    Country.getAllCountries()
  );
  const [fetchedStates, setFetchedStates] = useState();
  const [fetchedCities, setFetchedCities] = useState();
  const [filteredCountries, setFilteredCountries] = useState(
    Country.getAllCountries()
  );
  const [filteredStates, setFilteredStates] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState();
  const [selectedState, setSelectedState] = useState();
  const [selectedCity, setSelectedCity] = useState();

  const [countryIsOpen, setCountryIsOpen] = useState(false);
  const [cityIsOpen, setCityIsOpen] = useState(false);
  const [stateIsOpen, setStateIsOpen] = useState(false);

  const elements = useElements();
  const dispatch = useDispatch();
  const stripe = useStripe();

  const handleCancel = function () {
    onCancel();
  };

  useEffect(() => {
    if (document.activeElement === countryRef.current) {
      setCountryIsOpen(true);
    } else {
      setCountryIsOpen(false);
    }
  }, [countryRef]);

  const handlePaymentAdd = async (event) => {
    event.preventDefault();
    let data = {
      name: name,
      address_line1: address1,
      address_line2: address2,
      address_city: city,
      address_state: state,
      address_zip: zip,
      address_country: country,
    };
    const card = elements.getElement(CardElement);
    const result = await stripe.createToken(card, data);
    if (result?.token) {
      let params = {
        intentid: intentid,
        client_ip: result['token']['client_ip'],
        card_details:result['token']['card'],
        card_id: result["token"]["card"]["id"],
        token: result["token"]["id"],
      };
      dispatch(saveCard(params)).then(() => {
        onSave();
      });
    } else {
      toast.error('Please input your card information again as it appears to be invalid.',
          {
            position:"top-right",
            autoClose:3000,
            hideProgressBar:true
          });
    }
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
  const handleChangeCountry = (event) => {
    let foundCountry = fetchedCountries.find(
      (country) => country === event.target.value
    );
    if (foundCountry !== undefined) {
      setSelectedCountry(foundCountry);
    }
    setFilteredCountries(
      fetchedCountries.filter((countryName) =>
        countryName.name.includes(event.target.value)
      )
    );
    setCountry(event.target.value);
  };

  useEffect(() => {
    setDisableSaveButton(
      name.length <= 0 ||
        // Don't know if phone is required, if it is, uncomment.
        //   phone.length <= 0 ||
        address1.length <= 0 ||
        city.length <= 0 ||
        state.length <= 0 ||
        zip.length <= 0 ||
        country.length <= 0
    );
  }, [name, address1, city, state, zip, country]);

  useEffect(() => {
    if (selectedCountry) {
      let tempStates = State.getStatesOfCountry(selectedCountry.isoCode);
      if (tempStates !== undefined) {
        setFetchedStates(tempStates);
        setFilteredStates(tempStates);
      }
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      let tempCities = City.getCitiesOfState(
        selectedCountry.isoCode,
        selectedState.isoCode
      );
      if (tempCities !== undefined) {
        setFetchedCities(tempCities);
        setFilteredCities(tempCities);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  const countryMenuItemClicked = (country) => {
    setCountry(country.name);
    setSelectedCountry(country);
    handleChangeCountry({ target: { value: country.name } });
  };
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
          <Grid item xs={6}>
            <FormGroup>
              <Label for="country">Country</Label>
              <Dropdown
                toggle={() => setCountryIsOpen(!countryIsOpen)}
                isOpen={countryIsOpen}
                ref={countryRef}
                outline
              >
                <DropdownToggle data-toggle="dropdown" tag="span">
                  <Input
                    id="country"
                    name="country"
                    value={country}
                    onChange={handleChangeCountry}
                  />
                </DropdownToggle>
                <DropdownMenu style={{ maxHeight: 300, overflowY: "scroll" }}>
                  {fetchedCountries &&
                    (filteredCountries.length > 0 ? (
                      filteredCountries.map((item) => (
                        <div key={item}>
                          <DropdownItem
                            onClick={() => {
                              countryMenuItemClicked(item);
                            }}
                          >
                            {item.name}
                          </DropdownItem>
                        </div>
                      ))
                    ) : (
                      <DropdownItem disabled={true}>
                        No countries found
                      </DropdownItem>
                    ))}
                </DropdownMenu>
              </Dropdown>
            </FormGroup>
          </Grid>
        </Grid>
        <Grid>
          <FormGroup>
            <CardElement elements={elements}/>
          </FormGroup>
        </Grid>
        <Grid style={{marginTop:10}}>
          <FormGroup>
            <Button color="primary" onClick={handlePaymentAdd} disabled={disableSaveButton} >
              Save
            </Button>
            <Button outline style={{ marginLeft: 15 }} onClick={handleCancel}>
              Cancel
            </Button>
          </FormGroup>
        </Grid>
      </Form>
    </div>
  );
}

export default BillingCreditCardForm;
