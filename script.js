// Slider functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
const slidesWrapper = document.getElementById('slidesWrapper');
const prevSlideBtn = document.getElementById('prevSlide');
const nextSlideBtn = document.getElementById('nextSlide');
const indicators = document.getElementById('indicators');

// Create indicators
for (let i = 0; i < totalSlides; i++) {
    const indicator = document.createElement('button');
    indicator.className = 'indicator';
    if (i === 0) indicator.classList.add('active');
    indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
    indicator.addEventListener('click', () => goToSlide(i));
    indicators.appendChild(indicator);
}

const indicatorButtons = document.querySelectorAll('.indicator');

function updateSlider() {
    slidesWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update indicators
    indicatorButtons.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
}

function goToSlide(index) {
    currentSlide = index;
    updateSlider();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlider();
}

prevSlideBtn.addEventListener('click', prevSlide);
nextSlideBtn.addEventListener('click', nextSlide);

// Auto-play slider
let sliderInterval = setInterval(nextSlide, 5000);

// Pause auto-play on hover
const sliderContainer = document.querySelector('.slider-container');
sliderContainer.addEventListener('mouseenter', () => clearInterval(sliderInterval));
sliderContainer.addEventListener('mouseleave', () => {
    sliderInterval = setInterval(nextSlide, 5000);
});

// Shows carousel functionality
const showsCarousels = {};

function initShowsCarousel(containerId, prevBtnId, nextBtnId) {
    const showsContainer = document.getElementById(containerId);
    if (!showsContainer) return;

    const prevShowBtn = document.getElementById(prevBtnId);
    const nextShowBtn = document.getElementById(nextBtnId);
    const showCards = showsContainer.querySelectorAll('.show-card');
    
    if (showCards.length === 0) return;

    const cardWidth = 180 + 30; // width + gap
    let showOffset = 0;

    function updateShowsCarousel() {
        if (!showsContainer) return;
        const visibleCards = Math.floor(showsContainer.offsetWidth / cardWidth);
        const maxOffset = Math.max(0, (showCards.length - visibleCards) * cardWidth);
        
        showsContainer.scrollTo({
            left: showOffset,
            behavior: 'smooth'
        });
    }

    function scrollShows(direction) {
        if (!showsContainer) return;
        const visibleCards = Math.floor(showsContainer.offsetWidth / cardWidth);
        const maxOffset = Math.max(0, (showCards.length - visibleCards) * cardWidth);
        
        if (direction === 'next') {
            showOffset = Math.min(showOffset + cardWidth * visibleCards, maxOffset);
        } else {
            showOffset = Math.max(showOffset - cardWidth * visibleCards, 0);
        }
        updateShowsCarousel();
    }

    // Store carousel state
    showsCarousels[containerId] = { showOffset, scrollShows };

    // Add event listeners
    if (prevShowBtn) {
        prevShowBtn.onclick = () => scrollShows('prev');
    }
    if (nextShowBtn) {
        nextShowBtn.onclick = () => scrollShows('next');
    }
}

// Initialize carousels when page loads
initShowsCarousel('showsContainer', 'prevShow', 'nextShow');

// Audio player functionality
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const loader = document.getElementById('loader');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');

// Radio stream URL (you can update this with the actual stream URL)
const streamUrl = 'https://studio.arc.radio/stream';

let isPlaying = false;
let isLoading = false;

// Initialize button state on page load
function initializePlayer() {
    loader.classList.remove('active');
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    playPauseBtn.classList.remove('playing');
}

// Call initialization when page loads
initializePlayer();

function setLoading(loading) {
    isLoading = loading;
    if (loading) {
        loader.classList.add('active');
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'none';
    } else {
        loader.classList.remove('active');
        // Show appropriate icon when loading stops
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }
}

function setPlaying(playing) {
    isPlaying = playing;
    if (playing) {
        playPauseBtn.classList.add('playing');
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playPauseBtn.classList.remove('playing');
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

playPauseBtn.addEventListener('click', () => {
    if (isLoading) return;

    if (!audioPlayer.src) {
        // First time loading
        setLoading(true);
        audioPlayer.src = streamUrl;
        audioPlayer.load();
        
        audioPlayer.addEventListener('canplay', () => {
            setLoading(false);
            audioPlayer.play().then(() => {
                setPlaying(true);
            }).catch(error => {
                console.error('Error playing audio:', error);
                setLoading(false);
                alert('Unable to play radio stream. Please check your connection.');
            });
        }, { once: true });

        audioPlayer.addEventListener('error', () => {
            setLoading(false);
            alert('Error loading radio stream. Please try again later.');
        });
    } else if (isPlaying) {
        audioPlayer.pause();
        setPlaying(false);
    } else {
        setLoading(true);
        audioPlayer.play().then(() => {
            setLoading(false);
            setPlaying(true);
        }).catch(error => {
            console.error('Error playing audio:', error);
            setLoading(false);
            alert('Unable to play radio stream. Please check your connection.');
        });
    }
});

// Handle audio events
audioPlayer.addEventListener('pause', () => {
    if (!audioPlayer.ended) {
        setPlaying(false);
    }
});

audioPlayer.addEventListener('ended', () => {
    setPlaying(false);
});

audioPlayer.addEventListener('waiting', () => {
    setLoading(true);
});

audioPlayer.addEventListener('playing', () => {
    setLoading(false);
    setPlaying(true);
});

// Client-side routing - Single Page Application
const navLinks = document.querySelectorAll('.nav-link');
const pageContents = {
    home: document.getElementById('page-home'),
    shows: document.getElementById('page-shows'),
    about: document.getElementById('page-about'),
    contact: document.getElementById('page-contact')
};

function navigateToPage(pageName) {
    // Hide all pages
    Object.values(pageContents).forEach(page => {
        if (page) {
            page.style.display = 'none';
        }
    });

    // Show selected page
    if (pageContents[pageName]) {
        pageContents[pageName].style.display = 'block';
    }

    // Update active nav link
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Scroll to top of main content
    document.querySelector('.main').scrollTop = 0;

    // Reinitialize shows carousel if navigating to shows page
    if (pageName === 'shows') {
        setTimeout(() => {
            initShowsCarousel('showsContainerAll', 'prevShowAll', 'nextShowAll');
        }, 100);
    }
}

// Add click handlers to nav links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageName = link.getAttribute('data-page');
        if (pageName) {
            navigateToPage(pageName);
        }
    });
});

// Mobile menu functionality
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const hamburgerIcon = document.querySelector('.hamburger-icon');
const closeIcon = document.querySelector('.close-icon');

let isMenuOpen = false;

function openMobileMenu() {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
    isMenuOpen = true;
    if (hamburgerIcon) hamburgerIcon.style.display = 'none';
    if (closeIcon) closeIcon.style.display = 'block';
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
    isMenuOpen = false;
    if (hamburgerIcon) hamburgerIcon.style.display = 'block';
    if (closeIcon) closeIcon.style.display = 'none';
}

function toggleMobileMenu() {
    if (isMenuOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
}

// Update navigateToPage to also update mobile nav links and close menu
const originalNavigateToPage = navigateToPage;
navigateToPage = function(pageName) {
    originalNavigateToPage(pageName);
    
    // Update mobile nav links
    mobileNavLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Close mobile menu after navigation
    closeMobileMenu();
};

// Add click handlers to mobile nav links
mobileNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageName = link.getAttribute('data-page');
        if (pageName) {
            navigateToPage(pageName);
        }
    });
});

// Close mobile menu when clicking outside
mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
        closeMobileMenu();
    }
});

// Initialize - show home page by default
navigateToPage('home');

// WhatsApp button functionality
const whatsappButton = document.querySelector('.whatsapp-button');
whatsappButton.addEventListener('click', () => {
    const phoneNumber = '1234567890'; // Replace with actual WhatsApp number
    const message = encodeURIComponent('Hello Ace Radio!');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
});

// Contact form submission handler
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };
        
        // Here you would typically send the form data to a server
        // For now, we'll just show an alert and reset the form
        console.log('Form submitted:', formData);
        
        // You can integrate with a backend API here, for example:
        // fetch('/api/contact', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(formData)
        // })
        // .then(response => response.json())
        // .then(data => {
        //     alert('Thank you for your message! We\'ll get back to you soon.');
        //     contactForm.reset();
        // })
        // .catch(error => {
        //     alert('Sorry, there was an error sending your message. Please try again.');
        // });
        
        alert('Thank you for your message! We\'ll get back to you soon.');
        contactForm.reset();
    });
}

