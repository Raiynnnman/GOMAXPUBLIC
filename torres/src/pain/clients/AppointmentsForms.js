import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Stepper,
  Step,
  Grid,
  StepLabel,
  Typography,
  Zoom,
  LinearProgress,
  Modal,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const OrangeStepper = styled(Stepper)(({ theme }) => ({
  '& .MuiStepIcon-root': {
    color: '#FFA500', // Orange color
  },
  '& .MuiStepIcon-text': {
    fill: '#fff',
  },
  '& .MuiStepLabel-label.Mui-active': {
    color: '#FFA500', // Orange color
  },
  '& .MuiStepLabel-label.Mui-completed': {
    color: '#FFA500', // Orange color
  },
}));

const OrangeLinearProgress = styled(LinearProgress)(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    backgroundColor: '#FFA500', // Orange color
  },
}));

const steps = [
  'Accident Details',
  'Choose a Physician',
  'Insurance Details',
  'Law Enforcement Details',
  'Additional Information',
];

const StepForm = ({ formValues, handleChange, handleSubmit }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [openModal, setOpenModal] = useState(false);

  const handleNext = () => {
    const newErrors = validateStepFields(activeStep);
    if (Object.keys(newErrors).length === 0) {
      if (activeStep === steps.length - 1) {
        handleSubmit(); // Ensure handleSubmit is called
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const validateStepFields = (step) => {
    const errors = {};
    switch (step) {
      case 0:
        if (!formValues.dateOfAccident) errors.dateOfAccident = 'Date of accident is required';
        if (!formValues.description) errors.description = 'Description is required';
        break;
      case 2:
        if (!formValues.defInsurance) errors.defInsurance = 'Defendant Insurance is required';
        break;
      case 3:
        if (!formValues.repLawEnforcement) errors.repLawEnforcement = 'Representative Law Enforcement is required';
        break;
      case 4:
        if (!formValues.caseNum) errors.caseNum = 'Case Number is required';
        break;
      default:
        break;
    }
    return errors;
  };

  const renderFormFields = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              label="Date of Accident"
              name="dateOfAccident"
              type="date"
              value={formValues.dateOfAccident}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              error={!!errors.dateOfAccident}
              helperText={errors.dateOfAccident}
            />
            <TextField
              label="Description"
              name="description"
              value={formValues.description}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.description}
              helperText={errors.description}
            />
            <TextField
              label="Hospital"
              name="hospital"
              value={formValues.hospital}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Ambulance"
              name="ambulance"
              value={formValues.ambulance}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Witnesses"
              name="witnesses"
              value={formValues.witnesses}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <TextField
              label="Physician Name"
              name="physicianName"
              value={formValues.physicianName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Office Name"
              name="officeName"
              value={formValues.officeName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <Modal open={openModal} onClose={handleCloseModal}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: { xs: '95%', sm: '80%', md: '60%' },
                  maxHeight: '80%',
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  overflowY: 'auto',
                }}
              >
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                  Choose a Physician
                </Typography>
                <Button
                  onClick={handleCloseModal}
                  variant="contained"
                  sx={{ mt: 2, bgcolor: 'orange', color: 'white' }}
                  fullWidth
                >
                  Close
                </Button>
              </Box>
            </Modal>
          </Box>
        );
      case 2:
        return (
          <Box>
            <TextField
              label="Defendant Insurance"
              name="defInsurance"
              value={formValues.defInsurance}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.defInsurance}
              helperText={errors.defInsurance}
            />
            <TextField
              label="Defendant Claim Number"
              name="defClaimNum"
              value={formValues.defClaimNum}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Defendant Name"
              name="defName"
              value={formValues.defName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Insurance Info"
              name="insInfo"
              value={formValues.insInfo}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Insurance Claim Number"
              name="insClaimNum"
              value={formValues.insClaimNum}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Insurance Policy Holder"
              name="insPolicyHolder"
              value={formValues.insPolicyHolder}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Box>
        );
      case 3:
        return (
          <Box>
            <TextField
              label="Representative Law Enforcement"
              name="repLawEnforcement"
              value={formValues.repLawEnforcement}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.repLawEnforcement}
              helperText={errors.repLawEnforcement}
            />
            <TextField
              label="Police Report Number"
              name="policeReportNum"
              value={formValues.policeReportNum}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Citations"
              name="citations"
              value={formValues.citations}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Citations Person"
              name="citationsPerson"
              value={formValues.citationsPerson}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Box>
        );
      case 4:
        return (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box>
                <TextField
                  label="Case Number"
                  name="caseNum"
                  value={formValues.caseNum}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  error={!!errors.caseNum}
                  helperText={errors.caseNum}
                />
                <TextField
                  label="Preferred Language"
                  name="languagesId"
                  value={formValues.languagesId}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  sx={{ mt: 2, bgcolor: 'orange', color: 'white' }}
                >
                  Upload Pics of Damage
                  <input
                    type="file"
                    hidden
                    name="picsOfDamage"
                    onChange={handleChange}
                  />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <TextField
                  label="Attorney Name"
                  name="attnyName"
                  value={formValues.attnyName}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Box>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: activeStep === 4 ? '800px' : '600px', margin: 'auto' }}>
      <OrangeStepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </OrangeStepper>
      <OrangeLinearProgress
        variant="determinate"
        value={(activeStep / steps.length) * 100}
        sx={{ my: 2 }}
      />
      <Box sx={{ mt: 2, position: 'relative', minHeight: '300px' }}>
        {activeStep === steps.length ? (
          <Zoom in={true}>
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'green' }} />
              <Typography variant="h4" sx={{ mt: 2 }}>
                Congrats! 🎉
              </Typography>
              <Typography variant="subtitle1">
                All steps completed - you're finished!
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
              </Box>
            </Box>
          </Zoom>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {steps[activeStep]}
            </Typography>
            <form>
              {renderFormFields(activeStep)}
            </form>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button
                onClick={handleNext}
                sx={{ bgcolor: 'orange', color: 'white' }}
              >
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StepForm;
