

const convertToFormat = function(labelValue,digits) {
    // Nine Zeroes for Billions
    if (digits === null) { digits = 0 }
    if (labelValue === null) { return 0; }
    if (labelValue === undefined) { return 0; }
    if (!labelValue.toFixed) { labelValue = parseFloat(labelValue) }

    return Math.abs(Number(labelValue)) >= 1.0e+9

    ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(digits) + "B"
    // Six Zeroes for Millions
    : Math.abs(Number(labelValue)) >= 1.0e+6

    ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(digits) + "M"
    // Three Zeroes for Thousands
    : Math.abs(Number(labelValue)) >= 1.0e+3

    ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(digits) + "K"

    : Math.abs(Number(labelValue).toFixed(digits));

}


export default convertToFormat;
