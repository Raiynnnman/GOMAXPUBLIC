import React from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

function MainCard({ contentSX, sx, children, title }) {
    return (
        <Card sx={{ ...sx, borderRadius: 2, boxShadow: 2, padding:1.2, overflow: 'visible'}}>
        <>
            {(title) && (<font>{title}</font>)}
            <CardContent sx={contentSX}>
                {children}
            </CardContent>
        </>
        </Card>
    );
}

MainCard.propTypes = {
    contentSX: PropTypes.object,
    sx: PropTypes.object,
    children: PropTypes.node.isRequired
};

export default MainCard;
