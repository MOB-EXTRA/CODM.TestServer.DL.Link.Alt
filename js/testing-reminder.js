/**
 * MOB EXTRA - Testing Environment Fixed Top Reminder (Ultra-Compact Version)
 * Forces a tiny, low-profile warning bar to sit at the absolute top of the screen.
 */
(function() {
    function injectBanner() {
        if (document.getElementById("testing-site-banner")) return;

        const reminder = document.createElement("div");
        reminder.id = "testing-site-banner";

        // 🌟 Ultra-compact styles (shrunk padding, smaller font, zero bulk)
        reminder.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
            background-color: #1c1400 !important;
            border-bottom: 1.5px solid #e0a905 !important;
            color: #eaeaea !important;
            padding: 4px 8px !important; /* Shrunk from 8px 12px to keep it incredibly thin */
            text-align: center !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            font-size: 10px !important;  /* Reduced size for premium, non-obtrusive look */
            line-height: 1.3 !important;
            font-weight: 500 !important;
            z-index: 2147483647 !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        `;

        // 🌟 Adjusted text: Clarified this is the feature preview/staging site
        reminder.innerHTML = `
            <div style="max-width: 600px; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; margin: 0 auto !important;">
                <span id="warning-pulse-icon" style="color: #e0a905 !important; font-size: 11px !important; display: inline-flex !important; align-items: center !important;">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </span>
                <span style="letter-spacing: 0.1px !important;">
                    <strong>PREVIEW HUB:</strong> This is the staging site for <strong>MOB EXTRA</strong>. New updates are launched here first and may contain bugs.
                </span>
            </div>
        `;

        if (!document.getElementById("banner-pulse-style")) {
            const animationStyle = document.createElement("style");
            animationStyle.id = "banner-pulse-style";
            animationStyle.innerHTML = `
                #warning-pulse-icon {
                    animation: warnPulse 1.8s infinite ease-in-out !important;
                }
                @keyframes warnPulse {
                    0% { opacity: 0.4; transform: scale(0.95); }
                    50% { opacity: 1; transform: scale(1.05); }
                    100% { opacity: 0.4; transform: scale(0.95); }
                }
            `;
            document.head.appendChild(animationStyle);
        }

        document.documentElement.appendChild(reminder);

        // Dynamically shift layout downward just enough for the new smaller height (approx. 26-30px)
        const height = reminder.offsetHeight || 30; 
        document.documentElement.style.setProperty('padding-top', height + 'px', 'important');
    }

    if (document.readyState === "interactive" || document.readyState === "complete") {
        injectBanner();
    } else {
        document.addEventListener("DOMContentLoaded", injectBanner);
    }
})();
