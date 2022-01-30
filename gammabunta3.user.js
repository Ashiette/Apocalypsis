// ==UserScript==
// @name        [MOD] GammaBunta v0.1
// @namespace   [MOD] GammaBunta
// @match       https://www.apocalypsis.org/assemblee/viewforum
// @version     0.1
// @author      Ash Morpheus
// @description MOD Visuel pour l'Assemblée Galactique de Apocalypsis, dans le but d'être généralisé à tout le site
// @require      http://code.jquery.com/jquery-3.6.0.min.js
// @require      https://code.jquery.com/ui/1.13.0/jquery-ui.js
// @resource     REMOTE_CSS https://madwar.fr/Apocalypsis/Tamper/style3.4.css
// @resource     REMOTE_HTM https://madwar.fr/Apocalypsis/Tamper/test3.htm
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

/* LOAD EXTERNAL RESOURCES */

const myCss = GM_getResourceText("REMOTE_CSS"); // Load External CSS
const myHtm = GM_getResourceText("REMOTE_HTM"); // Load base HTML

GM_addStyle(myCss); // Apply external CSS
$('body').removeClass().html(myHtm); // Remove body and apply external html

/* MAKE NAVIGATION BAR */

function makeNavSize() {
  $('#center-top').css('--navwidth',$(window).width() - $('#left').outerWidth()+'px'); // SET NAVIGATION WIDTH
  $('#center-top').css('--navheight','-'+$('#center-top nav').height()+'px'); // SET NAVIGATION HEIGHT
}

function makeNavigation() { /* SERT A CREER LA BARRE DE NAVIGATION */

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

function fixFontSize(postline) {  /* SERT À CORRIGER LES TAILLES DANS LE FRONTON DE L'ASSEMBLÉE */

  $('font',postline).each(function(){
    if (this.hasAttribute('size')) {
      let size = $(this).attr('size')/2;
      if (size < 1) { size = 1; }
      $(this).removeAttr('size').css('font-size',size+"vh");
    }
  });
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

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

function getPostDate (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}

function checkAuthTitle(comname,comurl) {
  var username = getCookie(comname); // Vérifier si on a déjà un titre
  if (username != "") {

  } else {
    $.get(comurl, function(data) { // Charger la page personnage
      username = encodeURI($('.capTitle',data).text().replace('Titre : ','')); // Retourner le titre du commandant
      if (username != "" && username != null) {
        setCookie(comname, username, 30); // Stocker le titre du commandant pendant 30 jours
      }
    });
  }
}

function makePopInForm() {
  let preview = false;

  $('form button[value="preview"]').click(function(){
    preview = true;
  });

  $('form',$dialog).submit(function(ev){
    if ($(this).attr('method') == 'get') {
      alert("yes");
    } else {
      ev.preventDefault();
      if (preview) {var senddata = $(this).serialize()+'&e_operation=preview';} else { var senddata = $(this).serialize()+'&e_operation=create'; }

      var sendto = $(this).attr("action");

      $.ajax({
          url: sendto,
          type: 'POST',
          data: senddata,
          success: function (data) {
            if (preview) {
              $dialog.html($('.subtabs',data));
              makePopInForm();
            }
              //alert('Message envoyé');
          },
          error: function (error) {
              alert("Fatal Error !");
          }
      });
    }
  });
}

function makePopIn(url) { // Faire un pop-up pour clic sur personnage
  $.get(url, function(data) {
    $dialog.html($('.subtabs',data)); // Parse HTML to extract important data
    $('a',$dialog).click(function(ev){
      ev.stopImmediatePropagation();
      if ($(this).attr('href').search('/assemblee') != -1) { // Si il trouve "assemblee" dans le lien (ce qui signifie que c'est un post AG)
        $.get($(this).attr('href'),function(data){
          makeAGBody(data); // Charger directement la page AG
        });
      } else {
        makePopIn($(this).attr('href')); // Autrement, aller à la page demandée
      }
      return false;
    });

    makePopInForm();
  });
}

function cleanAuthor() {
  const comnames = []; // Pour fix requête

  $('.readeritem-author').each(function(){
    let coalition = false; // Par défaut, considéré comme commandant
    let authref = $('a',this).attr('href');
    let authname = decodeURI(authref.replace('/showuser?e_cap=','').toLowerCase()).replace('+','').replace('’','').normalize("NFD").replace(/[\u0300-\u036f]/g, "");// transformer en variable lisible le nom du commandant (+fix Denior’back qui utilise des accents à la con bordel)
    let author = decodeURI(authref.replace('/showuser?e_cap=','').replace('+',' ')); // Nom "réel" du commandant

    if($('a',this).text().search('Coa.') == 0) { coalition = true; } // Petit fix pour détecter Coalition v/s commandant

    if (comnames.includes(authname)) { // Petit fix pour éviter d'envoyer plusieurs fois la même requête au serveur

    } else {
      comnames.push(authname); // Fix requête
      if (coalition == false) { // Si commandant alors
        checkAuthTitle(authname,authref); // Vérifier titre de la personne
      } else {
        setCookie('coalition','Coalition',30);
        authname = 'coalition';
      }
    }

    if ($('img',this).attr('alt') == "Avatar") { // Get Avatar
      avatar = $('img',this).attr('src');
    }

    let rd = $(this).html().split('<br>')[1];
    let postdate = $(this).html().split('<br>')[getPostDate("ETU", $(this).html().split('<br>'))].split('<div')[0]; // C'est à chier, mais on fait comme on peut avec ce qu'on a... Comme chaque ligne est séparée par un tag <br> il va classer les infos en effectuant cette séparation. Pour trouver la date on va donc lui demander d'aller chercher le terme "ETU" et de retourner la position du tableau où se trouve cette valeur. Comme la date est suivie d'autres données, on va séparer ces données, tout simplement.

    $(this).empty().append('<img src="'+avatar+'" class="post-author-image"><div class="post-author"><div class="post-author-title">'+getCookie(authname)+'</div><div class="post-author-name">'+author+'</div></div><div class="post-info"><div class="post-author-respect">'+rd+'</div><div id="post-date">'+postdate+'</div></div>');
    $('.post-author-image',this).click(function(ev){
      ev.stopImmediatePropagation();
      $('<div class="commander-popin">').dialog({
            modal: true,
            open: function (){

              $dialog = $(this);
              makePopIn(authref);
              /*$.get(authref, function(data) {
                $dialog.html($('.subtabs',data));
                $('a',$dialog).click(function(ev){
                  ev.stopImmediatePropagation();
                  $.get($(this).attr('href'), function(data) {
                    $dialog.html($('.subtabs',data));
                  });

                  return false;
                });
              });*/
            },
            height: 600,
            width: 700,
            title: 'Dynamically Loaded Page'
        });
    });
  });

  $('.readeritem').each(function(){ // Fonction pour bouger le vote du message AG à l'en-tête
    $('.post-info',this).append($('.posthead',this).html());
    $('.readeritem-body .posthead',this).remove();
  });
}

function makeAGBody(data) {
  $('#reader-header').empty();
  $('#reader-body').empty();
  $('#reader-header').append($('.subarea h2',data).text()); // Mettre le nom du sujet
  $('.viewtopic tr',data).each(function(){ // Pour chaque post, faire
    $('#reader-body').append('<div class="readeritem"><div class="readeritem-author">'+$('.post_left',this).html()+'</div><div class="readeritem-body">'+$('.post_right',this).html()+'</div></div>'); // Créer les posts en AG avec leur contenu
  });
  $('.readeritem').odd().remove(); // Correction d'une erreur inconnue qui double le nombre de lignes de post (Ça sent pas bon quelque part ça)


  $('.readeritem-body').each(function(){ // Mettre les variables pour resize les posts en AG
    $(this).css({'--readeritem-reduced' : $(this).height()+'px',
                '--readeritem-height' : $(this).prop("scrollHeight")+'px'
                });
  }).click(function(){ // Rendre le post AG plus petit ou plus grand
    if ( $(this).hasClass('agbody-open') ) {
      $(this).removeClass('agbody-open');
    } else {
      $(this).addClass('agbody-open');
    }
  });

  $('.readeritem-body a').click(function(ev){ // Évite de refermer un post ouvert lorsqu'on clique sur un lien :)
    ev.stopImmediatePropagation();
  });

  cleanAuthor();
}

function makeAGHeader(data) {
  $('#assemblee-header').empty();
  $('.listing tr', data).each(function(){ // Créer le tableau des posts
    $('#assemblee-header').append('<div class="postitem"></div>'); // Pour chaque sujet, faire
    $('td',this).each(function(){ // Transposer les informations du sujet
      $('.postitem').last().append('<div class="postelement"></div>');
      $(this).contents().appendTo($('.postelement').last());
    });
  }); // END postlist

  $('.postitem').first().remove(); // Enlever un ersatz dû au titre du tableau

  $('.postelement:nth-child(1)').addClass('postelement-title');

  $('.postelement-title').has('img').each(function(){ // Pour chaque post non-lu, lui mettre une classe
    $(this).parent().addClass('new-post');
    $('img',this).remove();
  }); // END newpost

  $(".ag-page-num a").click(function(e) {
    e.stopImmediatePropagation();
    href = $(this).attr('href');
    $.get(href, function(data) {
      makeAGHeader(data);
    })
    return false;
  }); // CREATE FRONTON PAGE NUMBER LINKS

  $('.postelement-title a').click(function(ev){
    ev.stopImmediatePropagation();
    $('#assemblee-reader').css('display','flex');
    href = $(this).attr('href');
    $.get(href, function(data) {
      makeAGBody(data);
    });
    return false;
  });
}

// HOVER NAVIGATION LINKS

$('#center-top').hover(function(){ // ARROW FLIP
  $('.navarrow',this).addClass('flip');
}, function(){
  $('.navarrow',this).removeClass('flip');
});

/* ASSEMBLEE : LIST POSTS */

  var href = window.location.href.split('?');
  href = href[0] + '?' + href[1]; // GET PAGE URI

$.get(href, function(data) {
  // MAKE ASSEMBLEE-INFO

  // MAKE FRONTON

  $('#assemblee-name').html($('.subarea h2',data).text());
  $('#assemblee-location').html($('.subarea h3',data).text());

  let maxpagesAG = $('.listing',data).next().children('a').last().text(); // Référencer le nombre de pages à l'AG (c'est foireux...)

  for (let i=1; i<=maxpagesAG; i++){
    $('#assemblee-page').append('<div class="ag-page-num"><a href="' + href + '&c_page=' + i + '">'+(i)+'</a></div>');
  }  // Créer un lien vers chaque page

  $('.post_line',data).each(function(){
    postinfo = fixFontSize(this); // Corriger taille des fonts sur le fronton
    $('#assemblee-fronton').append(this); // L'apposer sur la partie dédiée
  });

  $('#assemblee-info').append('<a id="assemblee-newpost" href="'+ href.replace("viewforum","newtopic") + '">Nouveau Sujet</a>'); // MAKE NEW FORUM BUTTON
  // END fronton

  // MAKE POST LIST

  makeAGHeader(data); // MAKE ASSEMBLEE-HEADER

}); // END $.GET

makeNavigation();
