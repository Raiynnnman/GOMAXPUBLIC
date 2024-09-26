import config from './runtime-config';
export const baseURLConfig = function() {
    return import.meta.env['VITE_BASE_URL'] ? import.meta.env['VITE_BASE_URL'] : config['VITE_BASE_URL'];
}

export default baseURLConfig;
