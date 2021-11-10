
$.ajaxSetup({ async: false });
g_data_s = null;

function evalInContext(scr, context) {
   js_expr = pythonToJaveScript(scr);
   // execute script in private context
   return (new Function("with(this) { return " + js_expr + "}")).call(context);
}

function pythonToJaveScript(expr) {
    // let re = import('re');
    new_expr = expr.replace("TRUE", "true");
    new_expr = new_expr.replace("FALSE", "false");
    new_expr = new_expr.replace("True", "true");
    new_expr = new_expr.replace("False", "false");
    new_expr = new_expr.replace(/\${([A-Z0-9a-z-_]*)}/g, '$1');
    return new_expr
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
        var taux_croissance = taux_croissance.toFixed(rounding)
        return taux_croissance
}

function calc_after(annee_depart, val_depart, annee_arrivee, taux_croissance, rounding) {

        // Retourne l'after )) : P1 = P0 x ( 1 + T/100) puissance N """
        // annee = annee_arrivee - annee_depart
        // val_arrivee = val_depart * (1 + taux_croissance / 100) ** annee
        // return round0(val_arrivee, rounding)

        // self.assertEqual(100.1,   calc_after(2000, 100, 2001, 0.1,  rounding=3))
        // self.assertEqual(100.2,   calc_after(2000, 100, 2002, 0.1,  rounding=3))

        var annee = annee_arrivee - annee_depart ;
        var val_arrivee = val_depart * Math.pow((1 + taux_croissance / 100), annee);
        var val_arrivee = val_arrivee.toFixed(rounding);
        return val_arrivee ;
}




// REGIONS / DEPARTEMENTS / EPCI / COMMUNES
// REGIONS / DEPARTEMENTS / COMMUNES
var france = {}; // Les Donnees des Communes, Dept, Etc
$.getJSON("output/france.json", function(json)       { france = json ; console.log(json); }); // Info in console

// REGIONS                + [COMMUNES_CODES] [EPCIS_CODES] [DEPARTEMENTS_CODES]
// List of [DEPARTEMENTS] + [COMMUNES_CODES] [EPCIS_CODES]
// List of [EPCIS]        + [COMMUNES_CODES]
// List of [COMMUNES]
var select = {}; // Les Donnees des Communes, Dept, Etc
$.getJSON("output/select.json", function(json)       { select = json ; console.log(json); }); // Info in console

var s_diagnostics = {}; // Les Diagnostics
$.getJSON("output/diagnostics.json", function(json)  { s_diagnostics = json ; console.log(json); }); // Info in console
var s_calculs     = {}; // Les calculs
$.getJSON("output/calculations.json", function(json) { s_calculs = json ; console.log(json); }); // Info in console
var s_graphs     = {}; // Les graphiques
$.getJSON("input/plots.json", function(json)         { s_graphs = json  ; console.log(json); }); // Info in console


const vm = Vue.createApp({
    emits: ['updatePage'],
    data() {
        return {
            message    : "Selectionner un Territoire :" ,
            territoire : "Departement",         // Type of entity
            nom        : "Alpes-Maritimes",     // Name of entity
            code       : "06" ,                 // INSEE Code of entity
            entity     : "DEPT_Alpes-Maritimes_06",             // Entity Base File Name
            page       : "output/DEPT_Alpes-Maritimes_06.html", // Page of entity (not used in the future)
            data_h     : null , // Data of Entities in France File (used for header / selection)
            data_s     : null , // Data of Entity - Summary
            ds         : null , // Data of Entity (Total)
            data       : null , // Data of Entity (By Key)
            regions    : [ // Regions (Currently not used)
               { id: 1, num : '93' , nom : 'Provence Alpes Cote d Azur'        , entity : 'REGION_Provence_Alpes_Cote_d_Azur_93' }
               ],
            depts      : [ // Departements of current Region (Currently Only PACA)
               { id: 1, num : '04' , nom : 'Alpes-de-Haute-Provence'           , entity : 'DEPT_Alpes-de-Haute-Provence_04' },
               { id: 2, num : '05' , nom : 'Hautes-Alpes'                      , entity : 'DEPT_Hautes-Alpes_05' },
               { id: 3, num : '06' , nom : 'Alpes-Maritimes'                   , entity : 'DEPT_Alpes-Maritimes_06' },
               { id: 4, num : '13' , nom : 'Bouches-du-Rhône'                  , entity : 'DEPT_Bouches-du-Rhone_13' },
               { id: 5, num : '83' , nom : 'Var'                               , entity : 'DEPT_Var_83' },
               { id: 6, num : '84' , nom : 'Vaucluse'                          , entity : 'DEPT_Vaucluse_84' }
               ],
            epcis      : [], // EPCIs of current Region / Departement
            communes   : [], // Communes of current Departement / EPCIs
            val_depart : 0,
            calculette_evol : { val_depart : 0 , val_arrivee : 0 , annee_depart : 2020  , annee_arrivee : 2030 , taux_de_croissance : 0 },
            calculette_taux : { val_depart : 0 , val_arrivee : 0 , annee_depart : 2020  , annee_arrivee : 2030 , taux_de_croissance : 0 },
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
        loadData(){
            console.log("loadData : "+this.entity);
            $.ajaxSetup({ async: false });
            json_s = "output/"+this.entity+"_s.json";
            console.log("json_s : "+json_s);
            this.data_s  = null ;
            this.ds      = null ;
            this.data    = null ;
            this.diag    = null ;
            g_data_s     = null ;
            $.getJSON(json_s, function(json) { g_data_s = json ; console.log(g_data_s) });
            console.log(g_data_s);
            this.data_s = g_data_s;
            this.ds     = this.data_s.total;
            this.data   = this.data_s.Data;
            this.diag   = this.data_s.Diagnostics;
            console.log("> this.data_s : ");
            console.log(this.data_s);
            console.log(this.ds);
            console.log(this.ds.LIBELLE);
            console.log("Done loadData : "+this.entity);
            this.run_calculs();
            this.run_diagnostics();
            this.calculette_evol.val_depart    = this.ds.POP_2020
            this.calculette_evol.val_arrivee   = this.ds.POP_2030
            this.calculette_evol.annee_depart  = 2020
            this.calculette_evol.annee_arrivee = 2030
            this.calculette_evol.taux_de_croissance = this.ds.TX_POP_2030
            this.calculette_taux.val_depart    = this.ds.POP_2020
            this.calculette_taux.val_arrivee   = this.ds.POP_2030
            this.calculette_taux.annee_depart  = 2020
            this.calculette_taux.annee_arrivee = 2030
            this.calculette_taux.taux_de_croissance = this.ds.TX_POP_2030
            },
        run_calculs(){
            console.log("run_calculs");
            calculs = s_calculs["X"]
            console.log(calculs);
            for (const [key, value] of Object.entries(calculs)) {
                js_expr = value.JavaScript ;
                console.log("Calculs : " + key + " : " + js_expr + " =" );
                console.log(key + " : " + js_expr + " =" );
                the_value = evalInContext(js_expr, this.ds);
                console.log(the_value);
                this.ds[key] = the_value ;
                this.data[key] = [];
                this.data[key]["meta"]   = value.Description ;
                this.data[key]["expr"]   = value.JavaScript ;
                this.data[key]["type"]   = value.Type ;
                this.data[key]["mode"]   = value.Python ;
                this.data[key]["source"] = value.Source ;
                this.data[key]["source"] = value.Source ;
                this.data[key]["total"]  = the_value ;
                }
            console.log(this.data);
            },
        run_diagnostics(){
            console.log("run_diagnostics");
            console.log(s_diagnostics);
            diagnostics = s_diagnostics["X"]
            console.log(diagnostics);
            for (const [key, value] of Object.entries(diagnostics)) {
                js_expr = value.Test ;
                console.log("Diagnostics : " + key + " : " + js_expr + " =" );
                the_value = evalInContext(js_expr, this.ds);
                console.log(the_value);
                // this.ds[key] = the_value ;
                diag = {}
                diag["key"]           = key ;
                diag["categorie"]     = value.Categorie ;
                diag["description"]   = value.Description ;
                diag["messageSiVrai"] = value.MessageSiVrai ;
                diag["messageSiFaux"] = value.MessageSiFaux ;
                diag["test"]          = value.Test ;
                diag["type"]          = value.Type ;
                diag["value"]         = the_value ;
                this.diag = this.diag.filter(el => !(el.key === key));
                this.diag.push(diag)
                this.data_s.Diagnostics = this.data_s.Diagnostics.filter(el => !(el.key === key));
                this.data_s.Diagnostics.push(diag)
                }
            console.log(this.diag);
            },
        selectDept2(event){
            console.log("selectDept : "+event.target.value);
            dept_index       = this.depts.findIndex(x => x.nom == event.target.value);
            this.territoire  = "Departement";
            this.nom         = event.target.value;
            this.code        = this.depts[dept_index].num ;
            this.entity      = this.depts[dept_index].entity;
            this.page        = "output/"+this.depts[dept_index].entity+".html" ;
            console.log(this.nom + " entity : " + this.entity);
            this.loadData()
            console.log(this.nom + " : " + this.entity);
            // Locate Dept in Select JSON
            depts            = select["REGIONS"][0]["DEPARTEMENTS"];
            dept_index       = depts.findIndex(x => x.Nom === this.nom);
            this.data_h      = depts[dept_index];
            dept = this.data_h ;
            // List EPCIs
            this.epcis = [];
            for (var i = 0; i < dept["EPCIS_CODES"].length; i++) {
                epci_code =  dept["EPCIS_CODES"][i]
                ep   = select["REGIONS"][0]["EPCIS"].findIndex(x => x.INSEE === epci_code);
                ep   = select["REGIONS"][0]["EPCIS"][ep]
                epci = { id: i, num : ep.INSEE , nom : ep.Nom, entity : ep.Clean, data : ep };
                this.epcis.push(epci);
                }
            // List Communes
            this.communes = [];
            for (var i = 0; i < dept["COMMUNES_CODES"].length; i++) {
                commune_code =  dept["COMMUNES_CODES"][i]
                co   =  select["REGIONS"][0]["COMMUNES"].findIndex(x => x.INSEE === commune_code);
                co   =  select["REGIONS"][0]["COMMUNES"][co]
                commune = { id: i, num : co.INSEE , nom : co.Nom, entity : co.Clean, data : co };
                this.communes.push(commune);
                }
            console.log("Done : selectDept : "+this.entity);
            },
        selectEpci2(event){
            console.log("selectEPCI : "+event.target.value);
            epci_index       = this.epcis.findIndex(x => x.nom === event.target.value);
            this.territoire  = "EPCI";
            this.nom         = event.target.value;
            this.code        = this.epcis[epci_index].num ;
            this.entity      = this.epcis[epci_index].entity;
            this.page        = "output/"+this.epcis[epci_index].entity+".html" ;
            this.data_h      = this.epcis[epci_index].data;
            console.log(this.nom + " entity : " + this.entity);
            this.loadData()
            console.log(this.nom + " : " + this.entity);

            // Locate EPCI in Select JSON
            epcis            = select["REGIONS"][0]["EPCIS"];
            epci_index       = epcis.findIndex(x => x.Nom === this.nom);
            this.data_h      = epcis[epci_index];
            epci = this.data_h ;
            // List Communes
            this.communes = [];
            for (var i = 0; i < epci["COMMUNES_CODES"].length; i++) {
                commune_code =  epci["COMMUNES_CODES"][i]
                co   =  select["REGIONS"][0]["COMMUNES"].findIndex(x => x.INSEE === commune_code);
                co   =  select["REGIONS"][0]["COMMUNES"][co]
                commune = { id: i, num : co.INSEE , nom : co.Nom, entity : co.Clean, data : co };
                this.communes.push(commune);
                }
            // console.log(this.communes);
            console.log("Done selectEpci "+this.entity);
            },
        selectDept(event){
            console.log("selectDept : "+event.target.value);
            dept_index       = this.depts.findIndex(x => x.nom == event.target.value);
            this.territoire  = "Departement";
            this.nom         = event.target.value;
            this.code        = this.depts[dept_index].num ;
            this.entity      = this.depts[dept_index].entity;
            this.page        = "output/"+this.depts[dept_index].entity+".html" ;
            console.log(this.nom + " entity : " + this.entity);
            this.loadData()
            console.log(this.nom + " : " + this.entity);
            // Locate Dept in France JSON
            depts            = france["REGIONS"][0]["DEPARTEMENTS"];
            dept_index       = depts.findIndex(x => x.Nom === this.nom);
            this.data_h      = depts[dept_index];
            dept = this.data_h ;
            // List EPCIs
            this.epcis = [];
            for (let i = 0; i < dept["EPCI"].length; i++) {
                epci = { id: i, num : dept["EPCI"][i].INSEE , nom : dept["EPCI"][i].Nom, entity : dept["EPCI"][i].Clean, data : dept["EPCI"][i] };
                this.epcis.push(epci);
                }
            // List Communes
            this.communes = [];
            for (let i = 0; i < dept["COMMUNES"].length; i++) {
                commune = { id: i, num : dept["COMMUNES"][i].INSEE , nom : dept["COMMUNES"][i].Nom, entity : dept["COMMUNES"][i].Clean, data : dept["COMMUNES"][i] };
                this.communes.push(commune);
                }
            console.log("Done : selectDept : "+this.entity);
            },
        selectEpci(event){
            console.log("selectEPCI : "+event.target.value);
            epci_index       = this.epcis.findIndex(x => x.nom === event.target.value);
            this.territoire  = "EPCI";
            this.nom         = event.target.value;
            this.code        = this.epcis[epci_index].num ;
            this.entity      = this.epcis[epci_index].entity;
            this.page        = "output/"+this.epcis[epci_index].entity+".html" ;
            this.data_h      = this.epcis[epci_index].data;
            this.loadData()
            console.log(this.nom + " : " + this.entity);
            // Communes
            selected_epci = this.epcis[epci_index];
            this.communes = [];
            console.log(selected_epci.data["COMMUNES"].length);
            for (let i = 0; i < selected_epci.data["COMMUNES"].length; i++) {
                // console.log(selected_epci.data["COMMUNES"][i].Nom);
                commune = { id: i, num : selected_epci.data["COMMUNES"][i].INSEE , nom : selected_epci.data["COMMUNES"][i].Nom, entity : selected_epci.data["COMMUNES"][i].Clean, data : selected_epci.data["COMMUNES"][i] };
                this.communes.push(commune);
                }
            // console.log(this.communes);
            console.log("Done selectEpci "+this.entity);
            },
        selectCommune(event){
            console.log("selectCommune : "+event.target.value);
            comm_index       = this.communes.findIndex(x => x.nom === event.target.value);
            this.territoire  = "Commune";
            this.nom         = event.target.value;
            this.code        = this.communes[comm_index].num ;
            this.entity      = this.communes[comm_index].entity;
            this.page        = "output/"+this.communes[comm_index].entity+".html" ;
            this.data_h      = this.communes[comm_index].data;
            this.loadData()
            console.log(this.nom + " : " + this.entity);
            console.log("Done selectCommune "+this.entity);
            },
        recalc_taux(){
              console.log("recalc_taux")
              this.calculette_taux.taux_de_croissance = calc_taux(this.calculette_taux.annee_depart, this.calculette_taux.val_depart, this.calculette_taux.annee_arrivee, this.calculette_taux.val_arrivee, 3)
              console.log(this.calculette_taux.taux_de_croissance)
        },
        recalc_evol(){
              console.log("recalc_evol")
              this.calculette_evol.val_arrivee = calc_after(this.calculette_evol.annee_depart, this.calculette_evol.val_depart, this.calculette_evol.annee_arrivee, this.calculette_evol.taux_de_croissance, 0)
              console.log(this.calculette_evol.val_arrivee)
        },

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

        }
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
        depts            = france["REGIONS"][0]["DEPARTEMENTS"];
        dept_index       = depts.findIndex(x => x.INSEE === code_insee);
        console.log("DEPT : " + depts[dept_index]);
        nom_dept         = depts[dept_index].Nom;
        console.log("DEPT : " + nom_dept);
    } ;
  if (type_entity == "EPCI") {
        // Locate EPCI in France JSON
        depts            = france["REGIONS"][0]["DEPARTEMENTS"];
        for (let i = 0; i < france["REGIONS"][0]["DEPARTEMENTS"].length; i++) {
            dept = france["REGIONS"][0]["DEPARTEMENTS"][i]
            for (let j = 0; i < dept["EPCI"].length; j++) {
                if (dept["EPCI"][j].INSEE === code_insee ) {
                    }
                    nom_epci = dept["EPCI"][j].Nom ;
                }
            this.communes.push(commune);
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

