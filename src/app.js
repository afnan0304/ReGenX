const STORAGE_KEY = "regenx-control-room-demo";
const ORDER_FLOW = ["requested", "assigned", "in_transit", "completed"];

const SITES = [
  {
    id: "site-amity",
    name: "Amity Hostel",
    type: "hostel",
    area: "Sector Beta",
    lat: 28.4682,
    lng: 77.5031,
    avgWasteKg: 120
  },
  {
    id: "site-lpu",
    name: "LPU Hostel GN",
    type: "hostel",
    area: "Knowledge Park",
    lat: 28.4748,
    lng: 77.4924,
    avgWasteKg: 95
  },
  {
    id: "site-gniot",
    name: "GNIOT Hostel",
    type: "hostel",
    area: "Delta",
    lat: 28.4712,
    lng: 77.4859,
    avgWasteKg: 110
  },
  {
    id: "site-venetia",
    name: "Grand Venetia Hotel",
    type: "hotel",
    area: "Omega",
    lat: 28.4594,
    lng: 77.5221,
    avgWasteKg: 180
  }
];

const RIDERS = [
  {
    id: "rider-ramesh",
    name: "Ramesh Kumar",
    vehicle: "GN-Tempo 1",
    lat: 28.4625,
    lng: 77.4989,
    basePay: 80,
    payPer100Kg: 40,
    qualityBonus: 20,
    totalEarnings: 220
  },
  {
    id: "rider-anita",
    name: "Anita Singh",
    vehicle: "GN-EV Van 4",
    lat: 28.4705,
    lng: 77.4871,
    basePay: 80,
    payPer100Kg: 40,
    qualityBonus: 20,
    totalEarnings: 180
  }
];

const PLANTS = [
  {
    id: "plant-b",
    name: "Plant B",
    area: "Beta Zone",
    capacityKg: 3200,
    currentLoadKg: 2944,
    temperature: 38,
    ph: 7.2,
    priceGas: 28,
    priceCompost: 8
  },
  {
    id: "plant-c",
    name: "Plant C",
    area: "Gamma Corridor",
    capacityKg: 2500,
    currentLoadKg: 1320,
    temperature: 36,
    ph: 7.1,
    priceGas: 28,
    priceCompost: 8
  },
  {
    id: "plant-d",
    name: "Plant D",
    area: "Tech Boulevard",
    capacityKg: 2100,
    currentLoadKg: 920,
    temperature: 35,
    ph: 7,
    priceGas: 28,
    priceCompost: 8
  }
];

const ORDERS = [
  {
    id: "order-gn2847",
    requestCode: "GN-2847",
    siteId: "site-amity",
    riderId: "rider-ramesh",
    plantId: "plant-b",
    status: "in_transit",
    estimatedWeightKg: 120,
    actualWeightKg: 0,
    qualityScore: 0,
    createdAt: "2026-04-25T08:20:00.000Z",
    etaMinutes: 18,
    wasteType: "food_waste_wet"
  },
  {
    id: "order-gn2851",
    requestCode: "GN-2851",
    siteId: "site-venetia",
    riderId: "rider-anita",
    plantId: "plant-c",
    status: "requested",
    estimatedWeightKg: 165,
    actualWeightKg: 0,
    qualityScore: 0,
    createdAt: "2026-04-25T09:05:00.000Z",
    etaMinutes: 0,
    wasteType: "food_waste_wet"
  },
  {
    id: "order-gn2839",
    requestCode: "GN-2839",
    siteId: "site-lpu",
    riderId: "rider-ramesh",
    plantId: "plant-c",
    status: "completed",
    estimatedWeightKg: 95,
    actualWeightKg: 102,
    qualityScore: 5,
    createdAt: "2026-04-25T06:45:00.000Z",
    etaMinutes: 0,
    wasteType: "kitchen_scraps"
  }
];

const ALERTS = [
  {
    id: "alert-1",
    severity: "critical",
    title: "Overflow watch",
    message: "Plant B is above 92 percent load. New trips should redirect to Plant C.",
    createdAt: "2026-04-25T09:10:00.000Z"
  },
  {
    id: "alert-2",
    severity: "medium",
    title: "Hotel spike",
    message: "Grand Venetia is producing a 15 percent volume spike for lunch service.",
    createdAt: "2026-04-25T08:55:00.000Z"
  }
];

function buildInitialState() {
  return {
    sites: structuredClone(SITES),
    riders: structuredClone(RIDERS),
    plants: structuredClone(PLANTS),
    orders: structuredClone(ORDERS),
    alerts: structuredClone(ALERTS)
  };
}

function loadState() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return buildInitialState();

  try {
    const parsed = JSON.parse(stored);
    return {
      sites: parsed.sites ?? structuredClone(SITES),
      riders: parsed.riders ?? structuredClone(RIDERS),
      plants: parsed.plants ?? structuredClone(PLANTS),
      orders: parsed.orders ?? structuredClone(ORDERS),
      alerts: parsed.alerts ?? structuredClone(ALERTS)
    };
  } catch {
    return buildInitialState();
  }
}

const state = {
  data: loadState(),
  ui: {
    selectedRiderId: "rider-ramesh",
    selectedPlantId: "plant-b",
    selectedOrderId: "order-gn2847",
    form: {
      siteId: "site-gniot",
      weightKg: 120,
      wasteType: "food_waste_wet"
    },
    pickupDraft: {
      actualWeightKg: 120,
      qualityScore: 4
    }
  }
};

const root = document.querySelector("#app");

function persist() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function randomId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function nextRequestCode(existingOrders) {
  const currentMax = existingOrders.reduce((max, order) => {
    const numeric = Number(order.requestCode.replace("GN-", ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 2847);

  return `GN-${currentMax + 1}`;
}

function findById(list, id) {
  return list.find((item) => item.id === id);
}

function distanceKm(from, to) {
  const earth = 6371;
  const lat = ((to.lat - from.lat) * Math.PI) / 180;
  const lng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(lat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(lng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earth * c;
}

function sortRouteOrders(orders, rider, sites) {
  const queue = [...orders];
  const route = [];
  let cursor = { lat: rider.lat, lng: rider.lng };

  while (queue.length > 0) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    queue.forEach((order, index) => {
      const site = findById(sites, order.siteId);
      if (!site) return;
      const km = distanceKm(cursor, site);
      if (km < bestDistance) {
        bestDistance = km;
        bestIndex = index;
      }
    });

    const [next] = queue.splice(bestIndex, 1);
    const nextSite = findById(sites, next.siteId);
    if (nextSite) {
      cursor = { lat: nextSite.lat, lng: nextSite.lng };
    }
    route.push(next);
  }

  return route;
}

function choosePlant(plants, weightKg, preferredPlantId) {
  const threshold = 0.92;
  const preferred = findById(plants, preferredPlantId) ?? plants[0];

  if (preferred && (preferred.currentLoadKg + weightKg) / preferred.capacityKg < threshold) {
    return { plant: preferred, redirected: false };
  }

  const alternative = [...plants]
    .filter((plant) => plant.id !== preferredPlantId)
    .sort(
      (left, right) =>
        left.currentLoadKg / left.capacityKg - right.currentLoadKg / right.capacityKg
    )[0];

  return { plant: alternative ?? preferred, redirected: Boolean(alternative) };
}

function buildMetrics() {
  const totalScheduledKg = state.data.orders.reduce(
    (sum, order) => sum + (order.actualWeightKg || order.estimatedWeightKg),
    0
  );
  const completedKg = state.data.orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + (order.actualWeightKg || order.estimatedWeightKg), 0);
  const gasM3 = completedKg * 0.075;
  const compostKg = completedKg * 0.18;
  const activeRiders = new Set(
    state.data.orders
      .filter((order) => order.status === "assigned" || order.status === "in_transit")
      .map((order) => order.riderId)
  ).size;

  return {
    totalScheduledKg,
    completedKg,
    gasM3,
    compostKg,
    co2OffsetTons: completedKg * 0.00064,
    activeRiders
  };
}

function pushAlert(alert) {
  state.data.alerts = [{ ...alert, id: randomId("alert") }, ...state.data.alerts].slice(0, 8);
}

function setSelectedOrder(orderId) {
  state.ui.selectedOrderId = orderId;
  const order = findById(state.data.orders, orderId);
  if (!order) return;
  state.ui.pickupDraft.actualWeightKg = order.actualWeightKg || order.estimatedWeightKg;
  state.ui.pickupDraft.qualityScore = order.qualityScore || 4;
}

function handleCreateRequest(event) {
  event.preventDefault();
  const weight = clamp(Number(state.ui.form.weightKg) || 0, 20, 350);
  const createdAt = new Date().toISOString();

  state.data.orders.unshift({
    id: randomId("order"),
    requestCode: nextRequestCode(state.data.orders),
    siteId: state.ui.form.siteId,
    riderId: state.ui.selectedRiderId,
    plantId: state.ui.selectedPlantId,
    status: "requested",
    estimatedWeightKg: weight,
    actualWeightKg: 0,
    qualityScore: 0,
    createdAt,
    etaMinutes: 0,
    wasteType: state.ui.form.wasteType
  });

  setSelectedOrder(state.data.orders[0].id);
  pushAlert({
    severity: "low",
    title: "New pickup request",
    message: `${findById(state.data.sites, state.ui.form.siteId)?.name ?? "A site"} submitted ${weight} kg for pickup.`,
    createdAt
  });

  persist();
  render();
}

function handleDispatch() {
  const requestedOrders = state.data.orders.filter((order) => order.status === "requested");
  if (requestedOrders.length === 0) return;

  const selectedRider = findById(state.data.riders, state.ui.selectedRiderId) ?? state.data.riders[0];
  const selectedPlant = findById(state.data.plants, state.ui.selectedPlantId) ?? state.data.plants[0];
  const totalWeight = requestedOrders.reduce((sum, order) => sum + order.estimatedWeightKg, 0);
  const routingChoice = choosePlant(state.data.plants, totalWeight, state.ui.selectedPlantId);
  const orderedStops = sortRouteOrders(requestedOrders, selectedRider, state.data.sites);
  let minutes = 14;

  state.data.orders = state.data.orders.map((order) => {
    const stopIndex = orderedStops.findIndex((item) => item.id === order.id);
    if (stopIndex === -1) return order;
    minutes += stopIndex === 0 ? 6 : 9;
    return {
      ...order,
      status: stopIndex === 0 ? "in_transit" : "assigned",
      riderId: state.ui.selectedRiderId,
      plantId: routingChoice.plant.id,
      etaMinutes: minutes
    };
  });

  state.data.plants = state.data.plants.map((plant) =>
    plant.id === routingChoice.plant.id
      ? { ...plant, currentLoadKg: plant.currentLoadKg + totalWeight }
      : plant
  );

  pushAlert({
    severity: routingChoice.redirected ? "critical" : "medium",
    title: routingChoice.redirected ? "Auto redirect engaged" : "AI route published",
    message: routingChoice.redirected
      ? `${selectedPlant.name} exceeded the safe buffer. Route sent to ${routingChoice.plant.name}.`
      : `${selectedRider.name} received ${requestedOrders.length} optimized stops ending at ${routingChoice.plant.name}.`,
    createdAt: new Date().toISOString()
  });

  persist();
  render();
}

function advanceOrder(orderId) {
  state.data.orders = state.data.orders.map((order) => {
    if (order.id !== orderId) return order;
    const currentIndex = ORDER_FLOW.indexOf(order.status);
    const nextStatus = ORDER_FLOW[Math.min(currentIndex + 1, ORDER_FLOW.length - 1)];
    return { ...order, status: nextStatus };
  });
  persist();
  render();
}

function confirmPickup() {
  const selectedOrder = findById(state.data.orders, state.ui.selectedOrderId);
  if (!selectedOrder) return;

  const actualWeightKg = clamp(Number(state.ui.pickupDraft.actualWeightKg) || 0, 20, 400);
  const qualityScore = clamp(Number(state.ui.pickupDraft.qualityScore) || 0, 1, 5);
  const rider = findById(state.data.riders, selectedOrder.riderId);
  const earningBoost =
    (rider?.basePay ?? 0) +
    Math.round((actualWeightKg / 100) * (rider?.payPer100Kg ?? 0)) +
    (qualityScore >= 4 ? rider?.qualityBonus ?? 0 : 0);

  state.data.orders = state.data.orders.map((order) =>
    order.id === selectedOrder.id
      ? {
          ...order,
          status: "completed",
          actualWeightKg,
          qualityScore,
          etaMinutes: 0
        }
      : order
  );

  state.data.riders = state.data.riders.map((item) =>
    item.id === selectedOrder.riderId
      ? { ...item, totalEarnings: item.totalEarnings + earningBoost }
      : item
  );

  pushAlert({
    severity: "low",
    title: "Pickup completed",
    message: `${selectedOrder.requestCode} closed at ${actualWeightKg} kg with quality score ${qualityScore}.`,
    createdAt: new Date().toISOString()
  });

  persist();
  render();
}

function updatePlantMetric(plantId, field, value) {
  state.data.plants = state.data.plants.map((plant) =>
    plant.id === plantId ? { ...plant, [field]: Number(value) } : plant
  );
  persist();
  render();
}

function runOverflowPrediction() {
  const selectedPlant = findById(state.data.plants, state.ui.selectedPlantId) ?? state.data.plants[0];
  const pendingOrders = state.data.orders.filter((order) => order.status !== "completed");
  const projectedLoad = Math.round(
    selectedPlant.currentLoadKg +
      pendingOrders
        .filter((order) => order.plantId === selectedPlant.id)
        .reduce((sum, order) => sum + order.estimatedWeightKg, 0) * 0.65
  );
  const projectedPercent = Math.round((projectedLoad / selectedPlant.capacityKg) * 100);

  pushAlert({
    severity: projectedPercent >= 92 ? "critical" : "medium",
    title: "Overflow forecast",
    message:
      projectedPercent >= 92
        ? `${selectedPlant.name} is projected to hit ${projectedPercent} percent capacity by 14:30.`
        : `${selectedPlant.name} remains stable at a projected ${projectedPercent} percent load.`,
    createdAt: new Date().toISOString()
  });

  persist();
  render();
}

function resetDemo() {
  state.data = buildInitialState();
  state.ui.selectedRiderId = "rider-ramesh";
  state.ui.selectedPlantId = "plant-b";
  setSelectedOrder("order-gn2847");
  persist();
  render();
}

function orderMarkup(order) {
  const site = findById(state.data.sites, order.siteId);
  const isActive = state.ui.selectedOrderId === order.id ? "order-item-active" : "";

  return `
    <button class="order-item ${isActive}" data-order-select="${order.id}">
      <div>
        <span class="status-pill status-${order.status}">${order.status.replace("_", " ")}</span>
        <strong>${order.requestCode}</strong>
        <p>${site?.name ?? "Unknown"} / ${order.estimatedWeightKg} kg</p>
      </div>
      <span class="time-stamp">${formatTime(order.createdAt)}</span>
    </button>
  `;
}

function routeMarkup(order, index) {
  const site = findById(state.data.sites, order.siteId);
  const plant = findById(state.data.plants, order.plantId);

  return `
    <div class="route-stop">
      <div class="route-marker">${index + 1}</div>
      <div>
        <strong>${site?.name ?? "Unknown stop"}</strong>
        <p>${order.estimatedWeightKg} kg -> ${plant?.name ?? "Plant"} / ETA ${order.etaMinutes || 0} min</p>
      </div>
      <button class="ghost-btn small-btn" data-advance-order="${order.id}">Advance</button>
    </div>
  `;
}

function alertMarkup(alert) {
  return `
    <article class="alert-item alert-${alert.severity}">
      <div>
        <span class="status-pill">${alert.severity}</span>
        <strong>${alert.title}</strong>
      </div>
      <p>${alert.message}</p>
      <span class="time-stamp">${formatTime(alert.createdAt)}</span>
    </article>
  `;
}

function render() {
  const metrics = buildMetrics();
  const selectedRider = findById(state.data.riders, state.ui.selectedRiderId) ?? state.data.riders[0];
  const selectedPlant = findById(state.data.plants, state.ui.selectedPlantId) ?? state.data.plants[0];
  const selectedOrder = findById(state.data.orders, state.ui.selectedOrderId) ?? state.data.orders[0];
  const routedOrders = sortRouteOrders(
    state.data.orders.filter(
      (order) =>
        order.riderId === state.ui.selectedRiderId &&
        (order.status === "assigned" || order.status === "in_transit")
    ),
    selectedRider,
    state.data.sites
  );
  const loadPercent = Math.round((selectedPlant.currentLoadKg / selectedPlant.capacityKg) * 100);

  root.innerHTML = `
    <div class="page-shell">
      <div class="page-glow page-glow-left"></div>
      <div class="page-glow page-glow-right"></div>

      <header class="hero-card">
        <div class="hero-copy">
          <div class="eyebrow">ReGenX // bio-waste control room</div>
          <h1>Dispatch organic waste before it becomes logistics waste.</h1>
          <p>
            This dashboard turns the PRD into a working operations console with AI-style route
            planning, overflow prediction, pickup confirmation, rider earnings, and plant
            monetization. It runs fully in the browser and is ready for Appwrite Sites deployment.
          </p>
          <div class="hero-actions">
            <button class="primary-btn" id="dispatch-route-btn">Publish AI route</button>
            <button class="ghost-btn" id="reset-demo-btn">Reset live demo</button>
          </div>
        </div>

        <div class="hero-panel">
          <div class="status-badge">Appwrite static deploy ready</div>
          <div class="hero-stats">
            <div>
              <span class="stat-label">Today scheduled</span>
              <strong>${Math.round(metrics.totalScheduledKg)} kg</strong>
            </div>
            <div>
              <span class="stat-label">Biogas value</span>
              <strong>INR ${Math.round(metrics.gasM3 * 28).toLocaleString()}</strong>
            </div>
            <div>
              <span class="stat-label">CO2 offset</span>
              <strong>${metrics.co2OffsetTons.toFixed(2)} t</strong>
            </div>
          </div>
        </div>
      </header>

      <section class="metric-grid">
        <article class="metric-card">
          <span>Waste scheduled</span>
          <strong>${Math.round(metrics.totalScheduledKg)} kg</strong>
          <p>Across hostels, hotels, and plant-bound requests for today.</p>
        </article>
        <article class="metric-card">
          <span>Completed pickups</span>
          <strong>${Math.round(metrics.completedKg)} kg</strong>
          <p>Actual weight confirmed by riders on completed requests.</p>
        </article>
        <article class="metric-card">
          <span>Biogas output</span>
          <strong>${metrics.gasM3.toFixed(1)} m3</strong>
          <p>Estimated from confirmed organic throughput.</p>
        </article>
        <article class="metric-card">
          <span>Active riders</span>
          <strong>${metrics.activeRiders}</strong>
          <p>Routes currently assigned or already in transit.</p>
        </article>
      </section>

      <main class="workspace-grid">
        <section class="panel-card">
          <div class="panel-heading">
            <div>
              <span class="panel-kicker">Ops intake</span>
              <h2>Pickup request studio</h2>
            </div>
            <span class="mono-chip">${state.data.orders.length} total orders</span>
          </div>

          <form class="request-form" id="request-form">
            <label>
              Waste source
              <select id="site-select">
                ${state.data.sites
                  .map(
                    (site) =>
                      `<option value="${site.id}" ${
                        site.id === state.ui.form.siteId ? "selected" : ""
                      }>${site.name} / ${site.area}</option>`
                  )
                  .join("")}
              </select>
            </label>

            <label>
              Estimated weight
              <input type="number" id="weight-input" min="20" max="350" value="${state.ui.form.weightKg}" />
            </label>

            <label>
              Waste type
              <select id="waste-type-select">
                <option value="food_waste_wet" ${
                  state.ui.form.wasteType === "food_waste_wet" ? "selected" : ""
                }>Food waste wet</option>
                <option value="kitchen_scraps" ${
                  state.ui.form.wasteType === "kitchen_scraps" ? "selected" : ""
                }>Kitchen scraps</option>
                <option value="mixed_organic" ${
                  state.ui.form.wasteType === "mixed_organic" ? "selected" : ""
                }>Mixed organic</option>
              </select>
            </label>

            <button class="primary-btn" type="submit">Create request</button>
          </form>

          <div class="subsection">
            <div class="subsection-header">
              <h3>Request stream</h3>
              <button class="ghost-btn small-btn" id="optimize-btn">Optimize pending queue</button>
            </div>
            <div class="order-list">
              ${state.data.orders.map((order) => orderMarkup(order)).join("")}
            </div>
          </div>
        </section>

        <section class="panel-card">
          <div class="panel-heading">
            <div>
              <span class="panel-kicker">Routing brain</span>
              <h2>Rider route and pickup confirmation</h2>
            </div>
            <select id="rider-select">
              ${state.data.riders
                .map(
                  (rider) =>
                    `<option value="${rider.id}" ${
                      rider.id === state.ui.selectedRiderId ? "selected" : ""
                    }>${rider.name}</option>`
                )
                .join("")}
            </select>
          </div>

          <div class="route-panel">
            <div class="route-summary">
              <div>
                <span class="stat-label">Vehicle</span>
                <strong>${selectedRider.vehicle}</strong>
              </div>
              <div>
                <span class="stat-label">Stops in queue</span>
                <strong>${routedOrders.length}</strong>
              </div>
              <div>
                <span class="stat-label">Earnings today</span>
                <strong>INR ${selectedRider.totalEarnings}</strong>
              </div>
            </div>

            <div class="route-list">
              ${
                routedOrders.length === 0
                  ? `<div class="empty-state">No live stops for this rider yet. Publish a route to begin.</div>`
                  : routedOrders.map((order, index) => routeMarkup(order, index)).join("")
              }
            </div>
          </div>

          <div class="subsection">
            <div class="subsection-header">
              <h3>Selected order</h3>
              <span class="mono-chip">${selectedOrder?.requestCode ?? "None"}</span>
            </div>
            ${
              selectedOrder
                ? `
                  <div class="pickup-editor">
                    <div class="editor-grid">
                      <label>
                        Actual weight
                        <input type="number" id="actual-weight-input" min="20" max="400" value="${
                          state.ui.pickupDraft.actualWeightKg
                        }" />
                      </label>
                      <label>
                        Quality score
                        <input type="range" id="quality-score-input" min="1" max="5" value="${
                          state.ui.pickupDraft.qualityScore
                        }" />
                        <span class="range-value" id="quality-score-value">${state.ui.pickupDraft.qualityScore}/5</span>
                      </label>
                    </div>

                    <div class="editor-actions">
                      <button class="primary-btn" id="confirm-pickup-btn">Confirm pickup</button>
                      <button class="ghost-btn" id="advance-selected-btn">Move to next status</button>
                    </div>
                  </div>
                `
                : `<div class="empty-state">Select an order to confirm pickup details.</div>`
            }
          </div>
        </section>

        <section class="panel-card">
          <div class="panel-heading">
            <div>
              <span class="panel-kicker">Plant operations</span>
              <h2>Capacity and monetization</h2>
            </div>
            <select id="plant-select">
              ${state.data.plants
                .map(
                  (plant) =>
                    `<option value="${plant.id}" ${
                      plant.id === state.ui.selectedPlantId ? "selected" : ""
                    }>${plant.name}</option>`
                )
                .join("")}
            </select>
          </div>

          <div class="plant-meter">
            <div class="meter-copy">
              <span class="stat-label">Current load</span>
              <strong>${loadPercent} percent</strong>
              <p>${selectedPlant.currentLoadKg} / ${selectedPlant.capacityKg} kg buffered at ${selectedPlant.area}.</p>
            </div>
            <div class="meter-track">
              <div class="meter-fill" style="width: ${loadPercent}%"></div>
            </div>
          </div>

          <div class="plant-controls">
            <label>
              Load buffer
              <input type="range" id="load-range" min="200" max="${selectedPlant.capacityKg}" value="${selectedPlant.currentLoadKg}" />
              <span class="range-value">${selectedPlant.currentLoadKg} kg</span>
            </label>
            <label>
              Temperature
              <input type="range" id="temperature-range" min="30" max="55" value="${selectedPlant.temperature}" />
              <span class="range-value">${selectedPlant.temperature} C</span>
            </label>
            <label>
              pH level
              <input type="range" id="ph-range" min="6" max="8" step="0.1" value="${selectedPlant.ph}" />
              <span class="range-value">${Number(selectedPlant.ph).toFixed(1)}</span>
            </label>
          </div>

          <div class="revenue-grid">
            <article>
              <span>Biogas value</span>
              <strong>INR ${Math.round(metrics.gasM3 * selectedPlant.priceGas)}</strong>
            </article>
            <article>
              <span>Compost value</span>
              <strong>INR ${Math.round(metrics.compostKg * selectedPlant.priceCompost)}</strong>
            </article>
          </div>

          <button class="primary-btn block-btn" id="forecast-btn">Forecast overflow window</button>
        </section>
      </main>

      <section class="bottom-grid">
        <section class="panel-card">
          <div class="panel-heading">
            <div>
              <span class="panel-kicker">Command feed</span>
              <h2>AI alerts and dispatch context</h2>
            </div>
          </div>
          <div class="alert-list">
            ${state.data.alerts.map((alert) => alertMarkup(alert)).join("")}
          </div>
        </section>

        <section class="panel-card">
          <div class="panel-heading">
            <div>
              <span class="panel-kicker">Deployment</span>
              <h2>Appwrite status</h2>
            </div>
            <span class="status-dot status-on"></span>
          </div>

          <div class="deployment-panel">
            <div class="deployment-line">
              <span>Site mode</span>
              <strong>Static SPA</strong>
            </div>
            <div class="deployment-line">
              <span>Deploy command</span>
              <strong>npm run deploy:appwrite</strong>
            </div>
            <div class="deployment-note">
              The private Appwrite API key belongs only in the deployment script environment. It is not exposed anywhere in the browser app.
            </div>
            <div class="command-box">
              <code>npm run serve</code>
              <code>npm run deploy:appwrite</code>
              <code>Fallback file: index.html</code>
            </div>
          </div>
        </section>
      </section>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  document.querySelector("#request-form")?.addEventListener("submit", handleCreateRequest);
  document.querySelector("#dispatch-route-btn")?.addEventListener("click", handleDispatch);
  document.querySelector("#optimize-btn")?.addEventListener("click", handleDispatch);
  document.querySelector("#reset-demo-btn")?.addEventListener("click", resetDemo);
  document.querySelector("#confirm-pickup-btn")?.addEventListener("click", confirmPickup);
  document.querySelector("#advance-selected-btn")?.addEventListener("click", () => {
    if (state.ui.selectedOrderId) advanceOrder(state.ui.selectedOrderId);
  });
  document.querySelector("#forecast-btn")?.addEventListener("click", runOverflowPrediction);

  document.querySelectorAll("[data-order-select]").forEach((button) => {
    button.addEventListener("click", () => {
      setSelectedOrder(button.dataset.orderSelect);
      render();
    });
  });

  document.querySelectorAll("[data-advance-order]").forEach((button) => {
    button.addEventListener("click", () => advanceOrder(button.dataset.advanceOrder));
  });

  document.querySelector("#site-select")?.addEventListener("change", (event) => {
    state.ui.form.siteId = event.target.value;
  });

  document.querySelector("#weight-input")?.addEventListener("input", (event) => {
    state.ui.form.weightKg = event.target.value;
  });

  document.querySelector("#waste-type-select")?.addEventListener("change", (event) => {
    state.ui.form.wasteType = event.target.value;
  });

  document.querySelector("#rider-select")?.addEventListener("change", (event) => {
    state.ui.selectedRiderId = event.target.value;
    render();
  });

  document.querySelector("#plant-select")?.addEventListener("change", (event) => {
    state.ui.selectedPlantId = event.target.value;
    render();
  });

  document.querySelector("#actual-weight-input")?.addEventListener("input", (event) => {
    state.ui.pickupDraft.actualWeightKg = event.target.value;
  });

  document.querySelector("#quality-score-input")?.addEventListener("input", (event) => {
    state.ui.pickupDraft.qualityScore = event.target.value;
    const rangeValue = document.querySelector("#quality-score-value");
    if (rangeValue) {
      rangeValue.textContent = `${event.target.value}/5`;
    }
  });

  document.querySelector("#load-range")?.addEventListener("input", (event) => {
    updatePlantMetric(state.ui.selectedPlantId, "currentLoadKg", event.target.value);
  });

  document.querySelector("#temperature-range")?.addEventListener("input", (event) => {
    updatePlantMetric(state.ui.selectedPlantId, "temperature", event.target.value);
  });

  document.querySelector("#ph-range")?.addEventListener("input", (event) => {
    updatePlantMetric(state.ui.selectedPlantId, "ph", event.target.value);
  });
}

setSelectedOrder(state.ui.selectedOrderId);
render();
