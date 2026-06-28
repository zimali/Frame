// js/config.js
export const TMDB_KEY = '2dca580c2a14b55200e784d157207b4d';
export const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
export const RARS = ['common', 'gold', 'rainbow', 'unique', 'diamond'];
export const PACK_W = [79, 20, 1, 0, 0];
export const LOT_W = [60, 25, 10, 5, 0];
export const SELL_V = { common: 5, gold: 25, rainbow: 200, unique: 300, diamond: 150 };
export const XP_R = { common: 20, gold: 100, rainbow: 1000, unique: 1000, diamond: 0 };
export const BADGE_XP = [50, 150, 400, 1000, 2500];
export const CIRC = 2 * Math.PI * 27;
export const RAR_COLOR = { common: '#aaa', gold: '#fbbf24', rainbow: '#f87171', unique: '#ff4444', diamond: '#60a5fa' };

export const QUOTES = [
  { t: "Жизнь — как коробка шоколадных конфет.", a: "Форрест Гамп" },
  { t: "Просто продолжай плыть.", a: "В поисках Немо" },
  { t: "Да пребудет с тобой Сила.", a: "Звёздные войны" },
  { t: "С большой силой — большая ответственность.", a: "Человек-паук" },
  { t: "Надежда — лучшее, что есть.", a: "Побег из Шоушенка" },
  { t: "Почему так серьёзно?", a: "Тёмный рыцарь" },
  { t: "Я вернусь.", a: "Терминатор" },
  { t: "Добро пожаловать в реальный мир.", a: "Матрица" },
  { t: "Мечты — это планы Бога.", a: "Интерстеллар" },
  { t: "Путешествие в тысячу миль — один шаг.", a: "Кунг-фу Панда" },
  { t: "Не позволяй никому говорить, что ты не умеешь.", a: "В погоне за счастьем" },
  { t: "Сегодня — это подарок.", a: "Кунг-фу Панда" },
  { t: "Мы принимаем ту любовь, которую заслуживаем.", a: "Хорошо быть тихоней" }
];

export const LANGS = {
  ru: {
    open: 'Открыть', inv: 'Коллекция', shop: 'Магазин', info: 'Прогресс', sett: 'Настройки',
    hint: 'Нажми чтобы открыть', close: 'Закрыть', sell: 'Продать', fav: 'В избранное', unfav: 'Убрать',
    spin: 'Вращать', stop: 'Стоп', newest: 'Новые', all: 'Все', common: 'Обычные', gold: 'Золотые',
    rainbow: 'Радужные', unique: 'Уникальные', diamond: 'Алмазные', faved: 'Избранные',
    rn: { common: 'Обычная', gold: 'Золотая', rainbow: 'Радужная', unique: 'Уникальная', diamond: 'Алмазная' },
    coins: 'монет', shopRef: 'Обновление через', free: 'Бесплатно', buy: 'Купить', lotOf: 'Лот', cards: 'карточек',
    lvlTitle: 'Уровень игрока', questHdr: 'Ежедневные задания', dTitle: '💎 Прогресс до алмазной карточки',
    dRight: 'Алмазная карта', dLabel: n => `${n} из 3`, claim: 'Получить алмазную', badgesHdr: 'Значки',
    noCards: 'Нет карточек', lvlUp: '🎉 УРОВЕНЬ ПОВЫШЕН!', streakTitle: 'Стрик входов', streakSub: 'дней подряд',
    sellConfirm: (t, p) => `Продать "${t}" за ${p} монет?`, settTitle: '⚙️ Настройки',
    newCards: 'Новые карточки!', ok: 'OK', diff: { easy: '🌱 Лёгкое', medium: '⚡ Среднее', hard: '🔥 Сложное' },
    noCoin: 'Недостаточно монет', badgeLocked: 'Не открыт', badgeMax: 'Максимум!', next: 'Далее',
    finish: 'Поехали!', prev: '←', retut: '▶ Начать', changelog: '📋 Журнал обновлений'
  },
  en: {
    open: 'Open', inv: 'Collection', shop: 'Shop', info: 'Progress', sett: 'Settings',
    hint: 'Tap to open', close: 'Close', sell: 'Sell', fav: 'Favourite', unfav: 'Unfavourite',
    spin: 'Spin', stop: 'Stop', newest: 'New', all: 'All', common: 'Common', gold: 'Gold',
    rainbow: 'Rainbow', unique: 'Unique', diamond: 'Diamond', faved: 'Favourites',
    rn: { common: 'Common', gold: 'Gold', rainbow: 'Rainbow', unique: 'Unique', diamond: 'Diamond' },
    coins: 'coins', shopRef: 'Resets in', free: 'Free', buy: 'Buy', lotOf: 'Lot', cards: 'cards',
    lvlTitle: 'Player Level', questHdr: 'Daily Quests', dTitle: '💎 Progress to Diamond Card',
    dRight: 'Diamond Card', dLabel: n => `${n} of 3`, claim: 'Claim Diamond Card', badgesHdr: 'Badges',
    noCards: 'No cards', lvlUp: '🎉 LEVEL UP!', streakTitle: 'Daily Streak', streakSub: 'days in a row',
    sellConfirm: (t, p) => `Sell "${t}" for ${p} coins?`, settTitle: '⚙️ Settings',
    newCards: 'New Cards!', ok: 'OK', diff: { easy: '🌱 Easy', medium: '⚡ Medium', hard: '🔥 Hard' },
    noCoin: 'Not enough coins', badgeLocked: 'Not unlocked', badgeMax: 'Max level!', next: 'Next',
    finish: "Let's go!", prev: '←', retut: '▶ Start', changelog: '📋 Changelog'
  },
  es: {
    open: 'Abrir', inv: 'Colección', shop: 'Tienda', info: 'Progreso', sett: 'Ajustes',
    hint: 'Toca para abrir', close: 'Cerrar', sell: 'Vender', fav: 'Favorito', unfav: 'Quitar',
    spin: 'Girar', stop: 'Parar', newest: 'Nuevas', all: 'Todo', common: 'Comunes', gold: 'Doradas',
    rainbow: 'Arcoíris', unique: 'Únicas', diamond: 'Diamante', faved: 'Favoritos',
    rn: { common: 'Común', gold: 'Dorada', rainbow: 'Arcoíris', unique: 'Única', diamond: 'Diamante' },
    coins: 'monedas', shopRef: 'Renueva en', free: 'Gratis', buy: 'Comprar', lotOf: 'Lote', cards: 'cartas',
    lvlTitle: 'Nivel del jugador', questHdr: 'Misiones diarias', dTitle: '💎 Progreso a carta Diamante',
    dRight: 'Carta Diamante', dLabel: n => `${n} de 3`, claim: 'Obtener Diamante', badgesHdr: 'Insignias',
    noCards: 'Sin cartas', lvlUp: '🎉 ¡SUBISTE DE NIVEL!', streakTitle: 'Racha diaria', streakSub: 'días seguidos',
    sellConfirm: (t, p) => `¿Vender "${t}" por ${p} monedas?`, settTitle: '⚙️ Ajustes',
    newCards: '¡Nuevas cartas!', ok: 'OK', diff: { easy: '🌱 Fácil', medium: '⚡ Medio', hard: '🔥 Difícil' },
    noCoin: 'Monedas insuficientes', badgeLocked: 'No desbloqueado', badgeMax: '¡Nivel máximo!', next: 'Siguiente',
    finish: '¡Empezar!', prev: '←', retut: '▶ Empezar', changelog: '📋 Novedades'
  },
  de: {
    open: 'Öffnen', inv: 'Sammlung', shop: 'Shop', info: 'Fortschritt', sett: 'Einstellungen',
    hint: 'Tippen zum Öffnen', close: 'Schließen', sell: 'Verkaufen', fav: 'Favorit', unfav: 'Entfernen',
    spin: 'Drehen', stop: 'Stopp', newest: 'Neu', all: 'Alle', common: 'Gewöhnlich', gold: 'Gold',
    rainbow: 'Regenbogen', unique: 'Einzigartig', diamond: 'Diamant', faved: 'Favoriten',
    rn: { common: 'Gewöhnlich', gold: 'Gold', rainbow: 'Regenbogen', unique: 'Einzigartig', diamond: 'Diamant' },
    coins: 'Münzen', shopRef: 'Neuladen in', free: 'Kostenlos', buy: 'Kaufen', lotOf: 'Paket', cards: 'Karten',
    lvlTitle: 'Spielerlevel', questHdr: 'Tagesaufgaben', dTitle: '💎 Fortschritt zur Diamantkarte',
    dRight: 'Diamantkarte', dLabel: n => `${n} von 3`, claim: 'Diamantkarte holen', badgesHdr: 'Abzeichen',
    noCards: 'Keine Karten', lvlUp: '🎉 LEVEL AUFGESTIEGEN!', streakTitle: 'Tages-Streak', streakSub: 'Tage in Folge',
    sellConfirm: (t, p) => `"${t}" für ${p} Münzen verkaufen?`, settTitle: '⚙️ Einstellungen',
    newCards: 'Neue Karten!', ok: 'OK', diff: { easy: '🌱 Leicht', medium: '⚡ Mittel', hard: '🔥 Schwer' },
    noCoin: 'Zu wenig Münzen', badgeLocked: 'Nicht freigeschaltet', badgeMax: 'Maximalstufe!', next: 'Weiter',
    finish: "Los geht's!", prev: '←', retut: '▶ Start', changelog: '📋 Updates'
  },
  fr: {
    open: 'Ouvrir', inv: 'Collection', shop: 'Boutique', info: 'Progrès', sett: 'Paramètres',
    hint: 'Appuyer pour ouvrir', close: 'Fermer', sell: 'Vendre', fav: 'Favori', unfav: 'Retirer',
    spin: 'Tourner', stop: 'Arrêter', newest: 'Nouveaux', all: 'Tous', common: 'Commun', gold: 'Or',
    rainbow: 'Arc-en-ciel', unique: 'Unique', diamond: 'Diamant', faved: 'Favoris',
    rn: { common: 'Commun', gold: 'Or', rainbow: 'Arc-en-ciel', unique: 'Unique', diamond: 'Diamant' },
    coins: 'pièces', shopRef: 'Réinitialise dans', free: 'Gratuit', buy: 'Acheter', lotOf: 'Lot', cards: 'cartes',
    lvlTitle: 'Niveau joueur', questHdr: 'Quêtes quotidiennes', dTitle: '💎 Progression carte Diamant',
    dRight: 'Carte Diamant', dLabel: n => `${n} sur 3`, claim: 'Obtenir Diamant', badgesHdr: 'Badges',
    noCards: 'Aucune carte', lvlUp: '🎉 NIVEAU SUPÉRIEUR!', streakTitle: 'Série journalière', streakSub: 'jours consécutifs',
    sellConfirm: (t, p) => `Vendre "${t}" pour ${p} pièces ?`, settTitle: '⚙️ Paramètres',
    newCards: 'Nouvelles cartes !', ok: 'OK', diff: { easy: '🌱 Facile', medium: '⚡ Moyen', hard: '🔥 Difficile' },
    noCoin: 'Pas assez de pièces', badgeLocked: 'Pas débloqué', badgeMax: 'Niveau max !', next: 'Suivant',
    finish: "C'est parti !", prev: '←', retut: '▶ Démarrer', changelog: '📋 Mises à jour'
  },
  tr: {
    open: 'Aç', inv: 'Koleksiyon', shop: 'Mağaza', info: 'İlerleme', sett: 'Ayarlar',
    hint: 'Açmak için dokun', close: 'Kapat', sell: 'Sat', fav: 'Favorile', unfav: 'Çıkar',
    spin: 'Döndür', stop: 'Dur', newest: 'Yeni', all: 'Hepsi', common: 'Yaygın', gold: 'Altın',
    rainbow: 'Gökkuşağı', unique: 'Eşsiz', diamond: 'Elmas', faved: 'Favoriler',
    rn: { common: 'Yaygın', gold: 'Altın', rainbow: 'Gökkuşağı', unique: 'Eşsiz', diamond: 'Elmas' },
    coins: 'altın', shopRef: 'Yenileme', free: 'Ücretsiz', buy: 'Satın Al', lotOf: 'Paket', cards: 'kart',
    lvlTitle: 'Oyuncu Seviyesi', questHdr: 'Günlük Görevler', dTitle: '💎 Elmas Kart İlerlemesi',
    dRight: 'Elmas Kart', dLabel: n => `${n} / 3`, claim: 'Elmas Kartı Al', badgesHdr: 'Rozetler',
    noCards: 'Kart yok', lvlUp: '🎉 SEVİYE ATLANDI!', streakTitle: 'Günlük Seri', streakSub: 'gün üst üste',
    sellConfirm: (t, p) => `"${t}" satılsın mı? ${p} altın`, settTitle: '⚙️ Ayarlar',
    newCards: 'Yeni kartlar!', ok: 'Tamam', diff: { easy: '🌱 Kolay', medium: '⚡ Orta', hard: '🔥 Zor' },
    noCoin: 'Yetersiz altın', badgeLocked: 'Kilitli', badgeMax: 'Max seviye!', next: 'Sonraki',
    finish: 'Başlayalım!', prev: '←', retut: '▶ Başlat', changelog: '📋 Güncellemeler'
  },
  ja: {
    open: '開く', inv: 'コレクション', shop: 'ショップ', info: '進捗', sett: '設定',
    hint: 'タップして開く', close: '閉じる', sell: '売る', fav: 'お気に入り', unfav: '外す',
    spin: '回転', stop: '停止', newest: '新しい', all: 'すべて', common: 'コモン', gold: 'ゴールド',
    rainbow: 'レインボー', unique: 'ユニーク', diamond: 'ダイヤモンド', faved: 'お気に入り',
    rn: { common: 'コモン', gold: 'ゴールド', rainbow: 'レインボー', unique: 'ユニーク', diamond: 'ダイヤモンド' },
    coins: 'コイン', shopRef: '更新まで', free: '無料', buy: '買う', lotOf: 'ロット', cards: '枚',
    lvlTitle: 'プレイヤーレベル', questHdr: 'デイリークエスト', dTitle: '💎 ダイヤモンドへの進捗',
    dRight: 'ダイヤモンドカード', dLabel: n => `${n} / 3`, claim: 'ダイヤモンドを獲得', badgesHdr: 'バッジ',
    noCards: 'カードなし', lvlUp: '🎉 レベルアップ!', streakTitle: 'デイリーストリーク', streakSub: '日連続',
    sellConfirm: (t, p) => `"${t}" を ${p} コインで売る?`, settTitle: '⚙️ 設定',
    newCards: '新しいカード!', ok: 'OK', diff: { easy: '🌱 簡単', medium: '⚡ 普通', hard: '🔥 難しい' },
    noCoin: 'コインが足りない', badgeLocked: '未解放', badgeMax: '最大レベル!', next: '次へ',
    finish: '始めよう!', prev: '←', retut: '▶ 開始', changelog: '📋 変更履歴'
  },
  zh: {
    open: '开包', inv: '收藏', shop: '商店', info: '进度', sett: '设置',
    hint: '点击开包', close: '关闭', sell: '出售', fav: '收藏', unfav: '取消',
    spin: '旋转', stop: '停止', newest: '最新', all: '全部', common: '普通', gold: '黄金',
    rainbow: '彩虹', unique: '独特', diamond: '钻石', faved: '收藏夹',
    rn: { common: '普通', gold: '黄金', rainbow: '彩虹', unique: '独特', diamond: '钻石' },
    coins: '金币', shopRef: '更新倒计时', free: '免费', buy: '购买', lotOf: '批次', cards: '张卡',
    lvlTitle: '玩家等级', questHdr: '每日任务', dTitle: '💎 钻石卡进度',
    dRight: '钻石卡', dLabel: n => `${n} / 3`, claim: '领取钻石卡', badgesHdr: '徽章',
    noCards: '没有卡片', lvlUp: '🎉 升级了!', streakTitle: '每日连签', streakSub: '天连续',
    sellConfirm: (t, p) => `出售 "${t}" 获得 ${p} 金币?`, settTitle: '⚙️ 设置',
    newCards: '新卡片!', ok: '确认', diff: { easy: '🌱 简单', medium: '⚡ 中等', hard: '🔥 困难' },
    noCoin: '金币不足', badgeLocked: '未解锁', badgeMax: '最高等级!', next: '下一步',
    finish: '出发!', prev: '←', retut: '▶ 开始', changelog: '📋 更新日志'
  },
  ar: {
    open: 'افتح', inv: 'المجموعة', shop: 'المتجر', info: 'التقدم', sett: 'الإعدادات',
    hint: 'انقر للفتح', close: 'إغلاق', sell: 'بيع', fav: 'مفضلة', unfav: 'إزالة',
    spin: 'دوران', stop: 'وقف', newest: 'الجديد', all: 'الكل', common: 'عادي', gold: 'ذهبي',
    rainbow: 'قوس قزح', unique: 'فريد', diamond: 'ألماس', faved: 'المفضلة',
    rn: { common: 'عادي', gold: 'ذهبي', rainbow: 'قوس قزح', unique: 'فريد', diamond: 'ألماس' },
    coins: 'عملات', shopRef: 'التجديد خلال', free: 'مجاني', buy: 'شراء', lotOf: 'صفقة', cards: 'بطاقات',
    lvlTitle: 'مستوى اللاعب', questHdr: 'المهام اليومية', dTitle: '💎 تقدم البطاقة الماسية',
    dRight: 'البطاقة الماسية', dLabel: n => `${n} من 3`, claim: 'احصل على الألماس', badgesHdr: 'الشارات',
    noCards: 'لا بطاقات', lvlUp: '🎉 ارتقاء!', streakTitle: 'السلسلة اليومية', streakSub: 'أيام متتالية',
    sellConfirm: (t, p) => `بيع "${t}" مقابل ${p} عملة?`, settTitle: '⚙️ الإعدادات',
    newCards: 'بطاقات جديدة!', ok: 'موافق', diff: { easy: '🌱 سهل', medium: '⚡ متوسط', hard: '🔥 صعب' },
    noCoin: 'عملات غير كافية', badgeLocked: 'مقفل', badgeMax: 'أعلى مستوى!', next: 'التالي',
    finish: 'لنبدأ!', prev: '←', retut: '▶ ابدأ', changelog: '📋 سجل التحديثات'
  },
  pt: {
    open: 'Abrir', inv: 'Coleção', shop: 'Loja', info: 'Progresso', sett: 'Configurações',
    hint: 'Toque para abrir', close: 'Fechar', sell: 'Vender', fav: 'Favorito', unfav: 'Remover',
    spin: 'Girar', stop: 'Parar', newest: 'Novos', all: 'Todos', common: 'Comum', gold: 'Ouro',
    rainbow: 'Arco-íris', unique: 'Único', diamond: 'Diamante', faved: 'Favoritos',
    rn: { common: 'Comum', gold: 'Ouro', rainbow: 'Arco-íris', unique: 'Único', diamond: 'Diamante' },
    coins: 'moedas', shopRef: 'Atualiza em', free: 'Grátis', buy: 'Comprar', lotOf: 'Lote', cards: 'cartas',
    lvlTitle: 'Nível do jogador', questHdr: 'Missões diárias', dTitle: '💎 Progresso carta Diamante',
    dRight: 'Carta Diamante', dLabel: n => `${n} de 3`, claim: 'Obter Diamante', badgesHdr: 'Insígnias',
    noCards: 'Sem cartas', lvlUp: '🎉 SUBIU DE NÍVEL!', streakTitle: 'Sequência diária', streakSub: 'dias seguidos',
    sellConfirm: (t, p) => `Vender "${t}" por ${p} moedas?`, settTitle: '⚙️ Configurações',
    newCards: 'Novas cartas!', ok: 'OK', diff: { easy: '🌱 Fácil', medium: '⚡ Médio', hard: '🔥 Difícil' },
    noCoin: 'Moedas insuficientes', badgeLocked: 'Não desbloqueado', badgeMax: 'Nível máximo!', next: 'Próximo',
    finish: 'Vamos lá!', prev: '←', retut: '▶ Começar', changelog: '📋 Novidades'
  }
};
