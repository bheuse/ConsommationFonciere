$.ajaxSetup({ async: false });
data_m2 = null ;
data_c2 = {};
data_d2 = {};

// REGIONS / DEPARTEMENTS / EPCI / COMMUNES
// REGIONS / DEPARTEMENTS / COMMUNES
var france = {}; // Les Donnees des Communes, Dept, Etc
$.getJSON("output/france.json", function(json) { france = json ; console.log(json); }); // show the info it in  console

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
            data_h     : null , // Data of Entity in France File (used for header)
            data_m     : null , // Data of Entity in Metrics (not used, load fails ... ?!)
            data_c     : null , // Data of Entity in Columns
            data_d     : null , // Diagnostic Data of Entity
            ds         : null , // Data of Entity (Total)
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

            page_c2 = "output/"+this.entity+"_c.json";
            console.log("page_c2 : "+page_c2);
            this.data_c = null ;
            data_c2     = null ;
            $.getJSON(page_c2, function(json) { data_c2 = json ; console.log(data_c2) });
            this.data_c = data_c2;
            this.ds = this.data_c.total;
            console.log("> this.data_c : ")
            console.log(this.data_c)
            console.log(this.ds)
            console.log(this.ds.LIBELLE)

            page_m2 = "output/"+this.entity+"_m.json";
            console.log("page_m2 : "+page_m2);
            this.data_m = null ;
            data_m2     = null ;
            $.getJSON(page_m2, function(json) {  data_m2 = json ;  }); 
            this.data_m = data_m2;
            console.log("> this.data_m : ")
            console.log(this.data_m)

            page_d2 = "output/"+this.entity+"_d.json";
            console.log("page_d2 : "+page_d2);
            this.data_d = null ;
            page_d2     = null ;
            $.getJSON(page_d2, function(json) { data_d2 = json ;  }); 
            this.data_d = data_d2;
            console.log("> this.data_m : ")
            console.log(this.data_d)

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
        loadJSON(file){
            $.getJSON(file, function(json) { console.log(json); }); // show the info it in  console
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
  console.log(queryString);
  const urlParams = new URLSearchParams(queryString);
  // "output/DEPT_Alpes-Maritimes_06.html"
  var init_page = urlParams.get('ENTITE')
  if (init_page == null) { init_page = "DEPT_Alpes-Maritimes_06" } ;
  init_page =  "output/"+init_page+".html";
  console.log(init_page);
  // alert("Page is loaded : " + init_page);
}
