
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
    select = document.querySelector('.form-select');
    function getElement(tag, classes, text = '') {
        let element = document.createElement(tag);
        if(Array.isArray(classes)) {
            element.classList.add(...classes);
        }
        else element.classList.add(classes);
        element.textContent = text;
        return element;
    }
    function fillTableEditableContent(contentArray, tbody, names, buttons, editableFields) {
        for (let content of contentArray) {
            let tr = getElement('tr', 'to-update');
            let i = 0;
            for (let attribute of Object.keys(content)) {
                let td = document.createElement('td');
                td.textContent = content[attribute];
                td.setAttribute('name', names[i])
                td.setAttribute('value', content[attribute]);
                if (editableFields.includes(attribute)) td.contentEditable = true;
                tr.appendChild(td);
                i++;
            }
            let td = getElement('td', 'buttons-row');
            for (let button of buttons) td.appendChild(button.cloneNode(true));
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
    }
    function hideDeletedService(serviceName, countryServicesTable) {
        for (let field of countryServicesTable.querySelectorAll('[name="Name"]')) {
            if(serviceName == field.getAttribute('value')) field.parentNode.style.display = 'none';
        }
    }
    function fillTableAddButtons(allServicesTable, countryServicesTable) {
        for (let row of allServicesTable.querySelectorAll('tr:not([class*="headers"])')) {
            let hasService = false;
            for (let otherRow of countryServicesTable.querySelectorAll('tr:not([class*="headers"])')) {   
                if (row.querySelector("[Name]").getAttribute('value') == otherRow.querySelector('[name="Name"]').getAttribute('value')) {
                    if(otherRow.style.display == 'none') otherRow.style.display = '';
                    hasService = true;
                    break;
                }
            }
            if (!hasService) {
                if (!row.querySelector('.country-service-add')) 
                row.querySelector('.buttons-row').prepend(getElement('button', ['btn', 'btn-success', 'editable-field-button', 'country-service-add'], '+'));
            }     
        }
    }
    function fieldOnInput() {
        this.setAttribute('value', this.textContent);
    }
    function updateCountries() {
        for (let option of select.querySelectorAll('[value]')) {
            option.remove();
        }
        for (let country of document.querySelectorAll('.countries-form .country [value]:not(.to-add)')) {
            let option = document.createElement('option');
            option.setAttribute('value', country.getAttribute('value'));
            option.textContent = country.getAttribute('value');
            select.appendChild(option);
        }
        select.value='Россия';
    }
    function updateCountryServices() {
        let content = [];
        for (let row of document.querySelectorAll('.services-modal .country-services tbody tr:not([class*="headers"]):not([style*="display: none"])')) {
            let obj = {};
            for (let field of row.querySelectorAll('.to-update [name][value]')) {
                obj[field.getAttribute('name')] = field.getAttribute('value');
            }
            content.push(obj);
        }
        let table = document.querySelector('.table.service-choose tbody');
        clearTable(table);
        fillTableContent(content, table);
    }
    function setDeletable(modal, callback) {
        if (deleteButtons = modal.querySelectorAll(':not([class*="to-add"]) .editable-field-button.button-delete')) for (let deleteButton of deleteButtons) deleteButton.addEventListener('click', callback);
    }
    function setAddable(modal, buttonClass, callback) {
        if (addButtons = modal.querySelectorAll(buttonClass)) for (let addButton of addButtons) addButton.addEventListener('click', callback)
    }
    async function send(url, method, data) {
        let sent = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!(response = await sent.text())) response = '';
        return {'Sended': sent.ok, 'Message': response};
    }
    function getAdded(modal) {
        let added = [];
        for (let toAdd of modal.querySelectorAll('.to-add')) {
            if (fields = toAdd.querySelectorAll('*[contenteditable], *[name]')) {
                if (fields.length > 1) {
                    let obj = {};
                    for (let field of fields) {
                        if (!!field.textContent.replace(/\s/g, ''))
                            obj[field.attributes.name.textContent] = field.textContent;
                        else {
                            obj = {};
                            break;
                        }
                    }
                    if (Object.values(obj).length) {
                        added.push(obj);
                    }
                }
                else if(!!toAdd.textContent.replace(/\s/g, '')) added.push(toAdd.textContent);
            }
            else if(!!toAdd.textContent.replace(/\s/g, '')) added.push(toAdd.textContent);
        }
        return added;
    }
    function getUpdated(modal) {
        let updated = [];
        for (let toUpdate of modal.querySelectorAll('.to-update')) {
            if (fields = toUpdate.querySelectorAll('*[contenteditable], *[name]')) {
                if (fields.length) {
                    let obj = {};
                    let anyChanges = false;
                    for (let field of fields) {
                        if (field.getAttribute('value') != field.textContent) anyChanges = true;
                        obj[field.getAttribute('name')] = field.textContent;
                    }
                    if (Object.values(obj).length && anyChanges) {
                        updated.push(obj);
                    }
                }
                else if ((newValue = toUpdate.textContent) != toUpdate.getAttribute('value')) updated.push({ 'Name': toUpdate.getAttribute('value'), 'New': newValue });
            }
            else if ((newValue = toUpdate.textContent) != toUpdate.getAttribute('value')) updated.push({ 'Name': toUpdate.getAttribute('value'), 'New': newValue });
        }
        return updated;
    }
    function getDeleted(modal) {
        let deleted = [];
        for (let toDelete of modal.querySelectorAll('.to-delete')) {
            deleted.push(toDelete.attributes.value.textContent);
        }
        return deleted;
    }
    async function sendChanges(url, method, changes, data=null) {
        if (changes.length) {
            changes = {'data': changes};
            if(data) changes = {...data, ...changes};
            let response = await send(url, method, changes);
            if(response['Message']) response['Message'] = JSON.parse(response['Message']);
            return response;
        }  
    }
    function countrySetDeletable(countriesModal) {
        setDeletable(countriesModal, function() {
            this.parentNode.classList.add('to-delete');
            this.parentNode.parentNode.style.display = 'none';
        });
    }
    function servicesSetDeletable(servicesModal) {
        setDeletable(servicesModal, function() {
            let nameField = this.parentNode.parentNode.querySelector('*[name="Name"]');
            nameField.classList.add('to-delete');
            this.parentNode.parentNode.style.display = 'none';
            hideDeletedService(nameField.getAttribute('value'), document.querySelector('.services-modal .country-services tbody'));
        });
    }
    function fixateChanges(modal, changes, changeClass=null) {
        for (let changed of changes) {
            let row = modal.querySelector(`[value="${changed}"]`)?.parentNode || modal.querySelector(`[value="${changed['Name']}"]`).parentNode;
            for (let field of row.querySelectorAll('[value]')) {
                field.setAttribute('value', field.textContent);
                field.removeEventListener('input', fieldOnInput);
            }
            let deleteButton = row.querySelector('.editable-field-button');
            deleteButton.parentNode.replaceChild(deleteButton.cloneNode(true), deleteButton);
            let classUpdated = false;
            if(changeClass) {
                row.classList.remove(changeClass);
                if(field = row.querySelector('.'+changeClass)) {
                    field.classList.remove(changeClass);
                    field.classList.add('to-update');
                    field.setAttribute('value', field.textContent);
                    classUpdated = true;
                }
            }
            if (!classUpdated) row.classList.add('to-update');
        }
    }
    function discardChanges(modal, discarded) {
        for (let discard of discarded) {
            let row = modal.querySelector(`[value="${discard}"]`).parentNode;
            for (let field of row.querySelectorAll('[value]')) {
                field.textContent = field.getAttribute('value');
                field.addEventListener('input', removeDiscardedStyle);
            }
            if (row.style.display == 'none') row.style.display = '';
            row.classList.add('discarded');

            function removeDiscardedStyle() {
                row.classList.remove('discarded');
                for (let field of row.querySelectorAll('[value]')) {
                    field.removeEventListener('input', removeDiscardedStyle);
                }
            }
        }
    }
    async function initSend(modal, url, data = null) {
        let success = false;
        let added = getAdded(modal);
        let response = await sendChanges(url, 'POST', added, data);
        if (response?.['Sended']) {
            success = true;
            if (discarded = response['Message']['Discarded']) {
                discardChanges(modal, discarded);
                added = added.filter(value => !discarded.includes(value['Name']));
            }
            fixateChanges(modal, added, 'to-add');
        }
        let updated = getUpdated(modal);
        response = await sendChanges(url, 'PUT', updated, data);
        if (response?.['Sended']) {
            success = true;
            if (discarded = response['Message']['Discarded']) {
                discardChanges(modal, discarded);
                updated = updated.filter(value => !discarded.includes(value['Name']));
            }
            fixateChanges(modal, updated);
        }
        let deleted = getDeleted(modal);
        response = await sendChanges(url, 'DELETE', deleted, data);
        if (response?.['Sended']) {
            success = true;
            if (discarded = response['Message']['Discarded']) {
                discardChanges(modal, discarded);
                deleted = deleted.filter(value => !discarded.includes(value));
            }
            for (let del of deleted) {
                modal.querySelector(`[value="${del}"]`).parentNode.remove();
            }
        }
        return success;
    }
    
    if(countriesModal = document.querySelector('.countries-modal')) {
        setAddable(countriesModal, '.country-add', function() {
            let div = getElement('div', ['editable-field', 'country']);
            let value = getElement('div', ['editable-value', 'to-add']);
            value.contentEditable = true;
            value.addEventListener('input', fieldOnInput);
            div.appendChild(value);
            let deleteButton = getElement('button', ['btn', 'btn-danger', 'editable-field-button', 'button-delete'], 'X');
            deleteButton.addEventListener('click', function() {
                this.parentNode.remove();
            });
            div.appendChild(deleteButton);
            document.querySelector('.countries-form').appendChild(div);
        });
        setDeletable(countriesModal, function() {
            this.parentNode.querySelector('.editable-value').classList.add('to-delete');
            this.parentNode.style.display = 'none';
        });
        countriesModal.querySelector('.sendChanges').addEventListener('click', async function() {
            await initSend(countriesModal, 'interfaces/countries.php');
            countrySetDeletable(countriesModal);
            updateCountries();
        })
    ;}
    if(servicesModal = document.querySelector('.services-modal')) {
        let countryServicesSetAddable = function() {
            setAddable(servicesModal, '.country-service-add', function() {
            let tr = getElement('tr', 'to-add');
            for (let name of ['Name', 'Price', 'Amount']) {
                let td = document.createElement('td');
                if (property = this.parentNode.parentNode.querySelector('[name="' + name + '"]')) {
                    td.textContent = property.textContent;
                    td.setAttribute('value', property.textContent)
                }
                td.setAttribute('name', name);
                tr.appendChild(td);
            }
            tr.querySelector('[name="Price"]').contentEditable = true;
            tr.querySelector('[name="Price"]').addEventListener('input', fieldOnInput);
            let td = getElement('td', 'buttons-row');
            let deleteButton = getElement('button', ['btn', 'btn-danger', 'editable-field-button', 'button-delete'], 'X');
            deleteButton.addEventListener('click', function() {
                this.parentNode.parentNode.remove();
                fillTableAddButtons(servicesModal.querySelector('.services .table tbody'), servicesModal.querySelector('.country-services .table tbody'));
                countryServicesSetAddable();
            });
            td.appendChild(deleteButton);
            tr.appendChild(td);
            servicesModal.querySelector('.country-services .table tbody').appendChild(tr);

            this.remove();
            });
        };
        let allServicesSetAddable = function() {
            setAddable(servicesModal, '.service-add', function() {
            let tr = getElement('tr', 'to-add');
            for (let name of ['Name', 'Amount']) {
                let td = getElement('td', 'editable-value');
                td.setAttribute('name', name);
                td.contentEditable = true;
                td.addEventListener('input', fieldOnInput);
                tr.appendChild(td);
            }
            let td =  getElement('td', 'buttons-row');
            let deleteButton = getElement('button', ['btn', 'btn-danger', 'editable-field-button', 'button-delete'], 'X');
            deleteButton.addEventListener('click', function() {
                this.parentNode.parentNode.remove();
            });
            td.appendChild(deleteButton);
            tr.appendChild(td);
            servicesModal.querySelector('.services tbody').appendChild(tr);
            });
        };
        
        servicesModal.querySelector('.sendChanges').addEventListener('click', async function() {
            let updated = false;
            if (await initSend(servicesModal.querySelector('.services'), 'interfaces/services.php')) updated = true;
            if (await initSend(servicesModal.querySelector('.country-services'), 'interfaces/services.php', {'Country': servicesModal.querySelector('.service-country').textContent}))
                updated = true;
            if (updated) {
                servicesSetDeletable(servicesModal);
                fillTableAddButtons(servicesModal.querySelector('.services .table tbody'), servicesModal.querySelector('.country-services .table tbody'));
                countryServicesSetAddable();
                updateCountryServices();
            }
        });

        document.querySelector('.services-edit-button').addEventListener('click', async function() {
            if (select.value == servicesModal.querySelector('.service-country').textContent) return;
            let countryServicesModal = document.querySelector('.services-modal .country-services');
            let countryServicesTable = countryServicesModal.querySelector('.table tbody');
            clearTable(countryServicesTable);
            servicesModal.querySelector('.service-country').textContent = select.value;
            countryServices = await (await fetch('interfaces/services.php?Country='+select.value)).json();
            fillTableEditableContent(
                countryServices, 
                countryServicesTable,
                ['Name', 'Price', 'Amount'],
                [
                getElement('button', ['btn', 'btn-danger', 'editable-field-button', 'button-delete'],'X'),
                ],
                ['Price']
            ); 
    
            let allServicesModal = document.querySelector('.services-modal .services');
            let allServicesTable = allServicesModal.querySelector('.table tbody');
            clearTable(allServicesTable);
            allServices = await (await fetch('interfaces/services.php')).json();
            fillTableEditableContent(
                allServices, 
                allServicesTable, 
                ['Name', 'Amount'],
                [
                    getElement('button', ['btn', 'btn-danger', 'editable-field-button', 'button-delete'], 'X'),
                ],
                ['Name', 'Amount']
            );
            fillTableAddButtons(allServicesTable, countryServicesTable);
            countryServicesSetAddable();
            allServicesSetAddable();
            servicesSetDeletable(servicesModal);
        });
    }

    let sliderButtons = document.querySelectorAll('.slider-button');
    let slides = document.querySelectorAll('.slider-slide');
    for (let i = 0; i < sliderButtons.length; i++) {
        sliderButtons[i].addEventListener('click', function() {
            let buttonClass = 'slider-button-active';
            let slideClass = 'slider-slide-active';
            document.querySelector('.'+buttonClass).classList.remove(buttonClass);
            document.querySelector('.'+slideClass).classList.remove(slideClass);
            this.classList.add(buttonClass);
            slides[i].classList.add(slideClass);
        })
    }
    document.querySelector('.history-button').addEventListener('click', async function() {
        let history = await (await fetch('interfaces/services.php?History=true'))?.json();
        let table = document.querySelector('.services-form .history tbody');
        clearTable(table);
        if (history.length) fillTableContent(history, table);
    })
});