var inputData = input["data"];

     var cf = inputData
     var season_id = ""
     var tour_id = ""
     if (cf["season"]) { 
         cf["objid"] = cf["season"]["id"];
         cf["year"] = cf["season"]["year"];
         season_id = cf["objid"]
         delete cf["season"];
     }
    if (cf["tour"]) { 
        cf["tour_alias"] = cf["tour"]["alias"]
        cf["tour_id"] = cf["tour"]["id"]
        cf["tour_name"] = cf["tour"]["name"]
        tour_id = cf["tour_id"]
        delete cf["tour"]
    }
    var tournaments = cf["tournaments"]
    delete cf["tournaments"]
    var rs = {}
    rs['action'] = {action:"ADD_TO_TABLE",table:"tournaments"};
    rs['data'] = cf
    add_log("adding to rs")
    add_data(rs)
    var d = 0
    for (d = 0; d < tournaments.length; d++) {
            add_log("tourn:" + d)
           var tourn = tournaments[d]
           var tour_id = tourn["id"]
           tourn["objid"] = tour_id
           tourn["season_id"] = season_id
           tourn["tour_id"] = tour_id
           if (tourn["defending_champ"]) { 
                   var dc = tourn["defending_champ"]
                  tourn["defending_champ_id"] = dc["id"]
                   delete tourn["defending_champ"]
           }
          if (tourn["venue"]) { 
                  var ven = tourn["venue"]
                   delete ven["courses"]
                   ven["parent_id"] = tour_id
                   ven["objid"] = ven["id"]
                   tourn["venue_id"] = ven["id"]
                   add_data({action: {action:"ADD_TO_TABLE",table:"tournament_venue"}, data:ven})
                   delete tourn["venue"]
          } 
          if (tourn["winner"]) { 
                 tourn["winner_id"] = tourn["winner"]["id"]
                 delete tourn["winner"]
          } 
         add_data({action: {action:"ADD_TO_TABLE", table: "tournament"}, data: tourn})
    }
