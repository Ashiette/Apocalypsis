// ==UserScript==
// @name         Apocalypsis UI enhancer
// @namespace    apocalypsis-modded
// @match        https://www.apocalypsis.org/*
// @version      0.1
// @author       Ash Morpheus
// @author       Rowen
// @description  Mod visuel pour Apocalypsis
// @require      https://raw.githubusercontent.com/Ashiette/Apocalypsis/master/js/forum.js
// @require      https://raw.githubusercontent.com/Ashiette/Apocalypsis/master/js/profile.js
// @require      https://raw.githubusercontent.com/Ashiette/Apocalypsis/master/js/templates.js
// @resource     FORUM_CSS https://raw.githubusercontent.com/Ashiette/Apocalypsis/master/css/forum.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

function displayForum() {
    const {subjects} = buildForumData();
    const $forumContainer = generateForum(subjects);
    const $subjectsHolder = document.querySelector('.listing');
    populateForumAvatars(subjects, $forumContainer);
    $subjectsHolder.after($forumContainer);
    $subjectsHolder.hidden = true;
}

function displaySpecificForum(forumId) {
    if (forumId === 'id_subtabbar_assemblee') {
        const forumCss = GM_getResourceText('FORUM_CSS');
        GM_addStyle(forumCss);
        displayForum();
    }
}

(function () {
    const path = document.location.pathname;
    if (path.endsWith('viewforum')) {
        const forumId = document.querySelector('.subtab_selected').id;
        displaySpecificForum(forumId);
    }
})();
