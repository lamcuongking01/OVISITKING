// Game Data
const games = {
    'free-fire': {
        name: 'Free Fire',
        packages: [
            { days: 1, price: 15000 },
            { days: 3, price: 45000 },
            { days: 7, price: 90000 },
            { days: 30, price: 145000 }
        ]
    },
    'free-fire-max': {
        name: 'Free Fire Max',
        packages: [
            { days: 1, price: 15000 },
            { days: 3, price: 45000 },
            { days: 7, price: 90000 },
            { days: 30, price: 145000 }
        ]
    },
    'blood-strike': {
        name: 'Blood Strike',
        packages: [
            { days: 1, price: 15000 },
            { days: 3, price: 45000 },
            { days: 7, price: 90000 },
            { days: 30, price: 145000 }
        ]
    },
    'delta-force': {
        name: 'Delta Force (VIP)',
        packages: [
            { days: 1, price: 25000 },
            { days: 7, price: 110000 },
            { days: 30, price: 250000 }
        ]
    }
};

const discounts = {
    20000: 19000,
    50000: 47500,
    100000: 95000,
    200000: 190000
};

let state = {
    balance: 0,
    keys: [],
    selectedGame: null,
    selectedPackage: null,
    selectedCardAmount: null,
    userId: 'USER' + Date.now()
};

// Init
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEvents();
    updateBalance();
    updateGamePackages();
    
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.MainButton.hide();
    }
});

function setupEvents() {
    // Game Select
    document.getElementById('gameSelect').addEventListener('change', function() {
        state.selectedGame = this.value;
        state.selectedPackage = null;
        updateGamePackages();
    });

    // Package Select
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('option-btn') && e.target.dataset.days) {
            document.querySelectorAll('.option-btn[data-days]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.selectedPackage = {
                days: parseInt(e.target.dataset.days),
                price: parseInt(e.target.dataset.price)
            };
            updatePrice();
        }
    });

    // Card Amount Select
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('option-btn') && e.target.dataset.amount) {
            document.querySelectorAll('.option-btn[data-amount]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.selectedCardAmount = parseInt(e.target.dataset.amount);
        }
    });

    // Buy Button
    document.getElementById('buyBtn').addEventListener('click', buyKey);

    // Payment Buttons
    document.getElementById('bankBtn').addEventListener('click', function() {
        openModal('bankModal');
        updateBankContent();
    });

    document.getElementById('cardBtn').addEventListener('click', function() {
        openModal('cardModal');
    });

    // Tab Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateKeysList(this.dataset.tab);
        });
    });
}

function updateGamePackages() {
    const container = document.getElementById('packageOptions');
    
    if (!state.selectedGame) {
        container.innerHTML = '';
        document.getElementById('selectedPrice').textContent = '0₫';
        return;
    }

    const game = games[state.selectedGame];
    container.innerHTML = game.packages.map((pkg, idx) => `
        <button class="option-btn" data-days="${pkg.days}" data-price="${pkg.price}">
            ${pkg.days} ngày<br><small>${pkg.price.toLocaleString()}đ</small>
        </button>
    `).join('');

    document.getElementById('selectedPrice').textContent = '0₫';
}

function updatePrice() {
    if (state.selectedPackage) {
        document.getElementById('selectedPrice').textContent = state.selectedPackage.price.toLocaleString() + '₫';
    }
}

function buyKey() {
    if (!state.selectedGame || !state.selectedPackage) {
        showToast('❌ Chọn game và gói');
        return;
    }

    if (state.balance < state.selectedPackage.price) {
        showToast('❌ Số dư không đủ');
        return;
    }

    const game = games[state.selectedGame];
    const price = state.selectedPackage.price;

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + state.selectedPackage.days);

    state.keys.push({
        id: state.selectedGame.toUpperCase() + '-' + Date.now(),
        game: game.name,
        days: state.selectedPackage.days,
        expire: expireDate.toLocaleDateString('vi-VN'),
        price: price
    });

    state.balance -= price;
    saveData();
    updateBalance();
    updateKeysList('all');

    state.selectedGame = null;
    state.selectedPackage = null;
    document.getElementById('gameSelect').value = '';
    updateGamePackages();

    showToast('✅ Mua key thành công');
}

function submitCard() {
    const code = document.getElementById('cardCode').value;
    const serial = document.getElementById('cardSerial').value;

    if (!code || !serial) {
        showToast('❌ Nhập mã thẻ và serial');
        return;
    }

    if (!state.selectedCardAmount) {
        showToast('❌ Chọn mệnh giá');
        return;
    }

    const amount = discounts[state.selectedCardAmount] || state.selectedCardAmount;
    state.balance += amount;
    saveData();
    updateBalance();

    const discount = ((state.selectedCardAmount - amount) / state.selectedCardAmount * 100).toFixed(0);
    showToast(`✅ Nạp ${state.selectedCardAmount.toLocaleString()}đ (-${discount}%)`);

    document.getElementById('cardCode').value = '';
    document.getElementById('cardSerial').value = '';
    state.selectedCardAmount = null;
    document.querySelectorAll('.option-btn[data-amount]').forEach(b => b.classList.remove('active'));
    closeModal('cardModal');
}

function updateKeysList(tab) {
    const list = document.getElementById('keysList');
    let keys = state.keys;

    if (tab === 'active') {
        keys = state.keys.filter(k => new Date(k.expire) > new Date());
    } else if (tab === 'expired') {
        keys = state.keys.filter(k => new Date(k.expire) <= new Date());
    }

    if (keys.length === 0) {
        list.innerHTML = '<p class="empty">Chưa có key</p>';
        return;
    }

    list.innerHTML = keys.map(k => `
        <div class="key-item">
            <div class="key-info">
                <strong>${k.id}</strong>
                <p>${k.game} - ${k.days} ngày</p>
                <p>Hết: ${k.expire}</p>
            </div>
            <button class="copy-btn" onclick="copyToClipboard('${k.id}')">📋</button>
        </div>
    `).join('');
}

function updateBankContent() {
    document.getElementById('bankContent').textContent = 'OVISIT ' + state.userId;
}

function updateBalance() {
    document.getElementById('balance').textContent = state.balance.toLocaleString() + '₫';
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showToast('✅ Đã sao chép');
}

function copy(text) {
    navigator.clipboard.writeText(text);
    showToast('✅ Đã sao chép');
}

function saveData() {
    localStorage.setItem('ovisit_data', JSON.stringify(state));
}

function loadData() {
    const saved = localStorage.getItem('ovisit_data');
    if (saved) {
        state = { ...state, ...JSON.parse(saved) };
    }
}
nst keysList = document.getElementById('keysList');
    let filtered = state.keys;

    if (tab === 'active') {
        filtered = state.keys.filter(k => new Date(k.expireDate) > new Date());
    } else if (tab === 'expired') {
        filtered = state.keys.filter(k => new Date(k.expireDate) < new Date());
    } else if (tab === 'banned') {
        filtered = state.keys.filter(k => k.status === 'banned');
    }

    if (filtered.length === 0) {
        keysList.innerHTML = '<p class="empty-state">Không có key</p>';
        return;
    }

    keysList.innerHTML = filtered.map(key => `
        <div class="key-item">
            <div class="key-info">
                <p><strong>${key.id}</strong></p>
                <p>${key.game} (${key.type}) - ${key.package}</p>
                <p>Hết: ${key.expireDate}</p>
            </div>
            <button class="btn-copy">📋</button>
        </div>
    `).join('');
}

// Update Transfer Content
function updateTransferContent() {
    const input = document.getElementById('transferContent');
    if (input) input.value = `OVISIT ${state.userId}`;
}

// Update UI
function updateUI() {
    document.getElementById('currentBalance').textContent = state.accountBalance.toLocaleString() + '₫';
    document.getElementById('totalSpent').textContent = state.totalSpent.toLocaleString() + '₫';

    const activeKeys = state.keys.filter(k => new Date(k.expireDate) > new Date()).length;
    const expiredKeys = state.keys.filter(k => new Date(k.expireDate) < new Date()).length;

    document.querySelectorAll('.stat-number')[0].textContent = state.keys.length;
    document.querySelectorAll('.stat-number')[1].textContent = activeKeys;
    document.querySelectorAll('.stat-number')[2].textContent = expiredKeys;
}

// Show Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Save/Load
function saveUserData() {
    localStorage.setItem('ovisit_state', JSON.stringify(state));
}

function loadUserData() {
    const saved = localStorage.getItem('ovisit_state');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            state = { ...state, ...data };
        } catch (e) {}
    }
}
Game) {
        document.getElementById('packageList').innerHTML = '';
        return;
    }
    
    const game = games[state.selectedGame];
    const packageList = document.getElementById('packageList');
    const packageDescription = document.getElementById('packageDescription');
    
    packageDescription.textContent = `Gói ${game.name}`;
    
    packageList.innerHTML = game.packages.map(pkg => `
        <button class="package-btn" data-price="${pkg.price}" data-days="${pkg.days}">
            ${pkg.days} ngày<br><small>${pkg.price.toLocaleString()}đ</small>
        </button>
    `).join('');

    document.querySelectorAll('.package-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            selectPackage(this);
        });
    });
}

// Package Selection
function selectPackage(btn) {
    state.selectedPackage = {
        days: parseInt(btn.dataset.days),
        price: parseInt(btn.dataset.price)
    };
    
    document.querySelectorAll('.package-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateUI();
    
    const game = games[state.selectedGame];
    showToast(`Chọn ${game.name} - ${state.selectedPackage.days} ngày`, 'success');
}

// Purchase Key
function purchaseKey() {
    if (!state.selectedGame || !state.selectedPackage) {
        showToast('Vui lòng chọn game và gói!', 'error');
        return;
    }

    const game = games[state.selectedGame];
    const price = state.selectedPackage.price;

    if (state.accountBalance < price) {
        showToast('Số dư không đủ. Vui lòng nạp tiền!', 'error');
        return;
    }

    // Generate key
    const keyId = `${state.selectedGame.toUpperCase()}-${Date.now()}`;
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + state.selectedPackage.days);

    const newKey = {
        id: keyId,
        game: game.name,
        type: game.type,
        package: `${state.selectedPackage.days} ngày`,
        price: price,
        purchaseDate: new Date().toLocaleDateString('vi-VN'),
        expireDate: expireDate.toLocaleDateString('vi-VN'),
        status: 'active'
    };

    state.keys.push(newKey);
    state.accountBalance -= price;
    state.totalSpent += price;

    saveUserData();
    updateUI();
    showToast(`✅ Mua key ${game.name} thành công!`, 'success');
    
    // Reset selection
    state.selectedGame = null;
    state.selectedPackage = null;
    updatePackageList();
    updateGameDisplay();
    updateUI();
}

// Submit Card
function submitCard() {
    const cardCode = document.getElementById('cardCode').value;
    const cardSerial = document.getElementById('cardSerial').value;
    const activeDenom = document.querySelector('.denom-btn.active');

    if (!cardCode || !cardSerial) {
        showToast('Vui lòng nhập mã thẻ và serial!', 'error');
        return;
    }

    if (!activeDenom) {
        showToast('Vui lòng chọn mệnh giá!', 'error');
        return;
    }

    const nominalAmount = parseInt(activeDenom.dataset.amount);
    const actualAmount = marketDiscounts[nominalAmount] || nominalAmount;

    state.accountBalance += actualAmount;
    saveUserData();
    updateUI();

    const discountAmount = nominalAmount - actualAmount;
    const discountPercent = ((discountAmount / nominalAmount) * 100).toFixed(1);

    showToast(`✅ Nạp ${nominalAmount.toLocaleString()}đ → Nhận ${actualAmount.toLocaleString()}đ (chiết khấu ${discountPercent}%)`, 'success');
    
    // Clear inputs
    document.getElementById('cardCode').value = '';
    document.getElementById('cardSerial').value = '';
    document.querySelectorAll('.denom-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('cardModal').classList.remove('active');
}

// Update Keys List
function updateKeysList(tab) {
    const keysList = document.getElementById('keysList');
    let filteredKeys = state.keys;

    if (tab === 'active') {
        filteredKeys = state.keys.filter(k => {
            const expire = new Date(k.expireDate);
            return expire > new Date() && k.status === 'active';
        });
    } else if (tab === 'expired') {
        filteredKeys = state.keys.filter(k => {
            const expire = new Date(k.expireDate);
            return expire < new Date();
        });
    } else if (tab === 'banned') {
        filteredKeys = state.keys.filter(k => k.status === 'banned');
    }

    if (filteredKeys.length === 0) {
        keysList.innerHTML = '<p class="empty-state">Chưa có key nào</p>';
        return;
    }

    keysList.innerHTML = filteredKeys.map(key => `
        <div class="key-item">
            <div class="key-info">
                <p><strong>Key ID:</strong> ${key.id}</p>
                <p><strong>Game:</strong> ${key.game} (${key.type === 'vip' ? 'VIP' : 'Thường'})</p>
                <p><strong>Gói:</strong> ${key.package}</p>
                <p><strong>Hết hạn:</strong> ${key.expireDate}</p>
            </div>
            <button class="btn-copy">📋 Copy</button>
        </div>
    `).join('');

    // Re-attach copy listeners
    document.querySelectorAll('.key-item .btn-copy').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const keyId = this.parentElement.querySelector('.key-info p').textContent.replace('Key ID: ', '').trim();
            navigator.clipboard.writeText(keyId).then(() => {
                showToast('Đã sao chép key!', 'success');
            });
        });
    });
}

// Update Transfer Content
function updateTransferContent() {
    const transferContent = document.getElementById('transferContent');
    if (transferContent) {
        transferContent.value = `OVISIT ${state.userId}`;
    }
}

// Update UI
function updateUI() {
    console.log('Updating UI...');
    
    // Update balance
    const userBalance = document.getElementById('userBalance');
    const currentBalance = document.getElementById('currentBalance');
    const totalSpent = document.getElementById('totalSpent');
    
    if (userBalance) userBalance.textContent = `Số dư: ${state.accountBalance.toLocaleString()}₫`;
    if (currentBalance) currentBalance.textContent = state.accountBalance.toLocaleString() + '₫';
    if (totalSpent) totalSpent.textContent = state.totalSpent.toLocaleString() + '₫';

    // Update stats
    const activeKeys = state.keys.filter(k => {
        const expire = new Date(k.expireDate);
        return expire > new Date() && k.status === 'active';
    }).length;
    const expiredKeys = state.keys.filter(k => {
        const expire = new Date(k.expireDate);
        return expire < new Date();
    }).length;

    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 3) {
        statNumbers[0].textContent = state.keys.length;
        statNumbers[1].textContent = activeKeys;
        statNumbers[2].textContent = expiredKeys;
    }

    // Update game display
    if (state.selectedGame) {
        updateGameDisplay();
        updatePackageList();
    }
}

// Show Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Save/Load User Data
function saveUserData() {
    localStorage.setItem('ovisit_state', JSON.stringify(state));
}

function loadUserData() {
    const saved = localStorage.getItem('ovisit_state');
    if (saved) {
        try {
            const savedState = JSON.parse(saved);
            state = {
                ...state,
                accountBalance: savedState.accountBalance || 0,
                totalSpent: savedState.totalSpent || 0,
                keys: savedState.keys || []
            };
        } catch (e) {
            console.log('Error loading state:', e);
        }
    }
}
  state.totalSpent += price;

    saveUserData();
    updateUI();
    showToast('Mua key thành công!', 'success');
    
    // Reset selection
    state.selectedGame = null;
    state.selectedPackage = null;
    updatePackageList();
    updateGameDisplay();
    updateUI();
}

// Submit Card
function submitCard() {
    const cardCode = document.getElementById('cardCode').value;
    const cardSerial = document.getElementById('cardSerial').value;
    const activeDenom = document.querySelector('.denom-btn.active');

    if (!cardCode || !cardSerial) {
        showToast('Vui lòng nhập mã thẻ và serial!', 'error');
        return;
    }

    if (!activeDenom) {
        showToast('Vui lòng chọn mệnh giá!', 'error');
        return;
    }

    const nominalAmount = parseInt(activeDenom.dataset.amount);
    const actualAmount = marketDiscounts[nominalAmount] || nominalAmount;

    state.accountBalance += actualAmount;
    saveUserData();
    updateUI();

    const discountAmount = nominalAmount - actualAmount;
    const discountPercent = ((discountAmount / nominalAmount) * 100).toFixed(1);

    showToast(`Nạp thẻ thành công! Nạp ${nominalAmount.toLocaleString()}đ → Nhận ${actualAmount.toLocaleString()}đ (chiết khấu ${discountPercent}%)`, 'success');
    
    // Clear inputs
    document.getElementById('cardCode').value = '';
    document.getElementById('cardSerial').value = '';
    document.querySelectorAll('.denom-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('cardModal').classList.remove('active');
}

// Update Keys List
function updateKeysList(tab) {
    const keysList = document.getElementById('keysList');
    let filteredKeys = state.keys;

    if (tab === 'active') {
        filteredKeys = state.keys.filter(k => {
            const expire = new Date(k.expireDate);
            return expire > new Date() && k.status === 'active';
        });
    } else if (tab === 'expired') {
        filteredKeys = state.keys.filter(k => {
            const expire = new Date(k.expireDate);
            return expire < new Date();
        });
    } else if (tab === 'banned') {
        filteredKeys = state.keys.filter(k => k.status === 'banned');
    }

    if (filteredKeys.length === 0) {
        keysList.innerHTML = '<p class="empty-state">Chưa có key nào</p>';
        return;
    }

    keysList.innerHTML = filteredKeys.map(key => `
        <div class="key-item">
            <div class="key-info">
                <p><strong>Key ID:</strong> ${key.id}</p>
                <p><strong>Game:</strong> ${key.game} (${key.type === 'vip' ? 'VIP' : 'Thường'})</p>
                <p><strong>Gói:</strong> ${key.package}</p>
                <p><strong>Hết hạn:</strong> ${key.expireDate}</p>
            </div>
            <button class="btn-copy">📋 Copy</button>
        </div>
    `).join('');

    // Re-attach copy listeners
    document.querySelectorAll('.key-item .btn-copy').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const keyId = this.parentElement.querySelector('.key-info p').textContent.replace('Key ID: ', '').trim();
            navigator.clipboard.writeText(keyId).then(() => {
                showToast('Đã sao chép key!', 'success');
            });
        });
    });
}

// Update Transfer Content
function updateTransferContent() {
    document.getElementById('transferContent').value = `OVISIT ${state.userId}`;
}

// Update UI
function updateUI() {
    // Update balance
    document.getElementById('userBalance').textContent = `Số dư: ${state.accountBalance.toLocaleString()}₫`;
    document.getElementById('currentBalance').textContent = state.accountBalance.toLocaleString() + '₫';
    document.getElementById('totalSpent').textContent = state.totalSpent.toLocaleString() + '₫';

    // Update stats
    const activeKeys = state.keys.filter(k => {
        const expire = new Date(k.expireDate);
        return expire > new Date() && k.status === 'active';
    }).length;
    const expiredKeys = state.keys.filter(k => {
        const expire = new Date(k.expireDate);
        return expire < new Date();
    }).length;

    document.querySelectorAll('.stat-number')[0].textContent = state.keys.length;
    document.querySelectorAll('.stat-number')[1].textContent = activeKeys;
    document.querySelectorAll('.stat-number')[2].textContent = expiredKeys;

    // Update game display
    if (state.selectedGame) {
        updateGameDisplay();
        updatePackageList();
    }
}

// Show Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Save/Load User Data
function saveUserData() {
    localStorage.setItem('ovisit_state', JSON.stringify(state));
}

function loadUserData() {
    const saved = localStorage.getItem('ovisit_state');
    if (saved) {
        const savedState = JSON.parse(saved);
        state = {
            ...state,
            accountBalance: savedState.accountBalance,
            totalSpent: savedState.totalSpent,
            keys: savedState.keys
        };
    }
}

// Export
window.selectGame = selectGame;
window.selectPackage = selectPackage;
window.updateUI = updateUI;
             
