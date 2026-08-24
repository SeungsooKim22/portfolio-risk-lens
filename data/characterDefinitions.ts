export const riskModifierPools = {
  ko: [
    { min: 0, max: 9.9, variants: ["철벽의", "방어력 만렙"] },
    { min: 10, max: 19.9, variants: ["웬만해선 안 흔들리는", "숙면 보장형"] },
    { min: 20, max: 29.9, variants: ["극도로 신중한", "한 발 물러선"] },
    { min: 30, max: 39.9, variants: ["침착한", "차분히 계산하는"] },
    { min: 40, max: 49.9, variants: ["제법 균형 잡힌", "현실적인"] },
    { min: 50, max: 59.9, variants: ["살짝 공격적인", "속도를 내는"] },
    { min: 60, max: 69.9, variants: ["대담한", "심박수 높은"] },
    { min: 70, max: 79.9, variants: ["겁 없는", "스릴을 아는"] },
    { min: 80, max: 89.9, variants: ["브레이크 없는", "안전벨트만 맨"] },
    { min: 90, max: 100, variants: ["목숨 두 개인", "계좌가 먼저 달리는"] },
  ],
  en: [
    { min: 0, max: 9.9, variants: ["Fortress-level", "Ultra-defensive"] },
    { min: 10, max: 19.9, variants: ["Hard-to-shake", "Sleep-first"] },
    { min: 20, max: 29.9, variants: ["Extremely cautious", "One-step-back"] },
    { min: 30, max: 39.9, variants: ["Calm", "Steady-handed"] },
    { min: 40, max: 49.9, variants: ["Pretty balanced", "Pragmatic"] },
    { min: 50, max: 59.9, variants: ["Slightly aggressive", "Picking up speed"] },
    { min: 60, max: 69.9, variants: ["Bold", "High-heart-rate"] },
    { min: 70, max: 79.9, variants: ["Fearless", "Thrill-aware"] },
    { min: 80, max: 89.9, variants: ["No-brakes", "Seatbelt-only"] },
    { min: 90, max: 100, variants: ["Two-lives", "Account-first"] },
  ],
};

export const archetypeDefinitions = {
  balanced: {
    ko: { variants: ["균형 감각러", "분산형 생존자"], quotes: ["크게 튀진 않아도 오래 살아남는 쪽입니다."] },
    en: { variants: ["Balanced survivor", "Allocation realist"], quotes: ["Not the loudest portfolio, but built to stay in the game."] },
  },
  technology: {
    ko: { variants: ["실리콘밸리 주민", "빅테크 신봉자"], quotes: ["결국 소프트웨어가 세상을 먹는다고 믿습니다."] },
    en: { variants: ["Silicon Valley resident", "Big Tech believer"], quotes: ["Software eating the world is still the base case."] },
  },
  semiconductor: {
    ko: { variants: ["반도체 신봉자", "HBM 예언자"], quotes: ["웨이퍼와 메모리 사이클이 계좌의 날씨입니다."] },
    en: { variants: ["Chip believer", "HBM prophet"], quotes: ["Your portfolio has silicon in its bloodstream."] },
  },
  biotech: {
    ko: { variants: ["바이오 외길 투자자", "임상 베팅러"], quotes: ["실적 발표보다 임상 결과 발표가 더 중요합니다."] },
    en: { variants: ["Biotech lifer", "Clinical-trial bettor"], quotes: ["Trial readouts matter more than ordinary earnings."] },
  },
  leverage: {
    ko: { variants: ["레버리지 광인", "3배속 질주러"], quotes: ["평범한 변동성으로는 심장이 뛰지 않습니다."] },
    en: { variants: ["Leverage maximalist", "Triple-speed driver"], quotes: ["Ordinary volatility no longer raises your pulse."] },
  },
  singleStock: {
    ko: { variants: ["한 우물 투자자", "운명공동체형 투자자"], quotes: ["분산투자요? 회사는 하나만 제대로 알면 됩니다."] },
    en: { variants: ["One-stock main character", "Conviction maximalist"], quotes: ["Diversification? One company understood deeply is the thesis."] },
  },
  broadEtf: {
    ko: { variants: ["인덱스 신봉자", "시장 전체 매수자"], quotes: ["종목 고르기보다 시장에 탑승하는 쪽을 택했습니다."] },
    en: { variants: ["Index believer", "Whole-market buyer"], quotes: ["You chose the market over the guessing game."] },
  },
  defensive: {
    ko: { variants: ["폭락장 생존자", "방어형 리밸런서"], quotes: ["수익률보다 생존율을 먼저 봅니다."] },
    en: { variants: ["Crash survivor", "Defensive allocator"], quotes: ["Survival odds come before bragging rights."] },
  },
  cash: {
    ko: { variants: ["현금 사냥꾼", "매수 타이밍 대기자"], quotes: ["아직 안 샀습니다. 더 내려오면 이야기하죠."] },
    en: { variants: ["Cash hunter", "Dry-powder watcher"], quotes: ["Not buying yet. Lower prices can talk."] },
  },
  space: {
    ko: { variants: ["우주 개척자", "궤도 진입 투자자"], quotes: ["포트폴리오가 지구 중력권을 벗어나려 합니다."] },
    en: { variants: ["Space explorer", "Orbital allocator"], quotes: ["This allocation keeps looking past Earth's gravity."] },
  },
  gold: {
    ko: { variants: ["금본위제 신봉자", "중앙은행 불신자"], quotes: ["화폐는 종이지만 금은 금입니다."] },
    en: { variants: ["Gold-standard believer", "Central-bank skeptic"], quotes: ["Paper is paper. Gold is gold."] },
  },
  rates: {
    ko: { variants: ["파월 관찰자", "금리 민감러"], quotes: ["0.25%p 한마디에도 포트폴리오가 반응합니다."] },
    en: { variants: ["Fed watcher", "Rate-sensitive allocator"], quotes: ["A quarter-point can change the mood."] },
  },
};
