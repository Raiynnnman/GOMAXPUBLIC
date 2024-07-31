alter table filters drop column tblname;
alter table filters add column (tblname varchar(255));

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values ('semrush', 'Semrush Anchors');
Insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
var inputData = input["data"];
if (!inputData["anchors"]){ return; }
var c = 0;
for (c=0; c<inputData["anchors"].length;c++) {
    var dat = inputData["anchors"][c]; 
    add_data({action:{action:"ADD_TO_TABLE", table: "semrush_anchors"}, data:dat});
};
',
'');


insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values ('semrush', 'Semrush Traffic Sources');
Insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
var inputData = input["data"];
if (!inputData["trafficSources"]){ return; }
var c = 0;
for (c=0; c<inputData["trafficSources"].length;c++) {
    var dat = inputData["trafficSources"][c]; 
    add_data({action:{action:"ADD_TO_TABLE", table: "semrush_traffic_sources"}, data:dat});
};
',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('semrush', 'Semrush Traffic Destinations');
Insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
var inputData = input["data"];
if (!inputData["trafficDestinations"]){ return; }
var c = 0;
for (c=0; c<inputData["trafficDestinations"].length;c++) {
    var dat = inputData["trafficDestinations"][c]; 
    add_data({action:{action:"ADD_TO_TABLE", table: "semrush_traffic_destinations"}, data:dat});
};
',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('semrush', 'Semrush Organic Word Search');
Insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
var inputData = input["data"];
if (!inputData["organicWordSearch"]){ return; }
var c = 0;
for (c=0; c<inputData["organicWordSearch"].length;c++) {
    var dat = inputData["organicWordSearch"][c]; 
    add_data({action:{action:"ADD_TO_TABLE", table: "semrush_organic_word_search"}, data:dat});
};
',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('semrush', 'Semrush Paid Word Search');
Insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
var inputData = input["data"];
if (!inputData["paidWordSearch"]){ return; }
var c = 0;
for (c=0; c<inputData["paidWordSearch"].length;c++) {
    var dat = inputData["paidWordSearch"][c]; 
    add_data({action:{action:"ADD_TO_TABLE", table: "semrush_paid_word_search"}, data:dat});
};
',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('semrush', 'Semrush Traffic By Country');
Insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
var inputData = input["data"];
if (!inputData["trafficByCountry"]){ return; }
var c = 0;
for (c=0; c<inputData["trafficByCountry"].length;c++) {
    var dat = inputData["trafficByCountry"][c]; 
    add_data({action:{action:"ADD_TO_TABLE", table: "semrush_traffic_by_country"}, data:dat});
};
',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('semrush', 'Semrush Bounce Rate');
Insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
var inputData = input["data"];
if (!inputData["bounceRate"]){ return; }
var c = 0;
for (c=0; c<inputData["bounceRate"].length;c++) {
    var dat = inputData["bounceRate"][c]; 
    add_data({action:{action:"ADD_TO_TABLE", table: "semrush_bounce_rate"}, data:dat});
};
',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('semrush', 'Semrush Pages Per Visit');
Insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
var inputData = input["data"];
if (!inputData["pagesPerVisit"]){ return; }
var c = 0;
for (c=0; c<inputData["pagesPerVisit"].length;c++) {
    var dat = inputData["pagesPerVisit"][c]; 
    add_data({action:{action:"ADD_TO_TABLE", table: "semrush_pages_per_visit"}, data:dat});
};
',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('semrush', 'Semrush Avg Visit Duration');
Insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
var inputData = input["data"];
if (!inputData["visitDuration"]){ return; }
var c = 0;
for (c=0; c<inputData["visitDuration"].length;c++) {
    var dat = inputData["visitDuration"][c]; 
    add_data({action:{action:"ADD_TO_TABLE", table: "semrush_avg_visit_duration"}, data:dat});
};
',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('semrush', 'Semrush Unique Visitors');
Insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
var inputData = input["data"];
if (!inputData["uniqueVisitors"]){ return; }
var c = 0;
for (c=0; c<inputData["uniqueVisitors"].length;c++) {
    var dat = inputData["uniqueVisitors"][c]; 
    add_data({action:{action:"ADD_TO_TABLE", table: "semrush_unique_visitors"}, data:dat});
};
',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('semrush', 'Semrush Total Visitors');
Insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
var inputData = input["data"];
if (!inputData["totalVisitors"]){ return; }
var c = 0;
for (c=0; c<inputData["totalVisitors"].length;c++) {
    var dat = inputData["totalVisitors"][c]; 
    add_data({action:{action:"ADD_TO_TABLE", table: "semrush_total_visitors"}, data:dat});
};
',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('facebook', 'Facebook Posts');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
if(!input["data"]["profile"]){
    return;
}
var ident = input["data"]["profile"]["identifier"];
var inputData = input["data"];
var c = 0;
for (c=0; c<inputData["recent_posts"].length;c++) { 
    var thispost = inputData["recent_posts"][c];
    var comments_full = JSON.parse(JSON.stringify(thispost["comments_full"])); // make a copy
    var objid = thispost["post_id"];
    thispost["objid"] = objid;
    var d = 0;
    for (d = 0; d < comments_full.length; d++) { 
          var cf = comments_full[d]
          cf["parent_id"] = objid;
          var rs = {}
          rs["action"] = {action:"ADD_TO_TABLE",table:"facebook_posts"};
          rs["data"] = cf
          add_data(rs);
    }
}

',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('facebook', 'Facebook Commenters Dataset');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
var inputData = input["data"];
var c = 0;
var list = [];
for (c=0; c<inputData.length;c++) {
     if (!list.includes(inputData[c])) { 
           list.push(inputData[c])
     }     
}

add_data(list);

',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('facebook', 'Facebook Images');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
if(!input["data"]["profile"]){
    return;
}
var ident = input["data"]["profile"]["identifier"];
var inputData = input["data"];
var c = 0;
for (c=0; c<inputData["recent_posts"].length;c++) {
    var thispost = inputData["recent_posts"][c];
    var ilq = JSON.parse(JSON.stringify(thispost["images_lowquality"])); // make a copy
    var ilqd = JSON.parse(JSON.stringify(thispost["images_lowquality_description"])); 
    var objid = thispost["post_id"];
    thispost["objid"] = objid;
    var d = 0;
    for (d = 0; d < ilq.length; d++) {
          var cf = {"image_link": ilq[d], "image_description":ilqd[d]} 
          cf["parent_id"] = objid;
          var rs = {}
          rs["action"] = {action:"ADD_TO_TABLE",table:"facebook_images"};
          rs["data"] = cf
          add_data(rs);
    }
}
',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('facebook', 'Facebook Posts');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
if(!input["data"]["profile"]){
    return;
}
var ident = input["data"]["profile"]["identifier"];
var inputData = input["data"];
var c = 0;
for (c=0; c<inputData["recent_posts"].length;c++) { 
    var thispost = inputData["recent_posts"][c];
    var comments_full = JSON.parse(JSON.stringify(thispost["comments_full"])); // make a copy
    delete thispost["comments_full"]; // Remove it and process after
    /* Images */
    var image_ids = JSON.parse(JSON.stringify(thispost["image_ids"]));
    delete thispost["image_ids"];
    var images_lowquality = JSON.parse(JSON.stringify(thispost["images_lowquality"]));
    delete thispost["images_lowquality"];
    var images_lowquality_description = JSON.parse(JSON.stringify(thispost["images_lowquality_description"]));
    delete thispost["images_lowquality_description"];
    /* Reactions */
    var reactions = JSON.parse(JSON.stringify(thispost["reactions"]));
    delete thispost["reactions"];
    var reactors = JSON.parse(JSON.stringify(thispost["reactors"]));
    delete thispost["reactors"];
    var wth = JSON.parse(JSON.stringify(thispost["with"]));
    delete thispost["with"];
    var rs = {}
    var objid = thispost["post_id"];
    thispost["objid"] = objid;
    rs["action"] = {action:"ADD_TO_TABLE",table:"facebook_post"};
    rs["data"] = thispost;
    add_data(rs);
}
',
'');


insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('facebook', 'Facebook Profile');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
var result = {};
var profile_id = "";
var inputData = input["data"];
add_log("TESTING");
if (inputData["profile"]) {
     add_log("pushing");
     var rs = {};
     rs["action"] = {action:"ADD_TO_TABLE",table:"facebook_profile"};
     var mydata = inputData["profile"];
     profile_id = inputData["profile"]["identifier"]
     mydata["objid"] = profile_id
     // take this out for now, its broken
     if (mydata["reviews"]) { delete mydata["reviews"]; } 
     rs["data"] = mydata;
     add_data(rs) 
}

',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('facebook', 'Facebook Reactions');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
if(!input["data"]["profile"]){
    return;
}
var ident = input["data"]["profile"]["identifier"];
var inputData = input["data"];
var c = 0;
for (c=0; c<inputData["recent_posts"].length;c++) { 
    var thispost = inputData["recent_posts"][c];
    var react = JSON.parse(JSON.stringify(thispost["reactions"])); // make a copy
    if (!react) { continue; } 
    var objid = thispost["post_id"];
    var d = 0;
    for (d = 0; d < react.length; d++) { 
          var cf = react[d]
          cf["parent_id"] = objid;
          var rs = {}
          rs["action"] = {action:"ADD_TO_TABLE",table:"facebook_reactions"};
          rs["data"] = cf
          add_data(rs);
    }
}

',
'');


insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('facebook', 'Facebook Reactors');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), '
if(!input["data"]["profile"]){
    return;
}
var ident = input["data"]["profile"]["identifier"];
var inputData = input["data"];
var c = 0;
for (c=0; c<inputData["recent_posts"].length;c++) { 
    var thispost = inputData["recent_posts"][c];
    var react = JSON.parse(JSON.stringify(thispost["reactors"])); // make a copy
    if (!react) { continue; } 
    var objid = thispost["post_id"];
    var d = 0;
    for (d = 0; d < react.length; d++) { 
          var cf = react[d]
          cf["parent_id"] = objid;
          var rs = {}
          rs["action"] = {action:"ADD_TO_TABLE",table:"facebook_reactors"};
          rs["data"] = cf
          add_data(rs);
    }
}

',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('athlete', 'Athlete Profile Update');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), 
'
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

',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('athlete', 'Athletes');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), 
'
var inputData = input["data"];

if (inputData["parent_id"]) { return; }
if (!inputData["players"]) { return; }

var c = 0;
for (c=0; c<inputData["players"].length;c++) {
   var profile = inputData["players"][c];
   var objid = profile["id"]
   var cf = profile
    cf["objid"] = objid;
    var rs = {}
    rs["action"] = {action:"ADD_TO_TABLE",table:"athletes"};
    rs["data"] = cf
    add_data(rs);
}
',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('facebook', 'Facebook Rekognition');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(),

'

 var inputData = input["data"]
 if(!inputData["commenter_id"]){
     return;
 }
 var rs = {};
 rs["objid"] = inputData["commenter_id"]
 rs["action"] = {action:"ADD_TO_TABLE",table:"facebook_rekognition"};
 rs["data"] = inputData["data"];
 add_data(rs);
 
 
',
'');


insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('twitter', 'Twitter Profile');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(),
'
var profile_id = "";
var inputData = input["data"];
add_log("TESTING");
if (inputData["profile"]) {
     add_log("pushing");
     var rs = {};
     rs["action"] = {action:"ADD_TO_TABLE",table:"twitter_profile"};
     var mydata = inputData["profile"];
     profile_id = inputData["profile"]["id"];
     mydata["objid"] = profile_id;
     rs["data"] = mydata;
     add_data(rs);
};
',
'');


insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('twitter', 'Twitter Tweets');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(),
'
var ident = input["data"]["profile"]["id"];
var inputData = input["data"];
var c = 0;
for (c=0; c<inputData["tweets"].length;c++) { 
    var thispost = inputData["tweets"][c];
    var rs = {};
    var objid = thispost["id"];
    thispost["objid"] = objid;
    delete thispost["timestamp"];
    delete thispost["photos"];
    delete thispost["thumbnail"];
    rs["action"] = {action:"ADD_TO_TABLE",table:"twitter_tweet"};
    rs["data"] = thispost;
    add_data(rs);
};
',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('twitter', 'Twitter Images');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(),
'
var ident = input["data"]["profile"]["id"];
var inputData = input["data"];
var c = 0;
for (c=0; c<inputData["tweets"].length;c++) { 
    var thispost = inputData["tweets"][c];
    var rs = {};
    var objid = thispost["id"];
    var photos = JSON.parse(JSON.stringify(thispost["photos"]));
    var thumbnail = JSON.parse(JSON.stringify(thispost["thumbnail"]));
    thispost["objid"] = objid;
    if( photos !== []){
        var d = 0;
        for (d = 0; d < photos.length; d++) {
            var cf = {
                "image_link": photos[d],
                "parent_id": objid
            };
            var rs = {};
            rs["action"] = {action:"ADD_TO_TABLE",table:"twitter_images"};
            rs["data"] = cf;
            add_data(rs);
        };
    };
    if(thumbnail !== ""){
        var cf = {
            "tumbnail": thumbnail,
            "parent_id": objid
        };
        var rs = {};
        rs["action"] = {action:"ADD_TO_TABLE",table:"twitter_images"};
        rs["data"] = cf;
        add_data(rs);
    };
};
',
'');

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('events', 'Event Socials');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(),
'
var inputData = input["data"];
var rs = {};
rs["action"] = {action:"ADD_TO_TABLE",table:"event_socials"};
rs["data"] = inputData;
add_data(rs);
',
'');