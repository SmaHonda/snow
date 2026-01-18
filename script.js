// 1. 設定影片列表
const videoList = ['./images/video/snow1.mp4', './images/video/snow2.mp4', './images/video/snow3.mp4'];
let currentIdx = 0;
let v1, v2, activeVideo;

// --- Safari 強制播放輔助函數 ---
function safePlay(videoElement) {
    if (!videoElement) return;
    videoElement.muted = true; // Safari 必須靜音才能自動播放
    const playPromise = videoElement.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Safari 自動播放受阻，等待互動或靜音重試:", error);
        });
    }
}

// --- 影片切換邏輯 ---
function switchVideo() {
    if (!v1 || !v2) return;

    const nextIdx = (currentIdx + 1) % videoList.length;
    const nextVideo = (activeVideo === v1) ? v2 : v1;
    const idleVideo = (activeVideo === v1) ? v1 : v2;

    // 預載下一段並播放
    nextVideo.src = videoList[nextIdx];
    safePlay(nextVideo);

    // 切換 CSS Class (透明度)
    nextVideo.classList.add('active');
    idleVideo.classList.remove('active');

    activeVideo = nextVideo;
    currentIdx = nextIdx;
}

// --- 初始化執行 ---
document.addEventListener('DOMContentLoaded', () => {
    v1 = document.getElementById('video-1');
    v2 = document.getElementById('video-2');
    activeVideo = v1;

    // 只有在首頁（有影片元素時）才執行輪播邏輯
    if (v1 && v2) {
        v1.src = videoList[0];
        v2.src = videoList[1];
        
        safePlay(v1); // 啟動第一段
        setInterval(switchVideo, 2500); // 每 2.5 秒切換
    }
    // 監聽第一次點擊或滾動，強制啟動影片
const startVideoOnInteraction = () => {
    if (v1) v1.play();
    if (v2) v2.play();
    // 執行一次後就移除監聽，避免浪費資源
    document.removeEventListener('click', startVideoOnInteraction);
    document.removeEventListener('touchstart', startVideoOnInteraction);
};

document.addEventListener('click', startVideoOnInteraction);
document.addEventListener('touchstart', startVideoOnInteraction);

    // --- 視差滾動效果 ---
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.getElementById('hero-video-section');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
        
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = 1 - (scrolled / 600);
        }
    });

    // --- 平滑滾動按鈕 ---
    const scrollBtn = document.getElementById('scroll-down-btn');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            const contentSection = document.getElementById('main-content-section');
            if (contentSection) {
                contentSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // --- 安全檢查：避免計算機邏輯在首頁報錯 ---
    if (typeof updateTicketSelectors === "function") {
        const resortSelect = document.getElementById('resort-select');
        if (!resortSelect) {
            console.log("跳過計算機邏輯檢查");
        }
    }
});