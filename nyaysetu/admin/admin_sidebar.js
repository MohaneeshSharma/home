document.addEventListener("DOMContentLoaded", function() {
    renderSidebar();
    highlightActivePage();
});

function renderSidebar() {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    const sidebarHTML = `
    <aside id="sidebar" class="h-screen w-64 bg-obsidian text-white flex flex-col flex-shrink-0 shadow-2xl transition-all duration-300 z-30 fixed lg:static">
        
        <!-- HEADER -->
        <div class="h-16 flex items-center justify-between px-4 border-b border-gray-800">
            <div class="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                <i data-lucide="shield" class="text-gold w-6 h-6 flex-shrink-0"></i>
                <span class="font-serif font-bold text-lg sidebar-logo-text">NyayaSetu <span class="text-gold text-xs">ADMIN</span></span>
            </div>
            <button onclick="toggleSidebar()" class="text-gray-400 hover:text-white lg:hidden">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        
        <!-- NAVIGATION -->
        <nav class="flex-1 py-4 space-y-1 px-2 custom-scroll overflow-y-auto text-sm font-medium">
            
            <!-- Dashboard -->
            <a href="home.html" class="nav-item flex items-center gap-3 px-3 py-3 rounded-sm transition group text-gray-300 hover:bg-gray-800 hover:text-white">
                <i data-lucide="layout-grid" class="w-5 h-5 flex-shrink-0 group-hover:text-gold transition"></i> 
                <span class="sidebar-text">Master Dashboard</span>
            </a>

            <!-- User Governance -->
            <div class="px-3 mt-6 mb-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold group-heading">User Governance</div>
            
            <a href="lawyer_manage.html" class="nav-item flex items-center gap-3 px-3 py-2 rounded-sm transition group text-gray-300 hover:bg-gray-800 hover:text-white">
                <i data-lucide="briefcase" class="w-5 h-5 flex-shrink-0 group-hover:text-gold transition"></i> 
                <span class="sidebar-text">Lawyer Management</span>
            </a>
            
            <a href="user_manage.html" class="nav-item flex items-center gap-3 px-3 py-2 rounded-sm transition group text-gray-300 hover:bg-gray-800 hover:text-white">
                <i data-lucide="users" class="w-5 h-5 flex-shrink-0 group-hover:text-gold transition"></i> 
                <span class="sidebar-text">User Management</span>
            </a>
            
            <a href="staff_manage.html" class="nav-item flex items-center gap-3 px-3 py-2 rounded-sm transition group text-gray-300 hover:bg-gray-800 hover:text-white">
                <i data-lucide="user-cog" class="w-5 h-5 flex-shrink-0 group-hover:text-gold transition"></i> 
                <span class="sidebar-text">Internal Staff</span>
            </a>

            <!-- Resolution Desk -->
            <div class="px-3 mt-6 mb-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold group-heading">Resolution Center</div>
            
            <a href="complaint.html" class="nav-item flex items-center gap-3 px-3 py-2 rounded-sm transition group text-gray-300 hover:bg-gray-800 hover:text-white">
                <i data-lucide="alert-octagon" class="w-5 h-5 flex-shrink-0 group-hover:text-red-400 transition"></i> 
                <span class="sidebar-text">Complaints</span>
            </a>
            
            <a href="grivance.html" class="nav-item flex items-center gap-3 px-3 py-2 rounded-sm transition group text-gray-300 hover:bg-gray-800 hover:text-white">
                <i data-lucide="message-square-warning" class="w-5 h-5 flex-shrink-0 group-hover:text-orange-400 transition"></i> 
                <span class="sidebar-text">Grievance Cell</span>
            </a>
            
            <a href="dispute.html" class="nav-item flex items-center gap-3 px-3 py-2 rounded-sm transition group text-gray-300 hover:bg-gray-800 hover:text-white">
                <i data-lucide="gavel" class="w-5 h-5 flex-shrink-0 group-hover:text-yellow-400 transition"></i> 
                <span class="sidebar-text">Dispute Resolution</span>
            </a>

            <!-- Content & Comms -->
            <div class="px-3 mt-6 mb-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold group-heading">Content & Comms</div>
            
            <a href="blog_manage.html" class="nav-item flex items-center gap-3 px-3 py-2 rounded-sm transition group text-gray-300 hover:bg-gray-800 hover:text-white">
                <i data-lucide="file-text" class="w-5 h-5 flex-shrink-0 group-hover:text-gold transition"></i> 
                <span class="sidebar-text">Blog Manager</span>
            </a>
            
            <a href="E-book_library.html" class="nav-item flex items-center gap-3 px-3 py-2 rounded-sm transition group text-gray-300 hover:bg-gray-800 hover:text-white">
                <i data-lucide="book" class="w-5 h-5 flex-shrink-0 group-hover:text-gold transition"></i> 
                <span class="sidebar-text">E-Books & Library</span>
            </a>
            
            <a href="noticeboard.html" class="nav-item flex items-center gap-3 px-3 py-2 rounded-sm transition group text-gray-300 hover:bg-gray-800 hover:text-white">
                <i data-lucide="bell" class="w-5 h-5 flex-shrink-0 group-hover:text-gold transition"></i> 
                <span class="sidebar-text">Notice Board</span>
            </a>

            <!-- Finance -->
            <div class="px-3 mt-6 mb-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold group-heading">Finance</div>
            
            <a href="Finance_refund.html" class="nav-item flex items-center gap-3 px-3 py-2 rounded-sm transition group text-gray-300 hover:bg-gray-800 hover:text-white">
                <i data-lucide="indian-rupee" class="w-5 h-5 flex-shrink-0 group-hover:text-green-400 transition"></i> 
                <span class="sidebar-text">Finance & Refunds</span>
            </a>

        </nav>
        
        <!-- Admin User Footer -->
        <div class="p-4 border-t border-gray-800 bg-gray-900">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-obsidian font-bold text-xs shadow-lg">AD</div>
                <div class="overflow-hidden sidebar-text">
                    <p class="text-sm font-bold">Admin</p>
                    <p class="text-[10px] text-gray-400">Super User</p>
                </div>
                <button class="ml-auto text-gray-500 hover:text-red-500 transition"><i data-lucide="log-out" class="w-4 h-4"></i></button>
            </div>
        </div>
    </aside>
    `;

    container.innerHTML = sidebarHTML;
    
    // Initialize icons after injection
    if (window.lucide) {
        lucide.createIcons();
    }
}

function highlightActivePage() {
    // Get current filename (e.g., "lawyer_manage.html")
    const path = window.location.pathname;
    const page = path.split("/").pop();

    const links = document.querySelectorAll('.nav-item');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        
        // Check if this link matches current page
        if (href === page) {
            // Remove inactive classes
            link.classList.remove('text-gray-300', 'hover:bg-gray-800', 'hover:text-white');
            
            // Add Active State (Gold Background, Obsidian Text)
            link.classList.add('bg-gold', 'text-obsidian', 'font-bold', 'shadow-md');
            
            // Change the icon color specifically for the active state if needed
            const icon = link.querySelector('i');
            if(icon) {
                icon.classList.remove('text-gray-400', 'group-hover:text-gold', 'group-hover:text-red-400', 'group-hover:text-orange-400', 'group-hover:text-yellow-400', 'group-hover:text-green-400'); // Clear hover effects
                icon.classList.add('text-obsidian'); // Icon becomes black to match text
            }
        }
    });
}

// Mobile Toggle Function
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('-translate-x-full');