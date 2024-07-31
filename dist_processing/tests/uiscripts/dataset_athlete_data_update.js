
var inputData = input["data"];

var cols = inputData[0];
var c = 0;
/* Start at 1, first line is columns */
// add_data(cols);
var tosort = []
for (c = 1; c < inputData.length; c++) {
    var row = inputData[c];
    if (c < 3) { add_log(row); }
    var tosave = {}
    var d = 0; 
    for (d=0;d<cols.length;d++) { 
         var col = cols[d];
         tosave[col] = row[d]
    }
    tosave["sport"] = "Golf";
    tosave["association"] = "N/A";
    tosave["team"] = "N/A";
    tosave["brandmatchscore"] = Math.min(Math.floor((Math.random() * 60)+50),99)
    tosort.push(tosave);
}

tosort.sort(function(a, b) {
    return parseFloat(b.brandmatchscore) - parseFloat(a.brandmatchscore);
});
c = 0;
for (c = 0; c < tosort.length; c++) { 
var saveme = tosort[c];
saveme["rank"] = c+1;
add_data(saveme);
} 

