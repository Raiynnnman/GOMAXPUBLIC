

export const getVersion = function() { 
    const MAJOR="3";
    const MINOR="0";
    const RELEASE="0";
    const BUILD="dev";
    return MAJOR + "." + MINOR + "." + RELEASE + "-" + BUILD;
}

export default getVersion;
