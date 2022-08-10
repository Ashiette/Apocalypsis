function generateForum(subjects) {
    const $mainAssembly = document.createElement('div')
    $mainAssembly.classList.add('forum');
    $mainAssembly.innerHTML = generateSubjects(subjects);
    return $mainAssembly;
}

function generateSubjects(subjects) {
    return subjects.map(generateSubject).join('\n');
}

function generateSubject(subject) {
    return `
<div class="subject">
    <p class="subject-title">${subject.title.outerHTML}${generateAuthor(subject.author)}</p>
    <p>Dernier message: le ${subject.lastAnswer.date} ${generateAuthor(subject.lastAnswer.author)}</p>
</div>
    `;
}

function generateAuthor(author) {
    return `
<span class="author">par ${author.outerHTML}</span>
    `;
}
