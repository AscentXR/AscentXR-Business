// Ascent XR CRM - API Integration
(function() {
    'use strict';

    const API_BASE = '/api/crm';

    function getToken() {
        return localStorage.getItem('ascent_token');
    }

    function authHeaders() {
        const token = getToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        };
    }

    async function apiFetch(url, options = {}) {
        try {
            const res = await fetch(url, {
                headers: authHeaders(),
                ...options
            });
            if (res.status === 401) {
                window.location.href = '../login.html';
                return null;
            }
            return await res.json();
        } catch (err) {
            console.warn('API error:', err.message);
            return null;
        }
    }

    // State
    let schools = [];
    let contacts = [];
    let pipeline = [];
    let communications = [];

    // ===== DATA LOADING =====
    async function loadSchools() {
        const data = await apiFetch(API_BASE + '/companies');
        if (data && data.success) {
            schools = data.data;
            renderSchools();
            updateStats();
            populateSchoolDropdowns();
        }
    }

    async function loadContacts() {
        const data = await apiFetch(API_BASE + '/contacts');
        if (data && data.success) {
            contacts = data.data.contacts || data.data;
            renderContacts();
            updateStats();
        }
    }

    async function loadPipeline() {
        const data = await apiFetch(API_BASE + '/deals');
        if (data && data.success) {
            pipeline = data.data;
            renderPipeline();
            updateStats();
        }
    }

    async function loadAnalytics() {
        const data = await apiFetch(API_BASE + '/analytics');
        if (data && data.success) {
            renderAnalytics(data.data);
        }
    }

    // ===== RENDER FUNCTIONS =====
    function updateStats() {
        document.getElementById('totalSchools').textContent = schools.length;
        document.getElementById('totalContacts').textContent = contacts.length;

        const pipelineValue = pipeline.reduce((sum, d) => sum + parseFloat(d.opportunity_value || 0), 0);
        document.getElementById('pipelineValue').textContent = '$' + (pipelineValue / 1000).toFixed(0) + 'K';

        const renewals = schools.filter(s => s.relationship_status === 'renewal_pending').length;
        document.getElementById('renewalsDue').textContent = renewals;

        document.getElementById('quickActive').textContent = schools.filter(s => s.relationship_status === 'active').length;
        document.getElementById('quickPipeline').textContent = pipeline.length;
        document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
    }

    function renderSchools() {
        const tbody = document.getElementById('schoolsTableBody');
        if (!tbody) return;

        tbody.innerHTML = schools.map(s => `
            <tr>
                <td><strong>${s.name}</strong></td>
                <td>${s.city}, ${s.state}</td>
                <td>${(s.total_students || 0).toLocaleString()}</td>
                <td><span class="badge ${s.relationship_status || 'prospect'}">${(s.relationship_status || 'prospect').replace('_', ' ')}</span></td>
                <td>${s.renewal_date || '-'}</td>
                <td>${s.contact_count || 0}</td>
                <td><button class="btn btn-secondary" onclick="viewSchool('${s.id}')"><i class="fas fa-eye"></i></button></td>
            </tr>
        `).join('');
    }

    function renderContacts() {
        const tbody = document.getElementById('contactsTableBody');
        if (!tbody) return;

        tbody.innerHTML = contacts.map(c => `
            <tr>
                <td><strong>${c.first_name} ${c.last_name}</strong></td>
                <td>${c.title}</td>
                <td>${c.school_district_name || '-'}</td>
                <td>${c.email}</td>
                <td>${c.phone || '-'}</td>
                <td>${c.is_decision_maker ? '<span class="badge active">Yes</span>' : 'No'}</td>
                <td>${new Date(c.updated_at).toLocaleDateString()}</td>
                <td><button class="btn btn-secondary" onclick="editContact('${c.id}')"><i class="fas fa-edit"></i></button></td>
            </tr>
        `).join('');
    }

    function renderPipeline() {
        const stageMap = {
            discovery: 'stageDiscoveryContent',
            needs_assessment: 'stageNeedsContent',
            proposal_sent: 'stageProposalContent',
            demo_scheduled: 'stageDemoContent',
            pilot_negotiation: 'stagePilotContent',
            contract_review: 'stageContractContent'
        };

        const stageCounts = {};

        // Clear all stages
        Object.values(stageMap).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });

        pipeline.forEach(deal => {
            const containerId = stageMap[deal.stage];
            const container = document.getElementById(containerId);
            if (!container) return;

            stageCounts[deal.stage] = (stageCounts[deal.stage] || 0) + 1;

            container.innerHTML += `
                <div style="background:var(--dark-bg,#0f172a);border-radius:8px;padding:12px;margin-bottom:10px;border:1px solid var(--border-color);">
                    <div style="font-weight:600;margin-bottom:4px;">${deal.school_district_name || 'Unknown'}</div>
                    <div style="font-size:0.85rem;color:var(--gray-color);">$${(parseFloat(deal.opportunity_value) / 1000).toFixed(0)}K | ${deal.probability}%</div>
                    <div style="font-size:0.8rem;color:var(--gray-color);margin-top:4px;">${deal.next_action || ''}</div>
                </div>
            `;
        });

        // Update stage counts
        document.getElementById('stageDiscovery').textContent = stageCounts.discovery || 0;
        document.getElementById('stageNeeds').textContent = stageCounts.needs_assessment || 0;
        document.getElementById('stageProposal').textContent = stageCounts.proposal_sent || 0;
        document.getElementById('stageDemo').textContent = stageCounts.demo_scheduled || 0;
        document.getElementById('stagePilot').textContent = stageCounts.pilot_negotiation || 0;
        document.getElementById('stageContract').textContent = stageCounts.contract_review || 0;
    }

    function renderAnalytics(data) {
        if (!data) return;

        // Pipeline chart
        const pipelineCtx = document.getElementById('pipelineChart');
        if (pipelineCtx && data.stages) {
            new Chart(pipelineCtx, {
                type: 'bar',
                data: {
                    labels: data.stages.map(s => s.stage.replace('_', ' ')),
                    datasets: [{
                        label: 'Pipeline Value',
                        data: data.stages.map(s => parseFloat(s.value || 0)),
                        backgroundColor: '#0a1d45'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { ticks: { callback: v => '$' + (v/1000) + 'K' } }
                    }
                }
            });
        }
    }

    function populateSchoolDropdowns() {
        const selects = ['contactSchool', 'commSchool', 'commSchoolFilter'];
        selects.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;
            const firstOption = select.querySelector('option');
            select.innerHTML = '';
            if (firstOption) select.appendChild(firstOption);
            schools.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.name;
                select.appendChild(opt);
            });
        });
    }

    // ===== NAVIGATION =====
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.dataset.view;
            if (!view) return;

            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            const viewEl = document.getElementById(view + 'View');
            if (viewEl) viewEl.classList.add('active');
        });
    });

    // ===== SAVE HANDLERS =====
    const saveSchoolBtn = document.getElementById('saveSchoolBtn');
    if (saveSchoolBtn) {
        saveSchoolBtn.addEventListener('click', async function() {
            const data = {
                name: document.getElementById('schoolName').value,
                state: document.getElementById('schoolState').value,
                city: document.getElementById('schoolCity').value,
                total_students: parseInt(document.getElementById('schoolStudents').value)
            };

            const result = await apiFetch(API_BASE + '/contacts', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (result && result.success) {
                document.getElementById('schoolModal').classList.remove('active');
                loadSchools();
            }
        });
    }

    const saveContactBtn = document.getElementById('saveContactBtn');
    if (saveContactBtn) {
        saveContactBtn.addEventListener('click', async function() {
            const data = {
                first_name: document.getElementById('contactFirstName').value,
                last_name: document.getElementById('contactLastName').value,
                title: document.getElementById('contactTitle').value,
                email: document.getElementById('contactEmail').value,
                phone: document.getElementById('contactPhone').value,
                school_district_id: document.getElementById('contactSchool').value,
                linkedin_url: document.getElementById('contactLinkedIn').value,
                is_decision_maker: document.getElementById('contactDecisionMaker').checked
            };

            const result = await apiFetch(API_BASE + '/contacts', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (result && result.success) {
                document.getElementById('contactModal').classList.remove('active');
                loadContacts();
            }
        });
    }

    // ===== MODAL HANDLERS =====
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });

    const addSchoolBtns = document.querySelectorAll('#addSchoolBtn, #addNewSchoolBtn');
    addSchoolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('schoolModal').classList.add('active');
        });
    });

    const addContactBtn = document.getElementById('addNewContactBtn');
    if (addContactBtn) {
        addContactBtn.addEventListener('click', () => {
            document.getElementById('contactModal').classList.add('active');
        });
    }

    const addCommBtn = document.getElementById('addNewCommBtn');
    if (addCommBtn) {
        addCommBtn.addEventListener('click', () => {
            document.getElementById('communicationModal').classList.add('active');
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadSchools();
            loadContacts();
            loadPipeline();
            loadAnalytics();
        });
    }

    // ===== INIT =====
    if (!getToken()) {
        window.location.href = '../login.html';
    } else {
        loadSchools();
        loadContacts();
        loadPipeline();
        loadAnalytics();
    }

    // Global functions for inline handlers
    window.viewSchool = function(id) { console.log('View school:', id); };
    window.editContact = function(id) { console.log('Edit contact:', id); };
})();
