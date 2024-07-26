import PropTypes from 'prop-types'
import React, { Component } from 'react'

export class TicketsUpsert extends Component {
  constructor(props){
    super(props)
  }

  handleOpen(){
    console.log(this.props)
   };

  render() {
    return (
        <> 
        <Button onClick={handleOpen}>Open modal</Button><Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Text in a modal
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                </Typography>
            </Box>
        </Modal>
        </>
    )
  }
}

export default TicketsUpsert