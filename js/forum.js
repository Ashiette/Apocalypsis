function buildForumData() {
    const $mainAssemblyContent = document.querySelector('.subarea');
    return {
        name: $mainAssemblyContent.querySelector('h2').textContent,
        capital: $mainAssemblyContent.querySelector('h3').textContent,
        assemblyHeader: $mainAssemblyContent.querySelectorAll('.post_line'),
        pagination: $mainAssemblyContent.querySelector('.listing').previousElementSibling,
        newSubject: $mainAssemblyContent.querySelector('.listing').previousElementSibling.previousElementSibling,
        subjects: buildSubjectsContent($mainAssemblyContent),
    }
}

function buildSubjectsContent($container) {
    return Array.from($container.querySelectorAll('tr:not(:first-child)')).map($subject => {
        return {
            title: $subject.querySelector('.wrap_allowed a'),
            author: $subject.querySelector('.title a'),
            answers: $subject.querySelector('.title').nextElementSibling.textContent,
            lastAnswer: buildLastAnswer($subject)
        };
    });
}

function buildLastAnswer($subject) {
    const $lastAnswer = $subject.querySelector('.title:last-child');
    return {
        date: $lastAnswer.firstChild.textContent,
        author: $lastAnswer.querySelector('a')
    };
}
