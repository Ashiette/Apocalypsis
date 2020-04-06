// ==UserScript==
// @name         Apo Stratégie test
// @namespace    J'ai pas de site !
// @version      0.1
// @description  Prenez de la force la galaxie - avec du SWAG !
// @author       Ash Morpheus
// @match        https://www.apocalypsis.org/strategie*
// @grant        none
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

/*
Script graphique de l'onglet Stratégie pour le site Apocalypsis.org
Développé par Ash Morpheus
Code libre de droits, sans attribution nécessaire, à l'unique condition de ne JAMAIS supprimer le footer "soutien"
Merci au système solaire de Julian Garnier (sous licence MIT pour distribution et modification libre)
*/

var b=1; // Definir variable globale b
var c=1;

/* Mettre en cache les infos sur les planètes */

$('.planet').each(function(){
    $(this).attr('id','plan'+b); // Attribuer une id à chaque div de planète
    window['p'+b] = $('div',this).attr('data-position').split("_"); // Pour chaque planète, enregistrer sa position
    window['pn'+b] = new Array(); // Déclarer array pn+b pour stocker les informations sur chaque planète
    window['pn'+b][0] = $('.map_item .item_label span', this).text(); // Attribue à pn+b[0] le nom de la planète
    window['pn'+b][1] = $('.tooltip .inner div:nth-child(3) span:nth-child(2)',this).text(); // Attribue à pn+b[1] le climat de la planète
    if($('div',this).hasClass('owned')) { window['pn'+b][2] = fxGetOwner();}
    else if ($('div',this).hasClass('known')){window['pn'+b][2] = fxGetOwner();}
    else {window['pn'+b][2] = "libre"} // Déterminer un possesseur pour chaque planète
    b++;
});

/* Mettre en cache les infos sur les PC */

$('.pc').each(function(){
    $(this).attr('id','pc'+c); // Attribuer une id à chaque div de PC
    window['ppc'+c] = $('div',this).attr('data-position').split("_"); // Pour chaque PC, enregistrer sa position
    window['pcn'+c] = new Array(); // Déclarer array cn+b pour stocker les commandants sur chaque PC
    let nbc = $('.tooltip .inner div',this).length; // Trouver le nombre de commandants par PC
    if (nbc>1) { // S'il y a au moins un commandant, faire un array des commandants
        fxGetFleet(nbc);
    } else { // Sinon dire qu'il n'y en a pas
        window['pcn'+c][0] = null;
    }
    c++;
});


/* Fonction trouver le propriétaire d'une planète */
    function fxGetOwner() {
        let nc = $('#plan'+b+' .tooltip .inner div:nth-child(4) span:nth-child(2)').text().split(" "); // Séparer le nom en fonction des espaces dans un array
        if (nc.length > 1) { // Exclusion des brigands de l'enlèvement du préfixe
            nc = fxRemovePrefix(nc);
        }
        return nc; // Retourner le nom du commandant
    }

/* Fonction pour enlever le préfixe cdt, etc. devant les noms */
    function fxRemovePrefix(x) {
        x.splice(0,1); // Enlever le préfixe (cdt, cdte, coa, etc.)
        let tnc = "";
        for (let i=0; i<x.length; i++) { // Recoller le nom sous forme de string text
            tnc += x[i] + " ";
        }
        x = tnc.slice(0,tnc.length-1); // Enlever le dernier espace inutile
        return x;
    }

/* Fonction pour déterminer les flottes présentes */
    function fxGetFleet(x) {
        for(let i=0; i<x; i++){
            let ii = i+2;
            let pcc = $('#pc'+c+' .tooltip .inner div:nth-child('+ii+')').text().split(" ");
            if (pcc.length > 1) { // Exclusion des brigands de l'enlèvement du préfixe
                pcc = fxRemovePrefix(pcc);
            }
            window['pcn'+c][i] = pcc;
        }
    }
