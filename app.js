// ============================================
// WASTEBIN - The Brain
// ============================================

// ============================================
// LOG FORM HANDLER
// ============================================
const wasteForm = document.getElementById('wasteForm');

if (wasteForm) {
    wasteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get values
        const dish = document.getElementById('dish').value.trim();
        const quantity = parseFloat(document.getElementById('quantity').value);
        const reason = document.getElementById('reason').value;
        const staff = document.getElementById('staff').value.trim() || 'Anonymous';
        const date = new Date().toISOString();
        
        // Validate
        if (!dish || !quantity || !reason) {
            alert('Please fill in all required fields!');
            return;
        }
        
        // Create waste log object
        const log = {
            id: Date.now(),
            dish: dish,
            quantity: quantity,
            reason: reason,
            staff: staff,
            date: date,
            day: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        };
        
        // Save to localStorage
        saveLog(log);
        
        // Show success
        const successMsg = document.getElementById('successMsg');
        successMsg.style.display = 'block';
        wasteForm.reset();
        
        // Scroll to success message
        successMsg.scrollIntoView({ behavior: 'smooth' });
        
        // Auto-hide success after 5 seconds
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 5000);
    });
}

// ============================================
// SAVE LOG TO LOCALSTORAGE
// ============================================
function saveLog(log) {
    let logs = JSON.parse(localStorage.getItem('wasteLogs')) || [];
    logs.push(log);
    localStorage.setItem('wasteLogs', JSON.stringify(logs));
    console.log('✅ Log saved:', log);
}

// ============================================
// GET ALL LOGS
// ============================================
function getLogs() {
    return JSON.parse(localStorage.getItem('wasteLogs')) || [];
}

// ============================================
// CALCULATE DASHBOARD DATA
// ============================================
function calculateDashboard() {
    const logs = getLogs();
    
    if (logs.length === 0) {
        return {
            totalWaste: 0,
            totalLogs: 0,
            topItems: [],
            topReasons: [],
            logs: []
        };
    }
    
    // Total waste
    const totalWaste = logs.reduce((sum, log) => sum + log.quantity, 0);
    
    // Top items
    const itemCounts = {};
    logs.forEach(log => {
        itemCounts[log.dish] = (itemCounts[log.dish] || 0) + log.quantity;
    });
    const topItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, quantity]) => ({ name, quantity }));
    
    // Top reasons
    const reasonCounts = {};
    logs.forEach(log => {
        reasonCounts[log.reason] = (reasonCounts[log.reason] || 0) + 1;
    });
    const topReasons = Object.entries(reasonCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([reason, count]) => ({ reason, count }));
    
    return {
        totalWaste: totalWaste,
        totalLogs: logs.length,
        topItems: topItems