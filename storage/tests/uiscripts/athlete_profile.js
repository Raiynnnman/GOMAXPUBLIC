
var inputData = input["data"];

if (!inputData["profile"]) { return; }
var prof = inputData["profile"]
var tourn = prof["previous_tournaments"]
delete prof["previous_tournaments"]
var stats = prof["statistics"]
delete prof["statistics"]

var c = 0;
for (c = 0; c < tourn.length; c++) {
     var tourn_stats = tourn[c]
     tourn_stats["tournament_id"] = tourn[c]["id"]
     
     if(tourn_stats["leaderboard"]) { 
            tourn_stats["leaderboard_position"] = tourn[c]["leaderboard"]["position"];
            tourn_stats["leaderboard_score"] = tourn[c]["leaderboard"]["score"];
            tourn_stats["leaderboard_strokes"] = tourn[c]["leaderboard"]["strokes"];
            tourn_stats["leaderboard_tied"] = tourn[c]["leaderboard"]["tied"];
            tourn_stats["leaderboard_position"] = tourn_stats["leaderboard"]["position"];
            var d = 0; 
            for (d = 0; d < tourn_stats["leaderboard"]["rounds"].length; d++) {
                      var t = tourn_stats["leaderboard"]["rounds"][d];
                      t["athlete_id"] = prof["id"];
                      t["tournament_id"] = tourn[c]["id"];
                      add_data({action:{action:"ADD_TO_TABLE", table: "athlete_tournament_rounds"}, data:t});
            }
            delete tourn_stats["leaderboard"];
            delete tourn_stats["seasons"];
            add_data({action:{action:"ADD_TO_TABLE", table: "athlete_tournament_stats"}, data:tourn_stats});
            
     } 
}
add_data({action:{
    action:"UPDATE_TABLE_VALUE", table:"athletes"}, 
    data: {"id": prof["id"], "column": "updated", "value": "unix_timestamp()"}}
);
