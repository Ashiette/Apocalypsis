// ==UserScript==
// @name         Apocalypsis Avatar on map
// @namespace    apocalypsis-modded
// @match        https://www.apocalypsis.org/strategie*
// @version      0.1
// @author       Ash Morpheus
// @author       Rowen
// @description  Script pour afficher les avatars sur la vue stratégique
// ==/UserScript==

function convertRawHtmlToDocument(profilePageHtml) {
    const parser = new DOMParser();
    return parser.parseFromString(profilePageHtml, 'text/html');
}

async function fetchAvatarsFromProfiles(profileLinksSet) {
    const requests = [];
    profileLinksSet.forEach(profileUrl => {
        requests.push(fetch(profileUrl))
    });

    const responses = await Promise.all(requests);
    const profileAvatarMap = new Map();
    for (let i = 0; i < responses.length; i++) {
        let response = responses[i];
        const htmlResponse = await response.text();
        const profilePageDocument = convertRawHtmlToDocument(htmlResponse);
        const avatarUrl = profilePageDocument.querySelector('.profile .avatar img')?.src || '/avatars/0.jpg';
        profileAvatarMap.set(Array.from(profileLinksSet)[i], avatarUrl);
    }
    return profileAvatarMap;
}

function isPlanetOwnerPresent($cell) {
    return $cell.childNodes.length > 0;
}

function addImageOnPlanet(index, avatarUrl) {
    const $img = new Image();
    $img.src = avatarUrl;
    $img.style.width = '15px';
    $img.style.marginTop = '30px';
    $img.style.marginLeft = '35px';
    const {planet, waypoint} = parseCoordinatesFromIndex(index);
    document.querySelector(`[data-position$=_${waypoint}_${planet}]`).append($img);
}

function assignPictureToPlanets(ownerLinks, profileAvatarMap) {
    ownerLinks.forEach((ownerLink, index) => {
        if (ownerLink) {
            addImageOnPlanet(index, profileAvatarMap.get(ownerLink));
        }
    })
}

function parseOwnersProfileLinks($planetOwners) {
    const ownerLinks = [];
    $planetOwners.forEach($cell => {
        if (isPlanetOwnerPresent($cell)) {
            ownerLinks.push($cell.childNodes[0].href);
        } else {
            ownerLinks.push(null);
        }
    });
    return ownerLinks;
}

function buildUniqueProfileLinks(ownerLinks) {
    return ownerLinks.reduce((ownerLinkSet, ownerLink) => {
        if (ownerLink !== null) {
            ownerLinkSet.add(ownerLink)
        }
        return ownerLinkSet;
    }, new Set());
}

function parseCoordinatesFromIndex(index) {
    return {
        planet: index % 4 + 1,
        waypoint: Math.floor(index / 4) + 1
    };
}

function displayAvatarsOnSystemMap() {
    const $planetOwners = document.querySelectorAll('#planets_here .planets_here td:nth-child(2)');
    const ownerLinks = parseOwnersProfileLinks($planetOwners);
    const profileLinksSet = buildUniqueProfileLinks(ownerLinks);
    fetchAvatarsFromProfiles(profileLinksSet).then(profileAvatarMap => {
        assignPictureToPlanets(ownerLinks, profileAvatarMap);
    });
}

(function () {
    const $mapContainer = document.getElementById('universe_map');
    if ($mapContainer.classList.contains('level-4')) {
        displayAvatarsOnSystemMap();
    }
})();
