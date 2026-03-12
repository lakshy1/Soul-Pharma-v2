(() => {
  const config = window.SoulChatbotConfig || {};
  const globalApiBase = window.SoulApiBase || "";
  const origin = window.location.origin;
  const isFile = window.location.protocol === "file:" || origin === "null";
  const apiBase =
    config.apiBaseUrl ||
    globalApiBase ||
    (isFile || origin.includes("localhost")
      ? "https://soul-pharma-v2.onrender.com"
      : origin);

  const root = document.createElement("div");
  root.className = "soul-chatbot";
  root.innerHTML = `
    <button class="soul-chatbot__fab" aria-label="Open SOUL AI chatbot">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2c3.9 0 7 2.69 7 6v3.5c0 .55.45 1 1 1h1v2h-2.5c-.4 0-.78-.15-1.06-.42l-1.52-1.46H8.08l-1.52 1.46c-.28.27-.66.42-1.06.42H3v-2h1c.55 0 1-.45 1-1V8c0-3.31 3.1-6 7-6zm-4 6h8V9H8V8zm0 3h8v1H8v-1zm-1.5 5h11a3.5 3.5 0 0 1-3.5 3.5h-4A3.5 3.5 0 0 1 6.5 16z" />
      </svg>
    </button>
    <div class="soul-chatbot__panel" role="dialog" aria-label="SOUL AI Chatbot">
      <div class="soul-chatbot__header">
        <div class="soul-chatbot__title">
          <h3>SOUL AI</h3>
          <p>Gemini-powered support</p>
        </div>
        <button class="soul-chatbot__close" aria-label="Close chatbot">&times;</button>
      </div>
      <div class="soul-chatbot__body">
        <div class="soul-chatbot__messages" role="log" aria-live="polite"></div>
      </div>
      <div class="soul-chatbot__composer">
        <div class="soul-chatbot__chips">
          <button class="soul-chatbot__chip" data-prompt="Tell me about Soul Pharma">About Soul Pharma</button>
          <button class="soul-chatbot__chip" data-prompt="Show the therapy portfolio and focus areas">Therapy Portfolio</button>
          <button class="soul-chatbot__chip" data-prompt="How can I contact Soul Pharma?">Contact Info</button>
        </div>
        <form class="soul-chatbot__form" autocomplete="off">
          <input class="soul-chatbot__input" type="text" placeholder="Ask anything about Soul Pharma" aria-label="Chat message" required />
          <button class="soul-chatbot__send" type="submit">Send</button>
        </form>
        <div class="soul-chatbot__hint">SOUL AI is polite, fast, and happy to help.</div>
      </div>
    </div>
  `;

  document.body.appendChild(root);

  const openBtn = root.querySelector(".soul-chatbot__fab");
  const panel = root.querySelector(".soul-chatbot__panel");
  const closeBtn = root.querySelector(".soul-chatbot__close");
  const form = root.querySelector(".soul-chatbot__form");
  const input = root.querySelector(".soul-chatbot__input");
  const messagesEl = root.querySelector(".soul-chatbot__messages");
  const chips = Array.from(root.querySelectorAll(".soul-chatbot__chip"));

  const state = {
    messages: [],
    busy: false,
  };

  const addMessage = (role, text) => {
    const bubble = document.createElement("div");
    bubble.className = `soul-chatbot__msg soul-chatbot__msg--${role}`;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    state.messages.push({ role: role === "bot" ? "assistant" : "user", content: text });
  };

  const addTyping = () => {
    const bubble = document.createElement("div");
    bubble.className = "soul-chatbot__msg soul-chatbot__msg--bot";
    bubble.innerHTML = `<span class="soul-chatbot__typing"><span></span><span></span><span></span></span>`;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  };

  const setBusy = (value) => {
    state.busy = value;
    input.disabled = value;
    form.querySelector("button").disabled = value;
  };

  const sendMessage = async (text) => {
    if (!text || state.busy) {
      return;
    }
    addMessage("user", text);
    input.value = "";
    setBusy(true);
    const typingBubble = addTyping();

    try {
      const response = await fetch(`${apiBase}/api/chatbot/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: state.messages }),
      });

      if (!response.ok) {
        let detail = "";
        try {
          const err = await response.json();
          detail = err?.detail || err?.message || "";
        } catch (e) {
          try {
            detail = await response.text();
          } catch (inner) {
            detail = "";
          }
        }
        const suffix = detail ? ` (${detail.slice(0, 140)})` : "";
        throw new Error(`Unable to reach SOUL AI${suffix}`);
      }

      const data = await response.json();
      typingBubble.remove();
      addMessage("bot", data.reply || "I am here to help. How can I assist?");
    } catch (error) {
      typingBubble.remove();
      addMessage(
        "bot",
        error?.message || "Sorry, I could not connect right now. Please try again in a moment."
      );
    } finally {
      setBusy(false);
    }
  };

  const openChat = () => {
    root.classList.add("is-open");
    input.focus();
  };

  const closeChat = () => {
    root.classList.remove("is-open");
  };

  openBtn.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);

  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeChat();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value.trim());
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      sendMessage(chip.dataset.prompt);
    });
  });

  addMessage(
    "bot",
    "Hello! I am SOUL AI. Ask me about Soul Pharma, products, careers, or how to contact the team."
  );
})();
