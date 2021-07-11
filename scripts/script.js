window.addEventListener('load', function() {
    function clearTable(tbody) {
        for (let row of tbody.querySelectorAll('tr:not([class*="headers"])')) {
            row.remove();
        }
    }
    function fillTableContent(contentArray, tbody) {
        names = ['Name', 'Price', 'Amount'];
        for (let content of contentArray) {
            let tr = document.createElement('tr');
            let i = 0;
            for (let value of Object.values(content)) {
                let td = document.createElement('td');
                td.setAttribute('Name', names[i++]);
                td.textContent = value;
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    }
    let select = document.querySelector('.form-select');
    select.value = 'Россия';
    select.addEventListener('change', async function() {
        let response = await (await fetch('interfaces/services.php?Country='+select.value)).json();
        let tbody = document.querySelector('.table.service-choose tbody');
        clearTable(tbody);
        fillTableContent(response, tbody)
    });

    document.querySelector('.sendLogin').addEventListener('click', async function() {
        let form = document.querySelector('.form');
        let login = form.querySelector('.form-control[name="Login"]').value;
        let password = form.querySelector('.form-control[name="Password"]').value;
        let data = {
            Login: login.substring(0, 255),
            Password: password.substring(0, 255),
        };
        let response = await (await fetch('interfaces/users.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })).json();
        if (response === true) {
            window.location.reload();
        }
    });
    
    if (exit = document.querySelector('.exitButton')) exit.addEventListener('click', async function() {
        await fetch('interfaces/users.php?exit=true');
        window.location.reload();
    });
});