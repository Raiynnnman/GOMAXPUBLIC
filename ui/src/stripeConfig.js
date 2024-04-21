import config from './runtime-config';
export const stripeKey = function() {
    return process.env['REACT_APP_STRIPE_KEY'] ? process.env['REACT_APP_STRIPE_KEY'] : config['REACT_APP_STRIPE_KEY']
} 

export default stripeKey;
