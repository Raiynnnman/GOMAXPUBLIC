
export const getVersion = function() { 
    var MAJOR=3;
    var MINOR=1;
    var RELEASE=0;
    var COMMIT="64588b9f";
    var BUILD="dev";
    return MAJOR + "." + MINOR + "." + RELEASE + "." + BUILD + "-" + COMMIT; 
}

export default getVersion;
