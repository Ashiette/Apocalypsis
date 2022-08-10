function convertRawHtmlToDocument(profilePageHtml) {
    const parser = new DOMParser();
    return parser.parseFromString(profilePageHtml, 'text/html');
}

function populateForumAvatars(subjects, $forumContainer) {
    buildProfileLinks(subjects).forEach(profileUrl => {
        fetch(profileUrl)
            .then(response => response.text())
            .then(profilePageHtml => {
                const profilePageDocument = convertRawHtmlToDocument(profilePageHtml);
                const avatarUrl = profilePageDocument.querySelector('.profile .avatar img').src;
                const path = extractPathFromUrl(profileUrl);
                $forumContainer.querySelectorAll(`.author [href="${path}"]`)
                    .forEach($profileLink => insertAvatarMiniature($profileLink, avatarUrl));
            });
    });
}

function insertAvatarMiniature($holder, avatarUrl) {
    const $img = new Image();
    $img.src = avatarUrl;
    const div = document.createElement('div');
    div.classList.add('avatar');
    div.append($img)
    $holder.append($img);
}

function extractPathFromUrl(urlString) {
    const url = new URL(urlString);
    return url.pathname + url.search;
}

function buildProfileLinks(subjects) {
    return Array.from(
        subjects.reduce((setAccumulator, subject) => {
            setAccumulator.add(subject.author.href);
            setAccumulator.add(subject.lastAnswer.author.href);
            return setAccumulator;
        }, new Set())
    );
}
