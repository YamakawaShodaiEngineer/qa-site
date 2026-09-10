/**
 * Googleスプレッドシートを読み取り専用DBとして扱うためのユーティリティ。
 *
 * 構成:
 *   ・1つのスプレッドシートの中に、自治体ごとにシート(タブ)を分ける
 *     (例: タブ名 "渋谷区" / "港区" / "新宿区" など)
 *   ・URLの最後の値(slug)が、そのままシート(タブ)名として扱われる
 *     (例: /渋谷区 にアクセス → "渋谷区" という名前のタブを見に行く)
 *   ・各タブの1行目はヘッダー(見出し)行なので読み飛ばす
 *   ・A列: question(質問文) / B列: answer(回答文)
 *   ・行の並び順が、そのまま画面での表示順になる(order列は使わない)
 *
 * スプレッドシートは「リンクを知っている全員が閲覧者」で共有し、
 * Google Sheets APIキー(読み取り専用スコープで十分)を環境変数に設定してください。
 */

export type QAItem = {
  question: string;
  answer: string;
};

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

// 60秒キャッシュ(ISR)。スプレッドシートの更新が反映されるまでの最大遅延。
const REVALIDATE_SECONDS = 60;

function assertEnv() {
  if (!SHEET_ID || !API_KEY) {
    throw new Error(
      "GOOGLE_SHEET_ID と GOOGLE_SHEETS_API_KEY を環境変数に設定してください(.env.local を参照)"
    );
  }
}

/**
 * スプレッドシート内に存在するシート(タブ)名の一覧を取得する。
 * これが「自治体名(=URLのslug)」の一覧になる。
 *
 * values.get ではなく spreadsheets.get(メタデータ取得用エンドポイント)を使う点に注意。
 */
export async function fetchAllSlugs(): Promise<string[]> {
  assertEnv();

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties.title&key=${API_KEY}`;

  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Sheets APIの取得に失敗しました (${res.status}): ${body}`);
  }

  const data = (await res.json()) as {
    sheets?: { properties: { title: string } }[];
  };

  return (data.sheets ?? []).map((sheet) => sheet.properties.title);
}

/**
 * 特定の自治体(slug = シート名)に紐づくQ&Aを取得する。
 * 該当するタブが存在しない場合は、空配列を返す(404画面につながる)。
 */
export async function fetchQAForSlug(slug: string): Promise<QAItem[]> {
  assertEnv();

  // シート名に空白や記号が含まれていてもよいよう、範囲指定はシングルクォートで囲む
  const range = `'${slug}'!A2:B`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    range
  )}?key=${API_KEY}`;

  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    // 400番台は「そのタブ(自治体名)が存在しない」ケースが多いため、
    // エラーにはせず「データなし」として扱う
    if (res.status === 400) {
      return [];
    }
    const body = await res.text();
    throw new Error(`Google Sheets APIの取得に失敗しました (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { values?: string[][] };
  const rows = data.values ?? [];

  return rows
    .filter((row) => row[0]) // questionが空の行は無視
    .map((row) => ({
      question: String(row[0] ?? "").trim(),
      answer: String(row[1] ?? "").trim(),
    }));
}
