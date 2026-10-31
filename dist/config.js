import Conf from 'conf';
const conf = new Conf({
    projectName: 'claudecash',
    defaults: {
        apiKey: '',
    },
});
// Hardcoded — never stored in Conf so old cached values don't override
export const API_URL = 'https://claudecash.co';
export function getApiKey() {
    const key = conf.get('apiKey');
    return key || null;
}
export function setApiKey(key) {
    conf.set('apiKey', key);
}
/** @deprecated use API_URL directly */
export function getApiUrl() {
    return API_URL;
}
