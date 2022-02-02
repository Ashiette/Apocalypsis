// ==UserScript==
// @name         [MOD] GammaBunta v0.1
// @namespace    [MOD] GammaBunta
// @match        https://www.apocalypsis.org/assemblee/viewforum
// @version      0.1
// @author       Ash Morpheus
// @description  MOD Visuel pour l'Assemblée Galactique de Apocalypsis, dans le but d'être généralisé à tout le site
// @require      http://code.jquery.com/jquery-3.6.0.min.js
// @require      https://code.jquery.com/ui/1.13.0/jquery-ui.js
// @resource     REMOTE_CSS https://madwar.fr/Apocalypsis/Tamper/style3.css
// @resource     REMOTE_HTM https://madwar.fr/Apocalypsis/Tamper/test3.1.htm
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

/* LOAD EXTERNAL RESOURCES */

// Charger le CSS et le HTML externe
const myCss = GM_getResourceText("REMOTE_CSS"); // Load External CSS
const myHtm = GM_getResourceText("REMOTE_HTM"); // Load base HTML

// Charger le CSS externe
GM_addStyle(myCss);
  
// Trouver l'URL de la page
var href = window.location.href.split('?');
href = href[0] + '?' + href[1]; // GET PAGE URI

/* GENERAL FUNCTIONS */

// Initier le script
function initiateAG() {
  
  // Assigner le HTML de la page à une variable
  let body = $('body').html();
  
  // Effacer le corps de la page et y mettre mon HTML
  $('body').removeClass().html(myHtm);
  
  // Initier le script
  makeHeaderAG(body);
  makePostListAG(body); // MAKE ASSEMBLEE-HEADER
  getResources($('.nav',body));
}

// Créer cookie
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// Charger cookie
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Fonction permettant de trouver la date d'un post en AG. Trouve la position de la date dans un Array
function getPostDate (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}

// Changer de page d'Assemblée
function changePageAG($selector) {
  
  // Lors du clic sur le lien envoyé
  $selector.click(function(ev) {
    
    // Empêcher l'action par défaut
    ev.stopImmediatePropagation();
    
    // Changer la location de la page
    href = $(this).attr('href');
    
    // Ouvrir la page et lister les posts
    $.get(href, function(data) {
      makePostListAG(data);
    });
    
    // Empêcher redirection
    return false;
  });
}

// Charger un post Assemblée
function openPostAG($selector) {
  
  // Lors du clic sur le lien envoyé
  $selector.click(function(ev){
    
    // Empêcher l'action par défaut
    ev.stopImmediatePropagation();
    
    // Faire apparaître le panneau central
    $('#assemblee-reader').css('display','flex');
    
    // Changer la location de la page
    href = $(this).attr('href');
    
    // Ouvrir a page et charger les posts
    $.get(href, function(data) {
      makePostContentAG(data);
    });
    
    //Empêcher redirection
    return false;
  });
}

// Créer le nom des commandants
function cleanAuthor() {
  
  // Fix requête
  const comnames = [];
  
  // Modifier chaque case nom de commandant
  $('.readeritem-author').each(function(){
    
    // Considérer par défaut qu'on est face à un commandant, et non une coalition
    let coalition = false;
    
    // Vérifier maintenant si on est face à une coalition
    if($('a',this).text().search('Coa.') == 0) { coalition = true; } // Petit fix pour détecter Coalition v/s commandant
    
    // Assigner une variable au lien qui mène à la page du nom d'auteur
    let authref = $('a',this).attr('href');
    
    // Assigner un nom d'auteur, sans caractères spéciaux pour stocker dans un cookie
    let authname = decodeURI(authref.replace('/showuser?e_cap=','').toLowerCase()).replace('+','').replace('’','').normalize("NFD").replace(/[\u0300-\u036f]/g, "");// (+fix Denior’back qui utilise des accents à la con bordel)
    
    // Décoder l'URL du commandant pour en extraire son vrai nom
    let author = decodeURI(authref.replace('/showuser?e_cap=','').replace(/\+/g,' ')); // Nom "réel" du commandant
    
    // Fonction pour aller chercher le titre du commandant. Si il a déjà été vérifié, il ne se lance pas
    if (comnames.includes(authname)) { 
      // Fix pour ne pas envoyer plusieurs requêtes
    } else {
      
      // Stocker la variable nom de commandant dans un Array
      comnames.push(authname);
      
      // Si c'est un commandant, vérifier son titre, autrement, dire que c'est une coalition
      if (coalition == false) {
        
        // Aller chercher le titre de la personne
        getCommanderTitle(authname,authref);
      } else {
        
        // Stocker une variable cookie qui vaut comme titre "Coalition"
        setCookie('coalition','Coalition',30);
        authname = 'coalition';
      }
    }
    
    // Aller chercher l'avatar du commandant
    if ($('img',this).attr('alt') == "Avatar") {
      avatar = $('img',this).attr('src');
    }
    
    // Assigner le Respect Diplomatique à une variable
    let rd = $(this).html().split('<br>')[1];
    
    // Assigner la date du post à une variable, c'est un peu à chier mais on fait avec ce qu'on a. Explication de comment ça fonctionne ligne suivante
    // Comme chaque ligne est séparée par un tag <br> il va classer les infos en effectuant cette séparation. 
    // Pour trouver la date on va donc lui demander d'aller chercher le terme "ETU" et de retourner la position du tableau où se trouve cette valeur. 
    // Comme la date est suivie d'autres données, on va séparer ces données, du mieux possible.
    let postdate = $(this).html().split('<br>')[getPostDate("ETU", $(this).html().split('<br>'))].split('<div')[0]; 
    
    // Vider le div des infos de l'auteur et y place les informations
    $(this).empty().append('<img src="'+avatar+'" class="post-author-image"><div class="post-author"><div class="post-author-title">'+getCookie(authname)+'</div><div class="post-author-name">'+author+'</div></div><div class="post-info"><div class="post-author-respect">'+rd+'</div><div id="post-date">'+postdate+'</div></div>');
    
    // Lorsque l'on clique sur l'avatar de l'auteur d'un post
    $('.post-author-image',this).click(function(ev){
      
      // Empêcher tout évènement
      ev.stopImmediatePropagation();
      
      // Ouvrir un dialogue flottant avec une classe commander-popin
      $('<div class="commander-popin">').dialog({
            modal: true,
            open: function (){
              
              // Utiliser la variable $dialog comme ancre
              $dialog = $(this);
              
              // Créer le contenu du dialogue
              makePopIn(authref);
            },         
            height: 600,
            width: 700,
            title: ''
        });
    });
  });
  
  // Déplacer la case 'Votez !' ou 'Détails' du post dans l'en-tête
  $('.readeritem').each(function(){
    
    // Apposer le vote en en-tête
    $('.post-info',this).append($('.posthead',this).html());
    
    // Supprimer l'ancien vote
    $('.readeritem-body .posthead',this).remove();
  });
}

// Fonction pour permettre d'envoyer un message ou demander une prévisualisation dans le popin sans redirection
function makePopInForm() {
  
  // Par défaut, on considère qu'on veut envoyer le post
  let preview = false;

  // Si on clique sur visualiser, alors il considère qu'on veut le prévisualiser
  $('form button[value="preview"]').click(function(){
    preview = true;
  });

  // Quand on soumet (prévisualiser ou envoyer)
  $('form',$dialog).submit(function(ev){
    
    // Vérifier si on cherche à trouver la page d'un commandant (méthode GET), sinon considérer qu'on cherche à poster
    if ($(this).attr('method') == 'get') {
      alert("yes");
    } else {
      
      // Empêcher toute propagation d'évènement
      ev.preventDefault();
      
      // Si on prévisualise, demander une prévisualisation, sinon demander à envoyer le message
      if (preview) {var senddata = $(this).serialize()+'&e_operation=preview';} else { var senddata = $(this).serialize()+'&e_operation=create'; }

      // Chercher l'URL auquel envoyer la requête
      var sendto = $(this).attr("action");

      // Envoyer la requête
      $.ajax({
          url: sendto,
          type: 'POST',
          data: senddata,
          success: function (data) {
            
            // Si on avait demandé une prévisualisation, créer la prévisualisation dans le popin
            if (preview) { 
              
              // Créer la prévisualisation
              $dialog.html($('.subtabs',data));
              
              // Recréer une manière d'envoyer des données sans redirection
              makePopInForm();
            }
          },
          error: function (error) {
            // En cas d'erreur, alerter de l'erreur
            alert("Fatal Error !");
          }
      });
    }
  });
}

/* GET INFO */

// Apposer les ressources

function getResources(data) {
  
  // Changer la valeur des leems
  $('#res-leems').text(
    $('#nav_res_leems',data).text()
  );
  
  // Changer la valeur des métaux
  $('#res-metaux').text(
    $('#nav_res_metaux',data).text()
  );
  
  // Changer la valeur des diamants
  $('#res-diamants').text(
    $('#nav_res_diamants',data).text()
  );
  
  // Changer la valeur de l'énergie
  $('#res-energie').text(
    $('#nav_res_energie',data).text()
  );
  
  // Changer la valeur de l'Apotium
  $('#res-apotium').text(
    $('#nav_res_apotium',data).text()
  );
  
}

// Créer le fronton de l'AG avec les informations du forum

function makeHeaderAG(data) {
  
  // Créer titre assemblée
  $('#assemblee-name').html($('.subarea h2',data).text());
  $('#assemblee-location').html($('.subarea h3',data).text());
  
  // Créer nombre de pages
  let maxpagesAG = $('.listing',data).next().children('a').last().text(); // Référencer le nombre de pages à l'AG (c'est foireux...)
  
  for (let i=1; i<=maxpagesAG; i++){ // On y reviendra
    $('#assemblee-page').append('<div class="ag-page-num"><a href="' + href + '&c_page=' + i + '">'+(i)+'</a></div>');
  }  
  
  // Créer description Assemblée
  $('.post_line',data).each(function(){
    fixFontSize(this); // Corriger taille des fonts sur le fronton
    $('#assemblee-fronton').append(this); // L'apposer sur la partie dédiée
  }); 
  
  // Créer nouveau sujet
  $('#assemblee-newpost').attr('href', href.replace("viewforum","newtopic"));
}

// Créer la liste des posts en Assemblée

function makePostListAG(data) {
  
  // Vider le contenu de la liste
  $('#assemblee-postlist').empty();
  
  // Créer tableau des posts
  $('.listing tr', data).each(function(){
    
    // Pour chaque post, créer un tableau
    $('#assemblee-postlist').append('<div class="postitem"></div>');
    
    // Pour chaque élément du tableau, créer les cases
    $('td',this).each(function(){
      
      // Créer une case 
      $('.postitem').last().append('<div class="postelement"></div>');
      
      // Lui apposer les informations
      $('.postelement').last().append($(this).contents());
    });
  });
  
  // Enlever un ersatz (titre du <table>)
  $('.postitem').first().remove();
  
  // Ajouter les classes titre, nom commandant, nombre de réponses, dernier post
  $('.postelement:nth-child(1)').addClass('postelement-title');
  $('.postelement:nth-child(2)').addClass('postelement-comname');
  $('.postelement:nth-child(3)').addClass('postelement-lastpost');
  
  // Marquer les nouveaux posts en ajoutant une classe .new-post
  $('.postelement-title').has('img').each(function(){
    $(this).parent().addClass('new-post');
    $('img',this).remove();
  });
  
  // Cliquer sur un numéro de page crée la page suivante
  changePageAG($(".ag-page-num a"));
  
  // Cliquer sur un titre de post ouvre le post
  openPostAG($('.postelement-title a'));
  
  // Cliquer sur le nom d'un commandant ouvre un pop-in
}

// Créer le contenu de chaque post en Assembléé

function makePostContentAG(data) {
  
  // Vider les informations existantes
  $('#reader-header').empty(); 
  $('#reader-body').empty();
  
  // Créer nom du sujet
  $('#reader-header').append($('.subarea h2',data).text());
  
  // Créer différents posts
  $('.viewtopic tr',data).each(function(){
    $('#reader-body').append('<div class="readeritem"><div class="readeritem-author">'+$('.post_left',this).html()+'</div><div class="readeritem-body">'+$('.post_right',this).html()+'</div></div>'); // Créer les posts en AG avec leur contenu
  });
  
  // Enlever ersatz posts vides
  $('.readeritem').odd().remove();
  
  // Styliser chaque post
  addPostStylesAG();
}

// Trouver le titre du commandant
function getCommanderTitle(name,url) {
  
  // Assigner à la variable username le titre du personnage stocké dans un Cookie
  var title = getCookie(name); 
  
  // Si il existe déjà un nom, ne rien faire, autrement aller récupérer le titre du commandant
  if (title != "") {
    // Ne rien faire
  } else {
    
    // Envoyer une requête pour aller trouver la page d'info du commandant
    $.get(url, function(data) { // Charger la page personnage
      
      // Assigner à la variable username le titre du commandant
      title = encodeURI($('.capTitle',data).text().replace('Titre : ',''));
      
      // Si ce titre n'est pas vide, alors lui assigner un cookie
      if (title != "" && title != null) {
        setCookie(name, title, 30);
      }
    });
  }
}


/* STYLE PAGE */

// Corriger taille polices Fronton AG

function fixFontSize(data) {
  $('font',data).each(function(){
    
    if (this.hasAttribute('size')) {
      let size = $(this).attr('size')/2;
      if (size < 1) { size = 1; }
      $(this).removeAttr('size').css('font-size',size+"vh");
    }
    
  });
}

// Changer le style de chaque post en Assemblée

function addPostStylesAG() {
  
  // Créer variables pour hauteur du post réduit et du post ouvert
  $('.readeritem-body').each(function(){
    $(this).css({
      // Hauteur du post fermé
      '--readeritem-reduced' : $(this).height()+'px',
      // Hauteur du post ouvert
      '--readeritem-height' : $(this).prop("scrollHeight")+'px'
    });
  });
    
  // Ouvrir ou fermer le post lors du clic
  $('.readeritem-body').click(function(){      
    $(this).toggleClass('agbody-open');
  });
  
  // Lors du clic sur un lien dans un post, éviter de fermer/ouvrir le post en question
  $('.readeritem-body a').click(function(ev){
    ev.stopImmediatePropagation();
  });
  
  // Formatter correctement le bandeau nom et information du personnage
  cleanAuthor();
}

// Créer un Pop-in lorsque l'on clic sur le nom d'un personnage
function makePopIn(url) {
  
  // Aller chercher la page d'informations du commandant
  $.get(url, function(data) {
    
    // Mettre au dialogue le contenu du div .subtabs
    $dialog.html($('.subtabs',data));
    
    // Si on clique sur un lien dans le popin :
    $('a',$dialog).click(function(ev){ 
      
      // Empêcher le lancement d'évènement
      ev.stopImmediatePropagation();
      
      // Rechercher si le lien mène à une page d'assembléé
      if ($(this).attr('href').search('/assemblee') != -1) { 
        
        // Si c'est le cas, alors il va charger la page d'Assemblée
        $.get($(this).attr('href'),function(data){
          
          // Afficher la page d'Assemblée demandée
          makeAGBody(data);
        });
      } else {
        
        // Dans les autres cas, ouvrir la page demandée dans le popin
        makePopIn($(this).attr('href'));
      }
      
      // Empêcher redirection
      return false;
    });
    
    // Créer une fonction permettant d'envoyer un message / de rechercher un personnage depuis le popin
    makePopInForm();
  });
}


// Style elements



/* LOAD SCRIPT */

// Charger le script initialement
initiateAG();





// A REORGANISER, OU WIP

/* MAKE NAVIGATION BAR 

function makeNavSize() {
  $('#center-top').css('--navwidth',$(window).width() - $('#left').outerWidth()+'px'); // SET NAVIGATION WIDTH
  $('#center-top').css('--navheight','-'+$('#center-top nav').height()+'px'); // SET NAVIGATION HEIGHT
}

function makeNavigation() { /* SERT A CREER LA BARRE DE NAVIGATION 

  const navlinks = ['strategie','planetes','civilisation','comx','assemblee','chronique','taverne','coalition','politique','coa-status','sciences','com-virement','com-techno','com-ressources','com-contrebande','contrebande','compte-rendus','en-cours','pense-bete','recapitulatif','personnage','discord','wiki','archives','options','parrainage','sos','logoff'];

  for (i=0; i<navlinks.length; i++) {
    $('#center-top nav').append('<div class="navlink" id="navlink'+i+'"></div>'); // ADD A LINK FOR EACH CATEGORY
    $('#navlink'+i).css('background-image','url(https://madwar.fr/Apocalypsis/Tamper/images/new/'+navlinks[i]+'.png'); // RETRIEVE EACH LINK PICTURE
  }
  
  $('#quicklinks-row1').append('<div class="ql-icon" id="ql-strat"></div><div class="ql-icon" id="ql-gestion"></div><div class="ql-icon" id="ql-civilisation"></div><div class="ql-icon" id="ql-comx"></div>');
  $('#quicklinks-row2').append('<div class="ql-icon" id="ql-assemblee"></div><div class="ql-icon" id="ql-taverne"></div><div class="ql-icon" id="ql-chroniques"></div><div class="ql-icon" id="ql-agcoalition"></div>');
  $('#quicklinks-row3').append('<div class="ql-icon" id="ql-science"></div><div class="ql-icon" id="ql-virement"></div><div class="ql-icon" id="ql-techno"></div><div class="ql-icon" id="ql-ordres"></div>');
  
  $('.ql-icon').each(function(){
    $(this).css('background-image','url(https://madwar.fr/Apocalypsis/Tamper/images/new/quicklinks/'+$(this).attr('id')+'.png');
  });

  window.addEventListener('resize', function(event) {
    makeNavSize();
  }, true);
  
  makeNavSize();
}

// HOVER NAVIGATION LINKS

$('#center-top').hover(function(){ // ARROW FLIP
  $('.navarrow',this).addClass('flip');
}, function(){
  $('.navarrow',this).removeClass('flip');
}); */
