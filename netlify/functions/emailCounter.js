// Módulo de contador de emails para Netlify Functions
// Usa Netlify Blobs em produção e fallback para memória em dev/local

const DAILY_LIMIT = 450;
const STORE_NAME = "email-counter";
const COUNTER_KEY = "daily-counter";

// Fallback: cache em memória para ambiente local/dev
let memoryCache = {
  date: getCurrentDate(),
  count: 0,
};

/**
 * Obtém data atual no formato YYYY-MM-DD
 */
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Verifica se está rodando no Netlify (produção)
 */
function isNetlifyEnvironment() {
  return process.env.NETLIFY === "true" || process.env.CONTEXT !== undefined;
}

/**
 * Obtém o store do Netlify Blobs (somente em produção)
 */
async function getCounterStore() {
  if (!isNetlifyEnvironment()) {
    return null;
  }

  try {
    const { getStore } = await import("@netlify/blobs");
    return getStore(STORE_NAME);
  } catch (error) {
    console.warn("⚠️ Netlify Blobs não disponível, usando cache em memória");
    return null;
  }
}

/**
 * Lê os dados do contador
 */
async function getCounterData() {
  try {
    const store = await getCounterStore();

    // Se não há Blobs disponível (local), usa memória
    if (!store) {
      return memoryCache;
    }

    // Produção: lê do Netlify Blobs
    const data = await store.get(COUNTER_KEY, { type: "json" });

    if (!data) {
      return { date: getCurrentDate(), count: 0 };
    }

    return data;
  } catch (error) {
    console.error("❌ Erro ao ler contador:", error);
    return memoryCache;
  }
}

/**
 * Salva os dados do contador
 */
async function saveCounterData(data) {
  try {
    const store = await getCounterStore();

    // Se não há Blobs disponível (local), salva na memória
    if (!store) {
      memoryCache = data;
      return;
    }

    // Produção: salva no Netlify Blobs
    await store.setJSON(COUNTER_KEY, data);
  } catch (error) {
    console.error("❌ Erro ao salvar contador no Blobs:", error);
  }
}

/**
 * Verifica se o limite diário foi atingido
 */
export async function checkDailyLimit() {
  const data = await getCounterData();
  const currentDate = getCurrentDate();

  // Se mudou o dia, reseta o contador
  if (data.date !== currentDate) {
    data.date = currentDate;
    data.count = 0;
    await saveCounterData(data);
  }

  const remaining = DAILY_LIMIT - data.count;
  const allowed = data.count < DAILY_LIMIT;

  return {
    allowed,
    remaining: Math.max(0, remaining),
    limit: DAILY_LIMIT,
    current: data.count,
  };
}

/**
 * Incrementa o contador de emails enviados
 */
export async function incrementCounter() {
  const check = await checkDailyLimit();

  if (!check.allowed) {
    console.warn(
      `⚠️ Limite diário de ${DAILY_LIMIT} emails atingido (${check.current}/${DAILY_LIMIT})`
    );
    return false;
  }

  const data = await getCounterData();
  data.count += 1;
  await saveCounterData(data);

  console.log(
    `📊 Email contador: ${data.count}/${DAILY_LIMIT} (restam ${
      DAILY_LIMIT - data.count
    })`
  );

  return true;
}

/**
 * Obtém estatísticas do contador
 */
export async function getStats() {
  const data = await getCounterData();
  const currentDate = getCurrentDate();

  if (data.date !== currentDate) {
    return {
      date: currentDate,
      sent: 0,
      remaining: DAILY_LIMIT,
      limit: DAILY_LIMIT,
      percentage: 0,
    };
  }

  return {
    date: data.date,
    sent: data.count,
    remaining: Math.max(0, DAILY_LIMIT - data.count),
    limit: DAILY_LIMIT,
    percentage: Math.round((data.count / DAILY_LIMIT) * 100),
  };
}
