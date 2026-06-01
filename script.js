// Game Data
const games = {
    'free-fire': {
        name: 'Free Fire',
        type: 'normal',
        icon: '🔥',
        packages: [
            { days: 1, price: 15000 },
            { days: 3, price: 45000 },
            { days: 7, price: 90000 },
            { days: 30, price: 145000 }
        ]
    },
    'free-fire-max': {
        name: 'Free Fire Max',
        type: 'normal',
        icon: '✨',
        packages: [
            { days: 1, price: 15000 },
            { days: 3, price: 45000 },
            { days: 7, price: 90000 },
            { days: 30, price: 145000 }
        ]
    },
    'blood-strike': {
        name: 'Blood Strike',
        type: 'normal',
        icon: '🗡️',
        packages: [
            { days: 1, price: 15000 },
            { days: 3, price: 45000 },
            { days: 7, price: 90000 },
            { days: 30, price: 145000 }
        ]
    },
    'delta-force': {
        name: 'Delta Force',
        type: 'vip',
        icon: '👑',
        packages: [
            { days: 1, price: 25000 },
            { days: 7, price: 110000 },
            { days: 30, price: 250000 }
        ]
    }
};

// Market Discount Rates (5%)
const marketDiscounts = {
    20000: 19000,
    50000: 47500,
    100000: 95000,
    200000: 190000
};

// Current state
let state = {
    selectedGame: null,
    selectedPackage: null,
    accountBalance: 0,
    totalSpent: 0,
    keys: [],
    userId: Math.random().toString(36).substring(2, 10).toUpperCase()
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    buildGamesList();
    setupEventListeners();
    updateUI();
});

// Build Games List in Modal
function buildGamesList() {
    const gamesList = document.querySelector('.games-list');
    gamesList.innerHTML = Object.entries(games).map(([id, game]) => `
        <div class="game-item" data-game="${id}">
            <div style="width: 40px; height: 40px; border-radius: 4px; background: linear-gradient(135deg, #4a9eff, #2e7dd1); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; flex-shrink: 0;">
                ${game.icon}
            </div>
            <div class="game-info">
                <h4>${game.name}</h4>
                <small>${game.type === 'vip' ? 'Loại VIP' : 'Loại Thường'}</small>
            </div>
            <span class="${game.type === 'vip' ? 'vip-badge' : 'normal-badge'}">${game.type === 'vip' ? 'VIP' : 'NORMAL'}</span>
        </div>
    `).join('');

    // Add click listeners
    document.querySelectorAll('.game-item').forEach(item => {
        item.addEventListener('click', function() {
            selectGame(this.dataset.game);
        });
    });
}

// Setup Event Listeners
function setupEventListeners() {
    const gameModal = document.getElementById('gameModal');
    const paymentModal = document.getElementById('paymentModal');
    const bankModal = document.getElementById('bankModal');
    const cardModal = document.getElementById('cardModal');

    // Game Modal
    document.querySelector('.btn-select-game').addEventListener('click', () => {
        gameModal.classList.add('active');
    });

    // Payment Modal
    document.querySelector('.btn-open-payment').addEventListener('click', () => {
        paymentModal.classList.add('active');
    });

    // Payment Method Selection
    document.querySelectorAll('.payment-method-item').forEach(item => {
        item.addEventListener('click', function() {
            const method = this.dataset.method;
            paymentModal.classList.remove('active');
            
            if (method === 'bank') {
                bankModal.classList.add('active');
                updateTransferContent();
            } else {
                cardModal.classList.add('active');
            }
        });
    });

    // Close Modals
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) this.classList.remove('active');
        });
    });

    // Bank Selection
    document.querySelectorAll('.bank-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.bank-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Provider Selection
    document.querySelectorAll('.provider-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.provider-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Copy Buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-copy')) {
            const input = e.target.previousElementSibling;
            if (input) {
                navigator.clipboard.writeText(input.value);
                showToast('✅ Đã sao chép!', 'success');
            }
        }
    });

    // Denomination Selection
    document.querySelectorAll('.denom-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.denom-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Buy Button
    document.getElementById('buyBtn').addEventListener('click', purchaseKey);

    // Card Submit
    document.querySelector('.btn-submit-card').addEventListener('click', submitCard);

    // Tab Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateKeysList(this.dataset.tab);
        });
    });
}

// Select Game
function selectGame(gameId) {
    state.selectedGame = gameId;
    state.selectedPackage = null;
    
    const game = games[gameId];
    document.getElementById('selectedGameName').textContent = game.name;
    document.getElementById('selectedGameType').textContent = game.type === 'vip' ? 'VIP' : 'Thường';
    
    updatePackageList();
    updateUI();
    
    document.getElementById('gameModal').classList.remove('active');
    showToast(`✅ Đã chọn: ${game.name}`, 'success');
}

// Update Package List
function updatePackageList() {
    const packageList = document.getElementById('packageList');
    
    if (!state.selectedGame) {
        packageList.innerHTML = '';
        return;
    }
    
    const game = games[state.selectedGame];
    packageList.innerHTML = game.packages.map(pkg => `
        <button class="package-btn" data-price="${pkg.price}" data-days="${pkg.days}">
            ${pkg.days}d<br><small>${pkg.price.toLocaleString()}đ</small>
        </button>
    `).join('');

    document.querySelectorAll('.package-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectPackage(this);
        });
    });
}

// Select Package
function selectPackage(btn) {
    state.selectedPackage = {
        days: parseInt(btn.dataset.days),
        price: parseInt(btn.dataset.price)
    };
    
    document.querySelectorAll('.package-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateUI();
}

// Purchase Key
function purchaseKey() {
    if (!state.selectedGame || !state.selectedPackage) {
        showToast('❌ Chọn game và gói!', 'error');
        return;
    }

    const game = games[state.selectedGame];
    const price = state.selectedPackage.price;

    if (state.accountBalance < price) {
        showToast('❌ Số dư không đủ!', 'error');
        return;
    }

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + state.selectedPackage.days);

    state.keys.push({
        id: `${state.selectedGame.toUpperCase()}-${Date.now()}`,
        game: game.name,
        type: game.type,
        package: `${state.selectedPackage.days}d`,
        price: price,
        purchaseDate: new Date().toLocaleDateString('vi-VN'),
        expireDate: expireDate.toLocaleDateString('vi-VN'),
        status: 'active'
    });

    state.accountBalance -= price;
    state.totalSpent += price;

    saveUserData();
    updateUI();
    showToast(`✅ Mua ${game.name} thành công!`, 'success');
    
    state.selectedGame = null;
    state.selectedPackage = null;
    updatePackageList();
    document.getElementById('selectedGameName').textContent = 'Chọn game';
    document.getElementById('selectedGameType').textContent = 'Chưa chọn';
}

// Submit Card
function submitCard() {
    const cardCode = document.getElementById('cardCode').value;
    const cardSerial = document.getElementById('cardSerial').value;
    const activeDenom = document.querySelector('.denom-btn.active');

    if (!cardCode || !cardSerial) {
        showToast('❌ Nhập mã thẻ và serial!', 'error');
        return;
    }

    if (!activeDenom) {
        showToast('❌ Chọn mệnh giá!', 'error');
        return;
    }

    const nominal = parseInt(activeDenom.dataset.amount);
    const actual = marketDiscounts[nominal] || nominal;

    state.accountBalance += actual;
    saveUserData();
    updateUI();

    const discount = ((nominal - actual) / nominal * 100).toFixed(0);
    showToast(`✅ Nạp ${nominal.toLocaleString()}đ → ${actual.toLocaleString()}đ (-${discount}%)`, 'success');
    
    document.getElementById('cardCode').value = '';
    document.getElementById('cardSerial').value = '';
    document.querySelectorAll('.denom-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('cardModal').classList.remove('active');
}

// Update Keys List
function updateKeysList(tab) {
    const keysList = document.getElementById('keysList');
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
             
