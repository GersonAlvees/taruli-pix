(function () {
  "use strict";

  const PIX_PAYLOAD = "00020126580014br.gov.bcb.pix013624daad0b-0d7e-47f6-be85-cd5c3d4ba0625204000053039865802BR5925TARULI COSMETICOS SOCIEDA6014RIO DE JANEIRO62070503***630415AC";
  const PIX_KEY = "24daad0b-0d7e-47f6-be85-cd5c3d4ba062";

  let toastTimeout = null;

  function showToast(message, type) {
    type = type || "success";

    const existing = document.querySelector(".toast-notification");
    if (existing) {
      existing.remove();
      if (toastTimeout) {
        clearTimeout(toastTimeout);
      }
    }

    const toast = document.createElement("div");
    toast.className = "toast-notification toast-" + type;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    const icon = document.createElement("span");
    icon.className = "toast-icon";
    icon.innerHTML = type === "success"
      ? '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
      : '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

    const messageEl = document.createElement("span");
    messageEl.className = "toast-message";

    const lines = String(message || "").split("\n");
    lines.forEach(function (line) {
      const lineEl = document.createElement("span");
      lineEl.className = "toast-message-line";
      lineEl.textContent = line;
      messageEl.appendChild(lineEl);
    });

    toast.appendChild(icon);
    toast.appendChild(messageEl);
    document.body.appendChild(toast);

    toastTimeout = setTimeout(function () {
      toast.classList.add("hide");
      setTimeout(function () {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 320);
    }, 3500);
  }

  function selectVisiblePixCode() {
    const pixCodeDisplay = document.getElementById("pix-code-display");
    if (!pixCodeDisplay) return false;

    const selection = window.getSelection();
    if (!selection) return false;

    const range = document.createRange();
    range.selectNodeContents(pixCodeDisplay);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }

  function copyWithExecCommand(text) {
    const tempInput = document.createElement("textarea");
    tempInput.style.position = "fixed";
    tempInput.style.left = "-9999px";
    tempInput.style.opacity = "0";
    tempInput.setAttribute("readonly", "");
    tempInput.value = text;
    document.body.appendChild(tempInput);

    let copied = false;
    try {
      tempInput.focus({ preventScroll: true });
      tempInput.select();
      tempInput.setSelectionRange(0, text.length);
      copied = document.execCommand("copy");
    } catch (err) {
      copied = false;
    }

    tempInput.remove();
    return copied;
  }

  async function handleCopy(text, toastText) {
    // Show toast immediately for instantaneous UX
    showToast(toastText);

    // Attempt navigator.clipboard with short timeout, fallback to execCommand
    let copied = false;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await Promise.race([
          navigator.clipboard.writeText(text),
          new Promise(function (_, reject) {
            setTimeout(function () { reject(new Error("timeout")); }, 250);
          })
        ]);
        copied = true;
      } catch (e) {
        copied = false;
      }
    }

    if (!copied) {
      copyWithExecCommand(text);
    }
  }

  function getPixKey() {
    const el = document.getElementById("payment-pix-key");
    if (el && el.textContent.trim()) {
      return el.textContent.trim();
    }
    return "41.200.471/0001-20";
  }

  window.copyPixPayload = function () {
    selectVisiblePixCode();
    handleCopy(PIX_PAYLOAD, "Código Pix copiado...\nCole no app do seu banco.");
  };

  window.copyPixKey = function () {
    const key = getPixKey();
    handleCopy(key, "Chave Pix copiada...\nCole no app do seu banco.");
  };

  function init() {
    const copyBtn = document.getElementById("copy-btn");
    const pixCodeDisplay = document.getElementById("pix-code-display");
    const copyKeyBtn = document.getElementById("copy-key-btn");
    const pixKeyDetail = document.getElementById("payment-pix-key");

    if (copyBtn) {
      copyBtn.addEventListener("click", window.copyPixPayload);
    }

    if (pixCodeDisplay) {
      pixCodeDisplay.addEventListener("click", window.copyPixPayload);
      pixCodeDisplay.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.copyPixPayload();
        }
      });
    }

    if (copyKeyBtn) {
      copyKeyBtn.addEventListener("click", window.copyPixKey);
    }

    if (pixKeyDetail) {
      pixKeyDetail.addEventListener("click", window.copyPixKey);
      pixKeyDetail.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.copyPixKey();
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();