(function () {
    function createChecklist(projectName, tasks) {
        var list = projectNamed(projectName) || new Project(projectName);
        list.tasks.forEach(t => t.markComplete());
        tasks.forEach(function (task) {
            new Task(task, list);
        });
    }

    createChecklist('Race Checklist', [
        'GoPro',
        'gps',
        'water bottles (2)',
        'bottles with drink mix (2)',
        'recovery shake in thermos',
        'sunscreen',
        'heart rate strap',
        'base layer',
        'shorts',
        'jersey',
        'socks',
        'shoes',
        'arm warmers',
        'leg warmers',
        'glasses',
        'helmet',
        'headband',
        'gloves',
        'floor pump',
        'bike',
        'Front axle',
        'wallet',
        'phone',
        'keys',
        'number plate',
        'inhaler',
        'trail wallet',
        'registration form',
        'Road ID'
    ]);
})();
