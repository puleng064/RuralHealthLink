// Global state management
let currentUser = null;
let currentPage = 'home';
let isDarkMode = false;
let authToken = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check for stored auth token
    authToken = localStorage.getItem('authToken');
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    // Check for stored theme preference
    isDarkMode = localStorage.getItem('theme') === 'dark';
    updateTheme();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial page
    navigateTo('home');
    updateAuthButtons();
}

function setupEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Mobile menu toggle
    document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    updateTheme();
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

function updateTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('#theme-toggle i');
    
    if (isDarkMode) {
        body.classList.add('dark');
        themeIcon.className = 'fas fa-sun text-yellow-400';
    } else {
        body.classList.remove('dark');
        themeIcon.className = 'fas fa-moon text-gray-600';
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}

function updateAuthButtons() {
    const authButtons = document.getElementById('auth-buttons');
    
    if (currentUser) {
        const dashboardPath = currentUser.isAdmin ? 'admin-dashboard' : 'user-dashboard';
        authButtons.innerHTML = `
            <button onclick="navigateTo('${dashboardPath}')" class="text-gray-700 hover:text-medical-blue transition-colors px-3 py-2 rounded-md">Dashboard</button>
            <button onclick="logout()" class="text-gray-700 hover:text-medical-blue transition-colors px-3 py-2 rounded-md">Logout</button>
        `;
    } else {
        authButtons.innerHTML = `
            <button onclick="navigateTo('login')" class="text-gray-700 hover:text-medical-blue transition-colors px-3 py-2 rounded-md">Login</button>
        `;
    }
}

function navigateTo(page) {
    currentPage = page;
    
    // Close mobile menu if open
    document.getElementById('mobile-menu').classList.add('hidden');
    
    // Load page content
    loadPageContent(page);
}

function loadPageContent(page) {
    const mainContent = document.getElementById('main-content');
    
    switch(page) {
        case 'home':
            mainContent.innerHTML = getHomePageHTML();
            break;
        case 'about':
            mainContent.innerHTML = getAboutPageHTML();
            break;
        case 'contact':
            mainContent.innerHTML = getContactPageHTML();
            setupContactForm();
            break;
        case 'login':
            mainContent.innerHTML = getLoginPageHTML();
            setupLoginForm();
            break;
        case 'register':
            mainContent.innerHTML = getRegisterPageHTML();
            setupRegisterForm();
            break;
        case 'admin-login':
            mainContent.innerHTML = getAdminLoginPageHTML();
            setupAdminLoginForm();
            break;
        case 'user-dashboard':
            if (!currentUser || currentUser.isAdmin) {
                navigateTo('login');
                return;
            }
            mainContent.innerHTML = getUserDashboardHTML();
            setupUserDashboard();
            break;
        case 'admin-dashboard':
            if (!currentUser || !currentUser.isAdmin) {
                navigateTo('login');
                return;
            }
            mainContent.innerHTML = getAdminDashboardHTML();
            setupAdminDashboard();
            break;
        default:
            mainContent.innerHTML = getNotFoundHTML();
    }
}

// Authentication functions
async function login(username, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            authToken = data.access_token;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('authToken', authToken);
            updateAuthButtons();
            
            showToast('Welcome back!', 'success');
            
            if (currentUser.isAdmin) {
                navigateTo('admin-dashboard');
            } else {
                navigateTo('user-dashboard');
            }
            
            return true;
        } else {
            showToast(data.message || 'Login failed', 'error');
            return false;
        }
    } catch (error) {
        showToast('Login failed. Please try again.', 'error');
        return false;
    }
}

async function register(userData) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            authToken = data.access_token;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('authToken', authToken);
            updateAuthButtons();
            
            showToast('Account created successfully!', 'success');
            navigateTo('user-dashboard');
            
            return true;
        } else {
            showToast(data.message || 'Registration failed', 'error');
            return false;
        }
    } catch (error) {
        showToast('Registration failed. Please try again.', 'error');
        return false;
    }
}

function logout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    updateAuthButtons();
    showToast('Logged out successfully', 'success');
    navigateTo('home');
}

// API helper function
async function apiRequest(method, url, data = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const options = {
        method,
        headers,
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    if (response.status === 401) {
        // Token expired, logout user
        logout();
        throw new Error('Authentication expired');
    }
    
    return response;
}

// Toast notification system
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-red-500' : 
                   type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
    
    toast.className = `${bgColor} text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

// Page HTML generators
function getHomePageHTML() {
    return `
        <div class="min-h-screen">
            <!-- Hero Section -->
            <section class="bg-gradient-to-br from-blue-500 to-blue-700 text-white py-20">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center">
                        <h1 class="text-4xl md:text-6xl font-bold mb-6">
                            Rural Health Tracker & Clinic Link
                        </h1>
                        <p class="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            Empowering rural communities with offline-first health tracking and seamless clinic connectivity
                        </p>
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onclick="navigateTo('register')" class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                                Get Started
                            </button>
                            <button onclick="navigateTo('about')" class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Features Section -->
            <section class="py-16 bg-white">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center mb-12">
                        <h2 class="text-3xl font-bold mb-4">Key Features</h2>
                        <p class="text-gray-600 text-lg">
                            Comprehensive health management designed for rural healthcare needs
                        </p>
                    </div>

                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div class="bg-gray-50 p-6 rounded-lg">
                            <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                                <i class="fas fa-wifi text-white"></i>
                            </div>
                            <h3 class="text-xl font-semibold mb-3">Offline Functionality</h3>
                            <p class="text-gray-600">Track symptoms and manage appointments even without internet connection</p>
                        </div>

                        <div class="bg-gray-50 p-6 rounded-lg">
                            <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                                <i class="fas fa-calendar text-white"></i>
                            </div>
                            <h3 class="text-xl font-semibold mb-3">Appointment Management</h3>
                            <p class="text-gray-600">Schedule and manage appointments with local clinics seamlessly</p>
                        </div>

                        <div class="bg-gray-50 p-6 rounded-lg">
                            <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
                                <i class="fas fa-chart-line text-white"></i>
                            </div>
                            <h3 class="text-xl font-semibold mb-3">Symptom Tracking</h3>
                            <p class="text-gray-600">Monitor your health symptoms with detailed logging and analytics</p>
                        </div>

                        <div class="bg-gray-50 p-6 rounded-lg">
                            <div class="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                                <i class="fas fa-sync text-white"></i>
                            </div>
                            <h3 class="text-xl font-semibold mb-3">Data Synchronization</h3>
                            <p class="text-gray-600">Automatically sync with local clinics when connection is available</p>
                        </div>

                        <div class="bg-gray-50 p-6 rounded-lg">
                            <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                                <i class="fas fa-shield-alt text-white"></i>
                            </div>
                            <h3 class="text-xl font-semibold mb-3">Secure & Private</h3>
                            <p class="text-gray-600">Your health data is encrypted and stored securely</p>
                        </div>

                        <div class="bg-gray-50 p-6 rounded-lg">
                            <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                                <i class="fas fa-mobile-alt text-white"></i>
                            </div>
                            <h3 class="text-xl font-semibold mb-3">Mobile Friendly</h3>
                            <p class="text-gray-600">Responsive design works perfectly on all devices</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;
}

function getAboutPageHTML() {
    return `
        <div class="min-h-screen py-16">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold mb-6">About Rural Health Tracker</h1>
                    <p class="text-xl text-gray-600">
                        Bridging the healthcare gap in rural communities
                    </p>
                </div>

                <div class="bg-white p-8 rounded-lg shadow-lg mb-8">
                    <h2 class="text-2xl font-semibold mb-4">Our Mission</h2>
                    <p class="text-gray-600 mb-6">
                        Rural Health Tracker & Clinic Link is designed to address the unique healthcare challenges faced by rural communities. We understand that reliable internet connectivity and access to healthcare facilities can be limited in rural areas.
                    </p>

                    <h2 class="text-2xl font-semibold mb-4">What We Offer</h2>
                    <ul class="space-y-3 text-gray-600 mb-6">
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <span>Offline-first health symptom tracking that works without internet</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <span>Seamless appointment scheduling with local healthcare providers</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <span>Automatic data synchronization when connectivity is restored</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <span>Secure, HIPAA-compliant data storage and transmission</span>
                        </li>
                    </ul>

                    <h2 class="text-2xl font-semibold mb-4">Technology Stack</h2>
                    <div class="grid md:grid-cols-3 gap-4">
                        <div class="bg-gray-50 p-4 rounded-lg text-center">
                            <i class="fab fa-python text-3xl text-blue-500 mb-2"></i>
                            <p class="font-medium">Python Backend</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg text-center">
                            <i class="fab fa-react text-3xl text-cyan-500 mb-2"></i>
                            <p class="font-medium">React Frontend</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg text-center">
                            <i class="fas fa-database text-3xl text-orange-500 mb-2"></i>
                            <p class="font-medium">PostgreSQL Database</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getContactPageHTML() {
    return `
        <div class="min-h-screen py-16">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold mb-6">Contact Us</h1>
                    <p class="text-xl text-gray-600">Get in touch with our team</p>
                </div>

                <div class="grid lg:grid-cols-2 gap-8">
                    <!-- Contact Information -->
                    <div class="bg-white p-8 rounded-lg shadow-lg">
                        <h2 class="text-2xl font-semibold mb-6">Contact Information</h2>

                        <div class="space-y-4">
                            <div class="flex items-center">
                                <i class="fas fa-phone text-blue-500 mr-3"></i>
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-envelope text-blue-500 mr-3"></i>
                                <span>support@ruralhealthtracker.com</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-map-marker-alt text-blue-500 mr-3"></i>
                                <span>123 Healthcare Ave, Rural City, RC 12345</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-clock text-blue-500 mr-3"></i>
                                <span>Mon-Fri: 8AM-6PM, Sat: 9AM-4PM</span>
                            </div>
                        </div>

                        <div class="mt-8">
                            <h3 class="text-lg font-semibold mb-4">Emergency Support</h3>
                            <p class="text-gray-600 mb-3">
                                For urgent technical issues affecting patient care:
                            </p>
                            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div class="flex items-center">
                                    <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                                    <span class="font-semibold text-red-600">
                                        Emergency Hotline: +1 (555) 911-HELP
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Contact Form -->
                    <div class="bg-white p-8 rounded-lg shadow-lg">
                        <h2 class="text-2xl font-semibold mb-6">Send us a Message</h2>

                        <form id="contact-form" class="space-y-6">
                            <div>
                                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input type="text" id="name" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>

                            <div>
                                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input type="email" id="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>

                            <div>
                                <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <select id="subject" name="subject" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Technical Support">Technical Support</option>
                                    <option value="Account Issues">Account Issues</option>
                                    <option value="Feature Request">Feature Request</option>
                                    <option value="Partnership Inquiry">Partnership Inquiry</option>
                                </select>
                            </div>

                            <div>
                                <label for="message" class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea id="message" name="message" rows="5" required placeholder="Tell us how we can help you..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>

                            <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                                <i class="fas fa-paper-plane mr-2"></i>
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            try {
                const response = await fetch('/api/contacts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    showToast('Message sent successfully!', 'success');
                    contactForm.reset();
                } else {
                    showToast('Failed to send message. Please try again.', 'error');
                }
            } catch (error) {
                showToast('Failed to send message. Please try again.', 'error');
            }
        });
    }
}

function getLoginPageHTML() {
    return `
        <div class="min-h-screen py-16 flex items-center justify-center">
            <div class="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div class="bg-white p-8 rounded-lg shadow-lg">
                    <div class="text-center mb-8">
                        <i class="fas fa-heart text-blue-500 text-4xl mb-4"></i>
                        <h1 class="text-3xl font-bold mb-2">Welcome Back</h1>
                        <p class="text-gray-600">Sign in to your account</p>
                    </div>

                    <form id="login-form" class="space-y-6">
                        <div>
                            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">Email or Username</label>
                            <input type="text" id="username" name="username" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div class="relative">
                                <input type="password" id="password" name="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
                                <button type="button" onclick="togglePasswordVisibility('password')" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <input type="checkbox" id="remember" class="mr-2">
                                <label for="remember" class="text-sm text-gray-600">Remember me</label>
                            </div>
                            <button type="button" class="text-sm text-blue-500 hover:text-blue-600">Forgot password?</button>
                        </div>

                        <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                            Sign In
                        </button>

                        <div class="text-center">
                            <span class="text-gray-600">Don't have an account? </span>
                            <button type="button" onclick="navigateTo('register')" class="text-blue-500 hover:text-blue-600">Sign up</button>
                        </div>

                        <div class="mt-6 pt-6 border-t border-gray-200">
                            <button type="button" onclick="navigateTo('admin-login')" class="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                                <i class="fas fa-shield-alt mr-2"></i>
                                Admin Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const username = formData.get('username');
            const password = formData.get('password');
            
            await login(username, password);
        });
    }
}

function getRegisterPageHTML() {
    return `
        <div class="min-h-screen py-16">
            <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="bg-white p-8 rounded-lg shadow-lg">
                    <div class="text-center mb-8">
                        <i class="fas fa-user-plus text-blue-500 text-4xl mb-4"></i>
                        <h1 class="text-3xl font-bold mb-2">Create Your Account</h1>
                        <p class="text-gray-600">Join Rural Health Tracker today</p>
                    </div>

                    <form id="register-form" class="space-y-6">
                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <input type="text" id="firstName" name="firstName" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <input type="text" id="lastName" name="lastName" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>

                        <div>
                            <label for="reg-username" class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input type="text" id="reg-username" name="username" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <div>
                            <label for="reg-email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input type="email" id="reg-email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label for="gender" class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                <select id="gender" name="gender" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>
                            <div>
                                <label for="dateOfBirth" class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                <input type="date" id="dateOfBirth" name="dateOfBirth" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>

                        <div>
                            <label for="reg-password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div class="relative">
                                <input type="password" id="reg-password" name="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
                                <button type="button" onclick="togglePasswordVisibility('reg-password')" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <div class="relative">
                                <input type="password" id="confirmPassword" name="confirmPassword" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
                                <button type="button" onclick="togglePasswordVisibility('confirmPassword')" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        <div class="flex items-start space-x-2">
                            <input type="checkbox" id="terms" required class="mt-1">
                            <label for="terms" class="text-sm text-gray-600">
                                I agree to the <button type="button" class="text-blue-500 hover:text-blue-600">Terms of Service</button> and <button type="button" class="text-blue-500 hover:text-blue-600">Privacy Policy</button>
                            </label>
                        </div>

                        <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                            Create Account
                        </button>

                        <div class="text-center">
                            <span class="text-gray-600">Already have an account? </span>
                            <button type="button" onclick="navigateTo('login')" class="text-blue-500 hover:text-blue-600">Sign in</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            const userData = {
                username: formData.get('username'),
                email: formData.get('email'),
                password: password,
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                gender: formData.get('gender'),
                dateOfBirth: formData.get('dateOfBirth')
            };
            
            await register(userData);
        });
    }
}

function getAdminLoginPageHTML() {
    return `
        <div class="min-h-screen py-16 flex items-center justify-center">
            <div class="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div class="bg-white p-8 rounded-lg shadow-lg">
                    <div class="text-center mb-8">
                        <i class="fas fa-shield-alt text-gray-600 text-4xl mb-4"></i>
                        <h1 class="text-3xl font-bold mb-2">Admin Login</h1>
                        <p class="text-gray-600">Administrative access only</p>
                    </div>

                    <form id="admin-login-form" class="space-y-6">
                        <div>
                            <label for="admin-username" class="block text-sm font-medium text-gray-700 mb-2">Admin Username</label>
                            <input type="text" id="admin-username" name="username" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <div>
                            <label for="admin-password" class="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
                            <input type="password" id="admin-password" name="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <button type="submit" class="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                            <i class="fas fa-shield-alt mr-2"></i>
                            Admin Sign In
                        </button>

                        <div class="text-center">
                            <button type="button" onclick="navigateTo('login')" class="text-gray-600 hover:text-gray-800">
                                <i class="fas fa-arrow-left mr-2"></i>
                                Back to User Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function setupAdminLoginForm() {
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(adminLoginForm);
            const username = formData.get('username');
            const password = formData.get('password');
            
            const success = await login(username, password);
            if (success && currentUser && currentUser.isAdmin) {
                showToast('Admin access granted', 'success');
            } else if (success) {
                showToast('Access denied - Admin privileges required', 'error');
                logout();
            }
        });
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function getUserDashboardHTML() {
    return `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="bg-white border-b border-gray-200">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between h-16">
                        <div class="flex items-center space-x-4">
                            <span class="text-lg font-semibold">User Dashboard</span>
                            <span class="text-sm text-gray-500">@${currentUser.username}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Dashboard Stats -->
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-calendar text-blue-500"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-gray-600">Upcoming Appointments</p>
                                <p class="text-2xl font-bold" id="upcoming-appointments">0</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-chart-line text-green-500"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-gray-600">Symptom Entries</p>
                                <p class="text-2xl font-bold" id="symptom-entries">0</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-sync text-yellow-500"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-gray-600">Last Sync</p>
                                <p class="text-sm font-medium">Just now</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-wifi text-green-500"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-gray-600">Connection Status</p>
                                <p class="text-sm font-medium text-green-500">Online</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions and Recent Activity -->
                <div class="grid lg:grid-cols-2 gap-8 mb-8">
                    <!-- Quick Actions -->
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h2 class="text-xl font-semibold mb-6">Quick Actions</h2>
                        <div class="grid grid-cols-2 gap-4">
                            <button onclick="showSection('appointments')" class="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors flex flex-col items-center space-y-2">
                                <i class="fas fa-calendar-plus text-2xl"></i>
                                <span class="text-sm font-medium">Book Appointment</span>
                            </button>
                            <button onclick="showSection('symptoms')" class="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors flex flex-col items-center space-y-2">
                                <i class="fas fa-plus text-2xl"></i>
                                <span class="text-sm font-medium">Log Symptoms</span>
                            </button>
                            <button onclick="showSection('history')" class="bg-yellow-500 text-white p-4 rounded-lg hover:bg-yellow-600 transition-colors flex flex-col items-center space-y-2">
                                <i class="fas fa-history text-2xl"></i>
                                <span class="text-sm font-medium">View History</span>
                            </button>
                            <button onclick="showSection('profile')" class="border-2 border-gray-300 text-gray-700 p-4 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center space-y-2">
                                <i class="fas fa-user-cog text-2xl"></i>
                                <span class="text-sm font-medium">Profile</span>
                            </button>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h2 class="text-xl font-semibold mb-6">Recent Activity</h2>
                        <div id="recent-activity" class="space-y-4">
                            <!-- Activity items will be loaded here -->
                        </div>
                    </div>
                </div>

                <!-- Dynamic Sections -->
                <div id="dynamic-sections">
                    <!-- Content sections will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

function setupUserDashboard() {
    loadDashboardData();
}

async function loadDashboardData() {
    try {
        // Load appointments
        const appointmentsResponse = await apiRequest('GET', '/api/appointments');
        const appointments = await appointmentsResponse.json();
        
        // Load symptoms
        const symptomsResponse = await apiRequest('GET', '/api/symptoms');
        const symptoms = await symptomsResponse.json();
        
        // Update dashboard stats
        const upcomingAppointments = appointments.filter(apt => new Date(apt.date) >= new Date()).length;
        document.getElementById('upcoming-appointments').textContent = upcomingAppointments;
        document.getElementById('symptom-entries').textContent = symptoms.length;
        
        // Update recent activity
        const recentActivity = document.getElementById('recent-activity');
        let activityHTML = '';
        
        appointments.slice(0, 3).forEach(appointment => {
            activityHTML += `
                <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                    <i class="fas fa-calendar text-blue-500 mr-3"></i>
                    <div>
                        <p class="font-medium text-sm">Appointment with ${appointment.provider}</p>
                        <p class="text-xs text-gray-600">${formatDate(appointment.date)} at ${appointment.time}</p>
                    </div>
                </div>
            `;
        });
        
        symptoms.slice(0, 2).forEach(symptom => {
            activityHTML += `
                <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                    <i class="fas fa-thermometer-half text-green-500 mr-3"></i>
                    <div>
                        <p class="font-medium text-sm">Symptom logged: ${symptom.description}</p>
                        <p class="text-xs text-gray-600">${formatDate(symptom.dateTime)}</p>
                    </div>
                </div>
            `;
        });
        
        if (activityHTML === '') {
            activityHTML = '<p class="text-gray-500 text-sm">No recent activity</p>';
        }
        
        recentActivity.innerHTML = activityHTML;
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function showSection(sectionName) {
    const dynamicSections = document.getElementById('dynamic-sections');
    
    switch(sectionName) {
        case 'appointments':
            dynamicSections.innerHTML = getAppointmentSectionHTML();
            setupAppointmentForm();
            loadAppointments();
            break;
        case 'symptoms':
            dynamicSections.innerHTML = getSymptomSectionHTML();
            setupSymptomForm();
            loadSymptoms();
            break;
        case 'history':
            dynamicSections.innerHTML = getHistorySectionHTML();
            loadHistory();
            break;
        case 'profile':
            dynamicSections.innerHTML = getProfileSectionHTML();
            break;
    }
}

function getAppointmentSectionHTML() {
    return `
        <div class="space-y-8">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold">Appointments</h2>
                <button onclick="showSection('')" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                    Back to Overview
                </button>
            </div>

            <!-- Book New Appointment -->
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-4">Book New Appointment</h3>
                <form id="appointment-form" class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label for="apt-date" class="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                        <input type="date" id="apt-date" name="date" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>

                    <div>
                        <label for="apt-time" class="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                        <select id="apt-time" name="time" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select time</option>
                            <option value="09:00">9:00 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="14:00">2:00 PM</option>
                            <option value="15:00">3:00 PM</option>
                            <option value="16:00">4:00 PM</option>
                        </select>
                    </div>

                    <div>
                        <label for="apt-provider" class="block text-sm font-medium text-gray-700 mb-2">Healthcare Provider</label>
                        <select id="apt-provider" name="provider" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select provider</option>
                            <option value="Dr. Sarah Smith - General Practice">Dr. Sarah Smith - General Practice</option>
                            <option value="Dr. Michael Johnson - Cardiology">Dr. Michael Johnson - Cardiology</option>
                            <option value="Dr. Emily Davis - Pediatrics">Dr. Emily Davis - Pediatrics</option>
                        </select>
                    </div>

                    <div>
                        <label for="apt-type" class="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                        <select id="apt-type" name="type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select type</option>
                            <option value="Consultation">Consultation</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Emergency">Emergency</option>
                            <option value="Routine Check-up">Routine Check-up</option>
                        </select>
                    </div>

                    <div class="md:col-span-2">
                        <label for="apt-reason" class="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                        <textarea id="apt-reason" name="reason" rows="3" required placeholder="Please describe the reason for your appointment..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>

                    <div class="md:col-span-2">
                        <button type="submit" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            <i class="fas fa-calendar-plus mr-2"></i>
                            Book Appointment
                        </button>
                    </div>
                </form>
            </div>

            <!-- Appointments List -->
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-4">Your Appointments</h3>
                <div id="appointments-list">
                    <!-- Appointments will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

function setupAppointmentForm() {
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(appointmentForm);
            const appointmentData = {
                date: formData.get('date'),
                time: formData.get('time'),
                provider: formData.get('provider'),
                type: formData.get('type'),
                reason: formData.get('reason')
            };
            
            try {
                const response = await apiRequest('POST', '/api/appointments', appointmentData);
                
                if (response.ok) {
                    showToast('Appointment booked successfully!', 'success');
                    appointmentForm.reset();
                    loadAppointments();
                    loadDashboardData(); // Refresh dashboard stats
                } else {
                    showToast('Failed to book appointment', 'error');
                }
            } catch (error) {
                showToast('Failed to book appointment', 'error');
            }
        });
    }
}

async function loadAppointments() {
    try {
        const response = await apiRequest('GET', '/api/appointments');
        const appointments = await response.json();
        
        const appointmentsList = document.getElementById('appointments-list');
        if (!appointmentsList) return;
        
        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<p class="text-gray-500">No appointments scheduled</p>';
            return;
        }
        
        let appointmentsHTML = '';
        appointments.forEach(appointment => {
            const statusColor = appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' : 
                               appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                               'bg-yellow-100 text-yellow-800';
            
            appointmentsHTML += `
                <div class="border border-gray-200 rounded-lg p-4 mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-semibold">${appointment.provider}</h4>
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">${appointment.status}</span>
                    </div>
                    <p class="text-gray-600 mb-2">${appointment.type} - ${formatDate(appointment.date)} at ${appointment.time}</p>
                    <p class="text-gray-700 mb-3">${appointment.reason}</p>
                    <div class="flex space-x-2">
                        <button onclick="deleteAppointment(${appointment.id})" class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                            <i class="fas fa-trash mr-1"></i>Cancel
                        </button>
                    </div>
                </div>
            `;
        });
        
        appointmentsList.innerHTML = appointmentsHTML;
        
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

async function deleteAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }
    
    try {
        const response = await apiRequest('DELETE', `/api/appointments/${appointmentId}`);
        
        if (response.ok) {
            showToast('Appointment cancelled successfully', 'success');
            loadAppointments();
            loadDashboardData(); // Refresh dashboard stats
        } else {
            showToast('Failed to cancel appointment', 'error');
        }
    } catch (error) {
        showToast('Failed to cancel appointment', 'error');
    }
}

function getSymptomSectionHTML() {
    return `
        <div class="space-y-8">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold">Symptom Tracking</h2>
                <button onclick="showSection('')" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                    Back to Overview
                </button>
            </div>

            <!-- Log New Symptom -->
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-4">Log New Symptom</h3>
                <form id="symptom-form" class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label for="symptom-datetime" class="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                        <input type="datetime-local" id="symptom-datetime" name="dateTime" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>

                    <div>
                        <label for="symptom-category" class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select id="symptom-category" name="category" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select category</option>
                            <option value="Pain">Pain</option>
                            <option value="Respiratory">Respiratory</option>
                            <option value="Digestive">Digestive</option>
                            <option value="Neurological">Neurological</option>
                            <option value="Cardiovascular">Cardiovascular</option>
                            <option value="Skin">Skin</option>
                            <option value="Mental Health">Mental Health</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label for="symptom-severity" class="block text-sm font-medium text-gray-700 mb-2">Severity (1-3)</label>
                        <select id="symptom-severity" name="severity" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select severity</option>
                            <option value="1">1 - Mild</option>
                            <option value="2">2 - Moderate</option>
                            <option value="3">3 - Severe</option>
                        </select>
                    </div>

                    <div>
                        <label for="symptom-description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input type="text" id="symptom-description" name="description" required placeholder="Brief description of the symptom" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>

                    <div class="md:col-span-2">
                        <label for="symptom-notes" class="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                        <textarea id="symptom-notes" name="notes" rows="3" placeholder="Any additional information about the symptom..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>

                    <div class="md:col-span-2">
                        <button type="submit" class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
                            <i class="fas fa-plus mr-2"></i>
                            Log Symptom
                        </button>
                    </div>
                </form>
            </div>

            <!-- Symptoms List -->
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-4">Your Symptoms</h3>
                <div id="symptoms-list">
                    <!-- Symptoms will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

function setupSymptomForm() {
    const symptomForm = document.getElementById('symptom-form');
    if (symptomForm) {
        // Set current date and time as default
        const now = new Date();
        const datetime = now.toISOString().slice(0, 16);
        document.getElementById('symptom-datetime').value = datetime;
        
        symptomForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(symptomForm);
            const symptomData = {
                dateTime: formData.get('dateTime'),
                category: formData.get('category'),
                description: formData.get('description'),
                severity: parseInt(formData.get('severity')),
                notes: formData.get('notes') || null
            };
            
            try {
                const response = await apiRequest('POST', '/api/symptoms', symptomData);
                
                if (response.ok) {
                    showToast('Symptom logged successfully!', 'success');
                    symptomForm.reset();
                    // Reset datetime to current
                    document.getElementById('symptom-datetime').value = datetime;
                    loadSymptoms();
                    loadDashboardData(); // Refresh dashboard stats
                } else {
                    showToast('Failed to log symptom', 'error');
                }
            } catch (error) {
                showToast('Failed to log symptom', 'error');
            }
        });
    }
}

async function loadSymptoms() {
    try {
        const response = await apiRequest('GET', '/api/symptoms');
        const symptoms = await response.json();
        
        const symptomsList = document.getElementById('symptoms-list');
        if (!symptomsList) return;
        
        if (symptoms.length === 0) {
            symptomsList.innerHTML = '<p class="text-gray-500">No symptoms logged</p>';
            return;
        }
        
        let symptomsHTML = '';
        symptoms.forEach(symptom => {
            const severityColor = symptom.severity === 1 ? 'bg-green-100 text-green-800' : 
                                 symptom.severity === 2 ? 'bg-yellow-100 text-yellow-800' : 
                                 'bg-red-100 text-red-800';
            
            const severityLabel = symptom.severity === 1 ? 'Mild' : 
                                 symptom.severity === 2 ? 'Moderate' : 'Severe';
            
            symptomsHTML += `
                <div class="border border-gray-200 rounded-lg p-4 mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-semibold">${symptom.description}</h4>
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${severityColor}">${severityLabel}</span>
                    </div>
                    <p class="text-gray-600 mb-2">${symptom.category} - ${formatDateTime(symptom.dateTime)}</p>
                    ${symptom.notes ? `<p class="text-gray-700 mb-3">${symptom.notes}</p>` : ''}
                    <div class="flex space-x-2">
                        <button onclick="deleteSymptom(${symptom.id})" class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                            <i class="fas fa-trash mr-1"></i>Delete
                        </button>
                    </div>
                </div>
            `;
        });
        
        symptomsList.innerHTML = symptomsHTML;
        
    } catch (error) {
        console.error('Error loading symptoms:', error);
    }
}

async function deleteSymptom(symptomId) {
    if (!confirm('Are you sure you want to delete this symptom?')) {
        return;
    }
    
    try {
        const response = await apiRequest('DELETE', `/api/symptoms/${symptomId}`);
        
        if (response.ok) {
            showToast('Symptom deleted successfully', 'success');
            loadSymptoms();
            loadDashboardData(); // Refresh dashboard stats
        } else {
            showToast('Failed to delete symptom', 'error');
        }
    } catch (error) {
        showToast('Failed to delete symptom', 'error');
    }
}

function getHistorySectionHTML() {
    return `
        <div class="space-y-8">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold">Health History</h2>
                <button onclick="showSection('')" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                    Back to Overview
                </button>
            </div>

            <div class="grid lg:grid-cols-2 gap-8">
                <!-- Appointments History -->
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-4">Appointment History</h3>
                    <div id="appointments-history">
                        <!-- History will be loaded here -->
                    </div>
                </div>

                <!-- Symptoms History -->
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-4">Symptoms History</h3>
                    <div id="symptoms-history">
                        <!-- History will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadHistory() {
    try {
        const [appointmentsResponse, symptomsResponse] = await Promise.all([
            apiRequest('GET', '/api/appointments'),
            apiRequest('GET', '/api/symptoms')
        ]);
        
        const appointments = await appointmentsResponse.json();
        const symptoms = await symptomsResponse.json();
        
        // Load appointments history
        const appointmentsHistory = document.getElementById('appointments-history');
        if (appointmentsHistory) {
            if (appointments.length === 0) {
                appointmentsHistory.innerHTML = '<p class="text-gray-500">No appointment history</p>';
            } else {
                let appointmentsHTML = '';
                appointments.forEach(appointment => {
                    appointmentsHTML += `
                        <div class="border-l-4 border-blue-500 pl-4 mb-4">
                            <h4 class="font-medium">${appointment.provider}</h4>
                            <p class="text-sm text-gray-600">${formatDate(appointment.date)} at ${appointment.time}</p>
                            <p class="text-sm text-gray-700">${appointment.reason}</p>
                        </div>
                    `;
                });
                appointmentsHistory.innerHTML = appointmentsHTML;
            }
        }
        
        // Load symptoms history
        const symptomsHistory = document.getElementById('symptoms-history');
        if (symptomsHistory) {
            if (symptoms.length === 0) {
                symptomsHistory.innerHTML = '<p class="text-gray-500">No symptom history</p>';
            } else {
                let symptomsHTML = '';
                symptoms.forEach(symptom => {
                    const severityColor = symptom.severity === 1 ? 'border-green-500' : 
                                         symptom.severity === 2 ? 'border-yellow-500' : 'border-red-500';
                    
                    symptomsHTML += `
                        <div class="border-l-4 ${severityColor} pl-4 mb-4">
                            <h4 class="font-medium">${symptom.description}</h4>
                            <p class="text-sm text-gray-600">${symptom.category} - ${formatDateTime(symptom.dateTime)}</p>
                            ${symptom.notes ? `<p class="text-sm text-gray-700">${symptom.notes}</p>` : ''}
                        </div>
                    `;
                });
                symptomsHistory.innerHTML = symptomsHTML;
            }
        }
        
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

function getProfileSectionHTML() {
    return `
        <div class="space-y-8">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold">Profile</h2>
                <button onclick="showSection('')" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                    Back to Overview
                </button>
            </div>

            <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex items-center space-x-4 mb-6">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-blue-500 text-2xl"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold">${currentUser.firstName} ${currentUser.lastName}</h3>
                        <p class="text-gray-600">@${currentUser.username}</p>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p class="text-gray-900">${currentUser.email}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <p class="text-gray-900">${currentUser.gender}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <p class="text-gray-900">${currentUser.dateOfBirth}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                        <p class="text-gray-900">${formatDate(currentUser.createdAt)}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getAdminDashboardHTML() {
    return `
        <div class="min-h-screen bg-gray-50">
            <!-- Admin Header -->
            <div class="bg-gray-800 text-white">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between h-16">
                        <div class="flex items-center space-x-4">
                            <i class="fas fa-shield-alt text-2xl"></i>
                            <span class="text-lg font-semibold">Admin Dashboard</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Admin Stats -->
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-users text-blue-500"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-gray-600">Total Users</p>
                                <p class="text-2xl font-bold" id="total-users">0</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-calendar text-green-500"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-gray-600">Total Appointments</p>
                                <p class="text-2xl font-bold" id="total-appointments">0</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-chart-line text-yellow-500"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-gray-600">Symptom Entries</p>
                                <p class="text-2xl font-bold" id="total-symptoms">0</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-envelope text-red-500"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-gray-600">Messages</p>
                                <p class="text-2xl font-bold" id="total-contacts">0</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- User Management Table -->
                <div class="bg-white p-6 rounded-lg shadow mb-8">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-semibold">User Management</h2>
                        <div class="flex space-x-3">
                            <div class="relative">
                                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <input type="text" id="user-search" placeholder="Search users..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                    </div>

                    <div id="users-table" class="overflow-x-auto">
                        <!-- Users table will be loaded here -->
                    </div>
                </div>

                <!-- Contact Messages -->
                <div class="bg-white p-6 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-6">Contact Messages</h2>
                    <div id="contacts-list">
                        <!-- Contact messages will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupAdminDashboard() {
    loadAdminData();
    
    // Setup search functionality
    const userSearch = document.getElementById('user-search');
    if (userSearch) {
        userSearch.addEventListener('input', filterUsers);
    }
}

async function loadAdminData() {
    try {
        const [usersResponse, appointmentsResponse, symptomsResponse, contactsResponse] = await Promise.all([
            apiRequest('GET', '/api/users'),
            apiRequest('GET', '/api/appointments'),
            apiRequest('GET', '/api/symptoms'),
            apiRequest('GET', '/api/contacts')
        ]);
        
        const users = await usersResponse.json();
        const appointments = await appointmentsResponse.json();
        const symptoms = await symptomsResponse.json();
        const contacts = await contactsResponse.json();
        
        // Update stats
        document.getElementById('total-users').textContent = users.length;
        document.getElementById('total-appointments').textContent = appointments.length;
        document.getElementById('total-symptoms').textContent = symptoms.length;
        document.getElementById('total-contacts').textContent = contacts.length;
        
        // Store data globally for filtering
        window.adminData = { users, appointments, symptoms, contacts };
        
        // Load tables
        loadUsersTable(users);
        loadContactsList(contacts);
        
    } catch (error) {
        console.error('Error loading admin data:', error);
        showToast('Failed to load admin data', 'error');
    }
}

function loadUsersTable(users) {
    const usersTable = document.getElementById('users-table');
    if (!usersTable) return;
    
    if (users.length === 0) {
        usersTable.innerHTML = '<p class="text-gray-500">No users found</p>';
        return;
    }
    
    let tableHTML = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
    `;
    
    users.forEach(user => {
        const statusBadge = user.isAdmin ? 
            '<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Admin</span>' :
            '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>';
        
        tableHTML += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.username}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.firstName} ${user.lastName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.gender}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(user.createdAt)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-900">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="text-blue-600 hover:text-blue-900">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${!user.isAdmin ? `<button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    usersTable.innerHTML = tableHTML;
}

function loadContactsList(contacts) {
    const contactsList = document.getElementById('contacts-list');
    if (!contactsList) return;
    
    if (contacts.length === 0) {
        contactsList.innerHTML = '<p class="text-gray-500">No messages received yet</p>';
        return;
    }
    
    let contactsHTML = '';
    contacts.forEach(contact => {
        contactsHTML += `
            <div class="p-4 bg-gray-50 rounded-lg mb-4">
                <div class="flex items-center justify-between mb-2">
                    <div>
                        <p class="font-medium">${contact.name}</p>
                        <p class="text-sm text-gray-600">${contact.email}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-500">${formatDate(contact.createdAt)}</span>
                        <button onclick="deleteContact(${contact.id})" class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="mb-2">
                    <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">${contact.subject}</span>
                </div>
                <p class="text-sm text-gray-700">${contact.message}</p>
            </div>
        `;
    });
    
    contactsList.innerHTML = contactsHTML;
}

function filterUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    if (!window.adminData || !window.adminData.users) return;
    
    const filteredUsers = window.adminData.users.filter(user =>
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm)
    );
    
    loadUsersTable(filteredUsers);
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await apiRequest('DELETE', `/api/users/${userId}`);
        
        if (response.ok) {
            showToast('User deleted successfully', 'success');
            loadAdminData(); // Refresh all data
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to delete user', 'error');
        }
    } catch (error) {
        showToast('Failed to delete user', 'error');
    }
}

async function deleteContact(contactId) {
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }
    
    try {
        const response = await apiRequest('DELETE', `/api/contacts/${contactId}`);
        
        if (response.ok) {
            showToast('Message deleted successfully', 'success');
            loadAdminData(); // Refresh all data
        } else {
            showToast('Failed to delete message', 'error');
        }
    } catch (error) {
        showToast('Failed to delete message', 'error');
    }
}

function getNotFoundHTML() {
    return `
        <div class="min-h-screen flex items-center justify-center">
            <div class="text-center">
                <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <p class="text-xl text-gray-600 mb-8">Page not found</p>
                <button onclick="navigateTo('home')" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                    Go Home
                </button>
            </div>
        </div>
    `;
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}