const wasteForm = document.getElementById('wasteForm');

if (wasteForm) {
    wasteForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const dish = document.getElementById('dish').value.trim();
        const quantity = parseFloat(document.getElementById('quantity').value);
        const reason = document.getElementById('reason').value;
        const staff = document.getElementById('staff').value.trim() || 'Anonymous';
        const date = new Date().toISOString();

        if (!dish || !quantity || !reason) {
            alert('Please fill in all required fields!');
            return;
        }

        const log = {
            id: Date.now(),
            dish: dish,
            quantity: quantity,
            reason: reason,
            staff: staff,
            date: date,
            day: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        };

        saveLog(log);

        const successMsg = document.getElementById('successMsg');
        successMsg.style.display = 'block';
        wasteForm.reset();

        successMsg.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 5000);
    });
}

function saveLog(log) {
    let logs = JSON.parse(localStorage.getItem('wasteLogs')) || [];
    logs.push(log);
    localStorage.setItem('wasteLogs', JSON.stringify(logs));
}

function getLogs() {
    return JSON.parse(localStorage.getItem('wasteLogs')) || [];
}

function calculateDashboard() {
    const logs = getLogs();

    if (logs.length === 0) {
        return {
            totalWaste: 0,
            totalLogs: 0,
            topItems: [],
            topReasons: [],
            worstDay: null,
            insight: 'No waste has been logged yet.',
            logs: []
        };
    }

    const totalWaste = logs.reduce((sum, log) => {
        return sum + log.quantity;
    }, 0);

    const itemCounts = {};

    logs.forEach(log => {
        itemCounts[log.dish] = (itemCounts[log.dish] || 0) + log.quantity;
    });

    const topItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, quantity]) => ({
            name: name,
            quantity: quantity
        }));

    const reasonCounts = {};

    logs.forEach(log => {
        reasonCounts[log.reason] = (reasonCounts[log.reason] || 0) + 1;
    });

    const topReasons = Object.entries(reasonCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([reason, count]) => ({
            reason: reason,
            count: count
        }));

    const dayCounts = {};

    logs.forEach(log => {
        dayCounts[log.day] = (dayCounts[log.day] || 0) + log.quantity;
    });

    const worstDay = Object.entries(dayCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([day, quantity]) => ({
            day: day,
            quantity: quantity
        }))[0];

    let insight = 'Keep logging waste to discover patterns.';

    if (topItems.length > 0 && topReasons.length > 0 && worstDay) {
        insight = `${topItems[0].name} is your biggest waste item. Most waste is caused by ${topReasons[0].reason}, with ${worstDay.day} being the highest-waste day.`;
    }

    return {
        totalWaste: totalWaste,
        totalLogs: logs.length,
        topItems: topItems,
        topReasons: topReasons,
        worstDay: worstDay,
        insight: insight,
        logs: logs
    };
}

function renderDashboard() {
    const dashboard = document.getElementById('dashboardContent');

    if (!dashboard) {
        return;
    }

    const data = calculateDashboard();

    if (data.totalLogs === 0) {
        dashboard.innerHTML = `
            <div style="text-align:center; padding:60px 20px; background:var(--paper); color:var(--ink); border-radius:4px;">
                <h3 style="font-family:var(--display); font-size:1.5rem; margin-bottom:10px;">
                    No waste logged yet
                </h3>
                <p style="margin-bottom:20px;">
                    Start logging waste to see your kitchen patterns.
                </p>
                <a href="log.html" style="background:var(--stamp-red); color:white; padding:12px 20px; text-decoration:none;">
                    + Log Your First Waste
                </a>
            </div>
        `;
        return;
    }

    dashboard.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:24px;">
            <div style="background:var(--paper); color:var(--ink); padding:24px; border-radius:4px;">
                <div style="font-family:var(--mono); font-size:0.75rem; text-transform:uppercase;">
                    Total Waste
                </div>
                <strong style="font-family:var(--display); font-size:2.5rem;">
                    ${data.totalWaste.toFixed(1)} kg
                </strong>
            </div>

            <div style="background:var(--paper); color:var(--ink); padding:24px; border-radius:4px;">
                <div style="font-family:var(--mono); font-size:0.75rem; text-transform:uppercase;">
                    Waste Logs
                </div>
                <strong style="font-family:var(--display); font-size:2.5rem;">
                    ${data.totalLogs}
                </strong>
            </div>

            <div style="background:var(--paper); color:var(--ink); padding:24px; border-radius:4px;">
                <div style="font-family:var(--mono); font-size:0.75rem; text-transform:uppercase;">
                    Worst Day
                </div>
                <strong style="font-family:var(--display); font-size:2rem;">
                    ${data.worstDay.day}
                </strong>
            </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:24px;">
            <div style="background:var(--paper); color:var(--ink); padding:24px; border-radius:4px;">
                <div style="font-family:var(--mono); font-size:0.75rem; text-transform:uppercase; margin-bottom:16px;">
                    Biggest Waste Items
                </div>

                ${data.topItems.map((item, index) => `
                    <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--line);">
                        <span>${index + 1}. ${item.name}</span>
                        <strong>${item.quantity.toFixed(1)} kg</strong>
                    </div>
                `).join('')}
            </div>

            <div style="background:var(--paper); color:var(--ink); padding:24px; border-radius:4px;">
                <div style="font-family:var(--mono); font-size:0.75rem; text-transform:uppercase; margin-bottom:16px;">
                    Main Waste Reasons
                </div>

                ${data.topReasons.map((reason, index) => `
                    <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--line);">
                        <span>${index + 1}. ${reason.reason}</span>
                        <strong>${reason.count} logs</strong>
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="background:var(--paper); color:var(--ink); padding:28px; border-left:5px solid var(--stamp-red); border-radius:4px;">
            <div style="font-family:var(--mono); font-size:0.75rem; text-transform:uppercase; margin-bottom:8px;">
                Wastebin Insight
            </div>

            <h3 style="font-family:var(--display); font-size:1.5rem; margin:0 0 8px;">
                What should you investigate?
            </h3>

            <p style="margin:0; line-height:1.6;">
                ${data.insight}
            </p>
        </div>
    `;
}

function exportCSV() {
    const logs = getLogs();

    if (logs.length === 0) {
        alert('There is no data to export.');
        return;
    }

    let csv = 'Dish,Quantity,Reason,Staff,Date\n';

    logs.forEach(log => {
        csv += `"${log.dish}",${log.quantity},"${log.reason}","${log.staff}","${log.date}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'wastebin-data.csv';
    link.click();

    URL.revokeObjectURL(url);
}

function clearAllData() {
    const confirmed = confirm('Are you sure you want to delete all waste data?');

    if (!confirmed) {
        return;
    }

    localStorage.removeItem('wasteLogs');
    renderDashboard();
}

if (document.getElementById('dashboardContent')) {
    renderDashboard();
}