
export const apiBaseUrl = function() {
    let url = process.env.REACT_APP_API_BASE_URL;
    if (url && url.length > 0) { return url; }
    return "";
} 

export const contextURL = function() { 
    return "/index.html";
}

export default apiBaseUrl;
