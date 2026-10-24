/* DESIGNWEB — navigation, FAQ, form validation, EmailJS sending, and UX enhancements */
"use strict";

const EMAILJS_SERVICE_ID = "service_l1mm43t";
const EMAILJS_TEMPLATE_ID = "template_rtkfnqs";
// Replace this placeholder with the Public Key shown in your EmailJS account.
const EMAILJS_PUBLIC_KEY = "UXskMLTM-md5KqIQD";

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector("#main-nav");
  const navLinks = mainNav ? mainNav.querySelectorAll("a") : [];
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");
  const toast = document.querySelector("#toast");
  const year = document.querySelector("#current-year");
  const submitButton = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
  let toastTimer;

  if (year) year.textContent = String(new Date().getFullYear());

  function closeMenu() {
    if (!menuToggle || !mainNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "باز کردن منو");
    mainNav.classList.remove("open");
    document.body.classList.remove("menu-open");
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "باز کردن منو" : "بستن منو");
      mainNav.classList.toggle("open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    navLinks.forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (
        mainNav.classList.contains("open") &&
        !mainNav.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) closeMenu();
    });
  }

  // Clicking a service link selects that service in the contact form.
  document.querySelectorAll("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
      const select = document.querySelector("#service");
      if (!select) return;
      const requested = link.getAttribute("data-service");
      const matchingOption = Array.from(select.options).find((option) => option.textContent.trim() === requested);
      if (matchingOption) select.value = matchingOption.value || matchingOption.textContent;
    });
  });

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 4200);
  }

  function setFormMessage(message, type) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.classList.remove("error", "success");
    if (type) formStatus.classList.add(type);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        setFormMessage("لطفاً فیلدهای ضروری را بررسی کنید و اطلاعات معتبر وارد کنید.", "error");
        return;
      }

      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const service = String(formData.get("service") || "").trim();
      const projectMessage = String(formData.get("message") || "").trim();

      if (name.length < 2 || projectMessage.length < 10) {
        setFormMessage("نام باید حداقل ۲ نویسه و شرح پروژه حداقل ۱۰ نویسه داشته باشد.", "error");
        return;
      }

      if (!window.emailjs) {
        setFormMessage("کتابخانه ارسال ایمیل بارگذاری نشد. اتصال اینترنت و بارگذاری صفحه را بررسی کنید.", "error");
        return;
      }

      if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === "YOUR_EMAILJS_PUBLIC_KEY") {
        setFormMessage("برای فعال‌شدن ارسال، باید Public Key حساب EmailJS در فایل script.js وارد شود.", "error");
        return;
      }

      const time = new Date().toLocaleString("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short"
      });
      const title = `درخواست خدمات DESIGNWEB — ${service}`;
      const message = `خدمت موردنظر: ${service}\n\nشرح پروژه:\n${projectMessage}`;
      const templateParams = { name, email, time, title, message };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
      }
      setFormMessage("در حال ارسال درخواست شما…", "");

      try {
        await window.emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          { publicKey: EMAILJS_PUBLIC_KEY }
        );
        setFormMessage("درخواست شما با موفقیت ارسال شد. از تماس شما سپاسگزاریم.", "success");
        showToast("درخواست شما برای DESIGNWEB ارسال شد.");
        contactForm.reset();
      } catch (error) {
        console.error("EmailJS send failed:", error);
        setFormMessage("ارسال انجام نشد. لطفاً اتصال سرویس EmailJS و تنظیمات قالب را بررسی کنید و دوباره تلاش کنید.", "error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
        }
      }
    });
  }

  // Update the active navigation link as the user moves through the page.
  const observedSections = document.querySelectorAll("main section[id]");
  if ("IntersectionObserver" in window && observedSections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          if (active) link.classList.add("active");
          else link.classList.remove("active");
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
    observedSections.forEach((section) => sectionObserver.observe(section));
  }
});
