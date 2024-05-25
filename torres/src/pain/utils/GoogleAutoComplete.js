import React, { useState, Component, useEffect } from 'react';
import googleKey from '../../googleConfig';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

function GoogleAutoComplete({onChange}) {

    const [value,onValueChange] = useState('');

    useEffect(() => { 
        if (value.value && value.value.terms) { 
            var t = value.value.terms
            var c = t[t.length-2].value ? t[t.length-2].value : ''
            var s = t[t.length-3].value ? t[t.length-3].value : ''
            onChange('address',{
                verified: 1,
                places_id:value.value.place_id,
                addr1:value.value.structured_formatting.main_text,
                fulladdr:value.label,
                city:c,
                state:s,
                zipcode:''
            })
        }
    },[value]);
    
    return (
        <GooglePlacesAutocomplete 
            selectProps={{ value, onChange: onValueChange}} apiKey={googleKey()}/>
    )
}

export default GoogleAutoComplete;
