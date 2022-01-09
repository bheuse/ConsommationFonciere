
$.ajaxSetup({ async: false });
g_data_s = null;

select_message  = "Sélectionner un territoire"
default_message = "Sélectionner un territoire"
no_postal = "-"

// Get with Cache
dataset_cache = {}
function get_dataset(dataset_id) {
    console.log("get_dataset Cached : "+dataset_id);
    if (dataset_id in dataset_cache) { return dataset_cache[dataset_id] }
    console.log("get_dataset  Loading: "+dataset_id);
    json_s = "output/"+dataset_id+"_s.json";
    console.log("json_s : "+json_s);
    $.ajaxSetup({ async: false });
    $.getJSON(json_s, function(json) { g_data_s = json ; console.log("g_data_s") ; console.log(g_data_s) });
    dataset_cache[dataset_id] = g_data_s
    return dataset_cache[dataset_id]
}

// Execute script in private context
function evalInContext(script, context) {
   var js_expr = pythonToJavaScript(script);
   return (new Function("with(this) { return " + js_expr + "}")).call(context);
}

function pythonToJavaScript(expr) {
    var new_expr = expr.replace("TRUE", "true").replace("True", "true");
    new_expr = new_expr.replace("FALSE", "false").replace("False", "false");
    new_expr = new_expr.replace(/\${([A-Z0-9a-z-_]*)}/g, '$1');
    return new_expr
}

function roundNumber(num, scale = 0) {
    // Rounding
    return (Math.round((num + Number.EPSILON) * (Math.pow(10,scale))) / (Math.pow(10,scale)))
}

function calc_taux(annee_depart, val_depart, annee_arrivee, val_arrivee, rounding) {

        // Retourne le taux  : T/100 = [ P1/P0 ] puissance 1/N - 1 """
        // annee = annee_arrivee - annee_depart
        // taux_croissance = (pop_arrivee / pop_depart) ** (1 / annee)
        // return round0(- (1 - taux_croissance) * 100, rounding)

        // self.assertEqual(0.01,    calc_taux(2000, 100, 2020, 100.2, rounding=3))

        var annee = annee_arrivee - annee_depart ;
        var taux_croissance = Math.pow((val_arrivee / val_depart), (1 / annee))
        var taux_croissance = - (1 - taux_croissance) * 100
        return roundNumber(taux_croissance,rounding);
}

function calc_after(annee_depart, val_depart, annee_arrivee, taux_croissance, rounding) {

        // Retourne l'after )) : P1 = P0 x ( 1 + T/100) puissance N """
        // annee = annee_arrivee - annee_depart
        // val_arrivee = val_depart * (1 + taux_croissance / 100) ** annee
        // return round0(val_arrivee, rounding)

        // self.assertEqual(100.1,   calc_after(2000, 100, 2001, 0.1,  rounding=3))
        // self.assertEqual(100.2,   calc_after(2000, 100, 2002, 0.1,  rounding=3))

        var   annee = annee_arrivee - annee_depart ;
        val_arrivee = val_depart * Math.pow((1 + taux_croissance / 100), annee);
        return roundNumber(val_arrivee,rounding);
}

function f_percent(part, full, rounding=1, suffix = "%", format = "") {
        // Retourne formatted part in percent of full     Part = 90, Full = 200 => 45
        // Adds suffix: suffix="%"   =>   45%
        // Adds format: format="+"   =>  +45%
        // Adds format: format="+()" =>  (+45%) 90
        // Adds format: format="()"  =>   (45%) 90
        if (isNaN(full) || (full === Infinity)) {
            return 0
        }
        var   percent = (part / full) * 100 ;
        var f_percent = percent.toFixed(rounding);
        if (format=="")           return f_percent+suffix ;
        if (format.includes("+") && (percent>0)) f_percent = "+"+f_percent
        if (format.includes("(")) return "("+f_percent+suffix+") "+part.toString() ;
        return "("+f_percent+suffix+") "+ part.toString() ;
}

function f_diff(after, before, format = "+") {
        // After = 200, Before = 100 => 100
        // Adds format: format="+"   => +45
        var diff = after - before ;
        if (format.includes("+") && (diff>0)) return ("+"+diff.toString())
        return ""+diff.toString();
}

function f_val(val, format = "+", suffix = "") {
        if (format.includes("+") && (val>0)) return ("+"+val.toString()+suffix)
        return ""+val.toString()+suffix;
}

function f_taux(value, rounding=2, suffix = "%", format = "+") {
        var value = value.toFixed(rounding);
        if ((value > 0) && (format.includes("+"))) return ("+"+value.toString()+suffix) ;
        return ""+value.toString()+suffix;
}

function f_round(value, rounding=0)  {
    // Rounding
    if (isNaN(value) || (value === Infinity)) {
        return 0
        }
    return roundNumber(value, rounding)
    }

function nan0(value, defaultValue=0) {
    if (!value) { return defaultValue }
    return value
    }

function error0(value, defaultValue=0) {
    if (String(value).toLowerCase().includes('error')) { return defaultValue }
    return value
    }

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    }

function loadFileAsJson() {
    var input, file, fr;
    if (typeof window.FileReader !== 'function') {
      alert("The file API isn't supported on this browser yet.");
      return;
    }
    input = document.getElementById('fileinput');
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");
    }
    else {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = receivedText;
      fr.readAsText(file);
    }
    function receivedText(e) {
      let lines = e.target.result;
      var newArr = JSON.parse(lines);
    }
}

function run_calculs(dataset, full = false, filter = "*"){
    console.log("> run_calculs");
    console.log(dataset);
    calculs = s_calculs["X"]
    console.log(calculs);
    console.log(dataset);
    for (const [key, value] of Object.entries(calculs)) {
        if ((value.Flag == "#") && (full == false)) {
            // console.log("# > Skipping : " + key);
            continue
            }
        if (!((filter == "*") || (value.Source == filter) || (key == filter))) {
            // console.log("# > Skipping : " + key);
            continue
            }
        js_expr = value.JavaScript ;
        // console.log("Calculs : " + key + " : " + js_expr + " =" );
        the_value = evalInContext(js_expr, dataset.total);
        // console.log(the_value);
        tkey = key.trim();
        dataset.total[tkey] = the_value;
        dataset.Data[tkey]  = [];
        dataset.Data[tkey]["meta"]    = value.Description ;
        dataset.Data[tkey]["expr"]    = value.JavaScript ;
        dataset.Data[tkey]["type"]    = value.Type ;
        dataset.Data[tkey]["flag"]    = value.Flag ;
        dataset.Data[tkey]["mode"]    = value.Python ;
        dataset.Data[tkey]["source"]  = value.Source ;
        dataset.Data[tkey]["comment"] = value.Commentaire ;
        dataset.Data[tkey]["total"]   = the_value ;
        }
    console.log("< run_calculs");
    console.log(dataset.total);
    console.log(dataset.Data);
    console.log(dataset);
    console.log("<<< run_calculs");
    return dataset
    }

function run_diagnostics(dataset, filter = "*"){
    console.log("> run_diagnostics");
    console.log(dataset);
    diagnostics = s_diagnostics["X"]
    console.log(diagnostics);
    for (const [key, value] of Object.entries(diagnostics)) {
        if (!((filter == "*") || (value.Source == filter) || (key == filter))) {
            // console.log("# > Skipping : " + key);
            continue
            }
        js_expr = value.Test ;
        // console.log("Diagnostics : " + key + " : " + js_expr + " =" );
        the_value = evalInContext(js_expr, dataset.total);
        // console.log(the_value);
        diag = {}
        diag["key"]           = key ;
        diag["categorie"]     = value.Categorie ;
        diag["description"]   = value.Description ;
        diag["messageSiVrai"] = value.MessageSiVrai ;
        diag["messageSiFaux"] = value.MessageSiFaux ;
        diag["Commentaire"]   = value.Commentaire ;
        diag["test"]          = value.Test ;
        diag["type"]          = value.Type ;
        diag["value"]         = the_value ;
        dataset.diag = dataset.Diagnostics.filter(el => !(el.key === key));
        dataset.Diagnostics.push(diag)
        }
    console.log("< run_diagnostics");
    console.log(dataset.diag);
    console.log(dataset);
    return dataset
    }

class scenario {
    // A Dataset with a Name
    // When "scen" Input Field are Changed, call recalc to adjust value.
    constructor(data_serveur = g_data_s , titre = "Votre Scenario Zero Artificialisation Nette !") {
        console.log("scenario constructor : "+this.titre)
        this.titre = titre
        this.reset(data_serveur)
        }
    reset(data_serveur) {
        console.log("scenario reset : "+this.titre)
        this.dataset = run_calculs(data_serveur, full = false, filter = "*");
        this.dataset = run_diagnostics(this.dataset, filter = "*");
        this.data_s = dataset                   // Data du Serveur
        this.data   = this.data_s.Data;         // Data par Metrique
        this.ds     = this.data_s.total;        // Data du Territoire
        this.diag   = this.data_s.Diagnostics;  // Diagnostic du Serveur
        console.log("> scenario data_s : ");
        console.log(this.data_s);
        return this.dataset
        }
    recalc(){
        console.log("scenario recalc : "+this.titre)
        return this.reset(this.dataset)
        }
}

// REGIONS                + [COMMUNES_CODES] [EPCIS_CODES] [DEPARTEMENTS_CODES]
// List of [DEPARTEMENTS] + [COMMUNES_CODES] [EPCIS_CODES]
// List of [EPCIS]        + [COMMUNES_CODES]
// List of [COMMUNES]
var select = {}; // Les Donnees des Communes, Dept, Etc
$.getJSON("output/select.json", function(json)       { select = json ; console.log("select") ; console.log(json); }); // Info in console
var s_diagnostics = {}; // Les Diagnostics
$.getJSON("output/diagnostics.json", function(json)  { s_diagnostics = json ; console.log("diagnostics") ; console.log(json); }); // Info in console
var s_calculs     = {}; // Les calculs
$.getJSON("output/calculations.json", function(json) { s_calculs = json ; console.log("calculations") ; console.log(json); }); // Info in console
var s_graphs     = {}; // Les graphiques
$.getJSON("input/plots.json", function(json)         { s_graphs = json  ; console.log("plots") ; console.log(json); }); // Info in console


const vm = Vue.createApp({
    data() {
        return {
            message    : default_message ,
            select_message : select_message ,
            territoire : "Departement",         // Type of entity (Region, Departement, EPCI, Commune)
            nom        : "Alpes-Maritimes",     // Name of entity
            code       : "06" ,                 // INSEE Code of entity
            postal     : no_postal ,            // Code Postal of entity
            entity     : "DEPT_Alpes-Maritimes_06",             // Entity Base File Name
            data_s     : null , // Data of Entity - Summary
            ds         : null , // Data of Entity (Total)
            data       : null , // Data of Entity (By Key)
            selectedRegion      : "" ,
            selectedDepartement : "" ,
            selectedEPCI        : "" ,
            selectedCommune     : "" ,
            selectRegions    : [ // Regions (Currently not used)
               { id: 1, code : '93' , postal : no_postal , nom : 'Provence Alpes Cote d Azur'        , entity : 'REGION_Provence_Alpes_Cote_d_Azur_93' }
               ],
            selectDepts      : [ // Departements of current Region (Currently Only PACA)
               { id: 1, code : '04' , postal : no_postal , nom : 'Alpes-de-Haute-Provence'           , entity : 'DEPT_Alpes-de-Haute-Provence_04' },
               { id: 2, code : '05' , postal : no_postal , nom : 'Hautes-Alpes'                      , entity : 'DEPT_Hautes-Alpes_05' },
               { id: 3, code : '06' , postal : no_postal , nom : 'Alpes-Maritimes'                   , entity : 'DEPT_Alpes-Maritimes_06' },
               { id: 4, code : '13' , postal : no_postal , nom : 'Bouches-du-Rhône'                  , entity : 'DEPT_Bouches-du-Rhone_13' },
               { id: 5, code : '83' , postal : no_postal , nom : 'Var'                               , entity : 'DEPT_Var_83' },
               { id: 6, code : '84' , postal : no_postal , nom : 'Vaucluse'                          , entity : 'DEPT_Vaucluse_84' }
               ],
            selectEpcis      : [], // EPCIs of current Region / Departement
            selectCommunes   : [], // Communes of current Departement / EPCIs
            eoo : "End of Object"
            }
      },
      mounted(){
          console.log("mounted");
          let urlParams = new URLSearchParams(window.location.search);
          var code_postal = urlParams.get('CODE_POSTAL')
          var code_insee  = urlParams.get('CODE_INSEE')
          var type_entity = urlParams.get('TYPE')
          var commune     = urlParams.get('COMMUNE')
          var dept        = urlParams.get('DEPT')
          var epci        = urlParams.get('EPCI')
          var region      = urlParams.get('REGION')
          if (type_entity != null) { code_insee = code_insee ; type_entity=type_entity} ;
          if (region != null)      { code_insee = region     ; type_entity="REGION"} ;
          if (dept != null)        { code_insee = dept       ; type_entity="DEPT"} ;
          if (epci != null)        { code_insee = epci       ; type_entity="EPCI"} ;
          if (commune != null)     { code_insee = commune    ; type_entity="COMMUNE"} ;
          if (code_postal != null) {
              this.selectCommunePostal(code_postal)
              return
          }
          if (type_entity=="COMMUNE") {
              this.selectCommuneCode(code_insee)
              return
          }
          if (type_entity=="EPCI") {
              this.selectEpciCode(code_insee)
              return
          }
          if (type_entity=="DEPT") {
              this.selectDeptCode(code_insee)
              return
          }
     },
    methods : {
        f_val(val, format = "+", suffix = "") {
            if (format.includes("+") && (val>0)) return ("+"+val.toString()+suffix)
            return ""+val.toString()+suffix;
        },
        f_round(value, rounding=0)  {
            return (Math.round((value + Number.EPSILON) * (Math.pow(10,rounding))) / (Math.pow(10,rounding)))
        },
        f_diff(after, before, format = "+") {
            // After = 200, Before = 100 => 100
            // Adds format: format="+"   => +45
            var diff = after - before ;
            if (format.includes("+") && (diff>0)) return ("+"+diff.toString())
            return ""+diff.toString();
        },
        f_percent(part, full, rounding=1, suffix = "%", format = "") {
            // Retourne formatted part in percent of full     Part = 90, Full = 200 => 45
            // Adds suffix: suffix="%"   =>   45%
            // Adds format: format="+"   =>  +45%
            // Adds format: format="+()" =>  (+45%) 90
            // Adds format: format="()"  =>   (45%) 90
            if (isNaN(full) || (full === Infinity)) {
                return 0
            }
            var   percent = (part / full) * 100 ;
            var f_percent = percent.toFixed(rounding);
            if (format=="")           return f_percent+suffix ;
            if (format.includes("+") && (percent>0)) f_percent = "+"+f_percent
            if (format.includes("(")) return "("+f_percent+suffix+") "+part.toString() ;
            return "("+f_percent+suffix+") "+ part.toString() ;
        },
        loadData(){
            this.select_message = select_message ;
            this.message        = default_message ;
            console.log("loadData : "+this.entity);
            json_s = "output/"+this.entity+"_s.json";
            console.log("json_s : "+json_s);
            this.data_s  = null ;
            this.ds      = null ;
            this.data    = null ;
            this.diag    = null ;
            g_data_s     = null ;
            // $.ajaxSetup({ async: false });
            // $.getJSON(json_s, function(json) { g_data_s = json ; console.log("g_data_s") ; console.log(g_data_s) });
            g_data_s = get_dataset(this.entity)
            console.log(g_data_s);
            if (! g_data_s) {
                this.message = "Donnees non-disponibles."
                chartsUpdate(this.ds);
                return
                }
            g_data_s.total.scen = "scen0"
            console.log("Doing run_calculs : ");
            g_data_s = run_calculs(g_data_s, full = true, filter = "*");
            console.log("Done run_calculs : ");
            g_data_s = run_diagnostics(g_data_s, filter = "*");
            console.log("Done run_diagnostics : ");
            this.data_s = g_data_s;
            this.ds     = this.data_s.total;
            this.data   = this.data_s.Data;
            this.diag   = this.data_s.Diagnostics;
            console.log("> this.data_s : ");
            console.log(this.data_s);
            console.log(this.ds);
            this.updateChildren();
            console.log("Done loadData : "+this.ds.LIBELLE);
            },
        updateChildren(){
           console.log("updateChildren");
           this.$refs.CalculetteEvolTailleMenages.update(this.ds.TM_2020, 2020, this.ds.TM_2030, 2030, this.ds.TXTM_1318);
           this.$refs.CalculetteTauxTailleMenages.update(this.ds.TM_2020, 2020, this.ds.TM_2030, 2030, this.ds.TXTM_1318);
           this.$refs.CalculetteEvolPopulation.update(this.ds.POP_2020, 2020, this.ds.POP_2030, 2030, this.ds.TX_POP_2030);
           this.$refs.CalculetteTauxPopulation.update(this.ds.POP_2020, 2020, this.ds.POP_2030, 2030, this.ds.TX_POP_2030);
           this.$refs.TableStat.update(this.data_s);
           this.$refs.ObjectifZan.update(this.data_s);
           this.$refs.MichelZan.update(this.data_s);
           chartsUpdate(this.ds);
        },
        selectDeptEvent(event){
            console.log("selectDeptEvent : "+event.target.value);
            return this.selectDeptName(event.target.value)
        },
        selectDeptCode(code){
            console.log("selectDeptCode : "+code);
            return this.selectDeptName(this.selectDepts[this.selectDepts.findIndex(x => x.code == code)].nom)
        },
        selectDeptName(name){
            console.log("selectDept : "+name);
            dept_index       = this.selectDepts.findIndex(x => x.nom == name);
            this.territoire  = "Departement";
            this.nom         = this.selectDepts[dept_index].nom;
            this.code        = this.selectDepts[dept_index].code ;
            this.entity      = this.selectDepts[dept_index].entity;
            console.log(this.nom + " entity : " + this.entity);
            this.loadData()
            // Locate Dept in Select JSON
            depts = select["REGIONS"][0]["DEPARTEMENTS"];
            dept  = depts[depts.findIndex(x => x.Nom === this.nom)];
            // List EPCIs
            this.selectedEPCI        = "";
            this.selectEpcis = [];
            for (var i = 0; i < dept["EPCIS_CODES"].length; i++) {
                epci_code =  dept["EPCIS_CODES"][i]
                ep   = select["REGIONS"][0]["EPCIS"].findIndex(x => x.INSEE === epci_code);
                ep   = select["REGIONS"][0]["EPCIS"][ep]
                epci = { id: i, code : ep.INSEE , postal : no_postal , nom : ep.Nom, entity : ep.Clean, data : ep };
                this.selectEpcis.push(epci);
                }
            // List Communes
            this.selectedCommune = "";
            this.selectCommunes  = [];
            for (var i = 0; i < dept["COMMUNES_CODES"].length; i++) {
                commune_code =  dept["COMMUNES_CODES"][i]
                co   =  select["REGIONS"][0]["COMMUNES"].findIndex(x => x.INSEE === commune_code);
                co   =  select["REGIONS"][0]["COMMUNES"][co]
                commune = { id: i, code : co.INSEE , postal : co.Postal , nom : co.Nom, entity : co.Clean, data : co };
                this.selectCommunes.push(commune);
                }
            console.log("Done : selectDept : "+this.entity);
            },
        selectEpciEvent(event){
            console.log("selectEPCI : "+event.target.value);
            epci_index  = this.selectEpcis.findIndex(x => x.nom === event.target.value);
            epci        = this.selectEpcis[epci_index]
            this.selectEpci(epci)
            },
        selectEpciCode(epci_code){
            console.log("selectEpciCode : "+epci_code);
            epci_index  = select["REGIONS"][0]["EPCIS"].findIndex(x => x.INSEE === epci_code);
            epci        =  select["REGIONS"][0]["EPCIS"][epci_index]
            this.selectEpci(epci)
            },
        selectEpciName(epci_name){
            console.log("selectEpciName : "+epci_name);
            epci_index = select["REGIONS"][0]["EPCIS"].findIndex(x => x.Nom === epci_name);
            epci       = select["REGIONS"][0]["EPCIS"][epci_index]
            this.selectEpci(epci)
            },
        selectEpci(epci){
            this.territoire  = "EPCI";
            this.nom         = epci.nom;
            this.code        = epci.code ;
            this.entity      = this.selectEpcis[epci_index].entity;
            console.log(this.nom + " entity : " + this.entity);
            this.loadData()
            // Locate EPCI in Select JSON
            epcis = select["REGIONS"][0]["EPCIS"];
            epci  = epcis[epcis.findIndex(x => x.Nom === this.nom)];
            // List Communes
            this.selectedCommune = "";
            this.selectCommunes  = [];
            for (var i = 0; i < epci["COMMUNES_CODES"].length; i++) {
                commune_code =  epci["COMMUNES_CODES"][i]
                co   =  select["REGIONS"][0]["COMMUNES"].findIndex(x => x.INSEE === commune_code);
                co   =  select["REGIONS"][0]["COMMUNES"][co]
                commune = { id: i, code : co.INSEE , nom : co.Nom, entity : co.Clean, data : co };
                this.selectCommunes.push(commune);
                }
            // console.log(this.selectCommunes);
            console.log("Done selectEpci "+this.entity);
            },
        selectCommuneEvent(event){
            console.log("selectCommune : "+event.target.value);
            this.selectCommuneName(event.target.value);
            },
        selectCommuneEvent(event){
            console.log("selectCommune : "+event.target.value);
            this.selectCommuneName(event.target.value);
            },
        selectCommuneCode(commune_code){
            console.log("selectCommuneCode : "+commune_code);
            comm_index         = select["REGIONS"][0]["COMMUNES"].findIndex(x => x.INSEE === commune_code);
            commune   =  select["REGIONS"][0]["COMMUNES"][comm_index]
            if (! commune) {
                comm_index = select["REGIONS"][0]["COMMUNES"].findIndex(x => x.Postal === commune_code);
                commune    = select["REGIONS"][0]["COMMUNES"][comm_index]
            }
            this.selectCommune(commune)
            },
        selectCommunePostal(commune_postal){
            console.log("selectCommunePostal : "+commune_postal);
            comm_index = select["REGIONS"][0]["COMMUNES"].findIndex(x => x.Postal === commune_postal);
            commune    = select["REGIONS"][0]["COMMUNES"][comm_index]
            this.selectCommune(commune)
            },
        selectCommuneName(name){
            console.log("selectCommuneName : "+name);
            comm_index = select["REGIONS"][0]["COMMUNES"].findIndex(x => x.Nom === name);
            commune    = select["REGIONS"][0]["COMMUNES"][comm_index]
            if (! commune) {
                comm_index = select["REGIONS"][0]["COMMUNES"].findIndex(x => x.Libelle === commune_code);
                commune    = select["REGIONS"][0]["COMMUNES"][comm_index]
            }
            this.selectCommune(commune)
            },
        selectCommune(commune){
            this.territoire  = "Commune";
            console.log("selectCommune : "+commune);
            this.nom         = commune.Nom;
            this.code        = commune.INSEE ;
            this.entity      = commune.Clean;
            console.log(this.nom + " entity : " + this.entity);
            this.loadData()
            console.log("Done selectCommune by Code "+this.entity);
            },
  },
})

vm.component('diagnostics', {
  props: ['diags' , 'type' , 'categorie', 'titre' ],
  template: `
    <div class="diagnostics">
    <div class="w3-container w3-section w3-teal w3-padding-8 w3-round-large">
    <h3>Diagnostics {{ titre }}</h3></div>
    <div v-for='diag in diags' >
         <div v-if="( type == 'ALL' || type == 'NOTE')  && diag.type == 'NOTE'" >
             <div v-if="categorie == 'ALL' || categorie == diag.categorie" >
                 <div v-if='diag.value == true' class="w3-panel w3-pale-yellow w3-topbar w3-rightbar w3-border-yellow w3-border">
                                <p>{{diag.key}} - {{diag.categorie}}</p>
                                <p>{{diag.description}}</p>
                                <p>{{diag.messageSiVrai}}</p>
                 </div>
                 <div v-else class="w3-panel w3-pale-yellow w3-bottombar w3-leftbar w3-border-yellow w3-border">
                                <p>{{diag.key}} - {{diag.categorie}}</p>
                                <p>{{diag.description}}</p>
                                <p>{{diag.messageSiFaux}}</p>
                 </div>
                 </div>
         </div>
         <div v-if="( type == 'ALL' || type == 'BLUE')  && diag.type == 'BLUE'" >
             <div v-if="categorie == 'ALL' || categorie == diag.categorie" >
                 <div v-if='diag.value == true' class="w3-panel w3-pale-blue w3-topbar w3-rightbar w3-border-blue w3-border">
                                <p>{{diag.key}} - {{diag.categorie}}</p>
                                <p>{{diag.description}}</p>
                                <p>{{diag.messageSiVrai}}</p>
                 </div>
                 <div v-else class="w3-panel w3-pale-blue w3-bottombar w3-leftbar w3-border-blue w3-border">
                                <p>{{diag.key}} - {{diag.categorie}}</p>
                                <p>{{diag.description}}</p>
                                <p>{{diag.messageSiFaux}}</p>
                 </div>
             </div>
         </div>
         <div v-if="( type == 'ALL' || type == 'TEST')  && diag.type == 'TEST'" >
             <div v-if="categorie == 'ALL' || categorie == diag.categorie" >
                 <div v-if='diag.value == true' class="w3-panel w3-pale-blue w3-topbar w3-rightbar w3-border-blue w3-border">
                                <p>{{diag.key}} - {{diag.categorie}}</p>
                                <p>{{diag.description}}</p>
                                <p>{{diag.messageSiVrai}}</p>
                 </div>
                 <div v-else class="w3-panel w3-pale-blue w3-bottombar w3-leftbar w3-border-blue w3-border">
                                <p>{{diag.key}} - {{diag.categorie}}</p>
                                <p>{{diag.description}}</p>
                                <p>{{diag.messageSiFaux}}</p>
                 </div>
             </div>
         </div>
         <div v-if="( type == 'ALL' || type == 'DIAG')  && diag.type == 'DIAG'" >
             <div v-if="categorie == 'ALL' || categorie == diag.categorie" >
                 <div v-if='diag.value == true' class="w3-panel w3-pale-green w3-leftbar w3-border-green w3-border">
                                <p>{{diag.key}} - {{diag.categorie}}</p>
                                <p>{{diag.description}}</p>
                                <p>{{diag.messageSiVrai}}</p>
                 </div>
                 <div v-else class="w3-panel w3-pale-red w3-bottombar w3-border-red w3-border">
                                <p>{{diag.key}} - {{diag.categorie}}</p>
                                <p>{{diag.description}}</p>
                                <p>{{diag.messageSiFaux}}</p>
                 </div>
             </div>
         </div>
    </div>
  </div>
  <br>
  `
})

vm.component('calculette-taux', {
  props: ['titre' , 'valeur', 'val_depart', 'annee_depart', 'val_arrivee', 'annee_arrivee', 'taux_de_croissance', 'rounding' ],
    data() {
        return {
            rst_val_depart         : this.val_depart ,
            rst_val_arrivee        : this.val_arrivee ,
            rst_annee_depart       : this.annee_depart  ,
            rst_annee_arrivee      : this.annee_arrivee ,
            rst_taux_de_croissance : this.taux_de_croissance ,
            calculette_taux : {
                val_depart         : this.val_depart ,
                val_arrivee        : this.val_arrivee ,
                annee_depart       : this.annee_depart  ,
                annee_arrivee      : this.annee_arrivee ,
                augmentation       : roundNumber(this.val_arrivee - this.val_depart,this.rounding) ,
                augmentation_an    : roundNumber((this.val_arrivee - this.val_depart) / (this.annee_arrivee - this.annee_depart),this.rounding) ,
                taux_de_croissance : this.taux_de_croissance },
            }
      },
    methods : {
        recalc_taux(){
              console.log("recalc_taux")
              this.calculette_taux.taux_de_croissance = calc_taux(this.calculette_taux.annee_depart, this.calculette_taux.val_depart, this.calculette_taux.annee_arrivee, this.calculette_taux.val_arrivee, this.rounding)
              this.calculette_taux.augmentation       = f_val(roundNumber((this.calculette_taux.val_arrivee - this.calculette_taux.val_depart),this.rounding))
              this.calculette_taux.augmentation_an    = f_val(roundNumber(this.calculette_taux.augmentation / (this.calculette_taux.annee_arrivee - this.calculette_taux.annee_depart),this.rounding ))
              console.log(this.calculette_taux.taux_de_croissance)
        },
    	update(val_depart, annee_depart, val_arrivee, annee_arrivee, taux_de_croissance) {
      	      this.rst_val_depart    = val_depart
      	      this.rst_annee_depart  = annee_depart
      	      this.rst_val_arrivee   = val_arrivee
      	      this.rst_annee_arrivee = annee_arrivee
      	      this.rst_taux_de_croissance = taux_de_croissance
           	  this.calculette_taux.val_depart    =  val_depart;
              this.calculette_taux.annee_depart  =  annee_depart;
              this.calculette_taux.val_arrivee   =  val_arrivee;
              this.calculette_taux.annee_arrivee =  annee_arrivee;
              this.calculette_taux.taux_de_croissance =  taux_de_croissance;
              this.recalc_taux()
        },
    	reset() {
           	  this.calculette_taux.val_depart    =  this.rst_val_depart;
              this.calculette_taux.annee_depart  =  this.rst_annee_depart;
              this.calculette_taux.val_arrivee   =  this.rst_val_arrivee;
              this.calculette_taux.annee_arrivee =  this.rst_annee_arrivee;
              this.calculette_taux.taux_de_croissance =  this.rst_taux_de_croissance;
              this.recalc_taux()
        },
      },
    template: `
            <div class="w3-container w3-section w3-teal w3-padding-8 w3-round-large">
            <h3 v-if="titre"> {{titre}}</h3>
            <h3 v-else>Calcul de Taux, selon l'evolution :</h3>
            </div>
            <form v-if="valeur" onsubmit="return false">
                <div class="columns">
                    <div class="column">
                         Année de Départ :  <input class="input" id="tx_annee_depart"   name="tx_annee_depart"    type="number" step="any" placeholder="Année de Départ"  v-on:blur="recalc_taux" v-model.number="calculette_taux.annee_depart"> <br>
                        {{valeur}} de Départ : <input class="input" id="tx_val_depart"     name="tx_val_depart"      type="number" step="any" placeholder="Valeur de Départ" v-on:blur="recalc_taux" v-model.number="calculette_taux.val_depart"> <br>
                        <br>
                        <button class="button is-info" v-on:click="recalc_taux()"> Taux de Croissance Annuel : {{ calculette_taux.taux_de_croissance }} % </button>
                        <br>
                        <br>
                        <div class="notification is-success">
                              <p>{{valeur}} en {{ calculette_taux.annee_arrivee }} : {{ calculette_taux.val_arrivee }} </p>
                              <p>Taux de Croissance : {{ calculette_taux.taux_de_croissance }} % / an </p>
                        </div>
                    </div>
                    <div class="column">
                        Année d'Arrivée :  <input class="input" id="tx_annee_arrivee"  name="tx_annee_arrivee"   type="number" step="any" placeholder="Annee d'Arrivée"  v-on:blur="recalc_taux" v-model.number="calculette_taux.annee_arrivee"><br>
                        {{valeur}} d'Arrivée : <input class="input" id="tx_val_arrivee"    name="tx_val_arrivee"     type="number" step="any" placeholder="Valeur d'Arrivée" v-on:blur="recalc_taux" v-model.number="calculette_taux.val_arrivee"><br>
                        <br>
                        <button class="button is-info" v-on:click="reset()"> Reset </button>
                        <br>
                        <br>
                        <div class="notification is-warning">
                             <p>Evolution {{ calculette_taux.annee_depart }} - {{ calculette_taux.annee_arrivee }} : {{ calculette_taux.augmentation }}</p>
                             <p>Par an : {{ calculette_taux.augmentation_an }}</p>
                        </div>
                    </div>
                </div>
            </form>
            <br>
  `
})

vm.component('calculette-evol', {
  props: ['titre' , 'valeur', 'val_depart', 'annee_depart', 'val_arrivee', 'annee_arrivee', 'taux_de_croissance', 'rounding' ],
    data() {
        return {
            rst_val_depart         : this.val_depart ,
            rst_val_arrivee        : this.val_arrivee ,
            rst_annee_depart       : this.annee_depart  ,
            rst_annee_arrivee      : this.annee_arrivee ,
            rst_taux_de_croissance : this.taux_de_croissance ,
            calculette_evol : {
                val_depart         : this.val_depart ,
                val_arrivee        : this.val_arrivee ,
                annee_depart       : this.annee_depart  ,
                annee_arrivee      : this.annee_arrivee ,
                augmentation       : roundNumber(this.val_arrivee - this.val_depart,this.rounding) ,
                augmentation_an    : roundNumber((this.val_arrivee - this.val_depart) / (this.annee_arrivee - this.annee_depart),this.rounding) ,
                taux_de_croissance : this.taux_de_croissance },
            }
      },
  methods : {
        recalc_evol(){
              this.calculette_evol.val_arrivee        = calc_after(this.calculette_evol.annee_depart, this.calculette_evol.val_depart, this.calculette_evol.annee_arrivee, this.calculette_evol.taux_de_croissance, this.rounding)
              this.calculette_evol.augmentation       = f_val(roundNumber((this.calculette_evol.val_arrivee - this.calculette_evol.val_depart),this.rounding))
              this.calculette_evol.augmentation_an    = f_val(roundNumber(this.calculette_evol.augmentation / (this.calculette_evol.annee_arrivee - this.calculette_evol.annee_depart),this.rounding))
              console.log(this.calculette_evol.val_arrivee)
        },
    	update(val_depart, annee_depart, val_arrivee, annee_arrivee, taux_de_croissance) {
      	      this.rst_val_depart    = val_depart
      	      this.rst_annee_depart  = annee_depart
      	      this.rst_val_arrivee   = val_arrivee
      	      this.rst_annee_arrivee = annee_arrivee
      	      this.rst_taux_de_croissance = taux_de_croissance
           	  this.calculette_evol.val_depart    =  val_depart;
              this.calculette_evol.annee_depart  =  annee_depart;
              this.calculette_evol.val_arrivee   =  val_arrivee;
              this.calculette_evol.annee_arrivee =  annee_arrivee;
              this.calculette_evol.taux_de_croissance =  taux_de_croissance;
              this.recalc_evol()
        },
    	reset() {
           	  this.calculette_evol.val_depart    =  this.rst_val_depart;
              this.calculette_evol.annee_depart  =  this.rst_annee_depart;
              this.calculette_evol.val_arrivee   =  this.rst_val_arrivee;
              this.calculette_evol.annee_arrivee =  this.rst_annee_arrivee;
              this.calculette_evol.taux_de_croissance =  this.rst_taux_de_croissance;
              this.recalc_evol()
        },
      },
  template: `
            <div class="w3-container w3-section w3-teal w3-padding-8 w3-round-large">
            <h3 v-if="titre"> {{titre}}</h3>
            <h3 v-else>Evolution de la Valeur selon le taux : </h3>
            </div>
            <form>
                <div class="columns">
                    <div class="column">
                        Année de Départ :  <input class="input" id="annee_depart"    name="annee_depart"    type="number" step="any" placeholder="Année de Départ"  v-on:blur="recalc_evol"  v-model.number="calculette_evol.annee_depart"> <br>
                        {{valeur}} de Départ : <input class="input" id="val_depart"      name="val_depart"      type="number" step="any" placeholder="Valeur de Départ" v-on:blur="recalc_evol"  v-model.number="calculette_evol.val_depart"> <br>
                        <br>
                        <button class="button is-info" v-on:click="recalc_evol()"> {{valeur}} d'Arrivée : {{ calculette_evol.val_arrivee }}</button>
                        <br>
                        <br>
                        <div class="notification is-success">
                             <p>{{valeur}} en {{ calculette_evol.annee_arrivee }} : {{ calculette_evol.val_arrivee }} </p>
                             <p>Taux de Croissance : {{ calculette_evol.taux_de_croissance }} % / an </p>
                         </div>
                    </div>
                    <div class="column">
                        Année d'Arrivée :  <input class="input" id="annee_arrivee"   name="annee_arrivee"   type="number" step="any" placeholder="Annee d'Arrivee"  v-on:blur="recalc_evol"  v-model.number="calculette_evol.annee_arrivee"><br>
                        Taux de Croissance Annuel (en %) : <input class="input" id="taux_croissance" name="taux_croissance" type="number" step="any" placeholder="Taux de Croissance" v-on:blur="recalc_evol" v-model.number="calculette_evol.taux_de_croissance"><br>
                        <br>
                        <button class="button is-info" v-on:click="reset()"> Reset </button>
                        <br>
                        <br>
                        <div class="notification is-warning">
                            <p>Evolution {{ calculette_evol.annee_depart }} - {{ calculette_evol.annee_arrivee }} : {{ calculette_evol.augmentation }}</p>
                            <p>Par an : {{ calculette_evol.augmentation_an }}</p>
                        </div>
                    </div>
                </div>
            </form>
  `
})

vm.component('table-ozan', {
    data() {
        console.log("table-ozan data")
        return {
            dataset : g_data_s,
            loaded : 0 ,
            titre : "Testez votre Territoire sur l'Objectif Zero Artificialisation Nette." ,
            scen   : "scen0" ,
            scen0 : {
               evol_pop : 0 ,
               evol_tm  : 0 ,
               log_ha  : 70 ,
               lutte_vacance : 0 ,
               lutte_secondaire : 0 ,
               conv_logsru  : 0 ,
               part_logsru : 35 ,
               taux_desaffectation : 0.0013 ,
               taux_renouvellement : 0.42,
            },
            scen1 : {
               evol_pop : 0 ,
               evol_tm  : 0 ,
               log_ha  : 70 ,
               lutte_vacance : 0 ,
               lutte_secondaire : 0 ,
               conv_logsru  : 0 ,
               part_logsru : 35 ,
               taux_desaffectation : 0.0013 ,
               taux_renouvellement : 0.42,
            },
            }
      },
    methods : {
        reset(){
              console.log("reset scen0")
              this.ds.scen_evol_pop             = this.scen0.evol_pop
              this.ds.scen_evol_tm              = this.scen0.evol_tm
              this.ds.scen_log_ha               = this.scen0.log_ha
              this.ds.scen_lutte_vacance        = this.scen0.lutte_vacance
              this.ds.scen_lutte_secondaire     = this.scen0.lutte_secondaire
              this.ds.scen_conv_logsru          = this.scen0.conv_logsru
              this.ds.scen_part_logsru          = this.scen0.part_logsru
              this.ds.scen_taux_desaffectation  = this.scen0.taux_desaffectation
              this.ds.scen_taux_renouvellement  = this.scen0.taux_renouvellement
              this.ds.scen                      = "scen0"
              this.recalc()
        },
        update(dataset){
              console.log("table-stat update")
              this.dataset    = dataset
              this.ds         = this.dataset.total
              this.recalc()
        },
        set_scen0(){
              console.log("table-stat scen0")
              this.reset()
        },
        set_scen1(){
              console.log("table-stat scen1")
              this.ds.scen_evol_pop             = this.scen1.evol_pop
              this.ds.scen_evol_tm              = this.scen1.evol_tm
              this.ds.scen_log_ha               = this.scen1.log_ha
              this.ds.scen_lutte_vacance        = this.scen1.lutte_vacance
              this.ds.scen_lutte_secondaire     = this.scen1.lutte_secondaire
              this.ds.scen_conv_logsru          = this.scen1.conv_logsru
              this.ds.scen_part_logsru          = this.scen1.part_logsru
              this.ds.scen_taux_desaffectation  = this.scen1.taux_desaffectation
              this.ds.scen_taux_renouvellement  = this.scen1.taux_renouvellement
              this.ds.scen                      = "scen1"
              this.recalc()
        },
        recalc(){
            console.log("table-stat recalc")
            if (this.loaded ==0 ) {
                this.scen0.lutte_secondaire = 0
                this.scen0.lutte_vacance = 0
                this.scen0.evol_pop = this.ds.TXPOP_1318
                this.scen0.evol_tm  = this.ds.txtmen_1318
                this.scen0.lutte_secondaire = 0
                this.scen0.lutte_vacance = 0
                this.scen0.evol_pop = this.ds.TXPOP_1318
                this.scen0.evol_tm  = this.ds.txtmen_1318
                this.loaded = 1
            }
            this.dataset = run_calculs(this.dataset)
        },
      },
    template: '#ozan-template'
})

vm.component('michel-ozan', {
    data() {
        console.log("michel-ozan data")
        return {
            dataset : g_data_s,
            loaded : 0 ,
            titre : "Outil pour valider l'objectif Zero Artificialisation Nette sur un Territoire." ,
            scen   : "scen0" ,
            scen0 : {
               evol_pop : 0 ,
               evol_tm  : 0 ,
               log_ha  : 70 ,
               lutte_vacance : 0 ,
               lutte_secondaire : 0 ,
               conv_logsru  : 0 ,
               part_logsru : 35 ,
               taux_desaffectation : 0.0013 ,
               taux_renouvellement : 0.42,
            },
            scen1 : {
               evol_pop : 0 ,
               evol_tm  : 0 ,
               log_ha  : 70 ,
               lutte_vacance : 0 ,
               lutte_secondaire : 0 ,
               conv_logsru  : 0 ,
               part_logsru : 35 ,
               taux_desaffectation : 0.0013 ,
               taux_renouvellement : 0.42,
            },
            }
      },
    methods : {
        reset(){
              console.log("reset scen0")
              this.ds.scen_evol_pop             = this.scen0.evol_pop
              this.ds.scen_evol_tm              = this.scen0.evol_tm
              this.ds.scen_log_ha               = this.scen0.log_ha
              this.ds.scen_lutte_vacance        = this.scen0.lutte_vacance
              this.ds.scen_lutte_secondaire     = this.scen0.lutte_secondaire
              this.ds.scen_conv_logsru          = this.scen0.conv_logsru
              this.ds.scen_part_logsru          = this.scen0.part_logsru
              this.ds.scen_taux_desaffectation  = this.scen0.taux_desaffectation
              this.ds.scen_taux_renouvellement  = this.scen0.taux_renouvellement
              this.ds.scen                      = "scen0"
              this.recalc()
        },
        update(dataset){
              console.log("table-stat update")
              this.dataset    = dataset
              this.ds         = this.dataset.total
              this.recalc()
        },
        set_scen0(){
              console.log("table-stat scen0")
              this.reset()
        },
        set_scen1(){
              console.log("table-stat scen1")
              this.ds.scen_evol_pop             = this.scen1.evol_pop
              this.ds.scen_evol_tm              = this.scen1.evol_tm
              this.ds.scen_log_ha               = this.scen1.log_ha
              this.ds.scen_lutte_vacance        = this.scen1.lutte_vacance
              this.ds.scen_lutte_secondaire     = this.scen1.lutte_secondaire
              this.ds.scen_conv_logsru          = this.scen1.conv_logsru
              this.ds.scen_part_logsru          = this.scen1.part_logsru
              this.ds.scen_taux_desaffectation  = this.scen1.taux_desaffectation
              this.ds.scen_taux_renouvellement  = this.scen1.taux_renouvellement
              this.ds.scen                      = "scen1"
              this.recalc()
        },
        recalc(){
            console.log("table-stat recalc")
            if (this.loaded ==0 ) {
                this.scen0.lutte_secondaire = 0
                this.scen0.lutte_vacance = 0
                this.scen0.evol_pop = this.ds.TXPOP_1318
                this.scen0.evol_tm  = this.ds.txtmen_1318
                this.scen0.lutte_secondaire = 0
                this.scen0.lutte_vacance = 0
                this.scen0.evol_pop = this.ds.TXPOP_1318
                this.scen0.evol_tm  = this.ds.txtmen_1318
                this.loaded = 1
            }
            this.dataset = run_calculs(this.dataset)
        },
      },
    template: '#michel-template'
})

vm.component('table-stat', {
    data() {
        console.log("table-stat data")
        return {
            dataset : g_data_s,
            loaded : 0 ,
            titre : "Votre Scenario Zero Artificialisation Nette !" ,
            scen   : "scen0" ,
            scen0 : {
               evol_pop : 0 ,
               evol_tm  : 0 ,
               log_ha  : 70 ,
               lutte_vacance : 0 ,
               lutte_secondaire : 0 ,
               conv_logsru  : 0 ,
               part_logsru : 35 ,
               taux_desaffectation : 0.0013 ,
               taux_renouvellement : 0.42,
            },
            scen1 : {
               evol_pop : 0 ,
               evol_tm  : 0 ,
               log_ha  : 70 ,
               lutte_vacance : 0 ,
               lutte_secondaire : 0 ,
               conv_logsru  : 0 ,
               part_logsru : 35 ,
               taux_desaffectation : 0.0013 ,
               taux_renouvellement : 0.42,
            },
            }
      },
    methods : {
        reset(){
              console.log("reset scen0")
              this.ds.scen_evol_pop             = this.scen0.evol_pop
              this.ds.scen_evol_tm              = this.scen0.evol_tm
              this.ds.scen_log_ha               = this.scen0.log_ha
              this.ds.scen_lutte_vacance        = this.scen0.lutte_vacance
              this.ds.scen_lutte_secondaire     = this.scen0.lutte_secondaire
              this.ds.scen_conv_logsru          = this.scen0.conv_logsru
              this.ds.scen_part_logsru          = this.scen0.part_logsru
              this.ds.scen_taux_desaffectation  = this.scen0.taux_desaffectation
              this.ds.scen_taux_renouvellement  = this.scen0.taux_renouvellement
              this.ds.scen                      = "scen0"
              this.recalc()
        },
        update(dataset){
              console.log("table-stat update")
              this.dataset    = dataset
              this.ds         = this.dataset.total
              this.recalc()
        },
        set_scen0(){
              console.log("table-stat scen0")
              this.reset()
        },
        set_scen1(){
              console.log("table-stat scen1")
              this.ds.scen_evol_pop             = this.scen1.evol_pop
              this.ds.scen_evol_tm              = this.scen1.evol_tm
              this.ds.scen_log_ha               = this.scen1.log_ha
              this.ds.scen_lutte_vacance        = this.scen1.lutte_vacance
              this.ds.scen_lutte_secondaire     = this.scen1.lutte_secondaire
              this.ds.scen_conv_logsru          = this.scen1.conv_logsru
              this.ds.scen_part_logsru          = this.scen1.part_logsru
              this.ds.scen_taux_desaffectation  = this.scen1.taux_desaffectation
              this.ds.scen_taux_renouvellement  = this.scen1.taux_renouvellement
              this.ds.scen                      = "scen1"
              this.recalc()
        },
        recalc(){
            console.log("table-stat recalc")
            if (this.loaded ==0 ) {
                this.scen0.lutte_secondaire = 0
                this.scen0.lutte_vacance = 0
                this.scen0.evol_pop = this.ds.TXPOP_1318
                this.scen0.evol_tm  = this.ds.txtmen_1318
                this.scen1.lutte_secondaire = 0.5
                this.scen1.lutte_vacance = 1
                this.scen1.evol_pop = this.ds.TXPOP_1318
                this.scen1.evol_tm  = this.ds.txtmen_1318
                this.loaded = 1
            }
            this.dataset = run_calculs(this.dataset)
        },
      },
  template: `
    <div  v-if="this.dataset != null">
        <h3 v-if="titre"> {{titre}}</h3>
        <br>
        <div class="columns">
             <div class="column">
                <h3 v-if="titre"> Votre Scenario :</h3>
                <form>
                    Lutte en % / 10 ans contre la Vacance :                  <input class="input" id="lutte_vacance"    name="lutte_vacance"    type="number" step="any" placeholder="Diminution Vacance en % sur 10 ans"                    v-on:blur="recalc"  v-model.number="scen1.lutte_vacance"> <br>
                    Lutte en % / 10 ans contre les Résidences Secondaires :  <input class="input" id="lutte_secondaire" name="lutte_secondaire" type="number" step="any" placeholder="Diminution Des Résidences Secondaire en % sur 10 ans"  v-on:blur="recalc"  v-model.number="scen1.lutte_secondaire"> <br>
                    Evolution de la Taille de Ménages, en % / an :           <input class="input" id="evol_tm"          name="evol_tm"          type="number" step="any" placeholder="Evolution de la Taille de Ménages, en % / an"          v-on:blur="recalc"  v-model.number="scen1.evol_tm"> <br>
                    Evolution de la Population, en % / an  :                 <input class="input" id="evol_pop"         name="evol_pop"         type="number" step="any" placeholder="Evolution de la Population, en % / an"                 v-on:blur="recalc"  v-model.number="scen1.evol_pop"> <br>
                    Logements par Hectares  :                                <input class="input" id="log_ha"           name="log_ha"           type="number" step="any" placeholder="Logements par Hectare"                                 v-on:blur="recalc"  v-model.number="scen1.log_ha"> <br>
                    Objectif de Conversion en LLS :                          <input class="input" id="conv_logsru"      name="conv_logsru"      type="number" step="any" placeholder="Logements converti en social"                          v-on:blur="recalc"  v-model.number="scen1.conv_logsru"> <br>
                    Part de Logement Sociaux  :                              <input class="input" id="part_logsru"      name="part_logsru"      type="number" step="any" placeholder="Part de Logements Sociaux dans les programmes"         v-on:blur="recalc"  v-model.number="scen1.part_logsru"> <br>
                    <br>
                </form>
                <br>
                <button class="button is-info" v-on:click="set_scen1()">Calcul du Scenario</button>
                <div class="w3-container w3-text-teal">
                    <h2>Historique</h2>
                </div>
             </div>
             <div class="column">
             <h3> Les Hypotheses :</h3>
            <div class="notification is-success">
                  <p>{{this.dataset.total.LIBELLE}} </p>
            </div>
                <p> Diminution Des Résidences Vacantes en % sur 10 ans :   -{{this.ds.scen_lutte_vacance}}%    </p>
                <p> Diminution Des Résidences Secondaire en % sur 10 ans : -{{this.ds.scen_lutte_secondaire}}% </p>
                <p> Evolution de la Taille de Ménages, en % / an :          {{this.ds.scen_evol_tm}}% </p>
                <p> Evolution de la Population, en % / an :                 {{this.ds.scen_evol_pop}}% </p>
                <p> Logements par Hectares  :                               {{this.ds.scen_log_ha}} </p>
                <p> Objectif de Conversion en LLS (Logement Sociaux) :      {{this.ds.scen_conv_logsru}} Logements</p>
                <p> Part de Logement Sociaux :                              {{this.ds.scen_part_logsru}} % </p>
            <h3> Les Resultats :</h3>
            <div class="notification is-warning">
                  <p>Consommation Fonciere Lies aux hypotheses :  </p>
                  <p>2030 :    {{this.ds.f_conso_2030}} ha </p>
                  <p>2050 :    {{this.ds.f_conso_2030 + this.ds.f_conso_3040 + this.ds.f_conso_4050}} ha </p>
            </div>
            <div class="notification is-danger">
                  <p>Consommation Fonciere Lies aux contraintes SRU :  </p>
                  <p>2030 :    {{this.ds.proj_excd_conso_rp_rs_rv}} ha </p>
            </div>

             </div>
             <div class="column">
                <h3 v-if="titre"> Le Scenario Standard :</h3>
                <form>
                    Lutte en % / 10 ans contre la Vacance :                  <input readonly class="input" id="lutte_vacance"    name="lutte_vacance"    type="number" step="any" placeholder="Diminution Vacance en % sur 10 ans"                    v-on:blur="recalc"  v-model.number="scen0.lutte_vacance"> <br>
                    Lutte en % / 10 ans contre les Résidences Secondaires :  <input readonly class="input" id="lutte_secondaire" name="lutte_secondaire" type="number" step="any" placeholder="Diminution Des Résidences Secondaire en % sur 10 ans"  v-on:blur="recalc"  v-model.number="scen0.lutte_secondaire"> <br>
                    Evolution de la Taille de Ménages, en % / an :           <input readonly class="input" id="evol_tm"          name="evol_tm"          type="number" step="any" placeholder="Evolution de la Taille de Ménages, en % / an"          v-on:blur="recalc"  v-model.number="scen0.evol_tm"> <br>
                    Evolution de la Population, en % / an  :                 <input readonly class="input" id="evol_pop"         name="evol_pop"         type="number" step="any" placeholder="Evolution de la Population, en % / an"                 v-on:blur="recalc"  v-model.number="scen0.evol_pop"> <br>
                    Logements par Hectares  :                                <input readonly class="input" id="log_ha"           name="log_ha"           type="number" step="any" placeholder="Logements par Hectare"                                 v-on:blur="recalc"  v-model.number="scen0.log_ha"> <br>
                    Objectif de Conversion en LLS :                          <input readonly class="input" id="conv_logsru"      name="conv_logsru"      type="number" step="any" placeholder="Logements convertis en social"                         v-on:blur="recalc"  v-model.number="scen0.conv_logsru"> <br>
                    Part de Logement Sociaux  :                              <input readonly class="input" id="part_logsru"      name="part_logsru"      type="number" step="any" placeholder="Part de Logements Sociaux dans les programmes"         v-on:blur="recalc"  v-model.number="scen0.part_logsru"> <br>
                    <br>
                </form>
                <br>
                <button class="button is-info" v-on:click="set_scen0()">Calcul du Scenario de Base</button>
                <div class="w3-container w3-text-orange">
                    <h2>Projections</h2>
                </div>
             </div>
        </div>
        <br>
        <table class="w3-table-all w3-hoverable w3-card-4">
            <tbody>
            <tr class="w3-teal">
                <th>Donnees INSEE</th>
                <th class="w3-right-align w3-teal">2008</th>
                <th class="w3-right-align w3-grey">5 ans</th>
                <th class="w3-right-align w3-teal">2013</th>
                <th class="w3-right-align w3-grey">5 ans</th>
                <th class="w3-right-align w3-teal">2018</th>
                <th class="w3-right-align w3-grey">2 ans</th>
                <th class="w3-right-align w3-amber">2020</th>
                <th class="w3-right-align w3-grey">10 ans</th>
                <th class="w3-right-align w3-orange">2030</th>
                <th class="w3-right-align w3-grey">10 ans</th>
                <th class="w3-right-align w3-orange">2040</th>
                <th class="w3-right-align w3-grey">10 ans</th>
                <th class="w3-right-align w3-orange">2050</th>
            </tr>
            <tr>
                <td>Population</td>
                <td class="w3-right-align">{{this.ds.pop_2008}}</td>
                <td class="w3-right-align">{{this.ds.f_epop_0813}}</td>
                <td class="w3-right-align">{{this.ds.pop_2013}}</td>
                <td class="w3-right-align">{{this.ds.f_epop_1318}}</td>
                <td class="w3-right-align">{{this.ds.pop_2018}}</td>
                <td class="w3-right-align">{{this.ds.f_epop_1820}}</td>
                <td class="w3-right-align">{{this.ds.pop_2020}}</td>
                <td class="w3-right-align">{{this.ds.f_epop_2030}}</td>
                <td class="w3-right-align">{{this.ds.pop_2030}}</td>
                <td class="w3-right-align">{{this.ds.f_epop_3040}}</td>
                <td class="w3-right-align">{{this.ds.pop_2040}}</td>
                <td class="w3-right-align">{{this.ds.f_epop_4050}}</td>
                <td class="w3-right-align">{{this.ds.pop_2050}}</td>
            </tr>
            <tr>
                <td><i>- Croissance Annuelle</i></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_etxpop_0813}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_etxpop_1318}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_etxpop_1820}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_etxpop_2030}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_etxpop_3040}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_etxpop_4050}}</td>
            </tr>
            <tr>
                <td>Population des Ménages</td>
                <td class="w3-right-align">{{this.ds.pmen_2008}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.pmen_2013}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.pmen_2018}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.pmen_2020}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.pmen_2030}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.pmen_2040}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.pmen_2050}}</td>
            </tr>
            <tr>
                <td>Nombre de Ménages</td>
                <td class="w3-right-align">{{this.ds.men_2008}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.men_2013}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.men_2018}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.men_2020}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.men_2030}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.men_2040}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.men_2050}}</td>
            </tr>
            <tr>
                <td>Taille des Ménages</td>
                <td class="w3-right-align">{{this.ds.f_tmen_2008}}</td>
                <td class="w3-right-align">{{this.ds.f_txtmen_0813}}</td>
                <td class="w3-right-align">{{this.ds.f_tmen_2013}}</td>
                <td class="w3-right-align">{{this.ds.f_txtmen_1318}}</td>
                <td class="w3-right-align">{{this.ds.f_tmen_2018}}</td>
                <td class="w3-right-align">{{this.ds.f_txtmen_1820}}</td>
                <td class="w3-right-align">{{this.ds.f_tmen_2020}}</td>
                <td class="w3-right-align">{{this.ds.f_txtmen_2030}}</td>
                <td class="w3-right-align">{{this.ds.f_tmen_2030}}</td>
                <td class="w3-right-align">{{this.ds.f_txtmen_3040}}</td>
                <td class="w3-right-align">{{this.ds.f_tmen_2040}}</td>
                <td class="w3-right-align">{{this.ds.f_txtmen_4050}}</td>
                <td class="w3-right-align">{{this.ds.f_tmen_2050}}</td>
            </tr>
            <tr>
                <td>Population Hors Ménages</td>
                <td class="w3-right-align">{{this.ds.hmen_2008}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.hmen_2013}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.hmen_2018}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.hmen_2020}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.hmen_2030}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.hmen_2040}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.hmen_2050}}</td>
            </tr>
            <tr>
                <td>Taux Hors Ménages</td>
                <td class="w3-right-align">{{this.ds.f_txhmen_2008}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_txhmen_2013}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_txhmen_2018}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_txhmen_2020}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_txhmen_2030}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_txhmen_2040}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_txhmen_2050}}</td>
            </tr>

            <tr>
                <td>Résidences Principales</td>
                <td class="w3-right-align">{{this.ds.f_rp_2008}}</td>
                <td class="w3-right-align">{{this.ds.f_rp_0813}}</td>
                <td class="w3-right-align">{{this.ds.f_rp_2013}}</td>
                <td class="w3-right-align">{{this.ds.f_rp_1318}}</td>
                <td class="w3-right-align">{{this.ds.f_rp_2018}}</td>
                <td class="w3-right-align">{{this.ds.f_rp_1820 }} </td>
                <td class="w3-right-align">{{this.ds.f_rp_2020}}</td>
                <td class="w3-right-align">{{this.ds.f_erp_2030}}</td>
                <td class="w3-right-align">{{this.ds.f_rp_2030}}</td>
                <td class="w3-right-align">{{this.ds.f_erp_3040}}</td>
                <td class="w3-right-align">{{this.ds.f_rp_2040}}</td>
                <td class="w3-right-align">{{this.ds.f_erp_4050}}</td>
                <td class="w3-right-align">{{this.ds.f_rp_2050}}</td>
            </tr>
            <tr>
                <td><i>- Lie a la croissance demographique</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"><i>{{this.ds.f_rped_2030}}</i></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"><i>{{this.ds.f_rped_3040}}</i></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"><i>{{this.ds.f_rped_4050}}</i></td>
                <td class="w3-right-align"></td>
            </tr>
            <tr>
                <td><i>- Lie au desserement des ménages</i></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"><i>{{this.ds.f_rptm_2030}}</i></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"><i>{{this.ds.f_rptm_3040}}</i></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"><i>{{this.ds.f_rptm_4050}}</i></td>
                <td class="w3-right-align"></td>
            </tr>
            <tr>
                <td>Résidences Secondaires</td>
                <td class="w3-right-align">{{this.ds.f_rs_2008}}</td>
                <td class="w3-right-align">{{this.ds.f_rs_0813}}</td>
                <td class="w3-right-align">{{this.ds.f_rs_2013}}</td>
                <td class="w3-right-align">{{this.ds.f_rs_1318}}</td>
                <td class="w3-right-align">{{this.ds.f_rs_2018}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_rs_2020}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_rs_2030}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_rs_2040}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_rs_2050}}</td>
            </tr>
            <tr>
                <td>Logements Vacants</td>
                <td class="w3-right-align">{{this.ds.f_rv_2008}}</td>
                <td class="w3-right-align">{{this.ds.f_rv_0813}}</td>
                <td class="w3-right-align">{{this.ds.f_rv_2013}}</td>
                <td class="w3-right-align">{{this.ds.f_rv_1318}}</td>
                <td class="w3-right-align">{{this.ds.f_rv_2018}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_rv_2020}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_rv_2030}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_rv_2040}}</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.f_rv_2050}}</td>
            </tr>
            <tr>
                <td><b>Total des Logements</b></td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.log_2008}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.f_log_0813}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.log_2013}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.f_log_1318}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.log_2018}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.f_log_1820}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.log_2020}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.f_log_2030}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.log_2030}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.f_log_3040}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.log_2040}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.f_log_4050}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.log_2050}}</td>
            </tr>
            <tr>
                <td><b>Consommation Fonciere</b></td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> </td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.f_conso_0813}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> </td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.f_conso_1318}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> </td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.f_conso_1820}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> </td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.f_conso_2030}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> </td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.f_conso_3040}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> </td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.f_conso_4050}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> </td>
            </tr>
            <tr class="w3-teal">
                <th>Donnees Sitadel</th>
                <th class="w3-right-align w3-blue-grey">2013-2016</th>
                <th class="w3-right-align w3-blue-grey">2017-2021</th>
                <th class="w3-right-align w3-orange">2017-2021</th>
                <th class="w3-right-align w3-orange">2013-2021</th>
                <th class="w3-right-align w3-amber">2013-2020</th>
                <th class="w3-right-align w3-grey">Equivalent Hectares</th>
                <th class="w3-right-align w3-purple">SRU</th>
                <th class="w3-right-align w3-grey"></th>
                <th class="w3-right-align w3-purple">2017-2019</th>
                <th class="w3-right-align w3-grey"></th>
                <th class="w3-right-align w3-purple">2020-2022</th>
                <th class="w3-right-align w3-grey"></th>
                <th class="w3-right-align w3-purple">Apres 2022</th>
            </tr>
            <tr>
                <td><b>Logements Autorises</b></td>
                <td class="w3-right-align"> {{this.ds.sit_saut_1316}}</td>
                <td class="w3-right-align"> {{this.ds.sit_saut_1721}}</td>
                <td class="w3-right-align"> {{this.ds.sit_eaut_1721}}</td>
                <td class="w3-right-align"> {{this.ds.sit_eaut_1321}}</td>
                <td class="w3-right-align"> {{this.ds.sit_eaut_1320}}</td>
                <td class="w3-right-align"> {{ Math.round(this.ds.sit_eaut_1321 / this.ds.scen_log_ha) }} ha</td>
                <td class="w3-right-align"> Carence</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{ this.ds.sru_f_scar_1719 }}</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{ this.ds.sru_f_scar_2022 }}</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{ this.ds.sru_f_scar_2025 }}</td>
            </tr>
            <tr>
                <td><b>Constructions Commencees</b></td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.sit_scom_1316}}</td>
                <td class="w3-right-align" > {{this.ds.sit_scom_1721}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.sit_ecom_1721}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.sit_ecom_1321}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.sit_ecom_1320}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{Math.round(this.ds.sit_ecom_1321/ this.ds.scen_log_ha) }} ha</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> Objectifs</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{ this.ds.sru_sobj_1719 }}</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{ this.ds.sru_sobj_2022 }}</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{ this.ds.sru_sobj_2025 }}</td>
            </tr>
            <tr>
                <td><b>Taux de Realisation</b></td>
                <td class="w3-right-align"> {{this.ds.sit_f_stxr_1316}}</td>
                <td class="w3-right-align"> {{this.ds.sit_f_stxr_1721}}</td>
                <td class="w3-right-align"> {{this.ds.sit_f_etxr_1721}}</td>
                <td class="w3-right-align"> {{this.ds.sit_f_etxr_1321}}</td>
                <td class="w3-right-align"> {{this.ds.sit_f_etxr_1320}}</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> Realises</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{ this.ds.sru_f_srea_1719 }}</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{ this.ds.sru_f_srea_2022 }}</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{ this.ds.sru_f_srea_2025 }}</td>
            </tr>
            <tr>
                <td><b>Contructions Par An</b></td>
                <td class="w3-right-align"> {{this.ds.sit_scan_1316}}</td>
                <td class="w3-right-align"> {{this.ds.sit_scan_1721}}</td>
                <td class="w3-right-align"> {{this.ds.sit_ecan_1721}}</td>
                <td class="w3-right-align"> {{this.ds.sit_ecan_1321}}</td>
                <td class="w3-right-align"> {{this.ds.sit_ecan_1320}}</td>
                <td class="w3-right-align"> {{Math.round(this.ds.sit_ecan_1321/ this.ds.scen_log_ha) }} ha</td>
                <td class="w3-right-align"> Conversion en LLS </td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{this.ds.scen_conv_logsru}}</td>
            </tr>
            <tr> <!-- lcon_1316 ebes_1316 excd_1316 erps_1316 naff_1316 -->
                <td><b>Logements Construits</b></td>
                <td class="w3-right-align"> {{this.ds.sit_lcon_1316}}</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{this.ds.sit_lcon_1721}}</td>
                <td class="w3-right-align"> {{this.ds.sit_lcon_1321}}</td>
                <td class="w3-right-align"> {{this.ds.sit_lcon_1320}}</td>
                <td class="w3-right-align"> {{Math.round(this.ds.sit_lcon_1321/ this.ds.scen_log_ha) }} ha</td>
                <td class="w3-right-align"> Part des LLS</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{this.ds.proj_part_logsru }}%</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align">  {{ this.ds.proj_f_logsru }}</td>
            </tr>
            <tr>
                <td><b>Evolution des Besoins</b></td>
                <td class="w3-right-align"> {{this.ds.sit_ebes_1316}}</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{this.ds.sit_ebes_1721}}</td>
                <td class="w3-right-align"> {{this.ds.sit_ebes_1321}}</td>
                <td class="w3-right-align"> {{this.ds.sit_ebes_1320}}</td>
                <td class="w3-right-align"> {{Math.round(this.ds.sit_ebes_1321/ this.ds.scen_log_ha) }} ha</td>
                <td class="w3-right-align"> A Construire </td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{this.ds.proj_part_logtot * 100}}%</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align">  {{ this.ds.proj_f_logtot }}</td>
            </tr>
            <tr>
                <td><b>Excedent en Logements</b></td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.sit_excd_1316}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> </td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.sit_excd_1721}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.sit_excd_1321}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.sit_excd_1320}}</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{Math.round(this.ds.sit_excd_1321/this.ds.scen_log_ha) }} ha</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> Ha consommes</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> </td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.scen_log_ha}} Log. / ha</td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> </td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> </td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> </td>
                <td class="w3-right-align" style="text-shadow:1px 1px 0 #444"> {{this.ds.proj_log_ha}}</td>
            </tr>
            <tr>
                <td><b>Evolution des Résidences Secondaires et de la Vacance</b></td>
                <td class="w3-right-align"> {{this.ds.sit_ersv_1316}}</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{this.ds.sit_ersv_1721}}</td>
                <td class="w3-right-align"> {{this.ds.sit_ersv_1321}}</td>
                <td class="w3-right-align"> {{this.ds.sit_ersv_1320}}</td>
                <td class="w3-right-align"> {{Math.round(this.ds.sit_ersv_1321/ this.ds.scen_log_ha) }} ha</td>
                <td class="w3-right-align"> Habitants</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> Augmentation</td>
                <td class="w3-right-align"> {{this.ds.proj_hab_augm}}%</td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> </td>
                <td class="w3-right-align"> {{this.ds.proj_f_hab}}</td>
            </tr>
            <tr>
                <td><b>Non encore affectes (en construction) </b></td>
                <td class="w3-right-align w3-tooltip"> {{this.ds.sit_naff_1316}}</td>
                <td class="w3-right-align w3-tooltip"> </td>
                <td class="w3-right-align w3-tooltip"> {{this.ds.sit_naff_1721}}</td>
                <td class="w3-right-align w3-tooltip"> {{this.ds.sit_naff_1321}}</td>
                <td class="w3-right-align w3-tooltip"> {{this.ds.sit_naff_1320}}</td>
                <td class="w3-right-align w3-tooltip"> {{Math.round(this.ds.sit_naff_1321/ this.ds.scen_log_ha) }} ha</td>
                <td class="w3-right-align w3-tooltip"> Logements a terme :<span class="w3-text w3-tag w3-round-xlarge w3-small"><em>si les objectifs de la loi SRU sont menes a terme avec le mode de financement actuel </em></span></td>
                <td class="w3-right-align w3-tooltip"> {{this.ds.proj_log_terme}}</td>
                <td class="w3-right-align w3-tooltip"> Excedents de Logements en 2030 :<span class="w3-text w3-tag w3-round-xlarge w3-small"><em>au dela des taux previsionnels de la vacances et des résidences secondaires</em></span></td>
                <td class="w3-right-align w3-tooltip"> {{this.ds.proj_excd_terme_rp_rs_rv}}</td>
                <td class="w3-right-align w3-tooltip"> Consommation Fonciere des Excedents :<span class="w3-text w3-tag w3-round-xlarge w3-small"><em>lie au mode de financement de la loi SRU</em></span></td>
                <td class="w3-right-align w3-tooltip"> </td>
                <td class="w3-right-align w3-tooltip"> {{this.ds.proj_excd_conso_rp_rs_rv}} ha</td>
            </tr>
            </tbody>
        </table>
    </div>
  `
})

vm.mount('#app');

function onPageLoaded() {
  const queryString = window.location.search;
  console.log("onPageLoaded : " + queryString);
}

// ################################
// Plots
// ################################

google.charts.load('current', {'packages':['corechart']});

// https://www.w3schools.com/w3css/w3css_color_fashion.asp
theme_color             = "#008080" ; // teal
res_principales_color   = '#00A170' ;
res_secondaires_color   = '#2AA9DB' ;
res_vacantes_color      = '#7E7E7E' ;
logements_color         = '#8E44AD' ;
log_sec_vac_color       = '#798EA4' ;
res_principales_color   = '#00A170' ;
log_construits_color    = '#61443A' ;
log_sru_color           = '#E91E63' ;

border_Color     = "#006e6d" ;
background_Color = "#56C6A9" ; //"#99ffff" ;

function chartRepartitionNouveauxLogements(ds, container) {
    // Répartition des nouveaux Logements de 2008 a 2018
    $('#'+container).html('');
    if (ds=== null) { return ; }

    var data = google.visualization.arrayToDataTable([
      ['Répartition des Nouveaux Logements sur ' + ds.LIBELLE, 'Logements'],
      ['Nouvelles Résidences Principales', (ds.P18_RP      - ds.P08_RP>0)      ? (ds.P18_RP - ds.P08_RP) : 0],
      ['Nouvelles Résidences Secondaires', (ds.P18_RSECOCC - ds.P08_RSECOCC>0) ? (ds.P18_RSECOCC - ds.P08_RSECOCC) : 0],
      ['Nouvelles Résidences Vacantes',    (ds.P18_LOGVAC  - ds.P08_LOGVAC>0)  ? (ds.P18_LOGVAC - ds.P08_LOGVAC) : 0 ]
    ]);

    var options = {
      title:'Répartition des Nouveaux Logements sur ' + ds.LIBELLE,
      is3D: true,
      titleTextStyle: {
           color: theme_color,
        },
      slices: {
        0: { color: res_principales_color },
        1: { color: res_secondaires_color },
        2: { color: res_vacantes_color }
      }
    };

    new google.visualization.PieChart(document.getElementById(container)).draw(data, options);
}

function chartProductionBesoinsLogements(ds, container) {
    // Production et Besoins en Logements Plotly
    $('#'+container).html('');
    if (ds=== null) { return ; }

    offset = ds.LOG_COMMENCES_2010 * 2
    offset = (ds.P13_RP-ds.P08_RP+ds.P13_RSECOCC-ds.P08_RSECOCC+ds.P13_LOGVAC-ds.P08_LOGVAC ) / 5 * 2
    if (offset < 0) { offset = 0 }
    offset_construits = ( ds.LOG_COMMENCES_2010 + ds.LOG_COMMENCES_2011 + ds.LOG_COMMENCES_2012) / 3 * 5
    if (ds.NOUV_LOG_0813 > offset_construits) { offset_construits = ds.NOUV_LOG_0813 }
    if (offset_construits < 0) { offset_construits = 0 }

    var data = [
    {
        name   : "Résidences Principales des ménages - Historique",
        mode   : 'lines',
        line: {shape: 'spline', dash: 'solid', width: 3, color : res_principales_color },
        x : [2008, 2013, 2018, 2020],
        y : [ds.P08_RP   - ds.P08_RP,
             ds.P13_RP   - ds.P08_RP,
             ds.P18_RP   - ds.P08_RP,
             ds.LOG_2020 - ds.P08_RP],
    },
    {
        name   : "Résidences Principales des ménages - Projection des Besoins",
        mode: 'lines',
        line: {shape: 'spline', dash: 'dot', width: 3, color : res_principales_color },
        visible : 'legendonly',
        x : [2020, 2030],
        y : [ds.LOG_2020 - ds.P08_RP,
             ds.LOG_2030 - ds.P08_RP],
    },
    {
        name   : "Résidences Secondaires + Vacantes",
        mode: 'lines',
        line: {shape: 'spline', dash: 'solid', width: 3, color : log_sec_vac_color},
        x : [2008, 2013, 2018],
        y : [ds.P08_RSECOCC - ds.P08_RSECOCC + ds.P08_LOGVAC - ds.P08_LOGVAC,
             ds.P13_RSECOCC - ds.P08_RSECOCC + ds.P13_LOGVAC - ds.P08_LOGVAC,
             ds.P18_RSECOCC - ds.P08_RSECOCC + ds.P18_LOGVAC - ds.P08_LOGVAC],
    },
    {
        name   : "Résidences Principales + Secondaires + Vacantes",
        mode: 'lines',
        line: {shape: 'spline', dash: 'solid', width: 6, color : logements_color},
        x : [2008, 2013, 2018],
        y : [ds.P08_RP - ds.P08_RP + ds.P08_RSECOCC - ds.P08_RSECOCC + ds.P08_LOGVAC - ds.P08_LOGVAC,
             ds.P13_RP - ds.P08_RP + ds.P13_RSECOCC - ds.P08_RSECOCC + ds.P13_LOGVAC - ds.P08_LOGVAC,
             ds.P18_RP - ds.P08_RP + ds.P18_RSECOCC - ds.P08_RSECOCC + ds.P18_LOGVAC - ds.P08_LOGVAC],
    },
  {
        name : "Logements Construits",
        mode: 'lines',
        line: {shape: 'spline', dash: 'solid', width: 4, color : log_construits_color},
        x : [2008, 2013, 2016, 2020],
        y : [0, offset_construits ,
             offset_construits + ds.NB_LGT_TOT_COMMENCES_1316,
             offset_construits + ds.NB_LGT_TOT_COMMENCES_1316 + ds.NB_LGT_TOT_COMMENCES_1721]
  },
  {
        name : "Indéterminées (Non-Affectés / Non-Vendues)",
        mode: 'lines',
        line: {shape: 'spline', dash: 'dot', width: 4, color : '#74248f'},
        x : [2018, 2020],
        y : [ds.P18_RP-ds.P08_RP+ds.P18_RSECOCC-ds.P08_RSECOCC+ds.P18_LOGVAC-ds.P08_LOGVAC ,
             ds.NOUV_LOG_0813+ds.NB_LGT_TOT_COMMENCES_1316+ds.NB_LGT_TOT_COMMENCES_1721]
  },
  ];

/*
  {
        name : "Logements Construits",
        mode: 'lines',
        line: {shape: 'spline', dash: 'dot', width: 4, color : log_construits_color},
        x : [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
        y : [0 , offset,
             offset + ds.LOG_COMMENCES_2010 ,
             offset + ds.LOG_COMMENCES_2010 + ds.LOG_COMMENCES_2011,
             offset + ds.LOG_COMMENCES_2010 + ds.LOG_COMMENCES_2011 + ds.LOG_COMMENCES_2012,
             offset + ds.LOG_COMMENCES_2010 + ds.LOG_COMMENCES_2011 + ds.LOG_COMMENCES_2012 + ds.LOG_COMMENCES_2013,
             offset + ds.LOG_COMMENCES_1014,
             offset + ds.LOG_COMMENCES_1014 + ds.LOG_COMMENCES_2015,
             offset + ds.LOG_COMMENCES_1014 + ds.LOG_COMMENCES_2015 + ds.LOG_COMMENCES_2016,
             offset + ds.LOG_COMMENCES_1014 + ds.LOG_COMMENCES_2015 + ds.LOG_COMMENCES_2016 + ds.LOG_COMMENCES_2017,
             offset + ds.LOG_COMMENCES_1014 + ds.LOG_COMMENCES_2015 + ds.LOG_COMMENCES_2016 + ds.LOG_COMMENCES_2017 + ds.LOG_COMMENCES_2018,
             offset + ds.LOG_COMMENCES_1019]
  },
     {
            name : "Projection Logements Construits",
            line: {shape: 'spline', dash: 'dot', width: 4, color : log_construits_color},
            x : [2020, 2021],
            y : [ds.NOUV_LOG_0813 + ds.NB_LGT_TOT_COMMENCES_1316 + ds.NB_LGT_TOT_COMMENCES_1721,
                 ds.NOUV_LOG_0813 + ds.PROJ_LOG_REALISES_2021]
     },
*/

    if ((ds.SRU_CARENCE_2020 != 0 ) || ((ds.NB_LGT_PRET_LOC_SOCIAL_1316 + ds.NB_LGT_PRET_LOC_SOCIAL_1721) != 0)) {
      offset_sru = offset + ds.LOG_COMMENCES_2010 + ds.LOG_COMMENCES_2011 + ds.LOG_COMMENCES_2012
      offset_sru = ds.NOUV_LOG_0813
      offset_sru = offset_construits
      if (offset_sru  < 0) { offset_sru = 0 }
      data.push(
         {
            "Condition" : "(SRU_CARENCE_2020 != 0) or ((NB_LGT_PRET_LOC_SOCIAL_1316+ NB_LGT_PRET_LOC_SOCIAL_1721) != 0)",
            name : "Logements Sociaux Construits",
            mode: 'lines',
            line: {shape: 'spline', dash: 'solid', width: 3, color : log_sru_color },
            x : [2013, 2016, 2020],
            y : [offset_sru ,
                 offset_sru + ds.NB_LGT_PRET_LOC_SOCIAL_1316,
                 offset_sru + ds.NB_LGT_PRET_LOC_SOCIAL_1316 + ds.NB_LGT_PRET_LOC_SOCIAL_1721]
          })
    }

    // Define Layout
    var layout = {
      legend : {  yanchor:"bottom",
                  y:-3.2,
                  xanchor:"right",
                  x:1
                },
      title : {
          font : { color : theme_color } ,
          text: "<b>Logements sur "+ ds.LIBELLE + "</b>"
      }
    };

    // Display using Plotly
    Plotly.newPlot(container,  data, layout);
}

function chartRepartitionTypesLogements(ds, container) {
    // Répartition des types de Logements en 2018
    $('#'+container).html('');
    if (ds=== null) { return ; }

    var trace1 = {
      x: ["2008", "2013", "2018"],
      y: [ds.P08_RP, ds.P13_RP, ds.P18_RP],
      name: 'Residences Principales',
      marker: { color: res_principales_color },
      type: 'bar'
    };

    var trace2 = {
      x: ["2008", "2013", "2018"],
      y: [ds.P08_RSECOCC, ds.P13_RSECOCC, ds.P18_RSECOCC],
      name: 'Residences Secondaires',
      marker: { color: res_secondaires_color },
      type: 'bar'
    };

    var trace3 = {
      x: ["2008", "2013", "2018"],
      y: [ds.P08_LOGVAC, ds.P13_LOGVAC, ds.P18_LOGVAC],
      name: 'Residences Vacantes',
      marker: { color: res_vacantes_color },
      type: 'bar'
    };

    var data = [trace1, trace2, trace3];

    // Define Layout
    var layout = {
      barmode: 'stack',
      legend : {  yanchor:"bottom",
                  y:-3.2,
                  xanchor:"right",
                  x:1
                },
      title : {
          font : { color : theme_color } ,
          text: "<b>Répartition des types de Logements sur "+ ds.LIBELLE + "</b>"
      }
    };

    Plotly.newPlot(container, data, layout);
}

function chartConstructions(ds, container) {

    // Graphique Constructions de Logements 2010-2019 (ChartJS)
    $('#'+container).html('');
    if (ds=== null) { return ; }

    const data = {
      labels: ["2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"],
      datasets: [
        {
          label: "Logements Construits - Par an",
          data: [ds.LOG_COMMENCES_2010, ds.LOG_COMMENCES_2011, ds.LOG_COMMENCES_2012, ds.LOG_COMMENCES_2013,
                 ds.LOG_COMMENCES_2014, ds.LOG_COMMENCES_2015, ds.LOG_COMMENCES_2016, ds.LOG_COMMENCES_2017,
                 ds.LOG_COMMENCES_2018, ds.LOG_COMMENCES_2019],
          fill: false,
          tension: 0.5,
          borderDash: [5, 5],
          borderColor: border_Color,
          backgroundColor: background_Color,
        },
        {
          label: "Logements Construits - Cumul",
          data: [   ds.LOG_COMMENCES_2010 ,
                    ds.LOG_COMMENCES_2010 + ds.LOG_COMMENCES_2011,
                    ds.LOG_COMMENCES_2010 + ds.LOG_COMMENCES_2011 + ds.LOG_COMMENCES_2012,
                    ds.LOG_COMMENCES_2010 + ds.LOG_COMMENCES_2011 + ds.LOG_COMMENCES_2012 + ds.LOG_COMMENCES_2013,
                    ds.LOG_COMMENCES_1014,
                    ds.LOG_COMMENCES_1014 + ds.LOG_COMMENCES_2015,
                    ds.LOG_COMMENCES_1014 + ds.LOG_COMMENCES_2015 + ds.LOG_COMMENCES_2016,
                    ds.LOG_COMMENCES_1014 + ds.LOG_COMMENCES_2015 + ds.LOG_COMMENCES_2016 + ds.LOG_COMMENCES_2017,
                    ds.LOG_COMMENCES_1014 + ds.LOG_COMMENCES_2015 + ds.LOG_COMMENCES_2016 + ds.LOG_COMMENCES_2017+
                    ds.LOG_COMMENCES_2018,
                    ds.LOG_COMMENCES_1019],
          fill: false,
          tension: 0.5,
          borderColor: border_Color,
          backgroundColor: background_Color,
        }
      ]
    };

    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true, color: theme_color,
            text: 'Logements Construits sur ' + ds.LIBELLE,
          }
        },
        scales: {
          x: {
            title: {
              display: false, color: theme_color,
              text: 'Annees'
            }
          },
          y: {
            title: {
              display: true, color: theme_color,
              text: 'Logements Construits'
            },
          }
        },
      },
    };

    $('<canvas id="'+container+'Canvas"></canvas>').appendTo($('#'+container));
    var myChart = new Chart($("#"+container+"Canvas").get(0).getContext("2d"), config);
}

function chartTailleDesMenages(ds, container) {

    // Graphique Taille des Ménages (ChartJS)
    $('#'+container).html('');
    if (ds=== null) { return ; }

    const data = {
      labels: ["2008", "2013", "2018", "2020", "2025", "2030", "2035", "2040"],
      datasets: [
        {
          label: "Taille des Ménages - Historique",
          data: [ds.TM_2008, ds.TM_2013, ds.TM_2018, ds.TM_2020, , , , ],
          fill: false,
          tension: 0.5,
          borderColor: border_Color,
          backgroundColor: background_Color,
        },
        {
          label: "Taille des Ménages - Projetée",
          data: [ , , , ds.TM_2020, (ds.TM_2020 + ds.TM_2030)/2 ,ds.TM_2030, (ds.TM_2030 + ds.TM_2040)/2 , ds.TM_2040],
          fill: false,
          tension: 0.5,
          borderDash: [5, 5],
          borderColor: border_Color,
          backgroundColor: background_Color,
        }
      ]
    };

    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true, color: theme_color,
            text: 'Taille des Ménages sur ' + ds.LIBELLE,
          }
        },
        scales: {
          x: {
            title: {
              display: false, color: theme_color,
              text: 'Annees'
            }
          },
          y: {
            suggestedMin: 1 , suggestedMax: 3 ,
            title: {
              display: true, color: theme_color,
              text: 'Taille des Ménages' ,
            },
          }
        },
      },
    };

    $('<canvas id="'+container+'Canvas"></canvas>').appendTo($('#'+container));
    var myChart = new Chart($("#"+container+"Canvas").get(0).getContext("2d"), config);
}

function chartGraphiquePopulation(ds, container) {

    // Graphique Population (ChartJS)
    $('#'+container).html('');
    if (ds=== null) { return ; }

    const data = {
      labels: ["2008", "2013", "2018", "2020", "2025", "2030", "2035", "2040"],
      datasets: [
        {
          label: "Population - Historique",
          data: [ds.P08_POP, ds.P13_POP, ds.P18_POP, ds.POP_2020, , , , ],
          fill: false,
          tension: 0.5,
          borderColor: border_Color,
          backgroundColor: background_Color,
        },
        {
          label: "Population - Projetée",
          data: [ , , , ds.POP_2020, (ds.POP_2020 + ds.POP_2030)/2 ,ds.POP_2030, (ds.POP_2030 + ds.POP_2040)/2 , ds.POP_2040],
          fill: false,
          tension: 0.5,
          borderDash: [5, 5],
          borderColor: border_Color,
          backgroundColor: background_Color,
        }
      ]
    };

    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true, color: theme_color,
            text: 'Population sur ' + ds.LIBELLE,
          }
        },
        scales: {
          x: {
            title: {
              display: false, color: theme_color,
              text: 'Annees'
            }
          },
          y: {
            suggestedMin: ds.P08_POP * 0.9 , suggestedMax: ds.P08_POP * 1.1 ,
            title: {
              display: true, color: theme_color,
              text: 'Population' ,
            },
          }
        },
      },
    };

    $('<canvas id="'+container+'Canvas"></canvas>').appendTo($('#'+container));
    var myChart = new Chart($("#"+container+"Canvas").get(0).getContext("2d"), config);
}

function chartsUpdate(ds) {

    // Tab Constructions
    chartProductionBesoinsLogements(ds,   'constructionsProductionBesoinsLogementsChartContainer')
    chartConstructions(ds,                'constructionsConstructionsLogementsChartContainer')

    // chartProductionBesoinsLogements(ds,   'logementsPlotlyChartContainer2')
    // chartRepartitionTypesLogements(ds,    'typeLogPlotlyChartContainer2')
    // chartConstructions(ds,                'constLogChartContainer')

    // Tab Population
    chartTailleDesMenages(ds,             'populationTailleMenagesChartContainer')
    chartGraphiquePopulation(ds,          'populationChartContainer')

    // Tab Logements
    chartRepartitionNouveauxLogements(ds, 'logementsRepartitionNouveauxLogementsChartContainer')
    chartRepartitionTypesLogements(ds,    'logementsRepartitionTypesLogementsChartContainer')

    // Tab Graphiques
    chartGraphiquePopulation(ds,          'graphiquesPopulationChartContainer')
    chartTailleDesMenages(ds,             'graphiquesTailleMenagesChartContainer')
    chartProductionBesoinsLogements(ds,   'graphiquesProductionBesoinsLogementsChartContainer')
    chartConstructions(ds,                'graphiquesConstructionsLogementsChartContainer')
    chartRepartitionNouveauxLogements(ds, 'graphiquesRepartitionNouveauxLogementsChartContainer')
    chartRepartitionTypesLogements(ds,    'graphiquesRepartitionTypesLogementsChartContainer')

}
