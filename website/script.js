// Configuration
const GITHUB_REPO = 'Varshneyabhushan/oasis-write'; // Update with your actual username
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const GITHUB_RELEASES = `https://github.com/${GITHUB_REPO}/releases`;

// Fetch latest release information
async function fetchLatestRelease() {
    try {
        const response = await fetch(GITHUB_API);
        if (!response.ok) {
            console.error('Failed to fetch release info');
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching release:', error);
        return null;
    }
}

// Update version display
function updateVersion(release) {
    const versionElement = document.getElementById('latest-version');
    if (versionElement && release) {
        versionElement.textContent = release.tag_name.replace('v', '');
    }
}

// Get download URL for platform
function getDownloadUrl(assets, platform) {
    if (!assets) return '#';

    const patterns = {
        macos: /\.dmg$/,
        macosAlt: /universal.*\.tar\.gz$/,
        windows: /\.msi$/,
        windowsAlt: /\.exe$/,
        linux: /\.AppImage$/,
        linuxDeb: /\.deb$/,
        linuxRpm: /\.rpm$/
    };

    const findAsset = (pattern) => assets.find(asset => pattern.test(asset.name));

    switch (platform) {
        case 'macos':
            return findAsset(patterns.macos)?.browser_download_url || '#';
        case 'macos-alt':
            return findAsset(patterns.macosAlt)?.browser_download_url || '#';
        case 'windows':
            return findAsset(patterns.windows)?.browser_download_url || '#';
        case 'windows-alt':
            return findAsset(patterns.windowsAlt)?.browser_download_url || '#';
        case 'linux':
            return findAsset(patterns.linux)?.browser_download_url || '#';
        case 'linux-deb':
            return findAsset(patterns.linuxDeb)?.browser_download_url || '#';
        case 'linux-rpm':
            return findAsset(patterns.linuxRpm)?.browser_download_url || '#';
        default:
            return '#';
    }
}

// Update download links
function updateDownloadLinks(release) {
    const assets = release?.assets;

    // Update main download buttons
    const downloadButtons = document.querySelectorAll('[data-platform]');
    downloadButtons.forEach(button => {
        const platform = button.getAttribute('data-platform');
        const url = assets ? getDownloadUrl(assets, platform) : '#';
        button.href = url !== '#' ? url : GITHUB_RELEASES;
    });

    // Update macOS section
    const macosCard = document.querySelector('[data-platform="macos"]').closest('.download-card');
    const macosAlt = macosCard.querySelector('.alt-link');
    if (macosAlt) {
        macosAlt.textContent = 'View all releases on GitHub';
        macosAlt.href = GITHUB_RELEASES;
    }

    // Update Windows section
    const windowsCard = document.querySelector('[data-platform="windows"]').closest('.download-card');
    const windowsLinks = windowsCard.querySelectorAll('.alt-link');
    if (windowsLinks[0]) {
        const exeUrl = getDownloadUrl(assets, 'windows-alt');
        windowsLinks[0].href = exeUrl !== '#' ? exeUrl : GITHUB_RELEASES;
    }

    // Update Linux section
    const linuxCard = document.querySelector('[data-platform="linux"]').closest('.download-card');
    const linuxLinks = linuxCard.querySelectorAll('.alt-link');
    if (linuxLinks[0]) {
        const debUrl = getDownloadUrl(assets, 'linux-deb');
        linuxLinks[0].href = debUrl !== '#' ? debUrl : GITHUB_RELEASES;
    }
    if (linuxLinks[1]) {
        const rpmUrl = getDownloadUrl(assets, 'linux-rpm');
        linuxLinks[1].href = rpmUrl !== '#' ? rpmUrl : GITHUB_RELEASES;
    }
}

// Detect user's platform
function detectPlatform() {
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();

    if (platform.includes('mac') || userAgent.includes('mac')) {
        return 'macos';
    } else if (platform.includes('win') || userAgent.includes('win')) {
        return 'windows';
    } else if (platform.includes('linux') || userAgent.includes('linux')) {
        return 'linux';
    }
    return null;
}

// Highlight user's platform
function highlightUserPlatform() {
    const platform = detectPlatform();
    if (!platform) return;

    const downloadCards = document.querySelectorAll('.download-card');
    downloadCards.forEach(card => {
        const button = card.querySelector(`[data-platform="${platform}"]`);
        if (button) {
            card.style.border = '2px solid var(--primary)';
            card.style.transform = 'scale(1.02)';
        }
    });
}

// Smooth scroll for anchor links
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Analytics (optional - respect user privacy)
function trackDownload(platform) {
    // Only if you decide to add analytics
    // Make sure to inform users in a privacy policy
    console.log(`Download initiated: ${platform}`);
}

// Add download tracking
function setupDownloadTracking() {
    const downloadButtons = document.querySelectorAll('[data-platform]');
    downloadButtons.forEach(button => {
        button.addEventListener('click', () => {
            const platform = button.getAttribute('data-platform');
            trackDownload(platform);
        });
    });
}

// Initialize
async function init() {
    // Fetch and update release info
    const release = await fetchLatestRelease();
    if (release) {
        updateVersion(release);
        updateDownloadLinks(release);
    }

    // Setup UI enhancements
    highlightUserPlatform();
    setupSmoothScroll();
    setupDownloadTracking();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
