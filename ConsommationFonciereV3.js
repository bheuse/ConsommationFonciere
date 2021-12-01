
$.ajaxSetup({ async: false });
g_data_s = null;

select_message  = "Selectionner un territoire"
default_message = "Selectionner un territoire"
no_postal = "-"

// Execute script in private context
function evalInContext(script, context) {
   var js_expr = pythonToJaveScript(script);
   return (new Function("with(this) { return " + js_expr + "}")).call(context);
}

function pythonToJaveScript(expr) {
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
        // Adds format: format="+"   =>  +45%
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
            console.log("# > Skipping : " + key);
            continue
            }
        if (!((filter == "*") || (value.Source == filter) || (key == filter))) {
            console.log("# > Skipping : " + key);
            continue
            }
        js_expr = value.JavaScript ;
        console.log("Calculs : " + key + " : " + js_expr + " =" );
        the_value = evalInContext(js_expr, dataset.total);
        console.log(the_value);
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
    return dataset
    }

function run_diagnostics(dataset, filter = "*"){
    console.log("> run_diagnostics");
    console.log(dataset);
    diagnostics = s_diagnostics["X"]
    console.log(diagnostics);
    for (const [key, value] of Object.entries(diagnostics)) {
        if (!((filter == "*") || (value.Source == filter) || (key == filter))) {
            console.log("# > Skipping : " + key);
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
        dataset.diag.push(diag)
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
        this.titre = titre
        this.reset(data_serveur)
        }
    reset(data_serveur) {
        console.log("scenario reset")
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
        console.log("scenario recalc")
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
            tt : "TT"
            }
      },
    mounted(){
        // this.selectDeptCode("06")
        this.selectCommuneMougins()
     },
    methods : {
        loadData(){
            this.select_message = select_message ;
            this.message = default_message ;
            console.log("loadData : "+this.entity);
            $.ajaxSetup({ async: false });
            json_s = "output/"+this.entity+"_s.json";
            console.log("json_s : "+json_s);
            this.data_s  = null ;
            this.ds      = null ;
            this.data    = null ;
            this.diag    = null ;
            g_data_s     = null ;
            $.getJSON(json_s, function(json) { g_data_s = json ; console.log("g_data_s") ; console.log(g_data_s) });
            console.log(g_data_s);
            if (! g_data_s) {
                this.message = "Donnees non-disponibles."
                return
                }
            g_data_s.total.scen = "scen0"
            dataset = run_calculs(g_data_s, full = true, filter = "*");
            dataset = run_diagnostics(dataset, filter = "*");
            this.data_s = dataset;
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
            epci_index       = this.selectEpcis.findIndex(x => x.nom === event.target.value);
            this.territoire  = "EPCI";
            this.nom         = this.selectEpcis[epci_index].nom;
            this.code        = this.selectEpcis[epci_index].code ;
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
            selectCommuneName(event.target.value);
            },
        selectCommuneName(name){
            console.log("selectCommuneName : "+name);
            comm_index       = this.selectCommunes.findIndex(x => x.nom === name);
            this.territoire  = "Commune";
            this.nom         = this.selectCommunes[comm_index].nom;
            this.code        = this.selectCommunes[comm_index].code ;
            this.entity      = this.selectCommunes[comm_index].entity;
            console.log(this.nom + " entity : " + this.entity);
            this.loadData()
            console.log("Done selectCommune "+this.entity);
            },
        selectCommuneMougins(name){
            console.log("selectCommuneMougins");
            this.territoire  = "Commune";
            this.nom         ="Mougins"
            this.code        = "06085" ;
            this.entity      = "COMMUNE_MOUGINS_06085";
            console.log(this.nom + " entity : " + this.entity);
            this.loadData()
            console.log("Done selectCommune "+this.entity);
            },

  },
})

vm.component('diagnostics', {
  props: ['diags' , 'type' , 'categorie'  ],
  template: `
    <div class="diagnostics">
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
            <h3 v-if="titre"> {{titre}}</h3>
            <h3 v-else>Calcul de Taux, selon l'evolution :</h3>
            <form v-if="valeur" onsubmit="return false">
                Annee de Depart :  <input class="input" id="tx_annee_depart"   name="tx_annee_depart"    type="number" step="any" placeholder="Annee de Depart"  v-on:blur="recalc_taux" v-model.number="calculette_taux.annee_depart"> <br>
                {{valeur}} de Depart : <input class="input" id="tx_val_depart"     name="tx_val_depart"      type="number" step="any" placeholder="Valeur de Depart" v-on:blur="recalc_taux" v-model.number="calculette_taux.val_depart"> <br>
                Annee d'Arrivee :  <input class="input" id="tx_annee_arrivee"  name="tx_annee_arrivee"   type="number" step="any" placeholder="Annee d'Arrivee"  v-on:blur="recalc_taux" v-model.number="calculette_taux.annee_arrivee"><br>
                {{valeur}} d'Arrivee : <input class="input" id="tx_val_arrivee"    name="tx_val_arrivee"     type="number" step="any" placeholder="Valeur d'Arrivee" v-on:blur="recalc_taux" v-model.number="calculette_taux.val_arrivee"><br>
                <br>
                <div class="columns">
                    <div class="column">
                        <button class="button is-info" v-on:click="recalc_taux()"> Taux de Croissance Annuel : {{ calculette_taux.taux_de_croissance }} % </button>
                    </div>
                    <div class="column">
                        <button class="button is-info" v-on:click="reset()"> Reset </button>
                    </div>
                </div>
            </form>
            <br>
            <div class="notification is-success">
                  <p>{{valeur}} en {{ calculette_taux.annee_arrivee }} : {{ calculette_taux.val_arrivee }} </p>
                  <p>Taux de Croissance : {{ calculette_taux.taux_de_croissance }} % / an </p>
            </div>
            <div class="notification is-warning">
                <p>Evolution {{ calculette_taux.annee_depart }} - {{ calculette_taux.annee_arrivee }} : {{ calculette_taux.augmentation }}</p>
                <p>Par an : {{ calculette_taux.augmentation_an }}</p>
            </div>
            <!-- <div class="notification is-danger">
                <p>Par an : {{ calculette_taux.augmentation_an }}</p>
            </div> -->
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
            <h3 v-if="titre"> {{titre}}</h3>
            <h3 v-else>Evolution de la Valeur selon le taux : </h3>
            <form>
                Annee de Depart :  <input class="input" id="annee_depart"    name="annee_depart"    type="number" step="any" placeholder="Annee de Depart"  v-on:blur="recalc_evol"  v-model.number="calculette_evol.annee_depart"> <br>
                {{valeur}} de Depart : <input class="input" id="val_depart"      name="val_depart"      type="number" step="any" placeholder="Valeur de Depart" v-on:blur="recalc_evol"  v-model.number="calculette_evol.val_depart"> <br>
                Annee d'Arrivee :  <input class="input" id="annee_arrivee"   name="annee_arrivee"   type="number" step="any" placeholder="Annee d'Arrivee"  v-on:blur="recalc_evol"  v-model.number="calculette_evol.annee_arrivee"><br>
                Taux de Croissance Annuel (en %) : <input class="input" id="taux_croissance" name="taux_croissance" type="number" step="any" placeholder="Taux de Croissance" v-on:blur="recalc_evol" v-model.number="calculette_evol.taux_de_croissance"><br>
                <br>
                <div class="columns">
                    <div class="column">
                        <button class="button is-info" v-on:click="recalc_evol()"> {{valeur}} d'Arrivee : {{ calculette_evol.val_arrivee }}</button>
                    </div>
                    <div class="column">
                        <button class="button is-info" v-on:click="reset()"> Reset </button>
                    </div>
                </div>
            </form>
            <br>
            <div class="notification is-success">
                  <p>{{valeur}} en {{ calculette_evol.annee_arrivee }} : {{ calculette_evol.val_arrivee }} </p>
                  <p>Taux de Croissance : {{ calculette_evol.taux_de_croissance }} % / an </p>
            </div>
            <div class="notification is-warning">
                <p>Evolution {{ calculette_evol.annee_depart }} - {{ calculette_evol.annee_arrivee }} : {{ calculette_evol.augmentation }}</p>
                <p>Par an : {{ calculette_evol.augmentation_an }}</p>
            </div>
            <!-- <div class="notification is-danger">
                <p>Par an : {{ calculette_evol.augmentation_an }}</p>
            </div> -->
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
  template: `
    <div  v-if="this.dataset != null">
        <h3 v-if="titre"> {{titre}}</h3>
        <br>
        <h3 class="w3-center" >Les Formules de la Federation des SCoTs (objectif-zan.com) avec les donnees les plus recentes, et pertinentes au territoire.</p>
        <br>
        <div class="columns">
            <div class="column">
                <br>
                <div class="w3-panel w3-hoverable w3-card-4 w3-teal">
                <h2>Estimations basées sur les chiffres de l'Insee :</h2>
                </div>

        <table class="w3-table-all w3-hoverable w3-card-4">
            <tbody>
            <tr class="w3-teal">
                <th height="50" class="w3-left-align  w3-teal">Période d'étude</th>
                <th class="w3-right-align w3-teal">2018</th>
                <th class="w3-right-align w3-teal">2030</th>
                <th class="w3-right-align w3-grey">Variation</th>
            </tr>
            <tr>
                <td height="50" >Population</td>
                <td class="w3-right-align">{{this.ds.oz_population_2018}}</td>
                <td class="w3-right-align">{{this.ds.oz_population_2030}}</td>
                <td class="w3-right-align">{{this.ds.oz_population_variation}}</td>
            </tr>
            <tr>
                <td height="50"> Nombre de personnes par ménage</td>
                <td class="w3-right-align">{{this.ds.oz_tm_2018}}</td>
                <td class="w3-right-align">{{this.ds.oz_tm_2030}}</td>
                <td class="w3-right-align">{{this.ds.oz_tm_variation}}</td>
            </tr>
            <tr>
                <td height="50">Demande potentielle liée : </td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
            </tr>
            <tr>
                <td height="50"><i>- à la croissance démographique</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.oz_dde_croissance_demo}}</td>
            </tr>
            <tr>
                <td height="50"><i>- au desserrement des ménages</i></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.oz_dde_diminution_tm}}</td>
            </tr>
            <tr>
                <td height="50">Parc de logements vacants</td>
                <td class="w3-right-align">{{this.ds.oz_parc_res_vac_2018}}</td>
                <td class="w3-right-align">{{this.ds.oz_parc_res_vac_2030}}</td>
                <td class="w3-right-align">{{this.ds.oz_parc_res_vac_variation}}</td>
            </tr>
            <tr>
                <td height="50">Parc de résidences secondaires</td>
                <td class="w3-right-align">{{this.ds.oz_parc_res_sec_2018}}</td>
                <td class="w3-right-align">{{this.ds.oz_parc_res_sec_2030}}</td>
                <td class="w3-right-align">{{this.ds.oz_parc_res_sec_variation}}</td>
            </tr>
            <tr>
                <td height="50">Désaffectations</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.oz_desaffectations}}</td>
            </tr>
            </tbody>
        </table>
        <br>
        <div class="w3-panel w3-card-4 w3-teal">
            <br>
            <p>Demande potentielle à l'horizon 2030 : {{ this.ds.oz_demande_potentielle }}</p>
            <h2>Votre besoin annuel en logements :     {{ this.ds.oz_demande_annuelle_de_logements }}</h2>
            <br>
        </div>

        <div class="slidecontainer">
          <h1>Objectif de renouvellement urbain</h1>
          <p>Taux en pourcentage : {{this.ds.scen_taux_renouvellement}} %</p>
          <input type="range" min="0" max="100"  class="slider" id="myRange" v-on:blur="recalc" v-on:change="recalc" v-model.value="this.ds.scen_taux_renouvellement">
          <p>Reconversion de friches, dents creuses, transformation de l'existant, sur-élévation...</p>
        </div>
        <div class="slidecontainer">
          <h1>Densité réalisable en extension</h1>
          <p>Logements par hectare :  {{this.ds.scen_log_ha}} </p>
          <input type="range" min="1" max="100"  class="slider" id="myRange" v-on:blur="recalc" v-on:change="recalc" v-model.value="this.ds.scen_log_ha">
          <p>Sélectionnez le niveau de densité représentatif de votre territoire</p>
        </div>

            <div v-if="this.ds.oz_ha_manquant_pour_logements > 0" >
                <div class="w3-red w3-hover-shadow w3-center">
                    <br>
                    <h1>Objectif non atteint sur 10 ans.</h1>
                    <h2>Deficit pour les logements par rapport a l'Objectif ZAN : {{ Math.round(this.ds.oz_ha_manquant_pour_logements*10)/10 }} hectares.</h2>
                    <h2>Densifiez ou Renouvellez plus !</h2>
                    <br>
                </div>
            </div>
            <div v-else class="w3-center">
                <div class="w3-green w3-hover-shadow w3-center">
                    <br>
                    <h1>Objectif atteint sur 10 ans !</h1>
                    <h2>Gain sur l'Objectif ZAN : {{ Math.round(-this.ds.oz_ha_manquant_pour_logements*10)/10 }} hectares.</h2>
                    <h2>Territoire Vertueux !</h2>
                    <br>
                </div>
            </div>

        <br>
        <img src="input/Densite.png" alt="Examples de Densite" class="center" height="250">
        <br>
        <br>
        <div class="columns">
             <div class="column">
                    <table class="w3-table-all w3-hoverable w3-card-4">
                        <tbody>
                        <tr class="w3-teal">
                            <th class="w3-right-align w3-grey">Consommation foncière</th>
                            <th class="w3-right-align w3-grey">Hectares</th>
                        </tr>
                        <tr>
                            <td class="w3-right-align">2009-2018 :</td>
                            <td class="w3-right-align">{{Math.round(this.ds.oz_ha_consommes_ha_zan_historique*10)/10}}</td>
                        </tr>
                        <tr>
                            <td class="w3-right-align">Moyenne Annuelle :</td>
                            <td class="w3-right-align">{{ Math.round(this.ds.oz_ha_consommes_ha_zan_historique)/10 }}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            <div class="column">
                  <table class="w3-table-all w3-hoverable w3-card-4">
                        <tbody>
                        <tr class="w3-teal">
                            <th class="w3-right-align w3-teal">Objectif ZAN</th>
                            <th class="w3-right-align w3-teal">Hectares</th>
                        </tr>
                        <tr>
                            <td class="w3-right-align" >2020-2030 :</td>
                            <td class="w3-right-align" >{{Math.round(this.ds.oz_ha_consommes_ha_zan_2030*10)/10}}</td>
                        </tr>
                        <tr>
                            <td class="w3-right-align" style="text-shadow:1px 1px 0 #444">Moyenne Annuelle :</td>
                            <td class="w3-right-align" style="text-shadow:1px 1px 0 #444">{{ Math.round(this.ds.oz_ha_consommes_ha_zan_par_an*10)/10}}</td>
                        </tr>
                        </tbody>
                    </table>
            </div>
        </div>


        <div v-if="this.ds.oz_ha_manquant_pour_logements > 0" >
              <table class="w3-table-all w3-hoverable w3-card-4">
                    <tbody>
                    <tr class="w3-orange">
                        <th class="w3-right-align ">Objectif non atteint sur 10 ans</th>
                        <th class="w3-right-align ">Ha en 2030</th>
                    </tr>
                    <tr>
                        <td class="w3-right-align" >Enveloppe ZAN disponible :</td>
                        <td class="w3-right-align" >{{Math.round(this.ds.oz_ha_consommes_ha_zan_2030*10)/10}}</td>
                    </tr>
                    <tr>
                        <td class="w3-right-align" >Enveloppe ZAN utilisée :</td>
                        <td class="w3-right-align" >{{Math.round(this.ds.oz_ha_consommes_en_extension*10)/10}}</td>
                    </tr>
                    </tbody>
                </table>
            <br>
            <div class="w3-red w3-hover-shadow w3-center">
                <br>
                <h1>Objectif non atteint sur 10 ans.</h1>
                <h2>Deficit pour les logements par rapport a l'Objectif ZAN : {{ Math.round(this.ds.oz_ha_manquant_pour_logements*10)/10 }} hectares.</h2>
                <h2>Densifiez ou Renouvellez plus !</h2>
                <br>
            </div>
        </div>
        <div v-else class="w3-center">
              <table class="w3-table-all w3-hoverable w3-card-4">
                    <tbody>
                    <tr class="w3-teal">
                        <th class="w3-right-align w3-teal">Objectif atteint sur 10 ans !</th>
                        <th class="w3-right-align w3-teal">Ha en 2030</th>
                    </tr>
                    <tr>
                        <td class="w3-right-align" >Enveloppe ZAN disponible :</td>
                        <td class="w3-right-align" >{{Math.round(this.ds.oz_ha_consommes_ha_zan_2030*10)/10}}</td>
                    </tr>
                    <tr>
                        <td class="w3-right-align" >Enveloppe ZAN utilisée :</td>
                        <td class="w3-right-align" >{{Math.round(this.ds.oz_ha_consommes_en_extension*10)/10}}</td>
                    </tr>
                    </tbody>
                </table>
            <br>
            <div class="w3-green w3-hover-shadow w3-center">
                <br>
                <h1>Objectif atteint sur 10 ans !</h1>
                <h2>Gain sur l'Objectif ZAN : {{ Math.round(-this.ds.oz_ha_manquant_pour_logements*10)/10 }} hectares.</h2>
                <h2>Territoire Vertueux !</h2>
                <br>
            </div>
        </div>


        <div class="w3-panel w3-card-4 w3-teal" style="text-align:justify">
            <br>
            <p>Hectares consommes ces 10 dernieres annees : {{ this.ds.oz_ha_consommes_ha_zan_historique }}</p>
            <p>Hectares disponibles les 10 prochaines annees : {{ this.ds.oz_ha_consommes_ha_zan_2030 }}</p>
            <p>Logements Construits en Renouvellement : {{ this.ds.oz_logement_en_renouvellement }}</p>
            <p>Logements Construits en Extension : {{ this.ds.oz_logement_en_extension }}</p>
            <p>Hectares necessaires en Extension : {{ this.ds.oz_ha_consommes_en_extension }}</p>
            <p>Difference par rapport aux besoins : {{ Math.round(this.ds.oz_ha_manquant_pour_logements*10)/10 }}</p>
            <br>
        </div>

      </div>
         <div class="column">
                <br>
                <div class="w3-panel w3-hoverable w3-card-4 w3-2021-french-blue">
                <h2>Saisir les besoins en logements sur votre territoire :</h2>
                </div>

        <table class="w3-table-all w3-hoverable w3-card-4">
            <tbody>
            <tr class="w3-2021-french-blue">
                <th class="w3-left-align w3-2021-french-blue">Période d'étude</th>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="2000" max="99999999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.oz_scen_an_depart"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="2000" max="99999999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.oz_scen_an_arrivee"></td>
                <th class="w3-right-align w3-grey">Variation</th>
            </tr>
            <tr>
                <td>Population</td>
                <td class="w3-right-align"> <input  type="number" min="0" max="99999999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.oz_scen_pop_depart"></td>
                <td class="w3-right-align"> <input  type="number" min="0" max="99999999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.oz_scen_pop_arrivee"></td>
                <td class="w3-right-align">{{this.ds.oz_scen_population_variation}}</td>
            </tr>
            <tr>
                <td>Personnes par ménage</td>
                <td><input type="number" style="text-align: right;" min="0" max="99999" step="0.01" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.oz_scen_tm_depart"></td>
                <td><input type="number" style="text-align: right;" min="0" max="99999" step="0.01" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.oz_scen_tm_arrivee"></td>
                <td class="w3-right-align">{{this.ds.oz_scen_tm_variation}}</td>
            </tr>
            <tr>
                <td>Demande potentielle liée : </td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
            </tr>
            <tr>
                <td><i>- à la démographique</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.oz_scen_dde_croissance_demo}}</td>
            </tr>
            <tr>
                <td><i>- au desserrement </i></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.oz_scen_dde_diminution_tm}}</td>
            </tr>
            <tr>
                <td>Logements vacants</td>
                <td><input type="number" style="text-align: right;" min="0" max="99999999" v-on:blur="recalc"  v-model.number="this.ds.oz_scen_vac_depart"></td>
                <td><input type="number" style="text-align: right;" min="0" max="99999999" v-on:blur="recalc"  v-model.number="this.ds.oz_scen_vac_arrivee"></td>
                <td class="w3-right-align">{{this.ds.oz_scen_parc_res_vac_variation}}</td>
            </tr>
            <tr>
                <td>Résidences secondaires</td>
                <td><input type="number" style="text-align: right;" min="0" max="99999999" v-on:blur="recalc"  v-model.number="this.ds.oz_scen_sec_depart"></td>
                <td><input type="number" style="text-align: right;" min="0" max="99999999" v-on:blur="recalc"  v-model.number="this.ds.oz_scen_sec_arrivee"></td>
                <td class="w3-right-align">{{this.ds.oz_scen_parc_res_sec_variation}}</td>
            </tr>
            <tr>
                <td>Désaffectations</td>
                <td class="w3-right-align"></td>
                <td><input type="number" style="text-align: right;" min="0" max="99999999" v-on:blur="recalc"  v-model.number="this.ds.oz_scen_desaffectations"></td>
                <td class="w3-right-align">{{this.ds.oz_scen_desaffectations}}</td>
            </tr>
            </tbody>
        </table>
        <br>
        <div class="w3-panel w3-card-4 w3-2021-french-blue">
            <br>
            <p>Demande potentielle à l'horizon {{this.ds.oz_scen_an_arrivee}} : {{ this.ds.oz_scen_demande_potentielle }}</p>
            <h2>Votre besoin annuel en logements :     {{ this.ds.oz_scen_demande_annuelle_de_logements }}</h2>
            <br>
        </div>

        <div class="slidecontainer ">
          <h1>Objectif de renouvellement urbain</h1>
          <p>Taux en pourcentage : {{this.ds.oz_scen_renouvellement}} %</p>
          <input type="range" min="0" max="100"  class="slider" id="myRange" v-on:blur="recalc" v-on:change="recalc" v-model.value="this.ds.oz_scen_renouvellement">
          <p>Reconversion de friches, dents creuses, transformation de l'existant, sur-élévation...</p>
        </div>
        <div class="slidecontainer ">
          <h1>Densité réalisable en extension</h1>
          <p>Logements par hectare :  {{this.ds.oz_scen_log_ha}} </p>
          <input type="range" min="1" max="100"  class="slider" id="myRange" v-on:blur="recalc" v-on:change="recalc" v-model.value="this.ds.oz_scen_log_ha">
          <p>Sélectionnez le niveau de densité représentatif de votre territoire</p>
        </div>

            <div v-if="this.ds.oz_scen_ha_manquant_pour_logements > 0" >
                <div class="w3-red w3-hover-shadow w3-center">
                    <br>
                    <h1>Objectif non atteint sur 10 ans.</h1>
                    <h2>Deficit pour les logements par rapport a l'Objectif ZAN : {{ Math.round(this.ds.oz_scen_ha_manquant_pour_logements*10)/10 }} hectares.</h2>
                    <h2>Densifiez ou Renouvellez plus !</h2>
                    <br>
                </div>
            </div>
            <div v-else class="w3-center">
                <div class="w3-green w3-hover-shadow w3-center">
                    <br>
                    <h1>Objectif atteint sur 10 ans !</h1>
                    <h2>Gain sur l'Objectif ZAN : {{ Math.round(-this.ds.oz_scen_ha_manquant_pour_logements*10)/10 }} hectares.</h2>
                    <h2>Territoire Vertueux !</h2>
                    <br>
                </div>
            </div>
        <br>


        <p align-text="left" ><b>A titre d'exemple : </b></p>
        <img src="input/Densite_3.jpg" alt="Examples de Densite" class="center"  >
        <br>
        <br>

        <div class="columns">
             <div class="column">
                    <table class="w3-table-all w3-hoverable w3-card-4">
                        <tbody>
                        <tr class="w3-teal">
                            <th class="w3-right-align w3-grey">Consommation foncière</th>
                            <th class="w3-right-align w3-grey">Hectares</th>
                        </tr>
                        <tr>
                            <td class="w3-right-align">2009-2018 :</td>
                            <td class="w3-right-align">{{Math.round(this.ds.oz_ha_consommes_ha_zan_historique*10)/10}}</td>
                        </tr>
                        <tr>
                            <td class="w3-right-align">Moyenne Annuelle :</td>
                            <td class="w3-right-align">{{ Math.round(this.ds.oz_ha_consommes_ha_zan_historique)/10 }}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            <div class="column">
                  <table class="w3-table-all w3-hoverable w3-card-4">
                        <tbody>
                        <tr class="w3-teal">
                            <th class="w3-right-align w3-teal">Objectif ZAN</th>
                            <th class="w3-right-align w3-teal">Hectares</th>
                        </tr>
                        <tr>
                            <td class="w3-right-align" >2020-2030 :</td>
                            <td class="w3-right-align" >{{Math.round(this.ds.oz_scen_ha_consommes_ha_zan_2030*10)/10}}</td>
                        </tr>
                        <tr>
                            <td class="w3-right-align" style="text-shadow:1px 1px 0 #444">Moyenne Annuelle :</td>
                            <td class="w3-right-align" style="text-shadow:1px 1px 0 #444">{{ Math.round(this.ds.oz_scen_ha_consommes_ha_zan_par_an*10)/10}}</td>
                        </tr>
                        </tbody>
                    </table>
            </div>
        </div>


            <div v-if="this.ds.oz_scen_ha_manquant_pour_logements > 0" >
                  <table class="w3-table-all w3-hoverable w3-card-4">
                        <tbody>
                        <tr class="w3-orange">
                            <th class="w3-right-align ">Objectif non atteint sur 10 ans</th>
                            <th class="w3-right-align ">Ha en 2030</th>
                        </tr>
                        <tr>
                            <td class="w3-right-align" >Enveloppe ZAN disponible :</td>
                            <td class="w3-right-align" >{{Math.round(this.ds.oz_scen_ha_consommes_ha_zan_2030*10)/10}}</td>
                        </tr>
                        <tr>
                            <td class="w3-right-align" >Enveloppe ZAN utilisée :</td>
                            <td class="w3-right-align" >{{Math.round(this.ds.oz_scen_ha_consommes_en_extension*10)/10}}</td>
                        </tr>
                        </tbody>
                    </table>
                <br>
                <div class="w3-red w3-hover-shadow w3-center">
                    <br>
                    <h1>Objectif non atteint sur 10 ans.</h1>
                    <h2>Deficit pour les logements par rapport a l'Objectif ZAN : {{ Math.round(this.ds.oz_scen_ha_manquant_pour_logements*10)/10 }} hectares.</h2>
                    <h2>Densifiez ou Renouvellez plus !</h2>
                    <br>
                </div>
            </div>
            <div v-else class="w3-center">
                  <table class="w3-table-all w3-hoverable w3-card-4">
                        <tbody>
                        <tr class="w3-teal">
                            <th class="w3-right-align w3-2021-french-blue">Objectif atteint sur 10 ans !</th>
                            <th class="w3-right-align w3-2021-french-blue">Ha en 2030</th>
                        </tr>
                        <tr>
                            <td class="w3-right-align" >Enveloppe ZAN disponible :</td>
                            <td class="w3-right-align" >{{Math.round(this.ds.oz_scen_ha_consommes_ha_zan_2030*10)/10}}</td>
                        </tr>
                        <tr>
                            <td class="w3-right-align" >Enveloppe ZAN utilisée :</td>
                            <td class="w3-right-align" >{{Math.round(this.ds.oz_scen_ha_consommes_en_extension*10)/10}}</td>
                        </tr>
                        </tbody>
                    </table>
                <br>
                <div class="w3-green w3-hover-shadow w3-center">
                    <br>
                    <h1>Objectif atteint sur 10 ans !</h1>
                    <h2>Gain sur l'Objectif ZAN : {{ Math.round(-this.ds.oz_scen_ha_manquant_pour_logements*10)/10 }} hectares.</h2>
                    <h2>Territoire Vertueux !</h2>
                    <br>
                </div>
            </div>

        <div class="w3-panel w3-card-4 w3-2021-french-blue" style="text-align:justify">
            <br>
            <p>Hectares consommes ces 10 dernieres annees : {{ this.ds.oz_ha_consommes_ha_zan_historique }}</p>
            <p>Hectares disponibles les 10 prochaines annees : {{ this.ds.oz_ha_consommes_ha_zan_2030 }}</p>
            <p>Logements Construits en Renouvellement : {{ this.ds.oz_scen_logement_en_renouvellement }}</p>
            <p>Logements Construits en Extension : {{ this.ds.oz_scen_logement_en_extension }}</p>
            <p>Hectares necessaires en Extension : {{ this.ds.oz_scen_ha_consommes_en_extension }}</p>
            <p>Difference par rapport aux besoins : {{ Math.round(this.ds.oz_scen_ha_manquant_pour_logements*10)/10 }} hectares</p>
            <br>
        </div>


         </div>
      </div>
        <br>


        <div class="columns">
             <div class="column">
        </div>
             <div class="column">
            </div>
        </div>

    </div>
  `
})

vm.component('michel-ozan', {
    data() {
        console.log("michel-ozan data")
        return {
            dataset : g_data_s,
            loaded : 0 ,
            titre : "L'outil ultime pour valider l'Objectif Zero Artificialisation Nette sur votre Territoire." ,
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
  template: `
    <div  v-if="this.dataset != null">
        <h3 v-if="titre"> {{titre}}</h3>
        <br>
        <h1 class="w3-center" >Les Formules de Michel !</h1>
        <br>

        <table class="w3-table-all w3-hoverable w3-card-4">
            <tbody>
            <tr class="w3-teal">
                <th height="50" class="w3-left-align  w3-teal">Etapes</th>
                <th height="50" class="w3-right-align  w3-teal">Taux</th>
                <th height="50" class="w3-right-align  w3-teal">{{this.ds.michel_an_donnee}}</th>
                <th class="w3-right-align w3-teal">{{this.ds.michel_an_depart}}</th>
                <th class="w3-right-align w3-teal">{{this.ds.michel_an_arrivee}}</th>
                <th class="w3-right-align w3-grey">Variation</th>
            </tr>
            <tr>
                <td height="50" >0 - Dates</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.michel_an_donnee}}</td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="2000" max="2050" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_an_depart"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="2050" max="2050" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_an_arrivee"></td>
                <td class="w3-right-align">{{this.ds.michel_duree}}</td>
            </tr>
            <tr>
                <td height="50" >1 - Population</td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="-10" max="10" step="0.001"  style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_pop_taux"></td>
                <td class="w3-right-align">{{this.ds.P18_POP}}</td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="9999999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_pop_depart"></td>
                <td class="w3-right-align">{{this.ds.michel_pop_arrivee}}</td>
                <td class="w3-right-align">{{this.ds.michel_pop_arrivee - this.ds.michel_pop_depart}}</td>
            </tr>
            <tr>
                <td height="50" >2.0 - Besoins en Logements</td>
            </tr>
            <tr>
                <td height="50" >2.1 - Population hors Ménages</td>
                <td class="w3-right-align">{{((this.ds.C18_HORS_MEN/this.ds.P18_POP)*100).toFixed(1)}}%</td>
                <td class="w3-right-align">{{this.ds.C18_HORS_MEN}}</td>
                <td class="w3-right-align w3-2021-french-blue"> {{((this.ds.michel_pop_hm_depart/this.ds.michel_pop_depart)*100).toFixed(1)}}% - <input  type="number" min="0" max="9999999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_pop_hm_depart"></td>
                <td class="w3-right-align w3-2021-french-blue"> {{((this.ds.michel_pop_hm_arrivee/this.ds.michel_pop_arrivee)*100).toFixed(1)}}% - <input  type="number" min="0" max="9999999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_pop_hm_arrivee"></td>
                <td class="w3-right-align">{{this.ds.michel_pop_hm_delta}}</td>
            </tr>
            <tr>
                <td height="50" >2.2 - Population des Ménages</td>
                <td class="w3-right-align">{{this.ds.michel_pop_taux}}</td>
                <td class="w3-right-align">{{this.ds.C18_MEN}}</td>
                <td class="w3-right-align">{{this.ds.michel_pop_men_depart}}</td>
                <td class="w3-right-align">{{this.ds.michel_pop_men_arrivee}}</td>
                <td class="w3-right-align">{{this.ds.michel_pop_men_delta}}</td>
            </tr>
            <tr>
                <td height="50" >2.3 - Taille des Ménages</td>
                <td class="w3-right-align">{{this.ds.michel_tm_tendance_5_ans}}</td>
                <td class="w3-right-align">{{this.ds.TM_2018}}</td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="1" max="5" step="0.001" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_tm_depart"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="1" max="5" step="0.001" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_tm_arrivee"></td>
                <td class="w3-right-align">{{this.ds.michel_tm_delta}}</td>
            </tr>
            <tr>
                <td height="50" >2.4 - Résidences Principales</td>
                <td class="w3-right-align">{{this.ds.michel_tx_rp_an_donnee *100}}%</td>
                <td class="w3-right-align">{{this.ds.C18_MEN}}</td>
                <td class="w3-right-align">{{((this.ds.michel_rp_depart/this.ds.michel_log_depart)*100).toFixed(1)}}% - {{this.ds.michel_rp_depart}}</td>
                <td class="w3-right-align">{{((this.ds.michel_rp_arrivee/this.ds.michel_log_arrivee)*100).toFixed(1)}}% - {{this.ds.michel_rp_arrivee}}</td>
                <td class="w3-right-align">{{this.ds.michel_rp_delta}}</td>
            </tr>
            <tr>
                <td height="50" >3 - Residences Secondaires</td>
                <td class="w3-right-align">{{this.ds.michel_tx_rs_an_donnee *100}}%</td>
                <td class="w3-right-align">{{this.ds.P18_RSECOCC}}</td>
                <td class="w3-right-align w3-2021-french-blue"> {{((this.ds.michel_rs_depart/this.ds.michel_log_depart)*100).toFixed(1)}}% <input  type="number" min="0" max="9999999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_rs_depart"></td>
                <td class="w3-right-align w3-2021-french-blue"> {{((this.ds.michel_rs_arrivee/this.ds.michel_log_arrivee)*100).toFixed(1)}}% <input  type="number" min="0" max="9999999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_rs_arrivee"></td>
                <td class="w3-right-align">{{this.ds.michel_rs_delta}}</td>
            </tr>
            <tr>
                <td height="50" >4 - Residences Vacantes</td>
                <td class="w3-right-align">{{this.ds.michel_tx_rv_an_donnee *100}}% </td>
                <td class="w3-right-align">{{this.ds.P18_LOGVAC}}</td>
                <td class="w3-right-align w3-2021-french-blue"> {{((this.ds.michel_rv_depart/this.ds.michel_log_depart)*100).toFixed(1)}}% <input  type="number" min="0" max="9999999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_rv_depart"></td>
                <td class="w3-right-align w3-2021-french-blue"> {{((this.ds.michel_rv_arrivee/this.ds.michel_log_arrivee)*100).toFixed(1)}}% <input  type="number" min="0" max="9999999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_rv_arrivee"></td>
                <td class="w3-right-align">{{this.ds.michel_rv_delta}}</td>
            </tr>
            <tr>
                <td height="50" >4.1- Parc Total de Logements</td>
                <td class="w3-right-align">100.0%</td>
                <td class="w3-right-align">{{this.ds.log_2018}}</td>
                <td class="w3-right-align">{{this.ds.michel_log_depart}}</td>
                <td class="w3-right-align">{{this.ds.michel_log_arrivee}}</td>
                <td class="w3-right-align">{{this.ds.michel_log_delta}}</td>
            </tr>
            <tr>
                <th height="50" >4.2- Besoins en Logements</th>
                <td class="w3-right-align"></td>
                <th class="w3-right-align">{{this.ds.michel_log_delta}}</th>
                <th class="w3-left-align">Logements</th>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
            </tr>
            </tbody>
        </table>

        <table class="w3-table-all w3-hoverable w3-card-4">
            <tbody>
            <tr>
                <th class="w3-teal" height="50" >Renouvellement du Parc</th>
                <th class="w3-right-align w3-teal"></th>
                <th class="w3-right-align w3-teal"></th>
                <th class="w3-right-align w3-teal"></th>
                <th class="w3-right-align w3-teal">Evolution du Parc</th>
                <th class="w3-right-align w3-teal">Construits </th>
                <th class="w3-right-align w3-teal">Renouvellement</th>
            </tr>
            <tr>
                <td height="50" >5.0 - Renouvellement du Parc (sur 2013-2018)</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">Evolution {{this.ds.michel_evolution_parc_5_ans}}</td>
                <td class="w3-right-align">Construits {{this.ds.michel_construits_5_ans}}</td>
                <td class="w3-right-align">{{this.ds.michel_renouvellement_5_ans}}</td>
            </tr>
            <tr>
                <td height="50" >5.1 - Renouvellement annuel futur ({{this.ds.michel_an_depart}} - {{this.ds.michel_an_arrivee}}) :</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align w3-2021-french-blue"> (en %) <input  type="number" min="0" max="099" step="0.001" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_renouvellement_taux"></td>
                <td class="w3-right-align">En nombre (par an) : </td>
                <td class="w3-right-align">{{this.ds.michel_renouvellement_nombre_an}}</td>
            </tr>
            <tr>
                <td height="50" >5.2 - Renouvellement a terme</td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align">{{this.ds.michel_renouvellement_arrivee}}</td>
            </tr>
            <tr>
                <th height="50" >5.3 - Besoin en logements sur foncier vierge:</th>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <th class="w3-right-align">{{this.ds.michel_besoin_logements_sur_foncier_vierge}}</th>
                <th class="w3-left-align">Logements</th>
                <td class="w3-right-align"></td>
            </tr>
            </tbody>
        </table>

        <table class="w3-table-all w3-hoverable w3-card-4">
            <tbody>
            <tr class="w3-teal">
                <th height="50" class="w3-left-align  w3-teal">Zonage</th>
                <th class="w3-right-align w3-teal">Zone 1</th>
                <th class="w3-right-align w3-teal">Zone 2</th>
                <th class="w3-right-align w3-teal">Zone 3</th>
                <th class="w3-right-align w3-teal">Zone 4</th>
                <th class="w3-right-align w3-teal">Zone 5</th>
                <th class="w3-right-align w3-teal">Zone 6</th>
                <th class="w3-right-align w3-teal">Total</th>
            </tr>
            <tr>
                <td height="50" >6a - Répartition des logts au depart (en % - pour information)</td>
                <td class="w3-right-align w3-2021-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_6a_repartition_log_N1"></td>
                <td class="w3-right-align w3-2021-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_6a_repartition_log_N2"></td>
                <td class="w3-right-align w3-2021-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_6a_repartition_log_N3"></td>
                <td class="w3-right-align w3-2021-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_6a_repartition_log_N4"></td>
                <td class="w3-right-align w3-2021-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_6a_repartition_log_N5"></td>
                <td class="w3-right-align w3-2021-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_6a_repartition_log_N6"></td>
                <td class="w3-right-align">{{this.ds.michel_6a_repartition_log_Total}}</td>
            </tr>
            <tr>
                <td height="50" >6b - Répartition des nouveaux logts  (en %)</td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_6b_repartition_nouv_log_N1"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_6b_repartition_nouv_log_N2"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_6b_repartition_nouv_log_N3"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_6b_repartition_nouv_log_N4"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_6b_repartition_nouv_log_N5"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_6b_repartition_nouv_log_N6"></td>
                <td class="w3-right-align">{{this.ds.michel_6b_repartition_nouv_log_Total}}</td>
            </tr>
            <tr>
                <td height="50" >6c - Répartition des besoins en logts (en nombre)</td>
                <td class="w3-right-align">{{this.ds.michel_6c_repartition_besoins_log_N1}}</td>
                <td class="w3-right-align">{{this.ds.michel_6c_repartition_besoins_log_N2}}</td>
                <td class="w3-right-align">{{this.ds.michel_6c_repartition_besoins_log_N3}}</td>
                <td class="w3-right-align">{{this.ds.michel_6c_repartition_besoins_log_N4}}</td>
                <td class="w3-right-align">{{this.ds.michel_6c_repartition_besoins_log_N5}}</td>
                <td class="w3-right-align">{{this.ds.michel_6c_repartition_besoins_log_N6}}</td>
                <td class="w3-right-align">{{this.ds.michel_6c_repartition_besoins_log_Total}}</td>
            </tr>
            <tr>
                <td height="50" >7a - Possibilité de Densification (logts en nombre) </td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_7a_densification_N1"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_7a_densification_N2"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_7a_densification_N3"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_7a_densification_N4"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_7a_densification_N5"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_7a_densification_N6"></td>
                <td class="w3-right-align">{{this.ds.michel_7a_densification_Total}}</td>
            </tr>
            <tr>
                <td height="50" >7b - Constructions en Extension (en nombre)</td>
                <td class="w3-right-align">{{this.ds.michel_7b_extension_N1}}</td>
                <td class="w3-right-align">{{this.ds.michel_7b_extension_N2}}</td>
                <td class="w3-right-align">{{this.ds.michel_7b_extension_N3}}</td>
                <td class="w3-right-align">{{this.ds.michel_7b_extension_N4}}</td>
                <td class="w3-right-align">{{this.ds.michel_7b_extension_N5}}</td>
                <td class="w3-right-align">{{this.ds.michel_7b_extension_N6}}</td>
                <td class="w3-right-align">{{this.ds.michel_7b_extension_Total}}</td>
            </tr>
            <tr>
                <td height="50" >8a - Densite Nette en Log/Ha</td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_8a_densite_nette_N1"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_8a_densite_nette_N2"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_8a_densite_nette_N3"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_8a_densite_nette_N4"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_8a_densite_nette_N5"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="999" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_8a_densite_nette_N6"></td>
                <td class="w3-right-align">{{this.ds.michel_8a_densite_nette_Total}}</td>
            </tr>
            <tr>
                <td height="50" >8b - Surface Nette en Extension (Ha)</td>
                <td class="w3-right-align">{{this.ds.michel_8b_surface_nette_N1}}</td>
                <td class="w3-right-align">{{this.ds.michel_8b_surface_nette_N2}}</td>
                <td class="w3-right-align">{{this.ds.michel_8b_surface_nette_N3}}</td>
                <td class="w3-right-align">{{this.ds.michel_8b_surface_nette_N4}}</td>
                <td class="w3-right-align">{{this.ds.michel_8b_surface_nette_N5}}</td>
                <td class="w3-right-align">{{this.ds.michel_8b_surface_nette_N6}}</td>
                <td class="w3-right-align">{{this.ds.michel_8b_surface_nette_Total}}</td>
            </tr>
            <tr>
                <td height="50" >8c - Rajout Equipements (en %)</td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_8c_surface_equipements_N1"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_8c_surface_equipements_N2"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_8c_surface_equipements_N3"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_8c_surface_equipements_N4"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_8c_surface_equipements_N5"></td>
                <td class="w3-right-align w3-2021-french-blue"> <input  type="number" min="0" max="099" style="text-align: right;" v-on:blur="recalc" v-on:change="recalc" v-model.number="this.ds.michel_8c_surface_equipements_N6"></td>
                <td class="w3-right-align">{{this.ds.michel_8c_surface_equipements_Total}}</td>
            </tr>
            <tr>
                <td height="50" >8c - Rajout Equipements en surface (Ha)</td>
                <td class="w3-right-align">{{this.ds.michel_8c2_surface_equipements_N1}}</td>
                <td class="w3-right-align">{{this.ds.michel_8c2_surface_equipements_N1}}</td>
                <td class="w3-right-align">{{this.ds.michel_8c2_surface_equipements_N3}}</td>
                <td class="w3-right-align">{{this.ds.michel_8c2_surface_equipements_N4}}</td>
                <td class="w3-right-align">{{this.ds.michel_8c2_surface_equipements_N5}}</td>
                <td class="w3-right-align">{{this.ds.michel_8c2_surface_equipements_N6}}</td>
                <td class="w3-right-align">{{this.ds.michel_8c2_surface_equipements_Total}}</td>
            </tr>
            <tr>
                <td height="50" >8d - Hectares nécessaires (Ha)</td>
                <td class="w3-right-align">{{this.ds.michel_8d_hectares_necessaires_N1}}</td>
                <td class="w3-right-align">{{this.ds.michel_8d_hectares_necessaires_N2}}</td>
                <td class="w3-right-align">{{this.ds.michel_8d_hectares_necessaires_N3}}</td>
                <td class="w3-right-align">{{this.ds.michel_8d_hectares_necessaires_N4}}</td>
                <td class="w3-right-align">{{this.ds.michel_8d_hectares_necessaires_N5}}</td>
                <td class="w3-right-align">{{this.ds.michel_8d_hectares_necessaires_N6}}</td>
                <td class="w3-right-align">{{this.ds.michel_8d_hectares_necessaires_Total}}</td>
            </tr>
            <tr>
                <th height="50" >8e - Foncier nécessaire (Ha)</th>
                <th class="w3-right-align">{{this.ds.michel_8d_hectares_necessaires_Total}}</th>
                <th class="w3-left-align">Hectares</th>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
                <td class="w3-right-align"></td>
            </tr>
            </tbody>
        </table>

        <div class="w3-panel w3-card-4 w3-teal w3-center">
            <br>
            <h1>{{ this.ds.michel_8e_message_sobriete }}</h1>
            <br>
            <h2>Votre niveau de sobriété fonciere    :  {{ this.ds.michel_8d_niveau_sobriete }}%</h2>
            <br>
            <p>Consommation Fonciere passée en 10 ans : {{ this.ds.michel_8a_consomation_cerema_10_ans }} ha</p>
            <p>Consommation Fonciere passée annuelle :  {{ this.ds.michel_8b_consomation_cerema_annuelle }} ha</p>
            <p>Consommation Fonciere future annuelle :  {{ this.ds.michel_8c_consomation_prevue_annuelle }} ha</p>
            <br>
        </div>


    </div>
  `
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
                    Lutte en % / 10 ans contre les Residences Secondaires :  <input class="input" id="lutte_secondaire" name="lutte_secondaire" type="number" step="any" placeholder="Diminution Des Residences Secondaire en % sur 10 ans"  v-on:blur="recalc"  v-model.number="scen1.lutte_secondaire"> <br>
                    Evolution de la Taille de Menages, en % / an :           <input class="input" id="evol_tm"          name="evol_tm"          type="number" step="any" placeholder="Evolution de la Taille de Menages, en % / an"          v-on:blur="recalc"  v-model.number="scen1.evol_tm"> <br>
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
                <p> Diminution Des Residences Vacantes en % sur 10 ans :   -{{this.ds.scen_lutte_vacance}}%    </p>
                <p> Diminution Des Residences Secondaire en % sur 10 ans : -{{this.ds.scen_lutte_secondaire}}% </p>
                <p> Evolution de la Taille de Menages, en % / an :          {{this.ds.scen_evol_tm}}% </p>
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
                    Lutte en % / 10 ans contre les Residences Secondaires :  <input readonly class="input" id="lutte_secondaire" name="lutte_secondaire" type="number" step="any" placeholder="Diminution Des Residences Secondaire en % sur 10 ans"  v-on:blur="recalc"  v-model.number="scen0.lutte_secondaire"> <br>
                    Evolution de la Taille de Menages, en % / an :           <input readonly class="input" id="evol_tm"          name="evol_tm"          type="number" step="any" placeholder="Evolution de la Taille de Menages, en % / an"          v-on:blur="recalc"  v-model.number="scen0.evol_tm"> <br>
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
                <td>Population des Menages</td>
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
                <td>Nombre de Menages</td>
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
                <td>Taille des Menages</td>
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
                <td>Population Hors Menages</td>
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
                <td>Taux Hors Menages</td>
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
                <td>Residences Principales</td>
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
                <td><i>- Lie au desserement des menages</i></td>
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
                <td>Residences Secondaires</td>
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
                <td><b>Evolution des Residences Secondaires et de la Vacance</b></td>
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
                <td class="w3-right-align w3-tooltip"> Excedents de Logements en 2030 :<span class="w3-text w3-tag w3-round-xlarge w3-small"><em>au dela des taux previsionnels de la vacances et des residences secondaires</em></span></td>
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

vm.component('calculette-color', {
  props: ['titre' , 'valeur', 'val_depart', 'annee_depart', 'val_arrivee', 'annee_arrivee', 'taux_de_croissance'   ],
    data() {
        return {
                loan: {
                  principal: 300000,
                  interest: .0299,
                  compoundingEvery: 12,
                  timeYears: 15,
                  payment: 0,
                  total: 0,
                  totalInterest: 0,
                  l: 0,
                  r: 0 }
            }
      },
    methods : {
            calc: function () {
              this.loan.l = this.loan.principal * (1 + this.loan.interest / this.loan.compoundingEvery) ** (this.loan.compoundingEvery * this.loan.timeYears);
              this.loan.r = ((1 + this.loan.interest / this.loan.compoundingEvery) ** (this.loan.compoundingEvery * this.loan.timeYears) - 1) / (this.loan.interest / this.loan.compoundingEvery);
              this.loan.payment = Math.round(this.loan.l / this.loan.r * 100) / 100;
              this.loan.total = Math.round(this.loan.payment * this.loan.compoundingEvery * this.loan.timeYears * 100) / 100;
              this.loan.totalInterest = Math.round((this.loan.total - this.loan.principal) * 100) / 100;
            },
            formatPrice(value) {
              let val = (value / 1).toFixed(2);
              return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
      },
  template: `
<section class="hero is-info">
<div class="hero-body">
    <div class="container">
      <h1 class="title">
        Evaluez les besoins en logements de votre territoire !
      </h1>
      <h2 class="subtitle">
        par France Nature Environement & le Gadseca
      </h2>
    </div>
  </div>
</section>
<div class="container">
    <p class="ins">
    Enter your values to see your monthly payment, and grand total, and interest paid.
    </p>
      <div class="columns">
        <div class="column">
            <label>Principal Loan Amount</label>
            <input class="input" type="number" v-on:blur="calc" v-model.number="loan.principal">
        </div>
        <div class="column">
            <label>Interest Rate</label>
            <input class="input" type="text" v-on:blur="calc" v-model.number="loan.interest">
        </div>
        <div class="column">
            <label>Time in Years</label>
            <input class="input" type="number" v-on:blur="calc" v-model.number="loan.timeYears">
        </div>
        <div class="column">
            <label>Compounded (months)</label>
            <input class="input" type="number" v-on:blur="calc" v-model.number="loan.compoundingEvery">
        </div>
      </div>
    <button class="button is-info" v-on:click="calc">Compute</button>

    <div class="columns">
      <div class="column">
        <div class="notification is-success">
          <h3>Monthly Payment</h3>
          <p>{{ formatPrice(loan.payment) }}</p>
        </div>
      </div>
      <div class="column">
        <div class="notification is-warning">
        <h3>Grand Total</h3>
        <p>{{ formatPrice(loan.total) }}</p>
        </div>
      </div>
      <div class="column">
        <div class="notification is-danger">
        <h3>Total Interest</h3>
        <p>{{ formatPrice(loan.totalInterest) }}</p>
        </div>
      </div>
</div>

<div class="notification">
<h2 class="title">
  Compound Interest Formula
</h2>
<p>
    principal ( 1 + <sup>interest </sup> / <sub> compounded </sub>)
    <sup>compounded * time </sup> =
    <sup>payment [ ( 1 + <sup>interest</sup> / <sub> compounded </sub>) <sup>compounded * time</sup> - 1 ] </sup> / <sub> <sup>interest</sup> / <sub> compounded </sub> </sub>
</p>
<p>
    {{ loan.principal }} ( 1 + <sup>{{ loan.interest }}</sup> / <sub> {{ loan.compoundingEvery }} </sub>)
    <sup>{{ loan.compoundingEvery }} * {{ loan.timeYears }}</sup> =
    <sup>payment [ ( 1 + <sup>{{ loan.interest }}</sup> / <sub> {{ loan.compoundingEvery }} </sub>) <sup>{{ loan.compoundingEvery }} * {{ loan.timeYears }}</sup> - 1 ] </sup> / <sub> <sup>{{ loan.interest }}</sup> / <sub> {{ loan.compoundingEvery }} </sub> </sub>
    <br>
    {{ loan.l }} = payment( {{ loan.r }} )
    <br>
    {{ loan.payment }} = payment
</p>
</div>
</div>
`
})

vm.component('rapport-iframe', {
    props:['url'],
    data(){
        return {
            url :'output/DEPT_Alpes-Maritimes_06.html',
        }
    },
    methods:{
        updatePage(page){
            // page = "output/"+entity+".html" ;
            console.log("updatePage "+page);
            this.url = page
        }
    },
    template: '<iframe class="w3-container" :src="url"  height="1200" />'
});

vm.mount('#app');

function onPageLoaded() {
  const queryString = window.location.search;
  console.log("onPageLoaded : " + queryString);
}

function onPageLoadedBuggy() {
  const queryString = window.location.search;
  console.log("onPageLoaded : " + queryString);
  const urlParams = new URLSearchParams(queryString);
  // "output/DEPT_Alpes-Maritimes_06.html"
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
  if (code_postal != null) { code_insee = commune    ; type_entity="COMMUNE"} ;

  if (type_entity == "DEPT") {
        // Locate Dept in France JSON
        depts            = select["REGIONS"][0]["DEPARTEMENTS"];
        dept_index       = depts.findIndex(x => x.INSEE === code_insee);
        console.log("DEPT : " + depts[dept_index]);
        nom_dept         = depts[dept_index].Nom;
        console.log("DEPT : " + nom_dept);
    } ;
  if (type_entity == "EPCI") {
        // Locate EPCI in France JSON
        depts            = select["REGIONS"][0]["DEPARTEMENTS"];
        for (let i = 0; i < select["REGIONS"][0]["DEPARTEMENTS"].length; i++) {
            dept = select["REGIONS"][0]["DEPARTEMENTS"][i]
            for (let j = 0; i < dept["EPCI"].length; j++) {
                if (dept["EPCI"][j].INSEE === code_insee ) {
                    }
                    nom_epci = dept["EPCI"][j].Nom ;
                }
            this.selectCommunes.push(commune);
            }
        console.log("EPCI : " + nom_epci);
    } ;

  var entity = urlParams.get('ENTITE')
  if (entity == null) { init_page = "DEPT_Alpes-Maritimes_06" } ;
  entity =  "output/"+init_page+".html";
  console.log(entity);
  console.log("Page is loaded");
  // alert("Page is loaded : " + init_page);
}


