$.ajaxSetup({ async: false });
g_data_s = null;

// REGIONS / DEPARTEMENTS / EPCI / COMMUNES
// REGIONS / DEPARTEMENTS / COMMUNES
var france = {}; // Les Donnees des Communes, Dept, Etc
$.getJSON("output/france.json", function(json) { france = json ; console.log(json); }); // Info in console

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
            console.log(g_data_s)
            this.data_s = g_data_s;
            this.ds     = this.data_s.total;
            this.data   = this.data_s.Data;
            this.diag   = this.data_s.Diagnostics;
            console.log("> this.data_s : ")
            console.log(this.data_s)
            console.log(this.ds)
            console.log(this.ds.LIBELLE)
            console.log("Done loadData : "+this.entity);
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

