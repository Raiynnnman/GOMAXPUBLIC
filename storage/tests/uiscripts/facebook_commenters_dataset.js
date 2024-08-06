
var inputData = input["data"];
var c = 0;
var list = [];
for (c=0; c<inputData.length;c++) {
     if (!list.includes(inputData[c])) { 
           list.push(inputData[c])
     }     
}

add_rs(list);
