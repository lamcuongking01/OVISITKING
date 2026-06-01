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
    },
    'lien-quan-mobile': {
        name: 'Liên Quân Mobile',
        type: 'vip',
        icon: '5v5',
        packages: [
            { days: 30, price: 200000 }
        ]
    },
    'garena-rov': {
        name: 'Garena RoV',
        type: 'vip',
        icon: '⚔️',
        packages: [
            { days: 30, price: 200000 }
        ]
    },
    'wild-rift': {
        name: 'Wild Rift',
        type: 'normal',
        icon: '🎮',
        packages: [
            { days: 30, price: 150000 }
        ]
    },
    'lmht-toc-chien': {
        name: 'LMHT: Tốc Chiến',
        type: 'normal',
        icon: '🏆',
        packages: [
            { days: 30, price: 150000 }
        ]
    },
    'gunny-origin': {
        name: 'Gunny Origin',
        type: 'normal',
        icon: '🎯',
        packages: [
            { days: 30, price: 100000 }
        ]
    },
    'sniper-3d': {
        name: 'Sniper 3D',
        type: 'normal',
        icon: '🎲',
        packages: [
            { days: 30, price: 80000 }
        ]
    }
};

// Market Discount Rates (5%)
const marketDiscounts = {
    20000: 19000,    // 5% discount
    50000: 47500,    // 5% discount
    100000: 95000,   // 5% discount
    200000: 190000   // 5% discount
};

// Current state
let state = {
    selectedGame: null,
    selectedPackage: null,
    accountBalance: 0,
    totalSpent: 0,
    keys: [],
    currentPaymentMethod: null,
    selectedBank: 'vietqr',
    selectedProvider: 'viettel',
    userId: Math.random().toString(36).substring(2, 10).toUpperCase()
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    loadUserData();
    setupEventListeners();
    updateUI();
    console.log('Initialization complete');
});

// Setup Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Game Selection - Click on game items in modal
    const gameModal = document.getElementById('gameModal');
    
    if (gameModal) {
        gameModal.addEventListener('click', function(e) {
            const gameItem = e.target.closest('.game-item');
            if (gameItem) {
                console.log('Game item clicked:', gameItem.dataset.game);
                selectGame(gameItem);
            }
        });
    }

    // Select game button
    const selectGameBtn = document.querySelector('.btn-select-game');
    if (selectGameBtn) {
        selectGameBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Select game button clicked');
            gameModal.classList.add('active');
        });
    }

    // Package Selection
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('package-btn')) {
            console.log('Package button clicked:', e.target.dataset.days);
            selectPackage(e.target);
        }
    });

    const bankModal = document.getElementById('bankModal');
    const cardModal = document.getElementById('cardModal');

    // Select payment buttons
    document.querySelectorAll('.btn-select-payment').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const method = this.closest('.payment-method-card').dataset.method;
            console.log('Payment method selected:', method);
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
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.closest('.modal').classList.remove('active');
        });
    });

    // Modal Background Click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });

    // Payment Methods
    document.querySelectorAll('.bank-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.bank-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            state.selectedBank = this.dataset.bank;
        });

        const radio = option.querySelector('input[type="radio"]');
        if (radio) {
            radio.addEventListener('change', function(e) {
                e.stopPropagation();
                document.querySelectorAll('.bank-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        }
    });

    document.querySelectorAll('.provider-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.provider-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            state.selectedProvider = this.dataset.provider;
        });

        const radio = option.querySelector('input[type="radio"]');
        if (radio) {
            radio.addEventListener('change', function(e) {
                e.stopPropagation();
                document.querySelectorAll('.provider-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        }
    });

    // Copy Buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-copy')) {
            e.preventDefault();
            e.stopPropagation();
            const input = e.target.previousElementSibling;
            if (input && input.value) {
                navigator.clipboard.writeText(input.value).then(() => {
                    showToast('Đã sao chép!', 'success');
                });
            }
        }
    });

    // Denomination Selection
    document.querySelectorAll('.denom-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.denom-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Buy Button
    const buyBtn = document.getElementById('buyBtn');
    if (buyBtn) {
        buyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            purchaseKey();
        });
    }

    // Card Submit
    const submitCardBtn = document.querySelector('.btn-submit-card');
    if (submitCardBtn) {
        submitCardBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            submitCard();
        });
    }

    // Tab Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tab = this.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateKeysList(tab);
        });
    });

    console.log('Event listeners setup complete');
}

// Game Selection
function selectGame(gameElement) {
    const gameId = gameElement.dataset.game;
    
    console.log('Selecting game:', gameId);
    
    state.selectedGame = gameId;
    state.selectedPackage = null;
    
    document.getElementById('gameModal').classList.remove('active');
    updatePackageList();
    updateGameDisplay();
    updateUI();
    
    showToast(`Đã chọn: ${games[gameId].name}`, 'success');
}

// Update Game Display
function updateGameDisplay() {
    if (!state.selectedGame) {
        const subsectionContent = document.querySelector('.subsection-content');
        subsectionContent.innerHTML = `
            <h3>Nhân chọn game</h3>
            <p>Chưa chọn game</p>
            <button class="btn-select-game">Chọn game →</button>
        `;
        return;
    }
    
    const game = games[state.selectedGame];
    const subsection = document.querySelector('.subsection');
    const subsectionContent = subsection.querySelector('.subsection-content');
    
    subsectionContent.innerHTML = `
        <h3>${game.icon} ${game.name}</h3>
        <p>${game.type === 'vip' ? 'VIP' : 'Thường'}</p>
    `;
}

// Update Package List
function updatePackageList() {
    if (!state.selectedGame) {
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
             
