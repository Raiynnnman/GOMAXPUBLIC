
var inputData = input["data"];

var cols = inputData[0];
add_data(cols);
var c = 0;
for (c = 1; c < inputData.length; c++) {
   var row = {};
   row["id"] = inputData[c][0];
   row["updated"] = inputData[c][0];
   add_data(row);
}
