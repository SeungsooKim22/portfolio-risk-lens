export const riskModifierPools = {
  ko: [
    { min: 0, max: 9.9, variants: ["철벽의", "방어력 만렙", "계좌에 안전벨트 세 개 맨"] },
    { min: 10, max: 19.9, variants: ["웬만해선 안 흔들리는", "숙면 보장형", "손실을 싫어하는"] },
    { min: 20, max: 29.9, variants: ["극도로 신중한", "한 발 물러선", "오늘 밤도 편한"] },
    { min: 30, max: 39.9, variants: ["침착한", "차분히 계산하는", "선은 지키는"] },
    { min: 40, max: 49.9, variants: ["제법 균형 잡힌", "현실적인", "적당히 욕심 있는"] },
    { min: 50, max: 59.9, variants: ["살짝 공격적인", "속도를 내는", "슬슬 대담해지는"] },
    { min: 60, max: 69.9, variants: ["대담한", "심박수 높은", "안전벨트만 맨"] },
    { min: 70, max: 79.9, variants: ["겁 없는", "스릴을 아는", "손절 버튼과 친하지 않은"] },
    { min: 80, max: 89.9, variants: ["브레이크 없는", "계좌가 롤러코스터인", "리스크 관리팀이 놀랄"] },
    { min: 90, max: 100, variants: ["멘탈이 두꺼운", "계좌가 먼저 달리는", "내일보다 다음 실적 발표가 중요한"] },
  ],
  en: [
    { min: 0, max: 9.9, variants: ["Fortress-level", "Ultra-defensive", "Three-seatbelt"] },
    { min: 10, max: 19.9, variants: ["Hard-to-shake", "Sleep-first", "Loss-averse"] },
    { min: 20, max: 29.9, variants: ["Extremely cautious", "One-step-back", "Comfortably boring"] },
    { min: 30, max: 39.9, variants: ["Calm", "Steady-handed", "Line-holding"] },
    { min: 40, max: 49.9, variants: ["Pretty balanced", "Pragmatic", "Moderately ambitious"] },
    { min: 50, max: 59.9, variants: ["Slightly aggressive", "Picking up speed", "Getting bolder"] },
    { min: 60, max: 69.9, variants: ["Bold", "High-heart-rate", "Seatbelt-only"] },
    { min: 70, max: 79.9, variants: ["Fearless", "Thrill-aware", "Stop-loss-unfriendly"] },
    { min: 80, max: 89.9, variants: ["No-brakes", "Roller-coaster-account", "Risk-team-surprising"] },
    { min: 90, max: 100, variants: ["Thick-skinned", "Account-first", "Earnings-call-over-tomorrow"] },
  ],
};

export const archetypeDefinitions = {
  balanced: {
    ko: {
      variants: ["균형 감각러", "분산형 생존자", "인간 ETF", "상식 있는 투자자"],
      quotes: [
        "선은 지키지만 욕심도 있습니다.",
        "친구 계좌 터질 때 조용히 살아남는 타입입니다.",
        "자극은 적지만 포트폴리오에 상식이 들어 있습니다.",
        "큰 소리는 안 나도 오래 버티는 쪽입니다.",
      ],
    },
    en: {
      variants: ["Balanced survivor", "Allocation realist", "Human ETF", "Common-sense investor"],
      quotes: [
        "Balanced, but not asleep.",
        "The kind of account that survives while friends get dramatic.",
        "Not very spicy, but the logic is there.",
        "Quiet portfolios can live longer.",
      ],
    },
  },
  technology: {
    ko: {
      variants: ["실리콘밸리 주민", "빅테크 신봉자", "나스닥 시민권자", "AI 인프라 추적자"],
      quotes: [
        "빅테크가 세상을 먹는다고 믿습니다.",
        "AI가 쉬면 계좌도 같이 쉽니다.",
        "S&P 500보다 매그니피센트 7이 더 친숙합니다.",
        "데이터센터 수요에 계좌가 반응합니다.",
        "금리보다 클라우드 매출을 먼저 봅니다.",
      ],
    },
    en: {
      variants: ["Silicon Valley resident", "Big Tech believer", "Nasdaq citizen", "AI infrastructure tracker"],
      quotes: [
        "Big Tech eating the world is still the base case.",
        "If AI takes a break, the account does too.",
        "The Magnificent 7 feel more familiar than the whole S&P 500.",
        "This portfolio is sensitive to data-center demand.",
        "Cloud revenue shows up before rates on the watchlist.",
      ],
    },
  },
  semiconductor: {
    ko: {
      variants: ["반도체 신봉자", "HBM 예언자", "웨이퍼 외길 투자자", "메모리 사이클 동행자"],
      quotes: [
        "경기 전망보다 HBM 출하량이 중요합니다.",
        "포트폴리오가 실리콘으로 만들어졌습니다.",
        "AI보다 GPU를 더 믿습니다.",
        "메모리 가격표가 사실상 계좌 날씨입니다.",
        "CAPEX 뉴스에 심장이 뜁니다.",
        "반도체 업황이 곧 내 경기입니다.",
      ],
    },
    en: {
      variants: ["Chip believer", "HBM prophet", "Wafer-path investor", "Memory-cycle companion"],
      quotes: [
        "HBM shipments matter more than the economic outlook.",
        "Your portfolio has silicon in its bloodstream.",
        "You may trust GPUs more than AI itself.",
        "Memory prices are basically the account weather.",
        "CAPEX headlines have a pulse effect.",
        "The chip cycle is your personal business cycle.",
      ],
    },
  },
  biotech: {
    ko: {
      variants: ["바이오 외길 투자자", "임상 베팅러", "FDA 캘린더 거주자", "파이프라인 추적자"],
      quotes: [
        "이 포트폴리오는 사실상 하나의 임상시험입니다.",
        "FOMC보다 Phase 2가 중요합니다.",
        "p-value에 계좌가 달려 있습니다.",
        "논문 초록을 실적 발표처럼 읽습니다.",
        "현금흐름보다 임상 데이터를 봅니다.",
        "임상 발표날에는 알람이 필요 없습니다.",
      ],
    },
    en: {
      variants: ["Biotech lifer", "Clinical-trial bettor", "FDA calendar resident", "Pipeline watcher"],
      quotes: [
        "This portfolio is basically one clinical trial.",
        "Phase 2 matters more than the Fed meeting.",
        "The account has a p-value problem.",
        "Abstracts read like earnings releases here.",
        "Clinical data outranks cash flow.",
        "Trial readout days need no alarm.",
      ],
    },
  },
  leverage: {
    ko: {
      variants: ["레버리지 광인", "3배속 질주러", "나스닥 부스터 장착자", "일일 리밸런싱 동반자"],
      quotes: [
        "나스닥도 부족해서 3배로 믿기로 했습니다.",
        "평범한 변동성으로는 심장이 뛰지 않습니다.",
        "복리도 3배, 멘탈 테스트도 3배입니다.",
        "QQQ로는 싱거워서 양념을 더 넣었습니다.",
        "일일 리밸런싱과 운명공동체입니다.",
        "차트가 움직일 때 계좌도 뛰어다닙니다.",
      ],
    },
    en: {
      variants: ["Leverage maximalist", "Triple-speed driver", "Nasdaq booster", "Daily-reset companion"],
      quotes: [
        "Regular Nasdaq was not enough, so belief became 3x.",
        "Ordinary volatility no longer raises your pulse.",
        "Compounding is amplified. So is the mental test.",
        "QQQ tasted too mild, so leverage became seasoning.",
        "Daily rebalancing is part of the relationship.",
        "When the chart moves, the account starts running.",
      ],
    },
  },
  singleStock: {
    ko: {
      variants: ["한 우물 투자자", "운명공동체형 투자자", "최애종목 보유자", "확신 과다 투자자"],
      quotes: [
        "분산투자보다 최애 종목을 믿습니다.",
        "회사 뉴스가 사실상 개인 일정표입니다.",
        "이 정도면 주주가 아니라 동업자에 가깝습니다.",
        "포트폴리오가 아니라 최애종목 보관함입니다.",
        "사랑하면 몰빵이라는 철학이 보입니다.",
        "IR 전화 받아도 어색하지 않은 비중입니다.",
      ],
    },
    en: {
      variants: ["One-stock main character", "Conviction maximalist", "Favorite-stock holder", "High-conviction investor"],
      quotes: [
        "Diversification lost to a favorite stock.",
        "Company news has become the personal calendar.",
        "At this point it is closer to partnership than ownership.",
        "This is less a portfolio than a favorite-stock container.",
        "Love appears to mean concentration here.",
        "Investor relations might recognize the weight.",
      ],
    },
  },
  broadEtf: {
    ko: {
      variants: ["인덱스 신봉자", "시장 전체 매수자", "존 보글의 흐뭇함", "귀찮음이 만든 합리성"],
      quotes: [
        "종목을 고르기 귀찮아서 시장을 샀습니다.",
        "재미는 조금 없는데 계좌는 오래 삽니다.",
        "시장 이기기를 포기했더니 마음이 편해졌습니다.",
        "리스크 관리팀이 조용히 고개를 끄덕입니다.",
      ],
    },
    en: {
      variants: ["Index believer", "Whole-market buyer", "Bogle-approved", "Lazy but rational"],
      quotes: [
        "You skipped stock picking and bought the market.",
        "A little less fun, probably more durable.",
        "Giving up on beating the market brought peace.",
        "The risk team quietly nods.",
      ],
    },
  },
  defensive: {
    ko: {
      variants: ["폭락장 생존자", "방어형 리밸런서", "계좌 안전벨트 담당자", "손실 회피 장인"],
      quotes: [
        "수익률보다 생존율을 먼저 봅니다.",
        "오늘 밤도 편하게 잡니다.",
        "친구들이 수익 인증할 때도 현금흐름을 봅니다.",
        "폭락장 뉴스에도 심박수가 비교적 안정적입니다.",
      ],
    },
    en: {
      variants: ["Crash survivor", "Defensive allocator", "Seatbelt manager", "Loss-avoidance specialist"],
      quotes: [
        "Survival odds come before bragging rights.",
        "Sleep remains part of the strategy.",
        "Cash flow gets attention even when friends post gains.",
        "Market crashes do not fully hijack the heart rate.",
      ],
    },
  },
  cash: {
    ko: {
      variants: ["현금 사냥꾼", "매수 타이밍 대기자", "아직 안 산 사람", "드라이파우더 수집가"],
      quotes: [
        "아직 안 샀습니다. 더 내려오세요.",
        "기회는 좋아하지만 지금 가격은 조금 시끄럽습니다.",
        "현금도 포지션이라는 말을 꽤 믿습니다.",
        "매수 버튼보다 대기 버튼이 익숙합니다.",
      ],
    },
    en: {
      variants: ["Cash hunter", "Dry-powder watcher", "Still-not-buying investor", "Optionality collector"],
      quotes: [
        "Not buying yet. Lower prices can talk.",
        "Opportunity is welcome, but current prices are loud.",
        "Cash as a position is very much alive here.",
        "The wait button feels familiar.",
      ],
    },
  },
  space: {
    ko: {
      variants: ["우주 개척자", "궤도 진입 투자자", "발사 일정 추적자", "지구 밖 성장주 수집가"],
      quotes: [
        "포트폴리오가 궤도에 있습니다.",
        "지구에 투자할 회사가 부족했습니다.",
        "발사 일정이 경제지표입니다.",
        "손익분기점보다 궤도 진입이 먼저입니다.",
        "로켓이 뜨면 계좌도 뜬다고 믿습니다.",
      ],
    },
    en: {
      variants: ["Space explorer", "Orbital allocator", "Launch-calendar watcher", "Off-planet growth collector"],
      quotes: [
        "This portfolio is already in orbit.",
        "Earth did not have enough investable companies.",
        "Launch dates have become economic indicators.",
        "Orbit arrives before break-even.",
        "If the rocket lifts, the account might try to follow.",
      ],
    },
  },
  gold: {
    ko: {
      variants: ["금본위제 신봉자", "중앙은행 불신자", "노란 금속 수호자"],
      quotes: [
        "화폐는 종이지만 금은 금입니다.",
        "인플레이션 뉴스에 금고부터 떠올립니다.",
        "중앙은행보다 원소기호를 믿습니다.",
      ],
    },
    en: {
      variants: ["Gold-standard believer", "Central-bank skeptic", "Yellow-metal defender"],
      quotes: [
        "Paper is paper. Gold is gold.",
        "Inflation headlines point straight to the vault.",
        "The periodic table feels safer than policy meetings.",
      ],
    },
  },
  rates: {
    ko: {
      variants: ["파월 관찰자", "금리 민감러", "장기채 심리전 참가자"],
      quotes: [
        "0.25%p 한마디에도 포트폴리오가 반응합니다.",
        "금리 점도표를 날씨 앱처럼 봅니다.",
        "채권 듀레이션과 멘탈 듀레이션이 같이 깁니다.",
      ],
    },
    en: {
      variants: ["Fed watcher", "Rate-sensitive allocator", "Duration mind-gamer"],
      quotes: [
        "A quarter-point can change the mood.",
        "The dot plot gets weather-app treatment.",
        "Portfolio duration and emotional duration are both long.",
      ],
    },
  },
};
