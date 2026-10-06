document.addEventListener("DOMContentLoaded", () => {

/* PAGE LOADER */
const pageLoader = document.getElementById("pageLoader");
window.addEventListener("load", () => {
    setTimeout(() => { pageLoader?.classList.add("done"); }, 1200);
});

/* LANGUAGE */
const languageToggle = document.getElementById("languageToggle");
let currentLanguage = localStorage.getItem("portfolio-language") || "en";

if (languageToggle) {
    languageToggle.addEventListener("click", () => {
        currentLanguage = currentLanguage === "en" ? "zh" : "en";
        updateLanguage();
    });
}

function updateLanguage() {
    document.querySelectorAll("[data-en][data-zh]").forEach((el) => {
        const text = el.dataset[currentLanguage];
        if (text !== undefined) el.textContent = text;
    });
    languageToggle?.querySelectorAll(".language-option").forEach((option) => {
        const isActive = option.dataset.language === currentLanguage;
        option.classList.toggle("language-active", isActive);
        option.setAttribute("aria-pressed", String(isActive));
    });
    document.documentElement.lang = currentLanguage === "en" ? "en" : "zh-CN";
    if (currentProject) {
        renderCaseStudy();
        initCaseVideoSlider();
    }
    localStorage.setItem("portfolio-language", currentLanguage);
}

/* SCROLL PROGRESS */
const scrollProgress = document.getElementById("scrollProgress");
function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    if (scrollProgress) scrollProgress.style.width = `${progress}%`;
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

/* HEADER */
const header = document.getElementById("siteHeader");
function updateHeader() {
    if (window.scrollY > 30) header?.classList.add("scrolled");
    else header?.classList.remove("scrolled");
}
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

/* MOBILE MENU */
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
function closeMobileMenu() {
    menuToggle?.classList.remove("active");
    mobileMenu?.classList.remove("active");
    document.body.classList.remove("is-locked");
}
menuToggle?.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.contains("active");
    if (isOpen) closeMobileMenu();
    else {
        menuToggle.classList.add("active");
        mobileMenu.classList.add("active");
        document.body.classList.add("is-locked");
    }
});
mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
});

/* SMOOTH ANCHOR */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const target = document.querySelector(targetId);
        if (!target) return;
        event.preventDefault();
        const headerOffset = 75;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
    });
});

/* CURSOR */
const cursorDot = document.getElementById("cursorDot");
const cursorRing = document.getElementById("cursorRing");
const cursorLabel = cursorRing?.querySelector(".cursor-label");
if (cursorDot && cursorRing && window.matchMedia("(pointer: fine)").matches) {
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    }, { passive: true });
    function animateCursor() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    window.addEventListener("mousedown", () => document.body.classList.add("cursor-pressed"));
    window.addEventListener("mouseup", () => document.body.classList.remove("cursor-pressed"));
    document.querySelectorAll("[data-cursor]").forEach((el) => {
        el.addEventListener("mouseenter", () => {
            const type = el.dataset.cursor;
            document.body.classList.add("cursor-hover");
            if (cursorLabel) {
                const labelMap = {
                    download: "Download", view: "View", mail: "Email",
                    link: "Open", scroll: "Scroll", home: "Home", top: "Top"
                };
                cursorLabel.textContent = labelMap[type] || "";
            }
        });
        el.addEventListener("mouseleave", () => {
            document.body.classList.remove("cursor-hover");
            if (cursorLabel) cursorLabel.textContent = "";
        });
    });
}

/* MAGNETIC */
if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".magnetic").forEach((button) => {
        button.addEventListener("mousemove", (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            button.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
        });
        button.addEventListener("mouseleave", () => {
            button.style.transform = "translate(0,0)";
        });
    });
}

/* IMAGE FALLBACK */
document.querySelectorAll(".work-card img, .case-cover-image img, .case-image-block img, .phone-screen img, .profile-photo img").forEach((img) => {
    const parent = img.parentElement;
    const fallback = parent?.querySelector(".work-card-fallback, .img-fallback, .phone-fallback, .profile-photo-placeholder");

    img.addEventListener("load", () => {
        img.style.display = "block";
        img.style.opacity = "1";
        img.style.zIndex = "2";
        if (fallback) fallback.style.zIndex = "1";
    });

    img.addEventListener("error", () => {
        img.style.display = "none";
        if (fallback) fallback.style.zIndex = "3";
    });
});

/* =========================================
   GALLERY — 滚轮横滑 + 按住拖动
   ========================================= */
const galleryTrack = document.getElementById("galleryTrack");
const galleryOpenAll = document.getElementById("galleryOpenAll");
const galleryArchive = document.getElementById("galleryArchive");
const galleryArchiveGrid = document.getElementById("galleryArchiveGrid");
const galleryArtViewer = document.getElementById("galleryArtViewer");
const galleryArtImage = document.getElementById("galleryArtImage");
const galleryArtFallback = document.getElementById("galleryArtFallback");
const galleryArtCaption = document.getElementById("galleryArtCaption");
if (galleryTrack) {
    const galleryImages = [...galleryTrack.querySelectorAll(".gallery-item img")];
    let selectedGalleryIndex = 0;

    function showGalleryArtwork(index) {
        selectedGalleryIndex = (index + galleryImages.length) % galleryImages.length;
        const sourceImage = galleryImages[selectedGalleryIndex];
        galleryArtImage.src = sourceImage.getAttribute("src");
        galleryArtImage.alt = `Sketch or side work ${selectedGalleryIndex + 1}`;
        galleryArtCaption.textContent = `${String(selectedGalleryIndex + 1).padStart(2, "0")} / ${String(galleryImages.length).padStart(2, "0")}`;
        galleryArtImage.hidden = false;
        galleryArtFallback.hidden = true;
        galleryArtFallback.textContent = `Artwork ${String(selectedGalleryIndex + 1).padStart(2, "0")} image is not available yet`;
    }

    galleryImages.forEach((sourceImage, index) => {
        const tile = document.createElement("button");
        const thumbnail = document.createElement("img");
        const fallback = document.createElement("span");
        tile.type = "button";
        tile.className = "gallery-archive-tile";
        tile.setAttribute("aria-label", `Open artwork ${index + 1}`);
        thumbnail.src = sourceImage.getAttribute("src");
        thumbnail.alt = "";
        thumbnail.loading = "lazy";
        fallback.className = "gallery-archive-fallback";
        fallback.textContent = `WORK / ${String(index + 1).padStart(2, "0")}`;
        thumbnail.addEventListener("error", () => {
            thumbnail.hidden = true;
            fallback.hidden = false;
        });
        thumbnail.addEventListener("load", () => {
            fallback.hidden = true;
        });
        tile.append(thumbnail, fallback);
        tile.addEventListener("click", () => {
            showGalleryArtwork(index);
            galleryArchive.classList.add("showing-artwork");
            galleryArtViewer.hidden = false;
            galleryArchive.querySelector(".gallery-art-back")?.focus();
        });
        galleryArchiveGrid.append(tile);
    });

    galleryArtImage.addEventListener("error", () => {
        galleryArtImage.hidden = true;
        galleryArtFallback.hidden = false;
    });

    galleryArtImage.addEventListener("load", () => {
        galleryArtImage.hidden = false;
        galleryArtFallback.hidden = true;
    });

    function closeGalleryArchive() {
        if (galleryArchive?.open) galleryArchive.close();
        document.body.classList.remove("is-locked");
        galleryArchive?.classList.remove("showing-artwork");
        if (galleryArtViewer) galleryArtViewer.hidden = true;
        galleryOpenAll?.focus();
    }

    galleryOpenAll?.addEventListener("click", () => {
        galleryArchive.showModal();
        document.body.classList.add("is-locked");
    });
    galleryArchive?.querySelector(".gallery-archive-close")?.addEventListener("click", closeGalleryArchive);
    galleryArchive?.querySelector(".gallery-art-back")?.addEventListener("click", () => {
        galleryArchive.classList.remove("showing-artwork");
        galleryArtViewer.hidden = true;
    });
    galleryArchive?.querySelector(".gallery-art-prev")?.addEventListener("click", () => showGalleryArtwork(selectedGalleryIndex - 1));
    galleryArchive?.querySelector(".gallery-art-next")?.addEventListener("click", () => showGalleryArtwork(selectedGalleryIndex + 1));
    galleryArchive?.addEventListener("close", () => {
        document.body.classList.remove("is-locked");
        galleryArchive.classList.remove("showing-artwork");
        galleryArtViewer.hidden = true;
        if (document.activeElement === galleryArchive) galleryOpenAll?.focus();
    });
    galleryArchive?.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeGalleryArchive();
    });
    galleryArchive?.addEventListener("click", (event) => {
        if (event.target === galleryArchive) closeGalleryArchive();
    });
    galleryArchive?.addEventListener("keydown", (event) => {
        if (!galleryArchive.classList.contains("showing-artwork")) return;
        if (event.key === "ArrowLeft") showGalleryArtwork(selectedGalleryIndex - 1);
        if (event.key === "ArrowRight") showGalleryArtwork(selectedGalleryIndex + 1);
    });

    galleryTrack.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            galleryTrack.scrollLeft += e.deltaY;
        }
    }, { passive: false });

    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;

    galleryTrack.addEventListener("mousedown", (e) => {
        isDown = true;
        galleryTrack.classList.add("dragging");
        startX = e.pageX;
        startScrollLeft = galleryTrack.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
        isDown = false;
        galleryTrack.classList.remove("dragging");
    });

    galleryTrack.addEventListener("mouseleave", () => {
        isDown = false;
        galleryTrack.classList.remove("dragging");
    });

    galleryTrack.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const walk = (e.pageX - startX) * 1.4;
        galleryTrack.scrollLeft = startScrollLeft - walk;
    });
}

/* PROJECT DATA */
const projectData = {

    fitfan: {
        number: "01",
        category: { en: "Mobile / Data Viz", zh: "移动端 · 数据可视化" },
        title: "FitFan",
        kicker: { en: "A Personalised Platform for Olympic Fans", zh: "为奥运粉丝打造的个性化平台" },
        summary: {
            en: "A personalised Olympic fan platform that closes the gap between event highlights and athletes' everyday lives. Athlete profiles, recipes, training plans, live notifications and a companion watch app, all in one place.",
            zh: "一个为奥运粉丝打造的个性化平台，拉近赛事高光与运动员日常生活之间的距离。运动员资料、食谱、训练计划、实时通知以及配套手表 App，全都整合在一起。"
        },
        metricsBig: [
            { num: "3", label: { en: "Iteration rounds", zh: "轮迭代" } },
            { num: "5 / 5", label: { en: "Found navigation intuitive", zh: "认为导航直观" } },
            { num: "40+", label: { en: "Figma screens", zh: "Figma 屏幕" } }
        ],
        role: { en: "Interaction Designer", zh: "交互设计师" },
        type: { en: "Mobile · Data Visualisation", zh: "移动端 · 数据可视化" },
        methods: { en: "Journey Mapping · Information Architecture · Prototyping · Think-Aloud · Decision Matrix", zh: "旅程图 · 信息架构 · 原型制作 · 出声思维 · 决策矩阵" },
        context: {
            en: "Today's Olympic coverage is almost entirely about highlights and final results. Fans who want to know athletes as people — their daily routines, meals, training and personal stories — have nowhere to go. Our research with five personas confirmed a clear gap: existing sports apps deliver results, not relationships. The brief was to design a platform where fans can access athletes' lives in a personal, multi-dimensional way, and also take part themselves through recipes and training plans.",
            zh: "如今，奥运报道几乎只关注高光时刻和最终成绩。想了解运动员作为普通人的一面——日常作息、三餐、训练、个人故事——的粉丝，却无处可去。我们通过五个用户画像的研究，确认了一个明显空白：现有体育 App 提供的是成绩，而不是关系。任务书要求设计一个平台，让粉丝能以个性化、多维度的方式了解运动员的生活，同时也能通过食谱和训练计划亲身参与其中。"
        },
        research: {
            en: "We mapped three detailed user journeys, each across six scenes, capturing actions, touchpoints, thoughts, emotions, pain points and opportunities. One persona wanted a quick summary over breakfast; another wanted to cook along with a favourite athlete; a third wanted VR immersion. A decision matrix scored three competing concepts, and the winning direction combined thorough athlete coverage, engaging features, personalisation and multiplatform support. Two rounds of usability testing with five testers each validated the direction.",
            zh: "我们绘制了三份详细的用户旅程，每份涵盖六个场景，记录行为、触点、想法、情绪、痛点与机会。其中一位用户想在吃早餐时快速浏览摘要；一位想跟着喜欢的运动员一起做饭；还有一位希望体验 VR 沉浸感。我们用决策矩阵给三个概念打分，最终方向兼顾了全面的运动员报道、有趣的互动功能、个性化与多平台支持。随后我们进行了两轮可用性测试，每轮五位测试者，验证了方向。"
        },
        quote: {
            en: "I want to feel part of the Olympics, even if I'm not there.",
            zh: "即使到不了现场，我也想感觉自己就在奥运之中。",
            attribution: { en: "— Event tracker persona", zh: "— 赛事追踪用户画像" }
        },
        designDecisions: {
            en: "From 19 ideas generated through Crazy 8s, we narrowed down to four core features: Athlete Moment (social posts and match schedule), Athlete Recipe (filter by cuisine and meal time), Exercise (personalised training plans based on athletes' routines) and Notifications (real-time match reminders). We tested the information architecture twice. One key decision came after the first prototype failed: we split the schedule and social posts into two swipeable pages, because testers kept scrolling and losing their bearings when everything was on one page. We also added a companion watch app after users assumed training notifications would sync to a smartwatch.",
            zh: "通过 Crazy 8s 产出 19 个想法后，我们收敛到四个核心功能：运动员时刻（社交帖子与赛程）、运动员食谱（按菜系和用餐时段筛选）、运动（以运动员作息为基础的个性化训练计划）、通知（实时赛事提醒）。信息架构测了两轮。一个关键决策来自第一版原型的失败：我们把赛程和社交帖子拆成两个可左右滑动的页面，因为所有内容堆在一页时，测试者会不停滚动并失去方向感。此外，用户默认训练通知会同步到智能手表，所以我们增加了配套的手表 App。"
        },
        sketches: {
            en: "Crazy 8s produced 19 early concepts across three areas: athlete coverage, personal activities and community features. Storyboards visualised the six-scene journeys, and we then converged on the four core features and built a paper prototype for the first usability round.",
            zh: "Crazy 8s 围绕三个方向产出 19 个初步概念：运动员报道、个人活动与社区功能。我们用故事板把六个场景的旅程画出来，随后收敛到四个核心功能，并制作纸原型用于第一轮可用性测试。"
        },
        sketchImages: [
            "images/fitfan-sketch-1.png",
            "images/fitfan-sketch-2.png",
            "images/fitfan-sketch-3.png",
            "images/fitfan-sketch-4.png",
            "images/fitfan-sketch-5.png"
        ],
        iterationImages: [
            "images/fitfan-iteration-1.png",
            "images/fitfan-iteration-2.png"
        ],
        journeyImages: [
            "images/fitfan-journey-1.png",
            "images/fitfan-journey-2.png",
            "images/fitfan-journey-3.png"
        ],
         

        // 默认两张图：fitfan-final-1.png, fitfan-final-2.png
        iterations: [
            { label: "Prototype A", title: { en: "Merged schedule and social", zh: "赛程与社交合并" }, desc: { en: "The first version put the athlete's schedule and social posts on a single page. Usability testing exposed a serious navigation problem: testers scrolled endlessly, lost their place, and couldn't tell whether they were looking at schedule or social content. Pain points included 'I wasn't sure which link to click' and 'the sections are combined and it confuses me'.", zh: "第一版把运动员赛程和社交帖子放在同一页。可用性测试暴露出严重的导航问题：测试者不停滚动、找不到位置，也分不清自己在看赛程还是社交内容。痛点包括「我不确定该点哪个链接」以及「板块合在一起让我很困惑」。" } },
            { label: "Prototype B", title: { en: "Split into two swipeable pages", zh: "拆分为两个可滑动页面" }, desc: { en: "The second version split schedule and social into two swipeable pages. Navigation improved significantly. Testing still flagged some missing features, though: recipe filters by cuisine and meal time, a login page, and a weekly schedule view. Testers also wanted more customisation options and a clearer main screen for following more athletes.", zh: "第二版将赛程和社交拆分为两个可左右滑动的页面，导航体验明显改善。不过测试仍然指出一些缺失的功能：按菜系和用餐时段筛选食谱、登录页、每周赛程视图。测试者还希望有更多自定义选项，以及一个更清晰的主屏，用于关注更多运动员。" } },
            { label: "Prototype C", title: { en: "Full Figma with five modules", zh: "完整 Figma 五个模块" }, desc: { en: "The final version added cuisine and meal-time filters, a login page, a weekly schedule view, password login and a companion watch app. Tested with five users: five out of five described navigation as 'simple and intuitive'. The meal-sharing feature was described as 'interesting and engaging', and users successfully followed workout routines synced with Apple Watch notifications.", zh: "最终版增加了菜系与用餐时段筛选、登录页、每周赛程视图、密码登录以及配套手表 App。对五位用户测试后，五位都认为导航「简单、直观」。食谱分享功能被描述为「有趣、吸引人」，用户也能顺利跟随与 Apple Watch 通知同步的训练计划。" } }
        ],
        keyFindings: [
            { en: "Navigation was the main blocker. Merged layouts caused heavy scrolling and loss of orientation. Splitting content into swipeable pages solved it.", zh: "导航是最大的障碍。合并布局导致大量滚动和方向感丧失。把内容拆成可滑动的页面后，问题就解决了。" },
            { en: "Recipe filters were a core user need. Cuisine and meal-time filters were requested consistently across all three personas.", zh: "食谱筛选是核心用户需求。三个用户画像都一致要求按菜系和用餐时段筛选。" },
            { en: "Watch integration was expected. Users assumed training notifications would sync to a smartwatch, which made a companion watch app essential.", zh: "手表集成是用户的预期。用户默认训练通知会同步到智能手表，因此配套手表 App 必不可少。" },
            { en: "Login was needed for trust. Users wanted their favourite athletes saved across devices.", zh: "登录是建立信任的基础。用户希望收藏的运动员能在不同设备之间同步。" },
            { en: "Users wanted more customisation. Testers asked for more control over notifications, home screen layout and the number of athletes they can follow.", zh: "用户希望有更多自定义空间。测试者希望更好地控制通知、主屏布局，以及可关注运动员的数量。" }
        ],
        final: {
            en: "FitFan has five core modules: Athlete Profile (bio, achievements, match schedule, social posts), Athlete Recipe (cuisine and meal-time filters, upload your own meal), Exercise (personalised training plans with warm-up, strength training and data tracking), Data (calories burnt, total training time, weight lost, heart rate, sleep, distance) and Notifications (real-time match reminders). The full Figma prototype covers over 40 screens, including a companion watch app with training notifications, meal tracking and scanning. Overall testing showed better navigation, high engagement with athlete profiles, and a good combination of workout routines and data analysis.",
            zh: "FitFan 包含五个核心模块：运动员资料（简介、成就、赛程、社交帖子）、运动员食谱（菜系与用餐时段筛选、上传自己的餐食）、运动（个性化训练计划，含热身、力量训练与数据追踪）、数据（消耗卡路里、总训练时长、减重、心率、睡眠、距离）、通知（实时赛事提醒）。完整 Figma 原型覆盖 40 多个屏幕，并包含配套手表 App，支持训练通知、餐食追踪和扫描。整体测试显示导航改善、运动员资料参与度高，训练计划和数据分析结合得也不错。"
        },
        reflection: {
            en: "Hierarchy is an interaction decision. From 19 ideas down to four core features, and from a merged layout to two split pages, every iteration solved a specific behavioural problem. The biggest lesson: users don't want more content, they want clearer structure. Splitting one confusing page into two simple ones did more for engagement than adding any new feature would have. Future improvements include more customisation options for notifications and home screen layout, and expanding the recipe-sharing community.",
            zh: "信息层级本身就是交互设计的一部分。从 19 个想法收敛到四个核心功能，从合并布局拆成两个页面，每一次迭代都在解决一个具体的行为问题。最大的收获是：用户要的不是更多内容，而是更清晰的结构。把一个令人困惑的页面拆成两个简单的页面，对参与度的提升胜过增加任何新功能。未来我们会增加更多通知和主屏自定义选项，并扩展食谱分享社区。"
        },
        demoLink: "https://www.figma.com/proto/PWJnNTMLgXI0tHPwarWp3S/FitFan-Final?node-id=1-1598&starting-point-node-id=1%3A1598",
        hasPhone: true,
        phoneImage: "images/fitfan-phone.png"
    },

    mindscape: {
        number: "02",
        category: { en: "VR / Mental Health", zh: "VR · 心理健康" },
        title: "Mindscape / SanctUary",
        kicker: { en: "A VR Safe Space for Social Anxiety", zh: "为社交焦虑设计的 VR 安全空间" },
        summary: {
            en: "A VR safe space for people with communication difficulties — social anxiety, autism — to practise social skills in a low-pressure, progressive environment. Built in Unity with five rooms, a tutorial guide character, and a cooperative laser challenge.",
            zh: "为有沟通障碍的人群（社交焦虑、自闭症等）设计的 VR 安全空间，让他们在低压力、渐进式的环境中练习社交技能。使用 Unity 搭建，包含五个房间、一位教程引导角色和一个双人激光挑战。"
        },
        finalVideos: [
            "videos/mindscape-1.mp4",
            "videos/mindscape-2.mp4",
            "videos/mindscape-3.mp4",
            "videos/mindscape-4.mp4",
            "videos/mindscape-5.mp4"
        ],
        researchMedia: [
            "images/mindscape-research-1.png",
            "images/mindscape-research-2.png"
        ],
        sketchImages: [
            "images/mindscape1.png",
            "images/mindscape2.png",
            "images/mindscape3.png",
            "images/mindscape4.png"
        ],
        sketchVideo: "videos/mindscape-sketch-5.mp4",
        journeyImages: [
            "images/mindscape-journey-1.png",
            "images/mindscape-journey-2.png",
            "images/mindscape-journey-3.png"
        ],
        metricsBig: [
            { num: "73%", label: { en: "Reported lower anxiety", zh: "报告焦虑降低" } },
            { num: "20+", label: { en: "Test participants", zh: "测试参与者" } },
            { num: "5", label: { en: "Rooms designed", zh: "设计房间数" } }
        ],
        role: { en: "Interaction Designer", zh: "交互设计师" },
        type: { en: "VR · Unity", zh: "VR · Unity" },
        methods: { en: "Research · Journey Mapping · Unity · Think-Aloud · IPQ · Interviews", zh: "研究 · 旅程图 · Unity · 出声思维 · IPQ · 访谈" },
        context: {
            en: "Over-reliance on digital communication is contributing to rising social anxiety and isolation. As face-to-face interaction declines, opportunities to engage with diverse communities shrink, and real-world communication becomes harder. Existing VR exposure therapy tends to feel clinical and intimidating, and lacks progressive difficulty. Our goal was to design an inclusive virtual social environment where users can gradually overcome social fears, build confidence and practise social skills in a low-pressure setting.",
            zh: "过度依赖数字交流正在加剧社交焦虑与孤立。随着面对面互动减少，接触多元社区的机会也在缩小，现实世界的沟通变得越来越难。现有的 VR 暴露疗法往往显得临床化、令人生畏，而且缺乏渐进难度。我们的目标是设计一个包容的虚拟社交环境，让用户能在低压力环境中逐步克服社交恐惧、建立自信，并练习社交技能。"
        },
        research: {
            en: "We interviewed over 20 participants using think-aloud protocols, post-experience interviews and IPQ presence scoring. Research was triangulated across academic literature, news reports and first-hand VR testing. Key user needs emerged: emotional support and reassurance, structured routine building, actionable training guidance, and trustworthy community-vetted knowledge. We mapped user journeys across six scenes to identify pain points in navigation, guidance, feedback and visual cues.",
            zh: "我们对 20 多位参与者使用出声思维、体验后访谈和 IPQ 临场感评分。研究通过学术文献、新闻报道和第一手 VR 测试三方交叉验证。浮现出的核心用户需求包括：情绪支持与安慰、结构化的日常建立、可操作的训练指导，以及可信的社区验证知识。我们绘制了六个场景的用户旅程，识别导航、引导、反馈与视觉线索方面的痛点。"
        },
        quote: {
            en: "I want to practise social skills without the fear of being judged.",
            zh: "我想练习社交技能，而不用害怕被评判。",
            attribution: { en: "— Core user need", zh: "— 核心用户需求" }
        },
        designDecisions: {
            en: "Four core rooms with progressive difficulty: Social Skills Training Room (simulates cafés, classrooms and interviews with adjustable difficulty), Private Space (forests, beaches, starry skies to ease stress), Chat Room (one-on-one and group conversations), and Encourage Wall (a wall of encouraging words from all users). All built in Unity with custom 3D scenes. A tutorial companion character introduces each space, explains goals and confirms task completion. A cooperative Laser Challenge demonstrates point collection and rewards, and the Rewards Room lets users spend points on safe-space customisation. One key decision was replacing long instructional texts with contextual, goal-based guidance, after testing showed users skipped long text and felt lost.",
            zh: "四个核心房间，难度递进：社交技能训练室（模拟咖啡馆、教室、面试，难度可调）、私人空间（森林、海滩、星空，用来缓解压力）、聊天室（一对一和小组对话）、鼓励墙（汇集所有用户的鼓励话语）。全部使用 Unity 搭建自定义 3D 场景。教程引导角色会介绍每个空间、说明目标并确认任务完成。合作式激光挑战演示了积分收集和奖励机制，奖励室则让用户用积分购买安全空间自定义物品。一个关键决策是：测试发现用户会跳过冗长文字并感到迷失，因此我们把长教程文字改成了情境化、以目标为导向的引导。"
        },
        sketches: {
            en: "A mind map and storyboards defined the four core rooms and the final five-room experience. Sketching focused on how each room supports a specific stage of social skill practice — from private relaxation to one-on-one chat to group discussion. Storyboards visualised the journey from Start Room through Safe Space, Challenge Lobby, Laser Challenge and Rewards Room.",
            zh: "我们用心智图和故事板确定了四个核心房间以及最终的五房间体验。草图重点在于每个房间如何支持社交技能练习的不同阶段——从私人放松，到一对一聊天，再到小组讨论。故事板把从 Start Room 到 Safe Space、Challenge Lobby、Laser Challenge 和 Rewards Room 的旅程画了出来。"
        },
        iterations: [
            { label: "Prototype A", title: { en: "Full tutorial text", zh: "完整教程文字" }, desc: { en: "The first version placed full tutorial text in each room. Users skipped it, felt lost and had no clear goal. Testing revealed a major lack of guidance: users often weren't sure what to do next, and long instructional texts reduced engagement.", zh: "第一版在每个房间都放了完整的教程文字。用户跳过不看，感到迷失，也没有明确目标。测试暴露了严重的引导缺失：用户常常不确定下一步该做什么，长段教程文字也降低了参与度。" } },
            { label: "Prototype B", title: { en: "Location-based pop-up tips", zh: "位置弹窗提示" }, desc: { en: "The second version added location-based pop-up tips and reduced text. Engagement improved, but player roles and objectives were still unclear. Terms like 'director' and 'navigator' confused users, player matching was vague, movement felt too slow, and there was no confirmation when tasks were completed.", zh: "第二版增加了基于位置的弹窗提示并减少了文字量，参与度有所提升，但玩家角色和目标仍然不清楚。「导演」「导航员」这类术语让用户困惑，玩家匹配也很模糊，移动感觉太慢，任务完成时也没有反馈。" } },
            { label: "Prototype C", title: { en: "Guide character with step-by-step goals", zh: "引导角色 + 分步目标" }, desc: { en: "The final version introduced a tutorial guide character, goal-based steps and green UI checks for task completion. Users completed tasks twice as fast in testing. Each room now has a clear purpose: Safe Space for customisation, Challenge Lobby for meeting players, Laser Challenge for cooperative point collection, Rewards Room for spending points on items. Planned improvements include hand-tracking, voice chat, AI translation and mixed-reality integration.", zh: "最终版引入了教程引导角色、分步骤目标，以及绿色 UI 来确认任务完成。测试中用户完成任务的速度提高了一倍。每个房间现在都有明确用途：Safe Space 用于自定义，Challenge Lobby 用于认识玩家，Laser Challenge 用于双人积分收集，Rewards Room 用于用积分购买物品。未来规划包括手势追踪、语音聊天、AI 翻译以及混合现实集成。" } }
        ],
        keyFindings: [
            { en: "Lack of guidance: users weren't sure what to do next, and long instructional texts reduced engagement. Contextual, goal-based guidance solved this.", zh: "引导不足：用户不确定下一步该做什么，长段教程文字降低了参与度。情境化、以目标为导向的引导解决了这个问题。" },
            { en: "Unclear roles and mechanics: terms like 'director/navigator' were confusing and player matching was vague. We replaced jargon with simple, goal-based labels.", zh: "角色与机制不清晰：「导演 / 导航员」这类术语让人困惑，玩家匹配也很模糊。我们把术语换成了简单的、以目标为导向的标签。" },
            { en: "Slow navigation and missing feedback: movement felt too slow, and there was no confirmation when tasks were completed. We added green UI checks and made movement faster.", zh: "导航慢、反馈缺失：移动感觉太慢，任务完成后也没有任何提示。我们增加了绿色 UI 确认，并提高了移动速度。" },
            { en: "Insufficient visual cues: store types, prices and points were unclear, and public versus private areas weren't distinguishable. We added clear signage, floating UI and a minimap.", zh: "视觉线索不足：商店类型、价格和积分都不清晰，公共区域和私人区域也难以区分。我们增加了清晰的标识、浮动 UI 和小地图。" },
            { en: "73% of participants reported reduced anxiety after using the safe space. Clarity, not more features, drove that result.", zh: "73% 的参与者表示使用安全空间后焦虑有所降低。带来这一结果的是清晰度，而不是更多功能。" }
        ],
        final: {
            en: "The final VR experience spans five rooms: Start Room (a realistic home setting symbolising entry into the space), Safe Space (personal and customisable, with a treasure corner, central display, achievement wall and computer desk), Challenge Lobby (the main social area with player matching), Laser Challenge (a cooperative demo where players collect point rings and drop them into a chest), and Rewards Room (stores where users spend points on safe-space items and abilities). Each room was tested with over 20 participants. The guide character accompanies users throughout. Planned improvements include hand-tracking, optional voice chat, an intimacy system, AI voice translation for symbol-based in-game communication, and mixed-reality integration.",
            zh: "最终 VR 体验包含五个房间：Start Room（逼真的家居场景，象征进入空间）、Safe Space（个人可自定义，含宝藏角、中央展示区、成就墙和电脑桌）、Challenge Lobby（主要社交区，包含玩家匹配）、Laser Challenge（合作演示，玩家收集积分环并投入宝箱）、Rewards Room（商店，用户用积分购买安全空间物品和能力）。每个房间都对 20 多位参与者进行了测试。引导角色会全程陪伴用户。未来规划包括手势追踪、可选语音聊天、亲密度系统、用于符号化游戏内交流的 AI 语音翻译，以及混合现实集成。"
        },
        reflection: {
            en: "The biggest lesson: reducing anxiety comes from clarity, not from adding features. The first prototype failed because it tried to explain everything at once. The final version succeeded because the guide gives one clear goal at a time, with immediate visual confirmation. Future work includes optional voice chat, an intimacy system that unlocks meaningful details as users interact more, AI voice translation, and a weekly rotating rewards system. We also plan to optimise for motion sickness, colour blindness and limited mobility, and explore mixed reality so users can scan real-life items and bring them into the game.",
            zh: "最大的收获：降低焦虑来自清晰度，而不是增加功能。第一版原型失败，是因为它试图一次把所有东西都讲清楚。最终版之所以成功，是因为引导角色一次只给出一个明确目标，并立即给予视觉确认。未来方向包括可选语音聊天、随着互动增加逐步解锁有意义细节的亲密度系统、AI 语音翻译，以及每周轮换的奖励系统。我们还计划针对晕动症、色盲和行动不便进行优化，并探索混合现实，让用户可以扫描现实物品并带入游戏。"
        },
        demoLink: "https://glitch.com/edit/#!/elated-cautious-pyroraptor",
        hasPhone: false,
        phoneImage: "images/mindscape-phone.png"
    },

    petready: {
        number: "03",
        category: { en: "Mobile / Habit Building", zh: "移动端 · 习惯养成" },
        title: "PetReady 21",
        kicker: { en: "A 21-Day Guided Habit App for First-Time Pet Owners", zh: "为首次养宠者设计的 21 天习惯养成 App" },
        summary: {
            en: "A 21-day guided app that helps first-time pet owners build stable daily care habits through energy-based scheduling, gamified milestones, editable achievement medals and a memory system. The goal is to turn the stressful early transition of pet ownership into an engaging, confidence-building experience.",
            zh: "一款 21 天引导式 App，通过能量等级排程、游戏化里程碑、可编辑成就勋章和记忆系统，帮助首次养宠者建立稳定的日常护理习惯。目标是把养宠初期的高压过渡，转化为一个有参与感、能建立自信的体验。"
        },
        metricsBig: [
            { num: "10", label: { en: "Usability testers", zh: "可用性测试者" } },
            { num: "61.75", label: { en: "Average SUS score", zh: "SUS 得分（平均）" } },
            { num: "40%", label: { en: "Tasks needed help", zh: "任务需帮助比例" } }
        ],
        role: { en: "Interaction Designer", zh: "交互设计师" },
        type: { en: "Mobile · Habit Design", zh: "移动端 · 习惯设计" },
        methods: { en: "Habit Loop · Energy Scheduling · Crazy 8s · Bodystorming · Think-Aloud ×10 · SUS · SEQ", zh: "习惯回路 · 能量排程 · Crazy 8s · 身体风暴 · 出声思维 ×10 · SUS · SEQ" },
        context: {
            en: "69% of Australian households own a pet; 73% of first-time owners feel overwhelmed; 41% struggle with basic commands. Young adults aged 18 to 30 often underestimate the consistency and discipline required, which can lead to stress, lapses in responsibility, and even doubts about long-term commitment. The brief was to design a solution that helps first-time owners build sustainable responsibility, strengthen genuine emotional connection with their pets, and protect the well-being of both. PetReady 21 focuses on building confidence through gradual habit formation, rather than replacing the owner's role.",
            zh: "69% 的澳大利亚家庭养宠；73% 的首次养宠者感到不堪重负；41% 在基础指令上遇到困难。18 到 30 岁的年轻人往往低估了所需的坚持和自律，因此容易感到压力、责任断档，甚至开始怀疑自己能否长期坚持下去。任务书要求设计一个方案，帮助首次养宠者培养可持续的责任感、加强与宠物之间真实的情感联系，并保护双方的身心健康。PetReady 21 的重点是通过渐进式习惯养成来建立自信，而不是取代主人的角色。"
        },
        research: {
            en: "Research triangulated academic literature, news reports and online ethnography (20 to 25 forum posts analysed via affinity diagrams). Four primary user needs emerged: emotional support and reassurance, structured routine building, actionable training guidance, and trustworthy community-vetted knowledge. We also ran three interviews (two with pet experience, one planning to adopt) and used affinity diagrams to identify recurring themes. Crazy 8s produced 80 ideas around the pet ownership transition; bodystorming acted out six scenarios, including a young adopter receiving a sky-high vet bill.",
            zh: "研究通过三条路径交叉验证：学术文献、新闻报道和在线民族志（用亲和图分析了 20 到 25 条论坛帖子）。浮现出四个主要用户需求：情绪支持与安慰、结构化的日常建立、可操作的训练指导，以及可信的社区验证知识。我们还进行了三次访谈（两位有养宠经验，一位计划领养），用亲和图找出反复出现的主题。Crazy 8s 围绕养宠转变产出 80 个想法；身体风暴演绎了六个场景，包括年轻领养者收到天价兽医账单。"
        },
        researchMedia: [
            "images/petready-research.png",
            "images/petready-research-2.png",
            "images/petready-research-3.png"
        ],
        quote: {
            en: "I need to know where to start before I can ask for help.",
            zh: "在我能开口求助之前，我得先知道该从哪儿开始。",
            attribution: { en: "— Core user insight", zh: "— 核心用户洞察" }
        },
        designDecisions: {
            en: "We built a low-to-mid-fidelity Figma prototype covering five core flows: onboarding, daily plan with energy selection, achievements with editable medals, journey with memory log, and profile with multi-pet management. The energy-based scheduler was a key decision: users pick their energy level each day (energetic, fine or drained), and the app dynamically arranges non-essential tasks — like walking the dog three times — into high-energy days, while essential tasks like feeding and cleaning stay daily. A 21-day achievement system encourages completion; after all achievements, users receive a customised medal and a matching pet collar. Pet avatar customisation affects the daily plan: a large dog gets more walks than a small dog.",
            zh: "我们制作了低到中保真的 Figma 原型，覆盖五个核心流程：引导、含能量选择的每日计划、可编辑勋章的成就、含记忆日志的旅程，以及含多宠物管理的个人中心。能量排程是关键决策：用户每天选择自己的能量等级（充沛、一般或疲惫），App 会把非必需任务——比如一天遛狗三次——动态安排到高能量日，而喂食、清洁这类必需任务保持每日进行。21 天成就系统鼓励用户坚持完成；全部完成后，用户会收到一枚定制勋章和一条配套的宠物项圈。宠物头像的自定义会影响每日计划：大型犬比小型犬安排更多遛狗。"
        },
        sketches: {
            en: "Crazy 8s produced 80 ideas around the pet ownership transition. Bodystorming acted out six scenarios, including a young adopter receiving a sky-high vet bill, which highlighted financial strain as a core stressor. Think-aloud validated the flow during ideation. Storyboards visualised the 21-day journey: a student plans to adopt, uses the app to prepare, chooses 'drained' mode to focus on study, and after 21 days finishes all to-dos and receives a medal and collar.",
            zh: "Crazy 8s 围绕养宠转变产出 80 个想法。身体风暴演绎了六个场景，其中包括年轻领养者收到天价兽医账单，凸显了财务压力是核心压力源。我们在构思阶段用出声思维验证了流程。故事板把 21 天旅程画了出来：一位学生计划领养，用 App 做准备，选择「疲惫」模式专注学业，21 天后完成了所有待办，并获得了勋章和项圈。"
        },
        journeyTitle: { en: "How users react during testing", zh: "用户在测试当中的反应以及过程" },
        journeyImages: [
            "images/petready-journey-1.png",
            "images/petready-journey-2.png",
            "images/petready-journey-3.png",
            "images/petready-journey-4.png",
            "images/petready-journey-5.png",
            "images/petready-journey-6.png"
        ],
        iterationImages: [
            "images/petready-iteration-1.png",
            "images/petready-iteration-2.png",
            "images/petready-iteration-3.png"
        ],
        // 👇 PetReady 的三张图，与 fitfan 一样纵向铺满
        finalImages: [
            "images/petready-final-1.png",
            "images/petready-final-2.png"
        ],
        iterations: [
            { label: "Round 1", title: { en: "Paper to mid-fidelity wireframe", zh: "纸原型 → 中保真线框" }, desc: { en: "The first round defined the energy-based scheduler and the 21-day progress bar. Usability testing with 10 participants revealed four issues: pet trait terminology was ambiguous ('Care Sensitivity' was unclear); the daily plan page felt 'overwhelming' and users couldn't tell important tasks from optional ones; the address entry was hidden inside Settings and raised privacy concerns; and achievements felt disconnected from daily progress.", zh: "第一轮定义了能量排程器和 21 天进度条。对 10 位参与者的可用性测试揭示了四个问题：宠物特征的术语含糊（「护理敏感度」不清晰）；每日计划页让人感觉「信息过载」，用户分不清重要任务和可选任务；地址入口藏在设置里，引发了隐私担忧；成就与每日进度之间缺乏关联。" } },
            { label: "Round 2", title: { en: "Mid-fidelity to high-fidelity refinement", zh: "中保真 → 高保真优化" }, desc: { en: "We added a progress bar and a daily message on the home page, simplified task types into clickable sections (Core Care, Physical Activity, Bonus), introduced a timeline-format to-do list, redesigned Achievement as a 'Journey' page with editable medals, and moved the address entry out of Settings into a clearer location. Testers responded well to the progress bar and the clearer task hierarchy.", zh: "我们在首页增加了进度条和每日消息，把任务类型简化为可点击的板块（核心护理、体育活动、奖励），引入了时间线格式的待办列表，把成就重新设计为一个带可编辑勋章的「旅程」页面，并把地址入口从设置里移出来，放到了更清晰的位置。测试者对进度条和更清晰的任务层级反应良好。" } },
            { label: "Round 3", title: { en: "10-participant test with SUS", zh: "10 位参与者测试 + SUS" }, desc: { en: "Think-aloud testing with 10 participants, SEQ after each task, SUS at the end. The average SUS score was 61.75, below the benchmark of 68. 60% of tasks were completed independently; 40% required help. Key issues were cognitive overload on the daily plan page, ambiguous terminology, unclear information architecture, and a weak feedback loop between achievements and daily progress. These findings directly shaped the final high-fidelity prototype.", zh: "对 10 位参与者进行了出声思维测试，每个任务后记录 SEQ，最后做 SUS。平均 SUS 得分为 61.75，低于 68 的基准线。60% 的任务独立完成；40% 需要帮助。主要问题是：每日计划页认知过载、术语含糊、信息架构不清晰，以及成就和每日进度之间的反馈薄弱。这些发现直接影响了最终高保真原型的设计。" } }
        ],
        keyFindings: [
            { en: "Cognitive overload: the daily plan page felt overwhelming, and users couldn't tell important tasks from optional ones. We simplified task types into Core Care, Physical Activity and Bonus sections.", zh: "认知过载：每日计划页让人感觉信息过载，用户分不清重要任务和可选任务。我们把任务类型简化为核心护理、体育活动和奖励三个板块。" },
            { en: "Ambiguous terminology: 'Care Sensitivity' and pet traits were unclear to first-time owners. We replaced jargon with plain, task-based labels.", zh: "术语含糊：「护理敏感度」和宠物特征对首次养宠者来说不清晰。我们把术语换成平实、基于任务的标签。" },
            { en: "Unclear information architecture: the address entry was hidden inside Settings, hard to find, and raised privacy concerns. We moved it to a clearer location and added transparent consent flows.", zh: "信息架构不清晰：地址入口藏在设置里，难以找到，还引发了隐私担忧。我们把它移到了更清晰的位置，并增加了透明同意流程。" },
            { en: "Weak feedback loop: achievements felt disconnected from daily progress, and users wanted a visible progress bar. We added a progress bar and daily message on the home page.", zh: "反馈薄弱：成就与每日进度脱节，用户希望有可见的进度条。我们在首页增加了进度条和每日消息。" },
            { en: "Energy-based scheduling worked: users liked that the app adapts to their energy level, arranging non-essential tasks into high-energy days and reducing pressure on low-energy days.", zh: "能量排程有效：用户喜欢 App 能够适应他们的能量等级，把非必需任务安排到高能量日，并在低能量日减轻压力。" }
        ],
        final: {
            en: "PetReady 21 combines four key features: energy-based scheduling (users select energetic, fine or drained each day; non-essential tasks are dynamically arranged), a 21-day habit journey (daily plan with Core Care, Physical Activity and Bonus tasks; progress bar plus daily message), editable achievement medals (users can customise medals; after all achievements, they receive a physical medal and a matching pet collar), and a memory system (Journey page with timeline, photos and milestones). The high-fidelity prototype supports multi-pet profiles, account security, pet avatar customisation and address entry for receiving rewards. The average SUS score was 61.75, below the benchmark of 68, with 60% of tasks completed independently. Next steps: simplify the information architecture, redesign interactive elements, and prioritise core task support over ancillary features.",
            zh: "PetReady 21 结合了四个关键功能：能量排程（用户每天选择充沛、一般或疲惫；非必需任务动态安排）、21 天习惯旅程（每日计划含核心护理、体育活动和奖励任务；进度条加每日消息）、可编辑成就勋章（用户可以自定义勋章；全部完成后会收到一枚实体勋章和一条配套宠物项圈），以及记忆系统（旅程页面含时间线、照片和里程碑）。高保真原型支持多宠物档案、账户安全、宠物头像自定义，以及用于接收奖励的地址入口。平均 SUS 得分为 61.75，低于 68 的基准线，60% 的任务独立完成。下一步：简化信息架构、重新设计交互元素，并优先支持核心任务，而不是辅助功能。"
        },
        reflection: {
            en: "The concept solves a real problem, but the first prototype failed on information hierarchy. The biggest lesson: a good idea is not enough. Users need clear structure and immediate feedback. The energy-based scheduler was the strongest feature because it adapts to real life, not the other way around. The 21-day achievement system worked as motivation, but the connection between daily tasks and achievements needed to be stronger. Next steps: simplify the information architecture, redesign interactive elements, prioritise core task support over ancillary features, and integrate external resources like foster networks and temporary care services in future iterations.",
            zh: "这个概念解决了真实问题，但第一版原型在信息层级上失败了。最大的收获是：好想法本身不够，用户需要清晰的结构和即时的反馈。能量排程是最强的功能，因为它适应真实生活，而不是反过来。21 天成就系统确实起到了激励作用，但每日任务和成就之间的关联需要更强。下一步：简化信息架构、重新设计交互元素、优先支持核心任务而不是辅助功能，并在未来迭代中接入寄养网络和临时护理服务等外部资源。"
        },
        demoLink: "https://www.figma.com/proto/AbTdWDE234a0Qo5kKcxnDL/pet-ready-21?node-id=1049-4560&starting-point-node-id=974%3A5726",
        hasPhone: true,
        phoneImage: "images/petready-phone.png"
    },

    petcarepal: {
        number: "04",
        category: { en: "Mobile / Service", zh: "移动端 · 服务设计" },
        title: "PetCarePal / PetTalk",
        kicker: { en: "A Mobile App for First-Time Pet Owners", zh: "为首次养宠者设计的移动应用" },
        summary: {
            en: "An intelligent robot plus mobile app for first-time pet owners: expense tracking, community feed, pet scan and surveillance in one platform. The design pivoted three times based on user interviews, dropping hardware-dependent health tracking and replacing it with a social community layer.",
            zh: "为首次养宠者设计的智能机器人加移动应用：消费追踪、社区 Feed、宠物扫描和监控集成在一个平台里。设计过程中基于用户访谈三次转向，去掉了依赖硬件的健康追踪，替换成社交社区层。"
        },
        metricsBig: [
            { num: "85%", label: { en: "Independent usage", zh: "独立使用率" } },
            { num: "3", label: { en: "Major iterations", zh: "轮主要迭代" } },
            { num: "6", label: { en: "Core screens", zh: "核心屏幕" } }
        ],
        role: { en: "UX / Interaction Designer", zh: "UX / 交互设计师" },
        type: { en: "Mobile · Service Design", zh: "移动端 · 服务设计" },
        methods: { en: "Interview ×3 · Affinity Diagramming · Wireframing · Think-Aloud · Design Principles", zh: "访谈 ×3 · 亲和图 · 线框 · 出声思维 · 设计原则" },
        context: {
            en: "As a pet owner myself, I understand that pets need companionship, playtime and health support. Existing solutions don't fully meet these needs, which makes pet care inefficient. The brief was to design an intelligent robot and a complementary software platform that connects pet owners with animal care providers, so pets receive care and companionship even when owners are away. The robot is mobile, rechargeable or solar-powered, and has a 360-degree rotating monitor; the software includes expense tracking, community, pet scan and surveillance. The name 'PetCarePal' stands for pet, care, partners — not owners — because for many people, pets are family.",
            zh: "作为一名养宠者，我理解宠物需要陪伴、玩耍和健康支持。现有方案未能完全满足这些需求，导致养宠效率不高。任务书要求设计一个智能机器人加配套软件平台，连接养宠者和动物护理服务提供者，让宠物在主人不在时也能获得护理和陪伴。机器人可移动、可充电或太阳能供电，并带有 360 度旋转监控；软件包含消费追踪、社区、宠物扫描和监控。名字「PetCarePal」代表宠物、护理、伙伴——不是主人——因为对很多人来说，宠物就是家人。"
        },
        research: {
            en: "We interviewed three participants (two with pet experience, one planning to adopt) and analysed 20 to 25 forum posts using affinity diagrams. The full information architecture revealed six areas: Login, Spending, Food, Portfolio, Vet, Surveillance. Interview #1 showed that reminder precision matters — days of the week aren't enough; users want exact date and time. Interview #2 showed that health tracking requires expensive hardware, which isn't viable for every user. Interview #3 showed that users want to identify unknown breeds on the street. These three insights directly drove the three major pivots.",
            zh: "我们访谈了三位参与者（两位有养宠经验，一位计划领养），并用亲和图分析了 20 到 25 条论坛帖子。完整信息架构揭示六个板块：登录、消费、食物、个人中心、兽医、监控。访谈 #1 表明提醒精度很重要——只写星期几是不够的，用户想要精确的日期和时间。访谈 #2 表明健康追踪需要昂贵硬件，并非每位用户都能负担。访谈 #3 表明用户希望在街上识别不认识的宠物品种。这三个洞察直接驱动了三次主要转向。"
        },
        researchMedia: [
            "images/petcarepal-research-1.png",
            "images/petcarepal-research-2.png",
            "images/petcarepal-research-3.png"
        ],
        quote: {
            en: "I need to know where to start before I can ask for help.",
            zh: "在我能开口求助之前，我得先知道该从哪儿开始。",
            attribution: { en: "— User research insight", zh: "— 用户研究洞察" }
        },
        designDecisions: {
            en: "Interview #2 revealed that health tracking requires expensive hardware, which isn't viable for every user. We pivoted: replaced it with the PetTalk community feed plus pet scan. Interview #3 revealed that users want to identify unknown breeds on the street — this became the pet scan feature. Interview #1 revealed that reminder precision matters, so we changed reminders from 'Monday' to an exact date and time, and added a pet food reminder. Design principles applied throughout: Visibility (all elements clearly visible), Feedback (instant error messages, real-time spending updates, community notifications), Constraints (valid login only, spending advice, community guidelines), Mapping (intuitive organisation of categories), Consistency (same visual elements across platforms), Functional support (clear buttons, interactive charts), Discoverability (clear labels, tooltips, tutorials).",
            zh: "访谈 #2 揭示健康追踪需要昂贵硬件，并非每位用户都能负担。我们转向：用 PetTalk 社区 Feed 加宠物扫描替代。访谈 #3 揭示用户希望在街上识别不认识的品种——这成为了宠物扫描功能。访谈 #1 揭示提醒精度很重要，所以我们把提醒从「星期一」改成精确的日期和时间，并增加了宠物食物提醒。全程应用的设计原则包括：可见性（所有元素清晰可见）、反馈（即时错误提示、实时消费更新、社区通知）、约束（只有有效登录才能进入、消费建议、社区规范）、映射（直观的分类组织）、一致性（跨平台相同视觉元素）、功能支持（清晰的按钮、交互式图表）、可发现性（清晰的标签、工具提示、教程）。"
        },
        sketches: {
            en: "A mind map explored all features: Food, Profile, Money, Device, Daily. Then an affinity diagram from three interviews revealed the pivots we needed. We also developed watch platform wireframes with a spending graph, community feed, pet scan, vet info and surveillance. The final wireflow connects Login → Spending → Community / PetTalk → Portfolio → Vet / Pet Store → Surveillance, with the watch platform mirroring the phone experience.",
            zh: "我们用心智图探索了所有功能：食物、个人中心、金钱、设备、日常。然后用三次访谈的亲和图找到了需要的转向。我们还开发了手表平台线框，包含消费图表、社区 Feed、宠物扫描、兽医信息和监控。最终线框流连接登录 → 消费 → 社区 / PetTalk → 个人中心 → 兽医 / 宠物商店 → 监控，手表平台则镜像手机体验。"
        },
        noSketchMedia: true,
        journeyImages: [
            "images/petcarepal-journey-1.png",
            "images/petcarepal-journey-2.png",
            "images/petcarepal-journey-3.png",
            "images/petcarepal-journey-4.png"
        ],
        iterationImages: [
            "images/petcarepal-iteration-1.png",
            "images/petcarepal-iteration-2.png",
            "images/petcarepal-iteration-3.png"
        ],
        // 👇 PetCarePal 的三张图，与 fitfan 一样纵向铺满
        finalImages: [
            "images/petcarepal-final-1.png",
            "images/petcarepal-final-2.png",
            "images/petcarepal-final-3.png"
        ],
        iterations: [
            { label: "Prototype A", title: { en: "Health tracking included", zh: "包含健康追踪" }, desc: { en: "The first version included full health tracking (heart rate, steps, sleep, water intake). Interview #2 revealed that health tracking requires expensive hardware, which isn't viable for every user. The participant said: 'I actually think they outsource some of it, but smart devices can only help with very few things. In most situations, for example if the pet gets sick, you still have to take it to the hospital yourself.'", zh: "第一版包含完整的健康追踪（心率、步数、睡眠、饮水）。访谈 #2 揭示健康追踪需要昂贵硬件，并非每位用户都能负担。参与者说：「我其实觉得它们外包了一部分，但智能设备只能帮很少的事。大多数情况下，比如宠物生病，你还是得自己带它去医院。」" } },
            { label: "Prototype B", title: { en: "Removed health, kept food", zh: "去掉健康，保留食物" }, desc: { en: "The second version removed the health hardware requirement and kept food plus portfolio. Interview #1 revealed that reminder precision matters, so the reminder page was changed from 'Monday' to exact date and time, and a pet food reminder was added. But the social layer users actually wanted was still missing. Interview #3 revealed that users want to identify unknown breeds on the street.", zh: "第二版去掉了健康硬件需求，保留了食物和个人中心。访谈 #1 揭示提醒精度很重要，所以提醒页从「星期一」改成精确的日期和时间，并增加了宠物食物提醒。但用户真正想要的社交层仍然缺失。访谈 #3 揭示用户希望在街上识别不认识的品种。" } },
            { label: "Prototype C", title: { en: "PetTalk community plus pet scan", zh: "PetTalk 社区 + 宠物扫描" }, desc: { en: "The final version replaced health tracking with PetTalk — a community feed where users share photos and videos of their pets, combined with a food record. A pet scan feature lets users identify unknown breeds on the street. The watch platform was also updated with a spending graph, community feed, pet scan, vet info and surveillance. 85% independent usage in testing. The final design system uses soft black, white, grey and light pink to avoid visual fatigue, with consistent typography rules and recognisable icons.", zh: "最终版用 PetTalk 替代了健康追踪——用户可以在社区 Feed 里分享宠物的照片和视频，并和食物记录结合。宠物扫描功能让用户能在街上识别不认识的品种。手表平台也更新为消费图表、社区 Feed、宠物扫描、兽医信息和监控。测试中独立使用率达到 85%。最终设计系统使用柔和的黑、白、灰和浅粉，避免视觉疲劳，并配以一致的排版规则和易识别的图标。" } }
        ],
        keyFindings: [
            { en: "Health tracking requires expensive hardware, which isn't viable for every user. Replacing it with a social community layer (PetTalk) achieved 85% independent usage in testing.", zh: "健康追踪需要昂贵硬件，并非每位用户都能负担。用社交社区层（PetTalk）替代后，测试中达到 85% 的独立使用率。" },
            { en: "Reminder precision matters — days of the week are not enough; users want exact date and time. We changed reminders to exact date and time, and added a pet food reminder.", zh: "提醒精度很重要——只写星期几不够，用户想要精确的日期和时间。我们把提醒改成精确的日期和时间，并增加了宠物食物提醒。" },
            { en: "Users want to identify unknown breeds on the street — this became the pet scan feature.", zh: "用户希望在街上识别不认识的品种——这成为了宠物扫描功能。" },
            { en: "The social layer is essential. Users see third-party tools as emotional aids, not substitutes, and their purchasing decisions are driven by emotional connection.", zh: "社交层必不可少。用户把第三方工具看作情感辅助，而不是替代品，他们的购买决策也由情感连接驱动。" },
            { en: "Third-party devices should support, not replace, human caregiving — especially the owner's independent emotional interpretation of their pet. Data diversity is critical for reducing algorithmic bias.", zh: "第三方设备应该支持而不是取代人的护理——尤其是主人对宠物的独立情感解读。数据多样性对减少算法偏见至关重要。" }
        ],
        final: {
            en: "PetCarePal has six core screens: Login (data saved to cloud, secure), Spending (income and expense categories, monthly and yearly charts, photo receipts), Community / PetTalk (share photos and videos, food record, pet scan for identifying breeds), Portfolio (password, reminder with exact date and time, pet food reminder, note alarms), Vet / Pet Store (online vets by pet type, pet sitter postings, five-star recommended pet store), and Surveillance (real-time monitoring, past playback, robot introduction, manufacturer contact, battery status, photo, talk and video with your pet). A companion watch platform was also developed, with a spending graph, community feed, pet scan, vet info and surveillance. 85% independent usage in testing.",
            zh: "PetCarePal 有六个核心屏幕：登录（数据存到云端，安全可靠）、消费（收入和支出分类、月度和年度图表、照片收据）、社区 / PetTalk（分享照片视频、食物记录、宠物扫描识别品种）、个人中心（密码、精确日期和时间提醒、宠物食物提醒、笔记闹钟）、兽医 / 宠物商店（按宠物类型提供在线兽医、宠物保姆发布、五星推荐宠物店）、监控（实时监控、历史回放、机器人介绍、厂商联系、电池状态、与宠物拍照、说话和视频）。我们还开发了配套手表平台，包含消费图表、社区 Feed、宠物扫描、兽医信息和监控。测试中独立使用率达到 85%。"
        },
        reflection: {
            en: "When external support is limited, empower users to self-regulate. The biggest lesson: don't design features that require hardware users don't have. The pivot from health tracking to PetTalk was the right call — it turned a hardware-dependent feature into a purely software, social feature that 85% of users could use independently. Design principles applied: Visibility, Feedback, Constraints, Mapping, Consistency, Functional support, Discoverability. Future work includes a budget and billing management module, a community marketplace for exchanging pet supplies, a health log with weight, vaccination and medication records, a reminder system for vet appointments and vaccinations, and a dedicated forum with professional vet participation.",
            zh: "当外部支持有限时，应该赋能用户自我调节。最大的收获：不要设计依赖用户没有的硬件的功能。从健康追踪转向 PetTalk 是正确的决定——它把一个依赖硬件的功能，变成了纯粹软件的社交功能，85% 的用户都能独立使用。应用的设计原则包括：可见性、反馈、约束、映射、一致性、功能支持、可发现性。未来工作包括预算和账单管理模块、交换宠物用品的社区市场、含体重、疫苗和用药记录的健康日志、兽医预约和疫苗提醒系统，以及有专业兽医参与的专门论坛。"
        },
        demoLink: "https://www.figma.com/proto/I4cQZ7IZNMERrA38eYoarj/interface-final-demon?node-id=184-2883",
        hasPhone: true,
        phoneImage: "images/petcarepal-phone.png"
    },

    hermes: {
        number: "05",
        category: { en: "3D / Laser Cutting", zh: "3D · 激光切割" },
        title: "Diamond & Heart",
        kicker: { en: "Two Objects in Material Exploration", zh: "两件材料探索作品" },
        summary: {
            en: "Two objects: a 3D-printed half-diamond chocolate box (used to create silicone moulds for chocolates), and a laser-cut heart-shaped wooden gift box with dark brown wood, orange ribbon and a carved horse motif. Both translate a luxury brand's signature codes — the orange box, equestrian motifs and craft as art — into physical objects.",
            zh: "两件作品：一个 3D 打印的半钻石巧克力盒（用于制作巧克力硅胶模具），以及一个激光切割的心形木质礼盒，深棕色木材、橙色丝带和雕刻的马形图案。两件作品都把一种奢华品牌的标志性语言——橙色盒子、马术图案和把工艺当作艺术——转化为实体物件。"
        },
        metricsBig: [
            { num: "6", label: { en: "3D iterations", zh: "3D 迭代" } },
            { num: "3", label: { en: "Laser cut iterations", zh: "激光切割迭代" } },
            { num: "100%", label: { en: "Assembly success", zh: "组装成功" } }
        ],
        role: { en: "3D Designer / Product Designer", zh: "3D 设计师 / 产品设计师" },
        type: { en: "3D Print · Laser Cut", zh: "3D 打印 · 激光切割" },
        methods: { en: "Fusion 360 · 3D Printing · Laser Cutting · Iteration · Mirror Tool", zh: "Fusion 360 · 3D 打印 · 激光切割 · 迭代 · 镜像工具" },
        context: {
            en: "Two separate briefs both asked to translate a luxury brand identity into physical objects. The signature elements include the orange box (energy and luxury), equestrian motifs (brand history and DNA) and craft as art (every product is a work of art). The brand combines minimalism with elegance: products are not just practical but also carry the culture and spirit behind the brand. Our goal was to find a balance between simplicity and luxury, using low-key design to show ultimate craftsmanship and value. The packaging's main colour is dark brown, symbolising the stability and tradition of equestrian culture, with the classic orange ribbon adding a bright accent.",
            zh: "两个独立任务书都要求把一种奢华品牌的身份转化为实体物件。标志性元素包括橙色盒子（能量与奢华）、马术图案（品牌历史与 DNA）以及把工艺当作艺术（每件产品都是一件艺术品）。品牌的设计结合极简与优雅：产品不仅实用，也承载了品牌背后的文化与精神。我们的目标是在简约和奢华之间找到平衡，用低调的设计展现极致的工艺与价值。包装的主色是深棕色，象征马术文化的稳定与传统，经典橙色丝带则点缀出一抹亮色。"
        },
        research: {
            en: "Brand research revealed three core codes: the orange box (energy and luxury), equestrian motifs (brand history and DNA), and craft as art (every product is a work of art). Material research: 2 mm plywood plus PLA balances a luxury feel with manufacturability. Colour research: dark brown for the body (classic, calm), orange for ribbon and detail (brand signature). The heart shape was chosen because, unlike typical square or round chocolate boxes, it isn't rigid and has a touch of fun and personality, reflecting a distinctive brand personality in the premium business.",
            zh: "品牌研究揭示了三个核心语言：橙色盒子（能量与奢华）、马术图案（品牌历史与 DNA），以及把工艺当作艺术（每件产品都是一件艺术品）。材料研究：2 毫米胶合板加 PLA 在奢华感和可制造性之间取得平衡。色彩研究：深棕色用于盒身（经典、沉稳），橙色用于丝带和细节（品牌标志）。我们选择心形，是因为和常见的方形或圆形巧克力盒不同，它不刻板，带有一点趣味和个性，体现一种在高端市场中独特的品牌气质。"
        },
        quote: {
            en: "Constraints are part of the design.",
            zh: "约束本身也是设计的一部分。",
            attribution: { en: "— Project takeaway", zh: "— 项目总结" }
        },
        designDecisions: {
            en: "3D object: the initial plan was a horse-shaped chocolate box, which turned out to be impossible with available AI tools. We pivoted to a diamond shape, then discovered a full diamond couldn't be demoulded. We redesigned it as a half-diamond. For the laser-cut box, we used a heart shape and the mirror tool in Fusion 360 to ensure symmetry. The heart shape reflects a design philosophy of 'understated luxury and excellence in craftsmanship'. The rounded form gives a warm, gentle visual impact, complementing a distinctive orange and sophisticated aesthetic. The uniquely carved harness design on the case's face is elegant and layered, showing attention to detail. The whole design incorporates natural materials, classic hues and specific sculptures, reflecting luxury brand culture, exceptional manufacturing and understated simplicity.",
            zh: "3D 物件：最初的计划是做一个马形巧克力盒，但用现有的 AI 工具无法实现。我们转向钻石造型，随后又发现完整的钻石无法脱模，于是重新设计为半钻石。激光切割盒则使用了心形，并用 Fusion 360 的镜像工具确保左右对称。心形呼应了「低调奢华与卓越工艺」的设计理念。圆润的造型带来温暖柔和的视觉感受，和独特的橙色与精致美学相得益彰。盒面独特雕刻的马具图案优雅而有层次，展现了对细节的关注。整个设计融合了天然材料、经典色调和特定雕塑，体现了奢华品牌文化、卓越工艺和低调简约。"
        },
        sketches: {
            en: "The design process followed six stages: identifying needs, concept development, research, design optimisation, evaluation and further improvement. We used the mirror tool in Fusion 360 to guarantee left-right symmetry for the heart shape. Sketches explored multiple heart and diamond iterations. The heart shape was drawn using the mirror tool in Create Sketch: draw the left half with the Line and Spline tools, then mirror to the right. Circles were drawn with Center Diameter Circle. Irregular shapes used Rectangle plus Trim. Rectangles used the 2-point rectangle, then blender at the end.",
            zh: "设计流程遵循六个阶段：识别需求、概念发展、研究、设计优化、评估和进一步改进。我们使用 Fusion 360 的镜像工具确保心形的左右对称。草图探索了多个心形和钻石的迭代版本。心形使用 Create Sketch 里的镜像工具绘制：用直线和样条工具画出左半边，然后镜像到右边。圆形使用中心直径圆绘制。不规则形状使用矩形加修剪。矩形则使用两点矩形,最后全部结束了完成渲染。"
        },
        sketchImages: [
            "images/hermes-sketch-1.png",
            "images/hermes-sketch-2.png",
            "images/hermes-sketch-3.png",
            "images/hermes-sketch-4.png",
            "images/hermes-sketch-5.png",
            "images/hermes-sketch-6.png"
        ],
        // 👇 Hermes 保持单张海报图，绝不乱改（只有 1 张）
        finalImages: [
            "images/hermes-final-1.png"
        ],
        iterations: [
            { label: "Prototype A", title: { en: "Full diamond failed", zh: "全钻石——失败" }, desc: { en: "The first 3D prototype was a full diamond. It couldn't be demoulded. Manual adjustments failed and only made the deformations worse. This was a classic case of CAD versus manufacturing reality — what looks perfect on screen can be impossible to produce. We talked with teachers and accepted the suggestion to change to a half-diamond shape.", zh: "第一个 3D 原型是完整钻石，无法脱模。手动修复失败，反而让变形更严重。这是 CAD 与制造现实脱节的典型案例——屏幕上完美的东西，可能根本做不出来。我们和老师沟通后，接受了改成半钻石造型的建议。" } },
            { label: "Prototype B", title: { en: "Half diamond and heart gaps", zh: "半钻石和心形间隙" }, desc: { en: "Redesigned as a half-diamond, which demoulds successfully, but the facet angles were dull. For the laser-cut heart box, the first cut had visible gaps at the joints because the arrangement and size of tiny pieces weren't carefully corrected. Manual adjustments were futile and only made things worse. We improved the design drawings and cutting settings so tiny pieces were properly placed.", zh: "重新设计为半钻石，可以成功脱模，但切面角度暗淡。激光切割心形盒的第一版接缝处有明显间隙，因为小零件的排布和尺寸没有仔细校正。手动修复徒劳无功，反而让问题更严重。我们改进了设计图和切割设置，让小零件能正确排布。" } },
            { label: "Prototype C", title: { en: "Refined angles, logo and ribbon", zh: "优化角度、标志和丝带" }, desc: { en: "Final version: we adjusted the facet angles to get better light reflection and refined the mould process. Heart box: we added the horse logo and orange ribbon. The chocolate went through five or six rounds of iteration. The final half-diamond chocolate keeps the luxury positioning while being practical to produce. The heart box assembly achieved 100% success. Material choice (2 mm plywood plus PLA) balances luxury feel with manufacturability.", zh: "最终版：我们调整了切面角度，以获得更好的光线反射，并优化了模具工艺。心形盒：我们增加了马形标志和橙色丝带。巧克力经过了五六轮迭代。最终的半钻石巧克力既保持了奢华定位，又能实际生产。心形盒的组装达到 100% 成功。材料选择（2 毫米胶合板加 PLA）在奢华感和可制造性之间取得了平衡。" } }
        ],
        keyFindings: [
            { en: "A full diamond can't be demoulded — a classic example of CAD versus manufacturing reality. Changing to a half-diamond solved the problem while keeping the luxurious texture.", zh: "完整的钻石无法脱模——这是 CAD 与制造现实脱节的典型案例。改成半钻石后，问题解决了，同时保留了奢华质感。" },
            { en: "The mirror tool in Fusion 360 ensures perfect left-right symmetry, which is essential for the heart shape. Drawing the left half and mirroring it is faster and more accurate than drawing both sides.", zh: "Fusion 360 的镜像工具能确保完美的左右对称，这对心形来说非常重要。画半边再镜像，比两边都画要快，也更准确。" },
            { en: "Small cut pieces need careful arrangement — the first cut had visible gaps at the joints. Improving the design drawings and cutting settings solved this.", zh: "小的切割件需要仔细排布——第一版切割件的接缝处有明显间隙。改进设计图和切割设置后，问题就解决了。" },
            { en: "Facet angles matter for the luxury feel — dull angles lose the diamond illusion. Adjusting the angles improved light reflection and restored the luxurious texture.", zh: "切面角度会影响奢华感——暗淡的角度会破坏钻石的错觉。调整角度后，光线反射更好，奢华质感也回来了。" },
            { en: "Material choice (2 mm plywood plus PLA) balances luxury feel with manufacturability. The dark brown wood represents equestrian roots, and the orange ribbon is a signature hue.", zh: "材料选择（2 毫米胶合板加 PLA）在奢华感和可制造性之间取得了平衡。深棕色木材代表马术根源，橙色丝带则是标志色。" }
        ],
        final: {
            en: "Two finished objects: (1) a half-diamond chocolate box printed in PLA, used to create silicone moulds for chocolates. The half-diamond shape retains the visual impact of the diamond — colourful lustre and luxurious texture — while being demouldable. Five or six rounds of chocolate iteration achieved a smooth, glossy finish. (2) a laser-cut heart-shaped wooden box with dark brown wood, orange ribbon and a carved horse motif. The heart shape reflects an 'understated luxury' philosophy, and the rounded form gives a warm, gentle visual impact. The uniquely carved harness design on the case's face is elegant and layered. Assembly achieved 100% success. Both objects translate a luxury brand's signature codes — orange box, equestrian motifs and craft as art — into physical form.",
            zh: "两件成品：(1) 一个 PLA 打印的半钻石巧克力盒，用于制作巧克力硅胶模具。半钻石造型既保留了钻石的视觉冲击——多彩光泽和奢华质感——又能顺利脱模。经过五六轮巧克力迭代后，表面光滑亮泽。(2) 一个激光切割的心形木盒，深棕色木材、橙色丝带和雕刻的马形图案。心形呼应「低调奢华」的理念，圆润的造型带来温暖柔和的视觉感受。盒面独特雕刻的马具图案优雅而有层次。组装达到 100% 成功。两件作品都把一种奢华品牌的标志性语言——橙色盒子、马术图案和把工艺当作艺术——转化为实体形式。"
        },
        reflection: {
            en: "Constraints are part of the design. The final half-diamond chocolate keeps the luxury positioning while being practical to produce. The biggest lesson: iterate with materials, not just on screens. What looks perfect in CAD can be impossible to manufacture. The full-diamond failure taught us to prototype early and test with real materials. The heart box's first cut had visible gaps, and improving the design drawings and cutting settings solved it. Material choice (2 mm plywood plus PLA) balances luxury feel with manufacturability. Future work includes exploring more complex equestrian motifs and expanding the chocolate mould range.",
            zh: "约束本身也是设计的一部分。最终的半钻石巧克力既保持了奢华定位，又能实际生产。最大的收获：要和材料一起迭代，而不是只在屏幕上迭代。CAD 里看起来完美的东西，可能根本没法做出来。全钻石的失败教会我们尽早做原型、用真实材料测试。心形盒的第一版有明显间隙，改进设计图和切割设置后解决了问题。材料选择（2 毫米胶合板加 PLA）在奢华感和可制造性之间取得了平衡。未来的工作包括探索更复杂的马术图案，并扩展巧克力模具系列。"
        },
        demoLink: "#",
        hasPhone: false,
        phoneImage: "images/hermes-phone.png"
    }
};

/* CASE STUDY */
const casePanel = document.getElementById("casePanel");
const caseOverlay = document.getElementById("caseOverlay");
const caseClose = document.getElementById("caseClose");
const casePrev = document.getElementById("casePrev");
const caseNext = document.getElementById("caseNext");
const caseNumber = document.getElementById("caseNumber");
const caseCategory = document.getElementById("caseCategory");
const caseContent = document.getElementById("caseContent");
const caseProgressFill = document.getElementById("caseProgressFill");

let currentProject = null;
const projectOrder = ["fitfan", "mindscape", "petready", "petcarepal", "hermes"];

function renderCaseStudy() {
    if (!currentProject) return;
    const p = projectData[currentProject];
    if (!p) return;
    const lang = currentLanguage;

    caseNumber.textContent = p.number;
    caseCategory.textContent = p.category[lang];

    /* ---------- 首屏媒体 ---------- */
    const coverMediaHTML = (p.videos && p.videos.length) ? `
        <div class="case-video-slider">
            <div class="case-video-track">
                ${p.videos.map((v, i) => `
                    <div class="case-video-slide${i === 0 ? " active" : ""}">
                        <video controls muted playsinline preload="metadata">
                            <source src="${v}" type="video/mp4">
                        </video>
                    </div>
                `).join("")}
            </div>
            <button class="case-video-nav case-video-prev" aria-label="Previous video">←</button>
            <button class="case-video-nav case-video-next" aria-label="Next video">→</button>
            <div class="case-video-dots">
                ${p.videos.map((v, i) => `
                    <span class="case-video-dot${i === 0 ? " active" : ""}" data-index="${i}"></span>
                `).join("")}
            </div>
        </div>
    ` : `
        <div class="case-cover-image">
            <img src="images/${currentProject}-hero.png" alt="${p.title}">
            <div class="img-fallback">images/${currentProject}-hero.png</div>
        </div>
    `;

    const coverHTML = `
        <div class="case-cover">
            <span class="case-cover-tag">${p.number} · ${p.category[lang]}</span>
            <h1 class="case-cover-title">${p.title}</h1>
            <p class="case-cover-kicker">${p.kicker[lang]}</p>
            ${coverMediaHTML}
            <p class="case-cover-summary">${p.summary[lang]}</p>
            <div class="case-cover-stats">
                ${p.metricsBig.map((m) => `
                    <div class="case-cover-stat">
                        <span class="num">${m.num}</span>
                        <span class="label">${m.label[lang]}</span>
                    </div>
                `).join("")}
            </div>
            <div class="case-cover-meta">
                <div class="ccm-item"><span>${lang === "en" ? "Role" : "职责"}</span><strong>${p.role[lang]}</strong></div>
                <div class="ccm-item"><span>${lang === "en" ? "Type" : "类型"}</span><strong>${p.type[lang]}</strong></div>
                <div class="ccm-item"><span>${lang === "en" ? "Methods" : "方法"}</span><strong>${p.methods[lang]}</strong></div>
            </div>
            <div class="case-cover-hint">
                <span>${lang === "en" ? "Scroll for full case study" : "向下滚动查看完整案例"}</span>
                <div class="case-cover-hint-line"></div>
            </div>
        </div>
    `;

    const phoneBlock = p.hasPhone ? `
        <div class="case-phone-block">
            <div class="case-phone-copy">
                <h4>${lang === "en" ? "Mobile Experience" : "移动端体验"}</h4>
                <p>${lang === "en" ? "Tested across multiple rounds with real users. Full Figma prototype available." : "经过多轮真实用户测试，完整 Figma 原型可查看。"}</p>
                <div class="phone-tags">
                    <span>iPhone 15 Pro</span>
                    <span>iOS 17</span>
                    <span>Figma</span>
                </div>
                ${p.demoLink && p.demoLink !== "#" ? `
                    <a href="${p.demoLink}" target="_blank" rel="noopener" class="phone-proto-btn">
                        <span>${lang === "en" ? "View Prototype" : "打开原型"}</span>
                        <span>↗</span>
                    </a>
                ` : ""}
            </div>
            <div class="phone-mockup">
                <div class="phone-body">
                    <div class="phone-notch"></div>
                    <div class="phone-btn silent"></div>
                    <div class="phone-btn vol-up"></div>
                    <div class="phone-btn vol-down"></div>
                    <div class="phone-btn power"></div>
                    <div class="phone-screen">
                        <img src="${p.phoneImage}" alt="${p.title} mobile screen">
                        <div class="phone-fallback">${p.phoneImage}</div>
                    </div>
                </div>
            </div>
        </div>
    ` : "";

    /* ---------- 04 草图与构思 ---------- */
    let sketchImagesHTML = "";
    if (p.noSketchMedia) {
        sketchImagesHTML = "";
    } else if (p.sketchImages && p.sketchImages.length) {
        sketchImagesHTML = `
            <div class="case-video-slider" style="margin-top:24px;">
                <div class="case-video-track">
                    ${p.sketchImages.map((img, i) => `
                        <div class="case-video-slide${i === 0 ? " active" : ""}">
                            <img src="${img}" alt="${p.title} sketch ${i + 1}">
                            <div class="img-fallback">${img}</div>
                        </div>
                    `).join("")}
                </div>
                <button class="case-video-nav case-video-prev" aria-label="Previous image">←</button>
                <button class="case-video-nav case-video-next" aria-label="Next image">→</button>
                <div class="case-video-dots">
                    ${p.sketchImages.map((img, i) => `
                        <span class="case-video-dot${i === 0 ? " active" : ""}" data-index="${i}"></span>
                    `).join("")}
                </div>
            </div>
        `;
    } else {
        sketchImagesHTML = "";
    }

    const sketchVideoHTML = p.sketchVideo ? `
        <div class="sketch-video-block">
            <video controls muted playsinline preload="metadata">
                <source src="${p.sketchVideo}" type="video/mp4">
            </video>
        </div>
    ` : "";

    /* ---------- 05 用户旅程（仅当有 journeyImages 时渲染） ---------- */
    const hasJourney = Array.isArray(p.journeyImages) && p.journeyImages.length > 0;
    let journeyMediaHTML = "";
    if (hasJourney) {
        journeyMediaHTML = `
            <div class="case-video-slider" style="margin-top:24px;">
                <div class="case-video-track">
                    ${p.journeyImages.map((img, i) => `
                        <div class="case-video-slide${i === 0 ? " active" : ""}">
                            <img src="${img}" alt="${p.title} journey ${i + 1}">
                            <div class="img-fallback">${img}</div>
                        </div>
                    `).join("")}
                </div>
                <button class="case-video-nav case-video-prev" aria-label="Previous image">←</button>
                <button class="case-video-nav case-video-next" aria-label="Next image">→</button>
                <div class="case-video-dots">
                    ${p.journeyImages.map((img, i) => `
                        <span class="case-video-dot${i === 0 ? " active" : ""}" data-index="${i}"></span>
                    `).join("")}
                </div>
            </div>
        `;
    }

    /* ---------- 07 方案迭代：可选图片滑块 ---------- */
    const iterationSliderHTML = (p.iterationImages && p.iterationImages.length) ? `
        <div class="case-video-slider${currentProject === "petcarepal" ? " petcarepal-iteration-slider" : ""}" style="margin-top:24px;">
            <div class="case-video-track">
                ${p.iterationImages.map((img, i) => `
                    <div class="case-video-slide${i === 0 ? " active" : ""}">
                        <img src="${img}" alt="${p.title} iteration ${i + 1}">
                        <div class="img-fallback">${img}</div>
                    </div>
                `).join("")}
            </div>
            <button class="case-video-nav case-video-prev" aria-label="Previous image">←</button>
            <button class="case-video-nav case-video-next" aria-label="Next image">→</button>
            <div class="case-video-dots">
                ${p.iterationImages.map((img, i) => `
                    <span class="case-video-dot${i === 0 ? " active" : ""}" data-index="${i}"></span>
                `).join("")}
            </div>
        </div>
    ` : "";

    /* ---------- 动态区块编号 ---------- */
    let blockIdx = 0;
    const nextBlockNum = () => String(++blockIdx).padStart(2, "0");

    const contextNum = nextBlockNum();
    const researchNum = nextBlockNum();
    const quoteNum = p.quote ? nextBlockNum() : null;
    const sketchesNum = p.noSketchMedia ? null : nextBlockNum();
    const journeyNum = hasJourney ? nextBlockNum() : null;
    const keyFindingsNum = p.keyFindings ? nextBlockNum() : null;
    const iterationsNum = nextBlockNum();
    const finalNum = nextBlockNum();
    const reflectionNum = nextBlockNum();

    /* ---------- 各区块 HTML ---------- */
    const contextBlock = `
        <div class="case-block">
            <div class="case-block-label"><span class="num">${contextNum}</span><span class="line"></span><span>${lang === "en" ? "Context" : "背景"}</span></div>
            <h3>${lang === "en" ? "Why this problem, why now" : "为什么现在要解决这个问题"}</h3>
            <p>${p.context[lang]}</p>
        </div>
    `;

    const researchBlock = `
        <div class="case-block">
            <div class="case-block-label"><span class="num">${researchNum}</span><span class="line"></span><span>${lang === "en" ? "Research" : "研究"}</span></div>
            <h3>${lang === "en" ? "How we investigated" : "我们如何做研究"}</h3>
            <p>${p.research[lang]}</p>
            ${p.designDecisions ? `
                <div class="research-grid">
                    <div class="research-card">
                        <strong>${lang === "en" ? "Design decision" : "设计决策"}</strong>
                        <p>${p.designDecisions[lang]}</p>
                    </div>
                    <div class="research-card">
                        <strong>${lang === "en" ? "What changed" : "关键转变"}</strong>
                        <p>${p.iterations[1] ? p.iterations[1].desc[lang] : p.iterations[0].desc[lang]}</p>
                    </div>
                </div>
            ` : ""}
            ${p.researchMedia && p.researchMedia.length ? `
                <div class="case-video-slider" style="margin-top:24px;">
                    <div class="case-video-track">
                        ${p.researchMedia.map((m, i) => {
                            const isVideo = m.match(/\.(mp4|webm|ogg)$/i);
                            return `
                                <div class="case-video-slide${i === 0 ? " active" : ""}">
                                    ${isVideo
                                        ? `<video controls muted playsinline preload="metadata"><source src="${m}" type="video/mp4"></video>`
                                        : `<img src="${m}" alt="${p.title} research ${i + 1}" style="width:100%;height:100%;object-fit:contain;background:#000;">`
                                    }
                                </div>
                            `;
                        }).join("")}
                    </div>
                    <button class="case-video-nav case-video-prev" aria-label="Previous media">←</button>
                    <button class="case-video-nav case-video-next" aria-label="Next media">→</button>
                    <div class="case-video-dots">
                        ${p.researchMedia.map((m, i) => `
                            <span class="case-video-dot${i === 0 ? " active" : ""}" data-index="${i}"></span>
                        `).join("")}
                    </div>
                </div>
            ` : `
                <div class="case-image-block ${currentProject === "hermes" ? "poster-ratio" : ""}">
                    <img src="images/${currentProject}-research.png" alt="${p.title} research">
                    <div class="img-fallback">images/${currentProject}-research.png</div>
                </div>
            `}
        </div>
    `;

    const quoteBlock = p.quote ? `
        <div class="case-block">
            <div class="case-block-label"><span class="num">${quoteNum}</span><span class="line"></span><span>${lang === "en" ? "User voice" : "用户之声"}</span></div>
            <div class="case-quote">
                <p>"${p.quote[lang]}"</p>
                <span class="attribution">${p.quote.attribution[lang]}</span>
            </div>
        </div>
    ` : "";

    const sketchesBlock = p.noSketchMedia ? "" : `
        <div class="case-block">
            <div class="case-block-label">
                <span class="num">${sketchesNum}</span>
                <span class="line"></span>
                <span>${lang === "en" ? "Sketches & ideation" : "草图与构思"}</span>
            </div>
            <h3>${lang === "en" ? "From wide exploration to focused ideas" : "从广泛探索到聚焦想法"}</h3>
            <p>${p.sketches ? p.sketches[lang] : ""}</p>
            ${sketchImagesHTML}
            ${sketchVideoHTML}
        </div>
    `;

    const journeyBlock = hasJourney ? `
        <div class="case-block">
            <div class="case-block-label">
                <span class="num">${journeyNum}</span>
                <span class="line"></span>
                <span>${lang === "en" ? "User Testing" : "用户测试"}</span>
            </div>
            <h3>${p.journeyTitle ? p.journeyTitle[lang] : (lang === "en" ? "How users move through the product" : "用户在产品中的操作和反馈")}</h3>
            <p>${lang === "en" ? "This has captures user actions, touchpoints, thoughts, emotions, pain points and opportunities across all this scenes." : "记录了用户在使用产品时被采访时的反应"}</p>
            ${journeyMediaHTML}
        </div>
    ` : "";

    const keyFindingsBlock = p.keyFindings ? `
        <div class="case-block">
            <div class="case-block-label">
                <span class="num">${keyFindingsNum}</span>
                <span class="line"></span>
                <span>${lang === "en" ? "Key findings" : "测试关键发现"}</span>
            </div>
            <h3>${lang === "en" ? "What testing revealed" : "测试揭示了什么"}</h3>
            <ul class="case-findings-list">
                ${p.keyFindings.map((f, i) => `
                    <li>
                        <span class="finding-num">0${i + 1}</span>
                        <p>${f[lang]}</p>
                    </li>
                `).join("")}
            </ul>
        </div>
    ` : "";

    const iterationsBlock = `
        <div class="case-block">
            <div class="case-block-label">
                <span class="num">${iterationsNum}</span>
                <span class="line"></span>
                <span>${lang === "en" ? "Iterations" : "方案迭代"}</span>
            </div>
            <h3>${lang === "en" ? "From first prototype to final" : "从第一版原型到最终版"}</h3>
            <div class="case-process-strip">
                ${p.iterations.map((it, i) => `
                    <div class="process-step">
                        <span class="step-num">0${i + 1}</span>
                        <span class="step-label">${it.label}</span>
                    </div>
                `).join('<span class="step-arrow">→</span>')}
            </div>
            ${iterationSliderHTML}
            <div class="case-iterations">
                ${p.iterations.map((it, i) => `
                    <div class="case-iteration">
                        <span class="iter-label">0${i + 1} · ${it.label}</span>
                        <h5>${it.title[lang]}</h5>
                        <p>${it.desc[lang]}</p>
                    </div>
                `).join("")}
            </div>
        </div>
    `;

    /* ---------- 最终输出：铺满屏幕，单列纵向排列（一行一张） ---------- */
    const finalImages = (p.finalImages && p.finalImages.length)
        ? p.finalImages
        : [`images/${currentProject}-final-1.png`, `images/${currentProject}-final-2.png`];

    // 判断是否为 Diamond & Heart，如果是则加上 single-poster 类保持海报居中
    const isHermes = currentProject === 'hermes';
    const pairClass = isHermes ? 'case-image-pair single-poster' : 'case-image-pair';

    // 👇 新增：针对 PetReady 和 PetCarePal 增加 final-multiple 类名
    const isMultipleFinal = currentProject === 'petready' || currentProject === 'petcarepal';

    const finalBlock = `
        <div class="case-block">
            <div class="case-block-label">
                <span class="num">${finalNum}</span>
                <span class="line"></span>
                <span>${lang === "en" ? "Final output" : "最终输出"}</span>
            </div>
            <h3>${lang === "en" ? "What shipped" : "最终交付"}</h3>
            <p>${p.final[lang]}</p>
            ${p.finalVideos && p.finalVideos.length ? `
                <div class="case-video-slider" style="margin-top:24px;">
                    <div class="case-video-track">
                        ${p.finalVideos.map((v, i) => `
                            <div class="case-video-slide${i === 0 ? " active" : ""}">
                                <video controls muted playsinline preload="metadata">
                                    <source src="${v}" type="video/mp4">
                                </video>
                            </div>
                        `).join("")}
                    </div>
                    <button class="case-video-nav case-video-prev" aria-label="Previous video">←</button>
                    <button class="case-video-nav case-video-next" aria-label="Next video">→</button>
                    <div class="case-video-dots">
                        ${p.finalVideos.map((v, i) => `
                            <span class="case-video-dot${i === 0 ? " active" : ""}" data-index="${i}"></span>
                        `).join("")}
                    </div>
                </div>
            ` : `
                <div class="${pairClass} ${isMultipleFinal ? 'final-multiple' : ''}">
                    ${finalImages.map((img) => `
                        <div class="case-image-block">
                            <img src="${img}" alt="${p.title} final">
                            <div class="img-fallback">${img}</div>
                        </div>
                    `).join("")}
                </div>
            `}
        </div>
    `;

    const reflectionBlock = `
        <div class="case-block">
            <div class="case-block-label">
                <span class="num">${reflectionNum}</span>
                <span class="line"></span>
                <span>${lang === "en" ? "Reflection" : "设计总结"}</span>
            </div>
            <div class="case-reflection">
                <h3>${lang === "en" ? "What I learned" : "我学到了什么"}</h3>
                <p>${p.reflection[lang]}</p>
            </div>
        </div>
    `;

    caseContent.innerHTML = `
        ${coverHTML}

        <div class="case-detail-body">
            ${contextBlock}
            ${phoneBlock}
            ${researchBlock}
            ${quoteBlock}
            ${sketchesBlock}
            ${journeyBlock}
            ${keyFindingsBlock}
            ${iterationsBlock}
            ${finalBlock}
            ${reflectionBlock}
        </div>
    `;

    caseContent.querySelectorAll("img").forEach((img) => {
        img.addEventListener("error", () => {
            img.style.display = "none";
            const fallback = img.parentElement.querySelector(".img-fallback, .phone-fallback");
            if (fallback) fallback.style.opacity = "1";
        });
    });
}

/* =====================================
   CASE VIDEO SLIDER
===================================== */
function initCaseVideoSlider() {
    const sliders = caseContent.querySelectorAll(".case-video-slider");
    sliders.forEach((slider) => {
        const track = slider.querySelector(".case-video-track");
        if (!track) return;

        const slides = slider.querySelectorAll(".case-video-slide");
        const prevBtn = slider.querySelector(".case-video-prev");
        const nextBtn = slider.querySelector(".case-video-next");
        const dots = slider.querySelectorAll(".case-video-dot");

        let currentIndex = 0;
        const total = slides.length;
        if (total === 0) return;

        function goTo(index) {
            if (index < 0) index = total - 1;
            if (index >= total) index = 0;
            currentIndex = index;

            track.style.transform = `translateX(-${currentIndex * 100}%)`;

            dots.forEach((d, i) => {
                d.classList.toggle("active", i === currentIndex);
            });

            slides.forEach((slide, i) => {
                const v = slide.querySelector("video");
                if (v && i !== currentIndex) {
                    v.pause();
                    v.currentTime = 0;
                }
            });
        }

        prevBtn?.addEventListener("click", () => goTo(currentIndex - 1));
        nextBtn?.addEventListener("click", () => goTo(currentIndex + 1));

        dots.forEach((dot, i) => {
            dot.addEventListener("click", () => goTo(i));
        });

        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slider.addEventListener("touchend", (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) goTo(currentIndex + 1);
                else goTo(currentIndex - 1);
            }
        }, { passive: true });

        slider.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") goTo(currentIndex - 1);
            if (e.key === "ArrowRight") goTo(currentIndex + 1);
        });
    });
}

function openCaseStudy(projectName) {
    if (!projectData[projectName]) return;
    currentProject = projectName;
    renderCaseStudy();
    initCaseVideoSlider();
    casePanel.classList.add("active");
    caseOverlay.classList.add("active");
    document.body.classList.add("is-locked");
    casePanel.scrollTop = 0;
    updateCaseProgress();
}
function closeCaseStudy() {
    casePanel.classList.remove("active");
    caseOverlay.classList.remove("active");
    document.body.classList.remove("is-locked");
    currentProject = null;
}
function navigateCase(direction) {
    if (!currentProject) return;
    const currentIndex = projectOrder.indexOf(currentProject);
    if (currentIndex === -1) return;
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = projectOrder.length - 1;
    if (nextIndex >= projectOrder.length) nextIndex = 0;
    openCaseStudy(projectOrder[nextIndex]);
}
function updateCaseProgress() {
    if (!casePanel || !caseProgressFill) return;
    const scrollTop = casePanel.scrollTop;
    const scrollHeight = casePanel.scrollHeight - casePanel.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    caseProgressFill.style.width = `${progress}%`;
}
casePanel?.addEventListener("scroll", updateCaseProgress, { passive: true });

document.querySelectorAll(".work-card, .work-orbit-card").forEach((card) => {
    card.addEventListener("click", () => {
        const project = card.dataset.project;
        if (project) openCaseStudy(project);
    });
});

caseClose?.addEventListener("click", closeCaseStudy);
caseOverlay?.addEventListener("click", closeCaseStudy);
casePrev?.addEventListener("click", () => navigateCase(-1));
caseNext?.addEventListener("click", () => navigateCase(1));

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (casePanel.classList.contains("active")) closeCaseStudy();
        if (mobileMenu.classList.contains("active")) closeMobileMenu();
    }
    if (casePanel.classList.contains("active")) {
        if (event.key === "ArrowLeft") navigateCase(-1);
        if (event.key === "ArrowRight") navigateCase(1);
    }
});

/* ACTIVE NAV */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".main-nav a");
const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${id}`) link.classList.add("active");
        });
    });
}, { threshold: .25 });
sections.forEach((section) => navObserver.observe(section));

document.body.classList.add("page-ready");

});