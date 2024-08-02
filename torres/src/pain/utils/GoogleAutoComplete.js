import React, { useState, Component, useEffect } from 'react';
import googleKey from '../../googleConfig';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { Typography } from '@mui/material';

function GoogleAutoComplete({onChange,initVal}) {

    const [value,onValueChange] = useState(initVal);

    const style = {
      control: (base: any, state: { isFocused: any; }) => ({
        ...base,
        background: "white",
        // match with the menu
        borderRadius: 0,
        // Removes weird border around container
        boxShadow: state.isFocused ? null : null,
        "&:hover": {
        }
      }),
      select: {
            '& *': {
                zIndex: '100',
            },
            '& .Select-menu-outer': {
                zIndex: '100',
            },
            '& .Select-menu': {
                zIndex: '100',
            },
            '& [role=listbox]': {
                zIndex: '100',
            },
      },
      option: (styles: any, {isFocused, isSelected}: any) => ({
        ...styles,
        zIndex: 999,
        opacity:1,
        color: isFocused
            ? 'rgba(255, 255, 255, 1)'
        : isSelected
            ? 'rgba(0, 0, 0, 1)'
            : undefined,
        background: isFocused
            ? 'rgba(4, 59, 92, 1)'
        : isSelected
            ? 'rgba(255, 255, 255, 1)'
            : undefined,

    }),
      menu: (base: any) => ({
        ...base,
        // override border radius to match the box
        borderRadius: 0,
        // kill the gap
        marginTop: 0,
        zIndex: 100
      }),
      menuList: (base: any) => ({
        ...base,
        // kill the white space on first and last option
        zIndex:100,
        padding: 0
      })
    };

    useEffect(() => { 
        if (value && value.value && value.value.terms) { 
            var t = value.value.terms
            var s = t[t.length-2].value ? t[t.length-2].value : ''
            var c = t[t.length-3].value ? t[t.length-3].value : ''
            onChange({
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
    <>
        <GooglePlacesAutocomplete 
            selectProps={{ styles:style, value, onChange: onValueChange}} apiKey={googleKey()}/>
    </>
    )
}

export default GoogleAutoComplete;
