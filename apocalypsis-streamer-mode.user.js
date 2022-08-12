// ==UserScript==
// @name         Apocalypsis Streamer mode
// @namespace    apocalypsis-modded
// @match        https://www.apocalypsis.org/*
// @version      0.1
// @author       Ash Morpheus
// @author       Rowen
// @description  Script pour cacher les infos sensibles
// @run-at:      document-start
// ==/UserScript==

const resourceIds = ['nav_res_leems', 'nav_res_metaux', 'nav_res_diamants', 'nav_res_energie']

function replaceResourceAmount(resourceId) {
    const $resource = document.getElementById(resourceId);
    $resource.textContent = '0';
    $resource.title = '0';
}

function anonymizeAvatar() {
    const $avatar = document.getElementById('id_touillette_cap_img');
    $avatar.src = '/avatars/0.jpg';
}

(function () {
    document.onreadystatechange = function () {
        if (document.readyState === "interactive") {
            anonymizeAvatar();
            resourceIds.forEach(replaceResourceAmount);
        }
    }
})();
