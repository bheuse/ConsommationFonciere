# Consommation Foncière

[Cet outil](https://github.com/bheuse/ConsommationFonciere) consolide les données qui permettent un diagnostic de Consommation Foncière en France.

- [En collaboration avec France Nature Environnement](https://fne.asso.fr/)
- [Powered by Gadesca](https://www.gadseca.org)
- [Contactez-nous / Information]("mailto:gadceca06@gmail.com?subject=A%20propose%20de%20Consommation%20Fonciere")
- [Heberge sur Infinity Free - En Ligne Ici](http://consommationfonciere.infinityfreeapp.com/ConsommationFonciere.html)
- [Open Source Projet Github](https://github.com/bheuse/ConsommationFonciere)

![img.png](Header.png)

![img.png](Body.png)

Il vise à mettre en œuvre l'objectif ZAN - Zéro Artificialisation Nette.

Les étapes sont les suivantes :
- Collecte des Données
- Consolidation des Données
- Établissement d'un Diagnostic
- Génération d'un Rapport

Les données sont issues (voir les liens en bas de ce document):
- De l'INSEE pour les données historiques de base sur les communes
- De l'INSEE pour les projections futures en nombre d'habitants
- Des fichiers Sitadel pour les permis de construire
- Du CEREMA pour les données d'artificialisation
- De la DREAL pour les données SRU

**_Les données Sitadel et INSEE pour les communes ne sont pas pré-téléchargées dans GitHub._**
- [dossier_complet.csv](https://www.insee.fr/fr/statistiques/fichier/5359146/dossier_complet.zip) (unzip après download)
- [PC_DP_creant_logements_2013_2016.csv](https://www.data.gouv.fr/es/datasets/r/67dd4ee1-0d73-4676-a90f-854fe9012f5d) (renommer sans accents après download)
- [PC_DP_creant_logements_2017_2021.csv](https://www.data.gouv.fr/es/datasets/r/1fa467ef-5e3a-456f-b961-be9032cfa3df) (renommer sans accents après download)
- [PC_DP_creant_locaux_2013_2016.csv](https://www.data.gouv.fr/es/datasets/r/3b987380-d1cf-4047-8dc5-1a19a3ecf812) (renommer sans accents après download)
- [PC_DP_creant_locaux_2017_2021.csv](https://www.data.gouv.fr/es/datasets/r/98ff9fd3-a14e-474d-bb8f-12bde12d9f70) (renommer sans accents après er download)

**_Ces données seront téléchargées a la premiere utilisation dans le répertoire "data"._**
Voir ci-dessous les pages pour ces liens pour plus de détails. 

### Les territoires gérés:
- "**COMMUNE**" : Les Communes 
- "**EPCI**" : Les EPCI (Communautés d'Agglomération, Métropoles, Communautés de Communes)
- "**DEPT**" : Les Départements de PACA
- "**REGION**" : La Région PACA


### A venir:
- "**SCOT**" : Les territoires des SCoT
- Les autres régions
- Les ensembles de communes
- La France entière

L'outil permet de définir des règles de diagnostic.

## Concepts 

Le programme consolide des métriques (indicateurs) de différentes sources sur les communes  et peut établir des diagnostics.
Ensuite un rapport en généré.

Le contenu du rapport en ajustable en fonction des besoins. 
On peut ajuster :
- Les métriques collectées et affichées
- Les diagnostics a établir
- Le format et le contenu du rapport


## Utilisation

    Usage: -f -a -p -n -b -l -c <commune_code> -e <epci_code> -d <dept_code> -r <region_code>   
           -l --list         : List for all communes/epci/dept in Territory       
           -c --commune <c> : Report for Commune Code INSEE 'c'                 
           -e --ecpi    <e> : Report for ECPI Code INSEE 'e'                      
           -d --dept    <d> : Report for Departement Code INSEE 'd'                 
           -r --region  <r> : Report for Region Code INSEE 'r'          
           -a --all         : Report for all communes in Territory           
           -n --data        : No report - Generate only data & Graphics        
           -p --push        : FTP Push Data to Infinity Free Host WebSite         
           -f --force       : Report reading source data (cache ignored)     
           --browse         : Start Browser on generated report (debug)  
           --cxlsx            <ConfigurationFile.xlsx> : Use Configuration File  
           --rhtml            <ReportTemplate.html>    : Use ReportTemplate      
           --clean          : Delete Report files        


**Exemples:**

Pour générer le rapport sur Mougins, et le visualiser dans le browser :

    python ConsommationFonciere.py -b -c 06250

Pour lister les codes des communes et EPCI du département 06 :

    python ConsommationFonciere.py -l -d 06

Pour générer le rapport sur la CACPL (CA Cannes Pays de Lérins) :

    python ConsommationFonciere.py -e 200039915

Pour générer et mettre a jour les donnees du département 06 sur le server :

    python ConsommationFonciere.py -f -a -p -d 06

Les rapports sont générés dans le repertoire "output".

# Configuration

Le fichier de configuration par défaut est "_input/Configuration.xlsx_"
Le fichier de configuration à utiliser peut être spécifié en paramètre de la ligne de commande.

## Collecte de Donnees

Les données sources, c'est plus de 1500 indicateurs (métriques) par communes. 
Par défaut, un certain nombre de données sont collectées. 
Par configuration, on peut ensuite demander la collecte de données supplémentaires.
On peut aussi calculer de nouvelles métriques basées sur les autres (par exemple des taux)

Ces métriques sont ensuite disponibles pour générer le rapport.

Pour collecter de nouvelles métriques, ajouter des lignes dans le fichier de configuration, _TAB_ **Collect**

**Key**	: L'identifiant de la métrique (donnée)

Ce champ doit être unique, sans espaces ni caractères spéciaux. Exemple :

    SRU_CARENCE_2020

**Description**	: La Description de la métrique (indicateur de la donnée)

Texte libre, par exemple :

    Taux de Carence en 2020

**Source**: La Source de la métrique

Ce champ est indicatif, mais il permet de classer les metriques dans l'interface.
- "DATA" : Données de Base
- "CODE" : Données Codes Postaux
- "INTERCO" : Données Intercommunalités
- "INSEE" : Données INSEE
- "CALC" : Données calculées
- "SRU" : Données SRU DREAL
- "ART" : Données Artificialisation CEREMA
- "PROJ" : Données Projection INSEE
- "EVOL" : Données Evolution INSEE
- "SIT" ; Données SITADEL
 
**Type**	: Le type de la métrique

Les types supportés sont :
- "INT" : Entier sans décimale
- "STR" : Chaine de caractères
- "FLOAT" : Nombre décimal
- "TAUX" : Taux. 0,1 représente 10 %
- "PERCENT" : Pourcentage. 0,1 représente 0,1 %
 
**Data**	: Le calcul de la métrique (une expression Python)

**Total** : Le calcul du total de la métrique pour plusieurs communes

Les possibilités sont :
- "SUM" : la somme des valeurs de toutes les communes
- "AVG" : la moyenne des valeurs de toutes les communes
- "COUNT" : le nombre de communes 
- "EQUAL" : la même valeur de la première commune
- "IGNORE" : Ignore le total
- "N/A" : Non-applicable
- "CUSTOM" : une expression python qui utilise des KEY des autres totaux

Par exemple, pour un taux pondéré, la somme des taux n'est pas possible, mais on peut utiliser les sommes des autres totaux:

    round(SRU_RP_2020 * (0.25 - SRU_TX_LLS_2020), 4)


**Exemple de Ligne de Configuration**:

    Key                             Description                           Source   Type   Data                                                Total
    SITADEL_LOCAUX_SURF_HAB_AVANT	Surface 'Habitation ' avant travaux   SIT      INT    com_sitadelLocaux['SURF_HAB_AVANT'].sum()           SUM
    SRU_CARENCE_2020                Taux de Carence en 2020               SRU      INT    round0(SRU_RP_2020 * (0.25 - SRU_TX_LLS_2020), 4)	  SUM


Le fichier de configuration par défaut est "_input/Configuration.xlsx_"
Le fichier de configuration à utiliser peut être spécifié en paramètre de la ligne de commande.

## Calculs

_TAB_ **Calculs**

Les calculs peuvent etre utilises pour definir des valeurs de variables supplementaires caluclees a partir des valeurs collectees.

Ces variables sont ensuite disponibles pour générer le rapport.

Pour calculer de nouvelles variables, ajouter des lignes dans le fichier de configuration, _TAB_ **Calculs**

**Key**	: L'identifiant de la variable (donnée)

Ce champ doit être unique, sans espaces ni caractères spéciaux. Exemple :

    CALCUL_CARENCE

**Description**	: La Description de la variable (indicateur de la valeur)

Texte libre, par exemple :

    Taux de Carence Total

**Source**: La Source de la variable

Ce champ est indicatif, mais il permet de classer les variables dans l'interface.
- "DATA" : Données de Base
- "CODE" : Données Codes Postaux
- "INTERCO" : Données Intercommunalités
- "INSEE" : Données INSEE
- "CALC" : Données calculées
- "SRU" : Données SRU DREAL
- "ART" : Données Artificialisation CEREMA
- "PROJ" : Données Projection INSEE
- "EVOL" : Données Evolution INSEE
- "SIT" ; Données SITADEL
 
**Type**	: Le type de la variable

Les types supportés sont :
- "INT" : Entier sans décimale
- "STR" : Chaine de caractères
- "FLOAT" : Nombre décimal
- "TAUX" : Taux. 0,1 représente 10 %
- "PERCENT" : Pourcentage. 0,1 représente 0,1 %
 
**Python**	: Le calcul de la variable (une expression Python)

    round0(RP_2020 * (0.25 - SRU_TX_LLS), 4)

**JavaScript** : Le calcul de la variable (une expression JavaScript)

    Math.round(RP_2020 * (0.25 - SRU_TX_LLS), 4)

**Exemple de Ligne de Configuration**:

    Key              Description                  Source   Type   Python                                              JavaScript                                      Commentaire
    CALCUL_CARENCE   Carence Total en 2002        SRU      INT    round0(SRU_RP_2020 * (0.25 - SRU_TX_LLS_2020), 4)	  Math.round(RP_2020 * (0.25 - SRU_TX_LLS), 4)    Texte Libre


## Diagnostics

_TAB_ **Diagnostic**

Sur les données collectées, des vérifications peuvent être faites.
Le fichier de configuration xls contient un Tab Diagnostic.
Chaque ligne permet de vérifier une condition et d'afficher le diagnostic correspondant.
Ces diagnostics sont ensuite disponibles pour générer le rapport.

**Key** : L'identifiant du Diagnostic

    Exemple : LOG_SRU

**Type** : Le type du Diagnostic

Les possibilités sont :
- "DIAG" : Vrai s'affiche en vert, Faux en rouge
- "NOTE" : S'affiche en jaune, mais le message varie si Vrai ou Faux
- "TEST" : Pour les tests et le debugging 

Par exemple, pour un taux pondéré, la somme des taux n'est pas possible, mais on peut utiliser les sommes des autres totaux:

    Exemple : NOTE, DIAG, TEST

**Description** : La Description du Diagnostic 

    Exemple : Test si la commune a des obligations en matière de Logements Sociaux

**Test** : La condition a vérifié, une expression booléenne en python 

    Exemple : SRU_TX_LLS_2020 > 0

**MessageSiVrai** : Le message a affiché si la condition est vraie 

    Exemple : Votre Commune doit construire des logements sociaux

**MessageSiFaux** : Le message a affiché si la condition est fausse 

    Exemple : Votre Commune n'est pas carencee en Logements sociaux


Si le Test renvoi VRAI, le Message est affiche.

## Rapport

Le rapport consiste en :
- Un fichier xls avec les données consolidées pour la commune ou le territoire
- Un fichier csv avec les données consolidées pour la commune ou le territoire
- Une page HTML avec des graphiques, des diagnostics, etc.

### Rapport CSV

Le rapport CSV ne contient que les métriques brutes, avec le total et les meta-données

### Rapport JSON

Le rapport JSON (_s.json) ne contient que les métriques de total, les diagnostics et les meta-données. 

### Rapport Excel

Le rapport généré est considéré comme corrompu par Excel, mais il peut le réparer)).
Il contient 3 TAB :
- TAB **Data** : les métriques brutes, avec le total et les meta-données
- TAB **Pivot** : une transposition de ces données 
- TAB **Diagnotics** : la liste des diagnostics et les valeurs calculées

### Rapport HTML

Le rapport HTML est base sur un template, qui permet d'ajuster la présentation et les données à afficher.

Le fichier template de rapport par défaut est "_input/report_template.html_"

Il utilise le moteur [MAKO](https://docs.makotemplates.org/en/latest/).

Les balises pour les métriques qui peuvent etre utilisées sont listées dans le fichier "_output/context.yaml_"

Le fichier de template à utiliser peut être spécifié en paramètre de la ligne de commande.


## Utilitaires 

### Nice README

[https://dillinger.io/](https://dillinger.io/)

    DOCUMENT NAME : README.dillinger
    MARKDOWN : Copier / Coller le README.md

Export As Styled HTML into README.dillinger.html

## Les sources de donnes

Les sources de données sont listées ci-dessous.

_Note_ : Toutes les données sources ne sont pas stockées dans GitHub vu la taille des fichiers.

### Sitadel Logements

Ces données ne sont pas pré-téléchargées dans GitHub - elles le seront a la premiere utilisation.

[Page Sitadel Source](https://www.data.gouv.fr/es/datasets/base-des-permis-de-construire-et-autres-autorisations-durbanisme-sitadel/)

- "PC_DP_creant_logements_2013_2016.csv" : [Données Logements 2013 2016](https://www.data.gouv.fr/es/datasets/r/67dd4ee1-0d73-4676-a90f-854fe9012f5d)
- "PC_DP_creant_logements_2017_2021.csv" : [Données Logements 2017 2021](https://www.data.gouv.fr/es/datasets/r/1fa467ef-5e3a-456f-b961-be9032cfa3df)
- "dictionnaire_variables_logements_permis_construire.xls" : [Dictionnaire des Données Logements](https://www.data.gouv.fr/es/datasets/r/9d7d6728-c3bc-44e4-8105-7335ad70d52e)

`REG;DEP;COMM;Type_DAU;Num_DAU;Etat_DAU;DATE_REELLE_AUTORISATION;DATE_REELLE_DOC;DATE_REELLE_DAACT;DPC_AUT;DPC_DOC;DPC_DERN;APE_DEM;CJ_DEM;DENOM_DEM;SIREN_DEM;SIRET_DEM;CODPOST_DEM;LOCALITE_DEM;REC_ARCHI;ADR_NUM_TER;ADR_TYPEVOIE_TER;ADR_LIBVOIE_TER;ADR_LIEUDIT_TER;ADR_LOCALITE_TER;ADR_CODPOST_TER;sec_cadastre1;num_cadastre1;sec_cadastre2;num_cadastre2;sec_cadastre3;num_cadastre3;SUPERFICIE_TERRAIN;ZONE_OP;NATURE_PROJET;I_EXTENSION;I_SURELEVATION;I_NIVSUPP;NB_NIV_MAX;NB_CHAMBRES;SURF_HAB_AVANT;SURF_HAB_CREEE;SURF_HAB_ISSUE_TRANSFO;SURF_HAB_DEMOLIE;SURF_HAB_TRANSFORMEE;SURF_LOC_AVANT;SURF_LOC_CREEE;SURF_LOC_ISSUE_TRANSFO;SURF_LOC_DEMOLIE;SURF_LOC_TRANSFORMEE;SURF_HEB_AVANT;SURF_HEB_CREEE;SURF_HEB_ISSUE_TRANSFO;SURF_HEB_DEMOLIE;SURF_HEB_TRANSFORMEE;SURF_BUR_AVANT;SURF_BUR_CREEE;SURF_BUR_ISSUE_TRANSFO;SURF_BUR_DEMOLIE;SURF_BUR_TRANSFORMEE;SURF_COM_AVANT;SURF_COM_CREEE;SURF_COM_ISSUE_TRANSFO;SURF_COM_DEMOLIE;SURF_COM_TRANSFORMEE;SURF_ART_AVANT;SURF_ART_CREEE;SURF_ART_ISSUE_TRANSFO;SURF_ART_DEMOLIE;SURF_ART_TRANSFORMEE;SURF_IND_AVANT;SURF_IND_CREEE;SURF_IND_ISSUE_TRANSFO;SURF_IND_DEMOLIE;SURF_IND_TRANSFORMEE;SURF_AGR_AVANT;SURF_AGR_CREEE;SURF_AGR_ISSUE_TRANSFO;SURF_AGR_DEMOLIE;SURF_AGR_TRANSFORMEE;SURF_ENT_AVANT;SURF_ENT_CREEE;SURF_ENT_ISSUE_TRANSFO;SURF_ENT_DEMOLIE;SURF_ENT_TRANSFORMEE;SURF_PUB_AVANT;SURF_PUB_CREEE;SURF_PUB_ISSUE_TRANSFO;SURF_PUB_DEMOLIE;SURF_PUB_TRANSFORMEE;TYPE_SERVICE_PUBLIC`

### Sitadel Locaux

Ces données ne sont pas pré-téléchargées dans GitHub - elles le seront a la premiere utilisation.

[Page Sitadel Source](https://www.data.gouv.fr/es/datasets/base-des-permis-de-construire-et-autres-autorisations-durbanisme-sitadel/)

- "PC_DP_creant_locaux_2013_2016.csv" : [Données Locaux 2013 2016](https://www.data.gouv.fr/es/datasets/r/3b987380-d1cf-4047-8dc5-1a19a3ecf812)
- "PC_DP_creant_locaux_2017_2021.csv" : [Données Locaux 2017 2021](https://www.data.gouv.fr/es/datasets/r/98ff9fd3-a14e-474d-bb8f-12bde12d9f70)
- "dictionnaire_variables_locaux_permis_construire.xls" : [Dictionnaire des Données Locaux](https://www.data.gouv.fr/es/datasets/r/b3ffee5b-fd75-4345-a086-02ded2018705)


`REG;DEP;COMM;Type_DAU;Num_DAU;Etat_DAU;DATE_REELLE_AUTORISATION;DATE_REELLE_DOC;DATE_REELLE_DAACT;DPC_AUT;DPC_DOC;DPC_DERN;APE_DEM;CJ_DEM;DENOM_DEM;SIREN_DEM;SIRET_DEM;CODPOST_DEM;LOCALITE_DEM;REC_ARCHI;ADR_NUM_TER;ADR_TYPEVOIE_TER;ADR_LIBVOIE_TER;ADR_LIEUDIT_TER;ADR_LOCALITE_TER;ADR_CODPOST_TER;sec_cadastre1;num_cadastre1;sec_cadastre2;num_cadastre2;sec_cadastre3;num_cadastre3;SUPERFICIE_TERRAIN;ZONE_OP;NATURE_PROJET;I_EXTENSION;I_SURELEVATION;I_NIVSUPP;NB_NIV_MAX;NB_CHAMBRES;SURF_HAB_AVANT;SURF_HAB_CREEE;SURF_HAB_ISSUE_TRANSFO;SURF_HAB_DEMOLIE;SURF_HAB_TRANSFORMEE;SURF_LOC_AVANT;SURF_LOC_CREEE;SURF_LOC_ISSUE_TRANSFO;SURF_LOC_DEMOLIE;SURF_LOC_TRANSFORMEE;SURF_HEB_AVANT;SURF_HEB_CREEE;SURF_HEB_ISSUE_TRANSFO;SURF_HEB_DEMOLIE;SURF_HEB_TRANSFORMEE;SURF_BUR_AVANT;SURF_BUR_CREEE;SURF_BUR_ISSUE_TRANSFO;SURF_BUR_DEMOLIE;SURF_BUR_TRANSFORMEE;SURF_COM_AVANT;SURF_COM_CREEE;SURF_COM_ISSUE_TRANSFO;SURF_COM_DEMOLIE;SURF_COM_TRANSFORMEE;SURF_ART_AVANT;SURF_ART_CREEE;SURF_ART_ISSUE_TRANSFO;SURF_ART_DEMOLIE;SURF_ART_TRANSFORMEE;SURF_IND_AVANT;SURF_IND_CREEE;SURF_IND_ISSUE_TRANSFO;SURF_IND_DEMOLIE;SURF_IND_TRANSFORMEE;SURF_AGR_AVANT;SURF_AGR_CREEE;SURF_AGR_ISSUE_TRANSFO;SURF_AGR_DEMOLIE;SURF_AGR_TRANSFORMEE;SURF_ENT_AVANT;SURF_ENT_CREEE;SURF_ENT_ISSUE_TRANSFO;SURF_ENT_DEMOLIE;SURF_ENT_TRANSFORMEE;SURF_PUB_AVANT;SURF_PUB_CREEE;SURF_PUB_ISSUE_TRANSFO;SURF_PUB_DEMOLIE;SURF_PUB_TRANSFORMEE;TYPE_SERVICE_PUBLIC`

### Evolution 2008-2021

[Page INSEE - Evolution 2008-2021](https://www.insee.fr/fr/statistiques/1893198)

- "evolution-population-dep-2008-2021.xlsx" : [Evolution Source File](https://www.insee.fr/fr/statistiques/fichier/1893198/evolution-population-reg-2008-2021.xlsx)


`   # Variation relative annuelle 2018-2021 (en %)
    # Département, Estimations de population au 1er janvier 2021, Totale,  Due au solde naturel, Due au solde apparent des entrées et des sorties
    Ain            662,244	                                      0.7%	   0.3%	                 0.4%`
`

### Projections 2013-2050

[Page INSEE - Projections 2013-2050](https://www.insee.fr/fr/statistiques/2859843)

- "projections_scenario_central.xls" : [Projections Source File](https://www.insee.fr/fr/statistiques/fichier/2859843/projections_scenario_central.xls)


`   ### TAB Population_DEP
    # Département       Libellé du département	Population en 2013	Population en 2014	Population en 2015	Population en 2016	Population en 2017	Population en 2018	Population en 2019	Population en 2020	Population en 2021	Population en 2022	Population en 2023	Population en 2024	Population en 2025	Population en 2026	Population en 2027	Population en 2028	Population en 2029	Population en 2030	Population en 2031	Population en 2032	Population en 2033	Population en 2034	Population en 2035	Population en 2036	Population en 2037	Population en 2038	Population en 2039	Population en 2040	Population en 2041	Population en 2042	Population en 2043	Population en 2044	Population en 2045	Population en 2046	Population en 2047	Population en 2048	Population en 2049	Population en 2050
    # code_Departements	libelle_Departements	pop_2013	pop_2014	pop_2015	pop_2016	pop_2017	pop_2018	pop_2019	pop_2020	pop_2021	pop_2022	pop_2023	pop_2024	pop_2025	pop_2026	pop_2027	pop_2028	pop_2029	pop_2030	pop_2031	pop_2032	pop_2033	pop_2034	pop_2035	pop_2036	pop_2037	pop_2038	pop_2039	pop_2040	pop_2041	pop_2042	pop_2043	pop_2044	pop_2045	pop_2046	pop_2047	pop_2048	pop_2049	pop_2050
`

`   ### TAB Population_REG
    # Région	Libellé de la région	Population en 2013	Population en 2014	Population en 2015	Population en 2016	Population en 2017	Population en 2018	Population en 2019	Population en 2020	Population en 2021	Population en 2022	Population en 2023	Population en 2024	Population en 2025	Population en 2026	Population en 2027	Population en 2028	Population en 2029	Population en 2030	Population en 2031	Population en 2032	Population en 2033	Population en 2034	Population en 2035	Population en 2036	Population en 2037	Population en 2038	Population en 2039	Population en 2040	Population en 2041	Population en 2042	Population en 2043	Population en 2044	Population en 2045	Population en 2046	Population en 2047	Population en 2048	Population en 2049	Population en 2050
    # code_Regions	libelle_Regions	pop_2013	pop_2014	pop_2015	pop_2016	pop_2017	pop_2018	pop_2019	pop_2020	pop_2021	pop_2022	pop_2023	pop_2024	pop_2025	pop_2026	pop_2027	pop_2028	pop_2029	pop_2030	pop_2031	pop_2032	pop_2033	pop_2034	pop_2035	pop_2036	pop_2037	pop_2038	pop_2039	pop_2040	pop_2041	pop_2042	pop_2043	pop_2044	pop_2045	pop_2046	pop_2047	pop_2048	pop_2049	pop_2050
`

### Projections PACA 2030-2050

[Page INSEE - Projections PACA](https://www.insee.fr/fr/statistiques/3202958?sommaire=3203271)

- "1_Population_evolutions.xls" : [projectionsPacaSourceFile](https://www.insee.fr/fr/statistiques/fichier/3202958/1_Population_evolutions.xls)


`
    # Type de Zone  EPCI	Nom de zone		Population haute 2013	Central* 2013	Population basse 2013	Sans migrations 2013	Population haute 2030	Central* 2030	Population basse 2030	Sans migrations 2030 Population haute 2050	Central* 2050	Population basse 2050	Sans migrations 2050
`

### Départements

[Page Source Departements](https://www.data.gouv.fr/en/datasets/departements-de-france/)
- "departements-france.csv" : [departementsSourceFile](https://www.data.gouv.fr/en/datasets/r/70cef74f-70b1-495a-8500-c089229c0254)


`
    # code_departement	nom_departement	code_region	nom_region
`


### Intercommunalités 

[Page Source Intercommunalite]("https://www.insee.fr/fr/information/2510634)

- "Intercommunalite-Metropole_au_01-01-2021.xlsx" : [interCoSourceFile](https://www.insee.fr/fr/statistiques/fichier/2510634/Intercommunalite_Metropole_au_01-01-2021.zip)


`
    # CODGEO	LIBGEO	EPCI	LIBEPCI	DEP	REG
`

 
### Codes Postaux

[Page Source Codes Postaux](https://datanova.laposte.fr/explore/dataset/laposte_hexasmal/information/?disjunctive.code_commune_insee&disjunctive.nom_de_la_commune&disjunctive.code_postal&disjunctive.ligne_5)

- "laposte_hexasmal.csv" : [codesPostauxSourceFile](https://datanova.laposte.fr/explore/dataset/laposte_hexasmal/download/?format=csv&timezone=Europe/Berlin&lang=fr&use_labels_for_header=true&csv_separator=%3B£)

`   # Code_commune_INSEE;Nom_commune;Code_postal;Ligne_5;LibellÃ©_d_acheminement;coordonnees_gps (lat,long)
    # 02547;LA NEUVILLE HOUSSET;02250;;LA NEUVILLE HOUSSET;49.7881379377,3.731716273`

### SRU Paca

[SRU PACA 2017-2019 Page - DREAL](http://www.paca.developpement-durable.gouv.fr/periode-triennale-2017-2019-a10879.html)
- "communes_sru_en_paca.xlsx" : [sru2017SourceFile](http://www.paca.developpement-durable.gouv.fr/IMG/pdf/2017-2019_communes_sru_en_paca.pdf)

[SRU PACA 2020-2022 Page - DREAL](http://www.paca.developpement-durable.gouv.fr/periode-triennale-2020-2022-a13129.html)
- "communes_sru_en_paca.xlsx" : [sru2020SourceFile](http://www.paca.developpement-durable.gouv.fr/IMG/pdf/inventaire_010120.pdf)

Les données ont été compilées manuellement a partir des PDF

`   REG;"DEP;COMM;Type_DAU;Num_DAU;Etat_DAU;DATE_REELLE_AUTORISATION;DATE_REELLE_DOC;DATE_REELLE_DAACT;DPC_AUT;DPC_DOC;DPC_DERN;CAT_DEM;APE_DEM;CJ_DEM;DENOM_DEM;SIREN_DEM;SIRET_DEM;CODPOST_DEM;LOCALITE_DEM;REC_ARCHI;ADR_NUM_TER;ADR_TYPEVOIE_TER;ADR_LIBVOIE_TER;ADR_LIEUDIT_TER;ADR_LOCALITE_TER;ADR_CODPOST_TER;sec_cadastre1;num_cadastre1;sec_cadastre2;num_cadastre2;sec_cadastre3;num_cadastre3;SUPERFICIE_TERRAIN;ZONE_OP;NATURE_PROJET;I_EXTENSION;I_SURELEVATION;I_NIVSUPP;NB_NIV_MAX;UTILISATION;RES_PRINCIP_OU_SECOND;TYP_ANNEXE;RESIDENCE_SERVICE;NB_LGT_TOT_CREES;NB_LGT_IND_CREES;NB_LGT_COL_CREES;NB_LGT_DEMOLIS;NB_LGT_1P;NB_LGT_2P;NB_LGT_3P;NB_LGT_4P;NB_LGT_5P;NB_LGT_6P_PLUS;NB_LGT_PRET_LOC_SOCIAL;NB_LGT_ACC_SOC_HORS_PTZ;NB_LGT_PTZ;SURF_HAB_AVANT;SURF_HAB_CREEE;SURF_HAB_ISSUE_TRANSFO;SURF_HAB_DEMOLIE;SURF_HAB_TRANSFORMEE;SURF_LOC_AVANT;SURF_LOC_CREEE;SURF_LOC_ISSUE_TRANSFO;SURF_LOC_DEMOLIE;SURF_LOC_TRANSFORMEE"`

### Artificialisation

[Source Page Artificialisation - Cerema](https://artificialisation.biodiversitetousvivants.fr/les-donnees-au-1er-janvier-2020)
- "description_indicateurs_2009_2020.pdf" : [Description des Donnees](https://artificialisation.biodiversitetousvivants.fr/sites/artificialisation/files/fichiers/2021/08/description%20indicateurs%202009%202020.pdf)
- "obs_artif_conso_com_2009_2020_V2.csv" : [Doneees](https://cerema.app.box.com/v/pnb-action7-indicateurs-ff/file/862179205781)

`    # idcom,idcomtxt,idreg,idregtxt,iddep,iddeptxt,epci20,epci20txt,aav2020,libaav2020,cateaav2020,naf09art10,art09act10,art09hab10,art09mix10,art09inc10,naf10art11,art10act11,art10hab11,art10mix11,art10inc11,naf11art12,art11act12,art11hab12,art11mix12,art11inc12,naf12art13,art12act13,art12hab13,art12mix13,art12inc13,naf13art14,art13act14,art13hab14,art13mix14,art13inc14,naf14art15,art14act15,art14hab15,art14mix15,art14inc15,naf15art16,art15act16,art15hab16,art15mix16,art15inc16,naf16art17,art16act17,art16hab17,art16mix17,art16inc17,naf17art18,art17act18,art17hab18,art17mix18,art17inc18,naf18art19,art18act19,art18hab19,art18mix19,art18inc19,naf19art20,art19act20,art19hab20,art19mix20,art19inc20,nafart0920,artact0920,arthab0920,artmix0920,artinc0920,artcom0920,pop12,pop17,pop1217,men12,men17,men1217,emp17,emp12,emp1217,mepart1217,menhab1217,artpop1217,surfcom20`

### Communes

Ces données ne sont pas pré-téléchargées dans GitHub - elles le seront a la premiere utilisation.

[Page Source Communes - INSEE](https://www.insee.fr/fr/statistiques/5359146)
- "dossier_complet.csv" : [Description des Donnees](https://www.insee.fr/fr/statistiques/fichier/5359146/dossier_complet.zip)
- "meta_dossier_complet.csv" : [Doneees](https://www.insee.fr/fr/statistiques/fichier/5359146/dossier_complet.zip)

`    CODGEO;P18_POP;P18_POP0014;P18_POP1529;P18_POP3044;P18_POP4559;P18_POP6074;P18_POP7589;P18_POP90P;P18_POPH;P18_H0014;P18_H1529;P18_H3044;P18_H4559;P18_H6074;P18_H7589;P18_H90P;P18_H0019;P18_H2064;P18_H65P;P18_POPF;P18_F0014;P18_F1529;P18_F3044;P18_F4559;P18_F6074;P18_F7589;P18_F90P;P18_F0019;P18_F2064;P18_F65P;P18_POP01P;P18_POP01P_IRAN1;P18_POP01P_IRAN2;P18_POP01P_IRAN3;P18_POP01P_IRAN4;P18_POP01P_IRAN5;P18_POP01P_IRAN6;P18_POP01P_IRAN7;P18_POP0114_IRAN2P;P18_POP0114_IRAN2;P18_POP0114_IRAN3P;P18_POP1524_IRAN2P;P18_POP1524_IRAN2;P18_POP1524_IRAN3P;P18_POP2554_IRAN2P;P18_POP2554_IRAN2;P18_POP2554_IRAN3P;P18_POP55P_IRAN2P;P18_POP55P_IRAN2;P18_POP55P_IRAN3P;C18_POP15P;C18_POP15P_CS1;C18_POP15P_CS2;C18_POP15P_CS3;C18_POP15P_CS4;C18_POP15P_CS5;C18_POP15P_CS6;C18_POP15P_CS7;C18_POP15P_CS8;C18_H15P;C18_H15P_CS1;C18_H15P_CS2;C18_H15P_CS3;C18_H15P_CS4;C18_H15P_CS5;C18_H15P_CS6;C18_H15P_CS7;C18_H15P_CS8;C18_F15P;C18_F15P_CS1;C18_F15P_CS2;C18_F15P_CS3;C18_F15P_CS4;C18_F15P_CS5;C18_F15P_CS6;C18_F15P_CS7;C18_F15P_CS8;C18_POP1524;C18_POP1524_CS1;C18_POP1524_CS2;C18_POP1524_CS3;C18_POP1524_CS4;C18_POP1524_CS5;C18_POP1524_CS6;C18_POP1524_CS7;C18_POP1524_CS8;C18_POP2554;C18_POP2554_CS1;C18_POP2554_CS2;C18_POP2554_CS3;C18_POP2554_CS4;C18_POP2554_CS5;C18_POP2554_CS6;C18_POP2554_CS7;C18_POP2554_CS8;C18_POP55P;C18_POP55P_CS1;C18_POP55P_CS2;C18_POP55P_CS3;C18_POP55P_CS4;C18_POP55P_CS5;C18_POP55P_CS6;C18_POP55P_CS7;C18_POP55P_CS8;P13_POP;P13_POP0014;P13_POP1529;P13_POP3044;P13_POP4559;P13_POP6074;P13_POP7589;P13_POP90P;P13_POPH;P13_H0014;P13_H1529;P13_H3044;P13_H4559;P13_H6074;P13_H7589;P13_H90P;P13_H0019;P13_H2064;P13_H65P;P13_POPF;P13_F0014;P13_F1529;P13_F3044;P13_F4559;P13_F6074;P13_F7589;P13_F90P;P13_F0019;P13_F2064;P13_F65P;P13_POP01P;P13_POP01P_IRAN1;P13_POP01P_IRAN2;P13_POP01P_IRAN3;P13_POP01P_IRAN4;P13_POP01P_IRAN5;P13_POP01P_IRAN6;P13_POP01P_IRAN7;P13_POP0114_IRAN2P;P13_POP0114_IRAN2;P13_POP0114_IRAN3P;P13_POP1524_IRAN2P;P13_POP1524_IRAN2;P13_POP1524_IRAN3P;P13_POP2554_IRAN2P;P13_POP2554_IRAN2;P13_POP2554_IRAN3P;P13_POP55P_IRAN2P;P13_POP55P_IRAN2;P13_POP55P_IRAN3P;C13_POP15P;C13_POP15P_CS1;C13_POP15P_CS2;C13_POP15P_CS3;C13_POP15P_CS4;C13_POP15P_CS5;C13_POP15P_CS6;C13_POP15P_CS7;C13_POP15P_CS8;C13_H15P;C13_H15P_CS1;C13_H15P_CS2;C13_H15P_CS3;C13_H15P_CS4;C13_H15P_CS5;C13_H15P_CS6;C13_H15P_CS7;C13_H15P_CS8;C13_F15P;C13_F15P_CS1;C13_F15P_CS2;C13_F15P_CS3;C13_F15P_CS4;C13_F15P_CS5;C13_F15P_CS6;C13_F15P_CS7;C13_F15P_CS8;C13_POP1524;C13_POP1524_CS1;C13_POP1524_CS2;C13_POP1524_CS3;C13_POP1524_CS4;C13_POP1524_CS5;C13_POP1524_CS6;C13_POP1524_CS7;C13_POP1524_CS8;C13_POP2554;C13_POP2554_CS1;C13_POP2554_CS2;C13_POP2554_CS3;C13_POP2554_CS4;C13_POP2554_CS5;C13_POP2554_CS6;C13_POP2554_CS7;C13_POP2554_CS8;C13_POP55P;C13_POP55P_CS1;C13_POP55P_CS2;C13_POP55P_CS3;C13_POP55P_CS4;C13_POP55P_CS5;C13_POP55P_CS6;C13_POP55P_CS7;C13_POP55P_CS8;P08_POP;P08_POP0014;P08_POP1529;P08_POP3044;P08_POP4559;P08_POP6074;P08_POP75P;P08_POPH;P08_H0014;P08_H1529;P08_H3044;P08_H4559;P08_H6074;P08_H7589;P08_H90P;P08_H0019;P08_H2064;P08_H65P;P08_POPF;P08_F0014;P08_F1529;P08_F3044;P08_F4559;P08_F6074;P08_F7589;P08_F90P;P08_F0019;P08_F2064;P08_F65P;P08_POP05P;P08_POP05P_IRAN1;P08_POP05P_IRAN2;P08_POP05P_IRAN3;P08_POP05P_IRAN4;P08_POP05P_IRAN5;P08_POP05P_IRAN6;P08_POP05P_IRAN7;P08_POP0514;P08_POP0514_IRAN2;P08_POP0514_IRAN3P;P08_POP1524;P08_POP1524_IRAN2;P08_POP1524_IRAN3P;P08_POP2554;P08_POP2554_IRAN2;P08_POP2554_IRAN3P;P08_POP55P;P08_POP55P_IRAN2;P08_POP55P_IRAN3P;C08_POP15P;C08_POP15P_CS1;C08_POP15P_CS2;C08_POP15P_CS3;C08_POP15P_CS4;C08_POP15P_CS5;C08_POP15P_CS6;C08_POP15P_CS7;C08_POP15P_CS8;C08_H15P;C08_H15P_CS1;C08_H15P_CS2;C08_H15P_CS3;C08_H15P_CS4;C08_H15P_CS5;C08_H15P_CS6;C08_H15P_CS7;C08_H15P_CS8;C08_F15P;C08_F15P_CS1;C08_F15P_CS2;C08_F15P_CS3;C08_F15P_CS4;C08_F15P_CS5;C08_F15P_CS6;C08_F15P_CS7;C08_F15P_CS8;C08_POP1524;C08_POP1524_CS1;C08_POP1524_CS2;C08_POP1524_CS3;C08_POP1524_CS4;C08_POP1524_CS5;C08_POP1524_CS6;C08_POP1524_CS7;C08_POP1524_CS8;C08_POP2554;C08_POP2554_CS1;C08_POP2554_CS2;C08_POP2554_CS3;C08_POP2554_CS4;C08_POP2554_CS5;C08_POP2554_CS6;C08_POP2554_CS7;C08_POP2554_CS8;C08_POP55P;C08_POP55P_CS1;C08_POP55P_CS2;C08_POP55P_CS3;C08_POP55P_CS4;C08_POP55P_CS5;C08_POP55P_CS6;C08_POP55P_CS7;C08_POP55P_CS8;C18_MEN;C18_MENPSEUL;C18_MENHSEUL;C18_MENFSEUL;C18_MENSFAM;C18_MENFAM;C18_MENCOUPSENF;C18_MENCOUPAENF;C18_MENFAMMONO;C18_PMEN;C18_PMEN_MENPSEUL;C18_PMEN_MENHSEUL;C18_PMEN_MENFSEUL;C18_PMEN_MENSFAM;C18_PMEN_MENFAM;C18_PMEN_MENCOUPSENF;C18_PMEN_MENCOUPAENF;C18_PMEN_MENFAMMONO;P18_POP15P;P18_POP1519;P18_POP2024;P18_POP2539;P18_POP4054;P18_POP5564;P18_POP6579;P18_POP80P;P18_POPMEN1519;P18_POPMEN2024;P18_POPMEN2539;P18_POPMEN4054;P18_POPMEN5564;P18_POPMEN6579;P18_POPMEN80P;P18_POP1519_PSEUL;P18_POP2024_PSEUL;P18_POP2539_PSEUL;P18_POP4054_PSEUL;P18_POP5564_PSEUL;P18_POP6579_PSEUL;P18_POP80P_PSEUL;P18_POP1519_COUPLE;P18_POP2024_COUPLE;P18_POP2539_COUPLE;P18_POP4054_COUPLE;P18_POP5564_COUPLE;P18_POP6579_COUPLE;P18_POP80P_COUPLE;P18_POP15P_MARIEE;P18_POP15P_PACSEE;P18_POP15P_CONCUB_UNION_LIBRE;P18_POP15P_VEUFS;P18_POP15P_DIVORCEE;P18_POP15P_CELIBATAIRE;C18_MEN_CS1;C18_MEN_CS2;C18_MEN_CS3;C18_MEN_CS4;C18_MEN_CS5;C18_MEN_CS6;C18_MEN_CS7;C18_MEN_CS8;C18_PMEN_CS1;C18_PMEN_CS2;C18_PMEN_CS3;C18_PMEN_CS4;C18_PMEN_CS5;C18_PMEN_CS6;C18_PMEN_CS7;C18_PMEN_CS8;C18_FAM;C18_COUPAENF;C18_FAMMONO;C18_HMONO;C18_FMONO;C18_COUPSENF;C18_NE24F0;C18_NE24F1;C18_NE24F2;C18_NE24F3;C18_NE24F4P;C13_MEN;C13_MENPSEUL;C13_MENHSEUL;C13_MENFSEUL;C13_MENSFAM;C13_MENFAM;C13_MENCOUPSENF;C13_MENCOUPAENF;C13_MENFAMMONO;C13_PMEN;C13_PMEN_MENPSEUL;C13_PMEN_MENHSEUL;C13_PMEN_MENFSEUL;C13_PMEN_MENSFAM;C13_PMEN_MENFAM;C13_PMEN_MENCOUPSENF;C13_PMEN_MENCOUPAENF;C13_PMEN_MENFAMMONO;P13_POP15P;P13_POP1519;P13_POP2024;P13_POP2539;P13_POP4054;P13_POP5564;P13_POP6579;P13_POP80P;P13_POPMEN1519;P13_POPMEN2024;P13_POPMEN2539;P13_POPMEN4054;P13_POPMEN5564;P13_POPMEN6579;P13_POPMEN80P;P13_POP1519_PSEUL;P13_POP2024_PSEUL;P13_POP2539_PSEUL;P13_POP4054_PSEUL;P13_POP5564_PSEUL;P13_POP6579_PSEUL;P13_POP80P_PSEUL;P13_POP1519_COUPLE;P13_POP2024_COUPLE;P13_POP2539_COUPLE;P13_POP4054_COUPLE;P13_POP5564_COUPLE;P13_POP6579_COUPLE;P13_POP80P_COUPLE;P13_POP15P_MARIEE;P13_POP15P_NONMARIEE;C13_MEN_CS1;C13_MEN_CS2;C13_MEN_CS3;C13_MEN_CS4;C13_MEN_CS5;C13_MEN_CS6;C13_MEN_CS7;C13_MEN_CS8;C13_PMEN_CS1;C13_PMEN_CS2;C13_PMEN_CS3;C13_PMEN_CS4;C13_PMEN_CS5;C13_PMEN_CS6;C13_PMEN_CS7;C13_PMEN_CS8;C13_FAM;C13_COUPAENF;C13_FAMMONO;C13_HMONO;C13_FMONO;C13_COUPSENF;C13_NE24F0;C13_NE24F1;C13_NE24F2;C13_NE24F3;C13_NE24F4P;C08_MEN;C08_MENPSEUL;C08_MENHSEUL;C08_MENFSEUL;C08_MENSFAM;C08_MENFAM;C08_MENCOUPSENF;C08_MENCOUPAENF;C08_MENFAMMONO;C08_PMEN;C08_PMEN_MENPSEUL;C08_PMEN_MENHSEUL;C08_PMEN_MENFSEUL;C08_PMEN_MENSFAM;C08_PMEN_MENFAM;C08_PMEN_MENCOUPSENF;C08_PMEN_MENCOUPAENF;C08_PMEN_MENFAMMONO;P08_POP15P;P08_POP1519;P08_POP2024;P08_POP2539;P08_POP4054;P08_POP5564;P08_POP6579;P08_POP80P;P08_POPMEN1519;P08_POPMEN2024;P08_POPMEN2539;P08_POPMEN4054;P08_POPMEN5564;P08_POPMEN6579;P08_POPMEN80P;P08_POP1519_PSEUL;P08_POP2024_PSEUL;P08_POP2539_PSEUL;P08_POP4054_PSEUL;P08_POP5564_PSEUL;P08_POP6579_PSEUL;P08_POP80P_PSEUL;P08_POP1519_COUPLE;P08_POP2024_COUPLE;P08_POP2539_COUPLE;P08_POP4054_COUPLE;P08_POP5564_COUPLE;P08_POP6579_COUPLE;P08_POP80P_COUPLE;P08_POP15P_MARIE;P08_POP15P_CELIB;P08_POP15P_VEUF;P08_POP15P_DIVOR;C08_MEN_CS1;C08_MEN_CS2;C08_MEN_CS3;C08_MEN_CS4;C08_MEN_CS5;C08_MEN_CS6;C08_MEN_CS7;C08_MEN_CS8;C08_PMEN_CS1;C08_PMEN_CS2;C08_PMEN_CS3;C08_PMEN_CS4;C08_PMEN_CS5;C08_PMEN_CS6;C08_PMEN_CS7;C08_PMEN_CS8;C08_FAM;C08_COUPAENF;C08_FAMMONO;C08_HMONO;C08_FMONO;C08_COUPSENF;C08_NE24F0;C08_NE24F1;C08_NE24F2;C08_NE24F3;C08_NE24F4P;P18_LOG;P18_RP;P18_RSECOCC;P18_LOGVAC;P18_MAISON;P18_APPART;P18_RP_1P;P18_RP_2P;P18_RP_3P;P18_RP_4P;P18_RP_5PP;P18_NBPI_RP;P18_RPMAISON;P18_NBPI_RPMAISON;P18_RPAPPART;P18_NBPI_RPAPPART;C18_RP_HSTU1P;C18_RP_HSTU1P_SUROCC;P18_RP_ACHTOT;P18_RP_ACH19;P18_RP_ACH45;P18_RP_ACH70;P18_RP_ACH90;P18_RP_ACH05;P18_RP_ACH15;P18_RPMAISON_ACH19;P18_RPMAISON_ACH45;P18_RPMAISON_ACH70;P18_RPMAISON_ACH90;P18_RPMAISON_ACH05;P18_RPMAISON_ACH15;P18_RPAPPART_ACH19;P18_RPAPPART_ACH45;P18_RPAPPART_ACH70;P18_RPAPPART_ACH90;P18_RPAPPART_ACH05;P18_RPAPPART_ACH15;P18_MEN;P18_MEN_ANEM0002;P18_MEN_ANEM0204;P18_MEN_ANEM0509;P18_MEN_ANEM10P;P18_MEN_ANEM1019;P18_MEN_ANEM2029;P18_MEN_ANEM30P;P18_PMEN;P18_PMEN_ANEM0002;P18_PMEN_ANEM0204;P18_PMEN_ANEM0509;P18_PMEN_ANEM10P;P18_NBPI_RP_ANEM0002;P18_NBPI_RP_ANEM0204;P18_NBPI_RP_ANEM0509;P18_NBPI_RP_ANEM10P;P18_RP_PROP;P18_RP_LOC;P18_RP_LOCHLMV;P18_RP_GRAT;P18_NPER_RP;P18_NPER_RP_PROP;P18_NPER_RP_LOC;P18_NPER_RP_LOCHLMV;P18_NPER_RP_GRAT;P18_ANEM_RP;P18_ANEM_RP_PROP;P18_ANEM_RP_LOC;P18_ANEM_RP_LOCHLMV;P18_ANEM_RP_GRAT;P18_RP_SDB;P18_RP_CCCOLL;P18_RP_CCIND;P18_RP_CINDELEC;P18_RP_ELEC;P18_RP_EAUCH;P18_RP_BDWC;P18_RP_CHOS;P18_RP_CLIM;P18_RP_TTEGOU;P18_RP_GARL;P18_RP_VOIT1P;P18_RP_VOIT1;P18_RP_VOIT2P;P18_RP_HABFOR;P18_RP_CASE;P18_RP_MIBOIS;P18_RP_MIDUR;P13_LOG;P13_RP;P13_RSECOCC;P13_LOGVAC;P13_MAISON;P13_APPART;P13_RP_1P;P13_RP_2P;P13_RP_3P;P13_RP_4P;P13_RP_5PP;P13_NBPI_RP;P13_RPMAISON;P13_NBPI_RPMAISON;P13_RPAPPART;P13_NBPI_RPAPPART;P13_RP_ACHTOT;P13_RP_ACH19;P13_RP_ACH45;P13_RP_ACH70;P13_RP_ACH90;P13_RP_ACH05;P13_RP_ACH10;P13_RPMAISON_ACH19;P13_RPMAISON_ACH45;P13_RPMAISON_ACH70;P13_RPMAISON_ACH90;P13_RPMAISON_ACH05;P13_RPMAISON_ACH10;P13_RPAPPART_ACH19;P13_RPAPPART_ACH45;P13_RPAPPART_ACH70;P13_RPAPPART_ACH90;P13_RPAPPART_ACH05;P13_RPAPPART_ACH10;P13_MEN;P13_MEN_ANEM0002;P13_MEN_ANEM0204;P13_MEN_ANEM0509;P13_MEN_ANEM10P;P13_MEN_ANEM1019;P13_MEN_ANEM2029;P13_MEN_ANEM30P;P13_PMEN;P13_PMEN_ANEM0002;P13_PMEN_ANEM0204;P13_PMEN_ANEM0509;P13_PMEN_ANEM10P;P13_NBPI_RP_ANEM0002;P13_NBPI_RP_ANEM0204;P13_NBPI_RP_ANEM0509;P13_NBPI_RP_ANEM10P;P13_RP_PROP;P13_RP_LOC;P13_RP_LOCHLMV;P13_RP_GRAT;P13_NPER_RP;P13_NPER_RP_PROP;P13_NPER_RP_LOC;P13_NPER_RP_LOCHLMV;P13_NPER_RP_GRAT;P13_ANEM_RP;P13_ANEM_RP_PROP;P13_ANEM_RP_LOC;P13_ANEM_RP_LOCHLMV;P13_ANEM_RP_GRAT;P13_RP_SDB;P13_RP_CCCOLL;P13_RP_CCIND;P13_RP_CINDELEC;P13_RP_ELEC;P13_RP_EAUCH;P13_RP_BDWC;P13_RP_CHOS;P13_RP_CLIM;P13_RP_TTEGOU;P13_RP_GARL;P13_RP_VOIT1P;P13_RP_VOIT1;P13_RP_VOIT2P;P13_RP_HABFOR;P13_RP_CASE;P13_RP_MIBOIS;P13_RP_MIDUR;P08_LOG;P08_RP;P08_RSECOCC;P08_LOGVAC;P08_MAISON;P08_APPART;P08_RP_1P;P08_RP_2P;P08_RP_3P;P08_RP_4P;P08_RP_5PP;P08_NBPI_RP;P08_RPMAISON;P08_NBPI_RPMAISON;P08_RPAPPART;P08_NBPI_RPAPPART;P08_RP_ACHTT;P08_RP_ACHT1;P08_RP_ACHT2;P08_RP_ACHT3;P08_RP_ACHT4;P08_RPMAISON_ACHT1;P08_RPMAISON_ACHT2;P08_RPMAISON_ACHT3;P08_RPMAISON_ACHT4;P08_RPAPPART_ACHT1;P08_RPAPPART_ACHT2;P08_RPAPPART_ACHT3;P08_RPAPPART_ACHT4;P08_MEN;P08_MEN_ANEM0002;P08_MEN_ANEM0204;P08_MEN_ANEM0509;P08_MEN_ANEM10P;P08_MEN_ANEM1019;P08_MEN_ANEM2029;P08_MEN_ANEM30P;P08_PMEN;P08_PMEN_ANEM0002;P08_PMEN_ANEM0204;P08_PMEN_ANEM0509;P08_PMEN_ANEM10P;P08_NBPI_RP_ANEM0002;P08_NBPI_RP_ANEM0204;P08_NBPI_RP_ANEM0509;P08_NBPI_RP_ANEM10P;P08_RP_PROP;P08_RP_LOC;P08_RP_LOCHLMV;P08_RP_GRAT;P08_NPER_RP;P08_NPER_RP_PROP;P08_NPER_RP_LOC;P08_NPER_RP_LOCHLMV;P08_NPER_RP_GRAT;P08_ANEM_RP;P08_ANEM_RP_PROP;P08_ANEM_RP_LOC;P08_ANEM_RP_LOCHLMV;P08_ANEM_RP_GRAT;P08_RP_SDB;P08_RP_CCCOLL;P08_RP_CCIND;P08_RP_CINDELEC;P08_RP_ELEC;P08_RP_EAUCH;P08_RP_BDWC;P08_RP_CHOS;P08_RP_CLIM;P08_RP_TTEGOU;P08_RP_GARL;P08_RP_VOIT1P;P08_RP_VOIT1;P08_RP_VOIT2P;P08_RP_HABFOR;P08_RP_CASE;P08_RP_MIBOIS;P08_RP_MIDUR;P18_POP0205;P18_POP0610;P18_POP1114;P18_POP1517;P18_POP1824;P18_POP2529;P18_POP30P;P18_SCOL0205;P18_SCOL0610;P18_SCOL1114;P18_SCOL1517;P18_SCOL1824;P18_SCOL2529;P18_SCOL30P;P18_H0205;P18_H0610;P18_H1114;P18_H1517;P18_H1824;P18_H2529;P18_H30P;P18_HSCOL0205;P18_HSCOL0610;P18_HSCOL1114;P18_HSCOL1517;P18_HSCOL1824;P18_HSCOL2529;P18_HSCOL30P;P18_F0205;P18_F0610;P18_F1114;P18_F1517;P18_F1824;P18_F2529;P18_F30P;P18_FSCOL0205;P18_FSCOL0610;P18_FSCOL1114;P18_FSCOL1517;P18_FSCOL1824;P18_FSCOL2529;P18_FSCOL30P;P18_NSCOL15P;P18_NSCOL15P_DIPLMIN;P18_NSCOL15P_BEPC;P18_NSCOL15P_CAPBEP;P18_NSCOL15P_BAC;P18_NSCOL15P_SUP2;P18_NSCOL15P_SUP34;P18_NSCOL15P_SUP5;P18_HNSCOL15P;P18_HNSCOL15P_DIPLMIN;P18_HNSCOL15P_BEPC;P18_HNSCOL15P_CAPBEP;P18_HNSCOL15P_BAC;P18_HNSCOL15P_SUP2;P18_HNSCOL15P_SUP34;P18_HNSCOL15P_SUP5;P18_FNSCOL15P;P18_FNSCOL15P_DIPLMIN;P18_FNSCOL15P_BEPC;P18_FNSCOL15P_CAPBEP;P18_FNSCOL15P_BAC;P18_FNSCOL15P_SUP2;P18_FNSCOL15P_SUP34;P18_FNSCOL15P_SUP5;P13_POP0205;P13_POP0610;P13_POP1114;P13_POP1517;P13_POP1824;P13_POP2529;P13_POP30P;P13_SCOL0205;P13_SCOL0610;P13_SCOL1114;P13_SCOL1517;P13_SCOL1824;P13_SCOL2529;P13_SCOL30P;P13_H0205;P13_H0610;P13_H1114;P13_H1517;P13_H1824;P13_H2529;P13_H30P;P13_HSCOL0205;P13_HSCOL0610;P13_HSCOL1114;P13_HSCOL1517;P13_HSCOL1824;P13_HSCOL2529;P13_HSCOL30P;P13_F0205;P13_F0610;P13_F1114;P13_F1517;P13_F1824;P13_F2529;P13_F30P;P13_FSCOL0205;P13_FSCOL0610;P13_FSCOL1114;P13_FSCOL1517;P13_FSCOL1824;P13_FSCOL2529;P13_FSCOL30P;P13_NSCOL15P;P13_NSCOL15P_DIPLMIN;P13_NSCOL15P_CAPBEP;P13_NSCOL15P_BAC;P13_NSCOL15P_SUP;P13_HNSCOL15P;P13_HNSCOL15P_DIPLMIN;P13_HNSCOL15P_CAPBEP;P13_HNSCOL15P_BAC;P13_HNSCOL15P_SUP;P13_FNSCOL15P;P13_FNSCOL15P_DIPLMIN;P13_FNSCOL15P_CAPBEP;P13_FNSCOL15P_BAC;P13_FNSCOL15P_SUP;P08_POP0205;P08_POP0610;P08_POP1114;P08_POP1517;P08_POP1824;P08_POP2529;P08_POP30P;P08_SCOL0205;P08_SCOL0610;P08_SCOL1114;P08_SCOL1517;P08_SCOL1824;P08_SCOL2529;P08_SCOL30P;P08_H0205;P08_H0610;P08_H1114;P08_H1517;P08_H1824;P08_H2529;P08_H30P;P08_HSCOL0205;P08_HSCOL0610;P08_HSCOL1114;P08_HSCOL1517;P08_HSCOL1824;P08_HSCOL2529;P08_HSCOL30P;P08_F0205;P08_F0610;P08_F1114;P08_F1517;P08_F1824;P08_F2529;P08_F30P;P08_FSCOL0205;P08_FSCOL0610;P08_FSCOL1114;P08_FSCOL1517;P08_FSCOL1824;P08_FSCOL2529;P08_FSCOL30P;P08_NSCOL15P;P08_NSCOL15P_DIPL0;P08_NSCOL15P_CEP;P08_NSCOL15P_BEPC;P08_NSCOL15P_CAPBEP;P08_NSCOL15P_BAC;P08_NSCOL15P_BACP2;P08_NSCOL15P_SUP;P08_HNSCOL15P;P08_HNSCOL15P_DIPL0;P08_HNSCOL15P_CEP;P08_HNSCOL15P_BEPC;P08_HNSCOL15P_CAPBEP;P08_HNSCOL15P_BAC;P08_HNSCOL15P_BACP2;P08_HNSCOL15P_SUP;P08_FNSCOL15P;P08_FNSCOL15P_DIPL0;P08_FNSCOL15P_CEP;P08_FNSCOL15P_BEPC;P08_FNSCOL15P_CAPBEP;P08_FNSCOL15P_BAC;P08_FNSCOL15P_BACP2;P08_FNSCOL15P_SUP;P18_POP1564;P18_POP1524;P18_POP2554;P18_H1564;P18_H1524;P18_H2554;P18_H5564;P18_F1564;P18_F1524;P18_F2554;P18_F5564;P18_ACT1564;P18_ACT1524;P18_ACT2554;P18_ACT5564;P18_HACT1564;P18_HACT1524;P18_HACT2554;P18_HACT5564;P18_FACT1564;P18_FACT1524;P18_FACT2554;P18_FACT5564;P18_ACTOCC1564;P18_ACTOCC1524;P18_ACTOCC2554;P18_ACTOCC5564;P18_HACTOCC1564;P18_HACTOCC1524;P18_HACTOCC2554;P18_HACTOCC5564;P18_FACTOCC1564;P18_FACTOCC1524;P18_FACTOCC2554;P18_FACTOCC5564;P18_CHOM1564;P18_HCHOM1564;P18_HCHOM1524;P18_HCHOM2554;P18_HCHOM5564;P18_FCHOM1564;P18_FCHOM1524;P18_FCHOM2554;P18_FCHOM5564;P18_INACT1564;P18_ETUD1564;P18_RETR1564;P18_AINACT1564;C18_ACT1564;C18_ACT1564_CS1;C18_ACT1564_CS2;C18_ACT1564_CS3;C18_ACT1564_CS4;C18_ACT1564_CS5;C18_ACT1564_CS6;C18_ACTOCC1564;C18_ACTOCC1564_CS1;C18_ACTOCC1564_CS2;C18_ACTOCC1564_CS3;C18_ACTOCC1564_CS4;C18_ACTOCC1564_CS5;C18_ACTOCC1564_CS6;P18_EMPLT;P18_ACTOCC;P18_ACT15P;P18_EMPLT_SAL;P18_EMPLT_FSAL;P18_EMPLT_SALTP;P18_EMPLT_NSAL;P18_EMPLT_FNSAL;P18_EMPLT_NSALTP;C18_EMPLT;C18_EMPLT_CS1;C18_EMPLT_CS2;C18_EMPLT_CS3;C18_EMPLT_CS4;C18_EMPLT_CS5;C18_EMPLT_CS6;C18_EMPLT_AGRI;C18_EMPLT_INDUS;C18_EMPLT_CONST;C18_EMPLT_CTS;C18_EMPLT_APESAS;C18_EMPLT_F;C18_AGRILT_F;C18_INDUSLT_F;C18_CONSTLT_F;C18_CTSLT_F;C18_APESASLT_F;C18_EMPLT_SAL;C18_AGRILT_SAL;C18_INDUSLT_SAL;C18_CONSTLT_SAL;C18_CTSLT_SAL;C18_APESASLT_SAL;C18_AGRILT_FSAL;C18_INDUSLT_FSAL;C18_CONSTLT_FSAL;C18_CTSLT_FSAL;C18_APESASLT_FSAL;C18_AGRILT_NSAL;C18_INDUSLT_NSAL;C18_CONSTLT_NSAL;C18_CTSLT_NSAL;C18_APESASLT_NSAL;C18_AGRILT_FNSAL;C18_INDUSLT_FNSAL;C18_CONSTLT_FNSAL;C18_CTSLT_FNSAL;C18_APESASLT_FNSAL;P13_POP1564;P13_POP1524;P13_POP2554;P13_H1564;P13_H1524;P13_H2554;P13_H5564;P13_F1564;P13_F1524;P13_F2554;P13_F5564;P13_ACT1564;P13_ACT1524;P13_ACT2554;P13_ACT5564;P13_HACT1564;P13_HACT1524;P13_HACT2554;P13_HACT5564;P13_FACT1564;P13_FACT1524;P13_FACT2554;P13_FACT5564;P13_ACTOCC1564;P13_ACTOCC1524;P13_ACTOCC2554;P13_ACTOCC5564;P13_HACTOCC1564;P13_HACTOCC1524;P13_HACTOCC2554;P13_HACTOCC5564;P13_FACTOCC1564;P13_FACTOCC1524;P13_FACTOCC2554;P13_FACTOCC5564;P13_CHOM1564;P13_HCHOM1564;P13_HCHOM1524;P13_HCHOM2554;P13_HCHOM5564;P13_FCHOM1564;P13_FCHOM1524;P13_FCHOM2554;P13_FCHOM5564;P13_INACT1564;P13_ETUD1564;P13_RETR1564;P13_AINACT1564;C13_ACT1564;C13_ACT1564_CS1;C13_ACT1564_CS2;C13_ACT1564_CS3;C13_ACT1564_CS4;C13_ACT1564_CS5;C13_ACT1564_CS6;C13_ACTOCC1564;C13_ACTOCC1564_CS1;C13_ACTOCC1564_CS2;C13_ACTOCC1564_CS3;C13_ACTOCC1564_CS4;C13_ACTOCC1564_CS5;C13_ACTOCC1564_CS6;P13_EMPLT;P13_ACTOCC;P13_ACT15P;P13_EMPLT_SAL;P13_EMPLT_FSAL;P13_EMPLT_SALTP;P13_EMPLT_NSAL;P13_EMPLT_FNSAL;P13_EMPLT_NSALTP;C13_EMPLT;C13_EMPLT_CS1;C13_EMPLT_CS2;C13_EMPLT_CS3;C13_EMPLT_CS4;C13_EMPLT_CS5;C13_EMPLT_CS6;C13_EMPLT_AGRI;C13_EMPLT_INDUS;C13_EMPLT_CONST;C13_EMPLT_CTS;C13_EMPLT_APESAS;C13_EMPLT_F;C13_AGRILT_F;C13_INDUSLT_F;C13_CONSTLT_F;C13_CTSLT_F;C13_APESASLT_F;C13_EMPLT_SAL;C13_AGRILT_SAL;C13_INDUSLT_SAL;C13_CONSTLT_SAL;C13_CTSLT_SAL;C13_APESASLT_SAL;C13_AGRILT_FSAL;C13_INDUSLT_FSAL;C13_CONSTLT_FSAL;C13_CTSLT_FSAL;C13_APESASLT_FSAL;C13_AGRILT_NSAL;C13_INDUSLT_NSAL;C13_CONSTLT_NSAL;C13_CTSLT_NSAL;C13_APESASLT_NSAL;C13_AGRILT_FNSAL;C13_INDUSLT_FNSAL;C13_CONSTLT_FNSAL;C13_CTSLT_FNSAL;C13_APESASLT_FNSAL;P08_POP1564;P08_H1564;P08_H1524;P08_H2554;P08_H5564;P08_F1564;P08_F1524;P08_F2554;P08_F5564;P08_ACT1564;P08_ACT1524;P08_ACT2554;P08_ACT5564;P08_HACT1564;P08_HACT1524;P08_HACT2554;P08_HACT5564;P08_FACT1564;P08_FACT1524;P08_FACT2554;P08_FACT5564;P08_ACTOCC1564;P08_ACTOCC1524;P08_ACTOCC2554;P08_ACTOCC5564;P08_HACTOCC1564;P08_HACTOCC1524;P08_HACTOCC2554;P08_HACTOCC5564;P08_FACTOCC1564;P08_FACTOCC1524;P08_FACTOCC2554;P08_FACTOCC5564;P08_CHOM1564;P08_HCHOM1564;P08_HCHOM1524;P08_HCHOM2554;P08_HCHOM5564;P08_FCHOM1564;P08_FCHOM1524;P08_FCHOM2554;P08_FCHOM5564;P08_INACT1564;P08_ETUD1564;P08_RETR1564;P08_AINACT1564;C08_ACT1564;C08_ACT1564_CS1;C08_ACT1564_CS2;C08_ACT1564_CS3;C08_ACT1564_CS4;C08_ACT1564_CS5;C08_ACT1564_CS6;C08_ACTOCC1564;C08_ACTOCC1564_CS1;C08_ACTOCC1564_CS2;C08_ACTOCC1564_CS3;C08_ACTOCC1564_CS4;C08_ACTOCC1564_CS5;C08_ACTOCC1564_CS6;P08_EMPLT;P08_ACTOCC;P08_ACT15P;P08_EMPLT_SAL;P08_EMPLT_FSAL;P08_EMPLT_SALTP;P08_EMPLT_NSAL;P08_EMPLT_FNSAL;P08_EMPLT_NSALTP;C08_EMPLT;C08_EMPLT_CS1;C08_EMPLT_CS2;C08_EMPLT_CS3;C08_EMPLT_CS4;C08_EMPLT_CS5;C08_EMPLT_CS6;C08_EMPLT_AGRI;C08_EMPLT_INDUS;C08_EMPLT_CONST;C08_EMPLT_CTS;C08_EMPLT_APESAS;C08_EMPLT_F;C08_AGRILT_F;C08_INDUSLT_F;C08_CONSTLT_F;C08_CTSLT_F;C08_APESASLT_F;C08_EMPLT_SAL;C08_AGRILT_SAL;C08_INDUSLT_SAL;C08_CONSTLT_SAL;C08_CTSLT_SAL;C08_APESASLT_SAL;C08_AGRILT_FSAL;C08_INDUSLT_FSAL;C08_CONSTLT_FSAL;C08_CTSLT_FSAL;C08_APESASLT_FSAL;C08_AGRILT_NSAL;C08_INDUSLT_NSAL;C08_CONSTLT_NSAL;C08_CTSLT_NSAL;C08_APESASLT_NSAL;C08_AGRILT_FNSAL;C08_INDUSLT_FNSAL;C08_CONSTLT_FNSAL;C08_CTSLT_FNSAL;C08_APESASLT_FNSAL;P18_ACTOCC15P;P18_SAL15P;P18_NSAL15P;P18_ACTOCC15P_TP;P18_SAL15P_TP;P18_HSAL15P_TP;P18_FSAL15P_TP;P18_NSAL15P_TP;P18_HACTOCC15P;P18_HSAL15P;P18_HSAL15P_CDI;P18_HSAL15P_CDD;P18_HSAL15P_INTERIM;P18_HSAL15P_EMPAID;P18_HSAL15P_APPR;P18_HNSAL15P;P18_HNSAL15P_INDEP;P18_HNSAL15P_EMPLOY;P18_HNSAL15P_AIDFAM;P18_FACTOCC15P;P18_FSAL15P;P18_FSAL15P_CDI;P18_FSAL15P_CDD;P18_FSAL15P_INTERIM;P18_FSAL15P_EMPAID;P18_FSAL15P_APPR;P18_FNSAL15P;P18_FNSAL15P_INDEP;P18_FNSAL15P_EMPLOY;P18_FNSAL15P_AIDFAM;P18_HSAL1564;P18_HSAL1524;P18_HSAL2554;P18_HSAL5564;P18_HSAL1564_TP;P18_HSAL1524_TP;P18_HSAL2554_TP;P18_HSAL5564_TP;P18_FSAL1564;P18_FSAL1524;P18_FSAL2554;P18_FSAL5564;P18_FSAL1564_TP;P18_FSAL1524_TP;P18_FSAL2554_TP;P18_FSAL5564_TP;P18_ACTOCC15P_ILT1;P18_ACTOCC15P_ILT2P;P18_ACTOCC15P_ILT2;P18_ACTOCC15P_ILT3;P18_ACTOCC15P_ILT4;P18_ACTOCC15P_ILT5;P18_ACTOCC15P_PASTRANS;P18_ACTOCC15P_MARCHE;P18_ACTOCC15P_VELO;P18_ACTOCC15P_2ROUESMOT;P18_ACTOCC15P_VOITURE;P18_ACTOCC15P_COMMUN;P13_ACTOCC15P;P13_SAL15P;P13_NSAL15P;P13_ACTOCC15P_TP;P13_SAL15P_TP;P13_HSAL15P_TP;P13_FSAL15P_TP;P13_NSAL15P_TP;P13_HACTOCC15P;P13_HSAL15P;P13_HSAL15P_CDI;P13_HSAL15P_CDD;P13_HSAL15P_INTERIM;P13_HSAL15P_EMPAID;P13_HSAL15P_APPR;P13_HNSAL15P;P13_HNSAL15P_INDEP;P13_HNSAL15P_EMPLOY;P13_HNSAL15P_AIDFAM;P13_FACTOCC15P;P13_FSAL15P;P13_FSAL15P_CDI;P13_FSAL15P_CDD;P13_FSAL15P_INTERIM;P13_FSAL15P_EMPAID;P13_FSAL15P_APPR;P13_FNSAL15P;P13_FNSAL15P_INDEP;P13_FNSAL15P_EMPLOY;P13_FNSAL15P_AIDFAM;P13_HSAL1564;P13_HSAL1524;P13_HSAL2554;P13_HSAL5564;P13_HSAL1564_TP;P13_HSAL1524_TP;P13_HSAL2554_TP;P13_HSAL5564_TP;P13_FSAL1564;P13_FSAL1524;P13_FSAL2554;P13_FSAL5564;P13_FSAL1564_TP;P13_FSAL1524_TP;P13_FSAL2554_TP;P13_FSAL5564_TP;P13_ACTOCC15P_ILT1;P13_ACTOCC15P_ILT2P;P13_ACTOCC15P_ILT2;P13_ACTOCC15P_ILT3;P13_ACTOCC15P_ILT4;P13_ACTOCC15P_ILT5;P13_ACTOCC15P_PASTRANS;P13_ACTOCC15P_MARCHE;P13_ACTOCC15P_2ROUES;P13_ACTOCC15P_VOITURE;P13_ACTOCC15P_COMMUN;P08_ACTOCC15P;P08_SAL15P;P08_NSAL15P;P08_ACTOCC15P_TP;P08_SAL15P_TP;P08_HSAL15P_TP;P08_FSAL15P_TP;P08_NSAL15P_TP;P08_HACTOCC15P;P08_HSAL15P;P08_HSAL15P_CDI;P08_HSAL15P_CDD;P08_HSAL15P_INTERIM;P08_HSAL15P_EMPAID;P08_HSAL15P_APPR;P08_HNSAL15P;P08_HNSAL15P_INDEP;P08_HNSAL15P_EMPLOY;P08_HNSAL15P_AIDFAM;P08_FACTOCC15P;P08_FSAL15P;P08_FSAL15P_CDI;P08_FSAL15P_CDD;P08_FSAL15P_INTERIM;P08_FSAL15P_EMPAID;P08_FSAL15P_APPR;P08_FNSAL15P;P08_FNSAL15P_INDEP;P08_FNSAL15P_EMPLOY;P08_FNSAL15P_AIDFAM;P08_HSAL1564;P08_HSAL1524;P08_HSAL2554;P08_HSAL5564;P08_HSAL1564_TP;P08_HSAL1524_TP;P08_HSAL2554_TP;P08_HSAL5564_TP;P08_FSAL1564;P08_FSAL1524;P08_FSAL2554;P08_FSAL5564;P08_FSAL1564_TP;P08_FSAL1524_TP;P08_FSAL2554_TP;P08_FSAL5564_TP;P08_ACTOCC15P_ILT1;P08_ACTOCC15P_ILT2P;P08_ACTOCC15P_ILT2;P08_ACTOCC15P_ILT3;P08_ACTOCC15P_ILT4;P08_ACTOCC15P_ILT5;D99_POP;D90_POP;D82_POP;D75_POP;D68_POP;SUPERF;NAIS1318;NAIS0813;NAIS9908;NAIS9099;NAIS8290;NAIS7582;NAIS6875;DECE1318;DECE0813;DECE9908;DECE9099;DECE8290;DECE7582;DECE6875;D99_LOG;D90_LOG;D82_LOG;D75_LOG;D68_LOG;D99_RP;D90_RP;D82_RP;D75_RP;D68_RP;D99_RSECOCC;D90_RSECOCC;D82_RSECOCC;D75_RSECOCC;D68_RSECOCC;D99_LOGVAC;D90_LOGVAC;D82_LOGVAC;D75_LOGVAC;D68_LOGVAC;D99_PMEN;D90_NPER_RP;D82_NPER_RP;D75_NPER_RP;D68_NPER_RP;NAISD14;NAISD15;NAISD16;NAISD17;NAISD18;NAISD19;NAISD20;DECESD14;DECESD15;DECESD16;DECESD17;DECESD18;DECESD19;DECESD20;NBMENFISC18;NBPERSMENFISC18;MED18;PIMP18;TP6018;TP60AGE118;TP60AGE218;TP60AGE318;TP60AGE418;TP60AGE518;TP60AGE618;TP60TOL118;TP60TOL218;PACT18;PTSA18;PCHO18;PBEN18;PPEN18;PPAT18;PPSOC18;PPFAM18;PPMINI18;PPLOGT18;PIMPOT18;D118;D918;RD18;SNHM19;SNHMC19;SNHMP19;SNHME19;SNHMO19;SNHMF19;SNHMFC19;SNHMFP19;SNHMFE19;SNHMFO19;SNHMH19;SNHMHC19;SNHMHP19;SNHMHE19;SNHMHO19;SNHM1819;SNHM2619;SNHM5019;SNHMF1819;SNHMF2619;SNHMF5019;SNHMH1819;SNHMH2619;SNHMH5019;ETTOT18;ETAZ18;ETBE18;ETFZ18;ETGU18;ETGZ18;ETOQ18;ETTEF018;ETAZ018;ETBE018;ETFZ018;ETGU018;ETGZ018;ETOQ018;ETTEF118;ETAZ118;ETBE118;ETFZ118;ETGU118;ETGZ118;ETOQ118;ETTEF1018;ETAZ1018;ETBE1018;ETFZ1018;ETGU1018;ETGZ1018;ETOQ1018;ETTEF2018;ETAZ2018;ETBE2018;ETFZ2018;ETGU2018;ETGZ2018;ETOQ2018;ETTEF5018;ETAZ5018;ETBE5018;ETFZ5018;ETGU5018;ETGZ5018;ETOQ5018;ETPTOT18;ETPAZ18;ETPBE18;ETPFZ18;ETPGU18;ETPGZ18;ETPOQ18;ETPTEF118;ETPAZ118;ETPBE118;ETPFZ118;ETPGU118;ETPGZ118;ETPOQ118;ETPTEF1018;ETPAZ1018;ETPBE1018;ETPFZ1018;ETPGU1018;ETPGZ1018;ETPOQ1018;ETPTEF2018;ETPAZ2018;ETPBE2018;ETPFZ2018;ETPGU2018;ETPGZ2018;ETPOQ2018;ETPTEF5018;ETPAZ5018;ETPBE5018;ETPFZ5018;ETPGU5018;ETPGZ5018;ETPOQ5018;ETPTEFCP18;ETPAZCP18;ETPBECP18;ETPFZCP18;ETPGUCP18;ETPGZCP18;ETPOQCP18;ETPRES18;ETNPRES18;ETPRESPUB18;ETNPRESPUB18;ETPPRES18;ETPNPRES18;ETPPRESPUB18;ETPNPRESPUB18;ETASSMAT18;ETAUTRES18;ENNTOT20;ENNBE20;ENNFZ20;ENNGI20;ENNJZ20;ENNKZ20;ENNLZ20;ENNMN20;ENNOQ20;ENNRU20;ENCTOT20;ENCBE20;ENCFZ20;ENCGI20;ENCJZ20;ENCKZ20;ENCLZ20;ENCMN20;ENCOQ20;ENCRU20;ENCTOT19;ENCTOT18;ENCTOT17;ENCTOT16;ENCTOT15;ENCTOT14;ENCTOT13;ENCTOT12;ENCTOT11;ENCITOT20;ENCIBE20;ENCIFZ20;ENCIGI20;ENCIJZ20;ENCIKZ20;ENCILZ20;ENCIMN20;ENCIOQ20;ENCIRU20;ENCITOT19;ENCITOT18;ENCITOT17;ENCITOT16;ENCITOT15;ENCITOT14;ENCITOT13;ENCITOT12;ENCITOT11;ETNTOT20;ETNBE20;ETNFZ20;ETNGI20;ETNJZ20;ETNKZ20;ETNLZ20;ETNMN20;ETNOQ20;ETNRU20;ETCTOT20;ETCBE20;ETCFZ20;ETCGI20;ETCJZ20;ETCKZ20;ETCLZ20;ETCMN20;ETCOQ20;ETCRU20;ETCTOT19;ETCBE19;ETCFZ19;ETCGI19;ETCJZ19;ETCKZ19;ETCLZ19;ETCMN19;ETCOQ19;ETCRU19;ETCTOT18;ETCBE18;ETCFZ18;ETCGI18;ETCJZ18;ETCKZ18;ETCLZ18;ETCMN18;ETCOQ18;ETCRU18;ETCTOT17;ETCBE17;ETCFZ17;ETCGI17;ETCJZ17;ETCKZ17;ETCLZ17;ETCMN17;ETCOQ17;ETCRU17;ETCTOT16;ETCBE16;ETCFZ16;ETCGI16;ETCJZ16;ETCKZ16;ETCLZ16;ETCMN16;ETCOQ16;ETCRU16;ETCTOT15;ETCBE15;ETCFZ15;ETCGI15;ETCJZ15;ETCKZ15;ETCLZ15;ETCMN15;ETCOQ15;ETCRU15;ETCTOT14;ETCBE14;ETCFZ14;ETCGI14;ETCJZ14;ETCKZ14;ETCLZ14;ETCMN14;ETCOQ14;ETCRU14;ETCTOT13;ETCBE13;ETCFZ13;ETCGI13;ETCJZ13;ETCKZ13;ETCLZ13;ETCMN13;ETCOQ13;ETCRU13;ETCTOT12;ETCBE12;ETCFZ12;ETCGI12;ETCJZ12;ETCKZ12;ETCLZ12;ETCMN12;ETCOQ12;ETCRU12;ETCTOT11;ETCBE11;ETCFZ11;ETCGI11;ETCJZ11;ETCKZ11;ETCLZ11;ETCMN11;ETCOQ11;ETCRU11;HT21;HT021;HT121;HT221;HT321;HT421;HT521;HTCH21;HTCH021;HTCH121;HTCH221;HTCH321;HTCH421;HTCH521;CPG21;CPG021;CPG121;CPG221;CPG321;CPG421;CPG521;CPGE21;CPGE021;CPGE121;CPGE221;CPGE321;CPGE421;CPGE521;CPGEL21;CPGEL021;CPGEL121;CPGEL221;CPGEL321;CPGEL421;CPGEL521;CPGEO21;CPGEO021;CPGEO121;CPGEO221;CPGEO321;CPGEO421;CPGEO521;VV21;VVUH21;VVLIT21;RT21;RTUH21;RTLIT21;AJCS21;AJCSUH21;AJCSLIT21`


