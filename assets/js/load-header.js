document.addEventListener("DOMContentLoaded", function() {
    // 1. Identify the placeholder element
    const headerPlaceholder = document.getElementById("header-placeholder");
    
    if (headerPlaceholder) {
        // 2. Determine the path relative to the current file
        // If we are in a subfolder (e.g. /projects/), we need to go up one level
        const isSubFolder = window.location.pathname.includes("/projects/"); 
        
        // Path to fetch the HTML component
        const fetchPath = isSubFolder ? "../components/header.html" : "components/header.html";
        
        // 3. Fetch the Header HTML
        fetch(fetchPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load header: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                // 4. Inject the HTML
                headerPlaceholder.innerHTML = data;

                // 5. Fix links if we are in a subfolder
                // Because header.html uses "index.html", we need "../index.html" if we are in "projects/"
                if (isSubFolder) {
                    const links = headerPlaceholder.querySelectorAll("a");
                    links.forEach(link => {
                        const href = link.getAttribute("href");
                        // Only modify relative links that don't start with http, #, or mailto
                        if (href && !href.startsWith("http") && !href.startsWith("#") && !href.startsWith("mailto:")) {
                            link.setAttribute("href", "../" + href);
                        }
                    });
                }

                // 6. Re-initialize Mobile Menu Logic
                const menuBtn = document.getElementById('menu-btn');
                const mobileMenu = document.getElementById('mobile-menu');

                if (menuBtn && mobileMenu) {
                    menuBtn.addEventListener('click', () => {
                        mobileMenu.classList.toggle('hidden');
                    });
                }
                
                // 7. Highlight the Active Link
                const currentPath = window.location.pathname.split("/").pop() || "index.html"; // Get filename like 'About.html'
                
                const navLinks = headerPlaceholder.querySelectorAll("nav a, #mobile-menu a");
                
                navLinks.forEach(link => {
                    // Check if the link's href matches the current filename
                    // We check specifically for the filename part to avoid path issues
                    const linkHref = link.getAttribute("href");
                    const linkFilename = linkHref.split("/").pop(); // Extract filename from href (e.g., ../About.html -> About.html)

                    if (linkFilename === currentPath) {
                       link.classList.add('text-yellow-300', 'border-b-2', 'border-yellow-300'); 
                       link.classList.remove('hover:text-yellow-300');
                    }
                });
            })
            .catch(error => {
                console.error('Error loading header:', error);
                // Fallback content in case fetch fails (e.g. running locally without server)
                headerPlaceholder.innerHTML = `<div class="bg-red-100 text-red-700 p-4 text-center">Error loading header. Please view via a local server.</div>`;
            });
    }
});