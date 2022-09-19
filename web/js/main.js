// Entry point is `main()`

(function() {
    function genElem(content) {
        const holder = document.createElement('div');
        holder.innerHTML = content;
        const elem = holder.children[0];
        if (elem === undefined) {
            return holder;
        }
        holder.removeChild(elem);
        return elem;
    }

    function select(parent, selector) {
        const elem = parent.querySelector(selector);
        if (elem === null) {
            throw new Error(`Cannot find element with ${selector}`);
        }
        return elem;
    }

    function selectAll(parent, selector) {
        return Array.from(parent.querySelectorAll(selector));
    }

    function machineItemTemplate(params) {
        return `
            <li class="machine-item">
                <div class="machine-card" data-id="${params.id}">
                    <div class="machine-infos">
                        <div class="machine-info machine-id">
                            <div class="machine-info-key">ID:</div>
                            <div class="machine-info-value">${params.id}</div>
                        </div>
                        <div class="machine-info machine-status">
                            <div class="machine-info-key">Status:</div>
                            <div class="machine-info-value">${params.status}</div>
                        </div>
                        <div class="machine-info machine-type">
                            <div class="machine-info-key">Machine Type:</div>
                            <div class="machine-info-value">${params.machine_type}</div>
                        </div>
                        <div class="machine-info machine-location">
                            <div class="machine-info-key">Location:</div>
                            <div class="machine-info-value">(${params.latitude}, ${params.longitude})</div>
                        </div>
                        <div class="machine-info machine-floor">
                            <div class="machine-info-key">Floor:</div>
                            <div class="machine-info-value">${params.floor}</div>
                        </div>
                        <div class="machine-info machine-install-date">
                            <div class="machine-info-key">Install Date:</div>
                            <div class="machine-info-value">${params.install_date}</div>
                        </div>
                        <div class="machine-info machine-last-maintenance">
                            <div class="machine-info-key">Last Maintenance:</div>
                            <div class="machine-info-value">${params.last_maintenance}</div>
                        </div>
                    </div>
                    <button class="detail-btn" type="button">Detail</button>
                </div>
            </li>
        `;
    }

    function detailTemplate(params) {
        return `
            <div class="machine-detail-card">
                <div class="machine-infos">
                    <div class="machine-info machine-id">
                        <div class="machine-info-key">ID:</div>
                        <div class="machine-info-value">${params.id}</div>
                    </div>
                    <div class="machine-info machine-status">
                        <div class="machine-info-key">Status:</div>
                        <div class="machine-info-value">${params.status}</div>
                    </div>
                    <div class="machine-info machine-type">
                        <div class="machine-info-key">Machine Type:</div>
                        <div class="machine-info-value">${params.machine_type}</div>
                    </div>
                    <div class="machine-info machine-location">
                        <div class="machine-info-key">Location:</div>
                        <div class="machine-info-value">(${params.latitude}, ${params.longitude})</div>
                    </div>
                    <div class="machine-info machine-floor">
                        <div class="machine-info-key">Floor:</div>
                        <div class="machine-info-value">${params.floor}</div>
                    </div>
                    <div class="machine-info machine-install-date">
                        <div class="machine-info-key">Install Date:</div>
                        <div class="machine-info-value">${params.install_date}</div>
                    </div>
                    <div class="machine-info machine-last-maintenance">
                        <div class="machine-info-key">Last Maintenance:</div>
                        <div class="machine-info-value">${params.last_maintenance}</div>
                    </div>
                </div>
                <label class="event-list-label">Events:</label>
                <ul class="event-list">
                    ${params.events.map((event) => `
                        <li class="event-item">
                            <div class="event-item-status">${event.status}</div>
                            <div class="event-item-timestamp">${event.timestamp}</div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    const elems = {

        // Machine list view
        machineListView: select(document, '.machine-list-view'),
        filter: select(document, '.filter'),
        idInput: select(document, '.input-text'),
        allCheckbox: selectAll(document, '.checkbox'),
        allStatusInput: selectAll(document, '.field[data-name="status"] .input-checkbox'),
        allMachineTypeInput: selectAll(document, '.field[data-name="machine-type"] .input-checkbox'),
        sortBySelect: select(document, '.field[data-name="sort-by"] .select'),
        orderSelect: select(document, '.field[data-name="order"] .select'),
        searchBtn: select(document, '.search-btn'),
        resetBtn: select(document, '.reset-btn'),
        machineListLoadingMessage: select(document, '.machine-list-loading-message'),
        machineList: select(document, '.machine-list'),

        // Machine detail view
        machineDetailView: select(document, '.machine-detail-view'),
        backBtn: select(document, '.back-btn'),
        refreshBtn: select(document, '.refresh-btn'),
        machineDetailLoadingMessage: select(document, '.machine-detail-loading-message'),
        machineDetailHolder: select(document, '.machine-detail-holder'),
    };

    const state = {
        machineDetailViewDisplayed: true,
        filterDisplayed: true,
        selectedId: '',
    };

    function machineDetailViewDisplayed() {
        return state.machineDetailViewDisplayed;
    }

    function setMachineDetailViewDisplayed(value) {
        state.machineDetailViewDisplayed = value;
        elems.machineDetailView.setAttribute('data-displayed', String(value));
        elems.machineListView.setAttribute('data-displayed', String(!value));
    }

    function getFormData() {
        const id = elems.idInput.value;
        const status = Object.fromEntries(
            elems.allStatusInput.map((elem) => {
                const key = elem.getAttribute('data-value');
                const value = elem.checked;
                return [key, value];
            }),
        );
        const machineType = Object.fromEntries(
            elems.allMachineTypeInput.map((elem) => {
                const key = elem.getAttribute('data-value');
                const value = elem.checked;
                return [key, value];
            }),
        );
        const sortBy = elems.sortBySelect.value;
        const order = elems.orderSelect.value;
        return {
            id,
            status,
            machineType,
            sortBy,
            order,
        };
    }

    function compareById(a, b, isAsc) {
        const result = a.id.localeCompare(b.id);
        return result * (isAsc ? 1 : -1);
    }

    function compareByInstallDate(a, b, isAsc) {
        const result = new Date(a.install_date).getTime() - new Date(b.install_date).getTime();
        return result * (isAsc ? 1 : -1);
    }

    function compareByLastMaintenance(a, b, isAsc) {
        const result = new Date(a.last_maintenance).getTime() - new Date(b.last_maintenance).getTime();
        return result * (isAsc ? 1 : -1);
    }

    async function getFilteredMachines() {
        const res = await fetch('http://codingcase.zeiss.services/api/v1/machines');
        const data = await res.json();
        const machines = data.data;
        let filteredMachines = machines;

        const filter = getFormData();

        if (filter.id !== '') {
            filteredMachines = filteredMachines
                .filter((machine) => machine.id.indexOf(filter.id) > -1);
        }

        const allStatusSelected = Object.values(filter.status)
            .every((value) => value);
        if (!allStatusSelected) {
            const selectedStatus = Object.entries(filter.status)
                .filter(([_, value]) => value)
                .map(([key, _]) => key);
            filteredMachines = filteredMachines
                .filter((machine) => selectedStatus.includes(machine.status));
        }

        const allMachineTypeSelected = Object.values(filter.machineType)
            .every((value) => value);
        if (!allMachineTypeSelected) {
            const selectedMachineTypes = Object.entries(filter.machineType)
                .filter(([_, value]) => value)
                .map(([key, _]) => key);
            filteredMachines = filteredMachines
                .filter((machine) => selectedMachineTypes.includes(machine.machine_type));
        }

        const isAsc = filter.order === 'asc';

        if (filter.sortBy === 'id') {
            filteredMachines.sort((a, b) => {
                return compareById(a, b, isAsc);
            });
        }
        if (filter.sortBy === 'install_date') {
            filteredMachines.sort((a, b) => {
                return compareByInstallDate(a, b, isAsc);
            });
        }
        if (filter.sortBy === 'last_maintenance') {
            filteredMachines.sort((a, b) => {
                return compareByLastMaintenance(a, b, isAsc);
            });
        }

        return filteredMachines;
    }

    async function updateList() {
        elems.machineListLoadingMessage.setAttribute('data-displayed', 'true');
        const machines = await getFilteredMachines();
        elems.machineListLoadingMessage.setAttribute('data-displayed', 'false');
        Array.from(elems.machineList.children).forEach((elem) => {
            elems.machineList.removeChild(elem);
        });
        machines.forEach((machine) => {
            const machineItemElem = genElem(machineItemTemplate(machine));
            select(machineItemElem, '.detail-btn').addEventListener('click', () => {
                const id = select(machineItemElem, '.machine-card').getAttribute('data-id');
                state.selectedId = id;
                updateDetail();
                setMachineDetailViewDisplayed(true);
            });
            elems.machineList.appendChild(machineItemElem);
        });
    }

    function resetFilter() {
        elems.idInput.value = '';
        elems.allStatusInput.forEach((elem) => {
            elem.checked = true;
        });
        elems.allMachineTypeInput.forEach((elem) => {
            elem.checked = true;
        });
        elems.sortBySelect.value = '';
        elems.orderSelect.value = 'asc';
    }

    function initFilterForm() {
        elems.allCheckbox.forEach((elem) => {
            elem.addEventListener('click', () => {
                const inputCheckboxElem = select(elem, '.input-checkbox');
                inputCheckboxElem.click();
            });
        });
        elems.idInput.addEventListener('keydown', (event) => {
            if (event.code === 'Enter') {
                event.preventDefault();
                updateList();
            }
        });
        elems.searchBtn.addEventListener('click', () => {
            updateList();
        });
        elems.resetBtn.addEventListener('click', () => {
            resetFilter();
            updateList();
        });
    }

    async function getDetail(id) {
        const res = await fetch(`http://codingcase.zeiss.services/api/v1/machines/${id}`);
        const data = await res.json();
        return data.data;
    }

    function clearDetail() {
        Array.from(elems.machineDetailHolder.children).forEach((elem) => {
            elems.machineDetailHolder.removeChild(elem);
        });
    }

    async function updateDetail() {
        elems.machineDetailLoadingMessage.setAttribute('data-displayed', 'true');
        const detail = await getDetail(state.selectedId);
        elems.machineDetailLoadingMessage.setAttribute('data-displayed', 'false');
        clearDetail();
        elems.machineDetailHolder.appendChild(genElem(detailTemplate(detail)));
    }

    function initDetailView() {
        elems.backBtn.addEventListener('click', () => {
            clearDetail();
            state.selectedId = '';
            setMachineDetailViewDisplayed(false);
        });
        elems.refreshBtn.addEventListener('click', () => {
            updateDetail();
        });
    }

    async function main() {
        initFilterForm();
        initDetailView();
        updateList();
    }
    main();
})();
