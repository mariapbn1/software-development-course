/* =========================
   GLOBAL CONFIGURATION
========================= */

const API_BASE = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     1. CONFIGURATION & UTILITIES
  ========================= */

  // Prevent XSS / HTML injection
  const escapeHtml = (str) =>
    String(str).replace(
      /[&<>"']/g,
      (s) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[s],
    );

  // Toast notifications
  const showToast = (msg) => {
    const toastEl = document.getElementById("appToast");

    if (toastEl) {
      const body = document.getElementById("toastBody");
      if (body) body.textContent = msg;
      new bootstrap.Toast(toastEl).show();
    } else {
      alert(msg);
    }
  };

/* =========================
     2. LOGIN (index.html)
  ========================= */

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username")?.value.trim();
      const password = document.getElementById("password")?.value;
      const alertEl = document.getElementById("loginAlert");

      try {
        const res = await fetch(`${API_BASE}/users/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
          const data = await res.json();

          // Fetch full user info to get role
          const usersRes = await fetch(`${API_BASE}/users/`);
          const users = await usersRes.json();
          const user = users.find(u => u.username === username);

const session = {
            token: data.token,
            username: username,
            role_name: user?.role_name || null,
            userId: user?.id || null,
          };
          sessionStorage.setItem("auth", JSON.stringify(session));

          // Redirect based on role
          if (session.role_name === "Admin") {
            window.location.href = "productos.html";
          } else {
            // Return to the page they came from, or default to catalogo
            const returnUrl = sessionStorage.getItem("returnUrl") || "catalogo.html";
            sessionStorage.removeItem("returnUrl");
            window.location.href = returnUrl;
          }
        } else {
          if (alertEl) {
            alertEl.textContent = "Usuario o contraseña incorrectos.";
            alertEl.classList.remove("d-none");
          }
        }
      } catch (err) {
        console.error("Login error:", err);
        if (alertEl) {
          alertEl.textContent = "Error: No hay conexión con el servidor.";
          alertEl.classList.remove("d-none");
        }
      }
    });
  }

  /* =========================
     3. ADMIN PRODUCTS & CRUD (productos.html)
  ========================= */

  const tbody = document.getElementById("productsTbody");

  if (tbody) {
    if (window.location.pathname.endsWith("productos.html")) {
      const auth = sessionStorage.getItem("auth");
      if (!auth) window.location.href = "index.html";
    }

    let allProducts = [];
    let editingProductId = null;

    const addProductBtn = document.getElementById("addProductBtn");

    if (addProductBtn) {
      addProductBtn.addEventListener("click", () => {
        editingProductId = null;

        document.getElementById("productForm")?.reset();

        const title = document.querySelector("#productModal .modal-title");
        if (title) title.textContent = "Nuevo Dispositivo";
      });
    }

    const renderTable = (data) => {
      tbody.innerHTML = data
        .map(
          (p) => `
<tr>

<td class="ps-4">${p.id}</td>

<td>
<a href="detalle.html?id=${p.id}" class="text-dark fw-bold text-decoration-none">
${escapeHtml(p.name)}
</a>
</td>

<td>${p.brand?.name || "-"}</td>

<td>${p.ram} GB</td>

<td>${p.storage} GB</td>

<td>${p.release_date}</td>

<td>${p.max_battery} mAh</td>

<td>${p.main_camera_res} MP</td>

<td>${p.selfie_camera_res} MP</td>

<td>${p.has_nfc ? "Sí" : "No"}</td>

<td>${p.has_headphone_jack ? "Sí" : "No"}</td>

<td>${p.color?.name || "-"}</td>

<td>${p.max_supported_network?.name || "-"}</td>

<td>${p.operating_system?.name || "-"}</td>

<td>
<img src="${p.product_image ? (p.product_image.startsWith("http") ? p.product_image : "http://127.0.0.1:8000/media/" + p.product_image) : ""}" style="height:40px;border-radius:6px;">
</td>

<td class="small text-muted" style="max-width:200px;">
${escapeHtml(p.synopsis || "")}
</td>

<td class="sticky-actions text-center">

<button class="btn btn-sm btn-outline-primary me-1"
onclick="prepareEdit(${p.id})">
Editar
</button>

<button class="btn btn-sm btn-outline-danger"
onclick="prepareDelete(${p.id}, '${escapeHtml(p.name)}')">
Eliminar
</button>

</td>

</tr>
`,
        )
        .join("");

      const totalCountEl = document.getElementById("totalCount");
      if (totalCountEl) totalCountEl.textContent = data.length;
    };

    const loadProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products/`);

        if (!res.ok) throw new Error("Error connecting to API");

        allProducts = await res.json();

        allProducts.sort((a, b) => a.id - b.id);

        renderTable(allProducts);
      } catch (err) {
        console.error("Load error:", err);
        showToast("Error: No se pudieron cargar los productos.");
      }
    };

    window.prepareEdit = (id) => {
      const product = allProducts.find((p) => p.id === id);
      if (!product) return;

      editingProductId = id;

      const title = document.querySelector("#productModal .modal-title");
      if (title) title.textContent = "Editar Dispositivo";

      document.getElementById("productName").value = product.name;

      document.getElementById("productRam").value = product.ram;
      document.getElementById("productStorage").value = product.storage;
      document.getElementById("productReleaseDate").value =
        product.release_date;
      populateAllDropdowns(product);
      document.getElementById("productBattery").value = product.max_battery;
      document.getElementById("productMainCam").value = product.main_camera_res;
      document.getElementById("productSelfieCam").value =
        product.selfie_camera_res;

      document.getElementById("productNfc").checked = product.has_nfc;
      document.getElementById("productJack").checked =
        product.has_headphone_jack;

      const preview = document.getElementById("productImagePreview");
      preview.src = product.product_image || "";
      preview.style.display = product.product_image ? "block" : "none";

      document.getElementById("productImageFile").value = "";
      document.getElementById("productDescription").value = product.synopsis;

      new bootstrap.Modal(document.getElementById("productModal")).show();
    };

    const fileInput = document.getElementById("productImageFile");
    if (fileInput) {
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
          const preview = document.getElementById("productImagePreview");
          preview.src = URL.createObjectURL(file);
          preview.style.display = "block";
        }
      });
    }

    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
      searchInput.oninput = (e) => {
        const term = e.target.value.toLowerCase();

        const filtered = allProducts.filter((p) =>
          p.name.toLowerCase().includes(term),
        );

        renderTable(filtered);
      };
    }

    const productForm = document.getElementById("productForm");

    if (productForm) {
      productForm.onsubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", document.getElementById("productName").value);
        formData.append(
          "brand",
          parseInt(document.getElementById("productBrand").value),
        );
        formData.append(
          "ram",
          parseInt(document.getElementById("productRam").value),
        );
        formData.append(
          "storage",
          parseInt(document.getElementById("productStorage").value),
        );
        formData.append(
          "max_battery",
          parseInt(document.getElementById("productBattery").value),
        );
        formData.append(
          "main_camera_res",
          parseFloat(document.getElementById("productMainCam").value),
        );
        formData.append(
          "selfie_camera_res",
          parseFloat(document.getElementById("productSelfieCam").value),
        );
        formData.append(
          "has_nfc",
          document.getElementById("productNfc").checked,
        );
        formData.append(
          "has_headphone_jack",
          document.getElementById("productJack").checked,
        );
        formData.append(
          "release_date",
          document.getElementById("productReleaseDate").value,
        );
        formData.append(
          "synopsis",
          document.getElementById("productDescription").value,
        );
        formData.append(
          "color",
          parseInt(document.getElementById("productColor").value),
        );
        formData.append(
          "max_supported_network",
          parseInt(document.getElementById("productNetwork").value),
        );
        formData.append(
          "operating_system",
          parseInt(document.getElementById("productOS").value),
        );

        const fileInput = document.getElementById("productImageFile");
        if (fileInput.files.length > 0) {
          formData.append("product_image", fileInput.files[0]);
        }

        try {
          const url = editingProductId
            ? `${API_BASE}/products/${editingProductId}/`
            : `${API_BASE}/products/`;

          const method = editingProductId ? "PATCH" : "POST";

          const res = await fetch(url, {
            method,
            body: formData, // No "headers" key here — removing it is intentional
          });

          if (res.ok) {
            bootstrap.Modal.getInstance(
              document.getElementById("productModal"),
            )?.hide();

            productForm.reset();

            editingProductId = null;

            showToast(
              method === "PATCH" ? "Producto actualizado" : "Producto guardado",
            );

            loadProducts();
          }
        } catch (err) {
          console.error(err);
          showToast("Error al conectar con la API.");
        }
      };
    }

    window.prepareDelete = (id, name) => {
      const idField = document.getElementById("deleteId");
      const namePreview = document.getElementById("deleteNamePreview");

      if (idField) idField.value = id;
      if (namePreview) namePreview.textContent = name;

      new bootstrap.Modal(document.getElementById("confirmDeleteModal")).show();
    };

    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    if (confirmDeleteBtn) {
      confirmDeleteBtn.onclick = async () => {
        const id = document.getElementById("deleteId").value;

        // If a simple entity delete was triggered, use its URL; otherwise default to products
        const url = simpleDeleteTarget
          ? simpleDeleteTarget.url
          : `${API_BASE}/products/${id}/`;

        const res = await fetch(url, { method: "DELETE" });

        if (res.ok || res.status === 204) {
          bootstrap.Modal.getInstance(
            document.getElementById("confirmDeleteModal"),
          )?.hide();

          if (simpleDeleteTarget) {
  showToast("Registro eliminado");
  if (simpleDeleteTarget.reloadFn) {
    simpleDeleteTarget.reloadFn();
  } else {
    loadSimpleEntity(simpleDeleteTarget.tbodyId);
  }
  simpleDeleteTarget = null;
} else {
            showToast("Producto eliminado");
            loadProducts();
          }
        }
      };
    }

    loadProducts();
  }

  /* =========================
     4. PRODUCT DETAILS & COMMENTS (detalle.html)
  ========================= */

  const commentsList = document.getElementById("commentsList");

  if (commentsList) {
    const productId = new URLSearchParams(window.location.search).get("id");

    const loadDetail = async () => {
      try {
        const res = await fetch(`${API_BASE}/products/`);
        const products = await res.json();

        const p = products.find((x) => x.id == productId);

        if (!p) return;

        document.getElementById("pName").textContent = p.name;
        document.getElementById("breadcrumbProduct").textContent = p.name;

        document.getElementById("pImg").src = p.product_image
          ? p.product_image.startsWith("http")
            ? p.product_image
            : "http://127.0.0.1:8000/media/" + p.product_image
          : "https://via.placeholder.com/400x300?text=Sin+imagen";
        document.getElementById("pSynopsis").textContent = p.synopsis;

        document.getElementById("pRam").textContent = `${p.ram} GB`;
        document.getElementById("pStorage").textContent = `${p.storage} GB`;
        document.getElementById("pBattery").textContent =
          `${p.max_battery} mAh`;

        document.getElementById("pCam").textContent = `${p.main_camera_res} MP`;
        document.getElementById("pSelfieCam").textContent =
          `${p.selfie_camera_res} MP`;

        document.getElementById("pNfc").textContent = p.has_nfc ? "SÍ" : "NO";
        document.getElementById("pJack").textContent = p.has_headphone_jack
          ? "SÍ"
          : "NO";

        document.getElementById("pDate").textContent = p.release_date;

        document.getElementById("pBrand").textContent = p.brand.name;
        document.getElementById("pColor").textContent = p.color.name;
        document.getElementById("pOS").textContent = p.operating_system.name;
        document.getElementById("pNetwork").textContent =
          p.max_supported_network.name;
      } catch (err) {
        console.error("Error loading product detail:", err);
        showToast("No se pudo cargar el producto");
      }
    };

    const loadComments = async () => {
      try {
        const res = await fetch(`${API_BASE}/comments/`);

        const allComments = await res.json();

        const filtered = allComments.filter((c) => c.product == productId);

        commentsList.innerHTML =
          filtered
            .map(
              (c) => `
<div class="card mb-2 p-2 shadow-sm border-0 small bg-light">
<strong>${escapeHtml(c.user_username || c.user)}</strong>
<span class="text-muted small ms-2">${c.date}</span>
<p class="mb-0 text-muted">${escapeHtml(c.comment)}</p>
</div>
`,
            )
            .reverse()
            .join("") ||
          '<p class="text-center small text-muted py-4">No hay comentarios. Sé el primero!</p>';
      } catch (err) {
        console.error("Error loading comments:", err);
      }
    };

    const commentForm = document.getElementById("commentForm");

    if (commentForm) {
      commentForm.onsubmit = async (e) => {
        e.preventDefault();

        const auth = sessionStorage.getItem("auth");

// If user is not logged in → save comment and redirect to login
        if (!auth) {
          const commentText = document.getElementById("cText").value.trim();
          if (commentText) {
            sessionStorage.setItem("pendingComment", commentText);
            sessionStorage.setItem("pendingCommentProduct", productId);
          }
          const loginModal = new bootstrap.Modal(
            document.getElementById("loginModal"),
          );
          loginModal.show();
          return;
        }

        const userData = JSON.parse(auth);

const payload = {
          user: userData.userId,
          comment: document.getElementById("cText").value.trim(),
          product: parseInt(productId),
        };

        try {
          const res = await fetch(`${API_BASE}/comments/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            commentForm.reset();

            showToast("Comentario publicado");

            loadComments();
          }
        } catch (err) {
          console.error("Error posting comment:", err);

          showToast("No se pudo enviar el comentario");
        }
      };
    }

loadDetail();
    loadComments();

// If returning from login with a pending comment, resubmit it
    (async () => {
      const pendingComment = sessionStorage.getItem("pendingComment");
      const pendingProduct = sessionStorage.getItem("pendingCommentProduct");
      const auth = sessionStorage.getItem("auth");

      if (pendingComment && pendingProduct == productId && auth) {
        sessionStorage.removeItem("pendingComment");
        sessionStorage.removeItem("pendingCommentProduct");

        const userData = JSON.parse(auth);
const payload = {
          user: userData.userId,
          comment: pendingComment,
          product: parseInt(productId),
        };

        try {
          const res = await fetch(`${API_BASE}/comments/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            showToast("Comentario publicado");
            loadComments();
          }
        } catch (err) {
          console.error("Error posting pending comment:", err);
        }
      }
    })();
  }

  /* =========================
     5. LOGOUT BUTTON
  ========================= */

const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    const auth = sessionStorage.getItem("auth");
    const session = auth ? JSON.parse(auth) : null;
    const isProductosPage = window.location.pathname.endsWith("productos.html");

    // Show session indicator on catalogo and detalle pages
    const sessionIndicator = document.getElementById("sessionIndicator");
    if (sessionIndicator && session) {
      sessionIndicator.textContent = session.username;
      sessionIndicator.closest(".session-wrapper")?.classList.remove("d-none");
    }

    logoutBtn.onclick = () => {
      sessionStorage.clear();
      if (isProductosPage) {
        window.location.href = "index.html";
      } else {
        // Just clear session and update UI, stay on the page
        const wrapper = logoutBtn.closest(".session-wrapper");
        if (wrapper) wrapper.classList.add("d-none");
        // Show a logged-out indicator
        const indicator = document.getElementById("sessionIndicator");
        if (indicator) indicator.textContent = "";
        logoutBtn.disabled = true;
        logoutBtn.textContent = "Sesión cerrada";
      }
    };
  }

  /* =========================
     6. REPORT GENERATOR
  ========================= */

  const generateReportBtn = document.getElementById("generateReportBtn");

  if (generateReportBtn) {
    generateReportBtn.addEventListener("click", function () {
      const type = document.getElementById("reportType").value;
      const format = document.getElementById("reportFormat").value;

      const url = `http://127.0.0.1:8000/api/reports/generate-reports?type=${type}&formate=${format}`;

      window.open(url, "_blank");
    });
  }

  /* =========================
     7. LOGIN MODAL REDIRECTS
  ========================= */

  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");

if (registerBtn) {
  registerBtn.addEventListener("click", () => {
    sessionStorage.setItem("returnUrl", window.location.href);
    window.location.href = "registro.html";
  });
} 

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    // Save current page so login can return here
    sessionStorage.setItem("returnUrl", window.location.href);
    window.location.href = "index.html";
  });
}

  /* =========================
     8. SIMPLE ENTITY CRUD
     (Brands, OS, Networks, Colors)
  ========================= */

  // Config map: links each tbody ID to its endpoint and modal input IDs
  const entityConfigs = {
    brandsTbody: {
      endpoint: `${API_BASE}/products/brands/`,
      modalId: "brandModal",
      formId: "brandForm",
      inputId: "brandName",
      titleEl: null, // modal title stays static ("Nueva Marca" / "Editar Marca")
      label: "Marca",
      tabBtnSel: '[data-bs-target="#marcasTab"]',
    },
    osTbody: {
      endpoint: `${API_BASE}/products/operating-systems/`,
      modalId: "osModal",
      formId: "osForm",
      inputId: "osName",
      label: "Sistema Operativo",
      tabBtnSel: '[data-bs-target="#osTab"]',
    },
    networksTbody: {
      endpoint: `${API_BASE}/products/networks/`,
      modalId: "networkModal",
      formId: "networkForm",
      inputId: "networkName",
      label: "Red",
      tabBtnSel: '[data-bs-target="#redesTab"]',
    },
    colorsTbody: {
      endpoint: `${API_BASE}/products/colors/`,
      modalId: "colorModal",
      formId: "colorForm",
      inputId: "colorName",
      label: "Color",
      tabBtnSel: '[data-bs-target="#coloresTab"]',
    },
  };

  // Track which entity is being edited per table
  const editingIds = {
    brandsTbody: null,
    osTbody: null,
    networksTbody: null,
    colorsTbody: null,
  };

  const renderSimpleTable = (tbodyId, data) => {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const { endpoint } = entityConfigs[tbodyId];
const sorted = [...data].sort((a, b) => a.id - b.id);
    tbody.innerHTML = sorted
      .map(
        (item) => `
    <tr>
      <td class="ps-4">${item.id}</td>
      <td>${escapeHtml(item.name)}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1"
          onclick="openSimpleEdit('${tbodyId}', ${item.id}, '${escapeHtml(item.name)}')">
          Editar
        </button>
        <button class="btn btn-sm btn-outline-danger"
          onclick="prepareSimpleDelete(${item.id}, '${escapeHtml(item.name)}', '${tbodyId}')">
          Eliminar
        </button>
      </td>
    </tr>
  `,
      )
      .join("");
  };

  const loadSimpleEntity = async (tbodyId) => {
    try {
      const { endpoint } = entityConfigs[tbodyId];
      const res = await fetch(endpoint);
      const data = await res.json();
      renderSimpleTable(tbodyId, data);
    } catch (err) {
      console.error(`Error loading ${tbodyId}:`, err);
      showToast("Error al cargar los datos.");
    }
  };

  // Called from inline onclick — opens the modal pre-filled for editing
  window.openSimpleEdit = (tbodyId, id, name) => {
    const { modalId, inputId, label } = entityConfigs[tbodyId];
    editingIds[tbodyId] = id;
    const modalEl = document.getElementById(modalId);
    // Update modal title to reflect edit mode
    const titleEl = modalEl.querySelector(".modal-title");
    if (titleEl) titleEl.textContent = `Editar ${label}`;
    document.getElementById(inputId).value = name;
    new bootstrap.Modal(modalEl).show();
  };

  // Wire up each form's submit
  Object.entries(entityConfigs).forEach(([tbodyId, cfg]) => {
    const form = document.getElementById(cfg.formId);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById(cfg.inputId).value.trim();
      if (!name) return;

      const editingId = editingIds[tbodyId];
      const url = editingId ? `${cfg.endpoint}${editingId}/` : cfg.endpoint;
      const method = editingId ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (res.ok) {
          bootstrap.Modal.getInstance(
            document.getElementById(cfg.modalId),
          )?.hide();
          form.reset();
          editingIds[tbodyId] = null;
          // Reset modal title back to "Nueva …"
          const titleEl = document
            .getElementById(cfg.modalId)
            .querySelector(".modal-title");
          if (titleEl) titleEl.textContent = `Nueva ${cfg.label}`;
          showToast(editingId ? "Registro actualizado" : "Registro creado");
          loadSimpleEntity(tbodyId);
        }
      } catch (err) {
        console.error(err);
        showToast("Error al conectar con la API.");
      }
    });

    // Reset editing state when modal is closed without saving
    document
      .getElementById(cfg.modalId)
      .addEventListener("hidden.bs.modal", () => {
        editingIds[tbodyId] = null;
        form.reset();
        const titleEl = document
          .getElementById(cfg.modalId)
          .querySelector(".modal-title");
        if (titleEl) titleEl.textContent = `Nueva ${cfg.label}`;
      });
  });

  // Delete — reuses the existing confirmDeleteModal already in the HTML
  // but we need to know which table to reload afterward
  let simpleDeleteTarget = null; // { endpoint, tbodyId }

  window.prepareSimpleDelete = (id, name, tbodyId) => {
    const { endpoint } = entityConfigs[tbodyId];
    simpleDeleteTarget = { url: `${endpoint}${id}/`, tbodyId };

    // Reuse the existing modal fields
    document.getElementById("deleteNamePreview").textContent = name;
    document.getElementById("deleteId").value = id;

    new bootstrap.Modal(document.getElementById("confirmDeleteModal")).show();
  };

  // Load each table when its tab is activated
  Object.entries(entityConfigs).forEach(([tbodyId, cfg]) => {
    const tabBtn = document.querySelector(cfg.tabBtnSel);
    if (tabBtn) {
      tabBtn.addEventListener("shown.bs.tab", () => loadSimpleEntity(tbodyId));
    }
  });

  /* =========================
     9. PRODUCT FORM DROPDOWNS
     (Brand, OS, Network, Color)
  ========================= */

  const dropdownConfigs = [
    {
      selectId: "productBrand",
      endpoint: `${API_BASE}/products/brands/`,
      label: "Marca",
    },
    {
      selectId: "productOS",
      endpoint: `${API_BASE}/products/operating-systems/`,
      label: "Sistema Operativo",
    },
    {
      selectId: "productNetwork",
      endpoint: `${API_BASE}/products/networks/`,
      label: "Red",
    },
    {
      selectId: "productColor",
      endpoint: `${API_BASE}/products/colors/`,
      label: "Color",
    },
  ];

  const populateDropdown = async (selectId, endpoint, selectedId = null) => {
    const selectEl = document.getElementById(selectId);
    if (!selectEl) return;

    try {
      const res = await fetch(endpoint);
      const data = await res.json();

      selectEl.innerHTML =
        `<option value="">-- Seleccionar --</option>` +
        data
          .map(
            (item) =>
              `<option value="${item.id}" ${item.id == selectedId ? "selected" : ""}>${escapeHtml(item.name)}</option>`,
          )
          .join("") +
        `<option value="__new__">+ Agregar nueva opción...</option>`;
    } catch (err) {
      console.error(`Error loading dropdown ${selectId}:`, err);
    }
  };

  const populateAllDropdowns = async (product = null) => {
    await populateDropdown(
      "productBrand",
      `${API_BASE}/products/brands/`,
      product?.brand_id ?? product?.brand,
    );
    await populateDropdown(
      "productOS",
      `${API_BASE}/products/operating-systems/`,
      product?.operating_system_id ?? product?.operating_system,
    );
    await populateDropdown(
      "productNetwork",
      `${API_BASE}/products/networks/`,
      product?.max_supported_network_id ?? product?.max_supported_network,
    );
    await populateDropdown(
      "productColor",
      `${API_BASE}/products/colors/`,
      product?.color_id ?? product?.color,
    );
  };

  // Tracks which dropdown triggered a quick-create
  let quickCreateTarget = null;

  // Listen for "add new" selection on all 4 dropdowns
  dropdownConfigs.forEach((cfg) => {
    const selectEl = document.getElementById(cfg.selectId);
    if (!selectEl) return;

    selectEl.addEventListener("change", (e) => {
      if (e.target.value !== "__new__") return;

      quickCreateTarget = cfg;
      document.getElementById("quickCreateTitle").textContent =
        `Nueva ${cfg.label}`;
      document.getElementById("quickCreateName").value = "";

      new bootstrap.Modal(document.getElementById("quickCreateModal")).show();

      // Revert to blank while user fills the form
      selectEl.value = "";
    });
  });

  // Save the new item and auto-select it in the dropdown
  document
    .getElementById("quickCreateSaveBtn")
    ?.addEventListener("click", async () => {
      const name = document.getElementById("quickCreateName").value.trim();
      if (!name || !quickCreateTarget) return;

      try {
        const res = await fetch(quickCreateTarget.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (res.ok) {
          const created = await res.json();

          bootstrap.Modal.getInstance(
            document.getElementById("quickCreateModal"),
          )?.hide();

          // Reload the dropdown and auto-select the new item
          await populateDropdown(
            quickCreateTarget.selectId,
            quickCreateTarget.endpoint,
            created.id,
          );

          showToast(`"${name}" creado y seleccionado`);
          quickCreateTarget = null;
        }
      } catch (err) {
        console.error(err);
        showToast("Error al crear el registro.");
      }
    });

  // Populate dropdowns when the product modal opens (for both add and edit)
  document
    .getElementById("productModal")
    ?.addEventListener("show.bs.modal", () => {
      populateAllDropdowns();
    });

/* =========================
   10. USERS CRUD (usuariosTab)
========================= */

const usersTbody = document.getElementById("usersTbody");

if (usersTbody) {

  let allUsers = [];
  let editingUserId = null;

  const populateRoleDropdown = async (selectedId = null) => {
    const selectEl = document.getElementById("userRole");
    if (!selectEl) return;
    try {
      const res = await fetch(`${API_BASE}/roles/`);
      const data = await res.json();
      selectEl.innerHTML =
        `<option value="">-- Seleccionar rol --</option>` +
        data.map(r =>
          `<option value="${r.id}" ${r.id == selectedId ? "selected" : ""}>${escapeHtml(r.name)}</option>`
        ).join("");
    } catch (err) {
      console.error("Error loading roles:", err);
      showToast("Error al cargar los roles.");
    }
  };

  const renderUsersTable = (data) => {
    const sorted = [...data].sort((a, b) => a.id - b.id);
    usersTbody.innerHTML = sorted.map(u => `
      <tr>
        <td class="ps-4">${u.id}</td>
        <td>${escapeHtml(u.username)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.role_name || "-")}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-primary me-1"
            onclick="prepareEditUser(${u.id})">
            Editar
          </button>
          <button class="btn btn-sm btn-outline-danger"
            onclick="prepareDeleteUser(${u.id}, '${escapeHtml(u.username)}')">
            Eliminar
          </button>
        </td>
      </tr>
    `).join("");
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/`);
      allUsers = await res.json();
      renderUsersTable(allUsers);
    } catch (err) {
      console.error("Error loading users:", err);
      showToast("Error al cargar los usuarios.");
    }
  };

  // Reset modal for CREATE when "Nuevo Usuario" button is clicked
  document.querySelector('[data-bs-target="#userModal"]')
    ?.addEventListener("click", () => {
      editingUserId = null;
      document.getElementById("userForm").reset();
      document.getElementById("userModalTitle").textContent = "Nuevo Usuario";
      document.getElementById("userPasswordHint").classList.add("d-none");
      populateRoleDropdown();
    });

  // Open modal for EDIT
  window.prepareEditUser = (id) => {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;

    editingUserId = id;
    document.getElementById("userModalTitle").textContent = "Editar Usuario";
    document.getElementById("userPasswordHint").classList.remove("d-none");
    document.getElementById("userName").value = user.username;
    document.getElementById("userEmail").value = user.email;
    document.getElementById("userPassword").value = "";
    populateRoleDropdown(user.role);

    new bootstrap.Modal(document.getElementById("userModal")).show();
  };

  // Save (create or update)
  document.getElementById("userForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const roleValue = document.getElementById("userRole").value;
    if (!roleValue) {
      showToast("Por favor selecciona un rol.");
      return;
    }

    const password = document.getElementById("userPassword").value;

    const payload = {
      username: document.getElementById("userName").value.trim(),
      email: document.getElementById("userEmail").value.trim(),
      role: parseInt(roleValue),
    };

    // Only send password if filled in
    if (password) payload.password = password;

    const url = editingUserId
      ? `${API_BASE}/users/${editingUserId}/`
      : `${API_BASE}/users/`;
    const method = editingUserId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        bootstrap.Modal.getInstance(
          document.getElementById("userModal")
        )?.hide();
        document.getElementById("userForm").reset();
        editingUserId = null;
        showToast(method === "PUT" ? "Usuario actualizado" : "Usuario creado");
        loadUsers();
      } else {
        const errData = await res.json();
        const firstError = Object.values(errData)?.[0]?.[0] || "Error al guardar.";
        showToast(firstError);
      }
    } catch (err) {
      console.error(err);
      showToast("Error al conectar con la API.");
    }
  });

  // Delete
  window.prepareDeleteUser = (id, name) => {
    document.getElementById("deleteNamePreview").textContent = name;
    document.getElementById("deleteId").value = id;
    simpleDeleteTarget = {
      url: `${API_BASE}/users/${id}/`,
      tbodyId: null,
      reloadFn: loadUsers,
    };
    new bootstrap.Modal(document.getElementById("confirmDeleteModal")).show();
  };

  // Load when tab is activated
  document.querySelector('[data-bs-target="#usuariosTab"]')
    ?.addEventListener("shown.bs.tab", loadUsers);

}

/* =========================
     11. REGISTER (registro.html)
  ========================= */

  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    // Populate role dropdown
    const roleSelect = document.getElementById("registerRole");
    if (roleSelect) {
      fetch(`${API_BASE}/roles/`)
        .then(r => r.json())
        .then(data => {
          roleSelect.innerHTML =
            `<option value="">-- Seleccionar rol --</option>` +
            data.map(r => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join("");
        });
    }

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("registerUsername").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value;
      const alertEl = document.getElementById("registerAlert");
      const role = 2; // Always register as Viewer

      try {
        const res = await fetch(`${API_BASE}/users/register/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, role }),
        });
if (res.ok) {
          alertEl.classList.add("d-none");

          // Auto-login after registration
          const loginRes = await fetch(`${API_BASE}/users/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });

          if (loginRes.ok) {
            const loginData = await loginRes.json();

            const usersRes = await fetch(`${API_BASE}/users/`);
            const users = await usersRes.json();
            const user = users.find(u => u.username === username);

            const session = {
              token: loginData.token,
              username: username,
              role_name: user?.role_name || null,
              userId: user?.id || null,
            };
            sessionStorage.setItem("auth", JSON.stringify(session));
          }

          // Redirect back to where they came from (detalle page)
          const returnUrl = sessionStorage.getItem("returnUrl") || "catalogo.html";
          sessionStorage.removeItem("returnUrl");
          window.location.href = returnUrl;
        }else {
          const errData = await res.json();
          const firstError = Object.values(errData)?.[0]?.[0] || "No se pudo registrar el usuario.";
          alertEl.textContent = firstError;
          alertEl.classList.remove("d-none");
        }
      } catch (err) {
        console.error(err);
        alert("Error: No hay conexión con el servidor Django.");
      }
    });

    document.getElementById("cancelBtn")?.addEventListener("click", () => {
      window.history.back();
    });
  }




});
