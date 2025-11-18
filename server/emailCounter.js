import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COUNTER_FILE = path.join(__dirname, "email-counter.json");
const DAILY_LIMIT = 450;

/**
 * Obtém os dados do contador
 */
function getCounterData() {
  try {
    if (!fs.existsSync(COUNTER_FILE)) {
      return { date: getCurrentDate(), count: 0 };
    }

    const data = fs.readFileSync(COUNTER_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Erro ao ler contador:", error);
    return { date: getCurrentDate(), count: 0 };
  }
}

/**
 * Salva os dados do contador
 */
function saveCounterData(data) {
  try {
    fs.writeFileSync(COUNTER_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Erro ao salvar contador:", error);
  }
}

/**
 * Obtém data atual no formato YYYY-MM-DD
 */
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Verifica se o limite diário foi atingido
 * Retorna { allowed: boolean, remaining: number, limit: number }
 */
export function checkDailyLimit() {
  const data = getCounterData();
  const currentDate = getCurrentDate();

  // Se mudou o dia, reseta o contador
  if (data.date !== currentDate) {
    data.date = currentDate;
    data.count = 0;
    saveCounterData(data);
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
 * Retorna true se incrementado com sucesso, false se limite atingido
 */
export function incrementCounter() {
  const check = checkDailyLimit();

  if (!check.allowed) {
    console.warn(
      `⚠️ Limite diário de ${DAILY_LIMIT} emails atingido (${check.current}/${DAILY_LIMIT})`
    );
    return false;
  }

  const data = getCounterData();
  data.count += 1;
  saveCounterData(data);

  console.log(
    `📊 Email contador: ${data.count}/${DAILY_LIMIT} (restam ${
      DAILY_LIMIT - data.count
    })`
  );

  return true;
}

/**
 * Reseta o contador (útil para testes)
 */
export function resetCounter() {
  const data = {
    date: getCurrentDate(),
    count: 0,
  };
  saveCounterData(data);
  console.log("🔄 Contador resetado");
}

/**
 * Obtém estatísticas do contador
 */
export function getStats() {
  const data = getCounterData();
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
